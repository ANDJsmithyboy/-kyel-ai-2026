"""
Ñkyel AI — Test Suite Configuration
"""
import sys
import os

os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

# Add backend to Python path so imports like `from events.persistent_store` work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
