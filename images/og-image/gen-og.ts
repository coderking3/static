import puppeteer from 'puppeteer'

const browser = await puppeteer.launch()
const page = await browser.newPage()

// @2x 物理像素，输出 2400×1350，质量更高
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })

// 确保 Vite dev server 已启动（npm run dev）
await page.goto('http://localhost:5173', {
  waitUntil: 'networkidle0',
})

// 等待字体加载完毕
await page.evaluateHandle('document.fonts.ready')

await page.screenshot({
  path: 'public/opengraph-image.png',
  clip: { x: 0, y: 0, width: 1200, height: 630 },
})

await browser.close()
console.log('✅ opengraph-image.png generated')
