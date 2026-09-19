/**
 * 数字串翻译方案数(LeetCode 91)步进生成器 — 四阶段黄金演化
 *
 * 包含四阶段：
 * 1. naive-recursive: 朴素递归 f1(char[] s, int i)
 * 2. memo-topdown: 记忆化搜索 f2(char[] s, int i, int[] memo)
 * 3. tabulation-bottomup: 一维 dp 数组填表（从右往左镜像填表）
 * 4. space-optimized: 空间压缩滚动变量 O(1)
 *
 * 纯函数模块：不引用任何 DOM / 浏览器 API。
 */

import type { StepBase } from '../../../core/step-visualizer';
import type { KeyPointsData } from '../../../core/code-panel';

/* ───────────────────────── 演化模式元数据 ───────────────────────── */

export type EvolutionModeId =
  | 'naive-recursive'
  | 'memo-topdown'
  | 'tabulation-bottomup'
  | 'space-optimized';

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
    desc: '从左往右尝试解码 1 位或 2 位字符，每个状态分化两个递归分支，遇 0 阻断。',
  },
  {
    id: 'memo-topdown',
    label: '2. 记忆化搜索 (Top-Down Memo)',
    badge: '剪枝 O(n)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) 备忘录+栈',
    direction: '自顶向下',
    desc: '引入一维 memo[n+1] 数组缓存各后缀子串解码总数，遇重复子问题直接 O(1) 查表剪枝。',
  },
  {
    id: 'tabulation-bottomup',
    label: '3. 递推填表 (Bottom-Up Tabulation)',
    badge: '迭代 O(n)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) 数组',
    direction: '自底向上',
    desc: '消除函数调用栈，从右往左依次计算 dp[i]，根据 1 位与 2 位合法性累加后继状态。',
  },
  {
    id: 'space-optimized',
    label: '4. 空间状态压缩 (Space-Optimized)',
    badge: '常数空间 O(1)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) 滚动变量',
    direction: '自底向上',
    desc: '当前状态 dp[i] 仅依赖紧邻的后两项，维护两个滚动变量滑动更新，空间优化至 O(1)。',
  },
];

/* ───────────────────────── 四语言代码模板与行号锚点 ───────────────────────── */

export interface EvolutionCodeConfig {
  languages: Record<string, string[]>;
  lineExplanations: Record<number, string>;
  keyPoints: KeyPointsData;
}

/** 兼容旧版导出的 Java 递归代码 */
export const REC_JAVA_CODE = [
  '// s : 数字字符串',
  '// s[i....]有多少种有效的转化方案',
  'public static int f1(char[] s, int i) {',
  '    if (i == s.length) {',
  '        return 1;',
  '    }',
  '    int ans;',
  "    if (s[i] == '0') {",
  '        ans = 0;',
  '    } else {',
  '        ans = f1(s, i + 1);',
  "        if (i + 1 < s.length && ((s[i] - '0') * 10 + s[i + 1] - '0') <= 26) {",
  '            ans += f1(s, i + 2);',
  '        }',
  '    }',
  '    return ans;',
  '}',
];

/** 兼容旧版导出的 Java DP 迭代代码 */
export const DP_JAVA_CODE = [
  'public static int numDecodings(String s) {',
  '    int n = s.length();',
  '    int[] dp = new int[n + 1];',
  '    dp[n] = 1; // 边界：空串一种方案',
  '    for (int i = n - 1; i >= 0; i--) {',
  "        if (s.charAt(i) == '0') {",
  "            dp[i] = 0; // '0' 不能单独翻译",
  '        } else {',
  '            dp[i] = dp[i + 1]; // 取 1 位',
  '            if (i + 1 < n && (s.charAt(i) - \'0\') * 10 + (s.charAt(i + 1) - \'0\') <= 26) {',
  '                dp[i] += dp[i + 2]; // 取 2 位',
  '            }',
  '        }',
  '    }',
  '    return dp[0];',
  '}',
];

