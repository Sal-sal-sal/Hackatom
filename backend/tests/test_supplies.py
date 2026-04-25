def test_list_supplies(client):
    r = client.get("/supplies")
    assert r.status_code == 200
    assert len(r.json()) >= 6


def test_filter_supplies_by_status(client):
    r = client.get("/supplies", params={"status": "done"})
    assert r.status_code == 200
    assert all(s["status"] == "done" for s in r.json())


def test_update_supply_progress(client):
    sid = client.get("/supplies").json()[0]["id"]
    r = client.patch(f"/supplies/{sid}", json={"progress": 88})
    assert r.status_code == 200
    assert r.json()["progress"] == 88


def test_find_supplier_ranking(client):
    sid = client.get("/supplies").json()[0]["id"]
    r = client.post(f"/supplies/{sid}/find-supplier")
    assert r.status_code == 200
    matches = r.json()
    assert len(matches) > 0
    scores = [m["score"] for m in matches]
    assert scores == sorted(scores, reverse=True)
