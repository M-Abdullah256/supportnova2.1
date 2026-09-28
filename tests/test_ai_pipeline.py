import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import ai_pipeline
from google.genai.errors import APIError
from fastapi.testclient import TestClient

from main import app


VALID_MODEL_OUTPUT = {
    "primaryIssue": "The device stopped working",
    "secondaryIssues": [],
    "category": "Hardware & Devices",
    "subcategory": "Device malfunction",
    "sentiment": "Frustrated",
    "urgency": "Medium",
    "priority": "P2",
    "entities": {"orderId": "", "amount": "", "date": "", "deviceModel": "", "serialNumber": "", "customerEmail": "", "trackingNumber": ""},
    "summary": "The customer reports a device malfunction.",
    "recommendedDepartment": "Hardware Engineering",
    "secondaryDepartments": [],
    "citedPolicies": [],
    "resolutionSteps": ["Review the device report"],
    "escalationRequired": False,
    "escalationTier": "None",
    "escalationReason": "",
    "draftedResponse": "We have received your report and will review the device issue.",
    "responseTone": "Empathetic",
    "followUpRequired": False,
    "followUpReason": "",
    "followUpCommunication": "",
    "internalAgentGuidance": "Inspect the device report before resolving.",
    "clarificationQuestions": [],
    "adversarialAnalysis": {
        "isAdversarial": False,
        "threatType": "None",
        "threatDetails": "",
        "recommendedAction": "Proceed with standard triage.",
    },
}


