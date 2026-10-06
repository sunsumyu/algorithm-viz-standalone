/**
 * 二叉树高频递归套路画布适配器 (Tree Recursion Patterns Canvas Adapter)
 * 左程云算法通关课 Class 019
 * 负责中序防重叠拓扑排布与 Card 2 Info 结构体探针三联视窗
 */

import { TreeNodeData, TreeRecursionStep } from './tree-recursion-019-step-compiler';

export interface LayoutNode {
  id: number;
  val: number;
  depth: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

export function calculateTreeLayout(nodes: TreeNodeData[], width = 760, height = 260): Map<number, LayoutNode> {
  const layout = new Map<number, LayoutNode>();
  if (!nodes || nodes.length === 0) return layout;

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const childIds = new Set<number>();
  nodes.forEach((n) => {
    if (n.left !== undefined) childIds.add(n.left);
    if (n.right !== undefined) childIds.add(n.right);
  });
  const rootNode = nodes.find((n) => !childIds.has(n.id)) || nodes[0];

  const inOrderList: number[] = [];
  function inorder(id: number | undefined, depth: number) {
    if (id === undefined || !nodeMap.has(id)) return;
    const node = nodeMap.get(id)!;
    inorder(node.left, depth + 1);
    inOrderList.push(id);
    inorder(node.right, depth + 1);
  }
  inorder(rootNode.id, 0);

  const total = inOrderList.length;
  const paddingX = 60;
  const availableW = width - paddingX * 2;
  const stepX = total > 1 ? availableW / (total - 1) : 0;

  function assignPositions(id: number | undefined, depth: number) {
    if (id === undefined || !nodeMap.has(id)) return;
    const node = nodeMap.get(id)!;
    const order = inOrderList.indexOf(id);
    const x = total > 1 ? paddingX + order * stepX : width / 2;
    const y = 45 + depth * 60;
    layout.set(id, {
      id,
      val: node.val,
      depth,
      x,
      y,
      left: node.left,
      right: node.right,
    });
    assignPositions(node.left, depth + 1);
    assignPositions(node.right, depth + 1);
  }

  assignPositions(rootNode.id, 0);
  return layout;
}

export function renderTreeRecursionCanvas(container: HTMLElement, step: TreeRecursionStep) {
  const { nodes, currentNodeId } = step;
  const layout = calculateTreeLayout(nodes, 760, 260);

  // 生成父子连线
  const linesHtml: string[] = [];
  layout.forEach((node) => {
    if (node.left !== undefined && layout.has(node.left)) {
      const leftChild = layout.get(node.left)!;
      const isHighlighted = currentNodeId === node.id || currentNodeId === leftChild.id;
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${leftChild.x}" y2="${leftChild.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
        />
      `);
    }
    if (node.right !== undefined && layout.has(node.right)) {
      const rightChild = layout.get(node.right)!;
      const isHighlighted = currentNodeId === node.id || currentNodeId === rightChild.id;
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${rightChild.x}" y2="${rightChild.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
        />
      `);
    }
  });

  // 生成节点
  const nodesHtml: string[] = [];
  layout.forEach((node) => {
    const isCurrent = node.id === currentNodeId;
    const isReturn = isCurrent && step.phase === 'return';
    const baseColor = isCurrent ? '#38bdf8' : '#64748b';
    const fillColor = isCurrent ? (isReturn ? '#10b981' : '#0284c7') : '#1e293b';

    nodesHtml.push(`
      <g transform="translate(${node.x}, ${node.y})">
        ${isCurrent ? `<circle r="26" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="19"
          fill="${fillColor}"
          stroke="${isCurrent ? '#ffffff' : 'rgba(255,255,255,0.2)'}"
          stroke-width="${isCurrent ? 2.5 : 1.5}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="#f8fafc"
          font-size="12"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.val}</text>
        <text
          y="-25"
          text-anchor="middle"
          fill="#94a3b8"
          font-size="9"
          font-family="monospace"
        >ID #${node.id}</text>
      </g>
    `);
  });

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 760 260" style="width: 100%; height: 100%; max-height: 280px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml.join('')}
        </svg>
      </div>
    </div>
  `;
}

export function renderTreeRecursionCard2(container: HTMLElement, step: TreeRecursionStep) {
  const { currentNodeId, phase, collectedInfo, decision, leftInfoSnapshot, rightInfoSnapshot, stageId } = step;

  const phaseText =
    phase === 'enter'
      ? '向下探测 (Enter)'
      : phase === 'left-done'
      ? '左树完毕 (Left Done)'
      : phase === 'right-done'
      ? '右树完毕 (Right Done)'
      : '信息汇聚返回 (Return)';

  const phaseColor =
    phase === 'enter'
      ? '#38bdf8'
      : phase === 'left-done' || phase === 'right-done'
      ? '#f59e0b'
      : '#10b981';

  let metric1Label = '计算高度 (Height)';
  let metric1Val = `${collectedInfo.height}`;
  let metric2Label = '平衡状态 (IsBalanced)';
  let metric2Val = collectedInfo.isBalanced ? 'TRUE (平衡)' : 'FALSE (失衡)';
  let metric2Color = collectedInfo.isBalanced ? '#10b981' : '#ef4444';

  if (stageId === 'stage2') {
    metric1Label = '覆盖极值区间 [Min, Max]';
    metric1Val = `[${collectedInfo.minVal ?? 'Null'}, ${collectedInfo.maxVal ?? 'Null'}]`;
    metric2Label = 'BST 成立状态';
    metric2Val = collectedInfo.isBST ? 'TRUE (合法 BST)' : 'FALSE (破损)';
    metric2Color = collectedInfo.isBST ? '#10b981' : '#ef4444';
  } else if (stageId === 'stage3') {
    metric1Label = '子树高度 (Height)';
    metric1Val = `${collectedInfo.height}`;
    metric2Label = '最大节点距离 (Max Distance)';
    metric2Val = `${collectedInfo.maxDistance ?? 0}`;
    metric2Color = '#f59e0b';
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部探针三联药丸 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">当前递归节点</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            ${currentNodeId !== null ? `Node #${currentNodeId}` : 'Null (空)'}
          </div>
        </div>
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">递归生命周期</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: ${phaseColor}; margin-top: 2px;">
            ${phaseText}
          </div>
        </div>
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">${metric2Label}</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: ${metric2Color}; font-family: monospace; margin-top: 2px;">
            ${metric2Val}
          </div>
        </div>
      </div>

      <!-- Info 结构体探针三联视窗 (左子树 Info | 当前决策聚合 | 右子树 Info) -->
      <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 8px; flex: 1;">
        <!-- Left Info -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; font-size: 0.75rem;">
          <div style="font-weight: 600; color: #38bdf8; margin-bottom: 4px;">左子树 Info (Left)</div>
          ${
            leftInfoSnapshot
              ? `<div style="font-family: monospace; color: #cbd5e1; line-height: 1.5;">${JSON.stringify(leftInfoSnapshot, null, 1).replace(/[{}]/g, '')}</div>`
              : `<div style="color: #64748b; font-style: italic;">尚未收集或为空</div>`
          }
        </div>

        <!-- Current Decision -->
        <div style="padding: 10px; background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; font-size: 0.75rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-weight: 600; color: #38bdf8;">后序聚合决策 (Aggregate)</div>
          <div style="color: #e2e8f0; line-height: 1.4; margin: 4px 0;">${decision}</div>
          <div style="font-size: 0.7rem; color: #94a3b8;">指标: <strong style="color: #f8fafc;">${metric1Label}: ${metric1Val}</strong></div>
        </div>

        <!-- Right Info -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; font-size: 0.75rem;">
          <div style="font-weight: 600; color: #fb7185; margin-bottom: 4px;">右子树 Info (Right)</div>
          ${
            rightInfoSnapshot
              ? `<div style="font-family: monospace; color: #cbd5e1; line-height: 1.5;">${JSON.stringify(rightInfoSnapshot, null, 1).replace(/[{}]/g, '')}</div>`
              : `<div style="color: #64748b; font-style: italic;">尚未收集或为空</div>`
          }
        </div>
      </div>

      <!-- 核心树形 DP 三步法法则 -->
      <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.74rem; color: #cbd5e1; line-height: 1.4;">
        <strong style="color: #38bdf8;">树形 DP 递归套路：</strong>
        1. 统一设计结构体 Info；2. 假设左右子树均已返回 Info；3. 汇总左右信息计算当前节点 Info 并返回。
      </div>
    </div>
  `;
}

export const TreeRecursion019CanvasAdapter = {
  renderCanvas: renderTreeRecursionCanvas,
  renderCustomMetrics: renderTreeRecursionCard2,
};
