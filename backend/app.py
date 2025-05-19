from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
import os
from flask import render_template, Flask, jsonify, send_from_directory,request,session, redirect
import os
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
'''source: https://www.geeksforgeeks.org/flask-rendering-templates/
https://www.geeksforgeeks.org/mongodb-database-collection-and-document/
https://www.geeksforgeeks.org/how-to-use-flask-session-in-python-flask/
https://www.youtube.com/watch?v=2hq5voBpFp0
'''
static_path = os.getenv('STATIC_PATH','static')
template_path = os.getenv('TEMPLATE_PATH','templates')
# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo.get_default_database()
app = Flask(__name__, static_folder=static_path, template_folder=template_path)
app.secret_key = os.urandom(24)


oauth = OAuth(app)

nonce = generate_token()


oauth.register(
    name=os.getenv('OIDC_CLIENT_NAME'),
    client_id=os.getenv('OIDC_CLIENT_ID'),
    client_secret=os.getenv('OIDC_CLIENT_SECRET'),
    # server_metadata_url='http://dex:5556/.well-known/openid-configuration',
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={'scope': 'openid email profile'}
)


@app.route('/get_user')
def get_user():
    return jsonify({'user': session.get('user', {})})

@app.route('/delete_comment', methods=['POST'])
def delete_comment():
        print(">>> /delete_comment triggered", flush=True)
        data = request.get_json(force=True)
        print(">>> Raw data:", data)
        comment_id = data.get('id')
        print(">>> Received comment_id:", comment_id, ",type:", type(comment_id), flush=True)
        try:
            obj_id = ObjectId(comment_id)
        except Exception as e:
            print("!!! Invalid ObjectId:", comment_id, flush=True)
            return jsonify({'status': 'error', 'message': 'Invalid comment ID'}), 400
        mongo.db.comments.update_one(
            {'_id': obj_id},
            {'$set': {'comment': 'COMMENT REMOVED BY MODERATOR!'}}
        )
        return jsonify({'status': 'success'})
@app.route('/get_comments', methods=['POST'])
def get_comments():
    data = request.json
    article_url = data.get('article_url')
    comments = list(mongo.db.comments.find({'article_url': article_url}))

    for c in comments:
        c['_id'] = str(c['_id'])  # Convert ObjectId to string
        c['parent_id'] = str(c['parent_id']) if c.get('parent_id') else None
    return jsonify(comments)
@app.route('/made_comments', methods=['POST'])
def made_comments():
    try:
        data = request.get_json(force=True)
        comment = data.get('comment')
        article_url = data.get('article_url')
        parent_id = data.get('parent_id')

        user = session.get('user', {'name': 'Anonymous'})

        if parent_id:
            parent_obj_id = parent_id
        else:
            parent_obj_id = None


        comment_doc = {
            'user': user['name'],
            'article_url': article_url,
            'comment': comment,
            'parent_id': parent_obj_id
        }
        inserted = mongo.db.comments.insert_one(comment_doc)

        return jsonify({
            'status': 'success',
            'comment': {
                '_id': str(inserted.inserted_id),
                'user': user['name'],
                'comment': comment,
                'parent_id': parent_id
            }
        })

    except Exception as e:
        print("!!! ERROR in /made_comments:", str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500
@app.route('/api/key')
def get_key():
    return jsonify({'apiKey': os.getenv('NYT_API_KEY')})

@app.route('/<path:path>')
def serve_frontend(path=''):
    if path != '' and os.path.exists(os.path.join(static_path,path)):
        return send_from_directory(static_path, path)
    return send_from_directory(template_path, 'index.html')
@app.route('/')
def home():
    user = session.get('user')
    return render_template("index.html", user=user)

@app.route('/login')
def login():
    session['nonce'] = nonce
    redirect_uri = 'http://localhost:8000/authorize'
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/authorize')
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get('nonce')

    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce)  # or use .get('userinfo').json()
    session['user'] = user_info
    return redirect('/')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), debug=debug_mode)
