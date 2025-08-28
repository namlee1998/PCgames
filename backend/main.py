from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
import whisper
import tempfile, os, random

app = FastAPI(title="Mini Games API")

# --- Static (Next.js build) ---
STATIC_DIR = os.getenv("STATIC_DIR", "/app/static")
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

# --- Load Whisper model ---
WHISPER_SIZE = os.getenv("WHISPER_SIZE", "small")
try:
    asr_model = whisper.load_model(WHISPER_SIZE)
except Exception as e:
    print("Warning: failed to load Whisper model:", e)
    asr_model = None


# --------------------------------------------------
# 1. Listening
# --------------------------------------------------
LISTENING_BANK = [
    {"id": "l1", "answer": "Hello, how are you today?"},
    {"id": "l2", "answer": "The weather is nice outside."},
]

@app.post("/api/speech")
async def speech_to_text(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "Missing file")
    suffix = os.path.splitext(file.filename)[1].lower()
    data = await file.read()
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    if asr_model is None:
        os.unlink(tmp_path)
        raise HTTPException(503, "ASR model not loaded")

    try:
        res = asr_model.transcribe(tmp_path, language='en')
        text = res.get('text', '').strip()
    except Exception as e:
        os.unlink(tmp_path)
        raise HTTPException(500, f"ASR failed: {e}")
    os.unlink(tmp_path)

    # simple scoring: compare with bank[0]
    correct = LISTENING_BANK[0]["answer"]
    match = sum(1 for w in text.lower().split() if w in correct.lower().split())
    total = len(correct.split())
    score = int((match / total) * 10) if total else 1
    score = max(1, min(10, score))

    return {"text": text, "score": score, "feedback": f"Expected: '{correct}'"}


# --------------------------------------------------
# 2. Reading
# --------------------------------------------------
READING_BANK = [
    {
        "para": "The sun rises in the east and sets in the west.",
        "question": "Where does the sun rise?",
        "choices": ["North", "South", "East", "West"],
        "answer": "East"
    }
]

@app.get("/api/reading")
def get_reading():
    q = random.choice(READING_BANK)
    return {"para": q["para"], "question": q["question"], "choices": q["choices"]}

@app.post("/api/reading/submit")
async def submit_reading(payload: dict):
    question = payload.get("question")
    answer = payload.get("answer")
    for q in READING_BANK:
        if q["question"] == question:
            if answer == q["answer"]:
                return {"score": 10, "feedback": "Correct!"}
            return {"score": 1, "feedback": f"Wrong. Correct answer is {q['answer']}"}
    raise HTTPException(404, "Question not found")


# --------------------------------------------------
# 3. Writing
# --------------------------------------------------
WRITING_BANK = [
    {"id": "w1", "question": "Write about your favorite hobby."},
]

@app.get("/api/writing")
def get_writing():
    return random.choice(WRITING_BANK)

@app.post("/api/submitWriting")
async def submit_writing(payload: dict):
    answer = payload.get("answer", "")
    if not answer.strip():
        raise HTTPException(400, "Empty answer")

    length = len(answer.split())
    score = min(10, max(1, length // 5))  # 5 words ≈ 1 point
    feedback = f"You wrote {length} words. Try to expand more!" if score < 7 else "Good job!"
    return {"score": score, "feedback": feedback}


# --------------------------------------------------
# 4. Speaking
# --------------------------------------------------
@app.post("/api/speaking")
async def speaking(payload: dict):
    msg = payload.get("message", "").strip()
    if not msg:
        raise HTTPException(400, "Empty message")

    # simple: longer msg = better
    score = min(10, max(1, len(msg.split()) // 3))
    feedback = "Nice and detailed!" if score > 6 else "Try to say more."
    reply = f"I heard: {msg}"
    return {"reply": reply, "score": score, "feedback": feedback}


# --------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}
