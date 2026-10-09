import { ProvincesStep } from '../../../algorithms/categories/graph/number-of-provinces-step-compiler';

const COMPONENT_COLORS = [
  '#38bdf8', // 蔚蓝
  '#34d399', // 翡翠绿
  '#f472b6', // 樱花粉
  '#a78bfa', // 薰衣草紫
  '#fbbf24', // 琥珀黄
  '#fb7185', // 珊瑚粉
  '#2dd4bf', // 薄荷绿
  '#818cf8', // 靛蓝
];

function findRoot(parent: number[], i: number): number {
  let curr = i;
  while (curr >= 0 && curr < parent.length && parent[curr] !== curr) {
    curr = parent[curr];
  }
  return curr;
}

/**
 * 纯正 SVG 拓扑沙盘渲染器：省份数量 (Number of Provinces)
 * 纯 SVG 绘制城市网络分布、连通道路、并查集连通分量着色与探测光圈
 */
export function renderProvincesCanvas(container: HTMLElement, step: ProvincesStep): void {
  const { n, matrix, parent, currentI, currentJ, provincesCount, lastMerged } = step;

  const width = container.clientWidth || 640;
  const height = container.clientHeight || 420;
  const cx = width / 2;
  const cy = height / 2 + 15;
  const radius = Math.min(width, height) * 0.34;

  // 1. 计算各城市坐标（环形均匀拓扑）
  const nodePositions = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      root: findRoot(parent, i),
    };
  });

  // 2. 绘制边（实线为已连通路，考察中未连通为虚线）
  const edgesHtml: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const isConnected = matrix[i]?.[j] === 1;
      const isCurrentExamined = (currentI === i && currentJ === j) || (currentI === j && currentJ === i);
      const isJustMerged = lastMerged && ((lastMerged[0] === i && lastMerged[1] === j) || (lastMerged[0] === j && lastMerged[1] === i));

      const p1 = nodePositions[i];
      const p2 = nodePositions[j];

      if (isConnected) {
        let strokeColor = 'rgba(148, 163, 184, 0.35)';
        let strokeWidth = 2;
        let dashArray = 'none';

        if (p1.root === p2.root) {
          const colorIdx = p1.root % COMPONENT_COLORS.length;
          strokeColor = COMPONENT_COLORS[colorIdx];
          strokeWidth = 2.5;
        }

        if (isJustMerged) {
          strokeColor = '#34d399';
          strokeWidth = 4;
        } else if (isCurrentExamined) {
          strokeColor = '#f472b6';
          strokeWidth = 3.5;
        }

        edgesHtml.push(`
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}"
                stroke-linecap="round" />
        `);
      } else if (isCurrentExamined) {
        // 当前考察但没有道路直连
        edgesHtml.push(`
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="rgba(244, 114, 182, 0.5)" stroke-width="2" stroke-dasharray="4 4"
                stroke-linecap="round" />
        `);
      }
    }
  }

  // 3. 绘制节点与所属省份标记
  const nodesHtml = nodePositions.map(pos => {
    const isExamined = pos.id === currentI || pos.id === currentJ;
    const isMerged = lastMerged && (lastMerged[0] === pos.id || lastMerged[1] === pos.id);
    const colorIdx = pos.root % COMPONENT_COLORS.length;
    const compColor = COMPONENT_COLORS[colorIdx];

    const haloHtml = isExamined ? `
      <circle cx="${pos.x}" cy="${pos.y}" r="27" fill="none"
              stroke="#f472b6" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.9" />
    ` : isMerged ? `
      <circle cx="${pos.x}" cy="${pos.y}" r="26" fill="none"
              stroke="#34d399" stroke-width="2" opacity="0.8" />
    ` : '';

    return `
      <g class="city-node" data-id="${pos.id}">
        ${haloHtml}
        <circle cx="${pos.x}" cy="${pos.y}" r="20" fill="#0f172a"
                stroke="${compColor}" stroke-width="3" />
        <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle"
              fill="#f8fafc" font-size="13" font-weight="700" font-family="sans-serif">
          C${pos.id}
        </text>
        <rect x="${pos.x - 22}" y="${pos.y + 24}" width="44" height="15" rx="4"
              fill="rgba(15, 23, 42, 0.85)" stroke="${compColor}" stroke-width="1" />
        <text x="${pos.x}" y="${pos.y + 35}" text-anchor="middle"
              fill="${compColor}" font-size="9" font-weight="600" font-family="sans-serif">
          root:${pos.root}
        </text>
      </g>
    `;
  }).join('');

  // 4. 统计标牌与提示
  const examStatus = (currentI >= 0 && currentJ >= 0)
    ? `探测道路: 城市 C${currentI} ↔ C${currentJ} (${matrix[currentI]?.[currentJ] === 1 ? '直连' : '无路'})`
    : '状态: 就绪/计算完毕';

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; min-height: 380px; background: #090d16; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
      <div style="position: absolute; top: 12px; left: 16px; display: flex; gap: 10px; align-items: center; z-index: 10; pointer-events: none;">
        <span style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #38bdf8; font-weight: 600;">
          🏙️ 城市总数: ${n}
        </span>
        <span style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(52, 211, 153, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #34d399; font-weight: 700;">
          🌐 独立省份: ${provincesCount}
        </span>
        <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; color: #cbd5e1;">
          ${examStatus}
        </span>
      </div>
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="flex: 1; display: block;">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        ${edgesHtml.join('')}
        ${nodesHtml}
      </svg>
    </div>
  `;
}