class TestGenAIPipeline(unittest.TestCase):
    def test_success_uses_genai_client_and_validates_model_output(self):
        with (
            patch.dict(os.environ, {"GEMINI_API_KEY": "test-key", "GENAI_FALLBACK_MODEL_IDS": ""}),
            patch("ai_pipeline._generate_content", return_value=json.dumps(VALID_MODEL_OUTPUT)) as generate,
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [], "test system prompt")

        self.assertEqual(result["pipelineStatus"], "COMPLETED")
        self.assertEqual(result["modelUsed"], "gemini-3.5-flash")
        self.assertFalse(result["fallbackUsed"])
        self.assertEqual(result["attemptsPerModel"], {"gemini-3.5-flash": 1})
        self.assertEqual(result["modelRequested"], "gemini-3.5-flash")
        self.assertEqual(result["modelVersion"], "3.5-flash-05-2026")
        self.assertEqual(result["draftedResponse"], VALID_MODEL_OUTPUT["draftedResponse"])
        self.assertEqual(generate.call_args.args[2], "gemini-3.5-flash")

    def test_missing_key_returns_failure_without_canned_output(self):
        with patch.dict(os.environ, {}, clear=True):
            result = ai_pipeline.run_ai_pipeline({"title": "Double charge"}, [])

        self.assertEqual(result["pipelineStatus"], "GENAI_UNAVAILABLE")
        self.assertEqual(result["errorCode"], "GENAI_API_KEY_MISSING")
        self.assertEqual(result["attempts"], 0)
        self.assertIsNone(result["modelUsed"])
        self.assertNotIn("draftedResponse", result)
        self.assertNotIn("category", result)

    def test_invalid_response_fails_without_retry(self):
        with (
            patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}),
            patch("ai_pipeline._generate_content", return_value='{"category":"Billing & Payments"}') as generate,
            patch("ai_pipeline.time.sleep") as sleep,
            patch.dict(os.environ, {"GENAI_FALLBACK_MODEL_IDS": ""}),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Billing issue"}, [])

        self.assertEqual(result["pipelineStatus"], "GENAI_UNAVAILABLE")
        self.assertEqual(result["errorCode"], "GENAI_INVALID_RESPONSE")
        self.assertEqual(result["attempts"], 1)
        self.assertEqual(generate.call_count, 1)
        sleep.assert_not_called()
        self.assertNotIn("draftedResponse", result)

    def test_retries_network_failure_then_gives_up(self):
        with (
            patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}),
            patch("ai_pipeline._generate_content", side_effect=TimeoutError("request timed out")) as generate,
            patch("ai_pipeline.time.sleep"),
            patch.dict(os.environ, {"GENAI_FALLBACK_MODEL_IDS": ""}),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

        self.assertEqual(result["pipelineStatus"], "GENAI_UNAVAILABLE")
        self.assertEqual(result["errorCode"], "GENAI_TIMEOUT")
        self.assertIn("timed out", result["error"])
        self.assertEqual(result["attempts"], 4)
        self.assertEqual(generate.call_count, 4)

    def test_503_then_success_retries_same_model(self):
        sdk_client = Mock()
        sdk_client.models.generate_content.side_effect = [
            APIError(503, {"message": "overloaded"}),
            SimpleNamespace(text=json.dumps(VALID_MODEL_OUTPUT)),
        ]
        with (
            patch.dict(os.environ, {"GEMINI_API_KEY": "test-key", "GENAI_FALLBACK_MODEL_IDS": ""}),
            patch("google.genai.Client", return_value=sdk_client),
            patch("ai_pipeline.time.sleep"),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

        self.assertEqual(result["pipelineStatus"], "COMPLETED")
        self.assertEqual(result["modelUsed"], "gemini-3.5-flash")
        self.assertFalse(result["fallbackUsed"])
        self.assertEqual(result["attemptsPerModel"], {"gemini-3.5-flash": 2})
        self.assertEqual(
            [item.kwargs["model"] for item in sdk_client.models.generate_content.call_args_list],
            ["gemini-3.5-flash"] * 2,
        )
        self.assertEqual(
            sdk_client.models.generate_content.call_args.kwargs["config"]["temperature"],
            0.1,
        )

    def test_429_then_success_retries_same_model(self):
        sdk_client = Mock()
        sdk_client.models.generate_content.side_effect = [
            APIError(429, {"message": "rate limited"}),
            SimpleNamespace(text=json.dumps(VALID_MODEL_OUTPUT)),
        ]
        with (
            patch.dict(os.environ, {"GEMINI_API_KEY": "test-key", "GENAI_FALLBACK_MODEL_IDS": ""}),
            patch("google.genai.Client", return_value=sdk_client),
            patch("ai_pipeline.time.sleep"),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

        self.assertEqual(result["pipelineStatus"], "COMPLETED")
        self.assertEqual(result["modelUsed"], "gemini-3.5-flash")
        self.assertEqual(result["attemptsPerModel"], {"gemini-3.5-flash": 2})

    def test_503_exhaustion_uses_verified_fallback(self):
        sdk_client = Mock()
        sdk_client.models.generate_content.side_effect = [
            *[APIError(503, {"message": "overloaded"}) for _ in range(4)],
            SimpleNamespace(text=json.dumps(VALID_MODEL_OUTPUT)),
        ]
        with (
            patch.dict(os.environ, {
                "GEMINI_API_KEY": "test-key",
                "GENAI_MODEL_ID": "gemini-3.5-flash",
                "GENAI_FALLBACK_MODEL_IDS": "gemini-3.5-flash-lite",
            }),
            patch("google.genai.Client", return_value=sdk_client),
            patch("ai_pipeline.time.sleep"),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

        self.assertEqual(result["pipelineStatus"], "COMPLETED")
        self.assertEqual(result["modelUsed"], "gemini-3.5-flash-lite")
        self.assertTrue(result["fallbackUsed"])
        self.assertEqual(
            result["attemptsPerModel"],
            {"gemini-3.5-flash": 4, "gemini-3.5-flash-lite": 1},
        )
        self.assertEqual(
            [item.kwargs["model"] for item in sdk_client.models.generate_content.call_args_list],
            ["gemini-3.5-flash"] * 4 + ["gemini-3.5-flash-lite"],
        )

    def test_404_fails_immediately_without_retry(self):
        for status, code in (
            (400, "GENAI_INVALID_ARGUMENT"),
            (401, "GENAI_UNAUTHENTICATED"),
            (403, "GENAI_PERMISSION_DENIED"),
            (404, "GENAI_MODEL_NOT_FOUND"),
        ):
            with self.subTest(status=status):
                sdk_client = Mock()
                sdk_client.models.generate_content.side_effect = APIError(
                    status, {"message": "non-retryable"}
                )
                with (
                    patch.dict(os.environ, {
                        "GEMINI_API_KEY": "test-key",
                        "GENAI_MODEL_ID": "gemini-3.5-flash",
                        "GENAI_FALLBACK_MODEL_IDS": "gemini-3.5-flash-lite",
                    }),
                    patch("google.genai.Client", return_value=sdk_client),
                    patch("ai_pipeline.time.sleep") as sleep,
                ):
                    result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

                self.assertEqual(result["pipelineStatus"], "GENAI_UNAVAILABLE")
                self.assertEqual(result["errorCode"], code)
                self.assertEqual(result["attempts"], 1)
                self.assertEqual(sdk_client.models.generate_content.call_count, 1)
                sleep.assert_not_called()

    def test_all_models_fail_without_fabricated_output(self):
        sdk_client = Mock()
        sdk_client.models.generate_content.side_effect = [
            APIError(503, {"message": "overloaded"}) for _ in range(8)
        ]
        with (
            patch.dict(os.environ, {
                "GEMINI_API_KEY": "test-key",
                "GENAI_MODEL_ID": "gemini-3.5-flash",
                "GENAI_FALLBACK_MODEL_IDS": "gemini-3.5-flash-lite",
            }),
            patch("google.genai.Client", return_value=sdk_client),
            patch("ai_pipeline.time.sleep"),
        ):
            result = ai_pipeline.run_ai_pipeline({"title": "Device issue"}, [])

        self.assertEqual(result["pipelineStatus"], "GENAI_UNAVAILABLE")
        self.assertEqual(result["errorCode"], "GENAI_OVERLOADED")
        self.assertEqual(result["attempts"], 8)
        self.assertEqual(
            result["attemptsPerModel"],
            {"gemini-3.5-flash": 4, "gemini-3.5-flash-lite": 4},
        )
        self.assertEqual(sdk_client.models.generate_content.call_count, 8)
        self.assertIsNone(result["modelUsed"])
        self.assertTrue(result["fallbackUsed"])
        self.assertNotIn("category", result)
        self.assertNotIn("draftedResponse", result)

    def test_genai_precheck_is_admin_only_and_manual(self):
        with TestClient(app) as client:
            customer_login = client.post("/api/auth/login", json={"role": "Customer"})
            customer_headers = {
                "Authorization": f"Bearer {customer_login.json()['token']}"
            }
            with patch(
                "main.check_genai_connectivity",
                return_value={
                    "reachable": True,
                    "model": "gemini-3.5-flash",
                    "latency_ms": 10,
                    "status_code": 200,
                },
            ) as precheck:
                self.assertEqual(
                    client.get("/api/health/genai", headers=customer_headers).status_code,
                    403,
                )
                precheck.assert_not_called()
                admin_login = client.post("/api/auth/login", json={"role": "Administrator"})
                response = client.get(
                    "/api/health/genai",
                    headers={"Authorization": f"Bearer {admin_login.json()['token']}"},
                )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status_code"], 200)
        precheck.assert_called_once_with()

    def test_offline_preview_is_unambiguously_marked_as_simulated(self):
        result = ai_pipeline._offline_demo_preview({"title": "Double charge"}, [])

        self.assertEqual(result["pipelineStatus"], "OFFLINE_DEMO_MODE_NOT_GENAI")
        self.assertEqual(result["modelUsed"], "OFFLINE_DEMO_MODE_NOT_GENAI")
        self.assertTrue(result["isSimulatedOutput"])
        self.assertNotEqual(result["modelUsed"], "gemini-3.5-flash")

    def test_api_failure_is_saved_for_manual_review_without_comparison(self):
        client = TestClient(app)
        client.__enter__()
        self.addCleanup(client.__exit__, None, None, None)
        login = client.post("/api/auth/login", json={"role": "Agent"})
        headers = {"Authorization": f"Bearer {login.json()['token']}"}
        failure = {
            "pipelineStatus": "GENAI_UNAVAILABLE",
            "errorCode": "GENAI_REQUEST_FAILED",
            "error": "Network unavailable",
            "attempts": 3,
            "modelUsed": None,
            "modelRequested": "gemini-3.5-flash",
        }
        body = {
            "title": "Device stopped working",
            "description": "The device stopped working after normal use.",
            "productService": "Home device",
        }

        with (
            patch("main.run_ai_pipeline", return_value=failure),
            patch("main.run_rule_validation") as rule,
            patch("main.crosscheck_complaint_and_ai") as validate,
            patch("main.compare_outputs") as compare,
        ):
            response = client.post("/api/complaints", json=body, headers=headers)

        complaint = response.json()["complaint"]
        self.assertEqual(response.status_code, 201)
        self.assertEqual(complaint["status"], "Analyzed")
        self.assertEqual(complaint["pipeline1Output"]["pipelineStatus"], "GENAI_UNAVAILABLE")
        self.assertIsNone(complaint["pipeline2Output"])
        self.assertIsNone(complaint["pythonValidation"])
        self.assertIsNone(complaint["comparisonResult"])
        rule.assert_not_called()
        validate.assert_not_called()
        compare.assert_not_called()
        manual_review = client.get(
            "/api/complaints", params={"verificationStatus": "Manual Review"}, headers=headers
        ).json()["complaints"]
        self.assertIn(complaint["id"], {item["id"] for item in manual_review})
        self.assertEqual(client.get("/api/analytics").status_code, 200)
        self.assertEqual(client.get("/api/reports/validation").status_code, 200)


if __name__ == "__main__":
    unittest.main()
