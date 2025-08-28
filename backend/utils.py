import json, regex as re
from difflib import SequenceMatcher


def balanced_json_extract(text: str):
start = text.find("{")
if start == -1:
return None
depth = 0
for i in range(start, len(text)):
if text[i] == "{":
depth += 1
elif text[i] == "}":
depth -= 1
if depth == 0:
candidate = text[start:i+1]
try:
return json.loads(candidate)
except Exception:
fixed = candidate.replace("'", '"')
fixed = re.sub(r",\s*}", "}", fixed)
fixed = re.sub(r",\s*]", "]", fixed)
try:
return json.loads(fixed)
except Exception:
return None
return None


def similarity_ratio(a: str, b: str) -> float:
return SequenceMatcher(None, a, b).ratio()