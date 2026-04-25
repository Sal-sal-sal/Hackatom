import asyncio
import pytest

from app.employ.providers.hh import HHProvider, _MOCK_CANDIDATES
from app.employ.providers.base import ExternalCandidate


def test_hh_provider_returns_mock_candidates():
    out = asyncio.run(HHProvider().search(["welding", "nuclear"], limit=10))
    assert len(out) == len(_MOCK_CANDIDATES)
    for c in out:
        assert isinstance(c, ExternalCandidate)
        assert c.full_name
        assert c.position
        assert c.source_id and c.source_id.startswith("hh-mock-")


def test_hh_provider_respects_limit():
    out = asyncio.run(HHProvider().search(["welding"], limit=3))
    assert len(out) == 3


def test_hh_provider_candidates_have_telegram():
    out = asyncio.run(HHProvider().search(["nuclear"], limit=10))
    telegrams = [c.telegram for c in out if c.telegram]
    assert len(telegrams) > 0
    for tg in telegrams:
        assert tg.startswith("@")


def test_hh_provider_candidates_have_skills():
    out = asyncio.run(HHProvider().search(["nuclear"], limit=10))
    for c in out:
        assert len(c.skills) > 0


def test_hh_provider_empty_keywords_still_returns():
    out = asyncio.run(HHProvider().search([]))
    assert len(out) > 0
