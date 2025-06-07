const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const url = process.env.SCREENSHOT_URL || 'http://localhost:3000';
    const outputDir = 'screenshots';
    const fileName = process.env.SCREENSHOT_FILE || 'playwright-screenshot.png';
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle' });
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const fullPath = `${outputDir}/${fileName}`;
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log('Screenshot saved to', fullPath);
    await browser.close();
  } catch (err) {
    console.error('Screenshot failed', err);
    process.exit(1);
  }
})();
