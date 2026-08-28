/**
 * 二叉树最大深度可视化器
 * LeetCode 104
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import template from './tree-depth.html?raw';

export interface TDStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  heights: Map<number, number>; // 节点值 -> 高度
  maxDepth: number;
  action: 'enter' | 'compute' | 'leave';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTDSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const heights = new Map<number, number>();
  let maxDepth = 0;

  steps.push({
    tree: root, current: null, depth: 0, heights: new Map(), maxDepth: 0,
    action: 'enter',
    message: `后序求深度：先递归左右子树，再取较大者 +1。`,
    log: '开始求深度。',
    codeLine: [1, 2],
  });

  const dfs = (node: TreeNode | null, depth: number): number => {
    if (!node) {
      steps.push({
        tree: root, current: null, depth, heights: new Map(heights), maxDepth,
        action: 'enter',
        message: `空节点，返回高度 0。`,
        log: `空节点 → 0`,
        codeLine: 3,
      });
      return 0;
    }
    steps.push({
      tree: root, current: node.val, depth, heights: new Map(heights), maxDepth,
      action: 'enter',
      message: `进入节点 ${node.val}，先求左子树深度。`,
      log: `进入 ${node.val}`,
      codeLine: 4,
    });
    const left = dfs(node.left, depth + 1);
    steps.push({
      tree: root, current: node.val, depth, heights: new Map(heights), maxDepth,
      action: 'enter',
      message: `节点 ${node.val} 的左子树深度 = ${left}，再求右子树。`,
      log: `${node.val}.left = ${left}`,
      codeLine: 4,
    });
    const right = dfs(node.right, depth + 1);
    const h = Math.max(left, right) + 1;
    heights.set(node.val, h);
    if (depth + 1 > maxDepth) maxDepth = depth + 1;
    steps.push({
      tree: root, current: node.val, depth, heights: new Map(heights), maxDepth,
      action: 'compute',
      message: `节点 ${node.val}：max(左${left}, 右${right}) + 1 = ${h}。`,
      log: `${node.val} 高度=${h}`,
      codeLine: 5,
    });
    return h;
  };

  dfs(root, 0);

  steps.push({
    tree: root, current: null, depth: 0, heights: new Map(heights), maxDepth,
    action: 'leave',
    message: `完成，二叉树最大深度 = ${maxDepth}。`,
    log: `最大深度 = ${maxDepth}`,
    codeLine: 6,
  });
  return steps;
}

export class TreeDepthVisualizer extends StepVisualizer<TDStep> {
  protected codeLines = [
    'public int maxDepth(TreeNode root) {',
    '    if (root == null) return 0;',
    '    // 空节点深度为 0',
    '    int left = maxDepth(root.left);',
    '    int right = maxDepth(root.right);',
    '    return Math.max(left, right) + 1;',
    '}',
  ];
  protected codePanelTitle = '最大深度代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private hEl: HTMLElement | null = null;
  private maxEl: HTMLElement | null = null;

  private treeData: (number | null)[] = [3, 9, 20, null, null, 15, 7];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#td-tree');
    this.logEl = this.root.querySelector('#td-log');
    this.curEl = this.root.querySelector('#td-cur');
    this.depthEl = this.root.querySelector('#td-depth');
    this.hEl = this.root.querySelector('#td-h');
    this.maxEl = this.root.querySelector('#td-max');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#td-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.td-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') this.treeData = [3, 9, 20, null, null, 15, 7];
        else if (d === '2') this.treeData = [1, 2, 3, 4, 5];
        else this.treeData = [];
        this.start();
      });
    });
  }

  protected buildSteps(): TDStep[] {
    const root = buildTree(this.treeData);
    return buildTDSteps(root);
  }

  protected renderStep(step: TDStep): void {
    if (this.curEl) this.curEl.textContent = step.current !== null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.hEl) this.hEl.textContent = step.current !== null ? String(step.heights.get(step.current) ?? '?') : '-';
    if (this.maxEl) this.maxEl.textContent = String(step.maxDepth);
    this.renderTree(step);
    this.renderLogLine(step);
  }

  private renderTree(step: TDStep): void {
    if (!this.treeEl || !step.tree) {
      if (this.treeEl) this.treeEl.innerHTML = '<span style="color:#6c7086">空树</span>';
      return;
    }
    this.treeEl.innerHTML = '';
    const levelHeight = 44;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '260');
    svg.setAttribute('viewBox', '0 0 600 260');
    const drawNode = (node: TreeNode, x: number, y: number, spread: number) => {
      const isCurrent = step.current === node.val;
      if (node.left) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        drawNode(node.left, x - spread, y + levelHeight, spread / 2);
      }
      if (node.right) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        drawNode(node.right, x + spread, y + levelHeight, spread / 2);
      }
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y)); circle.setAttribute('r', '16');
      const h = step.heights.get(node.val);
      circle.setAttribute('fill', isCurrent ? '#f38ba8' : h != null ? '#a6e3a1' : '#45475a');
      circle.setAttribute('stroke', isCurrent ? '#f38ba8' : '#6c7086');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x)); text.setAttribute('y', String(y + 5));
      text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#cdd6f4');
      text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
      text.textContent = String(node.val);
      svg.appendChild(text);
      if (h != null) {
        const hlabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hlabel.setAttribute('x', String(x)); hlabel.setAttribute('y', String(y - 22));
        hlabel.setAttribute('text-anchor', 'middle'); hlabel.setAttribute('fill', '#a6e3a1');
        hlabel.setAttribute('font-size', '10');
        hlabel.textContent = `h=${h}`;
        svg.appendChild(hlabel);
      }
    };
    drawNode(step.tree, 300, 30, 110);
    this.treeEl.appendChild(svg);
  }

  private renderLogLine(step: TDStep): void {
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
  id: 'tree-depth',
  name: '二叉树最大深度',
  viewId: 'algo-tree-depth-view',
  category: 'tree',
  description: '后序遍历求高度：max(左,右)+1',
  icon: '📏',
  template,
  Visualizer: TreeDepthVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解递归求树深度的分治思想',
});