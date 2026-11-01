/**
 * 生成《algorithm-viz-standalone 运行时架构全景图》SVG。
 * 视觉风格对齐参考图：zinc 暗色系 + 分层子图标题栏 + 带标注正交连线 + 圆柱体存储节点。
 * 运行：npx vite-node scripts/generate-architecture-diagram.ts
 * 产物：docs/architecture-diagram.svg
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ---------- 设计令牌（zinc 暗色系，与参考图一致） ----------
const BG = '#18181B';
const FG = '#F4F4F5';
const LINE = '#71717A';
const MUTED = '#A1A1AA';
const SURFACE = '#27272A';
const BORDER = '#3F3F46';

// ---------- 文本宽度估算（13px 节点 / 11px 边标注 / 12px 子图标题） ----------
function tw(text: string, fs: number): number {
  let w = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x1f000 || (cp >= 0x2190 && cp <= 0x2bff) || cp === 0xfe0f || cp === 0x2b50) w += fs * 1.25;
    else if ((cp >= 0x2e80 && cp <= 0x9fff) || (cp >= 0xff00 && cp <= 0xffef) || cp === 0x3000) w += fs;
    else if (cp === 0x20) w += fs * 0.3;
    else w += fs * 0.62;
  }
  return w;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- 画布 ----------
const W = 2160;
const H = 1205;
const parts: string[] = [];

// ---------- 子图 ----------
interface SubgraphDef { id: string; label: string; x: number; y: number; w: number; h: number }
function subgraph(s: SubgraphDef): void {
  parts.push(`<g class="subgraph" data-id="${s.id}" data-label="${esc(s.label)}">`);
  parts.push(`  <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="0" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>`);
  parts.push(`  <rect x="${s.x}" y="${s.y}" width="${s.w}" height="28" rx="0" fill="#1F1F23" stroke="${BORDER}" stroke-width="1"/>`);
  parts.push(`  <text x="${s.x + 12}" y="${s.y + 14}" font-size="12" font-weight="600" fill="${MUTED}" dy="4.2">${esc(s.label)}</text>`);
  parts.push(`</g>`);
}

// ---------- 节点 ----------
interface NodeDef {
  id: string; x: number; y: number; w: number; lines: string[]; shape?: 'rect' | 'cylinder';
}
function nodeText(x: number, y: number, w: number, lines: string[]): string {
  const fs = 13, lh = 16.9;
  const cy = y + (lines.length * lh + 20) / 2;
  const firstDy = -((lines.length - 1) * lh) / 2 + 4.55;
  const tspans = lines
    .map((l, i) => `<tspan x="${x + w / 2}" dy="${i === 0 ? firstDy : lh}">${esc(l)}</tspan>`)
    .join('');
  return `<text x="${x + w / 2}" y="${cy}" text-anchor="middle" font-size="${fs}" font-weight="500" fill="${FG}">${tspans}</text>`;
}
function node(n: NodeDef): void {
  const h = n.lines.length * 16.9 + 20;
  if (n.shape === 'cylinder') {
    const ry = 7;
    parts.push(`<g class="node" data-id="${n.id}" data-shape="cylinder">`);
    parts.push(`  <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${h}" fill="${SURFACE}" stroke="none"/>`);
    parts.push(`  <line x1="${n.x}" y1="${n.y}" x2="${n.x}" y2="${n.y + h}" stroke="${BORDER}" stroke-width="0.75"/>`);
    parts.push(`  <line x1="${n.x + n.w}" y1="${n.y}" x2="${n.x + n.w}" y2="${n.y + h}" stroke="${BORDER}" stroke-width="0.75"/>`);
    parts.push(`  <ellipse cx="${n.x + n.w / 2}" cy="${n.y + h}" rx="${n.w / 2}" ry="${ry}" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>`);
    parts.push(`  <ellipse cx="${n.x + n.w / 2}" cy="${n.y}" rx="${n.w / 2}" ry="${ry}" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>`);
    parts.push(`  ${nodeText(n.x, n.y, n.w, n.lines)}`);
    parts.push(`</g>`);
  } else {
    parts.push(`<g class="node" data-id="${n.id}" data-shape="rectangle">`);
    parts.push(`  <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${h}" rx="0" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>`);
    parts.push(`  ${nodeText(n.x, n.y, n.w, n.lines)}`);
    parts.push(`</g>`);
  }
}

// ---------- 连线与标注 ----------
type EdgeStyle = 'plain' | 'thick' | 'dotted';
interface EdgeDef {
  points: Array<[number, number]>;
  label?: string;
  labelAt?: [number, number];
  style?: EdgeStyle;
  both?: boolean;
}
function edge(e: EdgeDef): void {
  const pts = e.points.map((p) => `${p[0]},${p[1]}`).join(' ');
  const sw = e.style === 'thick' ? 2 : 1;
  const dash = e.style === 'dotted' ? ' stroke-dasharray="4 4"' : '';
  const start = e.both ? ' marker-start="url(#arrowhead-start)"' : '';
  parts.push(
    `<polyline class="edge" points="${pts}" fill="none" stroke="${LINE}" stroke-width="${sw}"${dash}${start} marker-end="url(#arrowhead)"/>`,
  );
  if (e.label && e.labelAt) {
    const [lx, ly] = e.labelAt;
    const w = tw(e.label, 11) + 18;
    parts.push(`<g class="edge-label">`);
    parts.push(`  <rect x="${lx - w / 2}" y="${ly - 15}" width="${w}" height="30" rx="2" fill="${BG}" stroke="#2D2D31" stroke-width="1"/>`);
    parts.push(`  <text x="${lx}" y="${ly}" text-anchor="middle" font-size="11" font-weight="400" fill="${MUTED}" dy="3.85">${esc(e.label)}</text>`);
    parts.push(`</g>`);
  }
}

// ======================================================================
// 1. 子图层（先画，位于最底层）
// ======================================================================
subgraph({ id: 'S_SHELL', label: '【入口层 / 桌面壳】', x: 270, y: 40, w: 884, h: 122 });
subgraph({ id: 'S_REG', label: '【目录与注册层 / 单一事实来源】', x: 60, y: 252, w: 1320, h: 182 });
subgraph({ id: 'S_FAM', label: '【领域编译器族群 / 适配器军团】', x: 1420, y: 252, w: 612, h: 182 });
subgraph({ id: 'S_ENG', label: '【运行时调度面 / 播放引擎】', x: 60, y: 524, w: 1320, h: 182 });
subgraph({ id: 'S_CARDS', label: '【Card 1-4 表现层 / 黄金四卡】', x: 60, y: 796, w: 1320, h: 182 });
subgraph({ id: 'S_SEC', label: '【安全与授权底座】', x: 1420, y: 796, w: 700, h: 182 });
subgraph({ id: 'S_STORE', label: '【持久化底座 / 本地账号库】', x: 1420, y: 1018, w: 700, h: 147 });

// ======================================================================
// 2. 连线层（子图之上、节点之下）
// ======================================================================
// 主流程：插件点击卡片 → ViewMountEngine（左侧外环绕通道）
edge({
  points: [[414, 162], [414, 207], [24, 207], [24, 595], [60, 595]],
  label: '点击算法卡片 · showAlgorithm(id)', labelAt: [240, 207], style: 'thick', both: true,
});
// ViewMountEngine ⇄ 注册层（返回 manifest）
edge({
  points: [[296, 568], [296, 434]],
  label: 'resolve(id) ⇄ manifest (template+Visualizer)', labelAt: [450, 479], style: 'thick', both: true,
});
// 注册层内部
edge({
  points: [[556, 323], [904, 323]],
  label: '首屏播种 586+ metadata', labelAt: [730, 323],
});
edge({
  points: [[930, 350], [930, 365], [296, 365], [296, 380]],
  label: 'resolve 未命中 → 按需动态 import', labelAt: [613, 365],
});
edge({ points: [[516, 399], [596, 399]] });
edge({
  points: [[1240, 380], [1240, 350]],
  label: 'registerDeclarativeAlgorithm(manifest)', labelAt: [1230, 365],
});
// 调度面内部
edge({ points: [[516, 595], [556, 595]] });
edge({
  points: [[900, 622], [900, 652]],
  label: 'buildSteps() → normalize()', labelAt: [1030, 637],
});
edge({ points: [[796, 671], [776, 671]] });
// 族群 → 调度面 / 表现层
edge({
  points: [[1436, 323], [1380, 323], [1380, 479], [816, 479], [816, 568]],
  label: 'spec.buildSteps 委托族群推演编译', labelAt: [1090, 479], style: 'thick',
});
edge({
  points: [[1718, 418], [1718, 727], [1340, 727], [1340, 796]],
  label: 'renderCanvas · 领域画布绘制 (SVG/Canvas/3D)', labelAt: [1545, 727], style: 'thick',
});
// 播放引擎 → 四卡
edge({
  points: [[241, 690], [241, 796]],
  label: 'renderCurrentStep() · 四卡同步', labelAt: [250, 748], style: 'thick', both: true,
});
// 安全链路（虚线）
edge({
  points: [[690, 162], [690, 207], [2136, 207], [2136, 860], [2120, 860]],
  label: 'checkAndEnforceAuthorization 启动阻断门禁', labelAt: [1400, 207], style: 'dotted',
});
edge({
  points: [[416, 622], [416, 751], [1420, 751], [1420, 796]],
  label: 'requireAlgorithmAccess · 扣次裁决', labelAt: [900, 751], style: 'dotted',
});
edge({
  points: [[1616, 924], [1616, 894]],
  label: 'invoke × 10 IPC 命令', labelAt: [1750, 909],
});
edge({
  points: [[1616, 962], [1616, 1000], [1770, 1000], [1770, 1056]],
  label: '落盘账号 / 会话 / 权益快照', labelAt: [1690, 1000], style: 'dotted',
});

// ======================================================================
// 3. 节点层（最上层）
// ======================================================================
node({ id: 'plugin', x: 286, y: 84, w: 256, lines: ['🧩 algorithm-viz 插件', '(侧边栏分类 · 卡片网格 · 搜索 · 关卡链)'] });
node({ id: 'main', x: 562, y: 84, w: 256, lines: ['🚀 main.ts 启动布防', '(安全守卫 · 水印 · 授权门禁 · 插件装配)'] });
node({ id: 'tauri', x: 838, y: 84, w: 300, lines: ['🖥️ Tauri 2 桌面壳', '(index.html 骨架 · 自定义标题栏 · 窗口控制)'] });

node({ id: 'catalog', x: 76, y: 296, w: 480, lines: ['🗂️ algorithm-catalog.generated.ts', '(586+ 算法首屏目录 · meta:sync 投影产物)'] });
node({ id: 'registry', x: 904, y: 296, w: 460, lines: ['🏛️ AlgorithmRegistry 注册中心', '(metadata 播种 · resolve 惰性解析)'] });
node({ id: 'loader', x: 76, y: 380, w: 440, lines: ['📦 AlgorithmLoader', '(import.meta.glob 按需分包动态 import)'] });
node({ id: 'renderers', x: 596, y: 380, w: 768, lines: ['📝 *-renderer.ts × 586 自注册', '(spec 声明元数据 · buildSteps · renderCanvas)'] });

node({ id: 'viewmount', x: 76, y: 568, w: 440, lines: ['🔌 ViewMountEngine', '(卸载旧实例 → 授权裁决 → 挂载视口)'] });
node({ id: 'dav', x: 556, y: 568, w: 520, lines: ['🎬 DeclarativeAlgorithmVisualizer', '(spec 编译 4 卡骨架 · buildSteps 管道)'] });
node({ id: 'playback', x: 76, y: 652, w: 330, lines: ['⏱️ PlaybackCoordinator', '(零 DOM 播放时钟状态机)'] });
node({ id: 'sync', x: 426, y: 652, w: 350, lines: ['🔗 StepExecutionSynchronizer', '(步骤→动作归一 · 四卡同步汇合)'] });
node({ id: 'usne', x: 796, y: 652, w: 540, lines: ['🩹 StepNormalizationEngine (USNE)', '(防画布断电探针 · 递归返回帧补全 · 幽灵帧剔除)'] });

node({ id: 'compilers', x: 1436, y: 296, w: 564, lines: ['⚙️ *-step-compiler.ts × 233', '(严格一行一步推演 · codeLine 行号绑定)'] });
node({ id: 'adapters', x: 1436, y: 380, w: 564, lines: ['🎨 *-canvas-adapter.ts × 301', '(SVG / Canvas / three.js 3D 领域绘制)'] });

node({ id: 'card1', x: 76, y: 840, w: 360, lines: ['🏔️ Card 1 拓扑沙盘 (60~70%)', '(renderCanvas · 推演树 / 3D 子视图)'] });
node({ id: 'card2', x: 456, y: 840, w: 320, lines: ['📊 Card 2 状态指标 (≤150px)', '(KPI 网格 · 实时决策解说)'] });
node({ id: 'card3', x: 796, y: 840, w: 300, lines: ['💻 Card 3 代码终端', '(四语言 1-based 行号联动)'] });
node({ id: 'card4', x: 1116, y: 840, w: 248, lines: ['📜 Card 4 执行日志流', '(ExecutionLogPresenter 唯一来源)'] });

node({ id: 'rust', x: 1436, y: 840, w: 460, lines: ['🗄️ Rust security 深模块', '(10 个 IPC 命令 · Ed25519 凭证 · PBKDF2)'] });
node({ id: 'auth', x: 1436, y: 924, w: 360, lines: ['🛡️ AuthorizationService', '(账号权益 ⊕ 离线激活码 归一)'] });
node({ id: 'guard', x: 1816, y: 924, w: 288, lines: ['💧 防盗水印守卫', '(可见水印 · 剪贴板盲水印 · 反调试)'] });

node({
  id: 'store', x: 1560, y: 1058, w: 420, shape: 'cylinder',
  lines: ['🔑 account_store 本地账号库', '(PBKDF2 + HKDF 机器指纹 · trial/paygo/lifetime)', '支撑：打开前扣次裁决 · 会话零化清理'],
});

// ======================================================================
// 4. 组装 SVG
// ======================================================================
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="--bg:${BG};--fg:${FG};--line:${LINE};--muted:${MUTED};--surface:${SURFACE};--border:${BORDER};background:${BG}">
<style>
  text { font-family: 'Inter', 'Segoe UI', system-ui, 'Microsoft YaHei', sans-serif; }
</style>
<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
    <polygon points="0 0, 8 2.5, 0 5" fill="${FG}" stroke="${FG}" stroke-width="0.75" stroke-linejoin="round"/>
  </marker>
  <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
    <polygon points="8 0, 0 2.5, 8 5" fill="${FG}" stroke="${FG}" stroke-width="0.75" stroke-linejoin="round"/>
  </marker>
</defs>
${parts.join('\n')}
</svg>
`;

const out = resolve(process.cwd(), 'docs/architecture-diagram.svg');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg, 'utf8');
console.log(`written: ${out} (${svg.length} bytes)`);
