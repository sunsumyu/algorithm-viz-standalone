/**
 * 对称二叉树可视化器
 * LeetCode 101
 * 递归对比左右子树是否镜像对称
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './tree-symmetric.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface TSStep {
  tree: TreeNode | null;
  leftNode: number | null;   // 左对比节点
  rightNode: number | null;  // 右对比节点
  depth: number;
  compared: number;
  matches: number;
  result: boolean | null;
  action: 'compare' | 'match' | 'mismatch' | 'null-check' | 'done';
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

function buildTSSteps(root: TreeNode | null): TSStep[] {
  const steps: TSStep[] = [];
  let compared = 0;
  let matches = 0;

  steps.push({
    tree: root, leftNode: null, rightNode: null, depth: 0, compared: 0, matches: 0, result: null,
    action: 'compare',
    message: '开始判断二叉树是否对称。需要递归对比左右子树的镜像。',
    log: '开始对称判定',
    codeLine: [1, 2],
  });

  const check = (left: TreeNode | null, right: TreeNode | null, depth: number): boolean => {
    compared++;

    // 都为空
    if (!left && !right) {
      matches++;
      steps.push({
        tree: root, leftNode: null, rightNode: null, depth, compared, matches, result: null,
        action: 'match',
        message: `深度 ${depth}：左右子节点均为空 → 对称 ✓`,
        log: `深度${depth}: 空=空 → ✓`,
        codeLine: 3,
      });
      return true;
    }

    // 一个为空
    if (!left || !right) {
      steps.push({
        tree: root, leftNode: left?.val ?? null, rightNode: right?.val ?? null, depth, compared, matches, result: false,
        action: 'mismatch',
        message: `深度 ${depth}：一个为空，一个非空 → 不对称 ✗`,
        log: `深度${depth}: ${left?.val ?? '空'}≠${right?.val ?? '空'} → ✗`,
        codeLine: 4,
      });
      return false;
    }

    // 值不同
    if (left.val !== right.val) {
      steps.push({
        tree: root, leftNode: left.val, rightNode: right.val, depth, compared, matches, result: false,
        action: 'mismatch',
        message: `深度 ${depth}：节点值 ${left.val} ≠ ${right.val} → 不对称 ✗`,
        log: `深度${depth}: ${left.val}≠${right.val} → ✗`,
        codeLine: 5,
      });
      return false;
    }

    // 值相同
    matches++;
    steps.push({
      tree: root, leftNode: left.val, rightNode: right.val, depth, compared, matches, result: null,
      action: 'match',
      message: `深度 ${depth}：节点值 ${left.val} = ${right.val} → 匹配 ✓，继续检查子树`,
      log: `深度${depth}: ${left.val}=${right.val} → ✓, 递归子树`,
      codeLine: 6,
    });

    // 递归对比：左的左 vs 右的右，左的右 vs 右的左
    const outer = check(left.left, right.right, depth + 1);
    if (!outer) return false;

    const inner = check(left.right, right.left, depth + 1);
    if (!inner) return false;

    return true;
  };

  const isSymmetric = root ? check(root.left, root.right, 0) : true;

  steps.push({
    tree: root, leftNode: null, rightNode: null, depth: 0, compared, matches, result: isSymmetric,
    action: 'done',
    message: isSymmetric
      ? `✅ 判定完成：二叉树是对称的！共对比 ${compared} 次，成功匹配 ${matches} 次。`
      : `❌ 判定完成：二叉树不对称！共对比 ${compared} 次。`,
    log: isSymmetric ? '结果: 对称 ✓' : '结果: 不对称 ✗',
    codeLine: [7, 8],
  });

  return steps;
}

export class TreeSymmetricVisualizer extends StepVisualizer<TSStep> {
  protected codeLines = [
    'public boolean isSymmetric(TreeNode root) {',
    '    if (root == null) return true;',
    '    return check(root.left, root.right);',
    '}',
    '',
    'private boolean check(TreeNode left, TreeNode right) {',
    '    if (left == null && right == null) return true;',
    '    if (left == null || right == null) return false;',
    '    if (left.val != right.val) return false;',
    '    // 递归：左外 vs 右外, 左内 vs 右内',
    '    return check(left.left, right.right) &&',
    '           check(left.right, right.left);',
    '}',
  ];
  protected codePanelTitle = '对称二叉树代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private comparedEl: HTMLElement | null = null;
  private matchesEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private leftChipsEl: HTMLElement | null = null;
  private rightChipsEl: HTMLElement | null = null;

  private treeData: (number | null)[] = [1, 2, 2, 3, 4, 4, 3];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#ts-tree');
    this.logEl = this.root.querySelector('#ts-log');
    this.depthEl = this.root.querySelector('#ts-depth');
    this.comparedEl = this.root.querySelector('#ts-compared');
    this.matchesEl = this.root.querySelector('#ts-matches');
    this.resultEl = this.root.querySelector('#ts-result');
    this.leftChipsEl = this.root.querySelector('#ts-left-chips');
    this.rightChipsEl = this.root.querySelector('#ts-right-chips');
    this.bindPlaybackControls({ message: 'ts-message' });
    this.root.querySelectorAll<HTMLButtonElement>('.ts-example-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') this.treeData = [1, 2, 2, 3, 4, 4, 3];
        else if (d === '2') this.treeData = [1, 2, 2, null, 3, null, 3];
        else if (d === '3') this.treeData = [1, 2, 2];
        this.start();
      });
    });
  }

  protected buildSteps(): TSStep[] {
    const root = buildTree(this.treeData);
    return buildTSSteps(root);
  }

  protected renderStep(step: TSStep): void {
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.comparedEl) this.comparedEl.textContent = String(step.compared);
    if (this.matchesEl) this.matchesEl.textContent = String(step.matches);
    if (this.resultEl && step.result !== null) {
      this.resultEl.textContent = step.result ? '是' : '否';
      this.resultEl.style.color = step.result ? '#a6e3a1' : '#f38ba8';
    }
    // Set message classes for styling (base class handles textContent)
    const msgEl = this.root?.querySelector('#ts-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.className = 'ts-message';
      if (step.action === 'mismatch') msgEl.classList.add('error');
      if (step.action === 'match') msgEl.classList.add('success');
    }

    this.renderTree(step);
    this.renderChips(step);
    this.renderLogLine(step);
  }

  private renderTree(step: TSStep): void {
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

    const highlightNodes = new Set<number>();
    if (step.leftNode !== null) highlightNodes.add(step.leftNode);
    if (step.rightNode !== null) highlightNodes.add(step.rightNode);

    const drawNode = (node: TreeNode, x: number, y: number, spread: number, depth: number) => {
      const isCurrent = step.leftNode !== null && node.val === step.leftNode;
      const isMirror = step.rightNode !== null && node.val === step.rightNode;

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
      if (isCurrent && isMirror) { fill = '#cba6f7'; stroke = '#cba6f7'; }
      else if (isCurrent) { fill = '#a6e3a1'; stroke = '#a6e3a1'; }
      else if (isMirror) { fill = '#89b4fa'; stroke = '#89b4fa'; }
      else if (step.result === false) { fill = '#313244'; }
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
    drawNode(step.tree, 300, 30, 120, 0);
    this.treeEl.appendChild(svg);
  }

  private renderChips(step: TSStep): void {
    if (this.leftChipsEl) {
      this.leftChipsEl.innerHTML = '';
      if (step.leftNode !== null) {
        const chip = document.createElement('span');
        chip.className = 'ts-chip left-side';
        chip.textContent = String(step.leftNode);
        this.leftChipsEl.appendChild(chip);
      } else {
        const chip = document.createElement('span');
        chip.className = 'ts-chip left-side';
        chip.style.opacity = '0.3';
        chip.textContent = 'null';
        this.leftChipsEl.appendChild(chip);
      }
    }
    if (this.rightChipsEl) {
      this.rightChipsEl.innerHTML = '';
      if (step.rightNode !== null) {
        const chip = document.createElement('span');
        chip.className = 'ts-chip right-side';
        chip.textContent = String(step.rightNode);
        this.rightChipsEl.appendChild(chip);
      } else {
        const chip = document.createElement('span');
        chip.className = 'ts-chip right-side';
        chip.style.opacity = '0.3';
        chip.textContent = 'null';
        this.rightChipsEl.appendChild(chip);
      }
    }
  }

  private renderLogLine(step: TSStep): void {
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
  id: 'tree-symmetric',
  name: '对称二叉树',
  viewId: 'algo-tree-symmetric-view',
  category: 'tree',
  description: '判断二叉树是否镜像对称（左子树镜像 = 右子树）',
  icon: '🪞',
  template,
  Visualizer: TreeSymmetricVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握递归对比二叉树镜像对称性的技巧',
});
