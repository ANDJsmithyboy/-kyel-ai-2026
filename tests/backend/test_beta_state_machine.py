"""
Ñkyel AI — Tests Unitaires : Machine à États Bêta & Fuseau Libreville
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import os
import pytest
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from services.beta_service import BetaStateMachine, TZ_LIBREVILLE, DEFAULT_BETA_START_UTC, DEFAULT_BETA_END_UTC


def test_libreville_timezone_conversion():
    """Vérifie que le fuseau Africa/Libreville (UTC+1) est correctement calculé."""
    # 22 août 2026 11:00 UTC == 22 août 2026 12:00 Libreville
    start_utc = datetime.fromisoformat("2026-08-22T11:00:00+00:00")
    start_libreville = start_utc.astimezone(TZ_LIBREVILLE)
    assert start_libreville.hour == 12
    assert start_libreville.day == 22
    assert start_libreville.month == 8

    # 24 août 2026 05:00 UTC == 24 août 2026 06:00 Libreville
    end_utc = datetime.fromisoformat("2026-08-24T05:00:00+00:00")
    end_libreville = end_utc.astimezone(TZ_LIBREVILLE)
    assert end_libreville.hour == 6
    assert end_libreville.day == 24

    # Durée exacte : 42 heures
    duration = (end_utc - start_utc).total_seconds() / 3600
    assert duration == 42.0


def test_state_prelaunch(monkeypatch):
    """Avant le 22 août 11:00 UTC, l'état doit être PRELAUNCH."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-21T10:00:00Z")
    monkeypatch.delenv("BETA_FORCE_STATE", raising=False)
    monkeypatch.delenv("BETA_KILL_SWITCH", raising=False)

    state = BetaStateMachine.evaluate_state(claimed_seats=0, max_seats=100)
    assert state == "PRELAUNCH"


def test_state_open(monkeypatch):
    """Pendant la fenêtre (ex: 22 août 15:00 UTC) avec places disponibles, l'état doit être OPEN."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-22T15:00:00Z")
    monkeypatch.delenv("BETA_FORCE_STATE", raising=False)
    monkeypatch.delenv("BETA_KILL_SWITCH", raising=False)

    state = BetaStateMachine.evaluate_state(claimed_seats=45, max_seats=100)
    assert state == "OPEN"


def test_state_capacity_reached(monkeypatch):
    """Pendant la fenêtre avec 100 places prises, l'état doit être CAPACITY_REACHED."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-23T10:00:00Z")
    monkeypatch.delenv("BETA_FORCE_STATE", raising=False)
    monkeypatch.delenv("BETA_KILL_SWITCH", raising=False)

    state = BetaStateMachine.evaluate_state(claimed_seats=100, max_seats=100)
    assert state == "CAPACITY_REACHED"


def test_state_public_closed(monkeypatch):
    """Après le 24 août 05:00 UTC (06:00 Libreville), l'état doit être PUBLIC_CLOSED."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-24T05:00:01Z")
    monkeypatch.delenv("BETA_FORCE_STATE", raising=False)
    monkeypatch.delenv("BETA_KILL_SWITCH", raising=False)

    state = BetaStateMachine.evaluate_state(claimed_seats=100, max_seats=100)
    assert state == "PUBLIC_CLOSED"


def test_state_kill_switch(monkeypatch):
    """Le kill switch force l'état DISABLED immédiatement."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-22T15:00:00Z")
    monkeypatch.setenv("BETA_KILL_SWITCH", "true")

    state = BetaStateMachine.evaluate_state(claimed_seats=10, max_seats=100)
    assert state == "DISABLED"


def test_state_admin_force_override(monkeypatch):
    """L'override administrateur surpasse la date."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-21T10:00:00Z")
    monkeypatch.setenv("BETA_FORCE_STATE", "INTERNAL_POLISH")

    state = BetaStateMachine.evaluate_state(claimed_seats=0, max_seats=100)
    assert state == "INTERNAL_POLISH"
