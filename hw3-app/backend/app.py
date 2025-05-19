import os
from flask import Flask, jsonify, request, redirect, session, url_for
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
from pymongo import MongoClient
from bson.objectid import ObjectId

"""
Useful links:
https://www.geeksforgeeks.org/how-to-use-flask-session-in-python-flask/
https://www.geeksforgeeks.org/flask-rendering-templates/
https://www.geeksforgeeks.org/mongodb-database-collection-and-document/
https://www.youtube.com/watch?v=2hq5voBpFp0
"""

app = Flask(__name__)
app.secret_key = os.urandom(24)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"]) # CORS will allow the origin to send a cookie when making requests
oauth = OAuth(app)

nonce = generate_token()

oauth.register(
    name=os.getenv("OIDC_CLIENT_NAME"),
    client_id=os.getenv("OIDC_CLIENT_ID"),
    client_secret=os.getenv("OIDC_CLIENT_SECRET"),
    # server_metadata_url="http://dex:5556/.well-known/openid-configuration",
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={"scope": "openid email profile"}
)

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo.get_default_database()

@app.route("/")
def home(): # Basically discarded this
    user = session.get("user")
    if user:
        return f"<h2>Logged in as {user['email']}</h2><a href='/logout'>Logout</a>"
    return "<a href='/login'>Login with Dex</a>" # Can use login and /login

@app.route("/api/key")
def get_key():
    return jsonify({"apiKey": os.getenv("NYT_API_KEY")})

@app.route("/login")
def login():
    session["nonce"] = nonce
    redirect_uri = "http://localhost:8000/authorize"
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route("/authorize")
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get("nonce")
    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce) # or use .get('userinfo').json()
    session["user"] = user_info
    return redirect("http://localhost:5173") # Go back to the web page (now being logged in)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("http://localhost:5173") # Go back to the web page (now being logged out)

@app.route("/get_user")
def user():
    user = session.get("user")
    if user:
        return jsonify({"username": user["email"], "valid": True})
    return jsonify({"username": "", "valid": False})

@app.route("/get_comments")
def get_comments():
    comments = list(mongo.db.comments.find().sort({"_id": -1})) # Sort in the reverse order they were inserted in
    for comment in comments:
        comment["_id"] = str(comment["_id"])
    return jsonify(comments)

@app.route("/post_comment", methods=["POST"])
def post_comment():
    reqObj = request.get_json()
    _id = mongo.db.comments.insert_one(reqObj).inserted_id
    return jsonify({"_id": str(_id)})

@app.route("/delete_comment", methods=["POST"])
def delete_comment():
    reqObj = request.get_json()
    mongo.db.comments.update_one(
        {"_id": ObjectId(reqObj.get("_id"))},
        {"$set": {"comment": reqObj.get("comment")}}
    )
    return jsonify({"valid": True})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)