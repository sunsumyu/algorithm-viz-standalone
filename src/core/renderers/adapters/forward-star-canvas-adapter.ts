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
          const cardBorder = isCurEdge ? '#eab308' : isLatest ? '#3b82f6' : '#cbd5e1';
          const cardBg = isCurEdge ? '#fefce8' : isLatest ? '#eff6ff' : '#ffffff';
          const titleColor = isCurEdge ? '#854d0e' : isLatest ? '#1d4ed8' : '#0f172a';
          const subColor = isCurEdge ? '#a16207' : isLatest ? '#2563eb' : '#64748b';
          const badgeBg = isCurEdge ? '#fef08a' : isLatest ? '#dbeafe' : '#f1f5f9';
          const badgeColor = isCurEdge ? '#854d0e' : isLatest ? '#1e40af' : '#334155';

          return `
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <!-- 边实体卡片 -->
              <div style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; border-radius: 8px; padding: 7px 12px; min-width: 165px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-family: monospace; font-size: 12px; font-weight: 800; color: ${titleColor};">
                  <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 6px; border-radius: 4px; border: 1px solid ${cardBorder}; font-size: 11px;">边 #${displayE}</span>
                  <span>点 ${ed.u} ➔ 点 ${ed.to}</span>
                  <span style="background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; border: 1px solid #fde68a; font-size: 11px; font-weight: 800;">权 ${ed.weight}</span>
                </div>
                <div style="font-size: 10.5px; color: ${subColor}; font-weight: 600; margin-top: 3px;">
                  ${isCurEdge ? '⭐ 正在处理的边' : isLatest ? '最新加入的边 (表头指向)' : '更早加入的边'}
                </div>
              </div>

              <!-- 连接箭头 -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; font-family: monospace; padding: 0 2px;">
                <span style="color: #64748b; font-size: 9px; font-weight: 700;">next 边号</span>
                <span style="font-size: 15px; color: #2563eb; font-weight: 800;">➔</span>
              </div>
            </div>
          `;
        }).join('')
      : '';

    const kebabPerspectiveHtml = `
      <!-- 全宽链表透视 (羊肉串模型) -->
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🍢</span>
            <span style="font-size: 13px; font-weight: 800; color: #0f172a;">全宽链表透视 (羊肉串模型)</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 500;">—— 完整展开节点出边链，清晰呈现头插法与单向指引</span>
          </div>

          <!-- 切换查看节点按钮组 -->
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
            <span style="color: #64748b; font-weight: 600;">切换查看节点:</span>
            ${allNodes.map((u) => {
              const isSelected = u === perspectiveNode;
              const isMax = u === maxDegNode && (outDegrees[u] || 0) > 0;
              const bg = isSelected ? '#2563eb' : '#f1f5f9';
              const border = isSelected ? '#1d4ed8' : '#cbd5e1';
              const textCol = isSelected ? '#ffffff' : '#334155';
              return `
                <button type="button" class="fs-node-btn" data-node="${u}" style="background: ${bg}; border: 1.5px solid ${border}; color: ${textCol}; border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: ${isSelected ? '800' : '600'}; cursor: pointer; transition: all 0.15s; box-shadow: ${isSelected ? '0 2px 4px rgba(37,99,235,0.2)' : 'none'};">
                  节点 ${u}${isMax ? ' (出度最多)' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 动态链表串联展示 -->
        <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 6px 2px; scrollbar-width: thin;">
          <!-- 表头胶囊 -->
          <div style="background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 12px; font-weight: 800; color: #1d4ed8; flex-shrink: 0; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.12);">
            表头 head[点 ${perspectiveNode}] = ${headDisplayVal > 0 ? `边 #${headDisplayVal}` : '0 (空)'}
          </div>

          <div style="color: #3b82f6; font-size: 16px; font-weight: 700; flex-shrink: 0;">➔</div>

          ${chainItemsHtml}

          <!-- 终结符 0 (链表尾) -->
          <div style="background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 11.5px; font-weight: 700; color: #475569; flex-shrink: 0; display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
            <span>next = 0 (链表尾/无出边)</span>
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
      const isExistingInBuild =
        mode === 'build'
          ? step.action === 'build_done'
            ? true
            : curEdgeIndex !== null && idx <= curEdgeIndex
          : true;
      if (!isExistingInBuild) return '';

      const isCurrent = curEdgeIndex === idx;
      const isTraversed = traversedEdges.includes(idx);

      let strokeColor = '#94a3b8';
      let strokeWidth = 2.2;
      let markerId = 'fs-arrow-default';
      let badgeBg = '#ffffff';
      let badgeBorder = '#cbd5e1';
      let badgeText = '#334155';

      if (isCurrent) {
        strokeColor = '#0284c7';
        strokeWidth = 3.5;
        markerId = 'fs-arrow-active';
        badgeBg = '#eff6ff';
        badgeBorder = '#3b82f6';
        badgeText = '#1d4ed8';
      } else if (isTraversed) {
        strokeColor = '#10b981';
        strokeWidth = 3;
        markerId = 'fs-arrow-traversed';
        badgeBg = '#ecfdf5';
        badgeBorder = '#10b981';
        badgeText = '#047857';
      }

      // 控制弧度与标签位置
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;

      return `
        <g class="fs-svg-edge">
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="url(#${markerId})" />
          <g transform="translate(${mx}, ${my})">
            <rect x="-24" y="-9" width="48" height="18" rx="5" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.2" />
            <text x="0" y="3.5" font-size="9.5" font-family="monospace" font-weight="700" text-anchor="middle" fill="${badgeText}">
              边#${displayE}:w${e.w}
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

      let fill = '#ffffff';
      let stroke = '#3b82f6';
      let textFill = '#0f172a';

      if (isPerspective || isCur) {
        fill = '#2563eb';
        stroke = '#1d4ed8';
        textFill = '#ffffff';
      }

      const glow = (isPerspective || isCur)
        ? `<circle cx="${pos.x}" cy="${pos.y}" r="22" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="3 3" opacity="0.9" />`
        : '';

      return `
        <g class="fs-svg-node graph-node" data-node="${u}" style="cursor: pointer;">
          ${glow}
          <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4.5}" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle" fill="${textFill}">
            ${u}
          </text>
        </g>
      `;
    }).join('');

    // 3. 顶点头指针网格
    const headBoxesHtml = allNodes.map((u) => {
      const hIdx = head[u] ?? -1;
      const hDisplay = hIdx === -1 ? 0 : hIdx + 1;
      const isPerspective = u === perspectiveNode;
      const bg = isPerspective ? '#eff6ff' : '#f8fafc';
      const border = isPerspective ? '#3b82f6' : '#cbd5e1';
      const numColor = isPerspective ? '#1d4ed8' : hDisplay > 0 ? '#0284c7' : '#94a3b8';

      return `
        <div class="fs-node-box" data-node="${u}" style="background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 6px 4px; min-height: 52px; text-align: center; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; justify-content: center; box-shadow: ${isPerspective ? '0 2px 6px rgba(59, 130, 246, 0.15)' : 'none'};">
          <div style="font-size: 10.5px; color: #475569; font-weight: 700;">顶点 ${u}</div>
          <div style="font-family: monospace; font-size: 13.5px; font-weight: 800; color: ${numColor}; margin-top: 2px;">
            ${hDisplay > 0 ? `边 #${hDisplay}` : '0 (空)'}
          </div>
        </div>
      `;
    }).join('');

    const edgeRowsHtml = edges.length > 0
      ? edges.map((ed, idx) => {
          const displayE = idx + 1;
          const displayNext = ed.next === -1 ? 0 : ed.next + 1;
          const isCur = curEdgeIndex === idx;
          const rowBg = isCur ? '#fefce8' : idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          const rowBorder = isCur ? 'border-left: 3px solid #eab308;' : '';

          return `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr 1fr; background: ${rowBg}; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-size: 11px; padding: 6px 2px; align-items: center; ${rowBorder}">
              <div style="font-weight: 800; color: ${isCur ? '#a16207' : '#0f172a'};">边 #${displayE}</div>
              <div style="color: #0284c7; font-weight: 700;">点 ${ed.u}</div>
              <div style="color: #059669; font-weight: 700;">点 ${ed.to}</div>
              <div style="color: #7c3aed; font-weight: 700;">${displayNext > 0 ? `边 #${displayNext}` : '0 (尾)'}</div>
              <div style="color: #b45309; font-weight: 800;">${ed.weight}</div>
            </div>
          `;
        }).join('')
      : `
        <div style="padding: 18px; text-align: center; color: #64748b; font-size: 11px;">边池暂未分配，等待加边...</div>
      `;

    // 组合主画布布局 (黄金比例左右双栏，杜绝过度嵌套)
    container.innerHTML = `
      <div style="width: 100%; background: transparent; padding: 4px 2px; color: #0f172a; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${kebabPerspectiveHtml}

        <!-- 下半部左右双栏黄金布局 -->
        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 14px; align-items: stretch;">
          
          <!-- 左栏：图拓扑画板 (放大主导地位) -->
          <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #0284c7;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #0284c7; display: inline-block;"></span>
                图拓扑画板
              </div>
              <span style="font-size: 11px; color: #64748b; font-weight: 600;">模式: ${mode === 'build' ? '⚡ 头插建图' : '🔍 出边遍历'} | 已录入边数: ${edges.length}</span>
            </div>

            <!-- SVG 画板 -->
            <div style="flex: 1; min-height: 250px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <svg width="100%" height="100%" viewBox="0 0 350 240" style="display: block;">
                <defs>
                  <marker id="fs-arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
                  </marker>
                  <marker id="fs-arrow-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
                  </marker>
                  <marker id="fs-arrow-traversed" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                  </marker>
                </defs>
                ${svgEdges}
                ${svgNodes}
              </svg>
            </div>

            <!-- 底部解说条 -->
            <div style="margin-top: 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #1e40af; font-weight: 700;">当前步骤解说</span>
                <span style="background: #dbeafe; border: 1px solid #93c5fd; color: #1d4ed8; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-family: monospace;">
                  ${stepSummaryBadge || '运行中'}
                </span>
              </div>
              <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; font-weight: 500;">
                ${message}
              </div>
            </div>
          </div>

          <!-- 右栏：顶点头指针 & 边池静态链表数据结构 -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 上：顶点头指针 -->
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #0284c7;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #0284c7; display: inline-block;"></span>
                  顶点头指针: head[u]
                </div>
                <span style="font-size: 10.5px; color: #64748b; font-weight: 600;">点击顶点切换透视出边链</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(${Math.min(allNodes.length, 6)}, 1fr); gap: 6px;">
                ${headBoxesHtml}
              </div>
            </div>

            <!-- 中：边池静态链表 -->
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; flex: 1; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #7c3aed;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; display: inline-block;"></span>
                  边池静态链表
                </div>
                <span style="font-size: 11px; color: #475569; font-family: monospace; font-weight: 600;">当前边数 cnt: <b style="color: #059669; font-size: 12px;">${edges.length}</b></span>
              </div>

              <div style="flex: 1; min-height: 140px; max-height: 190px; overflow-y: auto; border: 1.5px solid #e2e8f0; border-radius: 8px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr 1fr; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 10px; font-weight: 700; color: #334155; text-align: center; padding: 6px 2px; position: sticky; top: 0; z-index: 1;">
                  <div>边号<br/><span style="color:#0f172a; font-weight: 700;">e (边号)</span></div>
                  <div>起点<br/><span style="color:#0284c7; font-weight: 700;">u (点)</span></div>
                  <div>终点<br/><span style="color:#059669; font-weight: 700;">to (点)</span></div>
                  <div>下条边<br/><span style="color:#7c3aed; font-weight: 700;">next (边号)</span></div>
                  <div>边权<br/><span style="color:#b45309; font-weight: 700;">w (权值)</span></div>
                </div>
                <div>
                  ${edgeRowsHtml}
                </div>
              </div>
            </div>

            <!-- 下：核心问答教学卡片 -->
            <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 10px 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: #92400e; margin-bottom: 4px;">
                <span>💡</span>
                <span>核心要素快速分清：边号 vs 顶点 vs 边权</span>
              </div>
              <div style="font-size: 11px; color: #78350f; line-height: 1.55; font-weight: 500;">
                • <b>head[u] 与 next[e] 存的都是边号</b>（而非顶点号！），用来在边数组中跳转寻址。<br/>
                • <b>to[e] 存的才是目标顶点号</b>，记录该边连向哪个点。<br/>
                • <b>weight[e] 是边的路径权值</b>（如 35、72 等，通常是数值代价）。<br/>
                • <b>头插法记忆口诀</b>：新边插在最前端，next 记下旧表头，head 改指新边号！
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
