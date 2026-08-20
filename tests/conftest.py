"""
Ñkyel AI — Test Suite Configuration
"""
import sys
import os

# Add backend to Python path so imports like `from events.persistent_store` work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
