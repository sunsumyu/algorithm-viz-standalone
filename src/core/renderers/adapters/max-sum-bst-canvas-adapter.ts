/**
 * 二叉搜索子树最大键值和表现层适配器 (Max Sum BST Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将纯净 SVG 二叉树沙盘与 Card 2 Info 结构体决策面板彻底封装解耦
 */

import { MaxSumBstStep, BstTreeNode } from './max-sum-bst-step-compiler';

export class MaxSumBstCanvasAdapter {
  /**
   * Card 1: 纯净 SVG 二叉树沙盘渲染 (零标题、零指标、零嵌套)
   */
  static renderCanvas(container: HTMLElement, step: MaxSumBstStep): void {
    const nodeMap = new Map<number, BstTreeNode>();
    step.nodes.forEach((n) => nodeMap.set(n.id, n));

    // 连线 SVG
    const linesHtml = step.nodes
      .map((node) => {
        const leftChild = node.left !== undefined ? nodeMap.get(node.left) : null;
        const rightChild = node.right !== undefined ? nodeMap.get(node.right) : null;
        const nx = node.x ?? 250;
        const ny = node.y ?? 40;

        let res = '';
        if (leftChild) {
          const lx = leftChild.x ?? 150;
          const ly = leftChild.y ?? 100;
          res += `<line x1="${nx}" y1="${ny}" x2="${lx}" y2="${ly}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
        }
        if (rightChild) {
          const rx = rightChild.x ?? 350;
          const ry = rightChild.y ?? 100;
          res += `<line x1="${nx}" y1="${ny}" x2="${rx}" y2="${ry}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
        }
        return res;
      })
      .join('');

    // 节点 SVG
    const nodesHtml = step.nodes
      .map((n) => {
        const nx = n.x ?? 250;
        const ny = n.y ?? 40;
        const isCurrent = step.currentNodeId === n.id;
        const isBestRoot = step.bestBstRootId === n.id;

        let fill = 'rgba(30, 41, 59, 0.92)';
        let stroke = 'rgba(255, 255, 255, 0.28)';
        let textColor = '#f8fafc';
        let filter = 'none';

        if (isBestRoot) {
          fill = 'rgba(6, 78, 59, 0.65)';
          stroke = '#34d399';
          textColor = '#34d399';
          filter = 'drop-shadow(0 0 10px rgba(52,211,153,0.65))';
        }
        if (isCurrent) {
          fill = 'rgba(234, 179, 8, 0.35)';
          stroke = '#facc15';
          textColor = '#fde047';
          filter = 'drop-shadow(0 0 12px rgba(250,204,21,0.85))';
        }

        return `
          <g style="filter: ${filter};">
            <circle cx="${nx}" cy="${ny}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${
          isCurrent || isBestRoot ? 3 : 1.5
        }" />
            <text x="${nx}" y="${
          ny + 5
        }" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle" font-family="system-ui, sans-serif">${
          n.val
        }</text>
            <text x="${nx}" y="${
          ny + 35
        }" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="monospace">#${n.id}</text>
            ${
              isBestRoot
                ? `<text x="${nx}" y="${ny - 28}" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">★ 最优根</text>`
                : isCurrent
                ? `<text x="${nx}" y="${ny - 28}" font-size="10" fill="#facc15" font-weight="700" text-anchor="middle">🔍 当前</text>`
                : ''
            }
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
        <div style="position: absolute; top: 12px; right: 16px; display: flex; gap: 14px; font-size: 0.8rem; background: rgba(15,23,42,0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="color: #facc15; display: flex; align-items: center; gap: 4px;">● 当前探查点</span>
          <span style="color: #34d399; display: flex; align-items: center; gap: 4px;">★ 最优BST根</span>
        </div>
        <svg viewBox="0 0 520 280" style="width: 100%; max-height: 320px; overflow: visible;">
          ${linesHtml}
          ${nodesHtml}
        </svg>
      </div>
    `;
  }

  /**
   * Card 2: 辅助决策沙盘 (Info 结构体三联探针与全局决策)
   */
  static renderCustomMetrics(container: HTMLElement, step: MaxSumBstStep): void {
    const { leftInfo, rightInfo, currentInfo, isCurrentBst, maxSumGlobal, bestBstRootId, stackFrames, stageId } =
      step;

    const stackHtml =
      stageId === 'stage3' && stackFrames
        ? `
        <div style="padding: 8px 12px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.78rem; font-weight: 600; color: #94a3b8;">🥞 显式迭代栈:</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            ${
              stackFrames.length
                ? stackFrames
                    .map(
                      (id) =>
                        `<span style="background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #38bdf8; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">ID:${id}</span>`
                    )
                    .join('')
                : '<span style="color:#64748b; font-size:0.75rem;">(栈空)</span>'
            }
          </div>
        </div>
      `
        : '';

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        ${stackHtml}

        <!-- Info 结构体三联探针面板 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1;">
          <!-- Left Info -->
          <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(2, 6, 23, 0.5); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>左子树 Info</span>
              <span style="font-size: 0.72rem; color: #64748b;">Postorder L</span>
            </div>
            ${
              leftInfo
                ? `
              <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
                <div>isBST: <strong style="color: ${leftInfo.isBST ? '#34d399' : '#f87171'};">${leftInfo.isBST}</strong></div>
                <div>区间: [${leftInfo.min === Infinity ? 'INF' : leftInfo.min}, ${leftInfo.max === -Infinity ? '-INF' : leftInfo.max}]</div>
                <div>键值和: <strong style="color: #fde047;">${leftInfo.sum}</strong></div>
              </div>
            `
                : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">尚未探查或空节点</div>`
            }
          </div>

          <!-- Current Node Decision -->
          <div style="padding: 10px; border-radius: 8px; border: 1px solid ${
            isCurrentBst ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.08)'
          }; background: ${isCurrentBst ? 'rgba(6, 78, 59, 0.25)' : 'rgba(2, 6, 23, 0.5)'}; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #fde047; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>当前节点决策</span>
              <span style="font-size: 0.72rem; font-weight: bold; color: ${isCurrentBst ? '#34d399' : '#94a3b8'};">
                ${currentInfo ? (isCurrentBst ? 'BST 成立' : '非 BST') : '评估中'}
              </span>
            </div>
            ${
              currentInfo
                ? `
              <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
                <div>isBST: <strong style="color: ${currentInfo.isBST ? '#34d399' : '#f87171'};">${currentInfo.isBST}</strong></div>
                <div>区间: [${currentInfo.min}, ${currentInfo.max}]</div>
                <div>当前和: <strong style="color: #34d399;">${currentInfo.sum}</strong></div>
              </div>
            `
                : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待子树汇报汇聚...</div>`
            }
          </div>

          <!-- Right Info -->
          <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(2, 6, 23, 0.5); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #c084fc; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>右子树 Info</span>
              <span style="font-size: 0.72rem; color: #64748b;">Postorder R</span>
            </div>
            ${
              rightInfo
                ? `
              <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
                <div>isBST: <strong style="color: ${rightInfo.isBST ? '#34d399' : '#f87171'};">${rightInfo.isBST}</strong></div>
                <div>区间: [${rightInfo.min === Infinity ? 'INF' : rightInfo.min}, ${rightInfo.max === -Infinity ? '-INF' : rightInfo.max}]</div>
                <div>键值和: <strong style="color: #fde047;">${rightInfo.sum}</strong></div>
              </div>
            `
                : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">尚未探查或空节点</div>`
            }
          </div>
        </div>

        <!-- 全局最大和状态 -->
        <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #34d399;">🏆 全局最高 BST 键值和: <strong style="font-size: 0.95rem; color: #f1f5f9;">${maxSumGlobal}</strong></span>
          <span style="color: #94a3b8; font-size: 0.76rem;">最优根节点: <strong style="color: #cbd5e1;">${
            bestBstRootId !== null ? `ID #${bestBstRootId}` : '暂无'
          }</strong></span>
        </div>
      </div>
    `;
  }
}

export const renderMaxSumBstCanvas = MaxSumBstCanvasAdapter.renderCanvas;
export const renderMaxSumBstCard2 = MaxSumBstCanvasAdapter.renderCustomMetrics;
