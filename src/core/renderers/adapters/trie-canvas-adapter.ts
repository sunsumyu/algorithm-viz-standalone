/**
 * 字典树拓扑画板与辅助视图适配器 (TrieCanvasAdapter)
 * 深度模块 (Deep Module): 封装 01-Trie / K 叉字典树分层布局算法、SVG 渲染、路径高亮、位标尺与 Card 2 诊断面板
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

export interface TrieVisualNode {
  id: number;
  depth: number;
  label: string; // '0', '1', 'ROOT', or character
  bit?: number | null;
  parentId: number | null;
  children: number[]; // child node IDs
  x?: number;
  y?: number;
  storedVal?: number;
  isHighlighted?: boolean;
  isActive?: boolean;
  isDualMatch?: boolean;
  isFallback?: boolean;
  pass?: number;
  end?: number;
}

export interface TrieCanvasState {
  nodesList?: TrieVisualNode[];
  activeNodeId?: number;
  activePathNodeIds?: number[];
  maxBit?: number;
  curBit?: number;
  globalMaxXor?: number;
  bestPair?: [number, number];
}

export interface StaticTableRowDef {
  index: number;
  left: number;
  right: number;
  isCurrent?: boolean;
}

export interface PrefixXorItemDef {
  idx: number;
  num: number;
  eor: number;
  isCurrent?: boolean;
}

export interface TrieCard2State {
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';
  curNum?: number;
  curBit?: number;
  expectedBit?: number;
  actualBit?: number;
  curXor?: number;
  globalMaxXor?: number;
  trieSize?: number;
  decision?: string;
  bestPair?: [number, number];
  staticTable?: { rows: StaticTableRowDef[]; activeRow: number };
  prefixXorList?: PrefixXorItemDef[];
}

export class TrieCanvasAdapter {
  /**
   * 递归分层计算树节点坐标 (Assign horizontal & vertical bounds per depth)
   */
  public static computeCoordinates(
    nodes: TrieVisualNode[],
    width: number = 720,
    height: number = 380,
    maxBit?: number
  ): void {
    if (!nodes || nodes.length === 0) return;

    let maxDepth = 0;
    for (const n of nodes) {
      if (n.depth > maxDepth) maxDepth = n.depth;
    }

    const verticalStep = Math.min(65, (height - 80) / Math.max(1, maxBit ?? maxDepth));
    const rootY = 40;

    function assignX(nodeId: number, left: number, right: number) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      node.x = Math.round((left + right) / 2);
      node.y = Math.round(rootY + node.depth * verticalStep);

      const validChildren = (node.children || []).filter((id) => id > 0);
      if (validChildren.length === 0) return;

      if (node.children.length === 2) {
        // 二叉/01-Trie 对偶分支
        const [lId, rId] = node.children;
        const mid = (left + right) / 2;
        if (lId > 0 && rId > 0) {
          assignX(lId, left, mid);
          assignX(rId, mid, right);
        } else if (lId > 0) {
          assignX(lId, left, right);
        } else if (rId > 0) {
          assignX(rId, left, right);
        }
      } else {
        // 多叉/26 叉前缀树
        const span = (right - left) / validChildren.length;
        validChildren.forEach((childId, idx) => {
          assignX(childId, left + idx * span, left + (idx + 1) * span);
        });
      }
    }

    assignX(1, 40, width - 40);
  }

  /**
   * 渲染纯净 SVG 字典树沙盘 (Card 1)
   */
  public static renderTrieCanvas(container: HTMLElement, state: TrieCanvasState): void {
    container.innerHTML = '';
    const nodes = state.nodesList || [];
    if (nodes.length === 0) {
      container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b; font-family: monospace; font-size: 12px;">空字典树沙盘</div>`;
      return;
    }

    const width = 720;
    const height = 380;
    const maxBit = state.maxBit ?? 5;

    // 1. 确保所有节点具备有效坐标
    TrieCanvasAdapter.computeCoordinates(nodes, width, height, maxBit);

    // 2. 创建 SVG 根节点
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'w-full h-full select-none');
    svg.style.maxHeight = '100%';

    // 3. 滤镜定义 (用于高亮光晕)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="edge-dual-match" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="edge-fallback" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // 4. 左侧/顶部位深度标尺 (Bit Depth Ruler)
    if (state.maxBit !== undefined) {
      const rulerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      rulerG.setAttribute('class', 'bit-ruler opacity-80');
      const verticalStep = Math.min(65, (height - 80) / Math.max(1, maxBit));

      for (let b = maxBit; b >= 0; b--) {
        const depth = maxBit - b + 1;
        const y = 40 + depth * verticalStep;
        const isCurrentBit = state.curBit === b;

        // 水平虚线参考标尺
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '50');
        line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(width - 50));
        line.setAttribute('y2', String(y));
        line.setAttribute('stroke', isCurrentBit ? '#38bdf8' : '#334155');
        line.setAttribute('stroke-dasharray', isCurrentBit ? '4 2' : '2 4');
        line.setAttribute('stroke-width', isCurrentBit ? '1.5' : '0.8');
        line.setAttribute('opacity', isCurrentBit ? '0.8' : '0.3');
        rulerG.appendChild(line);

        // 标尺文字
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', '42');
        txt.setAttribute('y', String(y + 4));
        txt.setAttribute('text-anchor', 'end');
        txt.setAttribute('fill', isCurrentBit ? '#38bdf8' : '#64748b');
        txt.setAttribute('font-size', '10');
        txt.setAttribute('font-family', 'monospace');
        txt.setAttribute('font-weight', isCurrentBit ? 'bold' : 'normal');
        txt.textContent = `bit ${b}`;
        rulerG.appendChild(txt);
      }
      svg.appendChild(rulerG);
    }

    // 5. 渲染父子连线
    const edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const pathNodeSet = new Set(state.activePathNodeIds || []);

    for (const node of nodes) {
      if (node.parentId != null) {
        const parent = nodes.find((n) => n.id === node.parentId);
        if (parent && parent.x !== undefined && parent.y !== undefined && node.x !== undefined && node.y !== undefined) {
          const isEdgeInPath = pathNodeSet.has(node.id) && pathNodeSet.has(parent.id);
          const isDual = node.isDualMatch;
          const isFallback = node.isFallback;

          const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const midY = (parent.y + node.y) / 2;
          const d = `M ${parent.x} ${parent.y} C ${parent.x} ${midY}, ${node.x} ${midY}, ${node.x} ${node.y}`;
          pathElem.setAttribute('d', d);
          pathElem.setAttribute('fill', 'none');

          let strokeColor = '#334155';
          let strokeWidth = '1.5';

          if (isEdgeInPath) {
            strokeWidth = '3';
            if (isDual) {
              strokeColor = '#10b981';
            } else if (isFallback) {
              strokeColor = '#f59e0b';
            } else {
              strokeColor = '#38bdf8';
            }
          }
          pathElem.setAttribute('stroke', strokeColor);
          pathElem.setAttribute('stroke-width', strokeWidth);
          edgesG.appendChild(pathElem);
        }
      }
    }
    svg.appendChild(edgesG);

    // 6. 渲染节点
    const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) continue;

      const isRoot = node.id === 1;
      const isActive = state.activeNodeId === node.id;
      const isInPath = pathNodeSet.has(node.id);
      const isDual = node.isDualMatch;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const r = isRoot ? 17 : 14;
      circle.setAttribute('r', String(r));

      let fillColor = '#0f172a';
      let strokeColor = '#475569';
      let strokeWidth = '1.5';

      if (isActive) {
        fillColor = isDual ? '#064e3b' : '#0369a1';
        strokeColor = isDual ? '#34d399' : '#38bdf8';
        strokeWidth = '2.5';
        circle.setAttribute('filter', isDual ? 'url(#glow-gold)' : 'url(#glow-cyan)');
      } else if (isInPath) {
        fillColor = '#1e293b';
        strokeColor = isDual ? '#10b981' : '#0284c7';
        strokeWidth = '2';
      }

      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', strokeWidth);
      g.appendChild(circle);

      // 节点文本
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('fill', isActive ? '#ffffff' : '#e2e8f0');
      text.setAttribute('font-size', isRoot ? '9' : '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'monospace');
      text.textContent = isRoot ? 'ROOT' : node.label ?? (node.bit !== null && node.bit !== undefined ? String(node.bit) : '');
      g.appendChild(text);

      nodesG.appendChild(g);
    }
    svg.appendChild(nodesG);

    container.appendChild(svg);
  }

  /**
   * 渲染 Card 2 辅助诊断视图：包含二进制分解、静态连续内存映射表与前缀流
   */
  public static renderTrieCard2(container: HTMLElement, state: TrieCard2State): void {
    if (!container) return;
    container.innerHTML = '';
    const root = document.createElement('div');
    root.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow-y:auto;';

    // 1. 顶部全局决策与最优解横幅
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; flex-shrink:0;';

    const decisionSpan = document.createElement('span');
    decisionSpan.style.cssText = 'font-weight:700; color:#334155;';
    decisionSpan.textContent = state.decision || '01-Trie 步进推演中...';

    const maxBadge = document.createElement('div');
    maxBadge.style.cssText = 'display:flex; align-items:center; gap:6px; font-size:11px;';
    const pairTxt = state.bestPair ? `[${state.bestPair[0]}, ${state.bestPair[1]}]` : '';
    maxBadge.innerHTML = `
      <span style="color:#64748b;">全局最大异或:</span>
      <span style="color:#d97706; font-weight:800; font-family:ui-monospace,monospace; font-size:13px;">${state.globalMaxXor ?? 0}</span>
      ${pairTxt ? `<span style="color:#94a3b8; font-size:10px;">(${pairTxt})</span>` : ''}
    `;

    topBar.appendChild(decisionSpan);
    topBar.appendChild(maxBadge);
    root.appendChild(topBar);

    // 2. 根据 StageId 渲染特异性辅助面板
    if (state.stageId === 'stage-2' && state.staticTable) {
      // Stage 2: 静态连续数组内存映射表 (tree[N][2])
      const tableWrap = document.createElement('div');
      tableWrap.style.cssText = 'flex:1; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; overflow-y:auto;';

      let rowsHtml = '';
      for (const row of state.staticTable.rows) {
        const isCur = row.index === state.staticTable.activeRow;
        const rowBg = isCur ? '#e0f2fe' : '#ffffff';
        const rowColor = isCur ? '#0369a1' : '#334155';
        const fontWeight = isCur ? '700' : '500';
        rowsHtml += `
          <tr style="background:${rowBg}; color:${rowColor}; font-weight:${fontWeight}; border-bottom:1px solid #f1f5f9;">
            <td style="padding:4px 6px; text-align:center; color:#94a3b8;">${row.index}</td>
            <td style="padding:4px 8px; font-family:ui-monospace,monospace; color:${row.left > 0 ? '#15803d' : '#94a3b8'};">${row.left}</td>
            <td style="padding:4px 8px; font-family:ui-monospace,monospace; color:${row.right > 0 ? '#15803d' : '#94a3b8'};">${row.right}</td>
            <td style="padding:4px 6px; font-size:10px; color:${isCur ? '#0284c7' : '#94a3b8'};">${isCur ? '◀ 正在寻址' : '—'}</td>
          </tr>
        `;
      }

      tableWrap.innerHTML = `
        <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
          <span>竞赛连续静态数组 (tree[N][2]) 内存映射</span>
          <span style="color:#94a3b8; font-size:10px;">已分配节点数: ${state.trieSize ?? state.staticTable.rows.length}</span>
        </div>
        <table style="width:100%; text-align:left; border-collapse:collapse; font-size:11px; font-family:ui-monospace,monospace;">
          <thead>
            <tr style="color:#64748b; font-size:10px; border-bottom:1px solid #e2e8f0; background:#f8fafc;">
              <th style="padding:4px 6px; text-align:center;">Node idx</th>
              <th style="padding:4px 8px;">tree[idx][0]</th>
              <th style="padding:4px 8px;">tree[idx][1]</th>
              <th style="padding:4px 6px;">状态</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
      root.appendChild(tableWrap);
    } else if (state.stageId === 'stage-3' && state.prefixXorList) {
      // Stage 3: 前缀异或自反性流 (Prefix XOR Stream)
      const pfxWrap = document.createElement('div');
      pfxWrap.style.cssText = 'flex:1; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;';

      let itemsHtml = '';
      for (const item of state.prefixXorList) {
        const isCur = item.isCurrent;
        const itemBg = isCur ? '#fffbeb' : '#f8fafc';
        const itemBorder = isCur ? '#fde68a' : '#e2e8f0';
        const itemColor = isCur ? '#b45309' : '#334155';
        itemsHtml += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:4px 8px; border-radius:4px; font-size:11px; background:${itemBg}; border:1px solid ${itemBorder}; color:${itemColor};">
            <span style="font-weight:700;">eor[0..${item.idx}]</span>
            <span style="color:#64748b; font-family:ui-monospace,monospace;">原数: ${item.num}</span>
            <span style="font-weight:800; color:#15803d; font-family:ui-monospace,monospace;">累积前缀异或: ${item.eor}</span>
          </div>
        `;
      }

      pfxWrap.innerHTML = `
        <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:4px; display:flex; justify-content:space-between;">
          <span>前缀异或自反性集合: eor[j..i] = eor[i] ^ eor[j-1]</span>
          <span style="color:#94a3b8; font-size:10px;">当前累积: ${state.curXor ?? 0}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; overflow-y:auto;">${itemsHtml}</div>
      `;
      root.appendChild(pfxWrap);
    } else {
      // Stage 1: 二进制位分解与贪心对偶分支探测仪表盘
      const diagWrap = document.createElement('div');
      diagWrap.style.cssText = 'flex:1; display:grid; grid-template-columns:1fr 1fr; gap:8px;';

      const curNumBin = state.curNum !== undefined ? state.curNum.toString(2).padStart(6, '0') : '000000';
      const curXorBin = state.curXor !== undefined ? state.curXor.toString(2).padStart(6, '0') : '000000';

      diagWrap.innerHTML = `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="font-size:11px; font-weight:700; color:#334155;">当前数字探测二进制位分解</div>
          <div style="display:flex; flex-direction:column; gap:4px; margin:6px 0; font-size:11px;">
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>十进制数值:</span><span style="color:#0284c7; font-weight:700;">${state.curNum ?? '—'}</span></div>
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>6-bit 格式:</span><span style="color:#334155; font-family:ui-monospace,monospace; font-weight:700;">${curNumBin}</span></div>
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>当前探测位:</span><span style="color:#d97706; font-weight:700; font-family:ui-monospace,monospace;">bit ${state.curBit ?? '—'}</span></div>
          </div>
          <div style="font-size:10px; color:#94a3b8;">向高位 ➔ 低位逐位按位运算提取</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="font-size:11px; font-weight:700; color:#334155;">贪心对偶分支裁决结果</div>
          <div style="display:flex; flex-direction:column; gap:4px; margin:6px 0; font-size:11px;">
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>期望最优对偶:</span><span style="color:#15803d; font-weight:700;">${state.expectedBit ?? '—'}</span></div>
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>实际走向分支:</span><span style="color:${state.actualBit === state.expectedBit ? '#15803d' : '#d97706'}; font-weight:700;">${state.actualBit ?? '—'}</span></div>
            <div style="display:flex; justify-content:space-between; color:#64748b;"><span>当前累计异或:</span><span style="color:#d97706; font-weight:800; font-family:ui-monospace,monospace;">${state.curXor ?? 0} (${curXorBin})</span></div>
          </div>
          <div style="font-size:10px; color:${state.actualBit === state.expectedBit ? '#15803d' : '#b45309'};">${state.actualBit === state.expectedBit ? '🟢 命中对偶分支，异或位贡献 1' : '🟡 对偶分支缺失，保底走向现有分支'}</div>
        </div>
      `;
      root.appendChild(diagWrap);
    }

    container.appendChild(root);
  }
}
