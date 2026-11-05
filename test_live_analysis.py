import json
import urllib.request
import uuid

url = "http://127.0.0.1:8000/api/analysis"
boundary = uuid.uuid4().hex

with open("test_resume_alex_chen.pdf", "rb") as f:
    pdf_bytes = f.read()

parts = []
# file part
parts.append(f"--{boundary}".encode())
parts.append(b'Content-Disposition: form-data; name="file"; filename="test_resume_alex_chen.pdf"')
parts.append(b"Content-Type: application/pdf")
parts.append(b"")
parts.append(pdf_bytes)

# job_role_id part
parts.append(f"--{boundary}".encode())
parts.append(b'Content-Disposition: form-data; name="job_role_id"')
parts.append(b"")
parts.append(b"6")  # Python Developer

parts.append(f"--{boundary}--".encode())
parts.append(b"")

body = b"\r\n".join(parts)

req = urllib.request.Request(url, data=body, method="POST")
req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
req.add_header("Authorization", "Bearer guest-preview-token")

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("=== LIVE ANALYSIS SUCCESS ===")
        print(f"Analysis ID: {data.get('id')}")
        print(f"Role: {data.get('job_role_title')}")
        print(f"Match Score: {data.get('match_score')}%")
        print("\nScoring Summary:")
        summary_obj = data.get("summary") or data.get("scoring_summary")
        print(json.dumps(summary_obj, indent=2))
        print("\nSkill Evidence Breakdown:")
        evidence_items = data.get("evidence") or data.get("evidence_breakdown") or []
        for ev in evidence_items:
            passage = ev.get("evidence_text") or ev.get("supporting_passage") or "None"
            print(f"- {ev['skill_name']} [{ev['evidence_level'].upper()}]:")
            print(f"  Passage: {passage.strip() if passage else 'None'}")
            print(f"  Explanation: {ev['explanation']}")

        # Now test retrieving by ID
        analysis_id = data.get("id")
        get_req = urllib.request.Request(f"{url}/{analysis_id}", method="GET")
        get_req.add_header("Authorization", "Bearer guest-preview-token")
        with urllib.request.urlopen(get_req) as get_resp:
            get_data = json.loads(get_resp.read().decode())
            print(f"\nSuccessfully retrieved saved analysis by ID: {get_data.get('id')}")

        # Now test user history
        hist_req = urllib.request.Request("http://127.0.0.1:8000/api/analysis/user/history", method="GET")
        hist_req.add_header("Authorization", "Bearer guest-preview-token")
        with urllib.request.urlopen(hist_req) as hist_resp:
            hist_data = json.loads(hist_resp.read().decode())
            print(f"\nUser analysis history records count: {len(hist_data)}")
            for item in hist_data:
                filename = item.get('filename') or 'resume.pdf'
                print(f"  - {item['job_role_title']}: {item['match_score']}% ({filename}) on {item['created_at']}")

except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code, e.read().decode())
except Exception as e:
    print("ERROR:", e)
