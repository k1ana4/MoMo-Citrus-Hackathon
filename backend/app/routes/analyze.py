from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.prescan import prescan_code
from app.services.claude_analyzer import analyze_with_claude

router = APIRouter()

class AnalyzeRequest(BaseModel):
    code: str
    language: str  # "cpp" or "python"

@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if len(req.code) > 50_000:
        raise HTTPException(400, "Code too long (max 50KB)")
    if req.language not in ["cpp", "python", "c"]:
        raise HTTPException(400, "Language not supported yet")

    # Step 1: Pre-scan (fast, free, catches obvious patterns)
    hints = prescan_code(req.code, req.language)

    # Step 2: Send to Claude for deep analysis
    result = await analyze_with_claude(req.code, req.language, hints)

    return result