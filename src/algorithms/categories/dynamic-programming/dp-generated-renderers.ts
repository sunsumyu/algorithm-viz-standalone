/**
 * 动态规划专题批量演示注册中心 (DP Generated Renderers)
 * 采用统一 DpStepEngine 声明式 Spec 驱动，全面淘汰单体命令式冗余逻辑。
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import { KeyPointsData, ProblemDetail } from '../../../core/code-panel';
import { DpStepEngine } from './engine/dp-step-engine';
import type { DpTraceStep, AlgorithmSpec } from './engine/types';
import './specs';
import template from './dp-demo.html?raw';
import {
  createDpDemoVisualizer,
  DpDemoStep,
  DpCell,
  DpInputDef,
  parseNums,
  parseWords,
  intInput,
  strInput,
  clone1d,
  clone2d,
  DpTreeNode,
} from './dp-demo-visualizer';

export type DemoBuilder = (root: HTMLElement, mode?: import('../../../core/interfaces').ExecutionStepMode) => DpDemoStep[];

export type DemoDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  title?: string;
  inputs: DpInputDef[];
  examples?: Array<{ label: string; values: Record<string, string> }>;
  metrics?: Array<{ key: string; label: string }>;
  codeLines?: string[];
  codeLanguages?: Record<string, string[]>;
  codePanelTitle?: string;
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  keyPoints?: KeyPointsData | string;
  problemDetail?: ProblemDetail;
  faqList?: Array<{ question: string; answer: string; tag?: string }>;
  build: DemoBuilder;
  /** 难度：1=🟢入门 2=🟡进阶 3=🔴挑战 */
  difficulty?: 1 | 2 | 3;
  /** 同分类内的关卡顺序 */
  levelOrder?: number;
  /** 本关的学习目标（一句话） */
  learningGoal?: string;
};

export type ArticleDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Array<[string, string]>;
  /** 难度：1=🟢入门 2=🟡进阶 3=🔴挑战 */
  difficulty?: 1 | 2 | 3;
  /** 同分类内的关卡顺序 */
  levelOrder?: number;
  /** 本关的学习目标（一句话） */
  learningGoal?: string;
};

// ---------------------------------------------------------------------------
// 步骤转换器与通用建造工厂 (Engine Step Converter & Builder Factory)
// ---------------------------------------------------------------------------

export function convertTraceStep(rs: DpTraceStep): DpDemoStep {
  const varsMap = rs.vars ? Object.fromEntries(rs.vars.map((v) => [v.name, v.value])) : {};
  
  // 提取末尾答案指标
  let ansVal: any = undefined;
  if (rs.dp2d && rs.dp2d.length > 0) {
    const lastRow = rs.dp2d[rs.dp2d.length - 1];
    ansVal = lastRow[lastRow.length - 1];
  } else if (rs.dp1d && rs.dp1d.length > 0) {
    ansVal = rs.dp1d[rs.dp1d.length - 1];
  }

  return {
    message: rs.message,
    log: rs.log || '',
    vars: rs.vars,
    codeLine: rs.codeLine,
    dp1d: rs.dp1d,
    dp2d: rs.dp2d,
    tree: rs.tree ?? null,
    source: rs.source,
    target: rs.target,
    current: rs.current
      ? {
          i: rs.current.row ?? rs.current.index,
          j: rs.current.col,
          index: rs.current.index,
        }
      : undefined,
    dependencies: rs.dependencies?.map((d) => ({
      i: d.row ?? d.index,
      j: d.col,
      index: d.index,
    })),
    formula: rs.formula,
    formulaSubstituted: rs.formulaSubstituted,
    actionMeta: rs.actionMeta,
    storyMeta: rs.storyMeta,
    backtrackPath: rs.backtrackPath,
    thematicMeta: rs.thematicMeta,
    staircase: rs.staircase as any,
    metrics: {
      ...varsMap,
      answer: ansVal,
      status: '已完成',
      ...(rs.metrics || {}),
    },
  };
}

