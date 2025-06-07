const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const url = process.env.SCREENSHOT_URL || 'http://localhost:3000';
    const outputDir = 'screenshots';
    const fileName = process.env.SCREENSHOT_FILE || 'screenshot.png';
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || undefined,
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2' });
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
