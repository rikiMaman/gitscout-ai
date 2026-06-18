import os
import re
import json
import asyncio
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from anthropic import Anthropic
from partialjson import JSONParser

from exceptions import InvalidUsernameError
from services.github_service import fetch_github_user_repos, fetch_repo_readme_and_languages

router = APIRouter(prefix="/api/review", tags=["review"])

_GITHUB_USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$")

try:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    anthropic_client = Anthropic(api_key=api_key) if api_key else None
except Exception as e:
    print(f"Anthropic initialization warning: {e}")
    anthropic_client = None

def _validate_username(username: str) -> str:
    normalized = username.strip()
    if not normalized:
        raise InvalidUsernameError("Username cannot be empty.")
    if not _GITHUB_USERNAME_PATTERN.fullmatch(normalized):
        raise InvalidUsernameError("Username contains invalid characters.")
    return normalized

@router.get("/{username}")
async def get_user_review_stream(username: str):
    validated_username = _validate_username(username)
    
    # 1. שליפת כל המאגרים (Async)
    raw_repos = await fetch_github_user_repos(validated_username)

    if not raw_repos:
        return {"status": "success", "username": validated_username, "repositories": []}

    # הגנת אסימונים חכמה
    if len(raw_repos) > 35:
        raw_repos = raw_repos[:35]

    if not anthropic_client:
        raise HTTPException(status_code=500, detail="AI Orchestration layer uninitialized.")

    # 2. 🔥 הקסם קורה פה: שליפת מידע לכל המאגרים במקביל בבת אחת!
    enriched_repos = []
    async with httpx.AsyncClient(timeout=5.0) as client:
        # יוצרים רשימת משימות (Tasks) עבור כל המאגרים
        tasks = [
            fetch_repo_readme_and_languages(client, validated_username, repo["name"])
            for repo in raw_repos
        ]
        # מריצים את כל עשרות הבקשות לגיטהאב במקביל!
        meta_results = await asyncio.gather(*tasks)

        # בניית המערך המועשר עבור Claude
        for repo, meta in zip(raw_repos, meta_results):
            if not meta["has_code"] and meta["readme_snippet"].startswith("No README"):
                assessment_hint = "Empty repository. Contains no code files and no documentation."
            elif not meta["has_code"]:
                assessment_hint = "Documentation-only repository or configuration scaffold. No active source code languages detected."
            else:
                assessment_hint = f"Contains active code in: {', '.join(meta['languages'])}."

            enriched_repos.append({
                "name": repo["name"],
                "description": repo["description"],
                "readme_snippet": meta["readme_snippet"],
                "system_hint": assessment_hint
            })

    # 3. מנגנון הסטרימינג מול Claude
    def generate_stream():
        parser = JSONParser()
        full_text = ""
        
        with anthropic_client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=4000,
            temperature=0.2,
            system="You are an elite enterprise software architect conducting a performance and architecture review of GitHub repositories. "
                   "Analyze the repository name, description, README snippet, and system hints. "
                   "Categorize complexity strictly as 'Basic', 'Intermediate', or 'Advanced'. "
                   "If the system hints indicate a repository is empty or has no code, classify it appropriately (usually Basic) and explicitly note it in the assessment. "
                   "CRITICAL: Respond ONLY with a valid JSON object matching this exact schema: "
                   '{"repositories": [{"repo_name": "string", "level": "Basic/Intermediate/Advanced", "assessment": "string"}]}',
            messages=[{"role": "user", "content": f"Analyze these repositories: {enriched_repos}"}]
        ) as stream:
            for text in stream.text_stream:
                full_text += text
                clean_text = full_text.replace("```json", "").replace("```", "").strip()
                try:
                    parsed_json = parser.parse(clean_text) if clean_text else {}
                    yield f"data: {json.dumps(parsed_json)}\n\n"
                except Exception:
                    continue

    return StreamingResponse(generate_stream(), media_type="text/event-stream")