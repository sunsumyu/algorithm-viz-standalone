/**
 * 二叉树翻转可视化器
 * 支持代码联动高亮演示
 */

import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { CodePanel } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import template from './tree-invert.html?raw';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  highlight?: string;
}

interface AnimationStep {
  tree: TreeNode | null;
  message: string;
  swapPair: { left: number | null; right: number | null; parent: number } | null;
  codeLine: number;
}

/**
 * 创建示例二叉树
 */
function createSampleTree(depth: number = 3): TreeNode {
  if (depth === 0) return { value: Math.floor(Math.random() * 100), left: null, right: null };
  
  const node: TreeNode = {
    value: Math.floor(Math.random() * 100),
    left: createSampleTree(depth - 1),
    right: createSampleTree(depth - 1)
  };
  return node;
}

/**
 * 创建固定示例树
 */
function createFixedTree(): TreeNode {
  return {
    value: 4,
    left: {
      value: 2,
      left: { value: 1, left: null, right: null },
      right: { value: 3, left: null, right: null }
    },
    right: {
      value: 7,
      left: { value: 6, left: null, right: null },
      right: { value: 9, left: null, right: null }
    }
  };
}

/**
 * 复制树
 */
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    highlight: node.highlight || 'None'
  };
}

/**
 * 翻转树并生成步骤，绑定代码行号
 */
function invertTreeWithSteps(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // 代码行号映射（对应伪代码）
  // 1: function invertTree(root) {
  // 2:     if (root === null) {
  // 3:         return null;
  // 4:     }
  // 5:     
  // 6:     // 交换左右子树
  // 7:     const temp = root.left;
  // 8:     root.left = root.right;
  // 9:     root.right = temp;
  // 10:    
  // 11:    // 递归翻转子树
  // 12:    invertTree(root.left);
  // 13:    invertTree(root.right);
  // 14:    
  // 15:    return root;
  // 16: }

  // 初始状态
  steps.push({
    tree: cloneTree(root),
    message: '初始二叉树',
    swapPair: null,
    codeLine: 1,
  });

  function invert(node: TreeNode | null): TreeNode | null {
    if (!node) {
      steps.push({
        tree: cloneTree(root),
        message: '到达空节点，返回 null',
        swapPair: null,
        codeLine: 3,
      });
      return null;
    }

    // 标记当前节点
    const treeCopy = cloneTree(root);
    const currentNode = findNode(treeCopy, node.value);
    if (currentNode) currentNode.highlight = 'Current';

    if (node.left && node.right) {
      steps.push({
        tree: treeCopy,
        message: `访问节点 ${node.value}，准备交换左右子树`,
        swapPair: { left: node.left.value, right: node.right.value, parent: node.value },
        codeLine: 7,
      });

      // 执行交换
      const temp = node.left;
      node.left = node.right;
      node.right = temp;

      // 更新原始树
      const originalNode = findNode(root, node.value);
      if (originalNode) {
        const tempOrig = originalNode.left;
        originalNode.left = originalNode.right;
        originalNode.right = tempOrig;
      }

      // 标记交换后的节点
      const swappedTree = cloneTree(root);
      const swappedNode = findNode(swappedTree, node.value);
      if (swappedNode) {
        swappedNode.highlight = 'Swap';
        if (swappedNode.left) swappedNode.left.highlight = 'Swap';
        if (swappedNode.right) swappedNode.right.highlight = 'Swap';
      }

      steps.push({
        tree: swappedTree,
        message: `节点 ${node.value}: 左 ${node.left?.value || 'null'} ↔ 右 ${node.right?.value || 'null'} 已交换`,
        swapPair: { left: node.left?.value || null, right: node.right?.value || null, parent: node.value },
        codeLine: 9,
      });
    } else if (node.left || node.right) {
      steps.push({
        tree: treeCopy,
        message: `节点 ${node.value}: 只有一个子节点，交换`,
        swapPair: { left: node.left?.value || null, right: node.right?.value || null, parent: node.value },
        codeLine: 8,
      });

      const temp = node.left;
      node.left = node.right;
      node.right = temp;

      const originalNode = findNode(root, node.value);
      if (originalNode) {
        const tempOrig = originalNode.left;
        originalNode.left = originalNode.right;
        originalNode.right = tempOrig;
      }
    } else {
      steps.push({
        tree: treeCopy,
        message: `节点 ${node.value}: 叶子节点，无需交换`,
        swapPair: null,
        codeLine: 7,
      });
    }

    // 递归处理子树
    invert(node.left);
    invert(node.right);

    return node;
  }

  invert(root);

  // 最终状态
  steps.push({
    tree: cloneTree(root),
    message: '翻转完成！',
    swapPair: null,
    codeLine: 15,
  });

  return steps;
}

