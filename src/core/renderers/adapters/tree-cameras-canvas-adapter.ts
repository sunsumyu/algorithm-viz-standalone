import { TreeNode, CameraStep } from './tree-cameras-step-compiler';

interface LayoutNode {
  id: number;
  val: number;
  x: number;
  y: number;
  left: LayoutNode | null;
  right: LayoutNode | null;
}

function layoutBinaryTree(root: TreeNode | null, width: number, height: number): LayoutNode | null {
  if (!root) return null;

  function getHeight(n: TreeNode | null): number {
    if (!n) return 0;
    return 1 + Math.max(getHeight(n.left), getHeight(n.right));
  }

  const treeHeight = getHeight(root);
  const levelHeight = Math.min(85, (height - 60) / Math.max(1, treeHeight));

  function assignCoords(node: TreeNode | null, depth: number, leftBound: number, rightBound: number): LayoutNode | null {
    if (!node) return null;
    const x = (leftBound + rightBound) / 2;
    const y = 35 + depth * levelHeight;

    const layoutLeft = assignCoords(node.left, depth + 1, leftBound, x);
    const layoutRight = assignCoords(node.right, depth + 1, x, rightBound);

    return {
      id: node.id,
      val: node.val,
      x,
      y,
      left: layoutLeft,
      right: layoutRight,
    };
  }

  return assignCoords(root, 0, 20, width - 20);
}

export function renderTreeCamerasCanvas(container: HTMLElement, step: CameraStep): void {
  const root = step.root;
  const nodeStates = step.nodeStates;

  if (!root) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">空二叉树</div>';
    return;
  }

  const svgW = 540;
  const svgH = 260;
  const layoutRoot = layoutBinaryTree(root, svgW, svgH);

  const linesSvg: string[] = [];
  const nodesSvg: string[] = [];

  function traverse(n: LayoutNode | null): void {
    if (!n) return;

    if (n.left) {
      linesSvg.push(`<line x1="${n.x}" y1="${n.y}" x2="${n.left.x}" y2="${n.left.y}" stroke="#cbd5e1" stroke-width="2" />`);
      traverse(n.left);
    }
    if (n.right) {
      linesSvg.push(`<line x1="${n.x}" y1="${n.y}" x2="${n.right.x}" y2="${n.right.y}" stroke="#cbd5e1" stroke-width="2" />`);
      traverse(n.right);
    }

    const state = nodeStates[n.id];
    const isCurrent = n.id === step.currentNodeId;

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let stateEmoji = '';

    if (state === 1) {
      fill = '#fef2f2';
      stroke = '#ef4444';
      stateEmoji = '📷';
    } else if (state === 2) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
      stateEmoji = '🛡️';
    } else if (state === 0) {
      fill = '#f8fafc';
      stroke = '#94a3b8';
      stateEmoji = '⚪';
    }

    const ringSvg = isCurrent
      ? `<circle cx="${n.x}" cy="${n.y}" r="23" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,3" />`
      : '';

    nodesSvg.push(`
      <g>
        ${ringSvg}
        <circle cx="${n.x}" cy="${n.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${n.x}" y="${n.y - 1}" text-anchor="middle" dominant-baseline="central" font-size="${stateEmoji ? '11px' : '12px'}" font-weight="800" fill="#0f172a" font-family="'JetBrains Mono', monospace">
          ${stateEmoji || n.val}
        </text>
        <text x="${n.x}" y="${n.y + 26}" text-anchor="middle" font-size="9px" font-weight="700" fill="${isCurrent ? '#ef4444' : '#64748b'}">
          ${isCurrent ? '📍当前' : `[${n.id}]`}
        </text>
      </g>
    `);
  }

  traverse(layoutRoot);

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; max-height: 250px;">
        ${linesSvg.join('')}
        ${nodesSvg.join('')}
      </svg>
    </div>
  `;
}
