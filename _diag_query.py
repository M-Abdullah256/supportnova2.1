import sqlite3, json

conn = sqlite3.connect('supportnova.db')
cursor = conn.execute('SELECT id, payload FROM complaint ORDER BY ROWID DESC LIMIT 10')
found = False
for row in cursor:
    data = json.loads(row[1]) if isinstance(row[1], str) else row[1]
    p1 = data.get('pipeline1Output', {})
    status = p1.get('pipelineStatus')
    if status == 'GENAI_UNAVAILABLE':
        print(f'COMPLAINT: {row[0]}')
        print(f'  submittedAt: {data.get("submittedAt")}')
        print(f'  pipelineStatus: {status}')
        print(f'  errorCode: {p1.get("errorCode")}')
        print(f'  error: {p1.get("error")}')
        print(f'  attempts: {p1.get("attempts")}')
        print(f'  modelRequested: {p1.get("modelRequested")}')
        print(f'  generatedAt: {p1.get("generatedAt")}')
        found = True
        break

if not found:
    print("No GENAI_UNAVAILABLE found. Recent statuses:")
    cursor2 = conn.execute('SELECT id, payload FROM complaint ORDER BY ROWID DESC LIMIT 5')
    for row2 in cursor2:
        data2 = json.loads(row2[1]) if isinstance(row2[1], str) else row2[1]
        p12 = data2.get('pipeline1Output', {})
        print(f'  {row2[0]}: pipelineStatus={p12.get("pipelineStatus")}, errorCode={p12.get("errorCode")}')
conn.close()
