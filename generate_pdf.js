import { chromium } from 'playwright';
import path from 'path';

async function setupBrowser() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        acceptDownloads: true,
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    return { browser, page };
}

async function startReport(page) {
    console.log('Navigating to local site...');
    await page.goto('http://localhost:3001');

    console.log('Starting Anonymous Report...');
    await page.waitForSelector('button:has-text("Iniciar Denuncia")', { state: 'visible' });
    await page.click('button:has-text("Iniciar Denuncia")');
}

async function stepLocation(page) {
    console.log('Waiting for Step 1 (Location)...');
    await page.waitForSelector('input[placeholder*="Ej. Calle"]', { state: 'visible' });
    const addressInput = await page.$('input[placeholder*="Ej. Calle"]');
    if (addressInput) {
        await addressInput.fill('Arroyo El Cajoncito 221, 23083 La Paz, B.C.S., Mexico');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
    }

    console.log("Waiting for Confirmar Ubicación...");
    await page.waitForSelector('button:has-text("Confirmar Ubicación"):not([disabled])', { state: 'visible' });
    await page.click('button:has-text("Confirmar Ubicación")');
}

async function stepInfo(page) {
    console.log('Waiting for Step 2 (Info)...');
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('textarea', { state: 'visible' });
    await page.fill('textarea', 'Quema de basura constante en lote baldío afectando a la comunidad en la mañana y en la noche.');
    await page.selectOption('select', { label: 'Aire y Emisiones (humos, olores, ruido)' });
    await page.click('button:has-text("Continuar")');
}

async function stepEvidence(page) {
    console.log('Waiting for Step 3 (Evidence)...');
    await page.waitForSelector('button:has-text("Omitir y Continuar")', { state: 'visible' });
    await page.click('button:has-text("Omitir y Continuar")');
}

async function stepReviewAndDownload(page) {
    console.log('Waiting for Step 4 (Review) and PDF Generation...');
    console.log('Waiting for Download PDF button...');
    await page.waitForSelector('button:has-text("Descargar PDF para Imprimir")', { state: 'visible', timeout: 30000 });

    console.log('Waiting for AI Analysis to resolve...');
    await page.waitForTimeout(5000);

    console.log('Clicking Download...');
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("Descargar PDF para Imprimir")')
    ]);

    const downloadPath = path.join(process.cwd(), 'Denuncia_Popular_Simulada_Anonima_Final.pdf');
    await download.saveAs(downloadPath);

    console.log(`PDF successfully downloaded to: ${downloadPath}`);
}

(async () => {
    let _browser;
    try {
        const { browser, page } = await setupBrowser();
        _browser = browser;

        await startReport(page);
        await stepLocation(page);
        await stepInfo(page);
        await stepEvidence(page);
        await stepReviewAndDownload(page);

    } catch (error) {
        console.error('Error during execution:', error);
    } finally {
        if (_browser) {
            await _browser.close();
        }
    }
})();
