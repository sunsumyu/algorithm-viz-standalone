/**
 * 树算法通用模板工厂
 * 生成统一的 HTML 模板和基础渲染逻辑
 */

export interface TreeTemplateOptions {
  prefix: string;           // CSS class prefix, e.g. 'md-'
  title: string;            // 算法标题
  subtitle: string;         // 副标题
  accentA: string;          // 主色, e.g. 'rgb(249, 226, 175)'
  accentB: string;          // 辅色
  tip: string;              // 提示文字
  icon: string;             // emoji
  extraStats?: { id: string; label: string }[];
  extraPanels?: string;     // 额外面板 HTML
  exampleButtons?: string;  // 示例按钮 HTML
  examplePanel?: string;    // 自定义输入面板
}

export function buildTreeTemplate(opts: TreeTemplateOptions): string {
  const p = opts.prefix;
  const stats = opts.extraStats ?? [];
  return `<style>
  .${p}v { padding:1.5rem; color:#cdd6f4; max-width:1400px; margin:0 auto; font-family:system-ui,sans-serif }
  .${p}root { background:radial-gradient(ellipse at 8% 6%,rgba(${opts.accentA},.3),transparent 55%),radial-gradient(ellipse at 92% 94%,rgba(${opts.accentB},.3),transparent 55%),linear-gradient(135deg,rgb(20,18,38),rgb(25,23,50),rgb(35,32,60)); min-height:100%; padding:1.5rem; border-radius:20px }
  .${p}h { background:rgba(20,18,38,.55); backdrop-filter:blur(18px); border-radius:16px; padding:1.25rem 1.5rem; margin-bottom:1rem; box-shadow:0 8px 32px rgba(0,0,0,.2); display:flex; justify-content:space-between; align-items:center }
  .${p}title { font-size:22px; font-weight:800; margin:0; background:linear-gradient(135deg,${opts.accentA},${opts.accentB}); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
  .${p}sub { font-size:.78rem; color:#6c7086 }
  .${p}tip { background:rgba(${opts.accentA},.1); border:1px solid rgba(${opts.accentA},.25); border-radius:10px; padding:.6rem .9rem; font-size:.78rem; color:${opts.accentA}; max-width:280px }
  .${p}main { display:grid; grid-template-columns:1fr 320px; gap:1rem }
  .${p}panel { background:rgba(20,18,38,.55); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,.35) }
  .${p}ph { background:rgba(25,24,42,.6); padding:.6rem .9rem; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:${opts.accentA}; border-bottom:1px solid rgba(255,255,255,.05) }
  .${p}tree { padding:1rem; min-height:260px; display:flex; align-items:center; justify-content:center }
  .${p}stats { display:grid; grid-template-columns:repeat(4,1fr); gap:.5rem; padding:.8rem }
  .${p}stats div { text-align:center } .${p}sv { font-size:1.2rem; font-weight:800; color:${opts.accentA} } .${p}sl { font-size:.65rem; color:#6c7086; text-transform:uppercase; letter-spacing:.05em }
  .${p}ctrls { display:flex; gap:.3rem; padding:.8rem; flex-wrap:wrap }
  .${p}btn { background:rgba(49,50,68,.6); border:1px solid rgba(255,255,255,.1); color:#cdd6f4; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:8px; flex-shrink:0 }
  .${p}btn:hover:not(:disabled) { background:rgba(49,50,68,.8) } .${p}btn:disabled { opacity:.4; cursor:not-allowed }
  .${p}play { flex:1; background:linear-gradient(135deg,${opts.accentA},${opts.accentB}); color:#111; font-weight:600; min-width:70px }
  .${p}msg { text-align:center; padding:.65rem; font-size:.88rem; color:#9399b2; border-top:1px solid rgba(255,255,255,.05) }
  .${p}msg.success { color:${opts.accentB}; font-weight:600 } .${p}msg.error { color:#f38ba8; font-weight:600 }
  .${p}log { padding:.6rem .8rem; max-height:150px; overflow-y:auto; font-family:ui-monospace,monospace; font-size:.75rem; line-height:1.6 }
  .${p}log div { color:#6c7086 } .${p}log div.active { color:${opts.accentA}; font-weight:600 }
  .${p}ex { display:flex; gap:.4rem; padding:.8rem; flex-wrap:wrap }
  .${p}ex-btn { background:rgba(49,50,68,.5); border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:.3rem .7rem; font-size:.72rem; color:#cdd6f4; cursor:pointer; transition:all .2s }
  .${p}ex-btn:hover { background:rgba(49,50,68,.8); border-color:${opts.accentA} }
  .${p}inp { background:rgba(49,50,68,.6); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:.4rem .6rem; color:#cdd6f4; font-family:ui-monospace,monospace; font-size:.85rem; width:80px; outline:none }
  .${p}inp:focus { border-color:${opts.accentA} }
  @media (max-width:1100px){.${p}main{grid-template-columns:1fr}}
</style>
<div style="position:relative;min-height:calc(100vh - 3rem)"><div class="${p}root">
<div class="${p}h"><div style="display:flex;align-items:center;gap:1rem"><button id="btn-back" style="background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:8px;cursor:pointer;width:36px;height:36px;color:#cdd6f4"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><div><h1 class="${p}title">${opts.icon} ${opts.title}</h1><div class="${p}sub">${opts.subtitle}</div></div></div><div class="${p}tip">${opts.tip}</div></div>
<div class="${p}main"><div style="display:flex;flex-direction:column;gap:.75rem">
<div class="${p}panel"><div class="${p}ph">🌳 二叉树</div><div id="${p}tree" class="${p}tree"></div><div id="${p}msg" class="${p}msg">点击演示查看过程</div></div>
<div class="${p}panel"><div class="${p}ph">📊 状态</div><div class="${p}stats"><div><div class="${p}sv" id="${p}cur">-</div><div class="${p}sl">当前</div></div><div><div class="${p}sv" id="${p}depth">0</div><div class="${p}sl">深度</div></div>${stats.map(s => `<div><div class="${p}sv" id="${p}${s.id}">-</div><div class="${p}sl">${s.label}</div></div>`).join('')}<div><div class="${p}sv" id="${p}result">?</div><div class="${p}sl">结果</div></div></div></div>
<div class="${p}panel"><div class="${p}ph">📋 日志</div><div id="${p}log" class="${p}log"></div></div>
</div><div style="display:flex;flex-direction:column">
<div class="${p}panel" style="flex:1"><div class="${p}ph">代码</div><div data-code-panel style="flex:1;min-height:260px;overflow:hidden"></div></div>
<div class="${p}panel" style="margin-top:.75rem"><div class="${p}ph">⚙️ 控制</div><div class="${p}ctrls"><button id="step-reset" class="${p}btn" title="重置"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button><button id="step-prev" class="${p}btn" title="上一步"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg></button><button id="step-play" class="${p}btn ${p}play">播放</button><button id="step-next" class="${p}btn" title="下一步"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></button></div>
<div style="padding:0 .8rem .6rem"><span style="font-size:.78rem;color:#6c7086" id="step-counter">步骤: 0 / 0</span><input type="range" id="step-speed" min="200" max="2000" value="900" step="100" style="width:100%;margin-top:.4rem;accent-color:${opts.accentA}"><div style="text-align:center;font-size:.72rem;color:#585b70">速度: <span id="step-speed-label">0.9s</span></div></div></div>
<div class="${p}panel" style="margin-top:.75rem"><div class="${p}ph">📌 示例</div><div class="${p}ex">${opts.exampleButtons ?? ''}</div></div>
${opts.extraPanels ?? ''}
</div></div></div></div>`;
}