/**
 * 在树中查找节点
 */
function findNode(root: TreeNode | null, value: number): TreeNode | null {
  if (!root) return null;
  if (root.value === value) return root;
  return findNode(root.left, value) || findNode(root.right, value);
}

export class TreeInvertVisualizer implements IVisualizer {
  private steps: AnimationStep[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1000;
  private timer: number | null = null;

  // 作用域根元素
  private root: HTMLElement | null = null;
  private codePanel: CodePanel | null = null;

  // DOM Elements
  private btnPrev: HTMLButtonElement | null = null;
  private btnNext: HTMLButtonElement | null = null;
  private btnPlayPause: HTMLButtonElement | null = null;
  private btnReset: HTMLButtonElement | null = null;
  private btnBack: HTMLButtonElement | null = null;
  private navigateBack: (() => void) | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private statusEl: HTMLElement | null = null;
  private speedSlider: HTMLInputElement | null = null;
  private speedLabel: HTMLElement | null = null;

  private codeLines: string[] = [
    "public TreeNode invertTree(TreeNode root) {",
    "    if (root == null) {",
    "        return null;",
    "    }",
    "    ",
    "    // 交换左右子树",
    "    TreeNode temp = root.left;",
    "    root.left = root.right;",
    "    root.right = temp;",
    "    ",
    "    // 递归翻转子树",
    "    invertTree(root.left);",
    "    invertTree(root.right);",
    "    ",
    "    return root;",
    "}"
  ];

  public async init(context?: VisualizerContext): Promise<void> {
    console.log('[TreeInvertVisualizer] init called');
    if (context && context.root) {
      this.root = context.root;
      this.navigateBack = context.navigateBack ?? null;
    } else {
      this.root = document.getElementById('algo-tree-invert-view') as HTMLElement | null;
    }
    this.initDOMElements();
    this.setupEventListeners();
    this.initCodePanel();
    await this.initializeTree();
  }

  private initDOMElements(): void {
    if (!this.root) return;
    const root = this.root;

    this.btnPrev = root.querySelector('#tree-invert-prev') as HTMLButtonElement;
    this.btnNext = root.querySelector('#tree-invert-next') as HTMLButtonElement;
    this.btnPlayPause = root.querySelector('#tree-invert-play') as HTMLButtonElement;
    this.btnReset = root.querySelector('#tree-invert-reset') as HTMLButtonElement;
    this.btnBack = root.querySelector('#btn-back') as HTMLButtonElement;
    this.canvas = root.querySelector('#tree-invert-canvas') as HTMLCanvasElement;
    this.statusEl = root.querySelector('#tree-invert-status') as HTMLElement;
    this.speedSlider = root.querySelector('#tree-invert-speed') as HTMLInputElement;
    this.speedLabel = root.querySelector('#tree-invert-speed-label') as HTMLElement;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  private initCodePanel(): void {
    const codeContainer = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
    if (codeContainer) {
      this.codePanel = new CodePanel(codeContainer, {
        lines: this.codeLines,
        title: '代码 (Java)',
      });
    }
  }

  private setupEventListeners(): void {
    if (this.btnPrev) this.btnPrev.onclick = () => this.prevStep();
    if (this.btnNext) this.btnNext.onclick = () => this.nextStep();
    if (this.btnPlayPause) this.btnPlayPause.onclick = () => this.togglePlay();
    if (this.btnReset) this.btnReset.onclick = () => this.reset();
    if (this.btnBack) {
      this.btnBack.onclick = () => {
        this.navigateBack?.();
      };
    }

    if (this.speedSlider && this.speedLabel) {
      this.speedSlider.oninput = (e) => {
        this.playbackSpeed = parseInt((e.target as HTMLInputElement).value);
        this.speedLabel!.textContent = (this.playbackSpeed / 1000).toFixed(1) + 's';
      };
    }
  }

  private async initializeTree(): Promise<void> {
    const tree = createFixedTree();
    this.steps = invertTreeWithSteps(cloneTree(tree));
    this.currentIndex = 0;
    this.renderCanvas();
    this.updateButtons();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play(): void {
    if (this.steps.length === 0 || this.currentIndex >= this.steps.length - 1) return;
    this.isPlaying = true;
    this.tick();
    this.updateButtons();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateButtons();
  }

  private tick = () => {
    if (!this.isPlaying) return;

    this.timer = window.setTimeout(() => {
      if (this.currentIndex < this.steps.length - 1) {
        this.nextStep();
        if (this.isPlaying) this.tick();
      } else {
        this.pause();
      }
    }, this.playbackSpeed);
  }

  private nextStep(): void {
    if (this.currentIndex >= this.steps.length - 1) return;
    this.currentIndex++;
    this.renderCanvas();
    this.updateButtons();
  }

  private prevStep(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.renderCanvas();
    this.updateButtons();
  }

  private reset(): void {
    this.pause();
    this.currentIndex = 0;
    this.renderCanvas();
    this.updateButtons();
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx || !this.statusEl) return;

    // Resize canvas
    const parent = this.canvas.parentElement;
    this.canvas.width = parent?.clientWidth || 600;
    this.canvas.height = parent?.clientHeight || 400;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.steps.length === 0) {
      this.statusEl.textContent = '点击卡片加载二叉树翻转演示';
      return;
    }

    const step = this.steps[this.currentIndex];
    this.statusEl.textContent = step.message;

    if (step.tree) {
      this.drawTree(step.tree);
    }

    // 同步高亮代码行
    if (this.codePanel) {
      this.codePanel.highlight(step.codeLine);
    }
  }

  private drawTree(root: TreeNode | null): void {
    if (!root || !this.ctx || !this.canvas) return;

    this.layoutTree(root, this.canvas.width, this.canvas.height);
    this.drawEdges(root);
    this.drawNodes(root);
  }

  private layoutTree(root: TreeNode, width: number, height: number): void {
    const nodes: { node: TreeNode; depth: number }[] = [];
    let maxDepth = 0;

    const traverse = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      if (depth > maxDepth) maxDepth = depth;
      traverse(node.left, depth + 1);
      nodes.push({ node, depth });
      traverse(node.right, depth + 1);
    };

    traverse(root, 0);

    const count = nodes.length;
    const xGap = width / (count + 1);
    const yGap = height / (maxDepth + 3);

    nodes.forEach((entry, index) => {
      entry.node.x = (index + 1) * xGap;
      entry.node.y = (entry.depth + 1) * yGap;
    });
  }

