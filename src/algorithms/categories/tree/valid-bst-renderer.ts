/**
 * 验证二叉搜索树可视化器（中序递增）
 * LeetCode 98
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import template from './valid-bst.html?raw';

export interface VBStep {
  tree: TreeNode | null;
  current: number | null;
  prev: number | null;     // 中序前驱
  valid: boolean;
  invalidNode: number | null;
  sequence: number[];      // 中序序列
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildVBSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  let prev: number | null = null;
  let valid = true;
  let invalidNode: number | null = null;
  const sequence: number[] = [];

  steps.push({
    tree: root, current: null, prev: null, valid: true, invalidNode: null, sequence: [],
    message: `中序遍历，检查序列是否严格递增。`,
    log: '开始中序遍历验证。',
    codeLine: [1, 2],
  });

  let stopped = false;
  const inorder = (node: TreeNode | null) => {
    if (!node || stopped) return;
    inorder(node.left);
    if (stopped) return;
    const isOk = prev === null || node.val > prev;
    sequence.push(node.val);
    if (!isOk && valid) {
      valid = false;
      invalidNode = node.val;
      stopped = true;
    }
    steps.push({
      tree: root, current: node.val, prev, valid, invalidNode, sequence: [...sequence],
      message: isOk
        ? `访问 ${node.val}，前驱 ${prev === null ? '-∞' : prev}，${node.val} > ${prev === null ? '-∞' : prev} ✓ 递增。`
        : `访问 ${node.val}，前驱 ${prev}，${node.val} ≤ ${prev} ✗ 非递增！不是 BST。`,
      log: isOk ? `${node.val} > ${prev === null ? '-∞' : prev} ✓` : `${node.val} ≤ ${prev} ✗ 非法`,
      codeLine: 3,
    });
    prev = node.val;
    inorder(node.right);
  };

  inorder(root);

  steps.push({
    tree: root, current: null, prev, valid, invalidNode, sequence: [...sequence],
    message: valid
      ? `中序序列 [${sequence.join(', ')}] 严格递增，是合法 BST。`
      : `发现非递增，不是合法 BST。`,
    log: valid ? `合法 BST` : `非法 BST`,
    codeLine: 4,
  });
  return steps;
}

export class ValidBSTVisualizer extends StepVisualizer<VBStep> {
  protected codeLines = [
    'public boolean isValidBST(TreeNode root) {',
    '    // prev 初始为 Long.MIN_VALUE',
    '    function inorder(node) {',
    '        if (node == null) return true;',
    '        if (!inorder(node.left)) return false;',
    '        if (node.val <= prev) return false;',
    '        prev = node.val;',
    '        return inorder(node.right);',
    '    }',
    '    return inorder(root);',
    '}',
  ];
  protected codePanelTitle = '验证 BST 代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private rangeEl: HTMLElement | null = null;
  private prevEl: HTMLElement | null = null;
  private validEl: HTMLElement | null = null;
  private treeData: (number | null)[] = [5, 1, 8, null, null, 6, 9];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#vb-tree');
    this.logEl = this.root.querySelector('#vb-log');
    this.curEl = this.root.querySelector('#vb-cur');
    this.rangeEl = this.root.querySelector('#vb-range');
    this.prevEl = this.root.querySelector('#vb-prev');
    this.validEl = this.root.querySelector('#vb-valid');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#vb-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.vb-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') this.treeData = [5, 1, 8, null, null, 6, 9];
        else if (d === '2') this.treeData = [5, 1, 4, null, null, 3, 6];
        else this.treeData = [1];
        this.start();
      });
    });
  }

  protected buildSteps(): VBStep[] {
    const root = buildTree(this.treeData);
    return buildVBSteps(root);
  }

  protected renderStep(step: VBStep): void {
    if (this.curEl) this.curEl.textContent = step.current !== null ? String(step.current) : '-';
    if (this.rangeEl) this.rangeEl.textContent = step.current !== null ? `(-∞, ${step.current})` : '-';
    if (this.prevEl) this.prevEl.textContent = step.prev === null ? '-∞' : String(step.prev);
    if (this.validEl) this.validEl.textContent = step.valid ? '✓ 合法' : '✗ 非法';
    this.renderTree(step);
    this.renderLogLine(step);
  }

  private renderTree(step: VBStep): void {
    if (!this.treeEl || !step.tree) {
      if (this.treeEl) this.treeEl.innerHTML = '<span style="color:#6c7086">空树</span>';
      return;
    }
    this.treeEl.innerHTML = '';
    const levelHeight = 44;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '260'); svg.setAttribute('viewBox', '0 0 600 260');
    const drawNode = (node: TreeNode, x: number, y: number, spread: number) => {
      const isCurrent = step.current === node.val;
      const isInvalid = step.invalidNode === node.val;
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
      circle.setAttribute('fill', isInvalid ? '#f38ba8' : isCurrent ? '#f9e2af' : '#45475a');
      circle.setAttribute('stroke', isInvalid ? '#f38ba8' : isCurrent ? '#f9e2af' : '#6c7086');
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

  private renderLogLine(step: VBStep): void {
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
  id: 'valid-bst',
  name: '验证二叉搜索树',
  viewId: 'algo-valid-bst-view',
  category: 'tree',
  description: '中序遍历检查序列是否严格递增',
  icon: '🔍',
  template,
  Visualizer: ValidBSTVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '理解 BST 的中序遍历序列必为有序',
});