/**
 * 树节点构建
 */
export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function buildTreeFromArr(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  const root: TreeNode = { val: arr[0]!, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

/**
 * 通用 SVG 树渲染
 */
export function renderTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  highlight: Set<number>,
  highlightColor: string,
  secondaryHighlight?: Set<number>,
  secondaryColor?: string,
  labels?: Map<number, string>,
): void {
  if (!root) { container.innerHTML = '<span style="color:#6c7086">空树</span>'; return; }
  container.innerHTML = '';
  const lh = 44;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '280');
  svg.setAttribute('viewBox', '0 0 600 280');

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isH = highlight.has(node.val);
    const isS = secondaryHighlight?.has(node.val);
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', '18');
    let fill = '#45475a', stroke = '#6c7086';
    if (isH) { fill = highlightColor; stroke = highlightColor; }
    else if (isS && secondaryColor) { fill = secondaryColor; stroke = secondaryColor; }
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', '2');
    svg.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x)); t.setAttribute('y', String(y + 5));
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', isH || isS ? '#1e1e2e' : '#cdd6f4');
    t.setAttribute('font-size', '12'); t.setAttribute('font-weight', 'bold');
    t.textContent = String(node.val);
    svg.appendChild(t);
    const label = labels?.get(node.val);
    if (label) {
      const lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', String(x)); lb.setAttribute('y', String(y - 22));
      lb.setAttribute('text-anchor', 'middle'); lb.setAttribute('fill', highlightColor);
      lb.setAttribute('font-size', '10'); lb.textContent = label;
      svg.appendChild(lb);
    }
  };
  draw(root, 300, 30, 120);
  container.appendChild(svg);
}

import { StepBase } from '../../../core/step-visualizer';

/**
 * BST 算法可视化的通用步进类型
 */
export interface BstStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  highlight: Set<number>;
  color: string;
  log: string;
  result?: string | number;
}

/**
 * 通用日志渲染
 */
export function renderLog(container: HTMLElement, logs: string[], activeIdx: number): void {
  container.innerHTML = '';
  logs.forEach((log, i) => {
    const line = document.createElement('div');
    if (i === activeIdx) line.className = 'active';
    line.textContent = `${String(i + 1).padStart(2, '0')}. ${log}`;
    container.appendChild(line);
  });
  container.scrollTop = container.scrollHeight;
}