export function makeEngineBuilder(specId: string): DemoBuilder {
  return (rootOrParams: any, mode?: any): DpDemoStep[] => {
    let root: any = null;
    let inputObj: any = {};

    if (rootOrParams && typeof rootOrParams.querySelector === 'function') {
      root = rootOrParams;
    } else if (rootOrParams?.root && typeof rootOrParams.root.querySelector === 'function') {
      root = rootOrParams.root;
      inputObj = { ...rootOrParams };
      delete inputObj.root;
    } else if (rootOrParams && typeof rootOrParams === 'object') {
      inputObj = { ...rootOrParams };
    }

    const numsInput = root?.querySelector('#dp-input-nums') as HTMLInputElement | null;
    const pricesInput = root?.querySelector('#dp-input-prices') as HTMLInputElement | null;
    const weightsInput = root?.querySelector('#dp-input-weights') as HTMLInputElement | null;
    const valuesInput = root?.querySelector('#dp-input-values') as HTMLInputElement | null;
    const coinsInput = root?.querySelector('#dp-input-coins') as HTMLInputElement | null;
    const sInput = root?.querySelector('#dp-input-s') as HTMLInputElement | null;
    const tInput = root?.querySelector('#dp-input-t') as HTMLInputElement | null;
    const mInput = root?.querySelector('#dp-input-m') as HTMLInputElement | null;
    const nInput = root?.querySelector('#dp-input-n') as HTMLInputElement | null;
    const targetInput = root?.querySelector('#dp-input-target') as HTMLInputElement | null;
    const amountInput = root?.querySelector('#dp-input-amount') as HTMLInputElement | null;
    const bagInput = root?.querySelector('#dp-input-bag') as HTMLInputElement | null;
    const kInput = root?.querySelector('#dp-input-k') as HTMLInputElement | null;
    const feeInput = root?.querySelector('#dp-input-fee') as HTMLInputElement | null;
    const wordDictInput = root?.querySelector('#dp-input-wordDict') as HTMLInputElement | null;
    const directionInput = root?.querySelector('#dp-input-direction') as HTMLSelectElement | HTMLInputElement | null;

    if (numsInput) inputObj.nums = parseNums(numsInput.value, [1, 2, 3]);
    if (pricesInput) inputObj.prices = parseNums(pricesInput.value, [7, 1, 5, 3, 6, 4]);
    if (weightsInput) inputObj.weights = parseNums(weightsInput.value, [1, 3, 4]);
    if (valuesInput) inputObj.values = parseNums(valuesInput.value, [15, 20, 30]);
    if (coinsInput) inputObj.coins = parseNums(coinsInput.value, [1, 2, 5]);
    if (sInput) inputObj.s = sInput.value.trim();
    if (tInput) inputObj.t = tInput.value.trim();
    if (mInput) inputObj.m = parseInt(mInput.value, 10) || 3;
    if (nInput) inputObj.n = parseInt(nInput.value, 10) || (specId === 'unique-bst' ? 4 : 6);
    if (targetInput) inputObj.target = parseInt(targetInput.value, 10) || 4;
    if (amountInput) inputObj.amount = parseInt(amountInput.value, 10) || 5;
    if (bagInput) inputObj.bag = parseInt(bagInput.value, 10) || 4;
    if (kInput) inputObj.k = parseInt(kInput.value, 10) || 2;
    if (feeInput) inputObj.fee = parseInt(feeInput.value, 10) || 2;
    if (wordDictInput) inputObj.wordDict = parseWords(wordDictInput.value, ['leet', 'code']);
    if (directionInput) inputObj.direction = directionInput.value;

    // 特殊网格默认障碍处理
    if (specId === 'unique-paths-ii' && !inputObj.grid) {
      const m = inputObj.m || 3;
      const n = inputObj.n || 4;
      inputObj.grid = Array.from({ length: m }, (_, r) =>
        Array.from({ length: n }, (_, c) =>
          (r === 1 && c === 1) || (r === m - 1 && c === Math.max(0, n - 2)) ? 1 : 0
        )
      );
    }

    const rawSteps = DpStepEngine.generateSteps(specId, inputObj, mode);
    return rawSteps.map(convertTraceStep);
  };
}

// ---------------------------------------------------------------------------
// 门面兼容导出 (Facade Exports for Backwards Compatibility & Tests)
// ---------------------------------------------------------------------------

export function linearSteps(root: HTMLElement, kind: string): DpDemoStep[] {
  return makeEngineBuilder(kind)(root);
}

export function arrayLinearSteps(root: HTMLElement, kind: string): DpDemoStep[] {
  return makeEngineBuilder(kind)(root);
}

export function gridSteps(root: HTMLElement, obstacle: boolean): DpDemoStep[] {
  return makeEngineBuilder(obstacle ? 'unique-paths-ii' : 'unique-paths')(root);
}

export function knapsackSteps(root: HTMLElement, kind: string, mode?: any): DpDemoStep[] {
  return makeEngineBuilder(kind)(root, mode);
}

export function stringDpSteps(root: HTMLElement, kind: string, mode?: any): DpDemoStep[] {
  return makeEngineBuilder(kind)(root, mode);
}

export function stockSteps(root: HTMLElement, kind: string, mode?: any): DpDemoStep[] {
  return makeEngineBuilder(kind)(root, mode);
}

export function robTreeSteps(root: HTMLElement): DpDemoStep[] {
  return makeEngineBuilder('house-robber-iii')(root);
}

