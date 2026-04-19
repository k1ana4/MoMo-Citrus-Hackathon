from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.prescan import prescan_code
from app.services.claude_analyzer import analyze_with_claude
import json
import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

router = APIRouter()

class AnalyzeRequest(BaseModel):
    code: str
    language: str

class QuizRequest(BaseModel):
    leaks: list
    code: str

@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if len(req.code) > 50_000:
        raise HTTPException(400, "Code too long (max 50KB)")
    if req.language not in ["cpp", "python", "c"]:
        raise HTTPException(400, "Language not supported yet")
    hints = prescan_code(req.code, req.language)
    result = await analyze_with_claude(req.code, req.language, hints)
    return result

@router.post("/quiz")
async def generate_quiz(req: QuizRequest):
    prompt = f"""You are MoMo, a memory leak tutor. Based on these memory leaks found in the code, generate exactly 3 multiple choice questions to test the student's understanding.

Code:
{req.code}

Leaks found:
{json.dumps(req.leaks, indent=2)}

Respond with ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "question text here",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "why this answer is correct"
    }}
  ]
}}

Make questions educational and specific to the actual leaks found. correct is the 0-based index of the correct option."""

    message = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)
    return result