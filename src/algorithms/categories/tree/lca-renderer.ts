/**
 * 最近公共祖先 (LCA) 可视化器
 * 支持代码联动高亮演示
 */

import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { CodePanel } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import template from './lca.html?raw';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  highlight?: string;
}

interface LCAStep {
  tree: TreeNode | null;
  message: string;
  currentNode: number | null;
  targetP: number;
  targetQ: number;
  foundLCA: number | null;
  callStack: string[];
  codeLine: number;
}

/**
 * 创建示例二叉树
 */
function createSampleTree(): TreeNode {
  return {
    value: 6,
    left: {
      value: 2,
      left: { value: 0, left: null, right: null },
      right: {
        value: 4,
        left: { value: 3, left: null, right: null },
        right: { value: 5, left: null, right: null }
      }
    },
    right: {
      value: 8,
      left: { value: 7, left: null, right: null },
      right: {
        value: 9,
        left: null,
        right: null
      }
    }
  };
}

/**
 * 复制树并添加高亮
 */
function cloneTreeWithHighlight(node: TreeNode | null, highlightType?: string): TreeNode | null {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTreeWithHighlight(node.left),
    right: cloneTreeWithHighlight(node.right),
    highlight: highlightType || 'None'
  };
}

/**
 * 查找节点并设置高亮
 */
function findAndHighlight(root: TreeNode | null, target: number, highlight: string): TreeNode | null {
  if (!root) return null;
  if (root.value === target) {
    root.highlight = highlight;
    return root;
  }
  if (target < root.value) {
    return findAndHighlight(root.left, target, highlight);
  }
  return findAndHighlight(root.right, target, highlight);
}

/**
 * 设置路径高亮
 */
function highlightPath(root: TreeNode | null, target: number): void {
  if (!root) return;
  if (root.value === target) return;
  root.highlight = 'Path';
  if (target < root.value) {
    highlightPath(root.left, target);
  } else {
    highlightPath(root.right, target);
  }
}

/**
 * LCA 算法实现，生成可视化步骤
 */
function lcaAlgorithm(root: TreeNode | null, p: number, q: number): LCAStep[] {
  const steps: LCAStep[] = [];
  const callStack: string[] = [];

  // 代码行号映射
  // 1: function lowestCommonAncestor(root, p, q) {
  // 2:     if (root === null) return null;
  // 3:     
  // 4:     // 如果找到目标节点，返回当前节点
  // 5:     if (root.val === p || root.val === q) return root;
  // 6:     
  // 7:     // 递归搜索左右子树
  // 8:     const left = lowestCommonAncestor(root.left, p, q);
  // 9:     const right = lowestCommonAncestor(root.right, p, q);
  // 10:    
  // 11:    // 如果左右都找到，当前节点是 LCA
  // 12:    if (left && right) return root;
  // 13:    
  // 14:    // 否则返回非空的那个
  // 15:    return left || right;
  // 16: }

  function dfs(node: TreeNode | null): TreeNode | null {
    if (!node) {
      steps.push({
        tree: cloneTreeWithHighlight(createSampleTree()),
        message: '到达空节点，返回 null',
        currentNode: null,
        targetP: p,
        targetQ: q,
        foundLCA: null,
        callStack: [...callStack],
        codeLine: 2
      });
      return null;
    }

    callStack.push(`dfs(${node.value})`);

    // 检查是否是目标节点
    if (node.value === p || node.value === q) {
      const treeCopy = cloneTreeWithHighlight(createSampleTree());
      findAndHighlight(treeCopy, node.value, 'Current');
      findAndHighlight(treeCopy, p, 'Target');
      findAndHighlight(treeCopy, q, 'Target');

      steps.push({
        tree: treeCopy,
        message: `找到目标节点 ${node.value}`,
        currentNode: node.value,
        targetP: p,
        targetQ: q,
        foundLCA: null,
        callStack: [...callStack],
        codeLine: 5
      });

      callStack.pop();
      return node;
    }

    const treeCopy = cloneTreeWithHighlight(createSampleTree());
    findAndHighlight(treeCopy, node.value, 'Current');
    findAndHighlight(treeCopy, p, 'Target');
    findAndHighlight(treeCopy, q, 'Target');

    steps.push({
      tree: treeCopy,
      message: `访问节点 ${node.value}，检查左右子树`,
      currentNode: node.value,
      targetP: p,
      targetQ: q,
      foundLCA: null,
      callStack: [...callStack],
      codeLine: 1
    });

    const leftResult = dfs(node.left);
    const rightResult = dfs(node.right);

    if (leftResult && rightResult) {
      const lcaTree = cloneTreeWithHighlight(createSampleTree());
      findAndHighlight(lcaTree, node.value, 'LCA');
      findAndHighlight(lcaTree, p, 'Target');
      findAndHighlight(lcaTree, q, 'Target');
      highlightPath(lcaTree, p);
      highlightPath(lcaTree, q);

      steps.push({
        tree: lcaTree,
        message: `节点 ${node.value} 是 LCA（左右子树都找到目标）`,
        currentNode: node.value,
        targetP: p,
        targetQ: q,
        foundLCA: node.value,
        callStack: [...callStack],
        codeLine: 12
      });

      callStack.pop();
      return node;
    }

    const result = leftResult || rightResult;
    if (result) {
      const resultTree = cloneTreeWithHighlight(createSampleTree());
      findAndHighlight(resultTree, result.value, 'Path');
      findAndHighlight(resultTree, p, 'Target');
      findAndHighlight(resultTree, q, 'Target');

      steps.push({
        tree: resultTree,
        message: `返回找到的节点 ${result.value}`,
        currentNode: node.value,
        targetP: p,
        targetQ: q,
        foundLCA: null,
        callStack: [...callStack],
        codeLine: 15
      });
    }

    callStack.pop();
    return result;
  }

  dfs(root);

  return steps;
}

