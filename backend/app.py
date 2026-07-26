# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import requests
# import os

# app = Flask(__name__)
# CORS(app)

# # Your Hugging Face Token
# HF_TOKEN = os.environ.get("HF_TOKEN")

# API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"

# headers = {
#     "Authorization": f"Bearer {HF_TOKEN}"
# }


# @app.route("/")
# def home():
#     return jsonify({
#         "status": "running",
#         "project": "CaptionLens",
#         "version": "TEST-12345"
#     })


# @app.route("/caption", methods=["POST"])
# def caption():

#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     image = request.files["image"]

#     try:

#         image_bytes = image.read()

#         response = requests.post(
#             API_URL,
#             headers=headers,
#             data=image_bytes,
#             timeout=120
#         )

#         if response.status_code != 200:
#             return jsonify({
#                 "error": response.text
#             }), response.status_code

#         result = response.json()

#         if isinstance(result, list) and len(result) > 0:
#             caption = result[0]["generated_text"]

#             return jsonify({
#                 "caption": caption
#             })

#         return jsonify({
#             "error": "No caption generated"
#         }), 500

#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 500


# if __name__ == "__main__":
#     app.run(
#         host="0.0.0.0",
#         port=int(os.environ.get("PORT", 5000))
#     )


from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient
import os

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.environ.get("HF_TOKEN")

client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)

MODEL = "Salesforce/blip-image-captioning-base"


@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "project": "CaptionLens",
        "version": "2.0"
    })


@app.route("/caption", methods=["POST"])
def caption():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    try:
        result = client.image_to_text(
            image=image.stream,
            model=MODEL
        )

        if hasattr(result, "generated_text"):
            return jsonify({
                "caption": result.generated_text
            })

        return jsonify({
            "error": "No caption generated"
        }), 500

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
