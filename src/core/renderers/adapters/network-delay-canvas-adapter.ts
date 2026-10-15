/**
 * 网络延迟时间拓扑画布与优先队列监控适配器 (NetworkDelayCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 拓扑沙盘渲染、Min-Heap 动态管道动画、数组状态对齐
 */

import { visualState } from '../visual-state-tokens';
import type { NetworkDelayStep } from '../../../algorithms/categories/graph/network-delay-time-step-compiler';

export function renderNetworkDelayCanvas(container: HTMLElement, step: NetworkDelayStep): void {
  const n = step.distList.length - 1;
  const is4 = n === 4;

  const nodeCoords: Record<number, { x: number; y: number }> = is4
    ? {
        2: { x: 60, y: 90 },
        1: { x: 160, y: 45 },
        3: { x: 160, y: 135 },
        4: { x: 260, y: 90 },
      }
    : {
        1: { x: 60, y: 90 },
        2: { x: 160, y: 90 },
        3: { x: 260, y: 90 },
      };

  const edges: Array<[number, number, number]> = (step.times && step.times.length > 0)
    ? step.times
    : (is4
        ? [
            [2, 1, 1],
            [2, 3, 1],
            [3, 4, 1],
          ]
        : [[1, 2, 1]]);

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 340 190" style="width:100%; height:100%; max-height:240px; overflow:visible;">
    <defs>
      <filter id="delay-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#0f172a" flood-opacity="0.08" />
      </filter>
      <!-- 1. 未走过的未探索边 (灰色) -->
      <marker id="delay-arrow-base" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cbd5e1" />
      </marker>
      <!-- 2. 走过的最短路径树边 (科技蓝) -->
      <marker id="delay-arrow-tree" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
      </marker>
      <!-- 3. 走过且节点已接收锁定的最优路径 (深翡翠绿) -->
      <marker id="delay-arrow-tree-locked" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
      </marker>
      <!-- 4. 当前活跃正在考察的信道 (暖金橙) -->
      <marker id="delay-arrow-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
      </marker>
      <!-- 5. 当前活跃正在松弛生效的信道 (亮祖母绿) -->
      <marker id="delay-arrow-relaxed" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
      </marker>
    </defs>`;

  for (const [u, v, w] of edges) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const isAct = Boolean(step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v);
    const isRelaxed = isAct && step.status === 'relax';

    const distU = step.distList[u];
    const distV = step.distList[v];
    const isVisV = Boolean(step.visitedList && step.visitedList[v]);

    const isTreeEdge = distU !== Infinity && distV !== Infinity && distU + w === distV && distV > 0;

    let strokeColor = '#cbd5e1';
    let strokeWidth = 1.6;
    let marker = 'url(#delay-arrow-base)';
    let badgeBg = '#ffffff';
    let badgeBorder = '#cbd5e1';
    let badgeText = '#64748b';

    if (isAct) {
      if (isRelaxed) {
        strokeColor = '#10b981';
        strokeWidth = 3.6;
        marker = 'url(#delay-arrow-relaxed)';
        badgeBg = '#ecfdf5';
        badgeBorder = '#10b981';
        badgeText = '#047857';
      } else {
        strokeColor = '#f59e0b';
        strokeWidth = 3.4;
        marker = 'url(#delay-arrow-active)';
        badgeBg = '#fffbeb';
        badgeBorder = '#f59e0b';
        badgeText = '#b45309';
      }
    } else if (isTreeEdge) {
      if (isVisV) {
        strokeColor = '#059669';
        strokeWidth = 2.6;
        marker = 'url(#delay-arrow-tree-locked)';
        badgeBg = '#ecfdf5';
        badgeBorder = '#059669';
        badgeText = '#047857';
      } else {
        strokeColor = '#0284c7';
        strokeWidth = 2.6;
        marker = 'url(#delay-arrow-tree)';
        badgeBg = '#f0f9ff';
        badgeBorder = '#0284c7';
        badgeText = '#0369a1';
      }
    }

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 + (is4 && u === 2 && v === 3 ? 9 : is4 && u === 2 && v === 1 ? -9 : -4);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" marker-end="${marker}" />`;
    svgHtml += `<rect x="${mx - 14}" y="${my - 8}" width="28" height="16" rx="4" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.2" filter="url(#delay-shadow)" />`;
    svgHtml += `<text x="${mx}" y="${my + 3.5}" fill="${badgeText}" font-size="9" font-weight="800" font-family="'JetBrains Mono', Consolas, monospace" text-anchor="middle">${w}ms</text>`;
  }

  const nodes = is4 ? [1, 2, 3, 4] : [1, 2, 3];
  nodes.forEach((u) => {
    const p = nodeCoords[u];
    if (!p) return;

    const isCur = step.curNode === u && step.status !== 'done';
    const isVis = step.visitedList[u];
    const dVal = step.distList[u];
    const isInf = dVal === Infinity;
    const dStr = isInf ? '∞' : `${dVal}ms`;
    const inPq = step.pqSnapshot.some((item) => item.u === u);

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    let badgeBg = '#f8fafc';
    let badgeBorder = '#cbd5e1';
    let badgeText = '#64748b';

    const isPruneNode = isCur && step.pqAction === 'prune';

    if (isPruneNode) {
      fill = '#fef2f2';
      stroke = '#ef4444';
      badgeBg = '#fee2e2';
      badgeBorder = '#ef4444';
      badgeText = '#b91c1c';
    } else if (isCur) {
      fill = '#fffbeb';
      stroke = '#f59e0b';
      badgeBg = '#fef3c7';
      badgeBorder = '#f59e0b';
      badgeText = '#b45309';
    } else if (isInf && step.status === 'done') {
      fill = '#fee2e2';
      stroke = '#ef4444';
      badgeBg = '#fee2e2';
      badgeBorder = '#ef4444';
      badgeText = '#b91c1c';
    } else if (isVis) {
      fill = '#ecfdf5';
      stroke = '#10b981';
      badgeBg = '#d1fae5';
      badgeBorder = '#10b981';
      badgeText = '#047857';
    } else if (!isInf) {
      fill = '#f0f9ff';
      stroke = '#38bdf8';
      badgeBg = '#e0f2fe';
      badgeBorder = '#38bdf8';
      badgeText = '#0284c7';
    }

    // 若当前节点正在优先队列中排队，叠加高亮光晕与徽章
    if (inPq && !isCur) {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="27" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3" opacity="0.9" />`;
      svgHtml += `<rect x="${p.x + 8}" y="${p.y - 25}" width="20" height="12" rx="3" fill="#0284c7" />`;
      svgHtml += `<text x="${p.x + 18}" y="${p.y - 16}" fill="#ffffff" font-size="7.5" font-weight="800" text-anchor="middle">PQ</text>`;
    } else if (isPruneNode) {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="27" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.9" />`;
    } else if (isCur) {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="27" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2" opacity="0.9" />`;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" filter="url(#delay-shadow)" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4.5}" fill="#0f172a" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${u}</text>`;

    // 顶部节点 1 置于上方 y-36，其余节点置于下方 y+24，彻底规避重合
    const isTopNode = is4 && u === 1;
    const badgeW = isInf ? 40 : 48;
    const badgeH = 17;
    const badgeX = p.x - badgeW / 2;
    const badgeY = isTopNode ? p.y - 36 : p.y + 24;

    svgHtml += `<rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="8.5" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.2" filter="url(#delay-shadow)" />`;
    svgHtml += `<text x="${p.x}" y="${badgeY + 11.5}" fill="${badgeText}" font-size="9.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="700" text-anchor="middle">d:${dStr}</text>`;

    if (isPruneNode && step.lastPqItem) {
      const pruneBadgeW = 118;
      const pruneBadgeH = 17;
      const px = p.x - pruneBadgeW / 2;
      const py = isTopNode ? p.y + 24 : p.y - 42;
      svgHtml += `<g>
        <rect x="${px}" y="${py}" width="${pruneBadgeW}" height="${pruneBadgeH}" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" filter="url(#delay-shadow)" />
        <text x="${p.x}" y="${py + 11.5}" fill="#dc2626" font-size="8.5" font-weight="900" font-family="'JetBrains Mono', Consolas, monospace" text-anchor="middle">🚫 剪枝拦截: ${step.lastPqItem.d}ms &gt; ${dVal}ms</text>
      </g>`;
    }
  });

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
    </div>
  `;
}

export function renderNetworkDelayMetrics(container: HTMLElement, step: NetworkDelayStep): void {
  const n = step.distList.length - 1;
  const indices = Array.from({ length: n }, (_, i) => i + 1);

  // 1. 优先队列动作状态指示
  let actionBadge = `<span style="font-size:10px; color:#64748b; font-family:monospace; font-weight:600;">排队中: ${step.pqSnapshot.length}</span>`;
  if (step.pqAction === 'prune' && step.lastPqItem) {
    actionBadge = `<div style="display:inline-flex; align-items:center; gap:4px; padding:1px 7px; background:#fef2f2; border:1px solid #ef4444; border-radius:10px; font-size:10px; font-weight:800; color:#b91c1c;">✂️ 距离剪枝拦截: 丢弃 Node ${step.lastPqItem.u} (${step.lastPqItem.d}ms > ${step.distList[step.lastPqItem.u]}ms)</div>`;
  } else if (step.pqAction === 'push' && step.lastPqItem) {
    actionBadge = `<div style="display:inline-flex; align-items:center; gap:4px; padding:1px 7px; background:#fef3c7; border:1px solid #f59e0b; border-radius:10px; font-size:10px; font-weight:800; color:#b45309;">📥 入堆 (入队): Node ${step.lastPqItem.u} (${step.lastPqItem.d}ms)</div>`;
  } else if (step.pqAction === 'poll' && step.lastPqItem) {
    actionBadge = `<div style="display:inline-flex; align-items:center; gap:4px; padding:1px 7px; background:#fee2e2; border:1px solid #ef4444; border-radius:10px; font-size:10px; font-weight:800; color:#b91c1c;">📤 出堆 (出队): Node ${step.lastPqItem.u} (${step.lastPqItem.d}ms)</div>`;
  } else if (step.pqAction === 'check') {
    actionBadge = `<div style="display:inline-flex; align-items:center; gap:4px; padding:1px 7px; background:#e0f2fe; border:1px solid #38bdf8; border-radius:10px; font-size:10px; font-weight:800; color:#0369a1;">🔍 堆顶就绪 (${step.pqSnapshot.length})</div>`;
  } else if (step.pqAction === 'empty' || (step.status === 'done' && step.pqSnapshot.length === 0)) {
    actionBadge = `<div style="display:inline-flex; align-items:center; gap:4px; padding:1px 7px; background:#ecfdf5; border:1px solid #10b981; border-radius:10px; font-size:10px; font-weight:800; color:#047857;">🏁 广播收敛 · 堆已清空</div>`;
  }

  // 2. 真实队列管道 (Real Conveyor Queue Tube)
  const tubeItems: string[] = [];

  // 出堆口（OUT）外面展示刚被弹出的元素
  if (step.pqAction === 'prune' && step.lastPqItem) {
    tubeItems.push(`
      <div style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; padding:2px 6px; background:#fef2f2; border:1.5px solid #ef4444; border-radius:4px; font-family:monospace; min-width:48px; box-shadow:0 0 8px rgba(239,68,68,0.25);">
        <span style="font-size:8px; color:#ef4444; font-weight:800; line-height:1;">🚫 剪枝丢弃</span>
        <span style="font-size:10.5px; font-weight:800; color:#991b1b; line-height:1.2;">N${step.lastPqItem.u}</span>
        <span style="font-size:8.5px; color:#dc2626; text-decoration:line-through; font-weight:700; line-height:1;">${step.lastPqItem.d}ms</span>
      </div>
      <span style="color:#ef4444; font-size:10.5px; font-weight:900;">➔ 丢弃</span>
    `);
  } else if (step.pqAction === 'poll' && step.lastPqItem) {
    tubeItems.push(`
      <div style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; padding:2px 6px; background:#fef2f2; border:1.5px dashed #ef4444; border-radius:4px; font-family:monospace; min-width:44px;">
        <span style="font-size:8px; color:#ef4444; font-weight:800; line-height:1;">📤 出堆锁定</span>
        <span style="font-size:10.5px; font-weight:800; color:#991b1b; line-height:1.2;">N${step.lastPqItem.u}</span>
        <span style="font-size:8.5px; color:#dc2626; line-height:1;">${step.lastPqItem.d}ms</span>
      </div>
      <span style="color:#ef4444; font-size:11px; font-weight:900;">➔</span>
    `);
  }

  if (step.pqSnapshot.length > 0) {
    step.pqSnapshot.forEach((item, idx) => {
      const isTop = idx === 0;
      const isJustPushed = step.pqAction === 'push' && step.lastPqItem?.u === item.u && step.lastPqItem?.d === item.d;

      let bg = '#ffffff';
      let border = '1.5px solid #cbd5e1';
      let textCol = '#1e293b';
      let tagText = `#${idx + 1}`;
      let tagBg = '#f1f5f9';
      let tagCol = '#64748b';

      if (isTop) {
        bg = '#ecfdf5';
        border = '1.5px solid #10b981';
        textCol = '#047857';
        tagText = '👑 堆顶';
        tagBg = '#10b981';
        tagCol = '#ffffff';
      } else if (isJustPushed) {
        bg = '#fef3c7';
        border = '1.5px solid #f59e0b';
        textCol = '#b45309';
        tagText = '⚡ 新入';
        tagBg = '#f59e0b';
        tagCol = '#ffffff';
      }

      tubeItems.push(`
        <div style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; padding:2px 7px; background:${bg}; border:${border}; border-radius:4px; font-family:monospace; min-width:46px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
          <span style="font-size:7.5px; padding:0 3px; background:${tagBg}; color:${tagCol}; border-radius:2px; font-weight:800; line-height:1.1;">${tagText}</span>
          <span style="font-size:11px; font-weight:800; color:${textCol}; line-height:1.2;">N${item.u}</span>
          <span style="font-size:8.5px; color:#6366f1; font-weight:700; line-height:1;">${item.d}ms</span>
        </div>
      `);

      if (idx < step.pqSnapshot.length - 1) {
        tubeItems.push(`<span style="color:#94a3b8; font-size:10px; font-weight:800;">➔</span>`);
      }
    });
  } else {
    // 紧凑空管道槽位
    tubeItems.push(`
      <div style="display:inline-flex; align-items:center; gap:6px; padding:2px 8px;">
        <div style="width:40px; height:24px; border:1px dashed #cbd5e1; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:9px; font-family:monospace;">空槽</div>
        <div style="width:40px; height:24px; border:1px dashed #cbd5e1; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:9px; font-family:monospace;">空槽</div>
        <span style="font-size:10px; color:#94a3b8; font-family:monospace; font-style:italic;">[ 队列排空 · 0 个节点在排队 ]</span>
      </div>
    `);
  }

  // 3. 增强距离表与锁定表的高亮连续性
  const renderRow = (name: string, arr: any[], activeName: string, color: string, formatVal: (v: any) => string) => {
    const cells = indices.map((idx) => {
      const val = arr[idx];
      const isActive = step.activeArray === activeName && step.activeSlot === idx;

      const displayVal = formatVal(val);
      const bg = isActive ? '#fef08a' : '#ffffff';
      const textCol = isActive ? '#854d0e' : '#0f172a';
      const border = isActive ? '2px solid #eab308' : '1px solid #cbd5e1';
      const shadow = isActive ? 'box-shadow: 0 0 6px rgba(234, 179, 8, 0.45);' : '';
      return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:34px;height:30px;background:${bg};border:${border};border-radius:4px;color:${textCol};font-family:monospace;font-size:11px;font-weight:700;${shadow}"><span style="font-size:8px;color:${isActive ? '#a16207' : '#64748b'};line-height:1;">N[${idx}]</span><span style="line-height:1.1;">${displayVal}</span></div>`;
    }).join('');
    return `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:10.5px;font-weight:700;min-width:138px;color:${color};">${name}:</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
  };

  const distRow = renderRow('distance[] (到达时间)', step.distList, 'dist', '#0284c7', (v) => v === Infinity ? '∞' : `${v}`);
  const visRow = renderRow('visited[] (已锁定)', step.visitedList, 'visited', '#059669', (v) => v ? 'T' : 'F');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:6px; font-size:11px; color:#374151; padding:4px 6px; box-sizing:border-box;">
      <!-- 真实优先队列管道 (Queue Pipeline) -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:11px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:4px;">
            <span style="font-size:12px;">🚪</span>
            <span>优先队列小根堆管道 (Min-Heap Pipeline):</span>
          </span>
          ${actionBadge}
        </div>
        
        <!-- 实体流水线管道外壳：上下双导轨 + 左出右入 -->
        <div style="display:flex; align-items:center; gap:5px; background:#f8fafc; border-top:2px solid #64748b; border-bottom:2px solid #64748b; border-left:2px dashed #94a3b8; border-right:2px dashed #94a3b8; border-radius:4px; padding:4px 8px; min-height:42px; overflow-x:auto;">
          <span style="font-size:8.5px; padding:2px 4px; background:#e2e8f0; border-radius:3px; color:#475569; font-weight:800; font-family:monospace; white-space:nowrap;">OUT 👑 出队</span>
          <div style="display:flex; align-items:center; gap:4px; flex:1; min-width:0;">
            ${tubeItems.join('')}
          </div>
          <span style="font-size:8.5px; padding:2px 4px; background:#e2e8f0; border-radius:3px; color:#475569; font-weight:800; font-family:monospace; white-space:nowrap;">📥 入队 IN</span>
        </div>
      </div>

      <!-- 距离表与访问表 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; display:flex; flex-direction:column; gap:4px;">
        ${distRow}
        ${visRow}
      </div>
    </div>
  `;
}

export class NetworkDelayCanvasAdapter {
  public static render(container: HTMLElement, step: NetworkDelayStep): void {
    renderNetworkDelayCanvas(container, step);
  }

  public static renderMetrics(container: HTMLElement, step: NetworkDelayStep): void {
    renderNetworkDelayMetrics(container, step);
  }
}

