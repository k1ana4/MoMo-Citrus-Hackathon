from dotenv import load_dotenv
import os
load_dotenv()

import os
import json
from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are MoMo, a friendly memory-leak tutor for students learning C, C++, and Python.

Your job: analyze code for memory leaks and memory safety issues, then explain them simply.

You MUST respond with valid JSON only, matching this exact schema:

{
  "hasLeaks": boolean,
  "summary": "One-sentence overall assessment",
  "leaks": [
    {
      "line": number,
      "endLine": number,
      "severity": "high" | "medium" | "low",
      "type": "memory_leak" | "dangling_pointer" | "double_free" | "circular_ref" | "resource_leak" | "use_after_free",
      "variable": "name of variable",
      "estimatedBytes": number,
      "title": "Short title of the issue",
      "explanation": "2-3 sentence friendly explanation for a student",
      "story": "A fun narrative about the variable"
    }
  ],
  "fix": {
    "explanation": "How to fix all issues in plain English",
    "fixedCode": "The complete corrected code",
    "diffHighlights": [{"line": number, "change": "added" | "removed" | "modified", "note": "what changed"}]
  },
  "prevention": {
    "tip": "One memorable tip to prevent this in the future",
    "concept": "Name of the CS concept at play",
    "conceptExplanation": "2-sentence explanation of the concept"
  },
  "memoryTimeline": [
    {"step": "After line X", "allocated": number, "freed": number, "leaked": number}
  ],
  "score": number
}

Score rules: 100 = perfect, subtract 20 per high severity leak, 10 per medium, 5 per low.
Be encouraging — students are learning!"""


async def analyze_with_claude(code: str, language: str, hints: dict) -> dict:
    user_prompt = f"""Analyze this {language.upper()} code for memory leaks.

Pre-scan found these suspicious lines:
{json.dumps(hints, indent=2)}

Code to analyze:
```{language}
{code}
```
Return ONLY the JSON object — no markdown, no commentary."""

    try:
        message = await client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )

        raw = message.content[0].text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)
        return result

    except json.JSONDecodeError as e:
        return {
            "hasLeaks": False,
            "summary": f"Could not parse analysis response: {e}",
            "leaks": [],
            "fix": {"explanation": "", "fixedCode": code, "diffHighlights": []},
            "prevention": {"tip": "", "concept": "", "conceptExplanation": ""},
            "memoryTimeline": [],
            "score": 0,
        }
    except Exception as e:
        return {
            "hasLeaks": False,
            "summary": f"Analysis failed: {str(e)}",
            "leaks": [],
            "fix": {"explanation": "", "fixedCode": code, "diffHighlights": []},
            "prevention": {"tip": "", "concept": "", "conceptExplanation": ""},
            "memoryTimeline": [],
            "score": 0,
        }