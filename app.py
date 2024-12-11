from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

class BaseAPI:
    """基底 API 類別，提供通用的 CRUD 操作"""
    def __init__(self, base_url, resource):
        self.base_url = base_url
        self.resource = resource

    def get_all(self):
        return self._make_request("GET", f"/{self.resource}")

    def add(self, data):
        return self._make_request("POST", f"/{self.resource}", json=data)

    def update(self, resource_id, data):
        return self._make_request("PUT", f"/{self.resource}/{resource_id}", json=data)

    def delete(self, resource_id):
        return self._make_request("DELETE", f"/{self.resource}/{resource_id}")

    def _make_request(self, method, endpoint, **kwargs):
        try:
            url = f"{self.base_url}{endpoint}"
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return jsonify(response.json()), response.status_code
        except requests.exceptions.HTTPError as http_err:
            return jsonify({"error": str(http_err)}), response.status_code
        except Exception as err:
            return jsonify({"error": str(err)}), 500

class UserAPI(BaseAPI):
    """處理使用者相關 API 的類別"""
    def __init__(self, base_url):
        super().__init__(base_url, "users")

    def get_details(self, user_id):
        return self._make_request("GET", f"/users/{user_id}/details")

class LicenseAPI(BaseAPI):
    """處理許可證相關 API 的類別"""
    def __init__(self, base_url):
        super().__init__(base_url, "licenses")

class ViolationAPI(BaseAPI):
    """處理違規相關 API 的類別"""
    def __init__(self, base_url):
        super().__init__(base_url, "violations")

# 初始化應用程式
app = Flask(__name__)
CORS(app)
# 加載環境變數
load_dotenv()
# 定義外部 API 的基礎 URL
BASE_URL = os.getenv("API_BASE_URL")  # 從 .env 檔案中讀取

# 初始化 API 類別
api_classes = {
    "users": UserAPI(BASE_URL),
    "licenses": LicenseAPI(BASE_URL),
    "violations": ViolationAPI(BASE_URL)
}

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the API"}), 200

# 定義路由
@app.route('/api/<resource>', methods=['GET'])
def get_all(resource):
    api = api_classes.get(resource)
    if api:
        return api.get_all()
    return jsonify({"error": "Invalid resource"}), 404

@app.route('/api/<resource>', methods=['POST'])
def add_resource(resource):
    api = api_classes.get(resource)
    if api:
        return api.add(request.json)
    return jsonify({"error": "Invalid resource"}), 404

@app.route('/api/<resource>/<resource_id>', methods=['PUT'])
def update_resource(resource, resource_id):
    api = api_classes.get(resource)
    if api:
        return api.update(resource_id, request.json)
    return jsonify({"error": "Invalid resource"}), 404

@app.route('/api/<resource>/<resource_id>', methods=['DELETE'])
def delete_resource(resource, resource_id):
    api = api_classes.get(resource)
    if api:
        return api.delete(resource_id)
    return jsonify({"error": "Invalid resource"}), 404

@app.route('/api/users/<user_id>/details', methods=['GET'])
def get_user_details(user_id):
    return api_classes["users"].get_details(user_id)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=10000)
