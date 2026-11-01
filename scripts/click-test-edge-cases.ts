/**
 * 边界用例点击测试：
 *  1. cpp 箭头成员访问悬停 (root->left 的 left token -> 期望左孩子语义)
 *  2. python self.prev / root.left 成员链悬停
 *  3. 1024x768 临界视口（lg 断点边界 + splitter 垂直断点逻辑）
 */

import { chromium } from 'playwright';
import fs from 'fs';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-click-test';
const BASE_URL = 'http://localhost:23300';

interface Finding {
  area: string;
  severity: 'P0' | 'P1' | 'P2';
  desc: string;
  evidence: string;
}
const findings: Finding[] = [];
const pageErrors: string[] = [];

function addFinding(area: string, severity: Finding['severity'], desc: string, evidence: string): void {
  findings.push({ area, severity, desc, evidence });
  console.log(`   🚨 [${severity}] ${area}: ${desc} | ${evidence.slice(0, 110)}`);
}

async function main(): Promise<void> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const browser = await chromium.launch({ executablePath: candidates.find((c) => fs.existsSync(c)), headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await context.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      btoa(JSON.stringify({ v: 1, uid: 'edge', exp: 0, user_id: 'edge', tier: 3 })) + '.s'
    );
  });
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 250)));

  const hoverTip = async (loc: import('playwright').Locator) => {
    await loc.hover();
    await page.waitForTimeout(420);
    return page.evaluate(() => {
      const t = document.getElementById('algo-debug-hover-tooltip');
      return {
        visible: t ? t.style.display !== 'none' && t.style.opacity !== '0' : false,
        text: (t?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140),
      };
    });
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.evaluate(async () => {
      await (window as any).viewMountEngine.showAlgorithm('valid-bst');
    });
    await page.waitForSelector('#btn-step-next', { timeout: 15000 });
    await page.waitForTimeout(900);

    // ============ T1: cpp 箭头成员悬停 ============
    console.log('🖱️ T1: cpp root->left 成员悬停 ...');
    await page.click('#code-lang-tabs [data-lang="cpp"]');
    await page.waitForTimeout(500);
    // 步进到包含 root->left 的行
    let reached = false;
    for (let i = 0; i < 10; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(30);
      const raw = await page.evaluate(() => (document.querySelector('.code-line.active') as HTMLElement)?.dataset?.raw || '');
      if (raw.includes('root->left')) {
        reached = true;
        break;
      }
    }
    console.log(`   到达 root->left 行: ${reached}`);
    if (reached) {
      const leftTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^left$/ }).first();
      if (await leftTok.count()) {
        const tip = await hoverTip(leftTok);
        console.log(`   hover root->left 的 left -> visible=${tip.visible} text="${tip.text}"`);
        if (!tip.visible) {
          addFinding('cpp箭头悬停', 'P1', '悬停 root->left 的 left token tooltip 未显示', '');
        } else if (!tip.text.includes('左孩子') && !tip.text.includes('left')) {
          addFinding('cpp箭头悬停', 'P2', 'cpp 箭头成员 tooltip 未包含左孩子语义', tip.text);
        } else {
          console.log('   ✅ cpp 箭头成员链解析正确');
        }
      } else {
        console.log('   （活跃行无 left token）');
      }
      await page.screenshot({ path: `${ARTIFACT_DIR}/edge_cpp_arrow_hover.png` });
      await page.mouse.move(10, 10);
      await page.waitForTimeout(250);
    }

    // ============ T2: python 成员链悬停 ============
    console.log('🖱️ T2: python root.left / self.prev 成员悬停 ...');
    await page.click('#code-lang-tabs [data-lang="python"]');
    await page.waitForTimeout(500);
    // 回退到起点再步进到 root.left 行
    for (let i = 0; i < 20; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-prev') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-prev');
      await page.waitForTimeout(10);
    }
    reached = false;
    for (let i = 0; i < 10; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(30);
      const raw = await page.evaluate(() => (document.querySelector('.code-line.active') as HTMLElement)?.dataset?.raw || '');
      if (raw.includes('root.left')) {
        reached = true;
        break;
      }
    }
    console.log(`   到达 root.left 行: ${reached}`);
    if (reached) {
      const leftTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^left$/ }).first();
      if (await leftTok.count()) {
        const tip = await hoverTip(leftTok);
        console.log(`   hover root.left 的 left -> visible=${tip.visible} text="${tip.text}"`);
        if (!tip.visible) {
          addFinding('python成员悬停', 'P1', '悬停 root.left 的 left token tooltip 未显示', '');
        } else if (!tip.text.includes('左孩子') && !tip.text.includes('left')) {
          addFinding('python成员悬停', 'P2', 'python 成员链 tooltip 未包含左孩子语义', tip.text);
        } else {
          console.log('   ✅ python 成员链解析正确');
        }
        await page.mouse.move(10, 10);
        await page.waitForTimeout(250);
      }
    }
    // self.prev 链（python L10: if self.prev is not None and root.val <= self.prev.val:）
    for (let i = 0; i < 6; i++) {
      const raw = await page.evaluate(() => (document.querySelector('.code-line.active') as HTMLElement)?.dataset?.raw || '');
      if (raw.includes('self.prev')) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(30);
    }
    const pyRaw = await page.evaluate(() => (document.querySelector('.code-line.active') as HTMLElement)?.dataset?.raw || '');
    if (pyRaw.includes('self.prev')) {
      const valTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^val$/ }).last();
      if (await valTok.count()) {
        const tip2 = await hoverTip(valTok);
        console.log(`   hover self.prev.val 的 val -> visible=${tip2.visible} text="${tip2.text}"`);
        if (!tip2.visible) {
          addFinding('python成员悬停', 'P2', '悬停 self.prev.val 的 val tooltip 未显示', pyRaw);
        } else if (tip2.text.includes('undefined')) {
          addFinding('python成员悬停', 'P2', 'self.prev.val tooltip 含 undefined', tip2.text);
        }
      }
    }

    // ============ T3: 1024x768 临界视口 ============
    console.log('📏 T3: 1024x768 临界断点 ...');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(700);
    const bp = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      isLgActive: window.innerWidth >= 1024,
      bodyScrollW: document.body.scrollWidth,
      viewportW: document.documentElement.clientWidth,
      hasHorizOverflow: document.body.scrollWidth > window.innerWidth + 2,
    }));
    console.log(`   lg激活=${bp.isLgActive} bodyScrollW=${bp.bodyScrollW} 水平溢出=${bp.hasHorizOverflow}`);
    if (bp.hasHorizOverflow) {
      addFinding('临界视口', 'P2', `1024 宽度下出现水平溢出 (${bp.bodyScrollW} > ${bp.innerWidth})`, '');
    }
    await page.screenshot({ path: `${ARTIFACT_DIR}/edge_1024_layout.png` });

    // 1024 下拖拽垂直 splitter 检查钳制
    const vSplits = page.locator('.algo-splitter-vertical');
    const vCount = await vSplits.count();
    for (let si = 0; si < vCount; si++) {
      const box = await vSplits.nth(si).boundingBox();
      if (!box) continue;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 200, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(400);
      const st = await page.evaluate(() => {
        const probe = (el: HTMLElement | null) => (el ? { h: el.offsetHeight, ov: el.scrollHeight - el.clientHeight } : null);
        return {
          monitor: probe(document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null),
          log: probe(document.querySelector('.dsp-log-card') as HTMLElement | null),
        };
      });
      console.log(`   1024 shrink splitter#${si}: monitor=${JSON.stringify(st.monitor)} log=${JSON.stringify(st.log)}`);
      if ((st.monitor?.ov || 0) > 6 || (st.log?.ov || 0) > 6) {
        addFinding('临界视口', 'P1', `1024 下拖拽后卡片内容溢出: monitor=${st.monitor?.ov} log=${st.log?.ov}`, '');
      }
    }
    await page.screenshot({ path: `${ARTIFACT_DIR}/edge_1024_shrunk.png` });

    // 回到 1920 检查恢复
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(700);
    const recovered = await page.evaluate(() => ({
      hasHorizOverflow: document.body.scrollWidth > window.innerWidth + 2,
      monitorOv: (() => {
        const m = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
        return m ? m.scrollHeight - m.clientHeight : 0;
      })(),
    }));
    console.log(`   回到 1920: 溢出=${recovered.hasHorizOverflow} monitorOv=${recovered.monitorOv}`);
    await page.screenshot({ path: `${ARTIFACT_DIR}/edge_back_1920.png` });
  } finally {
    await browser.close();
  }

  console.log('\n================ 边界用例汇总 ================');
  console.log(`pageerror: ${pageErrors.length}`);
  pageErrors.slice(0, 6).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 200)}`));
  console.log(`findings: ${findings.length}`);
  findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.area}] ${f.desc} | ${f.evidence.slice(0, 100)}`));
  process.exit(findings.length > 0 || pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error('测试崩溃:', e);
  process.exit(1);
});
