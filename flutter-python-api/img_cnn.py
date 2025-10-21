# img_cnn.py
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer
from PIL import Image
import io
import os

# -----------------------------
# Model path and class names
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "cnn_models")  # adjust if needed

MODEL_PATH = os.path.join(MODEL_DIR, "best_model_fold1.h5")

CLASS_NAMES = [
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy',
    'irrelevant'
]

IMG_SIZE = (224, 224)
IRRELEVANT_LABEL = "irrelevant"

# -----------------------------
# Safe model loading function
# -----------------------------
def safe_load_model(path):
    if not os.path.exists(path):
        print(f"⚠️ Model path not found: {path}")
        return None
    try:
        # custom_objects ensures InputLayer with batch_shape works
        model = load_model(path, compile=False, custom_objects={'InputLayer': InputLayer})
        print(f"✅ Loaded {path}")
        return model
    except Exception as e:
        print(f"❌ Failed to load {path}: {e}")
        return None

# -----------------------------
# Load single model
# -----------------------------
models = [safe_load_model(MODEL_PATH)]
# Filter out None in case model failed to load
models = [m for m in models if m is not None]
print(f"Loaded {len(models)} model(s)")

# -----------------------------
# Image preprocessing
# -----------------------------
def preprocess_image_bytes(file_bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB").resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_image_path(img_path):
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# -----------------------------
# Prediction functions
# -----------------------------
def predict_disease(file_bytes):
    """Predict disease from uploaded bytes"""
    img_array = preprocess_image_bytes(file_bytes)
    if not models:
        return IRRELEVANT_LABEL

    preds = [m.predict(img_array, verbose=0)[0] for m in models]
    avg_pred = np.mean(preds, axis=0)
    pred_idx = np.argmax(avg_pred)
    confidence = np.max(avg_pred)

    if confidence < 0.5:
        return IRRELEVANT_LABEL

    return CLASS_NAMES[pred_idx]

def predict_with_best_model(img_path):
    """Predict disease from local image path"""
    if not models or not os.path.exists(img_path):
        return IRRELEVANT_LABEL

    img_array = preprocess_image_path(img_path)
    best_confidence = 0
    best_label = IRRELEVANT_LABEL

    for m in models:
        preds = m.predict(img_array, verbose=0)[0]
        pred_idx = np.argmax(preds)
        confidence = np.max(preds)

        if confidence > best_confidence:
            best_confidence = confidence
            best_label = CLASS_NAMES[pred_idx] if confidence >= 0.5 else IRRELEVANT_LABEL

    return best_label
