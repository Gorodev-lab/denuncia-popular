import { test, expect } from '@playwright/test';

/**
 * End-to-End Test: Submit Report Flow
 * 
 * This test verifies the critical user journey:
 * 1. Open the app
 * 2. Click the map to place a pin
 * 3. Fill out the report form
 * 4. Submit the report
 * 5. Verify success notification
 */

test.describe('Submit Report Flow', () => {
    test.beforeEach(async ({ page, context }) => {
        // Mock geolocation to a fixed coordinate (Mexico City Zócalo)
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 19.4326, longitude: -99.1332 });

        // Navigate to the app
        await page.goto('http://localhost:5173');
    });

    test('should submit a complete report successfully', async ({ page }) => {
        // ===================================
        // Step 1: Wait for map to load
        // ===================================
        await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

        // ===================================
        // Step 2: Click on the map to place a pin
        // ===================================
        const map = page.locator('.leaflet-container');
        await map.click({ position: { x: 200, y: 200 } });

        // Verify the marker appears
        await expect(page.locator('.leaflet-marker-icon')).toBeVisible();

        // ===================================
        // Step 3: Click "Confirmar Ubicación" button
        // ===================================
        await page.getByRole('button', { name: /confirmar ubicación/i }).click();

        // ===================================
        // Step 4: Fill out the Info step
        // ===================================
        // Wait for the info form to appear
        await expect(page.getByText(/paso 2/i)).toBeVisible();

        // Fill in the category
        await page.selectOption('select[name="category"]', 'INFRASTRUCTURE');

        // Fill in the description
        await page.fill('textarea[name="description"]',
            'Testing report submission: Broken street light on 5th Avenue'
        );

        // Optional: Fill in personal info (non-anonymous)
        await page.fill('input[name="fullName"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');

        // Click next
        await page.getByRole('button', { name: /siguiente/i }).click();

        // ===================================
        // Step 5: Skip evidence (optional step)
        // ===================================
        await expect(page.getByText(/paso 3/i)).toBeVisible();
        await page.getByRole('button', { name: /siguiente|continuar/i }).click();

        // ===================================
        // Step 6: Review and Submit
        // ===================================
        await expect(page.getByText(/paso 4|revisión/i)).toBeVisible();

        // Mock Supabase network request to return success
        await page.route('**/rest/v1/denuncias*', async (route) => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 123,
                        folio: 'DP-TEST-001',
                        created_at: new Date().toISOString(),
                    },
                ]),
            });
        });

        // Mock Storage upload (if evidence is uploaded)
        await page.route('**/storage/v1/object/**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ Key: 'evidence/test.jpg' }),
            });
        });

        // Submit the report
        await page.getByRole('button', { name: /enviar|registrar/i }).click();

        // ===================================
        // Step 7: Verify Success
        // ===================================
        // Wait for success message or toast notification
        await expect(
            page.getByText(/éxito|registrado|confirmación/i)
        ).toBeVisible({ timeout: 5000 });

        // Verify folio is displayed
        await expect(page.getByText(/DP-TEST-001/i)).toBeVisible();

        // Optionally, verify the page has navigated to success step
        await expect(page.getByText(/paso 5|completado/i)).toBeVisible();
    });

    test('should show validation errors for incomplete forms', async ({ page }) => {
        // Click through without filling required fields
        await expect(page.locator('.leaflet-container')).toBeVisible();

        // Try to proceed without selecting location
        const nextButton = page.getByRole('button', { name: /confirmar ubicación/i });
        await expect(nextButton).toBeDisabled();

        // Select location
        await page.locator('.leaflet-container').click({ position: { x: 200, y: 200 } });
        await nextButton.click();

        // Try to proceed without filling description
        await expect(page.getByText(/paso 2/i)).toBeVisible();
        const infoNextButton = page.getByRole('button', { name: /siguiente/i });

        // Should be disabled or show error
        await infoNextButton.click();
        await expect(
            page.getByText(/campo requerido|obligatorio/i)
        ).toBeVisible();
    });
});
