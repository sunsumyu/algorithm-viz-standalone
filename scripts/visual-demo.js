import { chromium } from 'playwright';
import fs from 'fs';

async function runVisualDemo() {
  console.log('🖥️ 正在屏幕上以【可见窗口模式 (Headed Mode)】启动浏览器...');
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({
    executablePath: execPath,
    channel: execPath ? undefined : 'msedge',
    headless: false, // 🌟 关键：显示真实桌面窗口！
    slowMo: 600       // 放慢每次操作速度，让用户清晰看到自动交互
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 860 }
  });
  const page = await context.newPage();

  console.log('📄 正在载入 http://localhost:3000/unique-paths-lite.html ...');
  await page.goto('http://localhost:3000/unique-paths-lite.html');
  await page.waitForTimeout(1000);

  console.log('▶️ 开始在界面上自动演示交互...');

  // 1. 单步步进 3 次
  for (let i = 1; i <= 3; i++) {
    await page.click('#btn-step-next');
    await page.waitForTimeout(500);
  }

  // 2. 切换阶段 1
  await page.click('button[data-stage="stage-1"]');
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 3; i++) {
    await page.click('#btn-step-next');
    await page.waitForTimeout(400);
  }

  // 3. 切换逆推
  await page.click('#btn-dir-reverse');
  await page.waitForTimeout(1000);

  // 4. 切换阶段 3
  await page.click('button[data-stage="stage-3"]');
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 4; i++) {
    await page.click('#btn-step-next');
    await page.waitForTimeout(400);
  }

  // 5. 切换阶段 4 外层 for
  await page.click('button[data-stage="stage-4"]');
  await page.waitForTimeout(800);
  await page.click('button[data-variant="for"]');
  await page.waitForTimeout(1000);

  console.log('✨ 演示完毕，浏览器窗口将保持打开供您亲自操作！');
  // 保持窗口打开 60 秒供用户在桌面上体验
  await page.waitForTimeout(60000);
  await browser.close();
}

runVisualDemo();