export const DECODE_WAYS_EVOLUTION_CODES: Record<EvolutionModeId, EvolutionCodeConfig> = {
  'naive-recursive': {
    languages: {
      java: REC_JAVA_CODE,
      python: [
        'class Solution:',
        '    def numDecodings(self, s: str) -> int:',
        '        def f1(i: int) -> int:',
        '            if i == len(s):',
        '                return 1',
        '            if s[i] == "0":',
        '                return 0',
        '            ans = f1(i + 1)',
        '            if i + 1 < len(s) and int(s[i:i+2]) <= 26:',
        '                ans += f1(i + 2)',
        '            return ans',
        '        return f1(0)',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numDecodings(string s) {',
        '        return f1(s, 0);',
        '    }',
        'private:',
        '    int f1(const string& s, int i) {',
        '        if (i == s.size()) return 1;',
        '        if (s[i] == \'0\') return 0;',
        '        int ans = f1(s, i + 1);',
        '        if (i + 1 < s.size() && (s[i] - \'0\') * 10 + (s[i + 1] - \'0\') <= 26) {',
        '            ans += f1(s, i + 2);',
        '        }',
        '        return ans;',
        '    }',
        '};',
      ],
      javascript: [
        'function numDecodings(s) {',
        '    function f1(i) {',
        '        if (i === s.length) return 1;',
        '        if (s[i] === "0") return 0;',
        '        let ans = f1(i + 1);',
        '        if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) {',
        '            ans += f1(i + 2);',
        '        }',
        '        return ans;',
        '    }',
        '    return f1(0);',
        '}',
      ],
    },
    lineExplanations: {
      3: '函数入口：求解后缀子串 s[i...] 的全部有效解码方案数',
      4: '递归边界：i == s.length 说明整个数字串全部切分完毕，计 1 种有效方案',
      8: '字符 0 阻断：数字 0 无法映射单个字母，且不能作为两位数前导零，返回 0',
      11: '分支一：切分 1 位字符 s[i]，递归求解剩余后缀 f1(s, i + 1)',
      12: '分支二：切分 2 位字符且数值 <= 26，递归求解剩余后缀 f1(s, i + 2)',
      16: '返回当前子问题的解码方案汇总 ans',
    },
    keyPoints: {
      title: '朴素递归思想',
      summary: '每个位置有两种尝试：翻译 1 位（只要不是 0）或翻译 2 位（10 <= 值 <= 26）。',
      steps: [
        { label: '状态定义', desc: 'f1(i) 为 s[i...] 后缀子串的解码方案数。', icon: '🎯' },
        { label: '递归边界', desc: 'i == len 返回 1；s[i] == "0" 返回 0。', icon: '🎬' },
        { label: '分支决策', desc: 'ans = f(i+1) + (two <= 26 ? f(i+2) : 0)。', icon: '🔄' },
      ],
    },
  },
  'memo-topdown': {
    languages: {
      java: [
        'class Solution {',
        '    public int numDecodings(String s) {',
        '        int[] memo = new int[s.length() + 1];',
        '        Arrays.fill(memo, -1);',
        '        return f2(s.toCharArray(), 0, memo);',
        '    }',
        '    private static int f2(char[] s, int i, int[] memo) {',
        '        if (i == s.length) return 1;',
        '        if (s[i] == \'0\') return 0;',
        '        if (memo[i] != -1) return memo[i]; // 备忘录命中直接剪枝',
        '        int ans = f2(s, i + 1, memo);',
        '        if (i + 1 < s.length && ((s[i] - \'0\') * 10 + s[i + 1] - \'0\') <= 26) {',
        '            ans += f2(s, i + 2, memo);',
        '        }',
        '        return memo[i] = ans;',
        '    }',
        '}',
      ],
      python: [
        'class Solution:',
        '    def numDecodings(self, s: str) -> int:',
        '        memo = [-1] * (len(s) + 1)',
        '        def f2(i: int) -> int:',
        '            if i == len(s): return 1',
        '            if s[i] == "0": return 0',
        '            if memo[i] != -1: return memo[i]  # 备忘录命中',
        '            ans = f2(i + 1)',
        '            if i + 1 < len(s) and int(s[i:i+2]) <= 26:',
        '                ans += f2(i + 2)',
        '            memo[i] = ans',
        '            return ans',
        '        return f2(0)',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numDecodings(string s) {',
        '        vector<int> memo(s.size() + 1, -1);',
        '        return f2(s, 0, memo);',
        '    }',
        'private:',
        '    int f2(const string& s, int i, vector<int>& memo) {',
        '        if (i == s.size()) return 1;',
        '        if (s[i] == \'0\') return 0;',
        '        if (memo[i] != -1) return memo[i]; // 备忘录命中',
        '        int ans = f2(s, i + 1, memo);',
        '        if (i + 1 < s.size() && (s[i] - \'0\') * 10 + (s[i + 1] - \'0\') <= 26) {',
        '            ans += f2(s, i + 2, memo);',
        '        }',
        '        return memo[i] = ans;',
        '    }',
        '};',
      ],
      javascript: [
        'function numDecodings(s) {',
        '    const memo = new Array(s.length + 1).fill(-1);',
        '    function f2(i) {',
        '        if (i === s.length) return 1;',
        '        if (s[i] === "0") return 0;',
        '        if (memo[i] !== -1) return memo[i]; // 备忘录命中',
        '        let ans = f2(i + 1);',
        '        if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) {',
        '            ans += f2(i + 2);',
        '        }',
        '        return memo[i] = ans;',
        '    }',
        '    return f2(0);',
        '}',
      ],
    },
    lineExplanations: {
      7: '带备忘录的递归入口：检查 memo[i] 是否已存在',
      10: '备忘录命中：memo[i] != -1 时直接 O(1) 返回，整棵子树立即剪枝',
      15: '写回备忘录：计算结果缓存至 memo[i] 后返回',
    },
    keyPoints: {
      title: '记忆化搜索优化',
      summary: '后缀子串 s[i...] 仅有 n+1 个不同状态。通过 memo 数组记忆化，将时间复杂度从 O(2ⁿ) 骤降为 O(n)。',
      steps: [
        { label: '备忘录数组', desc: 'memo[i] 存储后缀子串 s[i...] 的解码方案数，初始全为 -1。', icon: '📝' },
        { label: 'O(1) 剪枝', desc: '若 memo[i] != -1 直接返回，消除重复子树遍历。', icon: '✂️' },
        { label: '后序写回', desc: '计算完毕后赋值 memo[i] = ans 并返回。', icon: '💾' },
      ],
    },
  },
  'tabulation-bottomup': {
    languages: {
      java: DP_JAVA_CODE,
      python: [
        'def numDecodings(s: str) -> int:',
        '    n = len(s)',
        '    dp = [0] * (n + 1)',
        '    dp[n] = 1  # 边界：空串一种方案',
        '    for i in range(n - 1, -1, -1):',
        '        if s[i] == "0":',
        '            dp[i] = 0  # "0" 不能单独翻译',
        '        else:',
        '            dp[i] = dp[i + 1]  # 取 1 位',
        '            if i + 1 < n and int(s[i:i+2]) <= 26:',
        '                dp[i] += dp[i + 2]  # 取 2 位',
        '    return dp[0]',
      ],
      cpp: [
        'int numDecodings(string s) {',
        '    int n = s.size();',
        '    vector<int> dp(n + 1, 0);',
        '    dp[n] = 1; // 边界：空串一种方案',
        '    for (int i = n - 1; i >= 0; i--) {',
        '        if (s[i] == \'0\') {',
        '            dp[i] = 0; // \'0\' 不能单独翻译',
        '        } else {',
        '            dp[i] = dp[i + 1]; // 取 1 位',
        '            if (i + 1 < n && (s[i] - \'0\') * 10 + (s[i + 1] - \'0\') <= 26) {',
        '                dp[i] += dp[i + 2]; // 取 2 位',
        '            }',
        '        }',
        '    }',
        '    return dp[0];',
        '}',
      ],
      javascript: [
        'function numDecodings(s) {',
        '    const n = s.length;',
        '    const dp = new Array(n + 1).fill(0);',
        '    dp[n] = 1; // 边界：空串一种方案',
        '    for (let i = n - 1; i >= 0; i--) {',
        '        if (s[i] === "0") {',
        '            dp[i] = 0; // "0" 不能单独翻译',
        '        } else {',
        '            dp[i] = dp[i + 1]; // 取 1 位',
        '            if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) {',
        '                dp[i] += dp[i + 2]; // 取 2 位',
        '            }',
        '        }',
        '    }',
        '    return dp[0];',
        '}',
      ],
    },
    lineExplanations: {
      4: '边界初始化：dp[n] = 1，对应递归 base case 当串完全切完时计 1 种方案',
      5: '从右向左逆推填表：依次计算 dp[n-1] 到 dp[0]',
      6: 's[i] == "0" 特判：前导 0 无法解码，dp[i] = 0',
      9: '状态转移 1：单独翻译 1 位字符，继承 dp[i+1]',
      11: '状态转移 2：两位组合 <= 26 时，累加 dp[i+2]',
      14: '返回 dp[0]：即原字符串从下标 0 开始的最终有效方案数',
    },
    keyPoints: {
      title: '自底向上递推填表',
      summary: '从边界 dp[n] = 1 开始，逆向填表至 dp[0]，彻底消除递归栈空间。',
      steps: [
        { label: '状态定义', desc: 'dp[i] 表示后缀子串 s[i...] 的有效解码方案总数。', icon: '🎯' },
        { label: '边界设置', desc: 'dp[n] = 1，充当递推起点与切完串的判定基底。', icon: '🎬' },
        { label: '转移方程', desc: 'dp[i] = (s[i]!="0" ? dp[i+1] : 0) + (two<=26 ? dp[i+2] : 0)。', icon: '🔄' },
      ],
    },
  },
  'space-optimized': {
    languages: {
      java: [
        'public static int numDecodings(String s) {',
        '    int n = s.length();',
        '    int next1 = 1, next2 = 0; // 对应 dp[i+1], dp[i+2]',
        '    for (int i = n - 1; i >= 0; i--) {',
        '        int curr = 0;',
        '        if (s.charAt(i) != \'0\') {',
        '            curr += next1;',
        '            if (i + 1 < n && (s.charAt(i) - \'0\') * 10 + (s.charAt(i + 1) - \'0\') <= 26) {',
        '                curr += next2;',
        '            }',
        '        }',
        '        next2 = next1; // 窗口前移',
        '        next1 = curr;',
        '    }',
        '    return next1;',
        '}',
      ],
      python: [
        'def numDecodings(s: str) -> int:',
        '    n = len(s)',
        '    next1, next2 = 1, 0  # 对应 dp[i+1], dp[i+2]',
        '    for i in range(n - 1, -1, -1):',
        '        curr = 0',
        '        if s[i] != "0":',
        '            curr += next1',
        '            if i + 1 < n and int(s[i:i+2]) <= 26:',
        '                curr += next2',
        '        next2, next1 = next1, curr  # 滚动更新',
        '    return next1',
      ],
      cpp: [
        'int numDecodings(string s) {',
        '    int n = s.size();',
        '    int next1 = 1, next2 = 0; // 对应 dp[i+1], dp[i+2]',
        '    for (int i = n - 1; i >= 0; i--) {',
        '        int curr = 0;',
        '        if (s[i] != \'0\') {',
        '            curr += next1;',
        '            if (i + 1 < n && (s[i] - \'0\') * 10 + (s[i + 1] - \'0\') <= 26) {',
        '                curr += next2;',
        '            }',
        '        }',
        '        next2 = next1; // 滚动更新',
        '        next1 = curr;',
        '    }',
        '    return next1;',
        '}',
      ],
      javascript: [
        'function numDecodings(s) {',
        '    const n = s.length;',
        '    let next1 = 1, next2 = 0; // 对应 dp[i+1], dp[i+2]',
        '    for (let i = n - 1; i >= 0; i--) {',
        '        let curr = 0;',
        '        if (s[i] !== "0") {',
        '            curr += next1;',
        '            if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) {',
        '                curr += next2;',
        '            }',
        '        }',
        '        next2 = next1; // 滚动更新',
        '        next1 = curr;',
        '    }',
        '    return next1;',
        '}',
      ],
    },
    lineExplanations: {
      3: '初始化两个滚动变量：next1 = 1 (相当于 dp[n])，next2 = 0 (相当于 dp[n+1])',
      4: '自底向上逆向遍历：i 从 n-1 递减到 0',
      7: '状态累加：若当前字符非 0，curr 累加 next1',
      9: '两位数合法时：curr 累加 next2',
      12: '滑动窗口向前滚动：next2 = next1; next1 = curr;',
      15: '最终答案：循环结束时 next1 即为原问题 dp[0] 的解，空间复杂度达到 O(1)',
    },
    keyPoints: {
      title: 'O(1) 空间滚动压缩',
      summary: 'dp[i] 计算仅需访问 dp[i+1] 和 dp[i+2]。通过 next1, next2 两个滚动变量滑动更新，将空间复杂度彻底压缩至 O(1)。',
      steps: [
        { label: '依赖局部性', desc: '当前状态仅由后两项决定，更远的历史状态无需保留。', icon: '🔍' },
        { label: '双变量维护', desc: 'next1 维护 dp[i+1]，next2 维护 dp[i+2]。', icon: '📦' },
        { label: '常数级空间', desc: '变量向前滑动替代数组申请，空间复杂度降至 O(1)。', icon: '⚡' },
      ],
    },
  },
};

/* ───────────────────────── 递归模式与树节点 ───────────────────────── */

export interface DecodeTreeNode {
  id: number;
  parentId: number | null;
  i: number;
  depth: number;
  value: number | null;
  isRepeated: boolean;
  isCached?: boolean;
  x: number;
  y: number;
}

export type DecodeRecEventType =
  | 'init'
  | 'call'
  | 'base-case'
  | 'dead-zero'
  | 'branch-1'
  | 'branch-2'
  | 'cache-hit'
  | 'return'
  | 'done';

export interface TwoDigitCheck {
  digits: string;
  value: number;
  ok: boolean;
  reason?: string;
}

export interface DecodeRecStep extends StepBase {
  type: DecodeRecEventType;
  nodeId: number;
  i: number;
  depth: number;
  newNode?: DecodeTreeNode;
  edge?: { fromId: number | null; label: string; dead: boolean };
  returnValue?: number;
  twoDigit?: TwoDigitCheck;
  visibleCount: number;
  stats: { calls: number; repeats: number; twoDigitHits: number; hits?: number };
  answer?: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

export interface RecursiveResult {
  steps: DecodeRecStep[];
  nodes: DecodeTreeNode[];
  answer: number;
}

/* ───────────────────────── DP 模式 ───────────────────────── */

export interface DecodeBranchInfo {
  key: 'one' | 'two';
  title: string;
  ok: boolean;
  reason?: string;
  depIdx?: number;
  depValue?: number;
  formula?: string;
}

export interface DecodeDpStep extends StepBase {
  type: 'init' | 'loop-head' | 'compute' | 'zero' | 'done';
  i: number;
  dp: number[];
  deps?: number[];
  formula?: string;
  formulaSubstituted?: string;
  branch1?: DecodeBranchInfo;
  branch2?: DecodeBranchInfo;
  filledCount: number;
  answer?: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

/* ───────────────────────── 空间优化模式 ───────────────────────── */

export interface DecodeSpaceOptimizedStep extends StepBase {
  evolutionMode: 'space-optimized';
  type: 'init' | 'init-vars' | 'loop-head' | 'compute' | 'slide' | 'done';
  i: number;
  char?: string;
  rollingVars: { next2: number; next1: number; curr: number };
  branch1?: DecodeBranchInfo;
  branch2?: DecodeBranchInfo;
  formula?: string;
  formulaSubstituted?: string;
  answer?: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

/* ───────────────────────── 统一多阶段步进联合体 ───────────────────────── */

export type DecodeEvolutionStep =
  | (DecodeRecStep & { evolutionMode: 'naive-recursive' | 'memo-topdown'; memoArr?: number[] })
  | (DecodeDpStep & { evolutionMode: 'tabulation-bottomup' })
  | DecodeSpaceOptimizedStep;

/* ───────────────────────── 树形布局算法 ───────────────────────── */

const NODE_GAP = 78;
const LEVEL_HEIGHT = 92;
const MARGIN_X = 60;
const MARGIN_Y = 56;

interface LayoutNode {
  id: number;
  parentId: number | null;
  i: number;
  depth: number;
  value: number | null;
  isRepeated: boolean;
  isCached?: boolean;
}

function layoutTree(nodes: LayoutNode[]): DecodeTreeNode[] {
  const childrenOf = new Map<number, number[]>();
  nodes.forEach((n) => {
    if (n.parentId !== null) {
      const arr = childrenOf.get(n.parentId) ?? [];
      arr.push(n.id);
      childrenOf.set(n.parentId, arr);
    }
  });

  let leafIndex = 0;
  const xOf = new Map<number, number>();

  const visit = (id: number): number => {
    const kids = childrenOf.get(id) ?? [];
    let x: number;
    if (kids.length === 0) {
      x = MARGIN_X + leafIndex * NODE_GAP;
      leafIndex++;
    } else {
      const kidXs = kids.map(visit);
      x = (kidXs[0] + kidXs[kidXs.length - 1]) / 2;
    }
    xOf.set(id, x);
    return x;
  };
  if (nodes.length > 0) visit(nodes[0].id);

  return nodes.map((n) => ({
    ...n,
    x: xOf.get(n.id) ?? MARGIN_X,
    y: MARGIN_Y + n.depth * LEVEL_HEIGHT,
  }));
}

/* ───────────────────── 阶段 1：朴素递归步进生成器 ───────────────────── */

export function buildRecursiveSteps(input: string): RecursiveResult {
  const s = input.split('');
  const n = s.length;
  const steps: DecodeRecStep[] = [];
  const rawNodes: LayoutNode[] = [];
  const seenParams = new Set<number>();
  let nodeSeq = 0;
  let visibleCount = 0;
  const stats = { calls: 0, repeats: 0, twoDigitHits: 0 };

  const push = (step: Omit<DecodeRecStep, 'stats' | 'visibleCount'>): void => {
    steps.push({ ...step, stats: { ...stats }, visibleCount });
  };

  // Step 0: 函数入口帧
  push({
    type: 'init',
    nodeId: 0,
    i: 0,
    depth: 0,
    message: `📥 函数入口：数字串 "${input}"，从 f1(s, i=0) 开始自顶向下尝试解码。`,
    log: `init s="${input}", start f1(0)`,
    codeLine: 3,
  });

  const twoDigitCheck = (i: number): TwoDigitCheck | null => {
    if (i + 1 >= n) return { digits: '', value: -1, ok: false, reason: '越界' };
    const digits = input.slice(i, i + 2);
    const value = (s[i].charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48);
    return { digits, value, ok: value >= 10 && value <= 26, reason: value > 26 ? '>26' : undefined };
  };

  function rec(i: number, parentId: number | null, depth: number, edgeLabel: string): number {
    stats.calls++;
    const isRepeated = seenParams.has(i);
    if (isRepeated) stats.repeats++;
    seenParams.add(i);

    const id = nodeSeq++;
    rawNodes.push({ id, parentId, i, depth, value: null, isRepeated });
    visibleCount++;
    push({
      type: 'call',
      nodeId: id,
      i,
      depth,
      newNode: { id, parentId, i, depth, value: null, isRepeated, x: 0, y: 0 },
      edge: parentId !== null ? { fromId: parentId, label: edgeLabel, dead: false } : undefined,
      message: isRepeated
        ? `f(${i}) 展开过，本次是重复子问题，仍需完整重算（暴力递归指数级开销）。`
        : `调用 f(${i})：后缀 "${input.slice(i)}" 有多少种翻译方案？`,
      log: `call f(${i})${isRepeated ? ' [重复子问题]' : ''}`,
      codeLine: 3,
    });

    // base case：i == n
    if (i === n) {
      rawNodes[id].value = 1;
      push({
        type: 'base-case',
        nodeId: id,
        i,
        depth,
        returnValue: 1,
        message: `i == ${n} 到达串尾，整个串成功切完，返回 1（一种方案）。`,
        log: `base-case f(${n}) = 1`,
        codeLine: [4, 5],
      });
      return 1;
    }

    // s[i] == '0'：死分支
    if (s[i] === '0') {
      rawNodes[id].value = 0;
      push({
        type: 'dead-zero',
        nodeId: id,
        i,
        depth,
        returnValue: 0,
        message: `s[${i}] == '0'，0 无法单独翻译也无法组两位，返回 0（死路）。`,
        log: `dead-zero f(${i}) = 0`,
        codeLine: [8, 9],
      });
      return 0;
    }

    // 取 1 位 -> f(i+1)
    push({
      type: 'branch-1',
      nodeId: id,
      i,
      depth,
      message: `取 1 位 s[${i}]='${s[i]}'（${digitToLetter(s[i])}），递归 f(${i + 1})。`,
      log: `branch-1 f(${i}): take '${s[i]}' -> f(${i + 1})`,
      codeLine: 11,
    });
    let ans = rec(i + 1, id, depth + 1, `1位 ${s[i]}`);

    // 取 2 位判定
    const check = twoDigitCheck(i);
    if (check) {
      if (check.ok) {
        stats.twoDigitHits++;
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          message: `取 2 位 "${check.digits}" = ${check.value} ≤ 26 ✓（${twoDigitToLetters(input, i)}），再递归 f(${i + 2})。`,
          log: `branch-2 f(${i}): take "${check.digits}"=${check.value} ✓ -> f(${i + 2})`,
          codeLine: [12, 13],
        });
        ans += rec(i + 2, id, depth + 1, `2位 ${check.digits}✓`);
      } else {
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          edge: { fromId: id, label: `2位 ${check.digits || '—'}✗ ${check.reason}`, dead: true },
          message:
            check.reason === '越界'
              ? `取 2 位越界：i+1 = ${i + 1} 已超出串长 ${n}，剪枝。`
              : `取 2 位 "${check.digits}" = ${check.value} > 26，无法翻译，剪枝。`,
          log: `branch-2 f(${i}): take "${check.digits || '—'}" ✗ ${check.reason}`,
          codeLine: 12,
        });
      }
    }

    // 回溯回填
    rawNodes[id].value = ans;
    push({
      type: 'return',
      nodeId: id,
      i,
      depth,
      returnValue: ans,
      message: `f(${i}) 回溯：${i === 0 ? `根调用完成，` : ''}返回汇总答案 ${ans}。`,
      log: `return f(${i}) = ${ans}`,
      codeLine: 16,
    });
    return ans;
  }

  const answer = rec(0, null, 0, '');

  const nodes = layoutTree(rawNodes);
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));
  steps.forEach((st) => {
    if (st.newNode) {
      const laid = byId.get(st.newNode.id);
      if (laid) st.newNode = { ...laid };
    }
  });

  push({
    type: 'done',
    nodeId: -1,
    i: 0,
    depth: 0,
    returnValue: answer,
    answer,
    message: `✅ 朴素递归完成："${input}" 共有 ${answer} 种翻译方案，总调用 ${stats.calls} 次（重复 ${stats.repeats} 次）。`,
    log: `done: answer = ${answer}`,
    codeLine: 16,
  });

  return { steps, nodes, answer };
}

