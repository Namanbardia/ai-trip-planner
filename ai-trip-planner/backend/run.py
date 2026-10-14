import sys
import uvicorn

if __name__ == "__main__":
    print("Starting TripBuddy FastAPI Backend on http://127.0.0.1:8000 ...", flush=True)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
