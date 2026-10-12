import { ForwardStarStep } from '../../../algorithms/categories/graph/forward-star-step-compiler';

// 4 节点经典布局坐标
const FOUR_NODE_COORDINATES: Record<number, { x: number; y: number }> = {
  1: { x: 75, y: 85 },
  2: { x: 175, y: 85 },
  3: { x: 275, y: 85 },
  4: { x: 175, y: 195 },
};

export class ForwardStarCanvasAdapter {
  public static render(container: HTMLElement, step: ForwardStarStep): void {
    const {
      head,
      edges,
      curEdgeIndex,
      curNode,
      traversedEdges,
      allNodes,
      allRawEdges,
      mode,
      message,
      stepSummaryBadge,
      activeCodeLineKey,
    } = step;

    // 确定当前透视节点 (可被用户点击动态切换)
    let perspectiveNode = (container as any)._perspectiveNode;
    if (!perspectiveNode || !allNodes.includes(perspectiveNode)) {
      perspectiveNode = step.selectedPerspectiveNode ?? (curNode ?? allNodes[0] ?? 1);
      (container as any)._perspectiveNode = perspectiveNode;
    }

    // 统计各节点当前出度 (以便标出出度最多)
    const outDegrees: Record<number, number> = {};
    allNodes.forEach((n) => (outDegrees[n] = 0));
    edges.forEach((ed) => {
      outDegrees[ed.u] = (outDegrees[ed.u] || 0) + 1;
    });
    let maxDegNode = allNodes[0] || 1;
    let maxDeg = -1;
    allNodes.forEach((n) => {
      if ((outDegrees[n] || 0) > maxDeg) {
        maxDeg = outDegrees[n] || 0;
        maxDegNode = n;
      }
    });

    // 1. 构建当前透视节点的出边链 (从 head[perspectiveNode] 开始沿着 next 单向遍历)
    const perspectiveChain: number[] = [];
    let pPtr = head[perspectiveNode] ?? -1;
    const visitedSet = new Set<number>();
    while (pPtr !== -1 && pPtr < edges.length && !visitedSet.has(pPtr)) {
      visitedSet.add(pPtr);
      perspectiveChain.push(pPtr);
      pPtr = edges[pPtr].next;
    }

    const headDisplayVal = head[perspectiveNode] === -1 || head[perspectiveNode] === undefined ? 0 : head[perspectiveNode] + 1;

    // 羊肉串卡片 HTML
    const chainItemsHtml = perspectiveChain.length > 0
      ? perspectiveChain.map((eIdx, idx) => {
          const ed = edges[eIdx];
          const displayE = eIdx + 1;
          const isLatest = idx === 0;
          const isCurEdge = curEdgeIndex === eIdx;
          const cardBorder = isCurEdge ? '#38bdf8' : isLatest ? '#0284c7' : '#334155';
          const cardBg = isCurEdge
            ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.95))'
            : isLatest
            ? 'linear-gradient(135deg, rgba(14, 116, 144, 0.4), rgba(15, 23, 42, 0.8))'
            : 'rgba(15, 23, 42, 0.7)';

          return `
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <!-- 边实体卡片 -->
              <div style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; border-radius: 8px; padding: 6px 12px; min-width: 130px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-family: monospace; font-size: 12px; font-weight: 800; color: #f8fafc;">
                  [边 ${displayE}] ${ed.u} ➔ ${ed.to} <span style="color: #fbbf24; font-size: 11px;">(权: ${ed.weight})</span>
                </div>
                <div style="font-size: 10px; color: ${isLatest ? '#38bdf8' : '#94a3b8'}; margin-top: 2px;">
                  ${isLatest ? '最新加入的边 (表头)' : '更早加入的边'}
                </div>
              </div>

              <!-- 连接箭头 -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-size: 10px; font-family: monospace; padding: 0 2px;">
                <span style="color: #94a3b8; font-size: 9px;">next</span>
                <span style="font-size: 14px; color: #38bdf8;">➔</span>
              </div>
            </div>
          `;
        }).join('')
      : '';

    const kebabPerspectiveHtml = `
      <!-- 全宽链表透视 (羊肉串模型) -->
      <div style="background: #090f1d; border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px;">🍢</span>
            <span style="font-size: 13px; font-weight: 700; color: #f1f5f9;">全宽链表透视 (羊肉串模型)</span>
            <span style="font-size: 11px; color: #64748b; display: none; sm:inline;">—— 完整展开节点出边链，清晰呈现头插法与单向指引</span>
          </div>

          <!-- 切换查看节点按钮组 -->
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
            <span style="color: #64748b;">切换查看节点:</span>
            ${allNodes.map((u) => {
              const isSelected = u === perspectiveNode;
              const isMax = u === maxDegNode && (outDegrees[u] || 0) > 0;
              const bg = isSelected ? '#2563eb' : '#1e293b';
              const border = isSelected ? '#3b82f6' : '#334155';
              const textCol = isSelected ? '#ffffff' : '#cbd5e1';
              return `
                <button type="button" class="fs-node-btn" data-node="${u}" style="background: ${bg}; border: 1px solid ${border}; color: ${textCol}; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: ${isSelected ? '700' : 'normal'}; cursor: pointer; transition: all 0.2s;">
                  节点 ${u}${isMax ? ' (出度最多)' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 动态链表串联展示 -->
        <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 6px 2px; scrollbar-width: thin;">
          <!-- 表头胶囊 -->
          <div style="background: rgba(30, 58, 138, 0.4); border: 1.5px solid #2563eb; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 12px; font-weight: 700; color: #60a5fa; flex-shrink: 0; box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);">
            表头 head[${perspectiveNode}] = ${headDisplayVal}
          </div>

          <div style="color: #38bdf8; font-size: 14px; flex-shrink: 0;">➔</div>

          ${chainItemsHtml}

          <!-- 终结符 0 (链表尾) -->
          <div style="background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 12px; font-weight: 700; color: #94a3b8; flex-shrink: 0; display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
            <span>0 (链表尾)</span>
          </div>
        </div>
      </div>
    `;

    // 2. 左栏：图拓扑画板
    // 计算坐标映射
    const isClassic4 = allNodes.length === 4 && allNodes.every((n, i) => n === i + 1);
    const getCoord = (u: number): { x: number; y: number } => {
      if (isClassic4 && FOUR_NODE_COORDINATES[u]) {
        return FOUR_NODE_COORDINATES[u];
      }
      // 通用圆形布局
      const idx = allNodes.indexOf(u);
      const angle = (idx / allNodes.length) * 2 * Math.PI - Math.PI / 2;
      return {
        x: 175 + 105 * Math.cos(angle),
        y: 135 + 85 * Math.sin(angle),
      };
    };

    // 拓扑边
    const svgEdges = allRawEdges.map((e, idx) => {
      const from = getCoord(e.u);
      const to = getCoord(e.v);
      const displayE = idx + 1;
      const isExistingInBuild = mode === 'build' ? idx <= (curEdgeIndex ?? -1) : true;
      if (!isExistingInBuild) return '';

      const isCurrent = curEdgeIndex === idx;
      const isTraversed = traversedEdges.includes(idx);

      let strokeColor = 'rgba(100, 116, 139, 0.5)';
      let strokeWidth = 2;
      let markerId = 'fs-arrow-default';
      let badgeBg = '#0b1120';
      let badgeBorder = '#334155';
      let badgeText = '#94a3b8';

      if (isCurrent) {
        strokeColor = '#38bdf8';
        strokeWidth = 3.5;
        markerId = 'fs-arrow-active';
        badgeBg = '#0284c7';
        badgeBorder = '#38bdf8';
        badgeText = '#ffffff';
      } else if (isTraversed) {
        strokeColor = '#10b981';
        strokeWidth = 3;
        markerId = 'fs-arrow-traversed';
        badgeBg = '#065f46';
        badgeBorder = '#34d399';
        badgeText = '#a7f3d0';
      }

      // 控制弧度避免双向或重合边冲突
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;

      return `
        <g class="fs-svg-edge">
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="url(#${markerId})" />
          <g transform="translate(${mx}, ${my})">
            <rect x="-18" y="-9" width="36" height="18" rx="5" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.2" />
            <text x="0" y="3.5" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle" fill="${badgeText}">
              e${displayE}:w${e.w}
            </text>
          </g>
        </g>
      `;
    }).join('');

    // 拓扑节点
    const svgNodes = allNodes.map((u) => {
      const pos = getCoord(u);
      const isPerspective = u === perspectiveNode;
      const isCur = curNode === u;

      let fill = '#1e293b';
      let stroke = '#475569';
      let textFill = '#f8fafc';

      if (isPerspective || isCur) {
        fill = '#1d4ed8';
        stroke = '#60a5fa';
        textFill = '#ffffff';
      }

      const glow = (isPerspective || isCur)
        ? `<circle cx="${pos.x}" cy="${pos.y}" r="22" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3" opacity="0.8" />`
        : '';

      return `
        <g class="fs-svg-node" data-node="${u}" style="cursor: pointer;">
          ${glow}
          <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4.5}" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle" fill="${textFill}">
            ${u}
          </text>
        </g>
      `;
    }).join('');

    // 3. 中栏：顶点头指针网格与边池静态链表
    const headBoxesHtml = allNodes.map((u) => {
      const hIdx = head[u] ?? -1;
      const hDisplay = hIdx === -1 ? 0 : hIdx + 1;
      const isPerspective = u === perspectiveNode;
      const bg = isPerspective ? 'rgba(30, 58, 138, 0.4)' : '#0b1329';
      const border = isPerspective ? '#3b82f6' : '#1e293b';
      const numColor = isPerspective ? '#60a5fa' : hDisplay > 0 ? '#38bdf8' : '#64748b';

      return `
        <div class="fs-node-box" data-node="${u}" style="background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 6px 4px; text-align: center; cursor: pointer; transition: all 0.2s;">
          <div style="font-size: 10px; color: #94a3b8;">节点 ${u}</div>
          <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: ${numColor}; margin-top: 2px;">
            ${hDisplay}
          </div>
        </div>
      `;
    }).join('');

    const edgeRowsHtml = edges.length > 0
      ? edges.map((ed, idx) => {
          const displayE = idx + 1;
          const displayNext = ed.next === -1 ? 0 : ed.next + 1;
          const isCur = curEdgeIndex === idx;
          const rowBg = isCur ? 'rgba(30, 58, 138, 0.6)' : idx % 2 === 0 ? 'rgba(15, 23, 42, 0.6)' : 'rgba(11, 19, 41, 0.6)';
          const rowBorder = isCur ? 'border-left: 3px solid #38bdf8;' : '';

          return `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr 1.2fr 1fr; background: ${rowBg}; border-bottom: 1px solid #1e293b; text-align: center; font-family: monospace; font-size: 11px; padding: 6px 2px; align-items: center; ${rowBorder}">
              <div style="font-weight: 700; color: ${isCur ? '#facc15' : '#f8fafc'};">${displayE}</div>
              <div style="color: #38bdf8; font-weight: 700;">${ed.u}</div>
              <div style="color: #34d399; font-weight: 700;">${ed.to}</div>
              <div style="color: #a78bfa; font-weight: 700;">${displayNext}</div>
              <div style="color: #fbbf24; font-weight: 700;">${ed.weight}</div>
            </div>
          `;
        }).join('')
      : `
        <div style="padding: 18px; text-align: center; color: #64748b; font-size: 11px;">边池暂未分配，等待加边...</div>
      `;

    // 4. 右栏：执行源码步进
    const isToLine = activeCodeLineKey === 'to';
    const isNextLine = activeCodeLineKey === 'next';
    const isHeadLine = activeCodeLineKey === 'head';
    const isTraverseLoop = activeCodeLineKey === 'traverse_loop';
    const isTraverseVisit = activeCodeLineKey === 'traverse_visit';
    const isTraverseNext = activeCodeLineKey === 'traverse_next';

    const getLineStyle = (active: boolean) =>
      active
        ? 'background: rgba(30, 58, 138, 0.6); color: #38bdf8; font-weight: 700; border-left: 3px solid #38bdf8; padding-left: 6px;'
        : 'color: #94a3b8; padding-left: 9px;';

    const codeSnippetHtml = mode === 'build'
      ? `
        <div style="font-family: monospace; font-size: 11px; line-height: 1.7; color: #cbd5e1;">
          <div style="color: #64748b;">// 1. 边的编号自增并存储终点与权值</div>
          <div style="${getLineStyle(isToLine)}">to[++cnt] = v;</div>
          <div style="${getLineStyle(isToLine)}">weight[cnt] = w;</div>
          <div style="margin-top: 4px; color: #64748b;">// 2. 继承旧表头 (头插法核心)</div>
          <div style="${getLineStyle(isNextLine)}">next[cnt] = head[u];</div>
          <div style="margin-top: 4px; color: #64748b;">// 3. 更新头指针</div>
          <div style="${getLineStyle(isHeadLine)}">head[u] = cnt; // 更新头指针</div>
        </div>
      `
      : `
        <div style="font-family: monospace; font-size: 11px; line-height: 1.7; color: #cbd5e1;">
          <div style="color: #64748b;">// 逆序遍历顶点 u 的所有出边</div>
          <div style="${getLineStyle(isTraverseLoop)}">for (int e = head[u]; e != 0; e = next[e]) {</div>
          <div style="${getLineStyle(isTraverseVisit)}">&nbsp;&nbsp;int v = to[e], w = weight[e];</div>
          <div style="${getLineStyle(isTraverseVisit)}">&nbsp;&nbsp;visit(u, v, w);</div>
          <div style="${getLineStyle(isTraverseNext)}">}</div>
        </div>
      `;

    // 组合主画布布局 (完全对齐截图审美)
    container.innerHTML = `
      <div style="width: 100%; background: #070c18; border-radius: 12px; padding: 14px; color: #f1f5f9; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${kebabPerspectiveHtml}

        <!-- 下半部三列网格排布 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; align-items: stretch;">
          
          <!-- 左栏：图拓扑画板 -->
          <div style="background: #090f1d; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #38bdf8;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
                图拓扑画板
              </div>
              <span style="font-size: 10px; color: #64748b;">${allNodes.length} 节点带权有向图</span>
            </div>

            <!-- SVG 画板 -->
            <div style="flex: 1; min-height: 230px; background: #060a14; border: 1px solid #131c31; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <svg width="100%" height="100%" viewBox="0 0 350 240" style="display: block;">
                <defs>
                  <marker id="fs-arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                  </marker>
                  <marker id="fs-arrow-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                  </marker>
                  <marker id="fs-arrow-traversed" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                  </marker>
                </defs>
                ${svgEdges}
                ${svgNodes}
              </svg>
            </div>

            <!-- 底部解说条 (截图中左下角关键区域) -->
            <div style="margin-top: 10px; background: #0b1329; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">当前步骤解说</span>
                <span style="background: rgba(30, 58, 138, 0.5); border: 1px solid #2563eb; color: #60a5fa; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: monospace;">
                  ${stepSummaryBadge || '运行中'}
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                ${message}
              </div>
            </div>
          </div>

          <!-- 中栏：顶点头指针 & 边池静态链表 -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 上：顶点头指针 -->
            <div style="background: #090f1d; border: 1px solid #1e293b; border-radius: 12px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #38bdf8;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
                  顶点头指针: head[u]
                </div>
                <span style="font-size: 10px; color: #64748b;">点击切换透视节点</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(${Math.min(allNodes.length, 6)}, 1fr); gap: 6px;">
                ${headBoxesHtml}
              </div>
            </div>

            <!-- 下：边池静态链表 -->
            <div style="background: #090f1d; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; flex: 1; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #a78bfa;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #a78bfa; display: inline-block;"></span>
                  边池静态链表
                </div>
                <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">当前边数 cnt: <b style="color: #facc15;">${edges.length}</b></span>
              </div>

              <div style="flex: 1; max-height: 220px; overflow-y: auto; border: 1px solid #1e293b; border-radius: 6px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr 1.2fr 1fr; background: #0f172a; border-bottom: 1px solid #334155; font-size: 10px; color: #94a3b8; text-align: center; padding: 6px 2px;">
                  <div>边号<br/><span style="color:#64748b;">e</span></div>
                  <div>起点<br/><span style="color:#64748b;">u</span></div>
                  <div>终点<br/><span style="color:#38bdf8;">to[e]</span></div>
                  <div>下条边<br/><span style="color:#a78bfa;">next[e]</span></div>
                  <div>权重<br/><span style="color:#fbbf24;">w[e]</span></div>
                </div>
                <div>
                  ${edgeRowsHtml}
                </div>
              </div>
            </div>
          </div>

          <!-- 右栏：执行源码步进 & 核心思想深度精讲 -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 上：源码步进 -->
            <div style="background: #090f1d; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #38bdf8;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
                  执行源码步进
                </div>
                <span style="background: #1e293b; color: #94a3b8; font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
                  ${mode === 'build' ? 'addEdge(u, v, w)' : 'traverse(u)'}
                </span>
              </div>
              <div style="background: #060a14; border: 1px solid #131c31; border-radius: 8px; padding: 10px;">
                ${codeSnippetHtml}
              </div>
            </div>

            <!-- 下：核心问答教学卡片 (完全对齐截图中的金色问答) -->
            <div style="background: #090f1d; border: 1px solid #854d0e; border-radius: 12px; padding: 12px; background: linear-gradient(180deg, rgba(20, 24, 38, 0.9) 0%, rgba(26, 21, 10, 0.6) 100%);">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #fbbf24; margin-bottom: 6px;">
                <span>💡</span>
                <span>为什么 next 永远指向更小的边?</span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.6;">
                因为这是<b>头插法</b>：后加入的边（边号更大）插入在链表最前端；它的 next 永远保存着刚才的旧表头（边号必定更小）。指针永远只指向更早加入的边，绝对不会回头！
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // 绑定透视节点点击切换交互
    const buttons = container.querySelectorAll('.fs-node-btn, .fs-node-box, .fs-svg-node');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = parseInt(btn.getAttribute('data-node') || '0', 10);
        if (targetNode > 0) {
          (container as any)._perspectiveNode = targetNode;
          ForwardStarCanvasAdapter.render(container, step);
        }
      });
    });
  }
}
