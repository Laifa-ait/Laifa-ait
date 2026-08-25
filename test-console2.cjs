const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://127.0.0.1:3000');
  await page.waitForTimeout(5000);
  console.log('HTML ROOT:', await page.$eval('#root', el => el.innerHTML.slice(0, 200)));
  await browser.close();
})();