/* ───────────────────── 阶段 2：记忆化搜索步进生成器 ───────────────────── */

export function buildMemoSteps(input: string): { steps: DecodeRecStep[]; nodes: DecodeTreeNode[]; answer: number; memo: number[] } {
  const s = input.split('');
  const n = s.length;
  const memo = new Array<number>(n + 1).fill(-1);
  const steps: DecodeRecStep[] = [];
  const rawNodes: LayoutNode[] = [];
  let nodeSeq = 0;
  let visibleCount = 0;
  const stats = { calls: 0, repeats: 0, twoDigitHits: 0, hits: 0 };

  const push = (step: Omit<DecodeRecStep, 'stats' | 'visibleCount'>): void => {
    steps.push({ ...step, stats: { ...stats }, visibleCount });
  };

  push({
    type: 'init',
    nodeId: 0,
    i: 0,
    depth: 0,
    message: `📥 函数入口：初始化一维备忘录 memo[${n + 1}] 为 -1，开始自顶向下记忆化搜索。`,
    log: `init memo[${n + 1}] = -1, start f2(0)`,
    codeLine: 7,
  });

  const twoDigitCheck = (i: number): TwoDigitCheck | null => {
    if (i + 1 >= n) return { digits: '', value: -1, ok: false, reason: '越界' };
    const digits = input.slice(i, i + 2);
    const value = (s[i].charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48);
    return { digits, value, ok: value >= 10 && value <= 26, reason: value > 26 ? '>26' : undefined };
  };

  function rec(i: number, parentId: number | null, depth: number, edgeLabel: string): number {
    stats.calls++;
    const isCached = memo[i] !== -1;
    const id = nodeSeq++;
    rawNodes.push({ id, parentId, i, depth, value: isCached ? memo[i] : null, isRepeated: isCached, isCached });
    visibleCount++;

    if (isCached) {
      stats.hits++;
      stats.repeats++;
      push({
        type: 'cache-hit',
        nodeId: id,
        i,
        depth,
        newNode: { id, parentId, i, depth, value: memo[i], isRepeated: true, isCached: true, x: 0, y: 0 },
        edge: parentId !== null ? { fromId: parentId, label: edgeLabel, dead: false } : undefined,
        returnValue: memo[i],
        message: `🎯 备忘录命中：memo[${i}] = ${memo[i]}，直接 O(1) 返回结果，整棵子树立即剪枝！`,
        log: `memo hit memo[${i}] = ${memo[i]}`,
        codeLine: 10,
      });
      return memo[i];
    }

    push({
      type: 'call',
      nodeId: id,
      i,
      depth,
      newNode: { id, parentId, i, depth, value: null, isRepeated: false, x: 0, y: 0 },
      edge: parentId !== null ? { fromId: parentId, label: edgeLabel, dead: false } : undefined,
      message: `未命中备忘录，开始计算 f2(${i})：计算后缀 "${input.slice(i)}" 的方案数。`,
      log: `call f2(${i}) [未命中]`,
      codeLine: 7,
    });

    if (i === n) {
      memo[n] = 1;
      rawNodes[id].value = 1;
      push({
        type: 'base-case',
        nodeId: id,
        i,
        depth,
        returnValue: 1,
        message: `i == ${n} 串切完，返回 1 并缓存 memo[${n}] = 1。`,
        log: `base-case f2(${n}) = 1`,
        codeLine: 8,
      });
      return 1;
    }

    if (s[i] === '0') {
      memo[i] = 0;
      rawNodes[id].value = 0;
      push({
        type: 'dead-zero',
        nodeId: id,
        i,
        depth,
        returnValue: 0,
        message: `s[${i}] == '0'，死路，返回 0 并缓存 memo[${i}] = 0。`,
        log: `dead-zero f2(${i}) = 0`,
        codeLine: 9,
      });
      return 0;
    }

    push({
      type: 'branch-1',
      nodeId: id,
      i,
      depth,
      message: `取 1 位 s[${i}]='${s[i]}'，递归求解 f2(${i + 1}, memo)。`,
      log: `branch-1 f2(${i}) -> f2(${i + 1})`,
      codeLine: 11,
    });
    let ans = rec(i + 1, id, depth + 1, `1位 ${s[i]}`);

    const check = twoDigitCheck(i);
    if (check) {
      if (check.ok) {
        stats.twoDigitHits++;
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          message: `取 2 位 "${check.digits}" ≤ 26 ✓，递归求解 f2(${i + 2}, memo)。`,
          log: `branch-2 f2(${i}) -> f2(${i + 2})`,
          codeLine: [12, 13],
        });
        ans += rec(i + 2, id, depth + 1, `2位 ${check.digits}✓`);
      } else {
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          edge: { fromId: id, label: `2位 ✗ ${check.reason}`, dead: true },
          message: `取 2 位无效（${check.reason}），剪枝。`,
          log: `branch-2 ✗ ${check.reason}`,
          codeLine: 12,
        });
      }
    }

    memo[i] = ans;
    rawNodes[id].value = ans;
    push({
      type: 'return',
      nodeId: id,
      i,
      depth,
      returnValue: ans,
      message: `f2(${i}) 计算完毕：写入 memo[${i}] = ${ans}，返回 ${ans}。`,
      log: `memo[${i}] = ${ans}, return`,
      codeLine: 15,
    });
    return ans;
  }

  const answer = rec(0, null, 0, '');

  const nodes = layoutTree(rawNodes);
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));
  steps.forEach((st) => {
    if (st.newNode) {
      const laid = byId.get(st.newNode.id);
      if (laid) st.newNode = { ...laid };
    }
  });

  push({
    type: 'done',
    nodeId: -1,
    i: 0,
    depth: 0,
    returnValue: answer,
    answer,
    message: `✅ 记忆化搜索完成：结果为 ${answer}，命中备忘录 ${stats.hits} 次，将指数级复杂度压缩至 O(n)！`,
    log: `done: answer = ${answer}`,
    codeLine: 15,
  });

  return { steps, nodes, answer, memo };
}

