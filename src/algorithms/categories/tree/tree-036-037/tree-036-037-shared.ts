/**
 * 左程云算法通关课 Class 036 与 Class 037 二叉树高频题目专题
 * 共享数据模型与可视化渲染组件
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface TreeNode036 {
  id: number;
  val: number;
  left?: number | null;
  right?: number | null;
  x?: number;
  y?: number;
}

export interface Tree036Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
  visitedNodes?: number[];
  queue?: (number | string)[];
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  extraData?: any;
}

/**
 * 绘制紧凑美观的 SVG 二叉树沙盘
 */
export function renderTreeSvg(
  nodes: TreeNode036[],
  activeId: number | null | undefined,
  secondaryId?: number | null,
  highlightColor: string = '#3b82f6',
  badges?: Record<number, string>
): string {
  // 简易拓扑坐标预设（支持标准 3~4 层树）
  const posMap: Record<number, { x: number; y: number }> = {
    1: { x: 200, y: 35 },
    2: { x: 100, y: 95 },
    3: { x: 300, y: 95 },
    4: { x: 50, y: 155 },
    5: { x: 150, y: 155 },
    6: { x: 250, y: 155 },
    7: { x: 350, y: 155 },
    8: { x: 30, y: 215 },
    9: { x: 70, y: 215 },
    10: { x: 130, y: 215 },
    11: { x: 170, y: 215 },
    15: { x: 250, y: 155 },
    20: { x: 300, y: 95 },
  };

  let linesHtml = '';
  let nodesHtml = '';

  const nodeMap = new Map<number, TreeNode036>();
  for (const n of nodes) nodeMap.set(n.id, n);

  for (const node of nodes) {
    const parentPos = (node.x != null && node.y != null)
      ? { x: node.x, y: node.y }
      : (posMap[node.id] || { x: 200, y: 40 });

    if (node.left != null) {
      const leftNode = nodeMap.get(node.left);
      const leftPos = (leftNode?.x != null && leftNode?.y != null)
        ? { x: leftNode.x, y: leftNode.y }
        : (posMap[node.left] || { x: parentPos.x - 50, y: parentPos.y + 60 });
      linesHtml += `<line x1="${parentPos.x}" y1="${parentPos.y}" x2="${leftPos.x}" y2="${leftPos.y}" stroke="#94a3b8" stroke-width="2"/>`;
    }
    if (node.right != null) {
      const rightNode = nodeMap.get(node.right);
      const rightPos = (rightNode?.x != null && rightNode?.y != null)
        ? { x: rightNode.x, y: rightNode.y }
        : (posMap[node.right] || { x: parentPos.x + 50, y: parentPos.y + 60 });
      linesHtml += `<line x1="${parentPos.x}" y1="${parentPos.y}" x2="${rightPos.x}" y2="${rightPos.y}" stroke="#94a3b8" stroke-width="2"/>`;
    }

    const isActive = node.id === activeId;
    const isSecondary = node.id === secondaryId;
    const fill = isActive ? highlightColor : isSecondary ? '#f59e0b' : '#ffffff';
    const textColor = (isActive || isSecondary) ? '#ffffff' : '#1e293b';
    const stroke = isActive ? highlightColor : isSecondary ? '#d97706' : '#64748b';
    const badgeText = badges ? badges[node.id] : undefined;

    nodesHtml += `
      <g transform="translate(${parentPos.x}, ${parentPos.y})">
        <circle r="18" fill="${fill}" stroke="${stroke}" stroke-width="${isActive ? 3 : 2}" />
        <text text-anchor="middle" dy="5" fill="${textColor}" font-size="12" font-weight="700">${node.val}</text>
        ${badgeText ? `<text text-anchor="middle" dy="-23" fill="#64748b" font-size="10" font-weight="600">${badgeText}</text>` : ''}
      </g>
    `;
  }

  return `
    <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
      <svg width="420" height="240" viewBox="0 0 400 240" style="max-width: 100%; max-height: 100%; display: block;">
        ${linesHtml}
        ${nodesHtml}
      </svg>
    </div>
  `;
}

/**
 * 绘制层序遍历队列管道
 */
export function renderQueuePipeline(queue: (number | string)[], label: string = '层序遍历单队列'): string {
  return `
    <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span>🚪 ${label}</span>
        <span>当前大小: ${queue.length}</span>
      </div>
      <div style="display: flex; gap: 8px; min-height: 38px; align-items: center; overflow-x: auto;">
        ${queue.length === 0 ? '<span style="font-size: 12px; color: #94a3b8; font-style: italic;">[ 队列为空 ]</span>' : ''}
        ${queue.map((item, idx) => `
          <div style="padding: 4px 10px; border-radius: 6px; background: ${idx === 0 ? '#eff6ff' : '#ffffff'}; border: 1px solid ${idx === 0 ? '#3b82f6' : '#cbd5e1'}; font-weight: 700; font-size: 12px; color: ${idx === 0 ? '#1d4ed8' : '#334155'};">
            ${item} ${idx === 0 ? '<span style="font-size: 9px; color: #2563eb;">(头)</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 绘制指标统计卡片
 */
export function renderMetricsPanel(metrics?: Record<string, string | number>): string {
  if (!metrics || Object.keys(metrics).length === 0) return '';
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
      ${Object.entries(metrics).map(([k, v]) => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 12px;">
          <span style="color: #64748b;">${k}:</span> <strong style="color: #0f172a; margin-left: 4px;">${v}</strong>
        </div>
      `).join('')}
    </div>
  `;
}
