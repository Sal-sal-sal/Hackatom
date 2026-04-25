"""HeadHunter provider — maps api.hh.ru/vacancies items to ExternalCandidate."""
import re
import httpx

from app.config import settings
from .base import ExternalCandidate

HH_BASE = "https://api.hh.ru"
_TAG_RE = re.compile(r"<[^>]+>")


def _name(obj: dict | None) -> str | None:
    return obj.get("name") if isinstance(obj, dict) else None


def _format_salary(s: dict | None) -> str | None:
    if not s:
        return None
    parts = []
    if s.get("from"):
        parts.append(f"от {s['from']}")
    if s.get("to"):
        parts.append(f"до {s['to']}")
    cur = s.get("currency", "")
    return (" ".join(parts) + (f" {cur}" if cur else "")) if parts else None


def _skills_from_snippet(snippet: dict) -> list[str]:
    text = " ".join(filter(None, [snippet.get("requirement"), snippet.get("responsibility")]))
    text = _TAG_RE.sub(" ", text)
    return [w.strip(".,;:()[]") for w in re.findall(r"[A-Za-zА-Яа-я0-9_+\-]{3,}", text)][:15]


class HHProvider:
    """Adapter over public HH search. Maps vacancies to candidate-like records."""

    def __init__(self, area: int | None = None, user_agent: str | None = None):
        self.area = area or settings.hh_default_area
        self.user_agent = user_agent or settings.hh_user_agent

    async def search(self, keywords: list[str], limit: int = 10) -> list[ExternalCandidate]:
        query = " ".join(k for k in keywords if k)
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{HH_BASE}/vacancies",
                params={"text": query, "area": self.area, "per_page": limit},
                headers={"User-Agent": self.user_agent},
            )
            resp.raise_for_status()
            data = resp.json()

        out: list[ExternalCandidate] = []
        for item in data.get("items", []):
            employer = (item.get("employer") or {}).get("name") or "—"
            snippet = item.get("snippet") or {}
            out.append(ExternalCandidate(
                full_name=employer,
                position=item.get("name", ""),
                skills=_skills_from_snippet(snippet),
                url=item.get("alternate_url"),
                employer=employer,
                location=(item.get("area") or {}).get("name"),
                salary=_format_salary(item.get("salary")),
                source_id=str(item.get("id", "")),
            ))
        return out