export const LINEAR_DP_CODES: Record<string, any> = new Proxy({}, {
  get: (_, prop: string) => {
    const spec = DpStepEngine.get(prop);
    return {
      lines: spec?.code?.languages?.javascript || [],
      lineExplanations: spec?.code?.lineExplanations?.javascript || {},
      keyPoints: spec?.code?.keyPoints,
    };
  },
});

export const STRING_DP_CODES: Record<string, any> = LINEAR_DP_CODES;
export const STOCK_DP_CODES: Record<string, any> = LINEAR_DP_CODES;

// ---------------------------------------------------------------------------
// 注册与装配逻辑 (Algorithm Registration & Facades)
// ---------------------------------------------------------------------------

function registerDemo(def: DemoDef): void {
  const spec = DpStepEngine.get(def.id);

  const finalCodeLanguages = spec?.code?.languages ?? def.codeLanguages;
  const finalCodeLines = spec?.code?.languages?.javascript ?? def.codeLines ?? [];
  const finalLineExplanations = spec?.code?.lineExplanations ?? def.lineExplanations;
  const finalKeyPoints = spec?.code?.keyPoints ?? def.keyPoints;
  const finalProblemDetail = spec?.problem ?? def.problemDetail;

  registerAlgorithm({
    id: def.id,
    name: def.name,
    viewId: def.id,
    category: 'dynamic-programming',
    description: def.description,
    icon: def.icon,
    difficulty: def.difficulty ?? 1,
    levelOrder: def.levelOrder ?? 1,
    learningGoal: def.learningGoal,
    template,
    Visualizer: createDpDemoVisualizer({
      title: def.title || def.name,
      description: def.description,
      inputs: def.inputs,
      examples: def.examples,
      metrics: def.metrics || [
        { key: 'i', label: '当前 i' },
        { key: 'j', label: '当前 j' },
        { key: 'answer', label: '当前最优答案' },
        { key: 'status', label: '计算状态' },
      ],
      codeLines: finalCodeLines,
      codeLanguages: finalCodeLanguages,
      codePanelTitle: def.codePanelTitle || `${def.name} 解题代码`,
      lineExplanations: finalLineExplanations,
      keyPoints: finalKeyPoints,
      problemDetail: finalProblemDetail,
      faqList: def.faqList,
      parseParams: (root: HTMLElement) => root,
      buildSteps: (root: HTMLElement, mode?: any) => def.build(root, mode),
    }),
  });
}

function articleTemplate(name: string, desc: string, sections: Array<[string, string]>): string {
  const body = sections
    .map(
      ([title, html]) =>
        `<div class="article-section"><h3>${title}</h3><div class="article-body">${html}</div></div>`
    )
    .join('');
  return `<div class="article-viewer"><div class="article-header"><h2>${name}</h2><p class="article-desc">${desc}</p></div>${body}</div>`;
}

function registerArticle(def: ArticleDef): void {
  registerAlgorithm({
    id: def.id,
    name: def.name,
    viewId: def.id,
    category: 'dynamic-programming',
    description: def.description,
    icon: def.icon,
    difficulty: def.difficulty ?? 1,
    levelOrder: def.levelOrder ?? 1,
    learningGoal: def.learningGoal,
    template: articleTemplate(def.name, def.description, def.sections),
    Visualizer: ArticleVisualizer,
  });
}

// ---------------------------------------------------------------------------
// 题型参数与配置定义生成助手 (Definition Helpers)
// ---------------------------------------------------------------------------

function oneDDef(id: string, name: string, description: string, icon: string, kind: string, val = '6', metrics?: Array<{ key: string; label: string }>): DemoDef {
  return {
    id, name, description, icon,
    inputs: [{ id: 'n', label: 'n', value: val, width: 90 }],
    examples: [{ label: 'n=4', values: { n: '4' } }, { label: 'n=6', values: { n: '6' } }, { label: 'n=8', values: { n: '8' } }],
    metrics,
    build: makeEngineBuilder(kind),
  };
}

function numsDef(id: string, name: string, description: string, icon: string, kind: string, val = '1,2,3', metrics?: Array<{ key: string; label: string }>): DemoDef {
  return {
    id, name, description, icon,
    inputs: [{ id: 'nums', label: 'nums', value: val, width: 150 }],
    examples: [{ label: '示例1', values: { nums: val } }, { label: '示例2', values: { nums: '1,100,1,1,1,100,1,1,100,1' } }],
    metrics,
    build: makeEngineBuilder(kind),
  };
}

