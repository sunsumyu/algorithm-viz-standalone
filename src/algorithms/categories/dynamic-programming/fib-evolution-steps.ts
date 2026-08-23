/**
 * 斐波那契数列 4 阶段算法演化数据模型与步进生成器
 * 阶段 1: 朴素递归 (Naive Recursion - Top-Down)
 * 阶段 2: 记忆化搜索 (Memoization - Top-Down DP)
 * 阶段 3: 递推表格法 (Tabulation - Bottom-Up DP)
 * 阶段 4: 空间压缩滚动变量 (Space-Optimized DP)
 */

import { DpDemoStep, DpTreeNode, clone1d } from './dp-demo-visualizer';
import { KeyPointsData } from '../../../core/code-panel';

export type EvolutionModeId = 'naive-recursive' | 'memo-topdown' | 'tabulation-bottomup' | 'space-optimized';

export interface EvolutionModeMeta {
  id: EvolutionModeId;
  label: string;
  badge: string;
  timeComplexity: string;
  spaceComplexity: string;
  direction: '自顶向下' | '自底向上';
  desc: string;
}

export const EVOLUTION_MODES: EvolutionModeMeta[] = [
  {
    id: 'naive-recursive',
    label: '1. 朴素递归 (Top-Down)',
    badge: '指数级 O(2ⁿ)',
    timeComplexity: 'O(2ⁿ)',
    spaceComplexity: 'O(n) 调用栈',
    direction: '自顶向下',
    desc: '直接依据数学定义递归展开，存在大量重复子问题计算。',
  },
  {
    id: 'memo-topdown',
    label: '2. 记忆化搜索 (Top-Down Memo)',
    badge: '剪枝 O(n)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) 备忘录+栈',
    direction: '自顶向下',
    desc: '递归求解大问题，利用备忘录（Memo）缓存历史结果，遇重复状态直接 O(1) 查表剪枝。',
  },
  {
    id: 'tabulation-bottomup',
    label: '3. 递推填表 (Bottom-Up Tabulation)',
    badge: '迭代 O(n)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) 数组',
    direction: '自底向上',
    desc: '消除函数递归栈开销，从 base cases (dp[0], dp[1]) 开始依转移方程自底向上填充数组。',
  },
  {
    id: 'space-optimized',
    label: '4. 空间状态压缩 (Space-Optimized)',
    badge: '常数空间 O(1)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) 滚动变量',
    direction: '自底向上',
    desc: '计算 dp[i] 时仅依赖前两项，用两个辅助变量滑动更新，将空间复杂度降至 O(1)。',
  },
];

export interface FibEvolutionStep extends DpDemoStep {
  evolutionMode: EvolutionModeId;
  memoTable?: Map<number, number>;
  rollingVars?: { prev2: number; prev1: number; curr: number };
  callTreeRoot?: DpTreeNode;
  stats?: {
    calls: number;
    hits: number;
    computes: number;
    naiveCalls: number;
  };
}

export interface EvolutionCodeConfig {
  languages: Record<string, string[]>;
  lineExplanations: Record<number, string>;
  keyPoints: KeyPointsData;
}

