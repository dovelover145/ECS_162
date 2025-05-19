import os
from backend.app import app
import pytest
from app import app as flask_app
import json

""" Useful resource: https://testdriven.io/blog/flask-pytest/ """

# most route check are added inside app.py directly

@pytest.fixture
def test_client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client

def test_key_route(test_client):
    actual_response = test_client.get("/api/key")
    assert actual_response.status_code == 200
    assert actual_response.json == {"apiKey": os.getenv("NYT_API_KEY")}

def test_get_user_default(client):
    res = client.get('/get_user')
    assert res.status_code == 200
    assert res.get_json() == {'user': {}}

def test_get_comments_empty(client, monkeypatch):
    def mock_find(query):
        return []
    monkeypatch.setattr(flask_app.mongo.db.comments, 'find', mock_find)

    res = client.post('/get_comments', json={"article_url": "fake_url"})
    assert res.status_code == 200
    assert res.get_json() == []

def test_made_comments(client):
    res = client.post('/made_comments', json={
        "comment": "test comment",
        "article_url": "test_url"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] in ['success', 'error']


def test_invalid_route(test_client):
    actual_response = test_client.get("/invalid/route")
    assert actual_response.status_code == 200
    with open("../templates/index.html") as file:
        expected_response = file.read()
    assert actual_response.data.decode() == expected_response