function gridDef(id: string, name: string, description: string, icon: string, obstacle = false): DemoDef {
  const inputs: DpInputDef[] = [
    { id: 'm', label: '行 m', value: '3', width: 80 },
    { id: 'n', label: '列 n', value: '4', width: 80 },
  ];
  if (id === 'unique-paths') {
    inputs.push({
      id: 'direction',
      label: '推导方向',
      value: 'backward',
      type: 'select',
      options: [
        { value: 'backward', label: '倒序推导 (终点 (m-1,n-1) ➔ 起点 (0,0))' },
        { value: 'forward', label: '正向探索 (起点 (0,0) ➔ 终点 (m-1,n-1))' },
      ],
      width: 255,
    });
  }
  return {
    id, name, description, icon,
    inputs,
    examples: id === 'unique-paths' ? [
      { label: '3x4 (倒序逆推)', values: { m: '3', n: '4', direction: 'backward' } },
      { label: '3x4 (正向探索)', values: { m: '3', n: '4', direction: 'forward' } },
      { label: '3x7 (经典倒序)', values: { m: '3', n: '7', direction: 'backward' } },
    ] : [
      { label: '3x4', values: { m: '3', n: '4' } },
      { label: '3x7', values: { m: '3', n: '7' } },
    ],
    build: makeEngineBuilder(obstacle ? 'unique-paths-ii' : 'unique-paths'),
  };
}

function bagDef(id: string, name: string, description: string, icon: string, kind: string, bag = '4', weights = '1,3,4', values = '15,20,30'): DemoDef {
  return {
    id, name, description, icon,
    inputs: [
      { id: 'bag', label: '背包容量', value: bag, width: 90 },
      { id: 'weights', label: '重量数组', value: weights, width: 140 },
      { id: 'values', label: '价值数组', value: values, width: 140 },
    ],
    examples: [{ label: '经典例题', values: { bag, weights, values } }],
    build: makeEngineBuilder(kind),
  };
}

function strDef(id: string, name: string, description: string, icon: string, kind: string, s = 'abcde', t = 'ace'): DemoDef {
  return {
    id, name, description, icon,
    inputs: [{ id: 's', label: 's/数组1', value: s, width: 150 }, { id: 't', label: 't/数组2', value: t, width: 150 }],
    examples: [{ label: '示例1', values: { s, t } }, { label: '示例2', values: { s: 'abc', t: 'abc' } }],
    build: makeEngineBuilder(kind),
  };
}

function stockDef(id: string, name: string, description: string, icon: string, kind: string, extras: Array<{ id: string; label: string; value: string; width?: number }> = []): DemoDef {
  return {
    id, name, description, icon,
    inputs: [{ id: 'prices', label: 'prices', value: '7,1,5,3,6,4', width: 160 }, ...extras],
    examples: [{ label: '示例1', values: { prices: '7,1,5,3,6,4' } }, { label: '示例2', values: { prices: '1,2,3,0,2' } }],
    build: makeEngineBuilder(kind),
  };
}

// ---------------------------------------------------------------------------
// 文章专栏与知识库 (Article Columns)
// ---------------------------------------------------------------------------

const articleCommon: Record<string, Array<[string, string]>> = {
  theory: [
    ['动规五部曲', '<p><span class="tag">确定 dp 数组含义</span><span class="tag">确定递推公式</span><span class="tag">初始化</span><span class="tag">遍历顺序</span><span class="tag">打印 dp 数组</span></p>'],
    ['核心模板', '<pre><code>const dp = 初始化;\nfor (遍历顺序) {\n  dp[当前状态] = 从历史状态转移而来;\n}\nreturn dp[目标状态];</code></pre>'],
  ],
  bag: [
    ['背包问题分类', '<table><tr><th>类型</th><th>遍历方式</th><th>典型题</th></tr><tr><td>0/1 背包</td><td>容量倒序</td><td>分割等和子集、目标和</td></tr><tr><td>完全背包</td><td>容量正序</td><td>零钱兑换、完全平方数</td></tr><tr><td>多重背包</td><td>拆分数量或二进制优化</td><td>有限件物品</td></tr></table>'],
    ['一维公式', '<pre><code>// 0/1 背包\nfor (j = bag; j >= weight; j--) dp[j] = max(dp[j], dp[j-weight] + value);\n// 完全背包\nfor (j = weight; j <= bag; j++) dp[j] = max(dp[j], dp[j-weight] + value);</code></pre>'],
  ],
  stock: [
    ['股票状态机', '<p>股票题的关键是定义“持有/不持有”以及交易次数、冷冻期、手续费等附加状态。</p><pre><code>hold = max(hold, cash - price)\ncash = max(cash, hold + price - fee)</code></pre>'],
  ],
  edit: [
    ['字符串 DP', '<p>编辑距离类问题通常使用二维表，横纵分别对应两个字符串前缀。左、上、左上分别代表插入、删除、替换/匹配。</p>'],
  ],
};

