// One-off utility: render public/logo-kycn.svg onto a white square canvas
// to produce the PWA/app icon PNGs. Requires Playwright (npm i -D playwright)
// installed temporarily; run with: node scripts/render-icons-from-logo.mjs
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const LOGO_ASPECT = 351 / 181.745;

const targets = [
  { file: "public/icons/icon-192.png", size: 192, widthRatio: 0.74 },
  { file: "public/icons/icon-512.png", size: 512, widthRatio: 0.74 },
  { file: "public/icons/icon-maskable-512.png", size: 512, widthRatio: 0.52 },
  { file: "public/apple-touch-icon.png", size: 180, widthRatio: 0.74 },
];

const browser = await chromium.launch();
const htmlPath = path.resolve("scripts/render-icons-from-logo.html").replace(/\\/g, "/");

for (const { file, size, widthRatio } of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.goto(`file://${htmlPath}`);
  const logoWidth = Math.round(size * widthRatio);
  const logoHeight = Math.round(logoWidth / LOGO_ASPECT);
  await page.evaluate(
    ({ w, h }) => {
      const img = document.getElementById("logo");
      img.style.width = w + "px";
      img.style.height = h + "px";
    },
    { w: logoWidth, h: logoHeight }
  );
  await page.waitForTimeout(150);
  const full = path.resolve(file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  await page.screenshot({ path: full });
  await page.close();
  console.log("wrote", file);
}

await browser.close();
