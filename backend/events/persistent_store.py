import sqlite3
import json
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Fichier SQLite local pour la persistance P0
DB_PATH = os.environ.get("NKYEL_EVENT_STORE_DB", "events.sqlite3")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialise le schéma de la base de données de l'Event Store."""
    with get_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                type TEXT NOT NULL,
                payload JSON,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_run_id ON events (run_id)')
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS snapshots (
                run_id TEXT PRIMARY KEY,
                state JSON,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

# Initialize DB on load
try:
    init_db()
except Exception as e:
    logger.error(f"Failed to initialize event store DB: {e}")

def append_event(run_id: str, event_id: str, event_type: str, payload: Dict[str, Any]) -> bool:
    """Ajoute un évènement dans le store pour une run donnée. Idempotent."""
    try:
        with get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO events (id, run_id, type, payload) VALUES (?, ?, ?, ?)",
                (event_id, run_id, event_type, json.dumps(payload, ensure_ascii=False))
            )
            conn.commit()
        return True
    except Exception as e:
        logger.error(f"Failed to append event {event_id}: {e}")
        return False

def get_events(run_id: str) -> List[Dict[str, Any]]:
    """Récupère tous les évènements d'une run, triés par date."""
    try:
        with get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, run_id, type, payload, timestamp FROM events WHERE run_id = ? ORDER BY timestamp ASC",
                (run_id,)
            )
            events = []
            for row in cursor:
                events.append({
                    "id": row["id"],
                    "run_id": row["run_id"],
                    "type": row["type"],
                    "payload": json.loads(row["payload"]) if row["payload"] else {},
                    "timestamp": row["timestamp"]
                })
            return events
    except Exception as e:
        logger.error(f"Failed to get events for {run_id}: {e}")
        return []

def create_snapshot(run_id: str, state: Dict[str, Any]) -> bool:
    """Crée ou met à jour un snapshot complet de l'état (checkpoint)."""
    try:
        with get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO snapshots (run_id, state) VALUES (?, ?)",
                (run_id, json.dumps(state, ensure_ascii=False))
            )
            conn.commit()
        return True
    except Exception as e:
        logger.error(f"Failed to create snapshot for {run_id}: {e}")
        return False

def get_snapshot(run_id: str) -> Optional[Dict[str, Any]]:
    """Récupère le dernier snapshot pour une run."""
    try:
        with get_connection() as conn:
            cursor = conn.execute(
                "SELECT state FROM snapshots WHERE run_id = ?",
                (run_id,)
            )
            row = cursor.fetchone()
            if row and row["state"]:
                return json.loads(row["state"])
            return None
    except Exception as e:
        logger.error(f"Failed to get snapshot for {run_id}: {e}")
        return None