/* ───────────────────── 阶段 3：递推填表步进生成器 ───────────────────── */

export function buildDpSteps(input: string): { steps: DecodeDpStep[]; answer: number } {
  const s = input.split('');
  const n = s.length;
  const dp = new Array<number>(n + 1).fill(0);
  const steps: DecodeDpStep[] = [];

  dp[n] = 1;

  // Step 0: 边界初始化
  steps.push({
    type: 'init',
    i: n,
    dp: [...dp],
    filledCount: 1,
    message: `🎬 边界初始化：dp[${n}] = 1（空串有一种方案），从右向左逆推填表。`,
    log: `init dp[${n}] = 1`,
    codeLine: 4,
  });

  for (let i = n - 1; i >= 0; i--) {
    // 循环头判断帧
    steps.push({
      type: 'loop-head',
      i,
      dp: [...dp],
      filledCount: n - i,
      formula: `for (int i = ${i}; i >= 0; i--)`,
      message: `🔄 循环头：i = ${i}，满足 i >= 0，进入第 ${n - i} 轮迭代。`,
      log: `for i=${i} (>= 0) -> true`,
      codeLine: 5,
    });

    const ch = s[i];
    if (ch === '0') {
      dp[i] = 0;
      steps.push({
        type: 'zero',
        i,
        dp: [...dp],
        filledCount: n - i + 1,
        formula: `dp[${i}] = 0`,
        formulaSubstituted: `s[${i}] = '0' → dp[${i}] = 0`,
        branch1: { key: 'one', title: `取 1 位 s[${i}]='0'`, ok: false, reason: "s[i]=='0'" },
        branch2: { key: 'two', title: `取 2 位 s[${i}..]`, ok: false, reason: "s[i]=='0'" },
        message: `s[${i}] = '0'：本位不可单独翻译，dp[${i}] = 0。`,
        log: `dp[${i}] = 0 ('0' 特判)`,
        codeLine: [6, 7],
      });
      continue;
    }

    const take1 = dp[i + 1];
    const twoDigits = i + 1 < n ? input.slice(i, i + 2) : '';
    const twoVal = i + 1 < n ? (ch.charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48) : -1;
    const twoOk = i + 1 < n && twoVal >= 10 && twoVal <= 26;
    const take2 = twoOk ? dp[i + 2] : 0;

    dp[i] = take1 + take2;
    const deps = twoOk ? [i + 1, i + 2] : [i + 1];
    const formula = twoOk
      ? `dp[${i}] = dp[${i + 1}] + dp[${i + 2}]`
      : `dp[${i}] = dp[${i + 1}]`;
    const formulaSubstituted = twoOk
      ? `dp[${i}] = ${take1} + ${take2} = ${dp[i]}`
      : `dp[${i}] = ${take1}`;

    const branch1: DecodeBranchInfo = {
      key: 'one',
      title: `取 1 位 s[${i}]='${ch}'（${digitToLetter(ch)}）`,
      ok: true,
      depIdx: i + 1,
      depValue: take1,
      formula: `dp[${i + 1}] = ${take1}`,
    };
    const branch2: DecodeBranchInfo = twoOk
      ? {
          key: 'two',
          title: `取 2 位 "${twoDigits}" = ${twoVal} ✓（${twoDigitToLetters(input, i)}）`,
          ok: true,
          depIdx: i + 2,
          depValue: take2,
          formula: `dp[${i + 2}] = ${take2}`,
        }
      : {
          key: 'two',
          title: `取 2 位 ${twoDigits ? `"${twoDigits}" = ${twoVal}` : 's[i..i+1]'}`,
          ok: false,
          reason: i + 1 >= n ? '越界' : '>26',
        };

    steps.push({
      type: 'compute',
      i,
      dp: [...dp],
      deps,
      formula,
      formulaSubstituted,
      branch1,
      branch2,
      filledCount: n - i + 1,
      message: `计算 dp[${i}]：${formulaSubstituted}${twoOk ? '' : `（两位${branch2.reason === '越界' ? '越界' : `"${twoDigits}" > 26`}不可用）`}。`,
      log: `dp[${i}] = ${dp[i]}${twoOk ? ` (= dp[${i + 1}] + dp[${i + 2}])` : ''}`,
      codeLine: twoOk ? [9, 10, 11] : 9,
    });
  }

  const answer = dp[0];
  steps.push({
    type: 'done',
    i: 0,
    dp: [...dp],
    filledCount: n + 1,
    formula: `answer = dp[0]`,
    formulaSubstituted: `answer = dp[0] = ${answer}`,
    answer,
    message: `✅ 填表完成：dp[0] = ${answer}，即 "${input}" 共 ${answer} 种翻译方案。`,
    log: `done: dp[0] = ${answer}`,
    codeLine: 14,
  });

  return { steps, answer };
}

