/**
 * 树算法批量渲染器 - Batch 7（声明式 4-Card 标准架构）
 * 包含: 最小深度、平衡二叉树、左叶子之和、二叉树所有路径、完全二叉树节点个数、找树左下角的值
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr, renderTreeSVG } from './tree-template';

/** 通用：树层数组输入解析（空串按空树处理交给 buildTreeFromArr） */
function parseTreeInput(raw: unknown, fallback: (number | null)[]): (number | null)[] {
  const text = String(raw ?? '').trim();
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((v) => (v === null ? null : Number(v)));
  } catch {
    // 逗号分隔兜底
    return text
      .split(/[,，\s]+/)
      .map((s) => (s === 'null' ? null : Number.isFinite(Number(s)) ? Number(s) : null));
  }
  return fallback;
}

/** 通用：树 SVG 主视觉（渲染深模块 renderTreeSVG） */
function renderTreeCanvas(
  container: HTMLElement,
  tree: TreeNode | null,
  highlight: Set<number>,
  primaryColor: string,
  secondary?: Set<number>,
  secondaryColor?: string,
): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  renderTreeSVG(container, tree, highlight, primaryColor, secondary, secondaryColor);
}

/* ═══════════════════ Level 11: 二叉树最小深度 ═══════════════════ */

interface MinDepthStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  minDepth: number | null;
  message: string;
  log: string;
  codeLine?: number | number[];
  metrics?: Record<string, string>;
}

