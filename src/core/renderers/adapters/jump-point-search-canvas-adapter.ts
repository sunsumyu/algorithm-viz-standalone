/**
 * Jump Point Search (跳点搜索, JPS) 画板与状态监视器适配器
 * Card 1: 笛卡尔网格坐标系 + 动态射线扫描 + 终局最优跳点折线 SVG 叠加层
 * Card 2: JPS Open List 实时镜像与核心思想点拨
 */

import type { JpsStep } from './jump-point-search-step-compiler';

export function renderJumpPointSearchCanvas(container: HTMLElement, step: JpsStep): void {
  const { grid, start, goal, currentNode, finalPath, openSet, closedSet, jumpPoints, forcedNeighbors, naturalNeighbors, rays } = step;
  const m = grid.length;
  const n = grid[0].length;

  const pathMap = new Set(finalPath.map(([r, c]) => `${r},${c}`));
  const openMap = new Set(openSet.map(([r, c]) => `${r},${c}`));
  const closedMap = new Set(closedSet.map(([r, c]) => `${r},${c}`));
  const jpMap = new Set(jumpPoints.map(([r, c]) => `${r},${c}`));
  const fnMap = new Set(forcedNeighbors.map(([r, c]) => `${r},${c}`));
  const nnMap = new Set(naturalNeighbors.map(([r, c]) => `${r},${c}`));

  // 展开光束射线经过的路径（备用）
  const rayMap = new Set<string>();
  for (const ray of rays || []) {
    let cr = ray.from[0];
    let cc = ray.from[1];
    const tr = ray.to[0];
    const tc = ray.to[1];
    const sdr = Math.sign(tr - cr);
    const sdc = Math.sign(tc - cc);
    let guard = 0;
    while ((cr !== tr || cc !== tc) && guard < 100) {
      guard++;
      rayMap.add(`${cr},${cc}`);
      if (cr !== tr) cr += sdr;
      if (cc !== tc) cc += sdc;
    }
    rayMap.add(`${tr},${tc}`);
  }

  // 动态尺寸计算
  const cellSize = Math.min(42, Math.max(22, Math.floor(360 / Math.max(m, n))));
  const gap = 3;
  const pad = 10;
  const fontSize = cellSize >= 32 ? 11 : 9;
  const totalWidth = pad * 2 + n * cellSize + (n - 1) * gap;
  const totalHeight = pad * 2 + m * cellSize + (m - 1) * gap;

  const getCenterX = (c: number) => pad + c * (cellSize + gap) + cellSize / 2;
  const getCenterY = (r: number) => pad + r * (cellSize + gap) + cellSize / 2;

  // 判定对角线历经痕迹点 (Trail Dots)
  const trailDots = new Set<string>();
  if (step.diagonalTrajectory) {
    const [fr, fc] = step.diagonalTrajectory.from;
    const [tr, tc] = step.diagonalTrajectory.to;
    const dr = Math.sign(tr - fr);
    const dc = Math.sign(tc - fc);
    if (dr !== 0 && dc !== 0) {
      let cr = fr + dr;
      let cc = fc + dc;
      while ((cr !== tr || cc !== tc) && cr >= 0 && cr < m && cc >= 0 && cc < n) {
        trailDots.add(`${cr},${cc}`);
        cr += dr;
        cc += dc;
      }
    }
  }

  // 拼接单元格 HTML
  let cellsHtml = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r},${c}`;
      const isStart = start[0] === r && start[1] === c;
      const isGoal = goal[0] === r && goal[1] === c;
      const isWall = grid[r][c] === 1;
      const isKeyObstacle = step.keyObstacle && step.keyObstacle[0] === r && step.keyObstacle[1] === c;
      const isCurrent = currentNode && currentNode[0] === r && currentNode[1] === c;
      const isPath = pathMap.has(key);
      const isJp = jpMap.has(key);
      const isFn = fnMap.has(key);
      const isNn = nnMap.has(key);
      const isOpen = openMap.has(key);
      const isClosed = closedMap.has(key);
      const isTrail = trailDots.has(key);

      // 坐标标签 (以左下角为笛卡尔原点，显示 c, m-1-r)
      const coordLabel = `<span style="position: absolute; bottom: 1px; right: 2px; font-size: 8px; color: #475569; pointer-events: none; font-family: 'JetBrains Mono', monospace; line-height: 1;">${c},${m - 1 - r}</span>`;

      // 基础格子样式 (使用避开全局漂白规则的暗黑高质感基底)
      let cellStyle = `width: ${cellSize}px; height: ${cellSize}px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; font-weight: 800; border: 1px solid #142035; background: #0a1122; color: #475569; position: relative; box-sizing: border-box; transition: all 0.15s ease;`;
      let content = '';

      if (isStart) {
        cellStyle += ' background: #1d4ed8; color: #ffffff; border-color: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.5); z-index: 5;';
        content = `<span style="font-weight: 900; font-size: ${fontSize + 2}px;">S</span>`;
      } else if (isGoal) {
        cellStyle += ' background: #be123c; color: #ffffff; border-color: #f43f5e; box-shadow: 0 0 10px rgba(244,63,94,0.5); z-index: 5;';
        content = `<span style="font-weight: 900; font-size: ${fontSize + 2}px;">G</span>`;
      } else if (isKeyObstacle) {
        cellStyle += ' background: #25121e; color: #fb7185; border: 2px solid #f43f5e; box-shadow: 0 0 10px rgba(244,63,94,0.6); outline: 2px solid #f43f5e; outline-offset: 1px; z-index: 4;';
        content = `<span style="font-weight: 900; font-size: 11px;">#</span>`;
      } else if (isWall) {
        cellStyle += ' background: #111a2e; color: #475569; border: 1px solid #1c2b45;';
        content = `<span style="opacity: 0.6;">#</span>`;
      } else if (isFn) {
        cellStyle += ' background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 2px dashed #c084fc; box-shadow: 0 0 8px rgba(192,132,252,0.3); z-index: 4;';
        content = `<span style="background: #7e22ce; color: #ffffff; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">通道口</span>`;
      } else if (isJp) {
        // 判断是否为 X 晋升的跳点或 J 跳点
        const isX = r === 4 && c === 3;
        const isJ = r === 4 && c === 5;
        cellStyle += ' background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 2px solid #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.5); z-index: 5;';
        if (isX) {
          content = `<span style="background: #f59e0b; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 900; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">★X跳点</span>`;
        } else if (isJ) {
          content = `<span style="background: #f59e0b; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 900; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">跳点 J</span>`;
        } else {
          content = `<span style="background: #8b5cf6; color: #ffffff; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 3px; border-radius: 3px;">JP</span>`;
        }
      } else if (isCurrent) {
        // 当前考察点
        if (r === 4 && c === 3 && step.stage === 'stage3_jump_ray') {
          cellStyle += ' background: rgba(16, 185, 129, 0.2); color: #34d399; border: 2px solid #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4); z-index: 5;';
          content = `<span style="background: #10b981; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">节点 X</span>`;
        } else {
          cellStyle += ' background: rgba(234, 88, 12, 0.25); color: #fdba74; border: 2px solid #f97316; box-shadow: 0 0 8px rgba(249,115,22,0.4); z-index: 5;';
          content = `<span>★</span>`;
        }
      } else if (isPath && !step.showFinalPathSegments) {
        cellStyle += ' background: #059669; color: #ffffff; border-color: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); z-index: 3;';
        content = `<span>★</span>`;
      } else if (isNn) {
        cellStyle += ' background: rgba(20, 184, 166, 0.2); color: #5eead4; border-color: #14b8a6;';
        content = `<span style="font-size: ${Math.max(7, fontSize - 2)}px;">NN</span>`;
      } else if (isOpen) {
        cellStyle += ' background: rgba(234, 179, 8, 0.15); color: #fde047; border-color: rgba(234, 179, 8, 0.4);';
        content = `<span>o</span>`;
      } else if (isClosed) {
        cellStyle += ' background: #090f1d; color: #64748b; border: 1px solid #142035;';
        content = `<span>·</span>`;
      }

      // 历经轨迹点
      if (isTrail && !content) {
        content = `<span style="width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 6px #22d3ee;"></span>`;
      }

      cellsHtml += `<div style="${cellStyle}">${content}${coordLabel}</div>`;
    }
  }

  // 拼接 SVG 矢量覆盖层
  let svgVectors = '';
  // 1. 对角线推进线
  if (step.diagonalTrajectory) {
    const x1 = getCenterX(step.diagonalTrajectory.from[1]);
    const y1 = getCenterY(step.diagonalTrajectory.from[0]);
    const x2 = getCenterX(step.diagonalTrajectory.to[1]);
    const y2 = getCenterY(step.diagonalTrajectory.to[0]);
    svgVectors += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" opacity="0.8" marker-end="url(#jps-arrow-emerald)" />`;
  }

  // 2. 扫描射线
  for (const ray of rays || []) {
    const x1 = getCenterX(ray.from[1]);
    const y1 = getCenterY(ray.from[0]);
    const x2 = getCenterX(ray.to[1]);
    const y2 = getCenterY(ray.to[0]);
    svgVectors += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" class="jps-ray-active" marker-end="url(#jps-arrow-cyan)" />`;
  }

  // 3. 终点分段连线 (Step 7 达成)
  if (step.showFinalPathSegments) {
    const ptS = { x: getCenterX(0), y: getCenterY(7) };
    const ptX = { x: getCenterX(3), y: getCenterY(4) };
    const ptJ = { x: getCenterX(5), y: getCenterY(4) };
    const ptFN = { x: getCenterX(6), y: getCenterY(3) };
    const ptG = { x: getCenterX(6), y: getCenterY(0) };

    // S -> X (金色对角高速)
    svgVectors += `<line x1="${ptS.x}" y1="${ptS.y}" x2="${ptX.x}" y2="${ptX.y}" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />`;
    // X -> J (金色穿缝直行)
    svgVectors += `<line x1="${ptX.x}" y1="${ptX.y}" x2="${ptJ.x}" y2="${ptJ.y}" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />`;
    // J -> FN (紫色贴角穿越)
    svgVectors += `<line x1="${ptJ.x}" y1="${ptJ.y}" x2="${ptFN.x}" y2="${ptFN.y}" stroke="#c084fc" stroke-width="4" stroke-linecap="round" marker-end="url(#jps-arrow-purple)" />`;
    // FN -> G (玫瑰红直达终点)
    svgVectors += `<line x1="${ptFN.x}" y1="${ptFN.y}" x2="${ptG.x}" y2="${ptG.y}" stroke="#f43f5e" stroke-width="4" stroke-dasharray="8 4" stroke-linecap="round" marker-end="url(#jps-arrow-rose)" />`;
  } else if (finalPath.length > 1) {
    const pointsStr = finalPath.map(([r, c]) => `${getCenterX(c)},${getCenterY(r)}`).join(' ');
    svgVectors += `<polyline points="${pointsStr}" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />`;
  }

  const svgDefs = `
    <defs>
      <marker id="jps-arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="jps-arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="jps-arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
      </marker>
      <marker id="jps-arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
      </marker>
      <marker id="jps-arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
    </defs>
  `;

  const keyframeStyle = `
    <style>
      @keyframes jps-scan-ray {
        0% { stroke-dashoffset: 40; }
        100% { stroke-dashoffset: 0; }
      }
      .jps-ray-active {
        stroke-dasharray: 6 3;
        animation: jps-scan-ray 0.8s linear infinite;
      }
    </style>
  `;

  container.innerHTML = `
    ${keyframeStyle}
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 10px; box-sizing: border-box; background: #050814; border-radius: 12px;">
      <!-- 网格与矢量叠加层沙盘 -->
      <div style="position: relative; display: inline-grid; grid-template-columns: repeat(${n}, ${cellSize}px); grid-template-rows: repeat(${m}, ${cellSize}px); gap: ${gap}px; padding: ${pad}px; background: #080d1a; border-radius: 12px; border: 1px solid #142035; box-shadow: 0 4px 20px rgba(0,0,0,0.5); user-select: none;">
        ${cellsHtml}
        <svg style="position: absolute; top: 0; left: 0; width: ${totalWidth}px; height: ${totalHeight}px; pointer-events: none; z-index: 20;">
          ${svgDefs}
          ${svgVectors}
        </svg>
      </div>

      <!-- 图例标注 -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 12px; font-size: 11px; color: #94a3b8; user-select: none;">
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #1d4ed8; color: #fff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">S</span> 起点</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #be123c; color: #fff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">G</span> 终点</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #111a2e; border: 1px solid #1c2b45; color: #64748b; font-size: 9px; display: inline-flex; align-items: center; justify-content: center;">#</span> 障碍</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; display: inline-block;"></span> 对角探索点 X</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(245,158,11,0.25); border: 1.5px solid #f59e0b; display: inline-block;"></span> 转折跳点 J</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(168,85,247,0.2); border: 1.5px dashed #c084fc; display: inline-block;"></span> 强制邻居</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 16px; height: 2px; background: #38bdf8; display: inline-block;"></span> 扫描雷达</span>
      </div>

      <!-- 动态解说 -->
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 600; color: #cbd5e1; text-align: center; max-width: 90%; line-height: 1.5; background: #0b1328; padding: 6px 12px; border-radius: 8px; border: 1px solid #1b2942;">
        ${step.statusText}
      </div>

      <!-- 欧氏/八向距离评估公式 -->
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">
        f(n) = g(${step.g.toFixed(2)}) + h(${step.h.toFixed(2)}) = ${step.f.toFixed(2)}
      </div>
    </div>
  `;
}

// ==========================================
// 辅助指标/状态空间监视器 (Card 2: JPS Open List 实时镜像与思想点拨)
// ==========================================
export function renderJumpPointSearchCard2(container: HTMLElement, step: JpsStep): void {
  const openItems = step.openListDetails || (step.openSet || []).map(([r, c]) => ({
    name: `(${c}, ${7 - r})`,
    g: step.g,
    h: step.h,
    f: step.f,
    note: '待评估候选点',
  }));

  const openListHtml = openItems.map((item) => `
    <div style="background: #0c1427; border: 1px solid #1e2c47; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
        <span style="font-weight: 700; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: nowrap;">${item.name}</span>
        <span style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.note}</span>
      </div>
      <div style="display: flex; gap: 6px; font-size: 10px; font-family: 'JetBrains Mono', monospace; white-space: nowrap;">
        <span style="color: #64748b;">g:${item.g}</span>
        <span style="color: #64748b;">h:${item.h}</span>
        <span style="color: #f59e0b; font-weight: 700;">f:${item.f}</span>
      </div>
    </div>
  `).join('');

  const thoughtText = step.stage === 'stage3_jump_ray'
    ? '如果没有将 X 设为跳点，算法就会直勾勾错过转弯去往 J 的机会；因此 X 是从主干高速路切入支线的“立交桥分流道口”！'
    : step.stage === 'stage2_prune'
    ? '通俗大白话：开阔地带走哪都对称等价，只有路过转角被障碍卡住死角时，才会产生必须借道的“强迫邻居”，催生关键跳点！'
    : step.stage === 'stage1_astar'
    ? '传统 A* 对称泛洪：网格中存在大量等价的对称折线路径，导致 Open 堆急剧膨胀，遍历大量冗余节点。'
    : 'JPS 终局：Open 堆仅存放关键跳点，节点访问量骤减 80%~95%，直击欧几里得最优解！';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 4px; box-sizing: border-box; width: 100%;">
      <!-- Open List 实时镜像面板 -->
      <div style="background: #080d1a; border: 1px solid #142035; border-radius: 12px; padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #142035; font-size: 11px; font-weight: 600;">
          <span style="color: #e2e8f0; display: inline-flex; align-items: center; gap: 6px;">
            <svg style="width: 14px; height: 14px; color: #818cf8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            JPS Open List (待评估跳点队列)
          </span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">${openItems.length} 项</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
          ${openListHtml}
        </div>
      </div>

      <!-- 💡 思想点拨 callout -->
      <div style="padding: 10px 12px; border-radius: 10px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); color: #fbbf24; font-size: 11px; line-height: 1.5;">
        <strong style="color: #f59e0b; display: block; margin-bottom: 2px;">💡 核心思想点拨：</strong>
        <span style="color: #e2e8f0;">${thoughtText}</span>
      </div>

      <!-- 📐 强迫邻居数学准则 / 判定提示 -->
      <div style="padding: 10px 12px; border-radius: 10px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); font-size: 11px; line-height: 1.5;">
        <strong style="color: #a5b4fc; display: block; margin-bottom: 2px;">📐 强迫邻居数学准则：</strong>
        <span style="color: #94a3b8;">对于水平直行探测，若上方 <code style="color: #e2e8f0; background: #0c1427; padding: 1px 4px; border-radius: 3px;">(x, y+1)</code> 是障碍物，但右上方 <code style="color: #c084fc; background: #0c1427; padding: 1px 4px; border-radius: 3px;">(x+1, y+1)</code> 是空地，则从前驱直接绕行被墙切断，必须经由当前格转弯达到最优，<code style="color: #c084fc;">(x+1, y+1)</code> 即为强迫邻居！</span>
      </div>
    </div>
  `;
}

// ==========================================
// 注册声明式算法演化模型 (带顶栏四阶段 Tab 导航)
// ==========================================

export class JumpPointSearchCanvasAdapter {
  public static renderCanvas = renderJumpPointSearchCanvas;
  public static renderCard2 = renderJumpPointSearchCard2;
}
