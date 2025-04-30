import os
import pytest
from backend.app import app

""" Useful resource: https://testdriven.io/blog/flask-pytest/ """

@pytest.fixture
def test_client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client

def test_key_route(test_client):
    actual_response = test_client.get("/api/key")
    assert actual_response.status_code == 200
    assert actual_response.json == {"apiKey": os.getenv("NYT_API_KEY")}

def test_default_route(test_client):
    actual_response = test_client.get("/")
    assert actual_response.status_code == 200
    with open("../templates/index.html") as file:
        expected_response = file.read()
    assert actual_response.data.decode() == expected_response

def test_valid_route(test_client):
    actual_response = test_client.get("/js/script.js")
    assert actual_response.status_code == 200
    with open("../static/js/script.js") as file:
        expected_response = file.read()
    assert actual_response.data.decode() == expected_response

def test_invalid_route(test_client):
    actual_response = test_client.get("/invalid/route")
    assert actual_response.status_code == 200
    with open("../templates/index.html") as file:
        expected_response = file.read()
    assert actual_response.data.decode() == expected_response