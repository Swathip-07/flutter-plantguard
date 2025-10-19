# backend.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from img_cnn import predict_with_best_model
from tomato_chatbot import get_chatbot_text, get_chatbot_response

app = FastAPI()

# --------------------------------------
# CORS Setup
# --------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory exists
os.makedirs("temp", exist_ok=True)

# --------------------------------------
# Image-based Prediction Endpoint
# --------------------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Save uploaded image
        image_path = os.path.join("temp", file.filename)
        with open(image_path, "wb") as f:
            f.write(await file.read())

        # CNN prediction
        predicted_label = predict_with_best_model(image_path)
        if not predicted_label:
            predicted_label = "Irrelevant"

        # Chatbot guidance
        try:
            chatbot_text = get_chatbot_text(predicted_label)
            if not chatbot_text:
                chatbot_text = "Sorry, this disease is not recognised by the chatbot."
        except Exception:
            chatbot_text = "Sorry, this disease is not recognised by the chatbot."

        return {"prediction": predicted_label, "chatbot_text": chatbot_text}

    except Exception as e:
        return {"prediction": "Irrelevant", "chatbot_text": f"Error: {str(e)}"}

# --------------------------------------
# Chatbot Text Endpoint
# --------------------------------------
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        user_input = request.message.strip()
        bot_response = get_chatbot_response(user_input)
        return {"response": bot_response}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

# --------------------------------------
# Run server
# --------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