export class LCAVisualizer implements IVisualizer {
  private steps: LCAStep[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1000;
  private timer: number | null = null;

  // 作用域根元素
  private root: HTMLElement | null = null;
  private codePanel: CodePanel | null = null;

  // DOM Elements
  private inputP: HTMLInputElement | null = null;
  private inputQ: HTMLInputElement | null = null;
  private btnStart: HTMLButtonElement | null = null;
  private btnPrev: HTMLButtonElement | null = null;
  private btnNext: HTMLButtonElement | null = null;
  private btnPlayPause: HTMLButtonElement | null = null;
  private btnReset: HTMLButtonElement | null = null;
  private btnBack: HTMLButtonElement | null = null;
  private navigateBack: (() => void) | null = null;
  private statusMessage: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private currentStepEl: HTMLElement | null = null;
  private totalStepsEl: HTMLElement | null = null;

  private codeLines: string[] = [
    "public TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {",
    "    if (root == null) return null;",
    "    ",
    "    // 如果找到目标节点，返回当前节点",
    "    if (root.val == p || root.val == q) return root;",
    "    ",
    "    // 递归搜索左右子树",
    "    TreeNode left = lowestCommonAncestor(root.left, p, q);",
    "    TreeNode right = lowestCommonAncestor(root.right, p, q);",
    "    ",
    "    // 如果左右都找到，当前节点是 LCA",
    "    if (left != null && right != null) return root;",
    "    ",
    "    // 否则返回非空的那个",
    "    return left != null ? left : right;",
    "}"
  ];

  public async init(context?: VisualizerContext): Promise<void> {
    console.log('[LCAVisualizer] init called');
    if (context && context.root) {
      this.root = context.root;
      this.navigateBack = context.navigateBack ?? null;
    } else {
      this.root = document.getElementById('algo-lca-view') as HTMLElement | null;
    }
    this.initDOMElements();
    this.setupEventListeners();
    this.initCodePanel();
    this.renderCanvas();
  }

  private initDOMElements(): void {
    if (!this.root) return;
    const root = this.root;

    this.inputP = root.querySelector('#lca-input-p') as HTMLInputElement;
    this.inputQ = root.querySelector('#lca-input-q') as HTMLInputElement;
    this.btnStart = root.querySelector('#lca-btn-start') as HTMLButtonElement;
    this.btnPrev = root.querySelector('#lca-btn-prev') as HTMLButtonElement;
    this.btnNext = root.querySelector('#lca-btn-next') as HTMLButtonElement;
    this.btnPlayPause = root.querySelector('#lca-btn-play') as HTMLButtonElement;
    this.btnReset = root.querySelector('#lca-btn-reset') as HTMLButtonElement;
    this.btnBack = root.querySelector('#btn-back') as HTMLButtonElement;
    this.statusMessage = root.querySelector('#lca-status-message') as HTMLElement;
    this.canvas = root.querySelector('#lca-tree-canvas') as HTMLCanvasElement;
    this.currentStepEl = root.querySelector('#lca-current-step') as HTMLElement;
    this.totalStepsEl = root.querySelector('#lca-total-steps') as HTMLElement;

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
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    if (this.btnPrev) this.btnPrev.onclick = () => this.prevStep();
    if (this.btnNext) this.btnNext.onclick = () => this.nextStep();
    if (this.btnPlayPause) this.btnPlayPause.onclick = () => this.togglePlay();
    if (this.btnReset) this.btnReset.onclick = () => this.reset();
    if (this.btnBack) {
      this.btnBack.onclick = () => {
        this.navigateBack?.();
      };
    }
  }

  private async start(): Promise<void> {
    if (!this.inputP || !this.inputQ || !this.statusMessage) return;

    const p = parseInt(this.inputP.value);
    const q = parseInt(this.inputQ.value);

    if (isNaN(p) || isNaN(q)) {
      this.updateStatus('请输入有效的节点值', 'invalid');
      return;
    }

    this.updateStatus('正在生成步骤...', 'processing');

    const tree = createSampleTree();
    this.steps = lcaAlgorithm(tree, p, q);
    this.currentIndex = 0;

    if (this.totalStepsEl) {
      this.totalStepsEl.textContent = this.steps.length.toString();
    }

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

    setTimeout(() => {
      if (this.currentIndex < this.steps.length - 1) {
        this.nextStep();
        this.tick();
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
    if (!this.canvas || !this.ctx) return;

    // Resize canvas
    const parent = this.canvas.parentElement;
    this.canvas.width = parent?.clientWidth || 600;
    this.canvas.height = parent?.clientHeight || 400;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.steps.length === 0) {
      // Draw initial tree
      const tree = createSampleTree();
      this.drawTree(tree);
      if (this.codePanel) {
        this.codePanel.clearHighlight();
      }
      return;
    }

    const step = this.steps[this.currentIndex];

    if (this.statusMessage) {
      this.statusMessage.textContent = step.message;
      this.statusMessage.style.color = step.foundLCA ? '#22c55e' : '#64748b';
    }

    if (this.currentStepEl) {
      this.currentStepEl.textContent = (this.currentIndex + 1).toString();
    }

    this.drawTree(step.tree);

    // 同步高亮代码行
    if (this.codePanel && step.codeLine) {
      this.codePanel.highlight(step.codeLine);
    }
  }

  private drawTree(root: TreeNode | null): void {
    if (!root || !this.ctx || !this.canvas) return;

    // Calculate positions
    this.layoutTree(root, this.canvas.width, this.canvas.height);

    // Draw edges first
    this.drawEdges(root);

    // Draw nodes
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

    // Determine color based on highlight
    let fill = '#313244';
    switch (node.highlight) {
      case 'Current':
        fill = '#89b4fa';
        break;
      case 'Target':
        fill = '#f9e2af';
        break;
      case 'Path':
        fill = '#cba6f7';
        break;
      case 'LCA':
        fill = '#a6e3a1';
        break;
    }

    // Draw node circle
    this.ctx.beginPath();
    this.ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = '#11111b';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw value text
    this.ctx.fillStyle = (node.highlight === 'Target' || node.highlight === 'LCA') ? '#1e1e2e' : '#e5e9f0';
    this.ctx.font = '14px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.value.toString(), node.x!, node.y!);

    // Recursively draw children
    this.drawNodes(node.left);
    this.drawNodes(node.right);
  }

  private updateStatus(message: string, type: 'processing' | 'valid' | 'invalid'): void {
    if (!this.statusMessage) return;
    this.statusMessage.textContent = message;
    this.statusMessage.style.color = type === 'valid' ? '#22c55e' : (type === 'invalid' ? '#ef4444' : '#64748b');
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
    if (this.codePanel) {
      this.codePanel.destroy();
      this.codePanel = null;
    }
    if (this.btnStart) this.btnStart.onclick = null;
    if (this.btnPrev) this.btnPrev.onclick = null;
    if (this.btnNext) this.btnNext.onclick = null;
    if (this.btnPlayPause) this.btnPlayPause.onclick = null;
    if (this.btnReset) this.btnReset.onclick = null;
    if (this.btnBack) this.btnBack.onclick = null;
    this.root = null;
    this.ctx = null;
    this.canvas = null;
  }
}

registerAlgorithm({
  id: 'lca',
  name: '最近公共祖先',
  viewId: 'algo-lca-view',
  category: 'tree',
  description: '查找二叉树中两个节点的最近公共祖先',
  icon: '🌳',
  template,
  Visualizer: LCAVisualizer,
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '学会递归找二叉树最近公共祖先',
});