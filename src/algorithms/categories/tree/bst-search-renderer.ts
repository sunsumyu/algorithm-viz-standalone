/**
 * 二叉搜索树中的搜索可视化器
 * LeetCode 700
 * 利用 BST 性质（左小右大）进行高效查找
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bst-search.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BSSStep {
  tree: TreeNode | null;
  current: number | null;
  target: number;
  depth: number;
  direction: string;
  compared: number;
  found: boolean | null;
  action: 'compare' | 'go-left' | 'go-right' | 'found' | 'not-found';
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

function buildBSSSteps(root: TreeNode | null, target: number): BSSStep[] {
  const steps: BSSStep[] = [];
  let compared = 0;

  steps.push({
    tree: root, current: null, target, depth: 0, direction: '-', compared: 0, found: null,
    action: 'compare',
    message: `开始搜索目标值 ${target}`,
    log: `搜索目标 = ${target}`,
    codeLine: [1, 2],
  });

  if (!root) {
    steps.push({
      tree: null, current: null, target, depth: 0, direction: '-', compared: 0, found: false,
      action: 'not-found',
      message: '空树，未找到',
      log: '空树 → null',
      codeLine: 3,
    });
    return steps;
  }

  let current: TreeNode | null = root;
  let depth = 0;

  while (current) {
    compared++;

    // 比较当前节点
    steps.push({
      tree: root, current: current.val, target, depth, direction: '-', compared, found: null,
      action: 'compare',
      message: `比较: 当前节点 ${current.val} vs 目标 ${target}`,
      log: `${current.val} vs ${target}`,
      codeLine: [4, 5],
    });

    // 找到目标
    if (current.val === target) {
      steps.push({
        tree: root, current: current.val, target, depth, direction: '✓', compared, found: true,
        action: 'found',
        message: `✅ 找到目标！节点 ${current.val} 在深度 ${depth}`,
        log: `${current.val} == ${target} → 找到!`,
        codeLine: [6, 7],
      });
      return steps;
    }

    // 目标小于当前值 → 去左子树
    if (target < current.val) {
      steps.push({
        tree: root, current: current.val, target, depth, direction: '←', compared, found: null,
        action: 'go-left',
        message: `${target} < ${current.val}，去左子树搜索`,
        log: `${target} < ${current.val} → 左`,
        codeLine: [8, 9],
      });
      current = current.left;
    } else {
      // 目标大于当前值 → 去右子树
      steps.push({
        tree: root, current: current.val, target, depth, direction: '→', compared, found: null,
        action: 'go-right',
        message: `${target} > ${current.val}，去右子树搜索`,
        log: `${target} > ${current.val} → 右`,
        codeLine: [10, 11],
      });
      current = current.right;
    }
    depth++;
  }

  // 未找到
  steps.push({
    tree: root, current: null, target, depth, direction: '✗', compared, found: false,
    action: 'not-found',
    message: `❌ 未找到目标值 ${target}`,
    log: '未找到 → null',
    codeLine: [12, 13],
  });

  return steps;
}

export class BSTSearchVisualizer extends StepVisualizer<BSSStep> {
  protected codeLines = [
    'public TreeNode searchBST(TreeNode root, int val) {',
    '    if (root == null) return null;',
    '',
    '    if (root.val == val) {',
    '        return root;',
    '    }',
    '    // 找到目标，返回节点',
    '',
    '    if (val < root.val) {',
    '        return searchBST(root.left, val);',
    '    }',
    '    // 目标小，搜左子树',
    '',
    '    return searchBST(root.right, val);',
    '    // 目标大，搜右子树',
    '}',
  ];
  protected codePanelTitle = 'BST 搜索代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private directionEl: HTMLElement | null = null;
  private comparedEl: HTMLElement | null = null;
  private targetInput: HTMLInputElement | null = null;

  private treeData: (number | null)[] = [4, 2, 7, 1, 3];
  private target: number = 9;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#bss-tree');
    this.logEl = this.root.querySelector('#bss-log');
    this.depthEl = this.root.querySelector('#bss-depth');
    this.currentEl = this.root.querySelector('#bss-current');
    this.directionEl = this.root.querySelector('#bss-direction');
    this.comparedEl = this.root.querySelector('#bss-compared');
    this.targetInput = this.root.querySelector('#bss-target') as HTMLInputElement;
    this.bindPlaybackControls({ message: 'bss-message' });

    this.root.querySelector('#bss-start')?.addEventListener('click', () => {
      this.start();
    });

    this.root.querySelectorAll<HTMLButtonElement>('.bss-example-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') { this.treeData = [4, 2, 7, 1, 3]; this.target = 9; }
        else if (d === '2') { this.treeData = [4, 2, 7, 1, 3]; this.target = 2; }
        else if (d === '3') { this.treeData = [4, 2, 7, 1, 3, 5, 10]; this.target = 5; }
        if (this.targetInput) this.targetInput.value = String(this.target);
        this.start();
      });
    });
  }

  protected buildSteps(): BSSStep[] {
    const root = buildTree(this.treeData);
    if (this.targetInput) this.target = parseInt(this.targetInput.value) || 0;
    return buildBSSSteps(root, this.target);
  }

  protected renderStep(step: BSSStep): void {
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.currentEl) this.currentEl.textContent = step.current !== null ? String(step.current) : '-';
    if (this.directionEl) this.directionEl.textContent = step.direction;
    if (this.comparedEl) this.comparedEl.textContent = String(step.compared);

    // Set message classes for styling (base class handles textContent)
    const msgEl = this.root?.querySelector('#bss-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.className = 'bss-message';
      if (step.action === 'found') msgEl.classList.add('success');
      if (step.action === 'not-found') msgEl.classList.add('error');
    }

    this.renderTree(step);
    this.renderLogLine(step);
  }

  private renderTree(step: BSSStep): void {
    if (!this.treeEl || !step.tree) {
      if (this.treeEl) this.treeEl.innerHTML = '<span style="color:#6c7086">空树</span>';
      return;
    }
    this.treeEl.innerHTML = '';
    const levelHeight = 44;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '280');
    svg.setAttribute('viewBox', '0 0 600 280');

    const drawNode = (node: TreeNode, x: number, y: number, spread: number, depth: number) => {
      const isCurrent = step.current === node.val;
      const isTarget = node.val === step.target;

      if (node.left) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        drawNode(node.left, x - spread, y + levelHeight, spread / 2, depth + 1);
      }
      if (node.right) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + levelHeight));
        line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        drawNode(node.right, x + spread, y + levelHeight, spread / 2, depth + 1);
      }
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y)); circle.setAttribute('r', '18');
      let fill = '#45475a';
      let stroke = '#6c7086';
      if (isCurrent && isTarget) { fill = '#a6e3a1'; stroke = '#a6e3a1'; }
      else if (isCurrent) { fill = '#cba6f7'; stroke = '#cba6f7'; }
      else if (step.found === false) { fill = '#313244'; }
      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', stroke);
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x)); text.setAttribute('y', String(y + 5));
      text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#1e1e2e');
      text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
      text.textContent = String(node.val);
      svg.appendChild(text);
    };
    drawNode(step.tree, 300, 30, 120, 0);
    this.treeEl.appendChild(svg);
  }

  private renderLogLine(step: BSSStep): void {
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
  id: 'bst-search',
  name: '二叉搜索树中的搜索',
  viewId: 'algo-bst-search-view',
  category: 'tree',
  description: '利用 BST 性质在 O(log n) 时间内查找目标节点',
  icon: '🔍',
  template,
  Visualizer: BSTSearchVisualizer,
  difficulty: 1,
  levelOrder: 10,
  learningGoal: '理解 BST 的左小右大性质及高效搜索方法',
});
