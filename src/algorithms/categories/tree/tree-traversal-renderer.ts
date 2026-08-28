/**
 * 二叉树前中后序遍历可视化器
 * LeetCode 144/94/145
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import template from './tree-traversal.html?raw';

export type Mode = 'pre' | 'in' | 'post';

export interface TTStep {
  tree: TreeNode | null;
  mode: Mode;
  current: number | null;
  depth: number;
  visited: number;
  result: number[];   // 已收集的访问序列
  action: 'enter' | 'visit' | 'leave';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTTSteps(root: TreeNode | null, mode: Mode): TTStep[] {
  const steps: TTStep[] = [];
  const result: number[] = [];
  let visited = 0;

  const modeName = mode === 'pre' ? '前序（根左右）' : mode === 'in' ? '中序（左根右）' : '后序（左右根）';
  steps.push({
    tree: root, mode, current: null, depth: 0, visited: 0, result: [],
    action: 'enter',
    message: `开始${modeName}遍历。`,
    log: `开始${modeName}遍历。`,
    codeLine: 1,
  });

  const visit = (node: TreeNode, depth: number) => {
    visited++;
    result.push(node.val);
    steps.push({
      tree: root, mode, current: node.val, depth, visited, result: [...result],
      action: 'visit',
      message: `${modeName} 访问节点 ${node.val}（深度 ${depth}），加入结果。`,
      log: `访问 ${node.val} → [${result.join(',')}]`,
      codeLine: mode === 'pre' ? 2 : mode === 'in' ? 3 : 4,
    });
  };

  const traverse = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    steps.push({
      tree: root, mode, current: node.val, depth, visited, result: [...result],
      action: 'enter',
      message: `进入节点 ${node.val}（深度 ${depth}）。`,
      log: `进入 ${node.val}`,
      codeLine: 1,
    });
    if (mode === 'pre') visit(node, depth);
    traverse(node.left, depth + 1);
    if (mode === 'in') visit(node, depth);
    traverse(node.right, depth + 1);
    if (mode === 'post') visit(node, depth);
    steps.push({
      tree: root, mode, current: node.val, depth, visited, result: [...result],
      action: 'leave',
      message: `离开节点 ${node.val}（子树处理完毕）。`,
      log: `离开 ${node.val}`,
      codeLine: 5,
    });
  };

  traverse(root, 0);

  steps.push({
    tree: root, mode, current: null, depth: 0, visited, result: [...result],
    action: 'leave',
    message: `${modeName}遍历完成，结果：[${result.join(', ')}]。`,
    log: `完成：[${result.join(', ')}]`,
    codeLine: 6,
  });
  return steps;
}

export class TreeTraversalVisualizer extends StepVisualizer<TTStep> {
  protected codeLines = [
    'void traverse(TreeNode node) {',
    '    if (node == null) return;',
    '    // 前序：res.add(node.val);  ← 根',
    '    traverse(node.left);          ← 左',
    '    // 中序：res.add(node.val);  ← 根',
    '    traverse(node.right);         ← 右',
    '    // 后序：res.add(node.val);  ← 根',
    '}',
  ];
  protected codePanelTitle = '遍历代码（前/中/后序）(Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private lenEl: HTMLElement | null = null;

  private mode: Mode = 'pre';
  private treeData: (number | null)[] = [1, 2, 3, 4, 5, null, 6];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#tt-tree');
    this.logEl = this.root.querySelector('#tt-log');
    this.resultEl = this.root.querySelector('#tt-result');
    this.curEl = this.root.querySelector('#tt-cur');
    this.depthEl = this.root.querySelector('#tt-depth');
    this.visitedEl = this.root.querySelector('#tt-visited');
    this.lenEl = this.root.querySelector('#tt-len');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#tt-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.tt-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll<HTMLButtonElement>('.tt-mode-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode as Mode;
        this.start();
      });
    });
    this.root.querySelectorAll<HTMLButtonElement>('.tt-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        this.treeData = d === '1' ? [1, 2, 3, 4, 5, null, 6] : [5, 4, 6, 1, 2];
        this.start();
      });
    });
  }

  protected buildSteps(): TTStep[] {
    const root = buildTree(this.treeData);
    return buildTTSteps(root, this.mode);
  }

  protected renderStep(step: TTStep): void {
    if (this.curEl) this.curEl.textContent = step.current !== null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited);
    if (this.lenEl) this.lenEl.textContent = String(step.result.length);
    this.renderTree(step);
    this.renderResult(step);
    this.renderLogLine(step);
  }

  private renderTree(step: TTStep): void {
    if (!this.treeEl || !step.tree) return;
    this.treeEl.innerHTML = '';
    const levelHeight = 42;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '240');
    svg.setAttribute('viewBox', '0 0 600 240');
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
      circle.setAttribute('fill', isCurrent ? '#f38ba8' : '#45475a');
      circle.setAttribute('stroke', isCurrent ? '#f38ba8' : '#6c7086');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x)); text.setAttribute('y', String(y + 5));
      text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#cdd6f4');
      text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
      text.textContent = String(node.val);
      svg.appendChild(text);
    };
    drawNode(step.tree, 300, 30, 110);
    this.treeEl.appendChild(svg);
  }

  private renderResult(step: TTStep): void {
    if (!this.resultEl) return;
    this.resultEl.innerHTML = '';
    if (step.result.length === 0) {
      this.resultEl.innerHTML = '<span style="color:#6c7086">（空）</span>';
      return;
    }
    step.result.forEach((val) => {
      const el = document.createElement('span');
      el.className = 'tt-result-val';
      if (val === step.current) el.classList.add('current');
      el.textContent = String(val);
      this.resultEl!.appendChild(el);
    });
  }

  private renderLogLine(step: TTStep): void {
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
  id: 'tree-traversal',
  name: '二叉树前中后序遍历',
  viewId: 'algo-tree-traversal-view',
  category: 'tree',
  description: '递归实现前序/中序/后序遍历，对比三种访问顺序',
  icon: '🌳',
  template,
  Visualizer: TreeTraversalVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握二叉树的前/中/后序遍历递归与非递归写法',
});