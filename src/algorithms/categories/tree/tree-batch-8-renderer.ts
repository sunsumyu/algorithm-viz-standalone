/**
 * 树算法批量渲染器 - Batch 8
 * 包含: 最大二叉树、合并二叉树、中序+后序构造、BST LCA、BST插入、BST最小差、BST众数、BST删除、BST修剪、有序数组转BST、BST转累加树
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { TreeNode, buildTreeFromArr, renderTreeSVG, renderLog, BstStep } from './tree-template';
import maxTreeTemplate from './max-tree.html';
import mergeTreesTemplate from './merge-trees.html';
import buildTree2Template from './build-tree-2.html';
import bstLcaTemplate from './bst-lca.html';
import bstInsertTemplate from './bst-insert.html';
import bstMinDiffTemplate from './bst-min-diff.html';
import bstModesTemplate from './bst-modes.html';
import bstDeleteTemplate from './bst-delete.html';
import bstTrimTemplate from './bst-trim.html';
import sortedArrayToBstTemplate from './sorted-array-to-bst.html';
import bstToGstTemplate from './bst-to-gst.html';

function parseArray(input: string): (number | null)[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => {
      const t = s.trim();
      if (t === '' || t.toLowerCase() === 'null') return null;
      const n = parseInt(t, 10);
      return Number.isFinite(n) ? n : null;
    });
}

// ========== Level 17: 最大二叉树 ==========
interface MaxTreeStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxVal: number | null;
  message: string;
  log: string;
  codeLine?: number | number[];
}

function buildMaxTreeSteps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];

  steps.push({
    tree: null, current: null, depth: 0, maxVal: null,
    message: '开始构建最大二叉树',
    log: '开始',
    codeLine: 1,
  });

  const build = (nums: number[], depth: number): TreeNode | null => {
    if (nums.length === 0) return null;

    let maxIdx = 0;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] > nums[maxIdx]) maxIdx = i;
    }

    steps.push({
      tree: null, current: nums[maxIdx], depth, maxVal: nums[maxIdx],
      message: `数组 ${JSON.stringify(nums)} 中最大值 ${nums[maxIdx]} 在索引 ${maxIdx}`,
      log: `最大值 ${nums[maxIdx]} (索引${maxIdx})`,
      codeLine: 2,
    });

    const root: TreeNode = {
      val: nums[maxIdx],
      left: build(nums.slice(0, maxIdx), depth + 1),
      right: build(nums.slice(maxIdx + 1), depth + 1),
    };

    steps.push({
      tree: root, current: root.val, depth, maxVal: root.val,
      message: `节点 ${root.val} 构建完成`,
      log: `节点 ${root.val} 完成`,
      codeLine: 3,
    });

    return root;
  };

  const tree = build(nums, 0);
  steps.push({
    tree, current: null, depth: 0, maxVal: null,
    message: '最大二叉树构建完成',
    log: '完成',
    codeLine: 4,
  });

  return steps;
}

class MaxTreeVisualizer extends StepVisualizer<MaxTreeStep> {
  protected codeLines = [
    'public TreeNode constructMaximumBinaryTree(int[] nums) {',
    '    if (nums.length == 0) return null;',
    '    int maxIdx = 0;',
    '    for (int i = 1; i < nums.length; i++)',
    '        if (nums[i] > nums[maxIdx]) maxIdx = i;',
    '    TreeNode root = new TreeNode(nums[maxIdx]);',
    '    root.left = constructMaximumBinaryTree(Arrays.copyOfRange(nums, 0, maxIdx));',
    '    root.right = constructMaximumBinaryTree(Arrays.copyOfRange(nums, maxIdx + 1, nums.length));',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java 最大二叉树';

  private nums: number[] = [3, 2, 1, 6, 0, 5];
  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#mt-tree');
    this.logEl = this.root.querySelector('#mt-log');
    this.curEl = this.root.querySelector('#mt-cur');
    this.depthEl = this.root.querySelector('#mt-depth');
    this.resultEl = this.root.querySelector('#mt-result');
    this.bindPlaybackControls();
    this.bindExamples({
      '1': () => { this.nums = [3, 2, 1, 6, 0, 5]; this.start(); },
      '2': () => { this.nums = [1, 2, 3]; this.start(); },
      '3': () => { this.nums = [1, 2, 3, 4, 5, 6, 7]; this.start(); },
    });
  }

  protected buildSteps(): MaxTreeStep[] {
    return buildMaxTreeSteps(this.nums);
  }

  protected renderStep(step: MaxTreeStep): void {
    if (this.treeEl) {
      renderTreeSVG(this.treeEl, step.tree, step.current != null ? new Set([step.current]) : new Set(), '#cba6f7');
    }
    if (this.curEl) this.curEl.textContent = step.current != null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.resultEl) this.resultEl.textContent = step.maxVal != null ? String(step.maxVal) : '?';
    if (this.logEl) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map(s => s.log);
      renderLog(this.logEl, logs, this.currentIndex);
    }
  }
}

registerAlgorithm({
  id: 'max-tree',
  name: '最大二叉树',
  viewId: 'algo-max-tree-view',
  category: 'tree',
  description: '根据数组构建最大二叉树：最大值作为根，递归构建左右子树',
  icon: '🌲',
  template: maxTreeTemplate,
  Visualizer: MaxTreeVisualizer,
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '理解递归构建树的思想，找到最大值作为根节点',
});

// ========== Level 18: 合并二叉树 ==========
interface MergeTreesStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  sum: number | null;
  val1: number | null;
  val2: number | null;
  message: string;
  log: string;
  codeLine?: number | number[];
}

class MergeTreesVisualizer extends StepVisualizer<MergeTreesStep> {
  protected codeLines = [
    'public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {',
    '    if (root1 == null && root2 == null) return null;',
    '    int val = (root1 != null ? root1.val : 0) + (root2 != null ? root2.val : 0);',
    '    TreeNode node = new TreeNode(val);',
    '    node.left = mergeTrees(root1 != null ? root1.left : null, root2 != null ? root2.left : null);',
    '    node.right = mergeTrees(root1 != null ? root1.right : null, root2 != null ? root2.right : null);',
    '    return node;',
    '}',
  ];
  protected codePanelTitle = 'Java 合并二叉树';

  private treeData: (number | null)[] = [1, 3, 2, 5];
  private treeData2: (number | null)[] = [2, 1, 3, null, 4, null, 7];
  private treeEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private val1El: HTMLElement | null = null;
  private val2El: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeEl = this.root.querySelector('#mg-tree');
    this.logEl = this.root.querySelector('#mg-log');
    this.curEl = this.root.querySelector('#mg-cur');
    this.depthEl = this.root.querySelector('#mg-depth');
    this.resultEl = this.root.querySelector('#mg-result');
    this.val1El = this.root.querySelector('#mg-val1');
    this.val2El = this.root.querySelector('#mg-val2');
    this.bindPlaybackControls();
    this.bindExamples({
      '1': () => {
        this.treeData = [1, 3, 2, 5];
        this.treeData2 = [2, 1, 3, null, 4, null, 7];
        this.start();
      },
      '2': () => {
        this.treeData = [1];
        this.treeData2 = [1, 2, 3];
        this.start();
      },
      '3': () => {
        this.treeData = [1, 2, 3];
        this.treeData2 = [null, 4];
        this.start();
      },
    });

    // 自定义输入
    const runBtn = this.root.querySelector('#mg-run') as HTMLElement | null;
    const inp1 = this.root.querySelector('#mg-inp1') as HTMLInputElement | null;
    const inp2 = this.root.querySelector('#mg-inp2') as HTMLInputElement | null;
    if (runBtn && inp1 && inp2) {
      runBtn.addEventListener('click', () => {
        this.treeData = parseArray(inp1.value);
        this.treeData2 = parseArray(inp2.value);
        this.start();
      });
    }
  }

  protected buildSteps(): MergeTreesStep[] {
    const steps: MergeTreesStep[] = [];
    const root1 = buildTreeFromArr(this.treeData);
    const root2 = buildTreeFromArr(this.treeData2);

    steps.push({
      tree: null, current: null, depth: 0, sum: null,
      val1: null, val2: null,
      message: '开始合并两棵树',
      log: '开始合并两棵树',
      codeLine: 1,
    });

    const merge = (n1: TreeNode | null, n2: TreeNode | null, depth: number): TreeNode | null => {
      if (!n1 && !n2) return null;

      const v1 = n1 ? n1.val : null;
      const v2 = n2 ? n2.val : null;
      const sum = (n1?.val ?? 0) + (n2?.val ?? 0);

      steps.push({
        tree: null, current: sum, depth, sum,
        val1: v1, val2: v2,
        message: `节点值合并: (${v1 ?? 0}) + (${v2 ?? 0}) = ${sum}`,
        log: `合并 (${v1 ?? 0} + ${v2 ?? 0} = ${sum})`,
        codeLine: 2,
      });

      const left = merge(n1?.left ?? null, n2?.left ?? null, depth + 1);
      const right = merge(n1?.right ?? null, n2?.right ?? null, depth + 1);

      const newNode: TreeNode = { val: sum, left, right };

      steps.push({
        tree: newNode, current: sum, depth, sum,
        val1: v1, val2: v2,
        message: `节点 ${sum} 完成 (左子树: ${left ? '有' : '无'}, 右子树: ${right ? '有' : '无'})`,
        log: `节点 ${sum} 完成`,
        codeLine: 3,
      });

      return newNode;
    };

    const result = merge(root1, root2, 0);
    steps.push({
      tree: result, current: null, depth: 0, sum: null,
      val1: null, val2: null,
      message: '合并完成',
      log: '合并完成',
      codeLine: 7,
    });

    return steps;
  }

  protected renderStep(step: MergeTreesStep): void {
    if (this.treeEl) {
      renderTreeSVG(this.treeEl, step.tree, step.current != null ? new Set([step.current]) : new Set(), '#a6e3a1');
    }
    if (this.curEl) this.curEl.textContent = step.current != null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.resultEl) this.resultEl.textContent = step.sum != null ? String(step.sum) : '?';
    if (this.val1El) this.val1El.textContent = step.val1 != null ? String(step.val1) : '-';
    if (this.val2El) this.val2El.textContent = step.val2 != null ? String(step.val2) : '-';
    if (this.logEl) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map(s => s.log);
      renderLog(this.logEl, logs, this.currentIndex);
    }
  }
}

registerAlgorithm({
  id: 'merge-trees',
  name: '合并二叉树',
  viewId: 'algo-merge-trees-view',
  category: 'tree',
  description: '合并两棵二叉树，对应节点值相加',
  icon: '🤝',
  template: mergeTreesTemplate,
  Visualizer: MergeTreesVisualizer,
  difficulty: 1,
  levelOrder: 18,
  learningGoal: '理解递归合并两棵树的方法',
});

// 由于代码量很大，我将创建一个简化的批量渲染器文件
// 包含所有剩余算法的基本实现

// ========== Level 19-27: 其他BST算法 ==========

// 通用BST渲染器基类
abstract class BSTVisualizer extends StepVisualizer<BstStep> {
  protected treeEl: HTMLElement | null = null;
  protected logEl: HTMLElement | null = null;
  protected curEl: HTMLElement | null = null;
  protected depthEl: HTMLElement | null = null;
  protected resultEl: HTMLElement | null = null;
  protected treeData: (number | null)[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    const p = this.prefix;
    this.treeEl = this.root.querySelector(`#${p}tree`);
    this.logEl = this.root.querySelector(`#${p}log`);
    this.curEl = this.root.querySelector(`#${p}cur`);
    this.depthEl = this.root.querySelector(`#${p}depth`);
    this.resultEl = this.root.querySelector(`#${p}result`);
    this.bindPlaybackControls();
    this.bindExamples(this.getExamples());
  }

  protected abstract get prefix(): string;
  protected abstract getExamples(): Record<string, () => void>;

  protected renderStep(step: BstStep): void {
    if (this.treeEl) {
      renderTreeSVG(this.treeEl, step.tree, step.highlight || new Set(), step.color || '#cba6f7');
    }
    if (this.curEl) this.curEl.textContent = step.current != null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.resultEl) this.resultEl.textContent = step.result != null ? String(step.result) : '?';
    if (this.logEl) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map(s => s.log);
      renderLog(this.logEl, logs, this.currentIndex);
    }
  }
}

// ========== Level 19: 中序+后序构造二叉树 ==========
class BuildTree2Visualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode buildTree(int[] inorder, int[] postorder) {',
    '    if (inorder.length == 0) return null;',
    '    int rootVal = postorder[postorder.length - 1];',
    '    int rootIdx = 0;',
    '    for (int i = 0; i < inorder.length; i++)',
    '        if (inorder[i] == rootVal) rootIdx = i;',
    '    TreeNode root = new TreeNode(rootVal);',
    '    root.left = buildTree(Arrays.copyOfRange(inorder, 0, rootIdx), Arrays.copyOfRange(postorder, 0, rootIdx));',
    '    root.right = buildTree(Arrays.copyOfRange(inorder, rootIdx + 1, inorder.length), Arrays.copyOfRange(postorder, rootIdx, postorder.length - 1));',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java 中序+后序构造';
  protected prefix = 'bt2';
  private inorder: number[] = [9, 3, 15, 20, 7];
  private postorder: number[] = [9, 15, 7, 20, 3];

  protected getExamples() {
    return {
      '1': () => { this.inorder = [9, 3, 15, 20, 7]; this.postorder = [9, 15, 7, 20, 3]; this.start(); },
      '2': () => { this.inorder = [1, 2, 3]; this.postorder = [1, 2, 3]; this.start(); },
      '3': () => { this.inorder = [1, 2, 3, 4, 5, 6, 7]; this.postorder = [1, 3, 2, 5, 7, 6, 4]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const build = (inorder: number[], postorder: number[], depth: number): TreeNode | null => {
      if (inorder.length === 0) return null;
      const rootVal = postorder[postorder.length - 1];
      const rootIdx = inorder.indexOf(rootVal);
      steps.push({
        tree: null, current: rootVal, depth, highlight: new Set([rootVal]), color: '#8be9fd',
        log: `后序末尾 ${rootVal} 为根，中序位置 ${rootIdx}`,
      });
      const root: TreeNode = {
        val: rootVal,
        left: build(inorder.slice(0, rootIdx), postorder.slice(0, rootIdx), depth + 1),
        right: build(inorder.slice(rootIdx + 1), postorder.slice(rootIdx, -1), depth + 1),
      };
      steps.push({ tree: root, current: rootVal, depth, highlight: new Set([rootVal]), color: '#8be9fd', log: `节点 ${rootVal} 构建完成` });
      return root;
    };
    steps.push({ tree: null, current: null, depth: 0, highlight: new Set(), color: '#8be9fd', log: '开始构造' });
    const tree = build(this.inorder, this.postorder, 0);
    steps.push({ tree, current: null, depth: 0, highlight: new Set(), color: '#8be9fd', log: '完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'build-tree-2',
  name: '中序+后序构造二叉树',
  viewId: 'algo-build-tree-2-view',
  category: 'tree',
  description: '从中序和后序遍历序列构造二叉树',
  icon: '🔨',
  template: buildTree2Template,
  Visualizer: BuildTree2Visualizer,
  difficulty: 2,
  levelOrder: 19,
  learningGoal: '理解后序遍历的特点，最后一个元素是根',
});

// ========== Level 20: BST 最近公共祖先 ==========
class BSTLCAVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {',
    '    if (root == null) return null;',
    '    if (p < root.val && q < root.val) return lowestCommonAncestor(root.left, p, q);',
    '    if (p > root.val && q > root.val) return lowestCommonAncestor(root.right, p, q);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST最近公共祖先';
  protected prefix = 'blc';
  private p = 2;
  private q = 8;
  protected getExamples() {
    return {
      '1': () => { this.treeData = [6, 2, 8, 0, 4, 7, 9]; this.p = 2; this.q = 8; this.start(); },
      '2': () => { this.treeData = [6, 2, 8, 0, 4, 7, 9]; this.p = 2; this.q = 4; this.start(); },
      '3': () => { this.treeData = [5, 3, 6, 2, 4, null, 8]; this.p = 2; this.q = 8; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#cba6f7', log: `找 ${this.p} 和 ${this.q} 的 LCA` });
    let node = root;
    let depth = 0;
    while (node) {
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `当前节点 ${node.val}` });
      if (this.p < node.val && this.q < node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `都小于 ${node.val}，去左子树` });
        node = node.left; depth++;
      } else if (this.p > node.val && this.q > node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `都大于 ${node.val}，去右子树` });
        node = node.right; depth++;
      } else {
        steps.push({ tree: root, current: node.val, depth, highlight: new Set([node.val, this.p, this.q]), color: '#a6e3a1', log: `找到 LCA: ${node.val}` });
        break;
      }
    }
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-lca',
  name: 'BST最近公共祖先',
  viewId: 'algo-bst-lca-view',
  category: 'tree',
  description: '利用BST性质找最近公共祖先',
  icon: '🔗',
  template: bstLcaTemplate,
  Visualizer: BSTLCAVisualizer,
  difficulty: 2,
  levelOrder: 20,
  learningGoal: '利用BST性质优化LCA查找',
});

// ========== Level 21: BST 插入操作 ==========
class BSTInsertVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode insertIntoBST(TreeNode root, int val) {',
    '    if (root == null) return new TreeNode(val);',
    '    if (val < root.val) root.left = insertIntoBST(root.left, val);',
    '    else root.right = insertIntoBST(root.right, val);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST插入';
  protected prefix = 'bi';
  private val = 5;
  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 2, 7, 1, 3]; this.val = 5; this.start(); },
      '2': () => { this.treeData = [40, 20, 60, 10, 30, 50, 70]; this.val = 25; this.start(); },
      '3': () => { this.treeData = [4, 2, 7, 1, 3]; this.val = 5; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `插入值 ${this.val}` });
    const insert = (node: TreeNode | null, val: number, depth: number): TreeNode => {
      if (!node) {
        const newNode: TreeNode = { val, left: null, right: null };
        steps.push({ tree: root, current: val, depth, highlight: new Set([val]), color: '#f38ba8', log: `找到位置，插入 ${val}` });
        return newNode;
      }
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (val < node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${val} < ${node.val}，去左子树` });
        node.left = insert(node.left, val, depth + 1);
      } else {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${val} >= ${node.val}，去右子树` });
        node.right = insert(node.right, val, depth + 1);
      }
      return node;
    };
    const result = insert(root, this.val, 0);
    steps.push({ tree: result, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '插入完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-insert',
  name: 'BST插入操作',
  viewId: 'algo-bst-insert-view',
  category: 'tree',
  description: '向BST中插入新节点',
  icon: '➕',
  template: bstInsertTemplate,
  Visualizer: BSTInsertVisualizer,
  difficulty: 1,
  levelOrder: 21,
  learningGoal: '掌握BST插入的递归实现',
});

// ========== Level 22: BST 最小绝对差 ==========
class BSTMinDiffVisualizer extends BSTVisualizer {
  protected codeLines = [
    'int minDiff = Integer.MAX_VALUE;',
    'int prev = -1;',
    '',
    'public int getMinimumDifference(TreeNode root) {',
    '    inorder(root);',
    '    return minDiff;',
    '}',
    '',
    'private void inorder(TreeNode node) {',
    '    if (node == null) return;',
    '    inorder(node.left);',
    '    if (prev != -1) minDiff = Math.min(minDiff, node.val - prev);',
    '    prev = node.val;',
    '    inorder(node.right);',
    '}',
  ];
  protected codePanelTitle = 'Java BST最小绝对差';
  protected prefix = 'bmd';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 2, 6, 1, 3]; this.start(); },
      '2': () => { this.treeData = [1, 0, 48, null, null, 12, 49]; this.start(); },
      '3': () => { this.treeData = [1, 2, 3, 4, 5]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始中序遍历' });
    let minDiff = Infinity, prev = -1;
    const inorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      inorder(node.left, depth + 1);
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (prev !== -1) {
        const diff = node.val - prev;
        minDiff = Math.min(minDiff, diff);
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `差值 ${diff}，最小 ${minDiff}` });
      }
      prev = node.val;
      inorder(node.right, depth + 1);
    };
    inorder(root, 0);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `最小差值: ${minDiff}`, result: minDiff });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-min-diff',
  name: 'BST最小绝对差',
  viewId: 'algo-bst-min-diff-view',
  category: 'tree',
  description: 'BST中任意两节点的最小差值',
  icon: '📏',
  template: bstMinDiffTemplate,
  Visualizer: BSTMinDiffVisualizer,
  difficulty: 1,
  levelOrder: 22,
  learningGoal: '利用BST中序遍历的有序性',
});

// ========== Level 23: BST 众数 ==========
class BSTModesVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public List<Integer> findMode(TreeNode root) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    int maxCount = 0;',
    '    inorder(root, map);',
    '    List<Integer> result = new ArrayList<>();',
    '    for (Map.Entry<Integer, Integer> entry : map.entrySet()) {',
    '        if (entry.getValue() == maxCount)',
    '            result.add(entry.getKey());',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = 'Java BST众数';
  protected prefix = 'bmo';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [1, null, 2, 2]; this.start(); },
      '2': () => { this.treeData = [0]; this.start(); },
      '3': () => { this.treeData = [1, 1, 2, 2, 3]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始统计频率' });
    const map = new Map<number, number>();
    let maxCount = 0;
    const inorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      inorder(node.left, depth + 1);
      const count = (map.get(node.val) || 0) + 1;
      map.set(node.val, count);
      maxCount = Math.max(maxCount, count);
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `${node.val} 出现 ${count} 次` });
      inorder(node.right, depth + 1);
    };
    inorder(root, 0);
    const modes = [...map].filter(([_, c]) => c === maxCount).map(([v]) => v);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(modes), color: '#a6e3a1', log: `众数: ${modes.join(', ')}`, result: modes.join(',') });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-modes',
  name: 'BST中的众数',
  viewId: 'algo-bst-modes-view',
  category: 'tree',
  description: '找出BST中出现次数最多的节点值',
  icon: '📊',
  template: bstModesTemplate,
  Visualizer: BSTModesVisualizer,
  difficulty: 1,
  levelOrder: 23,
  learningGoal: '中序遍历统计节点频率',
});

// ========== Level 24: 删除 BST 节点 ==========
class BSTDeleteVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode deleteNode(TreeNode root, int key) {',
    '    if (root == null) return null;',
    '    if (key < root.val) root.left = deleteNode(root.left, key);',
    '    else if (key > root.val) root.right = deleteNode(root.right, key);',
    '    else {',
    '        if (root.left == null) return root.right;',
    '        if (root.right == null) return root.left;',
    '        TreeNode min = findMin(root.right);',
    '        root.val = min.val;',
    '        root.right = deleteNode(root.right, min.val);',
    '    }',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST删除';
  protected prefix = 'bd';
  private key = 3;

  protected getExamples() {
    return {
      '1': () => { this.treeData = [5, 3, 6, 2, 4, null, 7]; this.key = 3; this.start(); },
      '2': () => { this.treeData = [5, 3, 6, 2, 4, null, 7]; this.key = 0; this.start(); },
      '3': () => { this.treeData = [5, 3, 6, 2, 4, null, 7]; this.key = 5; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `删除值 ${this.key}` });
    const deleteNode = (node: TreeNode | null, key: number, depth: number): TreeNode | null => {
      if (!node) return null;
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (key < node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${key} < ${node.val}，去左子树` });
        node.left = deleteNode(node.left, key, depth + 1);
      } else if (key > node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${key} > ${node.val}，去右子树` });
        node.right = deleteNode(node.right, key, depth + 1);
      } else {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#f38ba8', log: `找到 ${key}，删除` });
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let min = node.right;
        while (min.left) min = min.left;
        node.val = min.val;
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#a6e3a1', log: `用右子树最小值 ${min.val} 替代` });
        node.right = deleteNode(node.right, min.val, depth + 1);
      }
      return node;
    };
    const result = deleteNode(root, this.key, 0);
    steps.push({ tree: result, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '删除完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-delete',
  name: '删除BST节点',
  viewId: 'algo-bst-delete-view',
  category: 'tree',
  description: '从BST中删除指定值的节点',
  icon: '🗑️',
  template: bstDeleteTemplate,
  Visualizer: BSTDeleteVisualizer,
  difficulty: 2,
  levelOrder: 24,
  learningGoal: '掌握BST删除的三种情况',
});

// ========== Level 25: 修剪 BST ==========
class BSTTrimVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode trimBST(TreeNode root, int low, int high) {',
    '    if (root == null) return null;',
    '    if (root.val < low) return trimBST(root.right, low, high);',
    '    if (root.val > high) return trimBST(root.left, low, high);',
    '    root.left = trimBST(root.left, low, high);',
    '    root.right = trimBST(root.right, low, high);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST修剪';
  protected prefix = 'bt';
  private low = 1;
  private high = 2;

  protected getExamples() {
    return {
      '1': () => { this.treeData = [1, 0, 2]; this.low = 1; this.high = 2; this.start(); },
      '2': () => { this.treeData = [3, 0, 4, null, 2, null, null, 1]; this.low = 1; this.high = 3; this.start(); },
      '3': () => { this.treeData = [1, 0, 2]; this.low = 2; this.high = 2; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `修剪范围 [${this.low}, ${this.high}]` });
    const trim = (node: TreeNode | null, low: number, high: number, depth: number): TreeNode | null => {
      if (!node) return null;
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (node.val < low) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#f38ba8', log: `${node.val} < ${low}，修剪左子树` });
        return trim(node.right, low, high, depth);
      }
      if (node.val > high) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#f38ba8', log: `${node.val} > ${high}，修剪右子树` });
        return trim(node.left, low, high, depth);
      }
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#a6e3a1', log: `${node.val} 在范围内，保留` });
      node.left = trim(node.left, low, high, depth + 1);
      node.right = trim(node.right, low, high, depth + 1);
      return node;
    };
    const result = trim(root, this.low, this.high, 0);
    steps.push({ tree: result, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '修剪完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-trim',
  name: '修剪BST',
  viewId: 'algo-bst-trim-view',
  category: 'tree',
  description: '修剪BST使所有节点值在[low, high]范围内',
  icon: '✂️',
  template: bstTrimTemplate,
  Visualizer: BSTTrimVisualizer,
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '理解BST修剪的递归逻辑',
});

// ========== Level 26: 有序数组转 BST ==========
class SortedArrayToBSTVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode sortedArrayToBST(int[] nums) {',
    '    if (nums.length == 0) return null;',
    '    int mid = nums.length / 2;',
    '    TreeNode root = new TreeNode(nums[mid]);',
    '    root.left = sortedArrayToBST(Arrays.copyOfRange(nums, 0, mid));',
    '    root.right = sortedArrayToBST(Arrays.copyOfRange(nums, mid + 1, nums.length));',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java 有序数组转BST';
  protected prefix = 'sb';
  private nums: number[] = [-10, -3, 0, 5, 9];

  protected getExamples() {
    return {
      '1': () => { this.nums = [-10, -3, 0, 5, 9]; this.start(); },
      '2': () => { this.nums = [1, 3]; this.start(); },
      '3': () => { this.nums = [0, 1, 2, 3, 4, 5]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    steps.push({ tree: null, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `数组: [${this.nums.join(', ')}]` });
    const build = (nums: number[], depth: number): TreeNode | null => {
      if (nums.length === 0) return null;
      const mid = Math.floor(nums.length / 2);
      const highlight = new Set([nums[mid]]);
      steps.push({ tree: null, current: nums[mid], depth, highlight, color: '#fab387', log: `中点 ${nums[mid]} (索引${mid})` });
      const root: TreeNode = {
        val: nums[mid],
        left: build(nums.slice(0, mid), depth + 1),
        right: build(nums.slice(mid + 1), depth + 1),
      };
      steps.push({ tree: root, current: root.val, depth, highlight, color: '#89b4fa', log: `节点 ${root.val} 构建完成` });
      return root;
    };
    const tree = build(this.nums, 0);
    steps.push({ tree, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '构建完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'sorted-array-to-bst',
  name: '有序数组转BST',
  viewId: 'algo-sorted-array-to-bst-view',
  category: 'tree',
  description: '将有序数组转换为高度平衡的BST',
  icon: '🔄',
  template: sortedArrayToBstTemplate,
  Visualizer: SortedArrayToBSTVisualizer,
  difficulty: 1,
  levelOrder: 26,
  learningGoal: '分治构建平衡BST',
});

// BST 转累加树
class BSTToGSTVisualizer extends BSTVisualizer {
  protected codeLines = [
    'int sum = 0;',
    '',
    'public TreeNode convertBST(TreeNode root) {',
    '    reverseInorder(root);',
    '    return root;',
    '}',
    '',
    'private void reverseInorder(TreeNode node) {',
    '    if (node == null) return;',
    '    reverseInorder(node.right);',
    '    sum += node.val;',
    '    node.val = sum;',
    '    reverseInorder(node.left);',
    '}',
  ];
  protected codePanelTitle = 'Java BST转累加树';
  protected prefix = 'bg';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]; this.start(); },
      '2': () => { this.treeData = [0, null, 1]; this.start(); },
      '3': () => { this.treeData = [1, 0, 2]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始反向中序遍历' });
    let sum = 0;
    const reverseInorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      reverseInorder(node.right, depth + 1);
      sum += node.val;
      const oldVal = node.val;
      node.val = sum;
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `${oldVal} → ${node.val} (累加和=${sum})` });
      reverseInorder(node.left, depth + 1);
    };
    reverseInorder(root, 0);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '转换完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-to-gst',
  name: 'BST转累加树',
  viewId: 'algo-bst-to-gst-view',
  category: 'tree',
  description: '将BST转换为累加树（右根左遍历）',
  icon: '💰',
  template: bstToGstTemplate,
  Visualizer: BSTToGSTVisualizer,
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握反向中序遍历（右根左）',
});

export {};
