from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# load model
model = joblib.load("model_ML/lappredict.pkl")

# MAE
MAE = 4316246

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json  # Data dari main.js

    try:
        # Buat DataFrame sesuai urutan dan nama kolom saat training
        input_df = pd.DataFrame([{
            "prosessor": data.get("prosessor", ""),
            "ram": int(data.get("ram", 0)),
            "hdd": int(data.get("hdd", 0)),
            "ssd": int(data.get("ssd", 0)),
            "ips": int(data.get("ips", 0)),
            "kartu_grafis": data.get("kartu_grafis", ""),
            "ukuran_layar": data.get("ukuran_layar", ""),
            "resolution": data.get("resolution", ""),
            "brandexpert": data.get("brandexpert", ""),
            "weight": float(data.get("weight", 0)),
            "ppi": float(data.get("ppi", 0)),
            "touchscreen": int(data.get("touchscreen", 0))
        }])

        # Debug log
        print("Data diterima untuk prediksi:")
        print(input_df)

        # Prediksi harga
        prediction = model.predict(input_df)[0]

        # Buat rentang harga
        min_price = max(0, prediction - MAE)
        max_price = prediction + MAE

        return jsonify({
            "min_price": int(min_price),
            "max_price": int(max_price)
        })

    except Exception as e:
        print("Error saat prediksi:", str(e))
        return jsonify({"error": str(e)}), 400

import os
debug_mode = os.environ.get("FLASK_DEBUG","0") == "1"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=debug_mode)