#!/usr/bin/env python3
"""
Ñkyel AI - Event Store Backup Script
This script creates a timestamped backup of the SQLite event store database.
"""

import os
import shutil
import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def backup_event_store():
    # Local SQLite file for P0 persistence
    db_path = os.environ.get("NKYEL_EVENT_STORE_DB", "events.sqlite3")
    
    # Check if the event store exists
    if not os.path.exists(db_path):
        logger.error(f"Event store database '{db_path}' does not exist.")
        return
        
    # Create backups directory if it doesn't exist
    backups_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backups")
    os.makedirs(backups_dir, exist_ok=True)
    
    # Generate timestamped backup filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"events_backup_{timestamp}.sqlite3"
    backup_path = os.path.join(backups_dir, backup_filename)
    
    try:
        shutil.copy2(db_path, backup_path)
        logger.info(f"Successfully backed up event store to '{backup_path}'")
    except Exception as e:
        logger.error(f"Failed to backup event store: {e}")

if __name__ == "__main__":
    backup_event_store()
