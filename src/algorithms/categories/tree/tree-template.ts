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
  .${p}v { padding: 1rem; color: #334155; max-width: 1400px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .${p}root { background: #f8fafc; min-height: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
  .${p}h { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 18px; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }
  .${p}title { font-size: 20px; font-weight: 800; margin: 0; color: #0f172a; }
  .${p}sub { font-size: 12px; color: #64748b; margin-top: 2px; }
  .${p}tip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 12px; font-size: 12px; color: #1e40af; font-weight: 500; }
  .${p}main { display: grid; grid-template-columns: 1fr 340px; gap: 1rem; }
  .${p}panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .${p}ph { background: #f8fafc; padding: 8px 14px; font-size: 12px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 6px; }
  .${p}tree { padding: 1rem; min-height: 280px; display: flex; align-items: center; justify-content: center; background: #ffffff; }
  .${p}stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; padding: 10px 14px; background: #ffffff; }
  .${p}stats > div { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; text-align: center; }
  .${p}sv { font-size: 18px; font-weight: 800; color: #0284c7; font-family: 'JetBrains Mono', monospace; }
  .${p}sl { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 2px; }
  .${p}ctrls { display: flex; gap: 6px; padding: 10px 14px; flex-wrap: wrap; background: #ffffff; align-items: center; }
  .${p}btn { background: #ffffff; border: 1px solid #cbd5e1; color: #334155; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
  .${p}btn:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; }
  .${p}btn:disabled { opacity: .4; cursor: not-allowed; }
  .${p}play { flex: 1; background: #0284c7; color: #ffffff; font-weight: 700; border: 1px solid #0284c7; min-width: 70px; }
  .${p}play:hover { background: #0369a1; }
  .${p}msg { text-align: center; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #475569; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .${p}msg.success { color: #059669; font-weight: 700; }
  .${p}msg.error { color: #dc2626; font-weight: 700; }
  .${p}log { padding: 8px 12px; max-height: 140px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; line-height: 1.6; background: #ffffff; color: #475569; }
  .${p}log div { color: #64748b; }
  .${p}log div.active { color: #0284c7; font-weight: 700; background: #eff6ff; border-radius: 4px; padding: 1px 4px; }
  .${p}ex { display: flex; gap: 6px; padding: 10px 14px; flex-wrap: wrap; background: #ffffff; }
  .${p}ex-btn { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer; transition: all .15s; }
  .${p}ex-btn:hover { background: #e2e8f0; border-color: #94a3b8; color: #0f172a; }
  .${p}inp { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; color: #0f172a; font-family: 'JetBrains Mono', monospace; font-size: 12px; width: 100px; outline: none; }
  .${p}inp:focus { border-color: #0284c7; box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15); }
  @media (max-width:1100px){.${p}main{grid-template-columns:1fr}}
</style>
<div style="position:relative;min-height:calc(100vh - 3rem)"><div class="${p}root">
<div class="${p}h"><div><h1 class="${p}title">${opts.icon} ${opts.title}</h1><div class="${p}sub">${opts.subtitle}</div></div><div class="${p}tip">${opts.tip}</div></div>
<div class="${p}main"><div style="display:flex;flex-direction:column;gap:.75rem">
<div class="${p}panel"><div class="${p}ph">🌳 二叉树结构沙盘</div><div id="${p}tree" class="${p}tree"></div><div id="${p}msg" class="${p}msg">点击播放或单步步进开始观察树结构变化</div></div>
<div class="${p}panel"><div class="${p}ph">📊 状态指标监视器</div><div class="${p}stats"><div><div class="${p}sv" id="${p}cur">-</div><div class="${p}sl">当前节点</div></div><div><div class="${p}sv" id="${p}depth">0</div><div class="${p}sl">递归深度</div></div>${stats.map(s => `<div><div class="${p}sv" id="${p}${s.id}">-</div><div class="${p}sl">${s.label}</div></div>`).join('')}<div><div class="${p}sv" id="${p}result">?</div><div class="${p}sl">计算结果</div></div></div></div>
<div class="${p}panel"><div class="${p}ph">📋 执行日志</div><div id="${p}log" class="${p}log"></div></div>
</div><div style="display:flex;flex-direction:column">
<div class="${p}panel" style="flex:1"><div class="${p}ph">💻 代码调试</div><div data-code-panel style="flex:1;min-height:260px;overflow:hidden"></div></div>
<div class="${p}panel" style="margin-top:.75rem"><div class="${p}ph">⚙️ 步进控制</div><div class="${p}ctrls"><button id="step-reset" class="${p}btn" title="重置"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button><button id="step-prev" class="${p}btn" title="上一步"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg></button><button id="step-play" class="${p}btn ${p}play">播放</button><button id="step-next" class="${p}btn" title="下一步"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></button></div>
<div style="padding:0 .8rem .6rem"><span style="font-size:.78rem;color:#64748b" id="step-counter">步骤: 0 / 0</span><input type="range" id="step-speed" min="200" max="2000" value="900" step="100" style="width:100%;margin-top:.4rem;accent-color:#0284c7"><div style="text-align:center;font-size:.72rem;color:#64748b">速度: <span id="step-speed-label">0.9s</span></div></div></div>
<div class="${p}panel" style="margin-top:.75rem"><div class="${p}ph">📌 典型用例</div><div class="${p}ex">${opts.exampleButtons ?? ''}</div></div>
${opts.extraPanels ?? ''}
</div></div></div></div>`;
}

import { TreeNode } from '../../../core/renderers/tree-svg';

export { renderTreeSVG } from '../../../core/renderers/tree-svg';
export type { TreeNode } from '../../../core/renderers/tree-svg';

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
