/**
 * 课程表 IV (Course Schedule IV · LeetCode 1462) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 先修有向图与拓扑传播链路沙盘
 * Card 2 承载传递闭包矩阵 (isPre[u][v])、查询验证列表与统计指标舱
 */

import type { CourseScheduleIVStep } from '../../../algorithms/categories/graph/course-schedule-iv-step-compiler';

export function renderCourseScheduleIVCanvas(container: HTMLElement, step: CourseScheduleIVStep): void {
  const { numCourses, prerequisites, activeU, activeV, phase } = step;

  const nodeCoords: Array<{ x: number; y: number }> = [];
  const padding = 55;
  const width = 460 - 2 * padding;

  for (let i = 0; i < numCourses; i++) {
    if (numCourses <= 5) {
      nodeCoords.push({
        x: Math.round(padding + (i * width) / Math.max(1, numCourses - 1)),
        y: 100,
      });
    } else {
      const row = i % 2;
      const col = Math.floor(i / 2);
      const cols = Math.ceil(numCourses / 2);
      nodeCoords.push({
        x: Math.round(padding + (col * width) / Math.max(1, cols - 1)),
        y: row === 0 ? 60 : 140,
      });
    }
  }

  // 绘制先修依赖有向边
  let svgEdges = '';
  for (const [u, v] of prerequisites) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const isActive = (activeU === u && activeV === v) || (phase === 'propagate' && activeV === v);
    const stroke = isActive ? '#facc15' : '#64748b';
    const strokeWidth = isActive ? 3 : 1.8;
    const marker = isActive ? 'url(#arrow-active)' : 'url(#arrow)';

    // 如果在同一水平线上且相邻，直线；若跨越节点则画弧线
    if (Math.abs(u - v) > 1 && p1.y === p2.y) {
      const dx = (p1.x + p2.x) / 2;
      const dy = p1.y - 35 * Math.sign(v - u);
      svgEdges += `<path d="M ${p1.x} ${p1.y} Q ${dx} ${dy} ${p2.x} ${p2.y}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    } else {
      svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    }
  }

  // 跨节点传递/查询虚线弧
  if (activeU >= 0 && activeV >= 0 && (phase === 'propagate' || phase === 'query')) {
    const pU = nodeCoords[activeU];
    const pV = nodeCoords[activeV];
    if (pU && pV && (pU.x !== pV.x || pU.y !== pV.y)) {
      const isDirect = prerequisites.some(([u, v]) => u === activeU && v === activeV);
      if (!isDirect) {
        const mx = (pU.x + pV.x) / 2;
        const my = Math.min(pU.y, pV.y) - 40;
        const stroke = phase === 'query' ? '#38bdf8' : '#34d399';
        svgEdges += `
          <g>
            <path d="M ${pU.x} ${pU.y} Q ${mx} ${my} ${pV.x} ${pV.y}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4,4" marker-end="url(#arrow-query)" />
            <rect x="${mx - 24}" y="${my - 8}" width="48" height="16" rx="4" fill="#0f172a" stroke="${stroke}" stroke-width="1" />
            <text x="${mx}" y="${my + 4}" fill="${stroke}" font-size="8.5" font-family="monospace" font-weight="700" text-anchor="middle">
              ${phase === 'query' ? '查询验证' : '传递闭包'}
            </text>
          </g>
        `;
      }
    }
  }

  // 节点渲染
  let svgNodes = '';
  for (let i = 0; i < numCourses; i++) {
    const p = nodeCoords[i];
    if (!p) continue;

    const isSource = activeU === i;
    const isTarget = activeV === i;
    const bg = isSource ? '#78350f' : isTarget ? '#4c1d95' : '#1e293b';
    const border = isSource ? '#f59e0b' : isTarget ? '#c084fc' : '#38bdf8';
    const tag = isSource ? '源 u' : isTarget ? '目标 v' : `C${i}`;

    svgNodes += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="18" fill="${bg}" stroke="${border}" stroke-width="${isSource || isTarget ? 2.8 : 1.8}" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">C${i}</text>
        <text x="${p.x}" y="${p.y + 30}" fill="${border}" font-size="8.5" font-weight="700" text-anchor="middle">${tag}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 460 200">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
        </marker>
        <marker id="arrow-query" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
      </defs>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderCourseScheduleIVCustomMetrics(container: HTMLElement, step: CourseScheduleIVStep): void {
  const { numCourses, closure, activeU, activeV, queryResults, phase } = step;

  // 1. 传递闭包矩阵表
  let matrixHeader = `<th style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #94a3b8; font-size: 10px;">u\\v</th>`;
  for (let j = 0; j < numCourses; j++) {
    matrixHeader += `<th style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #38bdf8; font-size: 10px;">C${j}</th>`;
  }

  let matrixRows = '';
  for (let i = 0; i < numCourses; i++) {
    let cells = `<td style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #38bdf8; font-size: 10px; text-align: center; font-weight: 700;">C${i}</td>`;
    for (let j = 0; j < numCourses; j++) {
      const isReachable = closure[i][j];
      const isActive = i === activeU && j === activeV;

      let bg = 'rgba(255,255,255,0.02)';
      let color = '#475569';
      let border = '1px solid #334155';

      if (isActive) {
        bg = 'rgba(245, 158, 11, 0.4)';
        color = '#fbbf24';
        border = '2px solid #f59e0b';
      } else if (isReachable) {
        bg = 'rgba(16, 185, 129, 0.2)';
        color = '#34d399';
      }

      cells += `<td style="padding: 4px; border: ${border}; background: ${bg}; color: ${color}; font-size: 10px; text-align: center; font-weight: 600;">
        ${isReachable ? '✓' : '—'}
      </td>`;
    }
    matrixRows += `<tr>${cells}</tr>`;
  }

  // 2. 查询列表徽章
  const queryBadges = queryResults
    .map((q) => {
      return `
      <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.04); border-radius: 4px; font-size: 10px;">
        <span style="color: #94a3b8;">[C${q.u} ➔ C${q.v}]</span>
        <span style="color: ${q.ans ? '#34d399' : '#f87171'}; font-weight: 700;">${q.ans ? '✓ 先修' : '✗ 否'}</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 6px; box-sizing: border-box;">
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
        <!-- 传递闭包矩阵 -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">
            <span>全源传递闭包 isPre[u][v]</span>
            <span style="color: #34d399;">● 绿色=可达</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr>${matrixHeader}</tr></thead>
            <tbody>${matrixRows}</tbody>
          </table>
        </div>

        <!-- 查询结果面板 -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px; display: flex; flex-direction: column;">
          <div style="font-size: 10.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">
            先修关系验证查询 (Queries)
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; max-height: 120px;">
            ${queryBadges || '<div style="color: #64748b; font-size: 10px; padding: 6px;">等待闭包构建完成后查询...</div>'}
          </div>
        </div>
      </div>

      <!-- 底部统计卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 4px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">课程总数</div>
          <div style="font-size: 13px; font-weight: 700; color: #60a5fa;">${numCourses}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 4px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">活跃源 u</div>
          <div style="font-size: 13px; font-weight: 700; color: #fbbf24;">${activeU >= 0 ? `C${activeU}` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 4px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">活跃目标 v</div>
          <div style="font-size: 13px; font-weight: 700; color: #a78bfa;">${activeV >= 0 ? `C${activeV}` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 4px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">推演阶段</div>
          <div style="font-size: 12px; font-weight: 700; color: #34d399;">
            ${phase === 'propagate' ? '闭包传递中' : phase === 'query' ? '查询解答中' : phase === 'finish' ? '已收敛完成' : '图初始化'}
          </div>
        </div>
      </div>
    </div>
  `;
}