/* ───────────────────── 阶段 4：空间压缩步进生成器 ───────────────────── */

export function buildSpaceOptimizedSteps(input: string): { steps: DecodeSpaceOptimizedStep[]; answer: number } {
  const s = input.split('');
  const n = s.length;
  const steps: DecodeSpaceOptimizedStep[] = [];

  let next1 = 1;
  let next2 = 0;
  let curr = 0;

  // 入口帧
  steps.push({
    evolutionMode: 'space-optimized',
    type: 'init',
    i: n,
    rollingVars: { next2, next1, curr },
    message: `📥 函数入口：numDecodings("${input}")，准备使用 O(1) 双滚动变量逆向计算。`,
    log: `enter numDecodings("${input}")`,
    codeLine: 1,
  });

  // 变量初始化帧
  steps.push({
    evolutionMode: 'space-optimized',
    type: 'init-vars',
    i: n,
    rollingVars: { next2, next1, curr },
    message: `🎬 初始化滚动变量：next1 = 1 (dp[n]), next2 = 0 (dp[n+1])。`,
    log: `init next1=1, next2=0`,
    codeLine: 3,
  });

  for (let i = n - 1; i >= 0; i--) {
    const ch = s[i];

    // 循环头判断
    steps.push({
      evolutionMode: 'space-optimized',
      type: 'loop-head',
      i,
      char: ch,
      rollingVars: { next2, next1, curr },
      formula: `for (int i = ${i}; i >= 0; i--)`,
      message: `🔄 循环头：i = ${i} (字符 '${ch}')，i >= 0 条件成立，进入循环。`,
      log: `for i=${i} -> true`,
      codeLine: 4,
    });

    curr = 0;
    const twoDigits = i + 1 < n ? input.slice(i, i + 2) : '';
    const twoVal = i + 1 < n ? (ch.charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48) : -1;
    const twoOk = i + 1 < n && twoVal >= 10 && twoVal <= 26;

    let branch1: DecodeBranchInfo;
    let branch2: DecodeBranchInfo;

    if (ch === '0') {
      branch1 = { key: 'one', title: `取 1 位 '0'`, ok: false, reason: "s[i]=='0'" };
      branch2 = { key: 'two', title: `取 2 位`, ok: false, reason: "s[i]=='0'" };
      steps.push({
        evolutionMode: 'space-optimized',
        type: 'compute',
        i,
        char: ch,
        rollingVars: { next2, next1, curr: 0 },
        branch1,
        branch2,
        formula: 'curr = 0',
        formulaSubstituted: `s[${i}] = '0' → curr = 0`,
        message: `s[${i}] = '0' 无法解码，curr = 0。`,
        log: `i=${i}: s[i]='0' -> curr = 0`,
        codeLine: 5,
      });
    } else {
      curr += next1;
      branch1 = { key: 'one', title: `取 1 位 '${ch}'`, ok: true, depValue: next1, formula: `+ next1 (${next1})` };
      if (twoOk) {
        curr += next2;
        branch2 = { key: 'two', title: `取 2 位 "${twoDigits}"`, ok: true, depValue: next2, formula: `+ next2 (${next2})` };
      } else {
        branch2 = { key: 'two', title: `取 2 位`, ok: false, reason: i + 1 >= n ? '越界' : '>26' };
      }

      steps.push({
        evolutionMode: 'space-optimized',
        type: 'compute',
        i,
        char: ch,
        rollingVars: { next2, next1, curr },
        branch1,
        branch2,
        formula: twoOk ? 'curr = next1 + next2' : 'curr = next1',
        formulaSubstituted: twoOk ? `curr = ${next1} + ${next2} = ${curr}` : `curr = ${next1}`,
        message: `计算当前项：curr = ${curr}${twoOk ? ` (1位:${next1} + 2位:${next2})` : ` (1位:${next1})`}。`,
        log: `i=${i}: curr = ${curr}`,
        codeLine: twoOk ? [7, 8, 9] : 7,
      });
    }

    // 滑动更新
    next2 = next1;
    next1 = curr;

    steps.push({
      evolutionMode: 'space-optimized',
      type: 'slide',
      i,
      char: ch,
      rollingVars: { next2, next1, curr },
      message: `🔄 窗口滑动更新：next2 移至 ${next2}，next1 移至 ${next1}。`,
      log: `slide: next2=${next2}, next1=${next1}`,
      codeLine: [12, 13],
    });
  }

  const answer = next1;
  steps.push({
    evolutionMode: 'space-optimized',
    type: 'done',
    i: 0,
    rollingVars: { next2, next1, curr },
    answer,
    message: `🎉 空间优化完成！返回 next1 = ${answer}，仅耗费 O(1) 两个常数变量空间！`,
    log: `done: return next1 = ${answer}`,
    codeLine: 15,
  });

  return { steps, answer };
}

