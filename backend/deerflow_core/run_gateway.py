"""
Ñkyel AI — DeerFlow 2.0 Gateway Entry Point · SmartANDJ AI Technologies
Starts uvicorn on port 8080 for Docker deployment and local execution.
"""

import uvicorn
import os
import sys
from pathlib import Path

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("deerflow_core.gateway:gateway_app", host=host, port=port, log_level="info")
