import asyncio
import pytest

from app.employ.providers.hh import HHProvider, _format_salary, _skills_from_snippet


class _FakeResp:
    def __init__(self, payload): self._p = payload
    def raise_for_status(self): pass
    def json(self): return self._p


class _FakeClient:
    def __init__(self, payload): self._p = payload; self.calls = []
    async def __aenter__(self): return self
    async def __aexit__(self, *a): pass
    async def get(self, url, params=None, headers=None):
        self.calls.append((url, params, headers))
        return _FakeResp(self._p)


HH_PAYLOAD = {
    "items": [
        {
            "id": "111",
            "name": "Сварщик 6 разряда",
            "alternate_url": "https://hh.ru/vacancy/111",
            "employer": {"name": "Росатом"},
            "area": {"name": "Москва"},
            "salary": {"from": 200000, "to": 300000, "currency": "RUR"},
            "snippet": {
                "requirement": "Опыт <highlighttext>welding</highlighttext> nuclear-grade.",
                "responsibility": "Сварка корпусов реакторов.",
            },
        }
    ]
}


def test_hh_provider_maps_response(monkeypatch):
    fake = _FakeClient(HH_PAYLOAD)
    import app.employ.providers.hh as mod
    monkeypatch.setattr(mod.httpx, "AsyncClient", lambda timeout=15: fake)

    out = asyncio.run(HHProvider().search(["welding", "nuclear"], limit=5))
    assert len(out) == 1
    c = out[0]
    assert c.position == "Сварщик 6 разряда"
    assert c.employer == "Росатом"
    assert c.full_name == "Росатом"
    assert c.url == "https://hh.ru/vacancy/111"
    assert c.location == "Москва"
    assert "welding" in [s.lower() for s in c.skills]
    assert c.salary and "200000" in c.salary and "RUR" in c.salary
    assert c.source_id == "111"


def test_hh_provider_handles_empty(monkeypatch):
    import app.employ.providers.hh as mod
    monkeypatch.setattr(mod.httpx, "AsyncClient", lambda timeout=15: _FakeClient({"items": []}))
    assert asyncio.run(HHProvider().search(["x"])) == []


def test_format_salary_variants():
    assert _format_salary(None) is None
    assert _format_salary({}) is None
    assert "от 100" in _format_salary({"from": 100, "currency": "RUR"})


def test_skills_from_snippet_strips_html():
    s = _skills_from_snippet({"requirement": "<b>welding</b> nuclear", "responsibility": ""})
    assert "welding" in s and "nuclear" in s
