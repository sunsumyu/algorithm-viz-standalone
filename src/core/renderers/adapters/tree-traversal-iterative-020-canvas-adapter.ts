/**
 * Iterative Tree Traversals (Class 020) Canvas Adapter
 * 二叉树非递归遍历拓扑与双栈探针渲染器
 */

import {
  Traversal020Step,
  SAMPLE_TREE_LAYOUT,
} from './tree-traversal-iterative-020-step-compiler';

// ============================================================
// Card 1: 纯净二叉树拓扑沙盘 (SVG Canvas)
// 零内嵌指标卡、零子卡片套娃 (Anti-Traps 9 & 10)
// ============================================================
export function renderTreeTraversalCanvas(container: HTMLElement, step: Traversal020Step): void {
  const { activeNode, visitedResult, mainStack, collectStack } = step;
  const inMainStackSet = new Set(mainStack);
  const inCollectSet = new Set(collectStack || []);
  const visitedSet = new Set(visitedResult);

  // 连线 SVG
  const linesHtml: string[] = [];
  Object.values(SAMPLE_TREE_LAYOUT).forEach((node) => {
    if (node.left && SAMPLE_TREE_LAYOUT[node.left]) {
      const child = SAMPLE_TREE_LAYOUT[node.left];
      const isPath =
        (activeNode === node.val && inMainStackSet.has(child.val)) ||
        (visitedSet.has(node.val) && visitedSet.has(child.val));
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${child.x}" y2="${child.y}"
          stroke="${isPath ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isPath ? 2.5 : 1.5}"
        />
      `);
    }
    if (node.right && SAMPLE_TREE_LAYOUT[node.right]) {
      const child = SAMPLE_TREE_LAYOUT[node.right];
      const isPath =
        (activeNode === node.val && inMainStackSet.has(child.val)) ||
        (visitedSet.has(node.val) && visitedSet.has(child.val));
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${child.x}" y2="${child.y}"
          stroke="${isPath ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isPath ? 2.5 : 1.5}"
        />
      `);
    }
  });

  // 节点 SVG
  const nodesHtml = Object.values(SAMPLE_TREE_LAYOUT).map((node) => {
    const isActive = node.val === activeNode;
    const isVisited = visitedSet.has(node.val);
    const inMain = inMainStackSet.has(node.val);
    const inCollect = inCollectSet.has(node.val);

    let fillColor = '#1e293b';
    let strokeColor = 'rgba(255, 255, 255, 0.2)';
    let orderBadge = '';

    if (isActive) {
      fillColor = '#0284c7';
      strokeColor = '#38bdf8';
    } else if (isVisited) {
      fillColor = 'rgba(16, 185, 129, 0.25)';
      strokeColor = '#10b981';
      const visitIdx = visitedResult.indexOf(node.val) + 1;
      orderBadge = `#${visitIdx}`;
    } else if (inMain) {
      fillColor = 'rgba(139, 92, 246, 0.25)';
      strokeColor = '#8b5cf6';
    } else if (inCollect) {
      fillColor = 'rgba(245, 158, 11, 0.25)';
      strokeColor = '#f59e0b';
    }

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isActive ? `<circle r="26" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="19"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${isActive ? 3 : 2}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="#f8fafc"
          font-size="13"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.val}</text>
        ${
          orderBadge
            ? `
          <rect x="-14" y="-30" width="28" height="14" rx="4" fill="#10b981" />
          <text y="-20" text-anchor="middle" fill="#064e3b" font-size="9" font-weight="bold" font-family="monospace">${orderBadge}</text>
        `
            : inMain
            ? `
          <text y="-23" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="monospace">栈中</text>
        `
            : ''
        }
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 760 240" style="width: 100%; height: 100%; max-height: 270px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 显式堆栈状态与访问时序面板 (Custom Metrics)
// ============================================================
export function renderTreeTraversalCard2(container: HTMLElement, step: Traversal020Step): void {
  const { traversalType, mainStack, collectStack, visitedResult, activeNode, decision } = step;

  const hasCollect = traversalType === 'postorder';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部四联仪表盘 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">遍历模式</div>
          <div style="font-size: 0.85rem; font-weight: bold; color: #38bdf8; margin-top: 2px;">
            ${traversalType.toUpperCase()}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">主栈 mainStack</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #a78bfa; font-family: monospace; margin-top: 2px;">
            ${mainStack.length} 项
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">当前聚焦</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #34d399; font-family: monospace; margin-top: 2px;">
            ${activeNode >= 0 ? `Node ${activeNode}` : '无'}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">输出进度</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #facc15; font-family: monospace; margin-top: 2px;">
            ${visitedResult.length} / 6
          </div>
        </div>
      </div>

      <!-- 堆栈状态视窗 (主栈 mainStack & 收集栈 collectStack) -->
      <div style="display: grid; grid-template-columns: ${hasCollect ? '1fr 1fr' : '1fr'}; gap: 10px; flex: 1;">
        <!-- 主工作栈 -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column;">
          <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>🥞 工作栈 mainStack (底 ➔ 顶)</span>
            <span style="font-size: 0.7rem; color: #a78bfa;">LIFO</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 42px;">
            ${
              mainStack.length === 0
                ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">栈为空</span>`
                : mainStack
                    .map(
                      (v, i) => `
                <div style="padding: 4px 10px; background: rgba(139, 92, 246, 0.15); border: 1px solid ${
                  i === mainStack.length - 1 ? '#a78bfa' : 'rgba(139, 92, 246, 0.4)'
                }; border-radius: 6px; font-size: 0.85rem; font-weight: bold; color: #f1f5f9; display: flex; align-items: center; gap: 4px;">
                  <span>${v}</span>
                  ${i === mainStack.length - 1 ? `<span style="font-size: 0.65rem; color: #a78bfa; font-weight: normal;">(顶)</span>` : ''}
                </div>
              `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- 双栈法收集栈 -->
        ${
          hasCollect
            ? `
          <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>📥 收集栈 collectStack (底 ➔ 顶)</span>
              <span style="font-size: 0.7rem; color: #f59e0b;">中右左 ➔ 左右中</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 42px;">
              ${
                !collectStack || collectStack.length === 0
                  ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">收集栈为空</span>`
                  : collectStack
                      .map(
                        (v, i) => `
                  <div style="padding: 4px 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid ${
                    i === collectStack.length - 1 ? '#fbbf24' : 'rgba(245, 158, 11, 0.4)'
                  }; border-radius: 6px; font-size: 0.85rem; font-weight: bold; color: #f1f5f9; display: flex; align-items: center; gap: 4px;">
                    <span>${v}</span>
                    ${i === collectStack.length - 1 ? `<span style="font-size: 0.65rem; color: #fbbf24; font-weight: normal;">(顶)</span>` : ''}
                  </div>
                `
                      )
                      .join('')
              }
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- 最终访问序列展流 (Result Stream) -->
      <div style="padding: 10px 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px;">
        <div style="font-size: 0.75rem; font-weight: 600; color: #34d399; margin-bottom: 6px;">
          📜 访问输出序列 (Traversal Result)
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          ${
            visitedResult.length === 0
              ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待节点弹出访问...</span>`
              : visitedResult
                  .map(
                    (v, idx) => `
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <span style="font-size: 0.85rem; font-weight: bold; color: #10b981; font-family: monospace;">${v}</span>
                  ${idx < visitedResult.length - 1 ? `<span style="color: #64748b; font-size: 0.75rem;">➜</span>` : ''}
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>

      <!-- 当前时序决策总结 -->
      <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
        <strong style="color: #38bdf8;">当前时序决策：</strong> ${decision}
      </div>
    </div>
  `;
}