export const FIB_EVOLUTION_CODES: Record<EvolutionModeId, EvolutionCodeConfig> = {
  'naive-recursive': {
    languages: {
      java: [
        'class Solution {',
        '    public int fib(int n) {',
        '        if (n <= 1) return n; // 递归边界 (Base Case)',
        '        // 分治拆解为两个子问题，自顶向下递归',
        '        return fib(n - 1) + fib(n - 2);',
        '    }',
        '}',
      ],
      python: [
        'class Solution:',
        '    def fib(self, n: int) -> int:',
        '        if n <= 1:',
        '            return n  # 递归边界',
        '        # 分治递归：存在严重重复子问题计算',
        '        return self.fib(n - 1) + self.fib(n - 2)',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int fib(int n) {',
        '        if (n <= 1) return n; // 递归边界',
        '        // 自顶向下递归分治',
        '        return fib(n - 1) + fib(n - 2);',
        '    }',
        '};',
      ],
      javascript: [
        'function fib(n) {',
        '    if (n <= 1) return n; // 递归边界',
        '    // 朴素分治递归',
        '    return fib(n - 1) + fib(n - 2);',
        '}',
      ],
    },
    lineExplanations: {
      1: '🎯 <strong>函数主入口</strong>：接收目标项 n，通过分治递归求解斐波那契数。',
      2: '🎬 <strong>递归边界 (Base Case)</strong>：当 n 为 0 或 1 时直接返回自身，触底回溯。',
      3: '🗺️ <strong>注释说明</strong>：自顶向下拆解大问题为两个较小的重叠子问题。',
      4: '⚡ <strong>递归分治展开</strong>：分别递归调用 fib(n-1) 与 fib(n-2) 并相加。此处会导致 O(2ⁿ) 指数级爆炸。',
      5: '函数作用域结束。',
    },
    keyPoints: {
      title: '🎯 阶段 1：朴素递归 (Naive Recursion) 核心要点',
      summary: '直观还原数学定义，但由于没有记录历史结果，导致同一子问题被重复计算指数次。',
      points: [
        { label: '一、思维模式', desc: '<strong>自顶向下 (Top-Down)</strong>：欲求 fib(n)，先递归求 fib(n-1) 和 fib(n-2)。', icon: '🎯', badge: '自顶向下' },
        { label: '二、痛点：重叠子问题', desc: '计算 fib(5) 时，fib(3) 被计算 2 次，fib(2) 被计算 3 次，递归树节点达指数级。', icon: '⚠️', badge: '重复计算' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(2ⁿ)</code>。<br>• 空间复杂度：<code>O(n)</code>（系统调用栈最大深度）。', icon: '⏱️', badge: '指数时间' },
      ],
    },
  },
  'memo-topdown': {
    languages: {
      java: [
        'class Solution {',
        '    public int fib(int n) {',
        '        int[] memo = new int[n + 1];',
        '        Arrays.fill(memo, -1); // -1 表示未计算',
        '        return helper(n, memo);',
        '    }',
        '    private int helper(int n, int[] memo) {',
        '        if (n <= 1) return n;',
        '        if (memo[n] != -1) return memo[n]; // 备忘录命中，直接剪枝',
        '        memo[n] = helper(n - 1, memo) + helper(n - 2, memo);',
        '        return memo[n];',
        '    }',
        '}',
      ],
      python: [
        'class Solution:',
        '    def fib(self, n: int) -> int:',
        '        memo = [-1] * (n + 1)',
        '        def helper(k: int) -> int:',
        '            if k <= 1: return k',
        '            if memo[k] != -1: return memo[k]  # 查表剪枝',
        '            memo[k] = helper(k - 1) + helper(k - 2)',
        '            return memo[k]',
        '        return helper(n)',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int fib(int n) {',
        '        vector<int> memo(n + 1, -1);',
        '        return helper(n, memo);',
        '    }',
        '    int helper(int n, vector<int>& memo) {',
        '        if (n <= 1) return n;',
        '        if (memo[n] != -1) return memo[n]; // 命中缓存',
        '        memo[n] = helper(n - 1, memo) + helper(n - 2, memo);',
        '        return memo[n];',
        '    }',
        '};',
      ],
      javascript: [
        'function fib(n) {',
        '    const memo = new Array(n + 1).fill(-1);',
        '    function helper(k) {',
        '        if (k <= 1) return k;',
        '        if (memo[k] !== -1) return memo[k]; // 备忘录命中',
        '        memo[k] = helper(k - 1) + helper(k - 2);',
        '        return memo[k];',
        '    }',
        '    return helper(n);',
        '}',
      ],
    },
    lineExplanations: {
      1: '🎯 <strong>函数主入口</strong>：初始化备忘录并启动记忆化递归。',
      2: '🗺️ <strong>开辟备忘录数组</strong>：开辟长度为 n+1 的 memo 数组。',
      3: '🎬 <strong>初始化备忘录</strong>：填充 -1 标识状态尚未被计算过。',
      4: '🔄 <strong>递归入口</strong>：调用带 memo 数组的辅助递归函数。',
      7: '🎬 <strong>递归边界 (Base Case)</strong>：若 n 为 0 或 1 直接返回自身。',
      8: '⚡ <strong>备忘录查表剪枝</strong>：若 memo[n] != -1，说明先前已算过，直接 O(1) 返回，不再展开子树！',
      9: '🔄 <strong>首次计算并存入备忘录</strong>：计算子问题之和并将结果存入 memo[n]。',
      10: '🏁 <strong>返回当前解</strong>：返回计算完毕的 memo[n]。',
    },
    keyPoints: {
      title: '🎯 阶段 2：记忆化搜索 (Memoization) 核心要点',
      summary: '自顶向下 DP。保留递归思维结构，通过数组或哈希表做缓存，彻底消除重叠子问题。',
      points: [
        { label: '一、核心机制', desc: '<strong>查表与存表</strong>：计算前先查表，已存在则直接返回；初次计算后立即存入备忘录。', icon: '💾', badge: '备忘录机制' },
        { label: '二、剪枝收益', desc: '将指数级调用树剪枝为仅沿主线展开的单向链，每个子问题只计算一次。', icon: '✂️', badge: '剪枝优化' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>（备忘录数组 + 递归栈）。', icon: '⏱️', badge: '线性时间' },
      ],
    },
  },
  'tabulation-bottomup': {
    languages: {
      java: [
        'class Solution {',
        '    public int fib(int n) {',
        '        if (n <= 1) return n; // 边界特判',
        '        int[] dp = new int[n + 1]; // 1. 状态数组',
        '        dp[0] = 0;',
        '        dp[1] = 1; // 2. 边界初始化 (Base Case)',
        '        // 3. 自底向上循环填表 (Tabulation)',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n]; // 4. 返回目标状态',
        '    }',
        '}',
      ],
      python: [
        'class Solution:',
        '    def fib(self, n: int) -> int:',
        '        if n <= 1: return n',
        '        dp = [0] * (n + 1)',
        '        dp[0], dp[1] = 0, 1  # 边界初始化',
        '        for i in range(2, n + 1):  # 自底向上填表',
        '            dp[i] = dp[i - 1] + dp[i - 2]',
        '        return dp[n]',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int fib(int n) {',
        '        if (n <= 1) return n;',
        '        vector<int> dp(n + 1, 0);',
        '        dp[0] = 0; dp[1] = 1;',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      javascript: [
        'function fib(n) {',
        '    if (n <= 1) return n;',
        '    const dp = new Array(n + 1).fill(0);',
        '    dp[0] = 0;',
        '    dp[1] = 1;',
        '    for (let i = 2; i <= n; i++) {',
        '        dp[i] = dp[i - 1] + dp[i - 2];',
        '    }',
        '    return dp[n];',
        '}',
      ],
    },
    lineExplanations: {
      1: '🎯 <strong>函数主入口</strong>：接收输入整数 n，自底向上递推求解第 n 个斐波那契数。',
      2: '🎬 <strong>边界特判守卫</strong>：若 n 为 0 或 1，直接返回自身。',
      3: '🗺️ <strong>开辟状态数组</strong>：创建长度为 n+1 的一维数组 dp，dp[i] 存储第 i 项斐波那契数。',
      4: '🎬 <strong>边界初始化 (dp[0]=0)</strong>：第 0 项基底设为 0。',
      5: '🎬 <strong>边界初始化 (dp[1]=1)</strong>：第 1 项基底设为 1，构筑自底向上递推的最底层基石。',
      7: '🔄 <strong>自底向上循环填表</strong>：从 i=2 开始正序遍历递推至 n。',
      8: '⚡ <strong>状态转移方程</strong>：当前项等于前两项之和：dp[i] = dp[i - 1] + dp[i - 2]。',
      10: '🏁 <strong>返回全局最优解</strong>：返回 dp[n]，即为最终计算结果。',
    },
    keyPoints: {
      title: '🎯 阶段 3：递推填表法 (Tabulation) 核心要点',
      summary: '自底向上经典 DP。从基础状态开始顺序填表，消除系统函数递归调用栈开销。',
      points: [
        { label: '一、思维模式', desc: '<strong>自底向上 (Bottom-Up)</strong>：从最小的子问题 (dp[0], dp[1]) 出发，步步向大问题推进。', icon: '🚀', badge: '自底向上' },
        { label: '二、无递归栈优势', desc: '彻底摆脱函数调用栈开销与栈溢出（Stack Overflow）风险，工程常数极佳。', icon: '⚡', badge: '无栈开销' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>（一维表格空间）。', icon: '⏱️', badge: '线性时空' },
      ],
    },
  },
  'space-optimized': {
    languages: {
      java: [
        'class Solution {',
        '    public int fib(int n) {',
        '        if (n <= 1) return n; // 边界特判',
        '        int prev2 = 0; // 对应 dp[i-2], 初始为 dp[0]',
        '        int prev1 = 1; // 对应 dp[i-1], 初始为 dp[1]',
        '        int curr = 0;',
        '        for (int i = 2; i <= n; i++) {',
        '            curr = prev1 + prev2; // 状态转移',
        '            prev2 = prev1;        // 滑动窗口向前推进',
        '            prev1 = curr;',
        '        }',
        '        return curr;',
        '    }',
        '}',
      ],
      python: [
        'class Solution:',
        '    def fib(self, n: int) -> int:',
        '        if n <= 1: return n',
        '        prev2, prev1 = 0, 1',
        '        for _ in range(2, n + 1):',
        '            curr = prev1 + prev2  # 滚动求和',
        '            prev2, prev1 = prev1, curr  # 变量滑动',
        '        return prev1',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int fib(int n) {',
        '        if (n <= 1) return n;',
        '        int prev2 = 0, prev1 = 1, curr = 0;',
        '        for (int i = 2; i <= n; i++) {',
        '            curr = prev1 + prev2;',
        '            prev2 = prev1;',
        '            prev1 = curr;',
        '        }',
        '        return curr;',
        '    }',
        '};',
      ],
      javascript: [
        'function fib(n) {',
        '    if (n <= 1) return n;',
        '    let prev2 = 0, prev1 = 1, curr = 0;',
        '    for (let i = 2; i <= n; i++) {',
        '        curr = prev1 + prev2;',
        '        prev2 = prev1;',
        '        prev1 = curr;',
        '    }',
        '    return curr;',
        '}',
      ],
    },
    lineExplanations: {
      1: '🎯 <strong>函数主入口</strong>：接收输入整数 n，以 O(1) 滚动变量计算第 n 项。',
      2: '🎬 <strong>边界特判守卫</strong>：若 n 为 0 或 1，直接返回自身。',
      3: '🎬 <strong>初始化滚动变量 prev2</strong>：代表 dp[i-2]，初始对应第 0 项基底 0。',
      4: '🎬 <strong>初始化滚动变量 prev1</strong>：代表 dp[i-1]，初始对应第 1 项基底 1。',
      5: '🗺️ <strong>声明当前结果变量 curr</strong>：存储每一步累加结果。',
      6: '🔄 <strong>循环推进</strong>：从 i=2 迭代推进至 n。',
      7: '⚡ <strong>状态转移计算</strong>：当前值等于前两项之和：curr = prev1 + prev2。',
      8: '🔄 <strong>滑动窗口更新 prev2</strong>：prev2 更新为当前的 prev1。',
      9: '🔄 <strong>滑动窗口更新 prev1</strong>：prev1 更新为当前的 curr。',
      11: '🏁 <strong>返回全局最优解</strong>：返回最终计算得到的 curr。',
    },
    keyPoints: {
      title: '🎯 阶段 4：空间状态压缩 (Space-Optimized) 核心要点',
      summary: '利用局部依赖性，只用 2 个辅助变量滚动更新，将空间复杂度压缩至极致的 O(1)。',
      points: [
        { label: '一、优化洞察', desc: '<code>dp[i] = dp[i-1] + dp[i-2]</code> 仅依赖前 2 项，更早的历史值永远不会再被访问。', icon: '💡', badge: '局部依赖' },
        { label: '二、滑动窗口技术', desc: '用 <code>prev2</code> 和 <code>prev1</code> 维护长度为 2 的滑动窗口，不断向右滑动。', icon: '🔄', badge: '滚动数组' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<strong><code>O(1)</code> 常数级空间</strong>。', icon: '⏱️', badge: '极致优化' },
      ],
    },
  },
};

/**
 * 构建演化步骤
 */
export function buildEvolutionSteps(n: number, mode: EvolutionModeId): FibEvolutionStep[] {
  if (mode === 'naive-recursive') {
    return buildNaiveRecursiveSteps(n);
  }
  if (mode === 'memo-topdown') {
    return buildMemoTopDownSteps(n);
  }
  if (mode === 'tabulation-bottomup') {
    return buildTabulationSteps(n);
  }
  return buildSpaceOptimizedSteps(n);
}

/** 朴素递归步进 */
function buildNaiveRecursiveSteps(n: number): FibEvolutionStep[] {
  const steps: FibEvolutionStep[] = [];
  let nodeIdCounter = 0;
  let calls = 0;

  function createTreeNode(k: number): DpTreeNode {
    return {
      id: 'node_' + (nodeIdCounter++),
      val: 'fib(' + k + ')',
      status: 'current',
      children: [],
    };
  }

  function cloneTree(node: DpTreeNode | null): DpTreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      status: node.status,
      tag: node.tag,
      children: node.children ? node.children.map(cloneTree).filter((c): c is DpTreeNode => c !== null) : [],
    };
  }

  function recurse(k: number, currentSubtree: DpTreeNode): number {
    calls++;
    currentSubtree.status = 'current';

    if (k <= 1) {
      currentSubtree.tag = '=' + k;
      currentSubtree.status = 'visited';
      steps.push({
        evolutionMode: 'naive-recursive',
        tree: cloneTree(rootTree),
        message: '🍃 触底 Base Case: fib(' + k + ') = ' + k + '，直接返回。',
        log: 'fib(' + k + ') = ' + k + ' (Base Case)',
        formula: 'fib(' + k + ') = ' + k,
        codeLine: [2, 3],
        metrics: { i: k, answer: k, calls, status: 'Base Case' },
      });
      return k;
    }

    steps.push({
      evolutionMode: 'naive-recursive',
      tree: cloneTree(rootTree),
      message: '🔍 展开子问题: 求解 fib(' + k + ')，需要先递归求解 fib(' + (k - 1) + ') 和 fib(' + (k - 2) + ')。',
      log: '展开 fib(' + k + ') -> fib(' + (k - 1) + ') + fib(' + (k - 2) + ')',
      formula: 'fib(' + k + ') = fib(' + (k - 1) + ') + fib(' + (k - 2) + ')',
      codeLine: [4, 5],
      metrics: { i: k, answer: '计算中', calls, status: '向下递归' },
    });

    const leftNode = createTreeNode(k - 1);
    currentSubtree.children = currentSubtree.children || [];
    currentSubtree.children.push(leftNode);
    const leftVal = recurse(k - 1, leftNode);

    const rightNode = createTreeNode(k - 2);
    currentSubtree.children.push(rightNode);
    const rightVal = recurse(k - 2, rightNode);

    const total = leftVal + rightVal;
    currentSubtree.tag = '=' + total;
    currentSubtree.status = 'visited';

    steps.push({
      evolutionMode: 'naive-recursive',
      tree: cloneTree(rootTree),
      message: '✨ 子问题合并: fib(' + k + ') = fib(' + (k - 1) + ')(' + leftVal + ') + fib(' + (k - 2) + ')(' + rightVal + ') = ' + total + '。',
      log: 'fib(' + k + ') = ' + leftVal + ' + ' + rightVal + ' = ' + total,
      formula: 'fib(' + k + ') = ' + leftVal + ' + ' + rightVal + ' = ' + total,
      codeLine: [5],
      metrics: { i: k, answer: total, calls, status: '合并返回' },
    });

    return total;
  }

  const rootTree = createTreeNode(n);
  const finalAns = recurse(n, rootTree);

  steps.push({
    evolutionMode: 'naive-recursive',
    tree: cloneTree(rootTree),
    message: '🎉 朴素递归完成！fib(' + n + ') = ' + finalAns + '，总计发生 ' + calls + ' 次函数调用（存在大量重复计算）。',
    log: '计算完成: fib(' + n + ') = ' + finalAns + ', 总调用次数 = ' + calls,
    formula: 'fib(' + n + ') = ' + finalAns,
    codeLine: 5,
    metrics: { i: n, answer: finalAns, calls, status: '计算完毕' },
  });

  return steps;
}

/** 记忆化搜索步进 */
function buildMemoTopDownSteps(n: number): FibEvolutionStep[] {
  const steps: FibEvolutionStep[] = [];
  const memo = new Map<number, number>();
  let nodeIdCounter = 0;
  let calls = 0;
  let hits = 0;

  function createTreeNode(k: number): DpTreeNode {
    return {
      id: 'memo_node_' + (nodeIdCounter++),
      val: 'fib(' + k + ')',
      status: 'current',
      children: [],
    };
  }

  function cloneTree(node: DpTreeNode | null): DpTreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      status: node.status,
      tag: node.tag,
      children: node.children ? node.children.map(cloneTree).filter((c): c is DpTreeNode => c !== null) : [],
    };
  }

  function recurse(k: number, currentSubtree: DpTreeNode): number {
    calls++;
    currentSubtree.status = 'current';

    if (k <= 1) {
      memo.set(k, k);
      currentSubtree.tag = '=' + k;
      currentSubtree.status = 'visited';
      steps.push({
        evolutionMode: 'memo-topdown',
        tree: cloneTree(rootTree),
        memoTable: new Map(memo),
        dp1d: buildMemoArray(n, memo),
        message: '🍃 触底 Base Case: fib(' + k + ') = ' + k + '，存入备忘录 memo[' + k + '] = ' + k + '。',
        log: 'Base Case: fib(' + k + ') = ' + k + ', memo[' + k + ']=' + k,
        formula: 'memo[' + k + '] = ' + k,
        codeLine: [7, 8],
        metrics: { i: k, answer: k, calls, hits, status: 'Base Case 存表' },
      });
      return k;
    }

    if (memo.has(k)) {
      hits++;
      const val = memo.get(k)!;
      currentSubtree.tag = '命中:' + val;
      currentSubtree.status = 'selected';
      steps.push({
        evolutionMode: 'memo-topdown',
        tree: cloneTree(rootTree),
        memoTable: new Map(memo),
        dp1d: buildMemoArray(n, memo),
        message: '⚡ 备忘录命中 (Memo Hit)! fib(' + k + ') 之前已计算过，直接查表返回 ' + val + '，剪枝跳过全部子分支！',
        log: 'Memo Hit: fib(' + k + ') = ' + val + ' (剪枝)',
        formula: 'return memo[' + k + '] = ' + val + ' (O(1) 查表)',
        codeLine: [8],
        metrics: { i: k, answer: val, calls, hits, status: '🎯 查表剪枝' },
      });
      return val;
    }

    steps.push({
      evolutionMode: 'memo-topdown',
      tree: cloneTree(rootTree),
      memoTable: new Map(memo),
      dp1d: buildMemoArray(n, memo),
      message: '🔍 首次计算 fib(' + k + ')：未在备忘录中找到，继续向下递归求解 fib(' + (k - 1) + ') 与 fib(' + (k - 2) + ')。',
      log: '首次计算 fib(' + k + ')',
      formula: 'fib(' + k + ') = fib(' + (k - 1) + ') + fib(' + (k - 2) + ')',
      codeLine: [9, 10],
      metrics: { i: k, answer: '计算中', calls, hits, status: '未命中，展开' },
    });

    const leftNode = createTreeNode(k - 1);
    currentSubtree.children = currentSubtree.children || [];
    currentSubtree.children.push(leftNode);
    const leftVal = recurse(k - 1, leftNode);

    const rightNode = createTreeNode(k - 2);
    currentSubtree.children.push(rightNode);
    const rightVal = recurse(k - 2, rightNode);

    const total = leftVal + rightVal;
    memo.set(k, total);
    currentSubtree.tag = '=' + total;
    currentSubtree.status = 'visited';

    steps.push({
      evolutionMode: 'memo-topdown',
      tree: cloneTree(rootTree),
      memoTable: new Map(memo),
      dp1d: buildMemoArray(n, memo),
      message: '💾 存入备忘录: fib(' + k + ') = ' + leftVal + ' + ' + rightVal + ' = ' + total + '，存入 memo[' + k + '] 供后续复用。',
      log: '存表: memo[' + k + '] = ' + total,
      formula: 'memo[' + k + '] = memo[' + (k - 1) + '] + memo[' + (k - 2) + '] = ' + total,
      codeLine: [10, 11],
      metrics: { i: k, answer: total, calls, hits, status: '计算并存表' },
    });

    return total;
  }

  const rootTree = createTreeNode(n);
  const finalAns = recurse(n, rootTree);

  steps.push({
    evolutionMode: 'memo-topdown',
    tree: cloneTree(rootTree),
    memoTable: new Map(memo),
    dp1d: buildMemoArray(n, memo),
    message: '🎉 记忆化搜索完成！fib(' + n + ') = ' + finalAns + '，调用次数大幅减少至 ' + calls + ' 次（命中 ' + hits + ' 次缓存）。',
    log: '计算完成: fib(' + n + ') = ' + finalAns + ', 命中 ' + hits + ' 次',
    formula: 'return memo[' + n + '] = ' + finalAns,
    codeLine: 11,
    metrics: { i: n, answer: finalAns, calls, hits, status: '计算完毕' },
  });

  return steps;
}

function buildMemoArray(n: number, memo: Map<number, number>): number[] {
  const arr = Array(n + 1).fill('-');
  for (let i = 0; i <= n; i++) {
    if (memo.has(i)) arr[i] = memo.get(i)!;
  }
  return arr;
}

/** 递推表格法步进 */
function buildTabulationSteps(n: number): FibEvolutionStep[] {
  const steps: FibEvolutionStep[] = [];
  const dp: number[] = Array(n + 1).fill(0);
  dp[0] = 0;
  if (n >= 1) dp[1] = 1;

  steps.push({
    evolutionMode: 'tabulation-bottomup',
    dp1d: clone1d(dp),
    current: { index: 0 },
    message: '🎬 边界初始化: dp[0] = 0, dp[1] = 1。',
    log: '初始化 dp[0]=0, dp[1]=1',
    formula: 'dp[0] = 0, dp[1] = 1',
    codeLine: [4, 5],
    metrics: { i: 1, prev1: 1, prev2: 0, answer: 1, status: 'Base Case 初始化' },
  });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      evolutionMode: 'tabulation-bottomup',
      dp1d: clone1d(dp),
      current: { index: i },
      dependencies: [{ index: i - 1 }, { index: i - 2 }],
      message: '⚡ 循环填表: dp[' + i + '] = dp[' + (i - 1) + '] + dp[' + (i - 2) + '] = ' + dp[i] + '。',
      log: 'dp[' + i + '] = ' + dp[i],
      formula: 'dp[' + i + '] = dp[' + (i - 1) + '] + dp[' + (i - 2) + '] = ' + dp[i],
      codeLine: [7, 8],
      metrics: { i, prev1: dp[i - 1], prev2: dp[i - 2], answer: dp[i], status: '状态转移递推' },
    });
  }

  steps.push({
    evolutionMode: 'tabulation-bottomup',
    dp1d: clone1d(dp),
    current: { index: n },
    message: '🎉 递推填表完成！fib(' + n + ') = dp[' + n + '] = ' + dp[n] + '。',
    log: '计算完成: dp[' + n + '] = ' + dp[n],
    formula: 'return dp[' + n + '] = ' + dp[n],
    codeLine: 10,
    metrics: { i: n, prev1: dp[Math.max(0, n - 1)], prev2: dp[Math.max(0, n - 2)], answer: dp[n], status: '计算完毕' },
  });

  return steps;
}

/** 空间压缩滚动变量步进 */
function buildSpaceOptimizedSteps(n: number): FibEvolutionStep[] {
  const steps: FibEvolutionStep[] = [];
  if (n <= 1) {
    steps.push({
      evolutionMode: 'space-optimized',
      rollingVars: { prev2: 0, prev1: n, curr: n },
      dp1d: [n],
      current: { index: 0 },
      message: '🎬 边界特判: n <= 1，直接返回 ' + n + '。',
      log: 'fib(' + n + ') = ' + n,
      formula: 'return ' + n,
      codeLine: 2,
      metrics: { i: n, prev1: n, prev2: 0, answer: n, status: '边界返回' },
    });
    return steps;
  }

  let prev2 = 0, prev1 = 1, curr = 1;

  steps.push({
    evolutionMode: 'space-optimized',
    rollingVars: { prev2, prev1, curr: prev1 },
    current: { index: 1 },
    message: '🎬 空间压缩初始化: prev2 = 0, prev1 = 1。',
    log: '初始化 prev2=0, prev1=1',
    formula: 'prev2 = 0, prev1 = 1',
    codeLine: [3, 4, 5],
    metrics: { i: 1, prev1, prev2, answer: prev1, status: '滚动变量初始化' },
  });

  for (let i = 2; i <= n; i++) {
    curr = prev1 + prev2;
    steps.push({
      evolutionMode: 'space-optimized',
      rollingVars: { prev2, prev1, curr },
      current: { index: i },
      message: '⚡ 滚动求和: curr = prev1 (' + prev1 + ') + prev2 (' + prev2 + ') = ' + curr + '。',
      log: 'i=' + i + ': curr = ' + prev1 + ' + ' + prev2 + ' = ' + curr,
      formula: 'curr = prev1 + prev2 = ' + curr,
      codeLine: [6, 7],
      metrics: { i, prev1, prev2, answer: curr, status: '滚动累加' },
    });

    prev2 = prev1;
    prev1 = curr;

    steps.push({
      evolutionMode: 'space-optimized',
      rollingVars: { prev2, prev1, curr },
      current: { index: i },
      message: '🔄 窗口滑动: prev2 移至 ' + prev2 + ', prev1 移至 ' + prev1 + '。',
      log: '窗口滑动: prev2=' + prev2 + ', prev1=' + prev1,
      formula: 'prev2 = prev1; prev1 = curr;',
      codeLine: [8, 9],
      metrics: { i, prev1, prev2, answer: curr, status: '窗口向前滑动' },
    });
  }

  steps.push({
    evolutionMode: 'space-optimized',
    rollingVars: { prev2, prev1, curr },
    current: { index: n },
    message: '🎉 空间优化完成！fib(' + n + ') = ' + curr + '，仅用 O(1) 常数空间！',
    log: '计算完成: fib(' + n + ') = ' + curr + ', 空间复杂度 O(1)',
    formula: 'return curr = ' + curr,
    codeLine: 11,
    metrics: { i: n, prev1, prev2, answer: curr, status: '计算完毕' },
  });

  return steps;
}