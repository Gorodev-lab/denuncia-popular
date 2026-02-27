import { test, expect } from '@playwright/test';

test.describe('Governance Audit Tracking', () => {
    test('should display a unique Audit ID in the Intelligence Interface', async ({ page }) => {
        await page.goto('/');

        // Open the Intelligence Interface (ChatBot)
        // Note: The interface might be open by default or require a button click.
        // Based on ChatBot.tsx, it takes 'isOpen' prop. 
        // Let's assume there is a button to open it or it opens during the flow.
        // In the existing submit-report.spec.ts, it seems to interact with the map first.

        // For this test, let's trigger the assistant opening if necessary.
        // Looking at App.tsx would be useful to see how ChatBot is triggered.

        // Assuming there is a toggle or it opens after step 1.
        // Let's try to find the button that opens it or just wait if it's already there.
        // Based on ChatBot.tsx, it's fixed bottom right.

        // If it's not open, we need to open it. 
        // Let's check HomePage.tsx or App.tsx for the toggle.

        // Use the floating chat bubble button
        const chatToggleButton = page.locator('div.fixed.bottom-6.right-6 button');
        await expect(chatToggleButton).toBeVisible();
        await chatToggleButton.click();

        // Assert the Audit ID is visible
        const auditIdElement = page.getByText(/Audit ID:|ID de Auditoría:/i);
        await expect(auditIdElement).toBeVisible({ timeout: 10000 });

        // Assert it matches the expected pattern (ESO-XXXXXX)
        const text = await auditIdElement.textContent();
        expect(text).toMatch(/ESO-[A-Z0-9]{6}/);
    });
});
