/**
 * 专项缩放与拖拽测试脚本 (Scaling & Splitter Resize Rigorous Verification)
 *
 * 测试范围：
 *  1. Card 2 向下极限压缩拖拽（测试是否触发截断 / 文字遮挡 / overflow > 0）
 *  2. Card 2 向上极限拉伸拖拽（测试是否正常放大）
 *  3. 双击 Splitter 复位测试
 *  4. Stage 1 / Stage 2 / Stage 3 全阶段极限压缩测试
 *  5. 主水平分割条（左右双栏）拖拽测试
 *  6. 视口响应式缩放（1920x1080 -> 1440x900 -> 1280x800）
 *  7. 刷新重载后高度记忆测试（检查是否回退或出现大空白）
 */

import { chromium } from 'playwright';
import fs from 'fs';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-scaling-test';
const BASE_URL = 'http://localhost:23300';

interface Issue {
  type: string;
  stage: string;
  desc: string;
  data: any;
}

const issues: Issue[] = [];

async function findBrowserExecutable(): Promise<string | undefined> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const execPath = await findBrowserExecutable();
  const browser = await chromium.launch({ executablePath: execPath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Mock license
  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'scaling-test', exp: 0, user_id: 'tester', tier: 3 };
    const key = btoa(JSON.stringify(payload)) + '.mock-signature';
    localStorage.setItem('alg_viz_client_license_v1', key);
  });

  console.log('🚀 1. 打开首页并导航至 Valid BST ...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  const opened = await page.evaluate(async () => {
    const engine = (window as any).viewMountEngine;
    if (!engine) return 'no-engine';
    const viz = await engine.showAlgorithm('valid-bst');
    return viz ? 'ok' : 'failed';
  });
  if (opened !== 'ok') {
    throw new Error(`挂载失败: ${opened}`);
  }
  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const shot = async (name: string) => {
    await page.screenshot({ path: `${ARTIFACT_DIR}/${name}`, fullPage: false });
  };

  const getCard2Metrics = async () => {
    return await page.evaluate(() => {
      const card = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
      if (!card) return null;
      const header = card.querySelector('.dsp-card-header') as HTMLElement | null;
      const grid = card.querySelector('.dsp-metrics-grid') as HTMLElement | null;
      const custom = card.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      const liveText = card.querySelector('#dsp-live-text') as HTMLElement | null;

      // 检查各个子元素是否在可视视口内，或者是否有文字截断
      const checkClipped = (el: HTMLElement | null) => {
        if (!el) return false;
        const cRect = card.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        return eRect.top < cRect.top - 1 || eRect.bottom > cRect.bottom + 1;
      };

      return {
        cardHeight: card.offsetHeight,
        clientHeight: card.clientHeight,
        scrollHeight: card.scrollHeight,
        overflow: card.scrollHeight - card.clientHeight,
        headerH: header?.offsetHeight || 0,
        gridH: grid?.offsetHeight || 0,
        customH: custom?.offsetHeight || 0,
        liveTextH: liveText?.offsetHeight || 0,
        isCustomClipped: checkClipped(custom),
        isLiveTextClipped: checkClipped(liveText),
        liveTextContent: liveText?.textContent?.trim() || '',
      };
    });
  };

  console.log('\n📊 初始状态 Card 2:');
  const initial = await getCard2Metrics();
  console.log(JSON.stringify(initial, null, 2));

  // ================= 阶段 1 / 2 / 3 极限压缩测试 =================
  const stages = ['stage-1', 'stage-2', 'stage-3'];

  for (const st of stages) {
    console.log(`\n================ 测试阶段 ${st} ===============`);
    await page.click(`.dsp-stage-tab-btn[data-stage="${st}"]`);
    await page.waitForTimeout(500);

    // 运行几步，产生数据
    for (let i = 0; i < 5; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    const beforeCompress = await getCard2Metrics();
    console.log(`   [${st}] 压缩前: cardH=${beforeCompress?.cardHeight} scrollH=${beforeCompress?.scrollHeight} overflow=${beforeCompress?.overflow}`);

    // 定位 Card 2 垂直分割条
    const vSplitters = page.locator('.algo-splitter-vertical');
    const leftSplitter = vSplitters.first();
    const box = await leftSplitter.boundingBox();
    if (!box) {
      console.error(`   ❌ 未找到左侧垂直分割条！`);
      continue;
    }

    // 1. 向下拖拽 300px（尝试极限压缩 Card 2，验证最小高度限制是否生效且防止溢出）
    console.log(`   👇 向下拖拽 300px 尝试极限压缩 Card 2 ...`);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 300, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const afterCompress = await getCard2Metrics();
    console.log(`   [${st}] 极限压缩后: cardH=${afterCompress?.cardHeight} scrollH=${afterCompress?.scrollHeight} overflow=${afterCompress?.overflow} isCustomClipped=${afterCompress?.isCustomClipped} isLiveTextClipped=${afterCompress?.isLiveTextClipped}`);

    if (afterCompress && afterCompress.overflow > 4) {
      issues.push({
        type: 'OverflowOnCompress',
        stage: st,
        desc: `向下极限压缩后发生溢出截断: overflow=${afterCompress.overflow}px`,
        data: afterCompress,
      });
      console.log(`   🚨 [BUG] 发生溢出截断: ${afterCompress.overflow}px`);
    }

    if (afterCompress?.isCustomClipped || afterCompress?.isLiveTextClipped) {
      issues.push({
        type: 'ContentClipped',
        stage: st,
        desc: `子元素被边界遮挡截断! customClipped=${afterCompress.isCustomClipped}, liveTextClipped=${afterCompress.isLiveTextClipped}`,
        data: afterCompress,
      });
      console.log(`   🚨 [BUG] 子元素被遮挡截断！`);
    }

    await shot(`scaling_${st}_compressed.png`);

    // 2. 向上拖拽 150px（扩大 Card 2）
    console.log(`   👆 向上拖拽 150px 扩大 Card 2 ...`);
    const box2 = await leftSplitter.boundingBox();
    if (box2) {
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
      await page.mouse.down();
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2 - 150, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(400);

      const afterExpand = await getCard2Metrics();
      console.log(`   [${st}] 扩大后: cardH=${afterExpand?.cardHeight} overflow=${afterExpand?.overflow}`);
      await shot(`scaling_${st}_expanded.png`);

      // 3. 双击复位测试
      console.log(`   🖱️ 双击分割条测试复位 ...`);
      const box3 = await leftSplitter.boundingBox();
      if (box3) {
        await page.mouse.dblclick(box3.x + box3.width / 2, box3.y + box3.height / 2);
        await page.waitForTimeout(400);
        const afterDblClick = await getCard2Metrics();
        console.log(`   [${st}] 双击复位后: cardH=${afterDblClick?.cardHeight} overflow=${afterDblClick?.overflow}`);
      }
    }
  }

  // ================= 刷新重载记忆验证 =================
  console.log(`\n================ 测试重载高度记忆 ===============`);
  // 先设一个自定义高度
  const vSplitters = page.locator('.algo-splitter-vertical');
  const leftSplitter = vSplitters.first();
  const box = await leftSplitter.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 80, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(400);
  }
  const beforeReload = await getCard2Metrics();
  console.log(`   重载前高度: cardH=${beforeReload?.cardHeight}`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const reOpened = await page.evaluate(async () => {
    const engine = (window as any).viewMountEngine;
    if (!engine) return 'no-engine';
    const viz = await engine.showAlgorithm('valid-bst');
    return viz ? 'ok' : 'failed';
  });
  if (reOpened !== 'ok') {
    throw new Error(`重载后重新挂载失败: ${reOpened}`);
  }
  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const afterReload = await getCard2Metrics();
  console.log(`   重载后高度: cardH=${afterReload?.cardHeight}`);

  const diff = Math.abs((afterReload?.cardHeight || 0) - (beforeReload?.cardHeight || 0));
  if (diff > 5) {
    issues.push({
      type: 'PersistenceMismatch',
      stage: 'all',
      desc: `重载后高度偏离: 重载前=${beforeReload?.cardHeight}, 重载后=${afterReload?.cardHeight}`,
      data: { before: beforeReload?.cardHeight, after: afterReload?.cardHeight },
    });
    console.log(`   🚨 [BUG] 重载高度未准确保持，差异: ${diff}px`);
  } else {
    console.log(`   ✓ 重载高度记忆准确对齐 (差异 ${diff}px <= 5px)`);
  }

  // ================= 视口缩放测试 (1920 -> 1440 -> 1280) =================
  console.log(`\n================ 视口响应式测试 ===============`);
  for (const vp of [
    { width: 1440, height: 900, label: '1440x900' },
    { width: 1280, height: 800, label: '1280x800' },
    { width: 1920, height: 1080, label: '1920x1080' },
  ]) {
    console.log(`   📏 调整视口至 ${vp.label} ...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const m = await getCard2Metrics();
    console.log(`   [${vp.label}] cardH=${m?.cardHeight} scrollH=${m?.scrollHeight} overflow=${m?.overflow} clipped=${m?.isCustomClipped || m?.isLiveTextClipped}`);
    if (m && m.overflow > 4) {
      issues.push({
        type: 'ViewportOverflow',
        stage: vp.label,
        desc: `视口 ${vp.label} 下 Card 2 内容溢出: overflow=${m.overflow}px`,
        data: m,
      });
    }
    await shot(`scaling_viewport_${vp.label}.png`);
  }

  // ================= 水平主分割条（左右双栏）拖拽测试 =================
  console.log(`\n================ 水平主分割条（左右双栏）拖拽测试 ===============`);
  const splitterInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.algo-splitter')).map((s) => {
      const el = s as HTMLElement;
      const r = el.getBoundingClientRect();
      return { className: el.className, id: el.id, w: r.width, h: r.height, top: r.top, left: r.left };
    });
  });
  console.log('   当前页面所有 Splitter:', JSON.stringify(splitterInfo, null, 2));

  const hSplitter = page.locator('.dsp-main-layout > .algo-splitter-horizontal, .algo-splitter-horizontal:not(.algo-sidebar-splitter)').first();
  const hBox = await hSplitter.boundingBox();
  if (hBox) {
    console.log('   ⬅️ 向左拖拽 120px 扩大代码终端 ...');
    await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(hBox.x + hBox.width / 2 - 120, hBox.y + hBox.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const mAfterLeft = await getCard2Metrics();
    console.log(`   向左拖后: Card 2 cardH=${mAfterLeft?.cardHeight} overflow=${mAfterLeft?.overflow}`);
    await shot('scaling_h_splitter_left.png');

    console.log('   ➡️ 向右拖拽 200px 扩大左侧沙盘 ...');
    const hBox2 = await hSplitter.boundingBox();
    if (hBox2) {
      await page.mouse.move(hBox2.x + hBox2.width / 2, hBox2.y + hBox2.height / 2);
      await page.mouse.down();
      await page.mouse.move(hBox2.x + hBox2.width / 2 + 200, hBox2.y + hBox2.height / 2, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(400);

      const mAfterRight = await getCard2Metrics();
      console.log(`   向右拖后: Card 2 cardH=${mAfterRight?.cardHeight} overflow=${mAfterRight?.overflow}`);
      await shot('scaling_h_splitter_right.png');
    }
  }

  await browser.close();

  console.log('\n================ 测试总结 ================');
  console.log(`发现潜在缺陷 (issues): ${issues.length}`);
  issues.forEach((iss, i) => {
    console.log(`  [Issue ${i + 1}] [${iss.type}] ${iss.desc}`);
  });
}

main().catch((err) => {
  console.error('测试异常失败:', err);
  process.exit(1);
});
