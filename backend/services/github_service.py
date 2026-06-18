import asyncio
import httpx
from fastapi import HTTPException
import os

_GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "GitScoutAI",
}

def _get_auth_headers() -> dict:
    """Helper to generate headers with the GitHub Token if available."""
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "GitScout-AI-Agent"
    }
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"
    return headers

async def fetch_github_user_repos(username: str) -> list[dict]:
    """
    Fetches all public repositories including pagination and profile errors asynchronously.
    Leverages a GitHub Token from environment variables to bypass rate limits (403).
    """
    all_repos = []
    page = 1
    per_page = 100
    
    headers = _get_auth_headers()
    
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        while True:
            try:
                url = f"https://api.github.com/users/{username}/repos?page={page}&per_page={per_page}"
                response = await client.get(url, headers=headers)
                
            except (httpx.RequestError, OSError) as exc:
                raise HTTPException(status_code=502, detail="GitHub API is unreachable. Please try again later.") from exc

            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Please check your GITHUB_TOKEN.")
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub profile '{username}' does not exist.")

            response.raise_for_status()
            repos = response.json()

            if not repos:
                break
                
            for repo in repos:
                all_repos.append(repo)
                
            page += 1
        
    return all_repos

async def fetch_repo_readme_and_languages(client: httpx.AsyncClient, username: str, repo_name: str) -> dict:
    """Fetches README snippet and programming languages concurrently for a single repo with authorization."""
    result = {
        "readme_snippet": "No README file available for this repository.",
        "has_code": False,
        "languages": []
    }
    
    readme_url = f"https://api.github.com/repos/{username}/{repo_name}/contents/README.md"
    lang_url = f"https://api.github.com/repos/{username}/{repo_name}/languages"
    
    # 🔥 התיקון הקריטי: יצירת כותרות עם ה-Token של GitHub גם עבור בדיקת הקבצים והשפות!
    base_headers = _get_auth_headers()
    raw_headers = {**base_headers, "Accept": "application/vnd.github.v3.raw"}

    try:
        readme_task = client.get(readme_url, headers=raw_headers)
        lang_task = client.get(lang_url, headers=base_headers)
        
        readme_res, lang_res = await asyncio.gather(readme_task, lang_task, return_exceptions=True)
        
        # עיבוד תוצאת README
        if not isinstance(readme_res, Exception) and readme_res.status_code == 200:
            result["readme_snippet"] = readme_res.text[:600]
            
        # עיבוד תוצאת שפות
        if not isinstance(lang_res, Exception) and lang_res.status_code == 200:
            languages = lang_res.json()
            if languages:
                result["has_code"] = True
                result["languages"] = list(languages.keys())
    except Exception:
        pass

    return result