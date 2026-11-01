/**
 * LCA 树形拓扑子视图空探针与指针标签核验 (Headless 隔离执行 · 零孤儿标签页)
 *
 * 验证目标 (AGENTS.md 画布防断电与动态探针锚点法则)：
 *   1. 树形拓扑子视图在空基底步渲染 ∅ null 虚线探针 (dashed line + null:0 胶囊框)
 *   2. 目标节点 p / q 与当前访问节点 cur 具备指针胶囊徽章
 *
 * 运行：vite-node scripts/verify-lca-topology-probe.ts (需 dev server @ 23300)
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:23300';
const SCREENSHOT_DIR = 'D:/tmp/lca-viz-verify';
const VIEWPORT = { width: 1920, height: 1080 };

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });

  // 预注入 mock 授权凭证，绕过阻断式激活弹窗 (浏览器环境为 mock 验签，同 click-test-valid-bst.ts)
  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'lca-topology-verify', exp: 0, user_id: 'tester', tier: 3 };
    const key = btoa(JSON.stringify(payload)) + '.mock-signature';
    localStorage.setItem('alg_viz_client_license_v1', key);
  });

  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // 关闭客户端激活弹窗 (若存在)，避免拦截指针事件
    const closeBtn = page.locator('#activation-close-btn');
    if (await closeBtn.count()) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // 搜索并进入 LCA 算法详情
    await page.locator('#search-input').fill('最近公共祖先');
    await page.waitForTimeout(800);
    await page.locator('.algo-card').filter({ hasText: '最近公共祖先' }).first().click();
    await page.waitForTimeout(1500);

    // 确认 Card 1 沙盘已挂载 SVG，并切换到「🌲 单树实时沙盘」子视图 (树形拓扑)
    const sandbox = page.locator('#dsp-sandbox-container').first();
    await sandbox.locator('svg').first().waitFor({ state: 'visible', timeout: 15000 });
    const singleBtn = page.locator('#btn-subview-single').first();
    if (await singleBtn.count()) {
      await singleBtn.click();
      await page.waitForTimeout(600);
    }

    // 切换到示例 2 用例 (p=5, q=4): 递归会下探到 0/8 的空子树，触发空基底探针
    const inputQ = page.locator('#input-q').first();
    await inputQ.fill('4');
    await page.waitForTimeout(900);
    if (await singleBtn.count()) {
      await singleBtn.click().catch(() => {});
      await page.waitForTimeout(600);
    }

    const nextBtn = page.locator('#btn-step-next').first();
    let probeFoundAt = -1;
    let labelFoundAt = -1;

    const svgTexts = async (): Promise<string[]> => {
      return sandbox.locator('svg text').allTextContents().catch(() => []);
    };

    for (let i = 0; i < 40; i++) {
      const texts = await svgTexts();
      const joined = texts.join('|');

      if (probeFoundAt < 0 && texts.some((t) => t.includes('null:0'))) {
        probeFoundAt = i;
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'lca-topology-null-probe.png'),
        });
        console.log(`   步 ${i}: 空探针 null:0 已出现 -> lca-topology-null-probe.png`);
      }
      if (labelFoundAt < 0 && ['p', 'q', 'cur'].every((w) => texts.some((t) => t.trim() === w) || joined.includes(w))) {
        labelFoundAt = i;
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'lca-topology-pointer-labels.png'),
        });
        console.log(`   步 ${i}: 指针标签 p/q/cur 已出现 -> lca-topology-pointer-labels.png`);
      }

      if (probeFoundAt >= 0 && labelFoundAt >= 0) break;
      const btnCount = await nextBtn.count();
      if (btnCount === 0) break;
      const disabled = await nextBtn.isDisabled().catch(() => true);
      if (disabled) break;
      await nextBtn.click();
      await page.waitForTimeout(140);
    }

    console.log('========================================');
    console.log(`空探针步:   ${probeFoundAt >= 0 ? `PASS (步 ${probeFoundAt})` : 'FAIL 未检出 null:0 探针'}`);
    console.log(`指针标签步: ${labelFoundAt >= 0 ? `PASS (步 ${labelFoundAt})` : 'FAIL 未检出 p/q/cur 标签'}`);
    const allPass = probeFoundAt >= 0 && labelFoundAt >= 0;
    console.log(allPass ? 'LCA 拓扑视图探针与指针核验全绿' : '核验存在缺失项');
    process.exitCode = allPass ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('核验脚本异常:', err);
  process.exitCode = 1;
});
