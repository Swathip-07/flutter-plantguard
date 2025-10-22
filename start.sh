#!/bin/bash
cd flutter-python-api
pip install -r requirements.txt
uvicorn backend:app --host 0.0.0.0 --port $PORT
