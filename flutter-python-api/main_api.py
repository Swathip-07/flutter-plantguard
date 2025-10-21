from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from img_cnn import predict_with_best_model
from tomato_chatbot import get_chatbot_response

app = FastAPI()

# Allow CORS for your Flutter device
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    contents = await file.read()
    tmp_path = f"temp_{file.filename}"
    with open(tmp_path, "wb") as f:
        f.write(contents)

    # Predict disease using CNN
    label = predict_with_best_model(tmp_path)

    # Return JSON
    return {"prediction": label}

@app.post("/chatbot")
async def chatbot(data: dict):
    disease = data.get("disease", "")
    response = get_chatbot_response(disease)
    return {"response": response}
