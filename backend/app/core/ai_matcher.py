"""Lightweight similarity scoring between candidate profile and vacancy requirements."""
from typing import Iterable

NUCLEAR_KEYWORDS = ("nuclear", "npp", "аэс", "atom", "reactor", "construction", "строительств")


def _normalize(items: Iterable[str]) -> set[str]:
    return {str(i).strip().lower() for i in items if i}


def similarity_score(profile: dict, requirements: dict) -> int:
    """Return 0..100 match score.

    profile: {"skills": [...], "past_projects": [...], "experience_years": int}
    requirements: {"required_skills": [...], "min_experience": int (optional)}
    """
    profile_skills = _normalize(profile.get("skills", []))
    required_skills = _normalize(requirements.get("required_skills", []))

    if not required_skills:
        skill_score = 0
    else:
        overlap = profile_skills & required_skills
        skill_score = int(len(overlap) / len(required_skills) * 70)

    projects_text = " ".join(profile.get("past_projects", [])).lower()
    nuclear_bonus = 20 if any(k in projects_text for k in NUCLEAR_KEYWORDS) else 0

    exp = int(profile.get("experience_years", 0))
    min_exp = int(requirements.get("min_experience", 0))
    exp_bonus = 10 if exp >= min_exp and min_exp > 0 else (5 if exp >= 3 else 0)

    return max(0, min(100, skill_score + nuclear_bonus + exp_bonus))
