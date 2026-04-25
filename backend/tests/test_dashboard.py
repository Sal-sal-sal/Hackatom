from datetime import date, timedelta


def test_kpi_endpoint(client):
    r = client.get("/dashboard/kpi")
    assert r.status_code == 200
    body = r.json()
    assert {"total", "completed", "in_progress", "overdue", "upcoming_7days"} <= set(body.keys())
    assert all(isinstance(body[k], int) for k in body)


def test_gantt_returns_items(client):
    r = client.get("/dashboard/gantt")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1
    for it in items:
        assert {"id", "name", "start_day", "duration", "progress", "category"} <= set(it.keys())
        assert it["category"] in {"foundation", "electrical", "structural", "safety"}
        assert it["duration"] >= 1


def test_alerts_severity(client):
    today = date.today().isoformat()
    overdue = (date.today() - timedelta(days=2)).isoformat()
    soon = (date.today() + timedelta(days=3)).isoformat()
    client.post("/deadlines", json={"title": "Late thing", "deadline_date": overdue,
                                    "priority": "high", "status": "in_progress"})
    client.post("/deadlines", json={"title": "Soon high", "deadline_date": soon,
                                    "priority": "high", "status": "todo"})
    r = client.get("/dashboard/alerts")
    assert r.status_code == 200
    body = r.json()
    assert any(a["severity"] == "critical" and a["title"] == "Late thing" for a in body)
    assert any(a["severity"] == "warning" and a["title"] == "Soon high" for a in body)
    _ = today  # placeholder for clarity


def test_activities_recent_desc(client):
    r = client.get("/dashboard/activities?limit=5")
    assert r.status_code == 200
    items = r.json()
    assert len(items) <= 5
    timestamps = [i["timestamp"] for i in items]
    assert timestamps == sorted(timestamps, reverse=True)
    for it in items:
        assert {"id", "action", "target", "user", "timestamp"} <= set(it.keys())
