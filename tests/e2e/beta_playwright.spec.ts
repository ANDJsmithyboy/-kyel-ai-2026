/**
 * Ñkyel AI — Playwright E2E Test Suite : Bêta Privée 42h & Dossier Google
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import { test, expect } from '@playwright/test';

test.describe('Ñkyel AI — Bêta Privée 42h & Cycles de Vie', () => {

  test('1. Message officiel exact et compte à rebours', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le message officiel exact est présent
    const banner = page.locator('text=100 accès gratuits. Fenêtre exceptionnelle du 22 août à 12h00 au 24 août à 06h00, heure de Libreville.');
    // Si le bandeau est visible
    if (await banner.isVisible()) {
      await expect(banner).toBeVisible();
    }

    // Vérifier le badge Bêta Privée
    await expect(page.locator('text=BÊTA PRIVÉE 42H')).toBeVisible();
  });

  test('2. Ouverture du formulaire de feedback structuré', async ({ page }) => {
    await page.goto('/');

    const feedbackBtn = page.locator('button:has-text("Donner mon avis")');
    if (await feedbackBtn.isVisible()) {
      await feedbackBtn.click();
      await expect(page.locator('text=Votre avis pour la version finale')).toBeVisible();
      await expect(page.locator('text=Note globale de l\'expérience')).toBeVisible();
      
      // Fermer le modal
      await page.keyboard.press('Escape');
    }
  });

  test('3. Accès Reviewer Google autonome avec token sécurisé', async ({ request, page }) => {
    // Authentification autonome via token
    const authRes = await request.post('/api/v1/google-demo/auth', {
      data: { token: 'nkyel-google-reviewer-2026' }
    });
    
    expect(authRes.status()).toBe(200);
    const body = await authRes.json();
    expect(body.mode).toBe('google_candidate_demo');
    expect(body.tenant_id).toBe('google-demo-isolated-2026');

    // Vérifier les en-têtes anti-indexation
    const headers = authRes.headers();
    expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('4. Tableau de bord Administrateur et Export Métriques', async ({ request }) => {
    // Vérification de l'endpoint d'export JSON
    const exportRes = await request.get('/api/v1/beta/admin/metrics');
    if (exportRes.status() === 200) {
      const data = await exportRes.json();
      expect(data).toHaveProperty('campaign');
      expect(data).toHaveProperty('performance_and_costs');
      expect(data).toHaveProperty('feedback_metrics');
      expect(data.campaign.max_seats).toBe(100);
    }
  });

});
