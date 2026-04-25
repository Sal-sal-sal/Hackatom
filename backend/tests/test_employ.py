import pytest

from app.core.enums import CandidateSource
from app.employ.providers import registry
from app.employ.providers.base import ExternalCandidate


class _StubProvider:
    def __init__(self, items): self.items = items; self.calls = []
    async def search(self, keywords, limit=10):
        self.calls.append((list(keywords), limit))
        return list(self.items)


@pytest.fixture
def stub_hh(monkeypatch):
    items = [
        ExternalCandidate(full_name="Acme", position="Welder",
                          skills=["welding", "nuclear", "rebar"], employer="Acme",
                          url="https://hh.ru/1", source_id="1"),
        ExternalCandidate(full_name="Beta", position="Office",
                          skills=["excel"], employer="Beta",
                          url="https://hh.ru/2", source_id="2"),
    ]
    stub = _StubProvider(items)
    monkeypatch.setitem(registry.PROVIDERS, CandidateSource.HH, stub)
    monkeypatch.setitem(registry.PROVIDERS, CandidateSource.LINKEDIN, stub)
    return stub


def test_list_brigades_seeded(client):
    r = client.get("/employ/brigades")
    assert r.status_code == 200
    assert len(r.json()) >= 3


def test_create_and_get_brigade(client):
    payload = {"name": "Test Brigade", "leader_name": "Test Lead",
               "members_count": 5, "specialization": "Testing"}
    r = client.post("/employ/brigades", json=payload)
    assert r.status_code == 201
    bid = r.json()["id"]
    detail = client.get(f"/employ/brigades/{bid}")
    assert detail.status_code == 200
    assert detail.json()["name"] == "Test Brigade"


def test_search_candidates_hh(client, stub_hh):
    vac_id = client.get("/employ/vacancies").json()[0]["id"]
    r = client.post(f"/employ/vacancies/{vac_id}/search-candidates",
                    json={"source": "hh"})
    assert r.status_code == 200
    candidates = r.json()
    assert len(candidates) == 2
    assert all(0 <= c["match_score"] <= 100 for c in candidates)
    scores = [c["match_score"] for c in candidates]
    assert scores == sorted(scores, reverse=True)
    assert candidates[0]["url"] == "https://hh.ru/1"
    assert stub_hh.calls, "HH provider was not called"


def test_search_linkedin_routes_to_hh(client, stub_hh):
    vac_id = client.get("/employ/vacancies").json()[0]["id"]
    r = client.post(f"/employ/vacancies/{vac_id}/search-candidates",
                    json={"source": "linkedin"})
    assert r.status_code == 200
    assert len(stub_hh.calls) >= 1


def test_search_manual_uses_db(client):
    vac_id = client.get("/employ/vacancies").json()[0]["id"]
    vac = [v for v in client.get("/employ/vacancies").json() if v["id"] == vac_id][0]
    skill = (vac.get("required_skills") or ["welding"])[0]

    emp = {"full_name": "Local Emp", "position": "Welder",
           "experience_years": 7, "skills": [skill, "extra"],
           "past_projects": ["NPP demo"], "source": "manual"}
    client.post("/employ/employees", json=emp)

    r = client.post(f"/employ/vacancies/{vac_id}/search-candidates",
                    json={"source": "manual"})
    assert r.status_code == 200
    data = r.json()
    assert any(c["full_name"] == "Local Emp" for c in data)
    assert all(c["source"] == "manual" for c in data)
