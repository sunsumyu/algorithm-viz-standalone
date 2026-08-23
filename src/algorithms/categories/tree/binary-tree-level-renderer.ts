/**
 * 二叉树层序遍历可视化器（BFS）
 * LeetCode 102
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './binary-tree-level.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BTLStep {
  tree: TreeNode | null;
  queue: number[];          // 当前队列中的节点值
  current: number | null;   // 当前访问的节点值
  level: number;            // 当前层数
  visited: number;          // 已访问节点数
  result: number[][];       // 已收集的层结果
  message: string;
  log: string;
  codeLine: number | number[];
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

function getTreeNodes(root: TreeNode | null): { val: number; level: number; left: number | null; right: number | null }[] {
  const nodes: { val: number; level: number; left: number | null; right: number | null }[] = [];
  if (!root) return nodes;
  const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];
  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    nodes.push({ val: node.val, level, left: node.left?.val ?? null, right: node.right?.val ?? null });
    if (node.left) queue.push({ node: node.left, level: level + 1 });
    if (node.right) queue.push({ node: node.right, level: level + 1 });
  }
  return nodes;
}

function buildBTLSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  if (!root) {
    steps.push({
      tree: null, queue: [], current: null, level: 0, visited: 0, result: [],
      message: '空树，直接返回空列表。',
      log: '空树。',
      codeLine: 1,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  const result: number[][] = [];
  let visited = 0;

  steps.push({
    tree: root, queue: [root.val], current: null, level: 0, visited: 0, result: [],
    message: `初始化队列，放入根节点 ${root.val}。`,
    log: `入队 ${root.val}。`,
    codeLine: [1, 2],
  });

  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelNodes: number[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      levelNodes.push(node.val);
      visited++;
      steps.push({
        tree: root, queue: queue.map((n) => n.val), current: node.val, level: result.length, visited, result: [...result, [...levelNodes]],
        message: `访问节点 ${node.val}（层数 ${result.length}），加入当前层列表。`,
        log: `出队 ${node.val}，加入层级 ${result.length}。`,
        codeLine: [3, 4],
      });
      if (node.left) {
        queue.push(node.left);
        steps.push({
          tree: root, queue: queue.map((n) => n.val), current: node.left.val, level: result.length, visited, result: [...result, [...levelNodes]],
          message: `${node.val} 左孩子 ${node.left.val} 入队。`,
          log: `入队 ${node.left.val}（左孩子）。`,
          codeLine: 5,
        });
      }
      if (node.right) {
        queue.push(node.right);
        steps.push({
          tree: root, queue: queue.map((n) => n.val), current: node.right.val, level: result.length, visited, result: [...result, [...levelNodes]],
          message: `${node.val} 右孩子 ${node.right.val} 入队。`,
          log: `入队 ${node.right.val}（右孩子）。`,
          codeLine: 5,
        });
      }
    }
    result.push(levelNodes);
    steps.push({
      tree: root, queue: queue.map((n) => n.val), current: null, level: result.length, visited, result: [...result],
      message: `第 ${result.length - 1} 层完成：[${levelNodes.join(', ')}]。`,
      log: `层 ${result.length - 1} 完成：[${levelNodes.join(', ')}]。`,
      codeLine: 6,
    });
  }

  steps.push({
    tree: root, queue: [], current: null, level: result.length, visited, result,
    message: `遍历结束，共 ${result.length} 层，结果：${JSON.stringify(result)}。`,
    log: `完成，共 ${result.length} 层。`,
    codeLine: 7,
  });
  return steps;
}

export class BinaryTreeLevelVisualizer extends StepVisualizer<BTLStep> {
  protected codeLines = [
    'public List<List<Integer>> levelOrder(TreeNode root) {',
    '    if (root == null) return new ArrayList<>();',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Queue<TreeNode> queue = new LinkedList<>();',
    '    queue.offer(root);',
    '    while (!queue.isEmpty()) {',
    '        int size = queue.size();',
    '        List<Integer> level = new ArrayList<>();',
    '        for (int i = 0; i < size; i++) {',
    '            TreeNode node = queue.poll();',
    '            level.add(node.val);',
    '            if (node.left != null) queue.offer(node.left);',
    '            if (node.right != null) queue.offer(node.right);',
    '        }',
    '        res.add(level);',
    '    }',
    '    return res;',
    '}',
  ];
  protected codePanelTitle = '层序遍历代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private qlenEl: HTMLElement | null = null;
  private levelEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;

  private treeData: (number | null)[] = [3, 9, 20, null, null, 15, 7];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#btl-tree');
    this.logEl = this.root.querySelector('#btl-log');
    this.qlenEl = this.root.querySelector('#btl-qlen');
    this.levelEl = this.root.querySelector('#btl-level');
    this.visitedEl = this.root.querySelector('#btl-visited');
    this.depthEl = this.root.querySelector('#btl-depth');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#btl-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll('.btl-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = (btn as HTMLButtonElement).dataset.id;
        if (d === '1') this.treeData = [3, 9, 20, null, null, 15, 7];
        else if (d === '2') this.treeData = [1, 2, 3, 4, 5];
        else this.treeData = [];
        this.start();
      });
    });
  }

  protected buildSteps(): BTLStep[] {
    const root = buildTree(this.treeData);
    return buildBTLSteps(root);
  }

  protected renderStep(step: BTLStep): void {
    if (this.qlenEl) this.qlenEl.textContent = String(step.queue.length);
    if (this.levelEl) this.levelEl.textContent = step.level >= 0 ? String(step.level) : '-';
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited);
    if (this.depthEl) this.depthEl.textContent = String(step.result.length);
    this.renderTree(step);
    this.renderLogLine(step);
  }

  private renderTree(step: BTLStep): void {
    if (!this.treeEl || !step.tree) return;
    const nodes = getTreeNodes(step.tree);
    this.treeEl.innerHTML = '';
    const maxLevel = Math.max(...nodes.map((n) => n.level), 0);
    const levelHeight = 40;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String((maxLevel + 1) * levelHeight + 40));
    svg.setAttribute('viewBox', `0 0 600 ${(maxLevel + 1) * levelHeight + 40}`);
    // 递归绘制节点
    const drawNode = (node: TreeNode, x: number, y: number, spread: number) => {
      const isCurrent = step.current === node.val;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      // 绘制边
      if (node.left) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x));
        line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x - spread));
        line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a');
        line.setAttribute('stroke-width', '2');
        g.appendChild(line);
        drawNode(node.left, x - spread, y + levelHeight, spread / 2);
      }
      if (node.right) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x));
        line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x + spread));
        line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a');
        line.setAttribute('stroke-width', '2');
        g.appendChild(line);
        drawNode(node.right, x + spread, y + levelHeight, spread / 2);
      }
      // 绘制节点
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '16');
      circle.setAttribute('fill', isCurrent ? '#f38ba8' : '#45475a');
      circle.setAttribute('stroke', isCurrent ? '#f38ba8' : '#6c7086');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(y + 5));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#cdd6f4');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = String(node.val);
      g.appendChild(text);
      svg.appendChild(g);
    };
    drawNode(step.tree!, 300, 30, 120);
    this.treeEl.appendChild(svg);
  }

  private renderLogLine(step: BTLStep): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'binary-tree-level',
  name: '二叉树层序遍历（BFS）',
  viewId: 'algo-binary-tree-level-view',
  category: 'tree',
  description: '队列逐层遍历，返回每层节点值列表',
  icon: '🌲',
  template,
  Visualizer: BinaryTreeLevelVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握 BFS 层序遍历队列模型',
});