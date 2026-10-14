import time
print("1. Starting import test...", flush=True)

t0 = time.time()
import fastapi
print(f"2. FastAPI imported in {time.time()-t0:.2f}s", flush=True)

t0 = time.time()
import sklearn
print(f"3. Sklearn imported in {time.time()-t0:.2f}s", flush=True)

t0 = time.time()
from sklearn.cluster import KMeans
print(f"4. KMeans imported in {time.time()-t0:.2f}s", flush=True)

t0 = time.time()
from sklearn.feature_extraction.text import TfidfVectorizer
print(f"5. TfidfVectorizer imported in {time.time()-t0:.2f}s", flush=True)

t0 = time.time()
import app.main
print(f"6. App.main imported in {time.time()-t0:.2f}s", flush=True)

print("ALL IMPORTS COMPLETE!", flush=True)
