/**
 * 监控二叉树可视化器（贪心算法）
 * LeetCode 968
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './tree-cameras.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

type NodeState = 0 | 1 | 2; // 0=未覆盖, 1=有摄像头, 2=已覆盖
type ActionType = 'enter' | 'place' | 'leave' | 'done';

interface CameraStep {
  root: TreeNode | null;
  current: TreeNode | null;
  state: Map<number, NodeState>;
  cameraCount: number;
  action: ActionType;
  message: string;
  codeLine: number;
}

function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  const root: TreeNode = { val: arr[0]!, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function buildCameraSteps(root: TreeNode | null): CameraStep[] {
  const steps: CameraStep[] = [];
  const state = new Map<number, NodeState>();
  let cameraCount = 0;

  function dfs(node: TreeNode | null): NodeState {
    if (!node) return 2; // 空节点返回已覆盖

    steps.push({
      root,
      current: node,
      state: new Map(state),
      cameraCount,
      action: 'enter',
      message: `进入节点 ${node.val}`,
      codeLine: 6
    });

    // 递归处理左右子树
    const leftState = dfs(node.left);
    const rightState = dfs(node.right);

    // 贪心策略：如果任一子节点未被覆盖，在当前节点放置摄像头
    if (leftState === 0 || rightState === 0) {
      cameraCount++;
      state.set(node.val, 1);
      steps.push({
        root,
        current: node,
        state: new Map(state),
        cameraCount,
        action: 'place',
        message: `在节点 ${node.val} 放置摄像头！摄像头总数=${cameraCount}`,
        codeLine: 11
      });
      return 1; // 当前节点有摄像头，覆盖自己和邻居
    }

    // 如果子节点有摄像头，当前节点已被覆盖
    if (leftState === 1 || rightState === 1) {
      state.set(node.val, 2);
      steps.push({
        root,
        current: node,
        state: new Map(state),
        cameraCount,
        action: 'leave',
        message: `节点 ${node.val} 被子节点的摄像头覆盖`,
        codeLine: 15
      });
      return 2;
    }

    // 两个子节点都未覆盖且没有摄像头
    state.set(node.val, 0);
    steps.push({
      root,
      current: node,
      state: new Map(state),
      cameraCount,
      action: 'leave',
      message: `节点 ${node.val} 未被覆盖`,
      codeLine: 18
    });
    return 0;
  }

  if (root) {
    dfs(root);
  }

  steps.push({
    root,
    current: null,
    state: new Map(state),
    cameraCount,
    action: 'done',
    message: `完成！最少需要 ${cameraCount} 个摄像头`,
    codeLine: 20
  });

  return steps;
}

export class TreeCamerasVisualizer extends StepVisualizer<CameraStep> {
  protected codeLines = [
    "public int minCameraCover(TreeNode root) {",
    "    int[] count = new int[1];",
    "    ",
    "    // 0=未覆盖, 1=有摄像头, 2=已覆盖",
    "    dfs(root, count);",
    "    return count[0];",
    "}",
    "",
    "private int dfs(TreeNode node, int[] count) {",
    "    if (node == null) return 2; // 空节点已覆盖",
    "    ",
    "    int left = dfs(node.left, count);",
    "    int right = dfs(node.right, count);",
    "    ",
    "    // 子节点未覆盖，当前节点放摄像头",
    "    if (left == 0 || right == 0) {",
    "        count[0]++;",
    "        return 1;",
    "    }",
    "    ",
    "    // 子节点有摄像头，当前节点已覆盖",
    "    if (left == 1 || right == 1) {",
    "        return 2;",
    "    }",
    "    ",
    "    // 否则当前节点未覆盖",
    "    return 0;",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private treeData: (number | null)[] = [0, 0, 0, 0, null, 0, 0];

  protected initDOMElements(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.bindPlaybackControls({
      reset: 'treecame-reset',
      prev: 'treecame-prev',
      play: 'treecame-play',
      next: 'treecame-next',
      speed: 'treecame-speed',
      speedLabel: 'treecame-speed-label',
      message: 'treecame-status'
    });

    this.root.querySelector('#treecame-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): CameraStep[] {
    const root = buildTree(this.treeData);
    return buildCameraSteps(root);
  }

  protected renderStep(step: CameraStep): void {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!step.root) return;

    // 绘制树
    const nodePositions = new Map<number, { x: number; y: number }>();
    this.drawTree(ctx, step.root, canvas.width / 2, 50, canvas.width / 4, nodePositions, step);

    // 更新状态显示
    const countEl = this.root?.querySelector('#camera-count');
    if (countEl) countEl.textContent = step.cameraCount.toString();
  }

  private drawTree(
    ctx: CanvasRenderingContext2D,
    node: TreeNode | null,
    x: number,
    y: number,
    spread: number,
    positions: Map<number, { x: number; y: number }>,
    step: CameraStep
  ): void {
    if (!node) return;

    positions.set(node.val, { x, y });

    // 绘制边
    if (node.left) {
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x - spread, y + 60);
      ctx.strokeStyle = step.state.get(node.left.val) === 1 ? '#a6e3a1' : '#45475a';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawTree(ctx, node.left, x - spread, y + 60, spread / 2, positions, step);
    }

    if (node.right) {
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + spread, y + 60);
      ctx.strokeStyle = step.state.get(node.right.val) === 1 ? '#a6e3a1' : '#45475a';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawTree(ctx, node.right, x + spread, y + 60, spread / 2, positions, step);
    }

    // 绘制节点
    const nodeState = step.state.get(node.val) ?? 0;
    const isCurrent = step.current?.val === node.val;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);

    // 根据状态设置颜色
    if (nodeState === 1) {
      ctx.fillStyle = '#a6e3a1'; // 有摄像头 - 绿色
    } else if (nodeState === 2) {
      ctx.fillStyle = '#89b4fa'; // 已覆盖 - 蓝色
    } else {
      ctx.fillStyle = '#f38ba8'; // 未覆盖 - 红色
    }

    if (isCurrent) {
      ctx.strokeStyle = '#f9e2af';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 2;
    }

    ctx.fill();
    ctx.stroke();

    // 绘制节点值
    ctx.fillStyle = '#1e1e2e';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.val.toString(), x, y);

    // 有摄像头时绘制摄像头图标
    if (nodeState === 1) {
      ctx.fillStyle = '#1e1e2e';
      ctx.font = '10px sans-serif';
      ctx.fillText('📹', x, y - 25);
    }
  }
}

registerAlgorithm({
  id: 'tree-cameras',
  name: '监控二叉树',
  viewId: 'algo-tree-cameras-view',
  category: 'greedy',
  description: 'LeetCode 968：贪心算法，计算监控二叉树所需的最少摄像头数量',
  icon: '📹',
  template,
  Visualizer: TreeCamerasVisualizer,
  difficulty: 3,
  levelOrder: 18,
  learningGoal: '理解树形贪心加状态机的最少监控覆盖',
});