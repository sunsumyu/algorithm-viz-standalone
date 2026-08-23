/**
 * 从先序与中序遍历序列构造二叉树可视化器
 * LeetCode 105
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './build-tree.html?raw';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BTStep {
  tree: TreeNode | null;       // 当前构建的树（包含已构建部分）
  preorder: number[];
  inorder: number[];
  preStart: number;
  preEnd: number;
  inStart: number;
  inEnd: number;
  currentRoot: number | null;
  depth: number;
  leftSize: number;
  built: number;
  action: 'start' | 'find-root' | 'find-split' | 'build-left' | 'build-right' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildTreeSteps(preorder: number[], inorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  let built = 0;

  const build = (
    preStart: number, preEnd: number,
    inStart: number, inEnd: number,
    depth: number,
    builtTree: TreeNode | null
  ): { node: TreeNode | null; tree: TreeNode | null } => {
    if (preStart > preEnd) {
      return { node: null, tree: builtTree };
    }

    // 1. 先序第一个元素是根
    const rootVal = preorder[preStart];

    steps.push({
      tree: builtTree,
      preorder: [...preorder],
      inorder: [...inorder],
      preStart, preEnd, inStart, inEnd,
      currentRoot: rootVal,
      depth, leftSize: 0, built,
      action: 'find-root',
      message: `先序[${preStart}..${preEnd}]第一个元素 = ${rootVal} → 当前子树的根`,
      log: `先序首位 = ${rootVal}（根）`,
      codeLine: [5, 6],
    });

    // 2. 在中序中找到根的位置
    let rootIdx = inStart;
    while (rootIdx <= inEnd && inorder[rootIdx] !== rootVal) rootIdx++;

    const leftSize = rootIdx - inStart;
    built++;

    steps.push({
      tree: builtTree,
      preorder: [...preorder],
      inorder: [...inorder],
      preStart, preEnd, inStart, inEnd,
      currentRoot: rootVal,
      depth, leftSize, built,
      action: 'find-split',
      message: `中序[${inStart}..${inEnd}]中 ${rootVal} 在位置 ${rootIdx}，左子树大小 = ${leftSize}`,
      log: `中序分割: 左=${leftSize}，右=${preEnd - preStart - leftSize}`,
      codeLine: [7, 8, 9],
    });

    // 3. 构建左子树
    if (leftSize > 0) {
      steps.push({
        tree: builtTree,
        preorder: [...preorder],
        inorder: [...inorder],
        preStart: preStart + 1, preEnd: preStart + leftSize,
        inStart, inEnd: rootIdx - 1,
        currentRoot: rootVal,
        depth: depth + 1, leftSize, built,
        action: 'build-left',
        message: `递归构建左子树：先序[${preStart + 1}..${preStart + leftSize}]，中序[${inStart}..${rootIdx - 1}]`,
        log: `递归左子树`,
        codeLine: [11, 12],
      });
    }

    const leftResult = build(preStart + 1, preStart + leftSize, inStart, rootIdx - 1, depth + 1, builtTree);
    const leftNode = leftResult.node;

    // 4. 构建右子树
    const rightSize = preEnd - preStart - leftSize;
    if (rightSize > 0) {
      steps.push({
        tree: builtTree,
        preorder: [...preorder],
        inorder: [...inorder],
        preStart: preStart + leftSize + 1, preEnd,
        inStart: rootIdx + 1, inEnd,
        currentRoot: rootVal,
        depth: depth + 1, leftSize, built,
        action: 'build-right',
        message: `递归构建右子树：先序[${preStart + leftSize + 1}..${preEnd}]，中序[${rootIdx + 1}..${inEnd}]`,
        log: `递归右子树`,
        codeLine: [14, 15],
      });
    }

    const rightResult = build(preStart + leftSize + 1, preEnd, rootIdx + 1, inEnd, depth + 1, leftResult.tree);
    const rightNode = rightResult.node;

    // 创建节点
    const node: TreeNode = { val: rootVal, left: leftNode, right: rightNode };
    // 更新树为当前节点作为根
    const currentTree = depth === 0 ? node : (leftResult.tree || rightResult.tree || node);

    steps.push({
      tree: depth === 0 ? node : builtTree,
      preorder: [...preorder],
      inorder: [...inorder],
      preStart, preEnd, inStart, inEnd,
      currentRoot: rootVal,
      depth, leftSize, built,
      action: 'find-root',
      message: `节点 ${rootVal} 构建完成${leftNode ? `，左子 = ${leftNode.val}` : ''}${rightNode ? `，右子 = ${rightNode.val}` : ''}`,
      log: `${rootVal} 构建完成`,
      codeLine: [16, 17],
    });

    if (depth === 0) builtTree = node;

    return { node, tree: builtTree };
  };

  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    preStart: 0, preEnd: preorder.length - 1, inStart: 0, inEnd: inorder.length - 1,
    currentRoot: null,
    depth: 0, leftSize: 0, built: 0,
    action: 'start',
    message: `开始构造二叉树。先序长度 = ${preorder.length}，中序长度 = ${inorder.length}`,
    log: `开始构造`,
    codeLine: [1, 2, 3],
  });

  const result = build(0, preorder.length - 1, 0, inorder.length - 1, 0, null);

  steps.push({
    tree: result.tree,
    preorder: [...preorder],
    inorder: [...inorder],
    preStart: 0, preEnd: preorder.length - 1, inStart: 0, inEnd: inorder.length - 1,
    currentRoot: result.tree?.val ?? null,
    depth: 0, leftSize: 0, built: preorder.length,
    action: 'done',
    message: `✅ 二叉树构建完成！共 ${preorder.length} 个节点`,
    log: `构建完成`,
    codeLine: [19, 20],
  });

  return steps;
}

export class BuildTreeVisualizer extends StepVisualizer<BTStep> {
  protected codeLines = [
    'public TreeNode buildTree(int[] preorder, int[] inorder) {',
    '    if (preorder.length == 0) return null;',
    '',
    '    private TreeNode build(int preL, int preR, int inL, int inR) {',
    '        // 先序首位 = 根',
    '        int rootVal = preorder[preL];',
    '        // 中序中找根位置',
    '        int rootIdx = inL;',
    '        while (rootIdx <= inR && inorder[rootIdx] != rootVal) rootIdx++;',
    '        int leftSize = rootIdx - inL;',
    '',
    '        // 递归构建左子树',
    '        TreeNode left = build(preL+1, preL+leftSize, inL, rootIdx-1);',
    '',
    '        // 递归构建右子树',
    '        TreeNode right = build(preL+leftSize+1, preR, rootIdx+1, inR);',
    '',
    '        return new TreeNode(rootVal, left, right);',
    '    }',
    '    return build(0, preorder.length-1, 0, inorder.length-1);',
    '}',
  ];
  protected codePanelTitle = '构造二叉树代码 (Java)';

  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private rootNodeEl: HTMLElement | null = null;
  private leftSizeEl: HTMLElement | null = null;
  private builtEl: HTMLElement | null = null;
  private preChipsEl: HTMLElement | null = null;
  private inChipsEl: HTMLElement | null = null;

  private preorder: number[] = [3, 9, 20, 15, 7];
  private inorder: number[] = [9, 3, 15, 20, 7];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#bt-tree');
    this.logEl = this.root.querySelector('#bt-log');
    this.depthEl = this.root.querySelector('#bt-depth');
    this.rootNodeEl = this.root.querySelector('#bt-root-node');
    this.leftSizeEl = this.root.querySelector('#bt-left-size');
    this.builtEl = this.root.querySelector('#bt-built');
    this.preChipsEl = this.root.querySelector('#bt-pre-chips');
    this.inChipsEl = this.root.querySelector('#bt-in-chips');
    this.bindPlaybackControls({ message: 'bt-message' });

    this.root.querySelectorAll<HTMLButtonElement>('.bt-example-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.id;
        if (d === '1') { this.preorder = [3, 9, 20, 15, 7]; this.inorder = [9, 3, 15, 20, 7]; }
        else if (d === '2') { this.preorder = [1, 2, 3]; this.inorder = [3, 2, 1]; }
        else if (d === '3') { this.preorder = [5, 4, 11, 7, 2, 8, 13, 1, 9]; this.inorder = [7, 11, 2, 4, 5, 13, 8, 1, 9]; }
        this.start();
      });
    });
  }

  protected buildSteps(): BTStep[] {
    return buildTreeSteps(this.preorder, this.inorder);
  }

  protected renderStep(step: BTStep): void {
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.rootNodeEl) this.rootNodeEl.textContent = step.currentRoot !== null ? String(step.currentRoot) : '-';
    if (this.leftSizeEl) this.leftSizeEl.textContent = String(step.leftSize);
    if (this.builtEl) this.builtEl.textContent = String(step.built);
    // Set message classes for styling (base class handles textContent)
    const msgEl = this.root?.querySelector('#bt-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.className = 'bt-message';
      if (step.action === 'done') msgEl.classList.add('success');
    }

    this.renderTree(step);
    this.renderChips(step);
    this.renderLogLine(step);
  }

  private renderTree(step: BTStep): void {
    if (!this.treeEl) return;
    if (!step.tree) {
      this.treeEl.innerHTML = '<span style="color:#6c7086">开始构建...</span>';
      return;
    }
    this.treeEl.innerHTML = '';
    const levelHeight = 44;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 600 300');

    const drawNode = (node: TreeNode, x: number, y: number, spread: number) => {
      const isRoot = step.currentRoot === node.val;

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
      circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y)); circle.setAttribute('r', '18');
      let fill = '#45475a';
      let stroke = '#6c7086';
      if (isRoot) { fill = '#8be9fd'; stroke = '#8be9fd'; }
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
    drawNode(step.tree, 300, 30, 120);
    this.treeEl.appendChild(svg);
  }

  private renderChips(step: BTStep): void {
    if (this.preChipsEl) {
      this.preChipsEl.innerHTML = '';
      step.preorder.forEach((val, i) => {
        const chip = document.createElement('span');
        chip.className = 'bt-traversal-chip pre';
        const inRange = i >= step.preStart && i <= step.preEnd;
        if (inRange) chip.classList.add('used');
        if (i === step.preStart && step.currentRoot !== null) chip.classList.add('active');
        chip.textContent = String(val);
        this.preChipsEl!.appendChild(chip);
      });
    }
    if (this.inChipsEl) {
      this.inChipsEl.innerHTML = '';
      step.inorder.forEach((val, i) => {
        const chip = document.createElement('span');
        chip.className = 'bt-traversal-chip in';
        const inRange = i >= step.inStart && i <= step.inEnd;
        if (inRange) chip.classList.add('used');
        if (val === step.currentRoot) chip.classList.add('active');
        chip.textContent = String(val);
        this.inChipsEl!.appendChild(chip);
      });
    }
  }

  private renderLogLine(step: BTStep): void {
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
  id: 'build-tree',
  name: '构造二叉树（先序+中序）',
  viewId: 'algo-build-tree-view',
  category: 'tree',
  description: '从先序和中序遍历序列重建二叉树，理解分治构建',
  icon: '🏗️',
  template,
  Visualizer: BuildTreeVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '掌握通过先序定位根、中序分割左右子树的构建方法',
});
