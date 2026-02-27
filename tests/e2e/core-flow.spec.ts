import { test, expect } from '@playwright/test';

test.describe('Core Business Flows (AI, Evidence, PDF)', () => {

    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 19.4326, longitude: -99.1332 });
        await page.goto('/');
    });

    test('ChatBot Integration & Interaction', async ({ page }) => {
        // Assume Chatbot might be open or we need to navigate
        // The chatbot is in the main interface
        const chatInput = page.getByPlaceholder(/Escribe aquí lo sucedido/i);
        await expect(chatInput).toBeVisible({ timeout: 15000 });

        // Type a message
        await chatInput.fill('Hubo un derrame químico en la calle');
        await chatInput.press('Enter');

        // Wait for AI response (could take some time in real life, or we intercept)
        // Check that a model message appears
        const modelResponse = page.locator('div').filter({ hasText: /Hola|Soy tu asistente/i }).first();
        await expect(modelResponse).toBeVisible({ timeout: 10000 });
    });

    test('Evidence Upload Flow', async ({ page }) => {
        // Mock the Supabase storage upload response
        await page.route('**/storage/v1/object/evidence/**', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ Key: 'evidence/test-image.jpg' }) });
        });

        const map = page.locator('div[aria-label="Map"]');
        await expect(map).toBeVisible({ timeout: 15000 });

        // Navigate to Step 3 (Evidence) - this requires passing Step 1 & 2
        await map.click({ position: { x: 200, y: 200 } });
        await page.getByRole('button', { name: /confirmar ubicación/i }).click();

        await page.selectOption('select[name="category"]', 'WATER');
        await page.fill('textarea[name="description"]', 'Derrame de agua report');
        await page.getByRole('button', { name: /siguiente/i }).click();

        // Now in Evidence Step
        await expect(page.getByText(/paso 3/i)).toBeVisible();

        // Simulate file upload
        const fileChooserPromise = page.waitForEvent('filechooser');

        // Find upload area or button (often hidden input or visible trigger)
        const uploadTrigger = page.locator('input[type="file"]');

        // Try uploading a dummy file buffer
        await uploadTrigger.setInputFiles({
            name: 'evidence.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-data')
        });

        // Verify image preview appears (thumbnail)
        await expect(page.locator('img[alt="Evidencia 1"]')).toBeVisible();

        await page.getByRole('button', { name: /siguiente|continuar/i }).click();
        await expect(page.getByText(/paso 4/i)).toBeVisible();
    });

    test('PDF Generation Logic', async ({ page }) => {
        // Mock DB submit
        await page.route('**/rest/v1/denuncias*', async (route) => {
            await route.fulfill({ status: 201, body: JSON.stringify([{ id: 1, folio: 'TEST-1' }]) });
        });

        // Proceed to final review step
        const map = page.locator('div[aria-label="Map"]');
        await expect(map).toBeVisible({ timeout: 15000 });
        await map.click({ position: { x: 200, y: 200 } });
        await page.getByRole('button', { name: /confirmar ubicación/i }).click();

        await page.selectOption('select[name="category"]', 'FOREST');
        await page.fill('textarea[name="description"]', 'Tala ilegal');
        await page.getByRole('button', { name: /siguiente/i }).click();

        // Skip evidence
        await page.getByRole('button', { name: /siguiente|continuar/i }).click();

        // In Step Review
        const submitBtn = page.getByRole('button', { name: /enviar|registrar/i });
        await expect(submitBtn).toBeVisible();

        // Normally submitting triggers PDF generation (if jsPDF/autoTable is triggered it might prompt download)
        // Here we just ensure we can submit the form without JS errors breaking the page

        // We can listen for console errors
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));

        await submitBtn.click();

        await expect(page.getByText(/éxito|registrado|folio/i)).toBeVisible({ timeout: 10000 });

        // Verify no uncaught exceptions occurred during the submission/PDF generation
        expect(errors).toHaveLength(0);
    });

});