  private drawEdges(node: TreeNode | null): void {
    if (!node || !this.ctx) return;

    const drawLine = (from: TreeNode, to: TreeNode | null) => {
      if (!to) return;
      this.ctx!.beginPath();
      this.ctx!.moveTo(from.x!, from.y!);
      this.ctx!.lineTo(to.x!, to.y!);
      this.ctx!.stroke();
    };

    if (node.left) {
      drawLine(node, node.left);
      this.drawEdges(node.left);
    }
    if (node.right) {
      drawLine(node, node.right);
      this.drawEdges(node.right);
    }
  }

  private drawNodes(node: TreeNode | null): void {
    if (!node || !this.ctx) return;

    const radius = 24;

    let fill = '#313244';
    switch (node.highlight) {
      case 'Current':
        fill = '#89b4fa';
        break;
      case 'Swap':
        fill = '#f9e2af';
        break;
    }

    this.ctx.beginPath();
    this.ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = '#11111b';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.fillStyle = '#e5e9f0';
    this.ctx.font = '14px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.value.toString(), node.x!, node.y!);

    this.drawNodes(node.left);
    this.drawNodes(node.right);
  }

  private updateButtons(): void {
    if (!this.btnPrev || !this.btnNext || !this.btnPlayPause) return;

    this.btnPrev.disabled = this.currentIndex === 0;
    this.btnNext.disabled = this.currentIndex >= this.steps.length - 1;

    const isFinished = this.currentIndex >= this.steps.length - 1;
    this.btnPlayPause.textContent = this.isPlaying ? '暂停' : (isFinished ? '完成' : '播放');
  }

  public destroy(): void {
    this.pause();
    this.steps = [];
    this.currentIndex = 0;
  }
}

registerAlgorithm({
  id: 'tree-invert',
  name: '二叉树翻转',
  viewId: 'algo-tree-invert-view',
  category: 'tree',
  description: '递归翻转二叉树的左右子树',
  icon: '🔄',
  template,
  Visualizer: TreeInvertVisualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握递归翻转二叉树的自底向上方法',
});