const articles: ArticleDef[] = [
  { id: 'dp-theory', name: '动态规划理论基础', description: '动态规划五部曲、状态定义、递推公式与遍历顺序。', icon: '📘', sections: articleCommon.theory },
  { id: 'dp-week-summary-1', name: '动规周总结（一）', description: '一维基础 DP：斐波那契、爬楼梯、最小花费。', icon: '🧭', sections: articleCommon.theory },
  { id: 'dp-week-summary-2', name: '动规周总结（二）', description: '路径问题、整数拆分、不同 BST 的阶段总结。', icon: '🧭', sections: articleCommon.theory },
  { id: 'knapsack-01-theory-1', name: '0-1背包理论基础（一）', description: '二维 0/1 背包：物品和容量两维状态。', icon: '🎒', sections: articleCommon.bag },
  { id: 'knapsack-01-theory-2', name: '0-1背包理论基础（二）', description: '一维滚动数组：容量倒序遍历避免重复使用物品。', icon: '🎒', sections: articleCommon.bag },
  { id: 'dp-week-summary-3', name: '动规周总结（三）', description: '0/1 背包应用题总结。', icon: '🧭', sections: articleCommon.bag },
  { id: 'complete-knapsack-theory', name: '完全背包理论基础', description: '完全背包：每件物品可以使用无限次，容量正序遍历。', icon: '🧺', sections: articleCommon.bag },
  { id: 'dp-week-summary-4', name: '动规周总结（四）', description: '完全背包组合数问题总结。', icon: '🧭', sections: articleCommon.bag },
  { id: 'dp-week-summary-5', name: '动规周总结（五）', description: '完全背包最值问题与单词拆分总结。', icon: '🧭', sections: articleCommon.bag },
  { id: 'multiple-knapsack-theory', name: '多重背包理论基础', description: '有限件物品的背包问题，可展开为多个 0/1 物品。', icon: '📦', sections: articleCommon.bag },
  { id: 'knapsack-summary', name: '背包问题总结篇', description: '0/1、完全、多重背包及组合/排列/最值类公式汇总。', icon: '🏁', sections: articleCommon.bag },
  { id: 'dp-week-summary-6', name: '动规周总结（六）', description: '打家劫舍与股票入门状态机总结。', icon: '🧭', sections: articleCommon.stock },
  { id: 'dp-week-summary-7', name: '动规周总结（七）', description: '多交易、冷冻期、手续费股票题总结。', icon: '🧭', sections: articleCommon.stock },
  { id: 'stock-summary', name: '股票问题总结篇', description: '股票 DP 的持有/不持有、多次交易、冷冻期和手续费状态总结。', icon: '📈', sections: articleCommon.stock },
  { id: 'edit-distance-summary', name: '编辑距离总结篇', description: '判断子序列、不同子序列、删除操作、编辑距离的状态转移对比。', icon: '✍️', sections: articleCommon.edit },
  { id: 'dp-final-summary', name: '动态规划总结篇', description: '动态规划专题总复盘：状态、转移、遍历顺序和题型地图。', icon: '🏁', sections: [...articleCommon.theory, ...articleCommon.bag, ...articleCommon.stock, ...articleCommon.edit] },
];

// ---------------------------------------------------------------------------
// 交互式算法演示定义表 (Interactive Demos)
// ---------------------------------------------------------------------------