/* ───────────────────── 统一多模式分发调度 ───────────────────── */

export function buildEvolutionSteps(
  input: string,
  mode: EvolutionModeId | 'rec' | 'dp'
): { steps: any[]; answer: number; nodes?: DecodeTreeNode[]; memo?: number[] } {
  if (mode === 'memo-topdown') {
    const res = buildMemoSteps(input);
    return {
      steps: res.steps.map((s) => ({ ...s, evolutionMode: 'memo-topdown', memoArr: res.memo })),
      answer: res.answer,
      nodes: res.nodes,
      memo: res.memo,
    };
  }
  if (mode === 'tabulation-bottomup' || mode === 'dp') {
    const res = buildDpSteps(input);
    return {
      steps: res.steps.map((s) => ({ ...s, evolutionMode: 'tabulation-bottomup' })),
      answer: res.answer,
    };
  }
  if (mode === 'space-optimized') {
    const res = buildSpaceOptimizedSteps(input);
    return {
      steps: res.steps,
      answer: res.answer,
    };
  }
  // 默认 naive-recursive / rec
  const res = buildRecursiveSteps(input);
  return {
    steps: res.steps.map((s) => ({ ...s, evolutionMode: 'naive-recursive' })),
    answer: res.answer,
    nodes: res.nodes,
  };
}

/* ───────────────────────── 辅助工具函数 ───────────────────────── */

function digitToLetter(d: string): string {
  const v = d.charCodeAt(0) - 48;
  return v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : '?';
}

function twoDigitToLetters(input: string, i: number): string {
  const v = (input.charCodeAt(i) - 48) * 10 + (input.charCodeAt(i + 1) - 48);
  return v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : '?';
}
