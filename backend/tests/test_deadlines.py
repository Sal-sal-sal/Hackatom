def test_list_deadlines(client):
    r = client.get("/deadlines")
    assert r.status_code == 200
    assert len(r.json()) >= 8


def test_dashboard_kpi(client):
    r = client.get("/deadlines/dashboard")
    assert r.status_code == 200
    body = r.json()
    for key in ("total", "completed", "in_progress", "overdue", "upcoming_7days"):
        assert key in body and isinstance(body[key], int)


def test_kanban_groups(client):
    r = client.get("/deadlines/kanban")
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) == {"todo", "in_progress", "done"}


def test_alerts_only_unfinished(client):
    r = client.get("/deadlines/alerts")
    assert r.status_code == 200
    assert all(item["status"] != "done" for item in r.json())
