import { test, expect } from '@playwright/test';

test.describe('Manual Address Persistence', () => {
  test('should not clear manual address when relocating', async ({ page, context }) => {
    // Mock geolocation to a fixed coordinate
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 19.4326, longitude: -99.1332 });

    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for the map to load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

    // Click on the map to place a pin
    await page.locator('.leaflet-container').click({ position: { x: 200, y: 200 } });

    // Wait for the address to be detected
    await expect(page.getByText(/Dirección Detectada/)).toBeVisible();

    // Click the edit button to enter manual mode
    await page.getByTitle('Editar dirección manualmente').click();

    // Enter a custom address
    const manualAddress = 'My custom address, 123';
    await page.getByPlaceholder('Escribe la dirección exacta aquí...').fill(manualAddress);

    // Click the "Use my location" button
    await page.getByTitle('Usar mi ubicación actual').click();

    // Wait for the address to be detected again
    await expect(page.getByText(/Dirección Detectada/)).toBeVisible();

    // Assert that the manual address is still present
    await expect(page.getByPlaceholder('Escribe la dirección exacta aquí...')).toHaveValue(manualAddress);
  });
});
