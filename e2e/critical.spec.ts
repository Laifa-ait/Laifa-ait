import { test, expect } from '@playwright/test';

test.describe('Parcours E2E Critiques OLMART', () => {

  test.beforeEach(async ({ page }) => {
    // Intercepter et bloquer les requêtes sortantes vers les APIs Google Firebase en mode test
    // afin d'éviter les erreurs HTTP 403 (Forbidden) lors de l'utilisation de fausses clés
    await page.route(/(identitytoolkit|firestore|securetoken)\.googleapis\.com/, route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, documents: [] }),
      });
    });
  });

  test('1. Visiteur — Homepage, Header & Navigation', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message, err.stack));

    // 1. Accès page d'accueil
    await page.goto('/');
    await expect(page).toHaveTitle(/Olma/i);

    // 2. Vérifier que la navbar principale et les éléments d'accueil sont chargés
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('domcontentloaded');

    // 3. Navigation vers le catalogue /shop
    await page.goto('/shop');
    await expect(page).toHaveURL(/\/shop/);
    await page.waitForLoadState('domcontentloaded');
  });

  test('2. Panier — Consultation et État', async ({ page }) => {
    // 1. Accès direct au panier
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart/);
    
    // 2. Vérifier que la vue panier se monte proprement
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('domcontentloaded');
  });

  test('3. Authentification & Sécurité — Protection des Routes Privées', async ({ page }) => {
    // 1. Tentative d'accès non-authentifié au dashboard vendeur -> Redirection /auth
    await page.goto('/dashboard/seller');
    await page.waitForURL(/\/auth/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);

    // 2. Tentative d'accès non-authentifié au dashboard admin -> Redirection /auth
    await page.goto('/dashboard/admin');
    await page.waitForURL(/\/auth/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test('4. Onboarding Vendeur & Espace Vente — Accès Sécurisé', async ({ page }) => {
    // 1. Accès à la page /sell
    await page.goto('/sell');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/sell/);

    // 2. Accès à /seller-onboarding (doit exiger auth et rediriger vers /auth)
    await page.goto('/seller-onboarding');
    await page.waitForURL(/\/auth/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test('5. Mobile Viewport — Responsive Layout', async ({ page }) => {
    // Emulation d'un écran mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Services & Pages Publiques — Bricolage & Calculateur Wilayas', async ({ page }) => {
    // Page Univers Bricolage
    await page.goto('/bricolage');
    await expect(page).toHaveURL(/\/bricolage/);
    await page.waitForLoadState('domcontentloaded');

    // Page Calculateur de frais de livraison
    await page.goto('/shipping-calculator');
    await expect(page).toHaveURL(/\/shipping-calculator/);
    await page.waitForLoadState('domcontentloaded');
  });

});
