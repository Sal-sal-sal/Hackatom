from typing import Protocol
from pydantic import BaseModel


class ExternalCandidate(BaseModel):
    full_name: str
    position: str
    skills: list[str] = []
    past_projects: list[str] = []
    experience_years: int = 0
    url: str | None = None
    employer: str | None = None
    location: str | None = None
    salary: str | None = None
    source_id: str | None = None
    telegram: str | None = None


class CandidateProvider(Protocol):
    async def search(self, keywords: list[str], limit: int = 10) -> list[ExternalCandidate]: ...
