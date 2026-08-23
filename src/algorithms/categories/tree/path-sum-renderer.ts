/**
 * 路径总和可视化器
 * LeetCode 112
 * 判断是否存在从根节点到叶子节点的路径，使得路径上所有节点值之和等于目标值
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './path-sum.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface PSStep {
  tree: TreeNode | null;
  current: number | null;
  path: number[];
  remaining: number;
  depth: number;
  found: boolean | null;
  action: 'enter' | 'subtract' | 'leaf-check' | 'recurse' | 'backtrack' | 'done';
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

function buildPSSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];

  steps.push({
    tree: root, current: null, path: [], remaining: targetSum, depth: 0, found: null,
    action: 'enter',
    message: `目标和 = ${targetSum}，从根节点开始递归搜索`,
    log: `开始，目标 = ${targetSum}`,
    codeLine: [1, 2],
  });

  if (!root) {
    steps.push({
      tree: null, current: null, path: [], remaining: targetSum, depth: 0, found: false,
      action: 'done',
      message: '空树，不存在路径',
      log: '空树 → false',
      codeLine: 2,
    });
    return steps;
  }

  const search = (node: TreeNode | null, remaining: number, path: number[], depth: number): boolean => {
    if (!node) {
      steps.push({
        tree: root, current: null, path: [...path], remaining, depth, found: null,
        action: 'enter',
        message: '到达空节点，返回 false',
        log: '空节点 → false',
        codeLine: 3,
      });
      return false;
    }

    // 进入节点
    path.push(node.val);
    const newRemaining = remaining - node.val;

    steps.push({
      tree: root, current: node.val, path: [...path], remaining: newRemaining, depth, found: null,
      action: 'subtract',
      message: `进入节点 ${node.val}，剩余目标: ${remaining} - ${node.val} = ${newRemaining}`,
      log: `进入 ${node.val}，剩余 = ${newRemaining}`,
      codeLine: 5,
    });

    // 叶子节点检查
    const isLeaf = !node.left && !node.right;
    if (isLeaf) {
      steps.push({
        tree: root, current: node.val, path: [...path], remaining: newRemaining, depth, found: null,
        action: 'leaf-check',
        message: `到达叶子节点 ${node.val}，检查剩余目标是否为 0: ${newRemaining}`,
        log: `叶子 ${node.val}，剩余=${newRemaining}`,
        codeLine: 6,
      });

      if (newRemaining === 0) {
        steps.push({
          tree: root, current: node.val, path: [...path], remaining: newRemaining, depth, found: true,
          action: 'done',
          message: `✅ 找到路径！和为 ${targetSum}，路径: [${path.join(' → ')}]`,
          log: `✅ 找到！[${path.join('→')}]`,
          codeLine: 7,
        });
        return true;
      }
    }

    // 递归左右子树
    steps.push({
      tree: root, current: node.val, path: [...path], remaining: newRemaining, depth, found: null,
      action: 'recurse',
      message: `节点 ${node.val} 不是目标叶子，递归搜索左右子树`,
      log: `递归子树 (${node.val})`,
      codeLine: 9,
    });

    const leftFound = search(node.left, newRemaining, path, depth + 1);
    if (leftFound) return true;

    const rightFound = search(node.right, newRemaining, path, depth + 1);
    if (rightFound) return true;

    // 回溯
    path.pop();
    steps.push({
      tree: root, current: node.val, path: [...path], remaining, depth, found: null,
      action: 'backtrack',
      message: `回溯：离开节点 ${node.val}，恢复目标 ${remaining}`,
      log: `回溯离开 ${node.val}`,
      codeLine: 12,
    });

    return false;
  };

  const found = search(root, targetSum, [], 0);

  if (!found) {
    steps.push({
      tree: root, current: null, path: [], remaining: targetSum, depth: 0, found: false,
      action: 'done',
      message: `❌ 没有找到路径和为 ${targetSum} 的路径`,
      log: `❌ 未找到`,
      codeLine: 14,
    });
  }

  return steps;
}

export class PathSumVisualizer extends StepVisualizer<PSStep> {
  protected codeLines = [
    'public boolean hasPathSum(TreeNode root, int targetSum) {',
    '    if (root == null) return false;',
    '    // 空节点不存在路径',
    '',
    '    // 累减节点值',
    '    targetSum -= root.val;',
    '    if (root.left == null && root.right == null && targetSum == 0) return true;',
    '    // 到达叶子且剩余为 0 → 找到',
    '',
    '    // 递归搜索左右子树',
    '    return hasPathSum(root.left, targetSum)',
    '        || hasPathSum(root.right, targetSum);',
    '    // 都不是 → 回溯',
    '    // 都不存在这样的路径',
    '}',
  ];
  protected codePanelTitle = '路径总和代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private remainingEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private pathEl: HTMLElement | null = null;
  private targetInput: HTMLInputElement | null = null;

  private treeData: (number | null)[] = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1];
  private targetSum: number = 22;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#ps-tree');
    this.logEl = this.root.querySelector('#ps-log');
    this.depthEl = this.root.querySelector('#ps-depth');
    this.remainingEl = this.root.querySelector('#ps-remaining');
    this.currentEl = this.root.querySelector('#ps-current');
    this.resultEl = this.root.querySelector('#ps-result');
    this.pathEl = this.root.querySelector('#ps-path');
    this.targetInput = this.root.querySelector('#ps-target') as HTMLInputElement;
    this.bindPlaybackControls({ message: 'ps-message' });

    this.root.querySelectorAll<HTMLButtonElement>('.ps-example-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') { this.treeData = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]; this.targetSum = 22; }
        else if (d === '2') { this.treeData = [1, 2, 3]; this.targetSum = 5; }
        else { this.treeData = []; this.targetSum = 0; }
        if (this.targetInput) this.targetInput.value = String(this.targetSum);
        this.start();
      });
    });

    this.root.querySelector('#ps-start')?.addEventListener('click', () => {
      this.start();
    });
  }

  protected buildSteps(): PSStep[] {
    const root = buildTree(this.treeData);
    if (this.targetInput) this.targetSum = parseInt(this.targetInput.value) || 0;
    return buildPSSteps(root, this.targetSum);
  }

  protected renderStep(step: PSStep): void {
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.remainingEl) this.remainingEl.textContent = String(step.remaining);
    if (this.currentEl) this.currentEl.textContent = step.current !== null ? String(step.current) : '-';
    if (this.resultEl && step.found !== null) {
      this.resultEl.textContent = step.found ? '是' : '否';
      this.resultEl.style.color = step.found ? '#a6e3a1' : '#f38ba8';
    }
    // Handle message classes directly since messageEl conflicts with base class
    const msgEl = this.root?.querySelector('#ps-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.className = 'ps-message';
      if (step.action === 'leaf-check' || step.found === true) msgEl.classList.add('success');
      if (step.found === false) msgEl.classList.add('error');
    }

    this.renderTree(step);
    this.renderPath(step);
    this.renderLogLine(step);
  }

  private renderTree(step: PSStep): void {
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

    const pathSet = new Set(step.path);

    const drawNode = (node: TreeNode, x: number, y: number, spread: number, depth: number) => {
      const isCurrent = step.current === node.val;
      const isOnPath = pathSet.has(node.val);

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
      if (isCurrent) { fill = '#fab387'; stroke = '#fab387'; }
      else if (isOnPath) { fill = '#5e6472'; stroke = '#fab387'; }
      else if (step.found === false) { fill = '#313244'; }
      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', stroke);
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x)); text.setAttribute('y', String(y + 5));
      text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#cdd6f4');
      text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
      text.textContent = String(node.val);
      svg.appendChild(text);
    };
    drawNode(step.tree, 300, 30, 100, 0);
    this.treeEl.appendChild(svg);
  }

  private renderPath(step: PSStep): void {
    if (!this.pathEl) return;
    const pathEl = this.pathEl;
    pathEl.innerHTML = '';
    if (step.path.length === 0) {
      pathEl.innerHTML = '<span style="color:#6c7086; font-size:0.78rem;">（空）</span>';
      return;
    }
    step.path.forEach((val, i) => {
      const chip = document.createElement('span');
      chip.className = 'ps-path-chip';
      if (step.current === val) chip.classList.add('current');
      chip.textContent = String(val);
      pathEl.appendChild(chip);
      if (i < step.path.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'ps-path-arrow';
        arrow.textContent = '→';
        pathEl.appendChild(arrow);
      }
    });
    const sumEl = document.createElement('span');
    sumEl.style.cssText = 'margin-left:0.5rem; font-size:0.78rem; color:#585b70;';
    const total = step.path.reduce((a, b) => a + b, 0);
    sumEl.textContent = `(和=${total})`;
    pathEl.appendChild(sumEl);
  }

  private renderLogLine(step: PSStep): void {
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
  id: 'path-sum',
  name: '路径总和',
  viewId: 'algo-path-sum-view',
  category: 'tree',
  description: '判断是否存在根到叶子的路径，路径和等于目标值',
  icon: '🛤️',
  template,
  Visualizer: PathSumVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握递归回溯求解根到叶子路径总和的技巧',
});