const demos: DemoDef[] = [
  oneDDef('fibonacci', '斐波那契数', 'dp[i] = dp[i-1] + dp[i-2]，动态规划经典入门。', '🔢', 'fibonacci', '8'),
  oneDDef('climb-stairs', '爬楼梯', '每次爬 1 或 2 阶，方案数来自前两阶。', '🪜', 'climb-stairs', '6'),
  numsDef('min-cost-climbing-stairs', '使用最小花费爬楼梯', '到达当前台阶的最小花费来自前一阶或前两阶。', '💰', 'min-cost', '10,15,20'),
  gridDef('unique-paths', '不同路径', '网格路径数：只能从上方或左方到达当前格。', '🧭'),
  gridDef('unique-paths-ii', '不同路径II', '带障碍网格路径数：障碍格路径数为 0。', '🚧', true),
  {
    id: 'decode-ways',
    name: '解码方法',
    description: '数字串翻译方案数（LeetCode 91）：取 1 位或 2 位数字映射为 A-Z。',
    icon: '🔢',
    inputs: [{ id: 's', label: '数字串 s', value: '226', width: 140 }],
    examples: [
      { label: 's="226"', values: { s: '226' } },
      { label: 's="11106"', values: { s: '11106' } },
      { label: 's="06"', values: { s: '06' } },
      { label: 's="10"', values: { s: '10' } },
      { label: 's="2125"', values: { s: '2125' } },
    ],
    build: makeEngineBuilder('decode-ways'),
  },
  oneDDef('integer-break', '整数拆分', '将正整数拆分为至少两个正整数的和，使乘积最大。', '✂️', 'integer-break', '10'),
  oneDDef('unique-bst', '不同的二叉搜索树', '以不同根节点切分左右子树方案数乘积。', '🌲', 'unique-bst', '4'),
  bagDef('knapsack-01-2d', '0-1背包问题（二维）', '每个物品只能使用一次：dp[i][j] 表示前 i 件物品在容量 j 下的最大价值。', '🎒', '01-knapsack'),
  bagDef('knapsack-01-1d', '0-1背包问题（一维）', '滚动数组空间压缩：容量 j 必须从大到小倒序遍历，避免同件物品被重复选入。', '🎒', '01-knapsack'),
  numsDef('partition-equal-subset-sum', '分割等和子集', '判断是否能将数组划分为两个和相等的子集（转化为容量为 sum/2 的 0/1 背包）。', '⚖️', 'partition-subset', '1,5,11,5'),
  numsDef('last-stone-weight-ii', '最后一块石头的重量 II', '两两粉碎等价于将石头分成总重最接近的两堆（0/1 背包）。', '🪨', 'last-stone-weight-ii', '2,7,4,1,8,1'),
  numsDef('target-sum', '目标和', '添加正负号凑出 target（转化为 0/1 背包求解装满容量为 (sum+target)/2 的方案数）。', '🎯', 'target-sum', '1,1,1,1,1'),
  {
    id: 'ones-and-zeroes',
    name: '一和零',
    description: '二维费用 0-1 背包：最多含有 m 个 0 和 n 个 1 的最大子集大小。',
    icon: '0️⃣',
    inputs: [
      { id: 'strs', label: '二进制串', value: '10,0001,111001,1,0', width: 170 },
      { id: 'm', label: '最大0个数', value: '5', width: 90 },
      { id: 'n', label: '最大1个数', value: '3', width: 90 },
    ],
    examples: [{ label: '示例', values: { strs: '10,0001,111001,1,0', m: '5', n: '3' } }],
    build: makeEngineBuilder('ones-and-zeroes'),
  },
  bagDef('complete-knapsack', '完全背包问题', '每种物品有无限件可用：容量 j 正序遍历，允许同种物品累加。', '🧺', 'complete-knapsack'),
  {
    id: 'coin-change-ii',
    name: '零钱兑换 II',
    description: '求凑成总金额的组合数：外层遍历硬币、内层正序遍历金额。',
    icon: '🪙',
    inputs: [
      { id: 'amount', label: '目标金额', value: '5', width: 90 },
      { id: 'coins', label: '硬币面额', value: '1,2,5', width: 130 },
    ],
    examples: [{ label: '示例', values: { amount: '5', coins: '1,2,5' } }],
    build: makeEngineBuilder('coin-change-ii'),
  },
  numsDef('combination-sum-iv', '组合总和 Ⅳ', '排列数完全背包：外层正序遍历容量、内层遍历物品。', '🔢', 'combination-sum-iv', '1,2,3'),
  oneDDef('climb-stairs-advanced', '爬楼梯（进阶完全背包）', '一步可上 1..m 阶，等价于容量为 n 的排列数完全背包。', '🪜', 'combination-sum-iv', '5'),
  {
    id: 'coin-change',
    name: '零钱兑换',
    description: '凑成目标金额所需的最少硬币数（完全背包求最小值）。',
    icon: '🪙',
    inputs: [
      { id: 'amount', label: '目标金额', value: '11', width: 90 },
      { id: 'coins', label: '硬币面额', value: '1,2,5', width: 130 },
    ],
    examples: [{ label: '示例', values: { amount: '11', coins: '1,2,5' } }],
    build: makeEngineBuilder('coin-change'),
  },
  oneDDef('perfect-squares', '完全平方数', '和为 n 的完全平方数的最少数量（完全背包）。', '🟩', 'perfect-squares', '12'),
  {
    id: 'word-break',
    name: '单词拆分',
    description: '能否由字典单词拼接出目标字符串 s（排列型完全背包）。',
    icon: '🔤',
    inputs: [
      { id: 's', label: '字符串 s', value: 'leetcode', width: 130 },
      { id: 'wordDict', label: '字典 words', value: 'leet,code', width: 150 },
    ],
    examples: [{ label: '示例1', values: { s: 'leetcode', wordDict: 'leet,code' } }, { label: '示例2', values: { s: 'applepenapple', wordDict: 'apple,pen' } }],
    build: makeEngineBuilder('word-break'),
  },
  bagDef('multiple-knapsack', '多重背包理论基础', '每种物品有有限数量上限，可展开为 0-1 背包或二进制拆分。', '📦', '01-knapsack'),
  numsDef('house-robber', '打家劫舍', '不相邻房屋最大金额：dp[i] = max(dp[i-1], dp[i-2] + nums[i])。', '🏠', 'house-robber', '1,2,3,1'),
  numsDef('house-robber-ii', '打家劫舍 II', '环形房屋破圈为双区间：[0..n-2] 与 [1..n-1] 取最大值。', '🏘️', 'house-robber-ii', '2,3,2'),
  numsDef('house-robber-iii', '打家劫舍 III', '二叉树树形 DP：后序遍历返回 [不偷当前节点, 偷当前节点] 状态二元组。', '🌳', 'house-robber-iii', '3,2,3,3,1'),
  stockDef('best-time-to-buy-and-sell-stock', '买卖股票的最佳时机', '只能买卖一次：维护历史最低买入价与当日卖出最大差价。', '📈', 'best-time-to-buy-and-sell-stock'),
  stockDef('best-time-to-buy-and-sell-stock-ii', '买卖股票的最佳时机 II', '可以进行多次交易：只要今天比昨天价格高就累加正收益。', '📊', 'best-time-to-buy-and-sell-stock-ii'),
  stockDef('best-time-to-buy-and-sell-stock-iii', '买卖股票的最佳时机 III', '最多可以完成两笔交易：构建五状态有限状态机。', '📉', 'best-time-to-buy-and-sell-stock-iii'),
  stockDef('best-time-to-buy-and-sell-stock-iv', '买卖股票的最佳时机 IV', '最多可以完成 k 笔交易：构建 2k+1 状态有限状态机。', '💹', 'best-time-to-buy-and-sell-stock-iv', [{ id: 'k', label: '最大交易次数 k', value: '2', width: 110 }]),
  stockDef('best-time-to-buy-and-sell-stock-with-cooldown', '买卖股票的最佳时机含冷冻期', '卖出股票后有一天冷冻期：构建持有、冷冻、自由三状态机。', '🧊', 'best-time-to-buy-and-sell-stock-with-cooldown'),
  stockDef('best-time-to-buy-and-sell-stock-with-transaction-fee', '买卖股票的最佳时机含手续费', '每次交易产生手续费：卖出套现时扣减手续费。', '💳', 'best-time-to-buy-and-sell-stock-with-transaction-fee', [{ id: 'fee', label: '交易手续费 fee', value: '2', width: 110 }]),
  numsDef('longest-increasing-subsequence', '最长递增子序列', 'dp[i] 表示以 nums[i] 结尾的最长严格递增子序列长度。', '📈', 'longest-increasing-subsequence', '10,9,2,5,3,7,101,18'),
  numsDef('longest-continuous-increasing-subsequence', '最长连续递增序列', '要求严格相邻连续：只需向前看一位 dp[i] = dp[i-1] + 1。', '📏', 'longest-continuous-increasing-subsequence', '1,3,5,4,7'),
  strDef('longest-repeated-subarray', '最长重复子数组', '两数组中连续公共子数组的最长长度：相等时仅从左上角对角线累加。', '🧩', 'longest-repeated-subarray', '1,2,3,2,1', '3,2,1,4,7'),
  strDef('longest-common-subsequence', '最长公共子序列', '不要求连续的最长公共子序列：相等时对角线加1，不等时取左方和上方较大值。', '🧬', 'lcs', 'abcde', 'ace'),
  strDef('uncrossed-lines', '不相交的线', '连线不相交等价于两数组的最长公共子序列 (LCS)。', '🧶', 'uncrossed-lines', '1,4,2', '1,2,4'),
  numsDef('max-subarray-dp', '最大子数组和', '连续子数组最大和：dp[i] = max(nums[i], dp[i-1] + nums[i])。', '➕', 'max-subarray-dp', '-2,1,-3,4,-1,2,1,-5,4'),
  strDef('is-subsequence', '判断子序列', '双指针或 DP 判定 s 是否为 t 的子序列。', '🔍', 'is-subsequence', 'abc', 'ahbgdc'),
  strDef('distinct-subsequences', '不同的子序列', '在字符串 s 的子序列中 t 出现的次数。', '🧮', 'distinct-subsequences', 'rabbbit', 'rabbit'),
  strDef('delete-operation-for-two-strings', '两个字符串的删除操作', '使两字符串相同所需的最小删除步数：直接 DP 或 word1.len + word2.len - 2*LCS。', '🗑️', 'delete-operation-for-two-strings', 'sea', 'eat'),
  strDef('edit-distance', '编辑距离', '将 word1 转换成 word2 所使用的最少操作数（插入、删除、替换）。', '✏️', 'edit-distance', 'horse', 'ros'),
  {
    id: 'palindromic-substrings',
    name: '回文子串',
    description: '统计字符串中回文子串的总数目（区间 DP 从下往上遍历）。',
    icon: '🪞',
    inputs: [{ id: 's', label: '字符串 s', value: 'aaa', width: 140 }],
    examples: [{ label: 's="aaa"', values: { s: 'aaa' } }, { label: 's="abc"', values: { s: 'abc' } }],
    build: makeEngineBuilder('palindromic-substrings'),
  },
  {
    id: 'longest-palindromic-subsequence',
    name: '最长回文子序列',
    description: '找出字符串中最长的回文子序列长度（区间 DP 向内收缩）。',
    icon: '👑',
    inputs: [{ id: 's', label: '字符串 s', value: 'bbbab', width: 140 }],
    examples: [{ label: 's="bbbab"', values: { s: 'bbbab' } }, { label: 's="cbbd"', values: { s: 'cbbd' } }],
    build: makeEngineBuilder('longest-palindromic-subsequence'),
  },
];

