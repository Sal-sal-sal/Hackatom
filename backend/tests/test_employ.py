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


def test_search_candidates(client):
    vac_id = client.get("/employ/vacancies").json()[0]["id"]
    r = client.post(f"/employ/vacancies/{vac_id}/search-candidates",
                    json={"source": "hh"})
    assert r.status_code == 200
    candidates = r.json()
    assert len(candidates) > 0
    assert all(0 <= c["match_score"] <= 100 for c in candidates)
    scores = [c["match_score"] for c in candidates]
    assert scores == sorted(scores, reverse=True)
