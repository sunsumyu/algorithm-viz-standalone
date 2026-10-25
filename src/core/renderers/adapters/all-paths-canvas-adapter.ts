/**
 * 二叉树的所有路径 (Binary Tree Paths · LeetCode 257) 拓扑画布与看板呈现适配器
 *
 * 遵循深模块架构：
 *   - 委托 TreeCanvasAdapter 进行二叉树拓扑绘制与焦点、路径高亮
 *   - 委托 RecursiveCallTraceAdapter 挂载 Stage 1 显式回溯调用栈
 *   - 为 Stage 2 纯函数参数流与 Stage 3 BFS 双队列提供暗色科技感看板呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { AllPathsStep, collectTreeValues } from './all-paths-step-compiler';

export function renderAllPathsCanvas(container: HTMLElement, step: AllPathsStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.current;
    let visitedNodes = step.visitedNodes;
    let highlightedNodes = step.secondaryHighlightedNodes || step.highlightedNodes || step.path;

    if (isDone) {
      if (current === null) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
      if (!highlightedNodes || highlightedNodes.length === 0) {
        highlightedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: highlightedNodes && highlightedNodes.length > 0 ? highlightedNodes : [],
      primaryColor: isDone ? '#fbbf24' : '#f59e0b',
      secondaryColor: '#10b981',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，路径集合为空</span>
      </div>
    `;
  }
}

export function renderAllPathsCustomMetrics(container: HTMLElement, step: AllPathsStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  // 1. 顶部 4 格关键指标
  const latestHarvested = step.metrics?.['最新收获路径'] as string | undefined;
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">考察节点</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.current != null ? `Node(${step.current})` : '—'}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前深度</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px;">${step.depth}</div>
    </div>
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">已收集路径</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px;">${step.allPaths.length} 条</div>
    </div>
    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">最新收获</div>
      <div style="font-size:12px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${latestHarvested || (step.allPaths.length > 0 ? step.allPaths[step.allPaths.length - 1] : '—')}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：根据 Stage 差异化呈现
  if (step.stageId === 'stage-1') {
    // Stage 1: 路径栈槽位展示 + 递归调用推演栈
    const stage1Box = document.createElement('div');
    stage1Box.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; overflow:hidden;';

    // 路径栈水平展示
    const pathStackCard = document.createElement('div');
    pathStackCard.style.cssText = 'flex-shrink:0; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; gap:6px;';
    pathStackCard.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
        <span>📚 动态路径栈 path (根 ➔ 当前节点)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">栈深度: ${step.path.length}</span>
      </div>
    `;

    const pathSlots = document.createElement('div');
    pathSlots.style.cssText = 'display:flex; flex-wrap:wrap; align-items:center; gap:6px; min-height:28px;';
    if (step.path.length === 0) {
      pathSlots.innerHTML = `<span style="color:#94a3b8; font-style:italic; font-size:11px;">(路径栈为空 [])</span>`;
    } else {
      step.path.forEach((val, idx) => {
        const isTop = idx === step.path.length - 1;
        const slot = document.createElement('div');
        const bg = isTop ? '#fef3c7' : '#f8fafc';
        const border = isTop ? '#f59e0b' : '#cbd5e1';
        const color = isTop ? '#b45309' : '#334155';
        slot.style.cssText = `display:flex; align-items:center; gap:4px; padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color}; transition:all 0.15s;`;
        slot.innerHTML = `<span>${val}</span>${isTop ? '<span style="font-size:9px; color:#d97706; font-weight:normal; margin-left:2px;">(栈顶)</span>' : ''}`;
        pathSlots.appendChild(slot);

        if (idx < step.path.length - 1) {
          const arrow = document.createElement('span');
          arrow.style.cssText = 'color:#94a3b8; font-weight:bold; font-size:10px;';
          arrow.textContent = '➔';
          pathSlots.appendChild(arrow);
        }
      });
    }
    pathStackCard.appendChild(pathSlots);
    stage1Box.appendChild(pathStackCard);

    // 递归推演栈
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌲 显式回溯 DFS 递归推演栈 (LC 257)',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
      stage1Box.appendChild(traceBox);
    }
    container.appendChild(stage1Box);
  } else if (step.stageId === 'stage-2') {
    // Stage 2: 纯函数不可变字符串参数流监控
    const stage2Box = document.createElement('div');
    stage2Box.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; overflow-y:auto;';

    stage2Box.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
        <span>🧵 纯函数不可变字符串传递 (参数隔离机制)</span>
        <span style="font-family:ui-monospace,monospace; color:#0284c7; font-size:10.5px;">天然隔离无回溯</span>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; gap:4px;">
        <span style="color:#64748b; font-size:10px; font-weight:600;">当前函数栈帧接收实参 path:</span>
        <span style="color:#0369a1; font-family:ui-monospace,monospace; font-size:12px; font-weight:800; word-break:break-all;">${step.currentPathStr || '—'}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
        <span style="color:#475569; font-size:10.5px; font-weight:700;">已收集完整路径集 paths:</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${step.allPaths.length === 0 
            ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(尚未到达叶子节点)</span>' 
            : step.allPaths.map((p, idx) => `<span style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:2px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700;">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage2Box);
  } else if (step.stageId === 'stage-3') {
    // Stage 3: BFS 双队列 (节点队列 + 路径队列)
    const stage3Box = document.createElement('div');
    stage3Box.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; overflow-y:auto;';

    const nodeQ = step.nodeQueueState || [];
    const pathQ = step.pathQueueState || [];

    stage3Box.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
        <span>📦 BFS 节点队列 nodeQueue (队首 ➔ 队尾)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">Size: ${nodeQ.length}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; min-height:26px; align-items:center;">
        ${nodeQ.length === 0 
          ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(队列为空)</span>' 
          : nodeQ.map((v, i) => {
              const bg = i === 0 ? '#fffbeb' : '#f8fafc';
              const border = i === 0 ? '#fde68a' : '#cbd5e1';
              const color = i === 0 ? '#b45309' : '#334155';
              return `<span style="padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color};">Node(${v})${i === 0 ? ' (首)' : ''}</span>`;
            }).join('')}
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569; margin-top:4px;">
        <span>🛤️ BFS 路径队列 pathQueue (同步对应)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">Size: ${pathQ.length}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; min-height:26px; align-items:center;">
        ${pathQ.length === 0 
          ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(队列为空)</span>' 
          : pathQ.map((p, i) => {
              const bg = i === 0 ? '#f0f9ff' : '#f8fafc';
              const border = i === 0 ? '#bae6fd' : '#cbd5e1';
              const color = i === 0 ? '#0284c7' : '#334155';
              return `<span style="padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:${i === 0 ? '800' : '600'}; background:${bg}; border:1px solid ${border}; color:${color};">"${p}"${i === 0 ? ' (首)' : ''}</span>`;
            }).join('')}
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px; border-top:1px solid #f1f5f9; pt-2;">
        <span style="color:#475569; font-size:10.5px; font-weight:700;">已收集路径集合 paths:</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${step.allPaths.length === 0 
            ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(尚未收获叶子路径)</span>' 
            : step.allPaths.map((p, idx) => `<span style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:2px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700;">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage3Box);
  }

  // 3. 当前操作动作与决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
  const summaryBox = document.createElement('div');
  summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
  summaryBox.innerHTML = `
    <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
    <div style="color:#64748b; font-size:11px;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

export class AllPathsCanvasAdapter {
  public static renderCanvas = renderAllPathsCanvas;
  public static renderCustomMetrics = renderAllPathsCustomMetrics;
}
