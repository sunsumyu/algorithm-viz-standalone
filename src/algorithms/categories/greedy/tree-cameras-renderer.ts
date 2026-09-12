/**
 * 监控二叉树可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 968：后序自底向上推导，0=无覆盖, 1=有摄像头, 2=已覆盖；贪心在叶子父节点装摄像头
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_CAMERAS_PROBLEM_HTML,
  TREE_CAMERAS_ANALYSIS_HTML,
  TREE_CAMERAS_CODE_LANGUAGES,
} from './tree-cameras-problem-content';

export interface TreeNode {
  id: number;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export type CameraNodeState = 0 | 1 | 2; // 0=无覆盖, 1=有摄像头, 2=已覆盖

export interface CameraStep {
  root: TreeNode | null;
  currentNodeId: number | null;
  nodeStates: Record<number, CameraNodeState>;
  cameraCount: number;
  leftState: number | null;
  rightState: number | null;
  action: 'enter' | 'place_camera' | 'covered_by_child' | 'wait_parent' | 'root_camera' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function parseTreeFromArray(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  let nextId = 1;
  const root: TreeNode = { id: nextId++, val: arr[0]!, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      node.left = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

export function buildTreeCameraSteps(root: TreeNode | null): CameraStep[] {
  const steps: CameraStep[] = [];
  const nodeStates: Record<number, CameraNodeState> = {};
  let cameraCount = 0;

  if (!root) {
    steps.push({
      root: null,
      currentNodeId: null,
      nodeStates: {},
      cameraCount: 0,
      leftState: null,
      rightState: null,
      action: 'done',
      message: '树为空，最小摄像头数量为 0',
      codeLine: 2,
    });
    return steps;
  }

  function dfs(node: TreeNode | null): CameraNodeState {
    if (!node) return 2; // 空节点视为有覆盖

    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'enter',
      message: `🔽 访问节点 [${node.id}] (val=${node.val})，准备递归后序遍历左右子树`,
      codeLine: 13,
    });

    const left = dfs(node.left);
    const right = dfs(node.right);

    // 情况 1：左右孩子只要有一个无覆盖 (0)，当前父节点必须放置摄像头
    if (left === 0 || right === 0) {
      cameraCount++;
      nodeStates[node.id] = 1;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'place_camera',
        message: `📷 【情况1】节点 [${node.id}] 的子节点存在无覆盖 (左=${left}, 右=${right})！贪心在此安装第 ${cameraCount} 台摄像头，返回 1 (有摄像头)`,
        codeLine: 17,
      });
      return 1;
    }

    // 情况 2：左右孩子至少有一个摄像头 (1)，当前节点被摄像头覆盖
    if (left === 1 || right === 1) {
      nodeStates[node.id] = 2;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'covered_by_child',
        message: `🛡️ 【情况2】节点 [${node.id}] 的子节点已有摄像头 (左=${left}, 右=${right})，当前节点处于覆盖范围，返回 2 (已覆盖)`,
        codeLine: 21,
      });
      return 2;
    }

    // 情况 3：左右孩子都已被覆盖 (2)，当前节点暂时无覆盖，留给上层父节点覆盖
    nodeStates[node.id] = 0;
    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: left,
      rightState: right,
      action: 'wait_parent',
      message: `⚪ 【情况3】节点 [${node.id}] 的子节点均为已覆盖 (左=${left}, 右=${right})，当前节点暂无覆盖，留待上层父节点安装摄像头覆盖，返回 0 (无覆盖)`,
      codeLine: 24,
    });
    return 0;
  }

  const rootStatus = dfs(root);

  // 根节点特判：如果根节点返回 0 (无覆盖)，根节点自身必须放一个摄像头
  if (rootStatus === 0) {
    cameraCount++;
    nodeStates[root.id] = 1;

    steps.push({
      root,
      currentNodeId: root.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'root_camera',
      message: `📷 【根节点特判】遍历结束，根节点 [${root.id}] 依然处于无覆盖状态 (无上层父节点)！必须在此补装第 ${cameraCount} 台摄像头`,
      codeLine: 5,
    });
  }

  steps.push({
    root,
    currentNodeId: null,
    nodeStates: { ...nodeStates },
    cameraCount,
    leftState: null,
    rightState: null,
    action: 'done',
    message: `🎉 监控配置完成！监控全树所需最小摄像头数量为 ${cameraCount} 台`,
    codeLine: 7,
  });

  return steps;
}

/* ── Layout Tree & Render SVG ────────────────────────────── */
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


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CameraStep[]): CameraStep[] {
  return steps.map((s) => {
    const isPlace = s.action === 'place_camera' || s.action === 'root_camera';
    const isCover = s.action === 'covered_by_child';
    const isWait = s.action === 'wait_parent';

    let action = '✓ 遍历完成';
    if (isPlace) action = '📷 安装摄像头 (覆照父子)';
    else if (isCover) action = '🛡️ 被子节点摄像头覆盖';
    else if (isWait) action = '⚪ 暂无覆盖 (留待父节点覆盖)';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-node': s.currentNodeId ? `节点 [${s.currentNodeId}]` : '—',
        'children-state': s.leftState !== null ? `(左: ${s.leftState}, 右: ${s.rightState})` : '—',
        cameras: `${s.cameraCount} 台`,
        action,
      },
    };
  });
}

/** 主视觉：二叉树自适应 SVG 沙盘 */
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

function parseTreeInput(raw: string): (number | null)[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => (v === null ? null : Number(v)));
    }
  } catch {
    // fall through
  }
  return [0, 0, null, 0, 0];
}

registerDeclarativeAlgorithm({
  id: 'tree-cameras',
  name: '监控二叉树',
  category: 'greedy',
  description: '后序自底向上贪心遍历，0=无覆盖/1=装摄像头/2=已覆盖，叶子父节点安装摄像头覆盖率最高',
  icon: '📷',
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握二叉树后序遍历与状态机的贪心结合，理解自底向上局部最优推导全局最少的解题范式',
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序数组 (0/1, null 为空)',
      type: 'text',
      defaultValue: '[0,0,null,0,0]',
      placeholder: '[0,0,null,0,0]',
    },
  ],
  presets: [
    { label: '示例 1', values: { tree: '[0,0,null,0,0]' } },
    { label: '示例 2 (需根装摄像头)', values: { tree: '[0,0,null,0,null,0,null,null,1]' } },
    { label: '两侧子树', values: { tree: '[0,0,0,null,null,null,0]' } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前访问节点', color: '#ef4444' },
    { id: 'children-state', label: '子节点状态 (左, 右)', color: '#2563eb' },
    { id: 'cameras', label: '最小摄像头数量', color: '#ef4444' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📷 摄像头', color: '#ef4444' },
    { label: '🛡️ 已覆盖', color: '#3b82f6' },
    { label: '⚪ 无覆盖', color: '#94a3b8' },
  ],
  codeLanguages: TREE_CAMERAS_CODE_LANGUAGES,
  problemHtml: TREE_CAMERAS_PROBLEM_HTML,
  analysisHtml: TREE_CAMERAS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildTreeCameraSteps(parseTreeFromArray(parseTreeInput(String(inputs.tree ?? '[0,0,null,0,0]'))))),
  renderCanvas: (container, step) => renderTreeCamerasCanvas(container, step as CameraStep),
});