// ---------------------------------------------------------------------------
// 课程流水线批量注册执行 (Pipeline Registration Execution)
// ---------------------------------------------------------------------------

const articleMap = new Map(articles.map((a) => [a.id, a]));
const demoMap = new Map(demos.map((d) => [d.id, d]));

const ordered: Array<{ type: 'article' | 'demo'; id: string }> = [
  { type: 'article', id: 'dp-theory' },
  { type: 'demo', id: 'fibonacci' },
  { type: 'demo', id: 'climb-stairs' },
  { type: 'demo', id: 'min-cost-climbing-stairs' },
  { type: 'article', id: 'dp-week-summary-1' },
  { type: 'demo', id: 'unique-paths' },
  { type: 'demo', id: 'unique-paths-ii' },
  { type: 'demo', id: 'decode-ways' },
  { type: 'demo', id: 'integer-break' },
  { type: 'demo', id: 'unique-bst' },
  { type: 'article', id: 'dp-week-summary-2' },
  { type: 'article', id: 'knapsack-01-theory-1' },
  { type: 'demo', id: 'knapsack-01-2d' },
  { type: 'article', id: 'knapsack-01-theory-2' },
  { type: 'demo', id: 'knapsack-01-1d' },
  { type: 'demo', id: 'partition-equal-subset-sum' },
  { type: 'demo', id: 'last-stone-weight-ii' },
  { type: 'demo', id: 'target-sum' },
  { type: 'demo', id: 'ones-and-zeroes' },
  { type: 'article', id: 'dp-week-summary-3' },
  { type: 'article', id: 'complete-knapsack-theory' },
  { type: 'demo', id: 'complete-knapsack' },
  { type: 'demo', id: 'coin-change-ii' },
  { type: 'demo', id: 'combination-sum-iv' },
  { type: 'demo', id: 'climb-stairs-advanced' },
  { type: 'article', id: 'dp-week-summary-4' },
  { type: 'demo', id: 'coin-change' },
  { type: 'demo', id: 'perfect-squares' },
  { type: 'demo', id: 'word-break' },
  { type: 'article', id: 'dp-week-summary-5' },
  { type: 'article', id: 'multiple-knapsack-theory' },
  { type: 'demo', id: 'multiple-knapsack' },
  { type: 'article', id: 'knapsack-summary' },
  { type: 'demo', id: 'house-robber' },
  { type: 'demo', id: 'house-robber-ii' },
  { type: 'demo', id: 'house-robber-iii' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock-ii' },
  { type: 'article', id: 'dp-week-summary-6' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock-iii' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock-iv' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock-with-cooldown' },
  { type: 'demo', id: 'best-time-to-buy-and-sell-stock-with-transaction-fee' },
  { type: 'article', id: 'dp-week-summary-7' },
  { type: 'article', id: 'stock-summary' },
  { type: 'demo', id: 'longest-increasing-subsequence' },
  { type: 'demo', id: 'longest-continuous-increasing-subsequence' },
  { type: 'demo', id: 'longest-repeated-subarray' },
  { type: 'demo', id: 'longest-common-subsequence' },
  { type: 'demo', id: 'uncrossed-lines' },
  { type: 'demo', id: 'max-subarray-dp' },
  { type: 'demo', id: 'is-subsequence' },
  { type: 'demo', id: 'distinct-subsequences' },
  { type: 'demo', id: 'delete-operation-for-two-strings' },
  { type: 'demo', id: 'edit-distance' },
  { type: 'article', id: 'edit-distance-summary' },
  { type: 'demo', id: 'palindromic-substrings' },
  { type: 'demo', id: 'longest-palindromic-subsequence' },
  { type: 'article', id: 'dp-final-summary' },
];

let globalLevelOrder = 1;
ordered.forEach((item) => {
  if (item.type === 'article') {
    const def = articleMap.get(item.id);
    if (def) {
      def.levelOrder = globalLevelOrder++;
      registerArticle(def);
    }
  } else {
    const def = demoMap.get(item.id);
    if (def) {
      def.levelOrder = globalLevelOrder++;
      registerDemo(def);
    }
  }
});