function buildMinDepthSteps(root: TreeNode | null): MinDepthStep[] {
  const steps: MinDepthStep[] = [];
  let minDepth = Infinity;

  steps.push({
    tree: root, current: null, depth: 0, minDepth: null,
    message: '开始计算最小深度',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, depth: number): number => {
    if (!node) return 0;

    steps.push({
      tree: root, current: node.val, depth, minDepth: minDepth === Infinity ? null : minDepth,
      message: `访问节点 ${node.val}，当前深度 ${depth}`,
      log: `访问 ${node.val} (深度${depth})`,
      codeLine: 2,
    });

    if (!node.left && !node.right) {
      if (depth < minDepth) minDepth = depth;
      steps.push({
        tree: root, current: node.val, depth, minDepth,
        message: `叶子节点 ${node.val}，更新最小深度为 ${minDepth}`,
        log: `叶子 ${node.val} → 最小深度=${minDepth}`,
        codeLine: 3,
      });
      return depth;
    }

    const left = node.left ? dfs(node.left, depth + 1) : Infinity;
    const right = node.right ? dfs(node.right, depth + 1) : Infinity;
    const result = Math.min(left, right) + 1;

    steps.push({
      tree: root, current: node.val, depth, minDepth: minDepth === Infinity ? null : minDepth,
      message: `节点 ${node.val} 返回深度 ${result}`,
      log: `${node.val} 返回 ${result}`,
      codeLine: 4,
    });

    return result;
  };

  if (root) {
    dfs(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, minDepth,
      message: `最小深度为 ${minDepth}`,
      log: `完成: 最小深度=${minDepth}`,
      codeLine: 5,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<MinDepthStep>({
  id: 'min-depth',
  name: '二叉树最小深度',
  category: 'tree',
  description: '从根节点到最近叶子节点的最短路径上的节点数量',
  icon: '📏',
  difficulty: 1,
  levelOrder: 11,
  learningGoal: '理解最小深度与最大深度的区别，注意只有单侧子树的情况',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[3,9,20,null,null,15,7]' },
  ],
  presets: [
    { label: '示例 1', values: { tree: '[3,9,20,null,null,15,7]' } },
    { label: '示例 2 (单侧链)', values: { tree: '[2,null,3,null,4,null,5,null,6]' } },
    { label: '示例 3', values: { tree: '[1,2]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '最小深度', color: '#10b981' },
  ],
  legend: [
    { label: '当前访问', color: '#fab387' },
  ],
  codeLanguages: {
    java: [
      'public int minDepth(TreeNode root) {',
      '  if (root == null) return 0;',
      '  if (root.left == null && root.right == null) return 1;',
      '  int left = root.left != null ? minDepth(root.left) : Integer.MAX_VALUE;',
      '  int right = root.right != null ? minDepth(root.right) : Integer.MAX_VALUE;',
      '  return Math.min(left, right) + 1;',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [3, 9, 20, null, null, 15, 7]));
    return buildMinDepthSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        result: s.minDepth != null ? String(s.minDepth) : '?',
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      step.current != null ? new Set([step.current]) : new Set(),
      '#fab387',
    ),
});

/* ═══════════════════ Level 12: 平衡二叉树 ═══════════════════ */

interface BalancedStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  height: number | null;
  balanced: boolean | null;
  message: string;
  log: string;
  codeLine?: number | number[];
  metrics?: Record<string, string>;
}

function buildBalancedSteps(root: TreeNode | null): BalancedStep[] {
  const steps: BalancedStep[] = [];
  let isBalanced = true;

  steps.push({
    tree: root, current: null, depth: 0, height: null, balanced: null,
    message: '开始检查是否为平衡二叉树',
    log: '开始',
    codeLine: 1,
  });

  const getHeight = (node: TreeNode | null, depth: number): number => {
    if (!node) return 0;

    steps.push({
      tree: root, current: node.val, depth, height: null, balanced: null,
      message: `访问节点 ${node.val}，当前深度 ${depth}`,
      log: `访问 ${node.val} (深度${depth})`,
      codeLine: 2,
    });

    const leftH = getHeight(node.left, depth + 1);
    const rightH = getHeight(node.right, depth + 1);
    const height = Math.max(leftH, rightH) + 1;

    if (Math.abs(leftH - rightH) > 1) {
      isBalanced = false;
      steps.push({
        tree: root, current: node.val, depth, height, balanced: false,
        message: `节点 ${node.val} 不平衡: 左高${leftH}, 右高${rightH}`,
        log: `${node.val} 不平衡 (|${leftH}-${rightH}|>1)`,
        codeLine: 3,
      });
    } else {
      steps.push({
        tree: root, current: node.val, depth, height, balanced: null,
        message: `节点 ${node.val} 平衡: 左高${leftH}, 右高${rightH}, 高度${height}`,
        log: `${node.val} 平衡 (高度${height})`,
        codeLine: 4,
      });
    }

    return height;
  };

  if (root) {
    getHeight(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, height: null, balanced: isBalanced,
      message: isBalanced ? '是平衡二叉树' : '不是平衡二叉树',
      log: `完成: ${isBalanced ? '平衡' : '不平衡'}`,
      codeLine: 5,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<BalancedStep>({
  id: 'balanced',
  name: '平衡二叉树',
  category: 'tree',
  description: '判断二叉树是否为平衡二叉树（任意节点左右子树高度差不超过1）',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 12,
  learningGoal: '理解平衡二叉树的定义，掌握递归判断方法',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[3,9,20,null,null,15,7]' },
  ],
  presets: [
    { label: '示例 1 (平衡)', values: { tree: '[3,9,20,null,null,15,7]' } },
    { label: '示例 2 (不平衡)', values: { tree: '[1,2,2,3,3,null,null,4,4]' } },
    { label: '示例 3 (大树)', values: { tree: '[1,2,3,4,5,6,null,7,8,null,null,9,10]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#a6e3a1' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '是否平衡', color: '#10b981' },
  ],
  legend: [
    { label: '当前访问', color: '#a6e3a1' },
    { label: '检测到不平衡', color: '#f38ba8' },
  ],
  codeLanguages: {
    java: [
      'public boolean isBalanced(TreeNode root) {',
      '  private int getHeight(TreeNode node) {',
      '    if (node == null) return 0;',
      '    int leftH = getHeight(node.left);',
      '    int rightH = getHeight(node.right);',
      '    if (Math.abs(leftH - rightH) > 1) return -1;',
      '    return Math.max(leftH, rightH) + 1;',
      '  }',
      '  return getHeight(root) != -1;',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [3, 9, 20, null, null, 15, 7]));
    return buildBalancedSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        result: s.balanced != null ? (s.balanced ? '是' : '否') : '?',
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      step.current != null ? new Set([step.current]) : new Set(),
      step.balanced === false ? '#f38ba8' : '#a6e3a1',
    ),
});

/* ═══════════════════ Level 13: 左叶子之和 ═══════════════════ */

interface LeftLeavesStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  sum: number;
  isLeft: boolean;
  message: string;
  log: string;
  codeLine?: number | number[];
  leftNodes: Set<number>;
  metrics?: Record<string, string>;
}

function buildLeftLeavesSteps(root: TreeNode | null): LeftLeavesStep[] {
  const steps: LeftLeavesStep[] = [];
  let sum = 0;
  const leftNodes = new Set<number>();

  steps.push({
    tree: root, current: null, depth: 0, sum: 0, isLeft: false, leftNodes: new Set(),
    message: '开始计算左叶子之和',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, isLeft: boolean, depth: number): void => {
    if (!node) return;

    steps.push({
      tree: root, current: node.val, depth, sum, isLeft, leftNodes: new Set(leftNodes),
      message: `访问节点 ${node.val}${isLeft ? ' (左子节点)' : ''}`,
      log: `访问 ${node.val}${isLeft ? ' (左)' : ''}`,
      codeLine: 2,
    });

    if (!node.left && !node.right && isLeft) {
      sum += node.val;
      leftNodes.add(node.val);
      steps.push({
        tree: root, current: node.val, depth, sum, isLeft: true, leftNodes: new Set(leftNodes),
        message: `左叶子 ${node.val}，累加到 ${sum}`,
        log: `左叶子 ${node.val} → sum=${sum}`,
        codeLine: 3,
      });
      return;
    }

    dfs(node.left, true, depth + 1);
    dfs(node.right, false, depth + 1);
  };

  if (root) {
    dfs(root, false, 0);
    steps.push({
      tree: root, current: null, depth: 0, sum, isLeft: false, leftNodes: new Set(leftNodes),
      message: `左叶子之和为 ${sum}`,
      log: `完成: sum=${sum}`,
      codeLine: 4,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<LeftLeavesStep>({
  id: 'left-leaves',
  name: '左叶子之和',
  category: 'tree',
  description: '计算二叉树中所有左叶子节点的值之和',
  icon: '🍃',
  difficulty: 1,
  levelOrder: 13,
  learningGoal: '理解左叶子的定义，掌握递归时传递方向信息的方法',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[3,9,20,null,null,15,7]' },
  ],
  presets: [
    { label: '示例 1', values: { tree: '[3,9,20,null,null,15,7]' } },
    { label: '示例 2', values: { tree: '[1,2,3,4,5]' } },
    { label: '示例 3 (单节点)', values: { tree: '[1]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '左叶子之和', color: '#10b981' },
  ],
  legend: [
    { label: '左叶子', color: '#a6e3a1' },
    { label: '当前访问', color: '#fab387' },
  ],
  codeLanguages: {
    java: [
      'public int sumOfLeftLeaves(TreeNode root) {',
      '  private int dfs(TreeNode node, boolean isLeft) {',
      '    if (node == null) return 0;',
      '    if (node.left == null && node.right == null && isLeft) return node.val;',
      '    return dfs(node.left, true) + dfs(node.right, false);',
      '  }',
      '  return dfs(root, false);',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [3, 9, 20, null, null, 15, 7]));
    return buildLeftLeavesSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        result: String(s.sum),
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      step.leftNodes,
      '#a6e3a1',
      step.current != null ? new Set([step.current]) : undefined,
      '#fab387',
    ),
});

/* ═══════════════════ Level 14: 二叉树所有路径 ═══════════════════ */

interface AllPathsStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  path: number[];
  allPaths: string[];
  message: string;
  log: string;
  codeLine?: number | number[];
  metrics?: Record<string, string>;
}

function buildAllPathsSteps(root: TreeNode | null): AllPathsStep[] {
  const steps: AllPathsStep[] = [];
  const path: number[] = [];
  const allPaths: string[] = [];

  steps.push({
    tree: root, current: null, depth: 0, path: [], allPaths: [],
    message: '开始收集所有根到叶子的路径',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, depth: number): void => {
    if (!node) return;

    path.push(node.val);
    steps.push({
      tree: root, current: node.val, depth, path: [...path], allPaths: [...allPaths],
      message: `访问节点 ${node.val}，当前路径: ${path.join('->')}`,
      log: `访问 ${node.val}`,
      codeLine: 2,
    });

    if (!node.left && !node.right) {
      const pathStr = path.join('->');
      allPaths.push(pathStr);
      steps.push({
        tree: root, current: node.val, depth, path: [...path], allPaths: [...allPaths],
        message: `叶子节点，添加路径: ${pathStr}`,
        log: `添加路径: ${pathStr}`,
        codeLine: 3,
      });
    }

    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);

    path.pop();
    steps.push({
      tree: root, current: node.val, depth, path: [...path], allPaths: [...allPaths],
      message: `回溯，离开节点 ${node.val}`,
      log: `回溯 ${node.val}`,
      codeLine: 4,
    });
  };

  if (root) {
    dfs(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, path: [], allPaths: [...allPaths],
      message: `共找到 ${allPaths.length} 条路径`,
      log: `完成: ${allPaths.length} 条路径`,
      codeLine: 5,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<AllPathsStep>({
  id: 'all-paths',
  name: '二叉树所有路径',
  category: 'tree',
  description: '返回所有从根节点到叶子节点的路径',
  icon: '🛤️',
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '掌握回溯法收集路径的技巧',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[1,2,3,null,5]' },
  ],
  presets: [
    { label: '示例 1', values: { tree: '[1,2,3,null,5]' } },
    { label: '示例 2 (满树)', values: { tree: '[1,2,3,4,5,6,7]' } },
    { label: '示例 3 (单节点)', values: { tree: '[1]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#f9e2af' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'path', label: '当前路径', color: '#fab387' },
    { id: 'result', label: '已收集路径数', color: '#10b981' },
  ],
  legend: [
    { label: '路径经过', color: '#fab387' },
    { label: '当前访问', color: '#f9e2af' },
  ],
  codeLanguages: {
    java: [
      'public List<String> binaryTreePaths(TreeNode root) {',
      '  List<String> result = new ArrayList<>();',
      '  private void dfs(TreeNode node, List<Integer> path) {',
      '    if (node == null) return;',
      '    path.add(node.val);',
      '    if (node.left == null && node.right == null) {',
      '      result.add(path.stream().map(String::valueOf)',
      '          .collect(Collectors.joining("->")));',
      '    }',
      '    dfs(node.left, path);',
      '    dfs(node.right, path);',
      '    path.remove(path.size() - 1);',
      '  }',
      '  dfs(root, new ArrayList<>());',
      '  return result;',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [1, 2, 3, null, 5]));
    return buildAllPathsSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        path: s.path.length ? s.path.join('->') : '—',
        result: String(s.allPaths.length),
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      new Set(step.path),
      '#fab387',
      step.current != null ? new Set([step.current]) : undefined,
      '#f9e2af',
    ),
});

/* ═══════════════════ Level 15: 完全二叉树节点个数 ═══════════════════ */

interface CountNodesStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  count: number;
  message: string;
  log: string;
  codeLine?: number | number[];
  visitedNodes: Set<number>;
  metrics?: Record<string, string>;
}

function buildCountNodesSteps(root: TreeNode | null): CountNodesStep[] {
  const steps: CountNodesStep[] = [];
  let count = 0;
  const visitedNodes = new Set<number>();

  steps.push({
    tree: root, current: null, depth: 0, count: 0, visitedNodes: new Set(),
    message: '开始计算完全二叉树的节点个数',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, depth: number): number => {
    if (!node) return 0;

    count++;
    visitedNodes.add(node.val);
    steps.push({
      tree: root, current: node.val, depth, count, visitedNodes: new Set(visitedNodes),
      message: `访问节点 ${node.val}，计数: ${count}`,
      log: `访问 ${node.val} → count=${count}`,
      codeLine: 2,
    });

    const left = dfs(node.left, depth + 1);
    const right = dfs(node.right, depth + 1);
    const total = left + right + 1;

    steps.push({
      tree: root, current: node.val, depth, count, visitedNodes: new Set(visitedNodes),
      message: `节点 ${node.val} 子树共 ${total} 个节点`,
      log: `${node.val} 子树=${total}`,
      codeLine: 3,
    });

    return total;
  };

  if (root) {
    dfs(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, count, visitedNodes: new Set(visitedNodes),
      message: `总节点数为 ${count}`,
      log: `完成: count=${count}`,
      codeLine: 4,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<CountNodesStep>({
  id: 'count-nodes',
  name: '完全二叉树节点个数',
  category: 'tree',
  description: '计算完全二叉树的节点总数',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 15,
  learningGoal: '理解完全二叉树的性质，掌握递归计数方法',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[1,2,3,4,5,6]' },
  ],
  presets: [
    { label: '示例 1 (完全)', values: { tree: '[1,2,3,4,5,6]' } },
    { label: '示例 2 (空树)', values: { tree: '[]' } },
    { label: '示例 3 (单节点)', values: { tree: '[1]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '节点计数', color: '#10b981' },
  ],
  legend: [
    { label: '已访问', color: '#a6e3a1' },
    { label: '当前访问', color: '#fab387' },
  ],
  codeLanguages: {
    java: [
      'public int countNodes(TreeNode root) {',
      '  if (root == null) return 0;',
      '  return countNodes(root.left) + countNodes(root.right) + 1;',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [1, 2, 3, 4, 5, 6]));
    return buildCountNodesSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        result: String(s.count),
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      step.visitedNodes,
      '#a6e3a1',
      step.current != null ? new Set([step.current]) : undefined,
      '#fab387',
    ),
});

/* ═══════════════════ Level 16: 找树左下角的值 ═══════════════════ */

interface BottomLeftStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxDepth: number;
  bottomLeft: number | null;
  message: string;
  log: string;
  codeLine?: number | number[];
  metrics?: Record<string, string>;
}

function buildBottomLeftSteps(root: TreeNode | null): BottomLeftStep[] {
  const steps: BottomLeftStep[] = [];
  let maxDepth = -1;
  let bottomLeft: number | null = null;

  steps.push({
    tree: root, current: null, depth: 0, maxDepth: -1, bottomLeft: null,
    message: '开始寻找最底层最左边的值',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, depth: number): void => {
    if (!node) return;

    steps.push({
      tree: root, current: node.val, depth, maxDepth, bottomLeft,
      message: `访问节点 ${node.val}，当前深度 ${depth}`,
      log: `访问 ${node.val} (深度${depth})`,
      codeLine: 2,
    });

    if (!node.left && !node.right) {
      if (depth > maxDepth) {
        maxDepth = depth;
        bottomLeft = node.val;
        steps.push({
          tree: root, current: node.val, depth, maxDepth, bottomLeft,
          message: `叶子节点 ${node.val}，更新最底层最左值为 ${bottomLeft}`,
          log: `叶子 ${node.val} → bottomLeft=${bottomLeft}`,
          codeLine: 3,
        });
      }
      return;
    }

    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  };

  if (root) {
    dfs(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, maxDepth, bottomLeft,
      message: `最底层最左边的值为 ${bottomLeft}`,
      log: `完成: bottomLeft=${bottomLeft}`,
      codeLine: 4,
    });
  }

  return steps;
}

registerDeclarativeAlgorithm<BottomLeftStep>({
  id: 'bottom-left',
  name: '找树左下角的值',
  category: 'tree',
  description: '找出二叉树最底层最左边节点的值',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 16,
  learningGoal: '掌握通过深度比较找到最底层最左节点的方法',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '[2,1,3]' },
  ],
  presets: [
    { label: '示例 1', values: { tree: '[2,1,3]' } },
    { label: '示例 2 (右偏链)', values: { tree: '[1,null,2,null,null,3,null,null,4]' } },
    { label: '示例 3 (大树)', values: { tree: '[1,2,3,4,null,5,6,null,null,7]' } },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'max-depth', label: '最深层深', color: '#a855f7' },
    { id: 'result', label: '左下角值', color: '#10b981' },
  ],
  legend: [
    { label: '当前答案', color: '#f9e2af' },
    { label: '当前访问', color: '#fab387' },
  ],
  codeLanguages: {
    java: [
      'public int findBottomLeftValue(TreeNode root) {',
      '  int maxDepth = -1;',
      '  int[] bottomLeft = {0};',
      '  private void dfs(TreeNode node, int depth) {',
      '    if (node == null) return;',
      '    if (node.left == null && node.right == null && depth > maxDepth) {',
      '      maxDepth = depth;',
      '      bottomLeft[0] = node.val;',
      '    }',
      '    dfs(node.left, depth + 1);',
      '    dfs(node.right, depth + 1);',
      '  }',
      '  dfs(root, 0);',
      '  return bottomLeft[0];',
      '}',
    ].join('\n'),
  },
  generateSteps: (inputs) => {
    const root = buildTreeFromArr(parseTreeInput(inputs.tree, [2, 1, 3]));
    return buildBottomLeftSteps(root).map((s) => ({
      ...s,
      metrics: {
        cur: s.current != null ? String(s.current) : '-',
        depth: String(s.depth),
        'max-depth': s.maxDepth >= 0 ? String(s.maxDepth) : '-',
        result: s.bottomLeft != null ? String(s.bottomLeft) : '?',
      },
    }));
  },
  renderCanvas: (container, step) =>
    renderTreeCanvas(
      container,
      step.tree,
      step.bottomLeft != null ? new Set<number>([step.bottomLeft]) : new Set<number>(),
      '#f9e2af',
      step.current != null ? new Set([step.current]) : undefined,
      '#fab387',
    ),
});

export {};
