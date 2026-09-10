/**
 * 最长回文子序列 LPS (LeetCode 516) - 声明式 4-Card 沙盘渲染器
 * 核心：区间动态规划之母、半三角矩阵填表与 leftDown 暂存空间压缩
 * 涵盖：
 * 阶段 1: 区间暴力递归 f(l, r)
 * 阶段 2: 记忆化搜索 memo[l][r]
 * 阶段 3: 严格区间 DP 半三角表 dp[l][r] (自底向上逆序填表)
 * 阶段 4: 空间压缩 dp[r] + leftDown 寄存器暂存
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  LPS_STAGE1_CODE_LANGUAGES,
  LPS_STAGE2_CODE_LANGUAGES,
  LPS_STAGE3_CODE_LANGUAGES,
  LPS_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  DpCellDep,
} from './dp-067-shared';

export function parseLpsInputs(inputs: Record<string, any>) {
  const s = String(inputs?.['input-s'] || 'bbbab').trim();
  return { s };
}

// ==========================================
// 1. Stage 1: 区间暴力递归
// ==========================================

export interface LpsRecStep {
  currentCall: string;
  l: number;
  r: number;
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s: string;
  metrics?: Record<string, any>;
}

export function buildLpsStage1Steps(inputs: Record<string, any>): LpsRecStep[] {
  const { s } = parseLpsInputs(inputs);
  const steps: LpsRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 5, cpp: 2, python: 3, javascript: 3 },
    base1: { java: 6, cpp: 3, python: 4, javascript: 4 },
    base2: { java: 7, cpp: 4, python: 5, javascript: 5 },
    match: { java: 8, cpp: 5, python: 6, javascript: 6 },
    mismatch: { java: 9, cpp: 6, python: 7, javascript: 7 },
  };

  steps.push({
    currentCall: `lps1("${s}")`,
    l: 0,
    r: s.length - 1,
    callStack: [],
    decision: `主函数入口：求解字符串 "${s}" 的最长回文子序列`,
    message: `调用辅助递归函数 f(0, ${s.length - 1})`,
    log: `enter lps1`,
    codeLine: lines.entry,
    s,
    metrics: { 'metric-interval': `[0, ${s.length - 1}]`, 'metric-status': '函数入口' },
  });

  function f(l: number, r: number): number {
    stack.push({ label: `f(${l}, ${r})` });
    steps.push({
      currentCall: `f(${l}, ${r})`,
      l,
      r,
      callStack: [...stack],
      decision: `探查区间 s[${l}..${r}] ("${s.slice(l, r + 1)}")`,
      message: `区间两端字符: s[${l}]='${s[l]}', s[${r}]='${s[r]}'`,
      log: `f(${l}, ${r})`,
      codeLine: lines.enter,
      s,
      metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '区间递归' },
    });

    if (l === r) {
      steps.push({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        callStack: [...stack],
        decision: `Base Case 1: 单字符区间 [${l}, ${l}] 自身即为长度为 1 的回文串`,
        message: 'l == r，返回 1',
        log: `base l==r: 1`,
        codeLine: lines.base1,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': '1' },
      });
      stack.pop();
      return 1;
    }

    if (l === r - 1) {
      const same = s[l] === s[r];
      const ans = same ? 2 : 1;
      steps.push({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        callStack: [...stack],
        decision: `Base Case 2: 双字符区间 [${l}, ${r}]，字符${same ? '相同返回 2' : '不同返回 1'}`,
        message: `s[${l}]='${s[l]}' 与 s[${r}]='${s[r]}'`,
        log: `base len 2: ${ans}`,
        codeLine: lines.base2,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
      });
      stack.pop();
      return ans;
    }

    if (s[l] === s[r]) {
      const inner = f(l + 1, r - 1);
      const ans = 2 + inner;
      steps.push({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        callStack: [...stack],
        decision: `✨ 首尾相等 '${s[l]}' == '${s[r]}'！共同作为回文外层，LPS = 2 + f(${l + 1}, ${r - 1}) = ${ans}`,
        message: `向内收缩区间探查 [${l + 1}, ${r - 1}] 并增加贡献 2`,
        log: `match: 2 + ${inner} = ${ans}`,
        codeLine: lines.match,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
      });
      stack.pop();
      return ans;
    } else {
      const left = f(l + 1, r);
      const right = f(l, r - 1);
      const ans = Math.max(left, right);
      steps.push({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        callStack: [...stack],
        decision: `首尾不同 '${s[l]}' != '${s[r]}'，无法同时作为外层，取 max(舍左=${left}, 舍右=${right}) = ${ans}`,
        message: `比较两端各放弃一个字符后的最大回文子序列`,
        log: `mismatch: max(${left}, ${right}) = ${ans}`,
        codeLine: lines.mismatch,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
      });
      stack.pop();
      return ans;
    }
  }

  f(0, s.length - 1);
  return steps;
}

// ==========================================
// 2. Stage 2: 记忆化搜索
// ==========================================

export interface LpsMemoStep {
  currentCall: string;
  l: number;
  r: number;
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  memoGrid: number[][];
  cachedVal?: number;
  s: string;
  metrics?: Record<string, any>;
}

export function buildLpsStage2Steps(inputs: Record<string, any>): LpsMemoStep[] {
  const { s } = parseLpsInputs(inputs);
  const n = s.length;
  const steps: LpsMemoStep[] = [];
  const memo: number[][] = Array.from({ length: n }, () => new Array(n).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  steps.push({
    currentCall: `lps2("${s}")`,
    l: 0,
    r: n - 1,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：初始化 ${n}×${n} 备忘录矩阵 memo`,
    message: `以 memo 缓存各区间 [l, r] 的最长回文子序列长度`,
    log: `enter lps2`,
    codeLine: { java: 2, cpp: 2, python: 2, javascript: 2 },
    memoGrid: memo.map((row) => [...row]),
    s,
    metrics: { 'metric-status': '函数入口', 'metric-hits': '0' },
  });

  function fMemo(l: number, r: number): number {
    if (l === r) return 1;
    if (l === r - 1) return s[l] === s[r] ? 2 : 1;

    if (memo[l][r] !== -1) {
      hitCount++;
      steps.push({
        currentCall: `fMemo(${l}, ${r})`,
        l,
        r,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: memo[l][r],
        decision: `🎯 命中备忘录: memo[${l}][${r}] = ${memo[l][r]}`,
        message: `区间 [${l}, ${r}] 此前已求解过，直接复用结果剪除子树！`,
        log: `hit memo[${l}][${r}] = ${memo[l][r]}`,
        codeLine: { java: 8, cpp: 6, python: 5, javascript: 6 },
        memoGrid: memo.map((row) => [...row]),
        s,
        metrics: { 'metric-status': '命中剪枝', 'metric-hits': `${hitCount}` },
      });
      return memo[l][r];
    }

    missCount++;
    steps.push({
      currentCall: `fMemo(${l}, ${r})`,
      l,
      r,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录: 首次探查区间 [${l}, ${r}]`,
      message: `比较 s[${l}]('${s[l]}') 与 s[${r}]('${s[r]}')`,
      log: `miss memo[${l}][${r}]`,
      codeLine: { java: 7, cpp: 5, python: 4, javascript: 5 },
      memoGrid: memo.map((row) => [...row]),
      s,
      metrics: { 'metric-status': '展开递归', 'metric-misses': `${missCount}` },
    });

    let res = 0;
    if (s[l] === s[r]) {
      res = 2 + fMemo(l + 1, r - 1);
    } else {
      res = Math.max(fMemo(l + 1, r), fMemo(l, r - 1));
    }

    memo[l][r] = res;
    steps.push({
      currentCall: `fMemo(${l}, ${r})`,
      l,
      r,
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: res,
      decision: `💾 计算完成存入备忘录: memo[${l}][${r}] = ${res}`,
      message: `区间 [${l}, ${r}] 最长回文子序列长度存入 memo`,
      log: `store memo[${l}][${r}] = ${res}`,
      codeLine: { java: 11, cpp: 9, python: 10, javascript: 9 },
      memoGrid: memo.map((row) => [...row]),
      s,
      metrics: { 'metric-status': '写入备忘录', 'metric-val': `${res}` },
    });

    return res;
  }

  fMemo(0, n - 1);
  return steps;
}

// ==========================================
// 3. Stage 3: 严格区间 DP 半三角表
// ==========================================

export interface Lps2DStep {
  curL: number;
  curR: number;
  currentCell: string;
  currentVal: number;
  dpTable: number[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s: string;
  metrics?: Record<string, any>;
}

export function buildLpsStage3Steps(inputs: Record<string, any>): Lps2DStep[] {
  const { s } = parseLpsInputs(inputs);
  const n = s.length;
  const steps: Lps2DStep[] = [];
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  // 1. 初始化对角线
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }

  steps.push({
    curL: 0,
    curR: 0,
    currentCell: '主对角线 dp[i][i]',
    currentVal: 1,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: '初始化主对角线 dp[i][i] = 1（所有单字符区间长度均为 1）',
    message: '半三角矩阵主对角线填充',
    log: 'init diag dp[i][i] = 1',
    codeLine: { java: 7, cpp: 6, python: 6, javascript: 6 },
    s,
    metrics: { 'metric-status': '主对角线初始化' },
  });

  // 严格自底向上填表：l 从 n - 1 到 0，r 从 l + 1 到 n - 1
  for (let l = n - 1; l >= 0; l--) {
    for (let r = l + 1; r < n; r++) {
      if (s[l] === s[r]) {
        dp[l][r] = 2 + (l + 1 <= r - 1 ? dp[l + 1][r - 1] : 0);
        steps.push({
          curL: l,
          curR: r,
          currentCell: `dp[${l}][${r}]`,
          currentVal: dp[l][r],
          dpTable: dp.map((row) => [...row]),
          depCells: [
            {
              r: l + 1,
              c: r - 1,
              label: `左下方 [${l + 1}][${r - 1}]`,
              color: 'rgba(16, 185, 129, 0.25)',
            },
          ],
          decision: `✨ 字符相等 s[${l}] == s[${r}]('${s[l]}')！dp[${l}][${r}] = 2 + dp[${l + 1}][${r - 1}] = ${dp[l][r]}`,
          message: `依赖左下角单元格转移`,
          log: `dp[${l}][${r}] = ${dp[l][r]}`,
          codeLine: { java: 10, cpp: 9, python: 9, javascript: 9 },
          s,
          metrics: { 'metric-status': '左下角对角线转移', 'metric-val': `${dp[l][r]}` },
        });
      } else {
        const down = dp[l + 1][r];
        const left = dp[l][r - 1];
        dp[l][r] = Math.max(down, left);
        steps.push({
          curL: l,
          curR: r,
          currentCell: `dp[${l}][${r}]`,
          currentVal: dp[l][r],
          dpTable: dp.map((row) => [...row]),
          depCells: [
            { r: l + 1, c: r, label: `下方 [${l + 1}][${r}]`, color: 'rgba(129, 140, 248, 0.2)' },
            { r: l, c: r - 1, label: `左方 [${l}][${r - 1}]`, color: 'rgba(56, 189, 248, 0.2)' },
          ],
          decision: `字符不等 s[${l}] != s[${r}]。dp[${l}][${r}] = max(下=${down}, 左=${left}) = ${dp[l][r]}`,
          message: `依赖正下方和正左方单元格取较大者`,
          log: `dp[${l}][${r}] = ${dp[l][r]}`,
          codeLine: { java: 11, cpp: 10, python: 10, javascript: 10 },
          s,
          metrics: { 'metric-status': '左下择优转移', 'metric-val': `${dp[l][r]}` },
        });
      }
    }
  }

  return steps;
}

// ==========================================
// 4. Stage 4: 空间压缩 + leftDown 暂存器
// ==========================================

export interface LpsSpaceOptStep {
  curL: number;
  curR: number;
  dp: number[];
  leftDown: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s: string;
  metrics?: Record<string, any>;
}

export function buildLpsStage4Steps(inputs: Record<string, any>): LpsSpaceOptStep[] {
  const { s } = parseLpsInputs(inputs);
  const n = s.length;
  const steps: LpsSpaceOptStep[] = [];
  const dp = new Array(n).fill(0);

  const lines4 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocDp: { java: 4, cpp: 4, python: 4, javascript: 4 },
    baseDiag: { java: 6, cpp: 6, python: 6, javascript: 6 },
    initLeftDown: { java: 7, cpp: 7, python: 7, javascript: 7 },
    backup: { java: 9, cpp: 9, python: 9, javascript: 9 },
    match: { java: 10, cpp: 10, python: 10, javascript: 10 },
    mismatch: { java: 11, cpp: 11, python: 11, javascript: 11 },
    shiftLeftDown: { java: 12, cpp: 12, python: 12, javascript: 12 },
    returnAns: { java: 15, cpp: 15, python: 15, javascript: 15 },
  };

  steps.push({
    curL: n - 1,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `主函数入口：lps4("${s}")`,
    message: `利用一维压缩数组从底向上 (l: ${n - 1} -> 0) 逆序推导，空间仅需 O(N)`,
    log: `enter lps4`,
    codeLine: lines4.entry,
    s,
    metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
  });

  steps.push({
    curL: n - 1,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `初始化压缩一维数组: int[] dp = new int[${n}]`,
    message: `使用 leftDown 变量暂存被覆盖前的左下角对角线数据`,
    log: `alloc dp[${n}]`,
    codeLine: lines4.allocDp,
    s,
    metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
  });

  for (let l = n - 1; l >= 0; l--) {
    dp[l] = 1;
    steps.push({
      curL: l,
      curR: l,
      dp: [...dp],
      leftDown: 0,
      decision: `单字符自身天然构成长度为 1 的回文串: dp[${l}] = 1`,
      message: `区间 [${l}, ${l}] 的 LPS 为 1`,
      log: `dp[${l}] = 1`,
      codeLine: lines4.baseDiag,
      s,
      metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
    });

    let leftDown = 0;
    steps.push({
      curL: l,
      curR: l,
      dp: [...dp],
      leftDown: 0,
      decision: `初始化左下角寄存器: int leftDown = 0`,
      message: `作为列 r = ${l + 1} 的左下角初始值`,
      log: `leftDown = 0`,
      codeLine: lines4.initLeftDown,
      s,
      metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
    });

    for (let r = l + 1; r < n; r++) {
      const backup = dp[r]; // 此时 dp[r] 保存的是旧行 (l+1) 的值，即原本的下方 dp[l+1][r]

      steps.push({
        curL: l,
        curR: r,
        dp: [...dp],
        leftDown,
        decision: `备份寄存器: int backup = dp[${r}] (${backup})`,
        message: `在覆盖 dp[${r}] 之前将其暂存，它将作为右侧下一列的左下角值`,
        log: `backup dp[${r}]=${backup}`,
        codeLine: lines4.backup,
        s,
        metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': `${leftDown}` },
      });

      if (s[l] === s[r]) {
        dp[r] = 2 + leftDown;
        steps.push({
          curL: l,
          curR: r,
          dp: [...dp],
          leftDown,
          decision: `✨ 首尾相同 s[${l}] == s[${r}] ('${s[l]}')！利用寄存器 leftDown(${leftDown}) + 2 更新 dp[${r}] = ${dp[r]}`,
          message: `leftDown 保存的是原本二维表的左下角 dp[l+1][r-1]`,
          log: `dp[${r}] = 2 + ${leftDown} = ${dp[r]}`,
          codeLine: lines4.match,
          s,
          metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': `${leftDown}` },
        });
      } else {
        dp[r] = Math.max(dp[r], dp[r - 1]);
        steps.push({
          curL: l,
          curR: r,
          dp: [...dp],
          leftDown,
          decision: `首尾不同 s[${l}] != s[${r}]。dp[${r}] = max(下方${backup}, 左方${dp[r - 1]}) = ${dp[r]}`,
          message: `旧值即为下方值，左侧值为当前行左方值`,
          log: `dp[${r}] = max(${backup}, ${dp[r - 1]}) = ${dp[r]}`,
          codeLine: lines4.mismatch,
          s,
          metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': `${leftDown}` },
        });
      }

      leftDown = backup;
      steps.push({
        curL: l,
        curR: r,
        dp: [...dp],
        leftDown,
        decision: `寄存器推移: leftDown = backup (${backup})`,
        message: `为下一列 r=${r + 1} 准备其左下角值`,
        log: `leftDown = ${backup}`,
        codeLine: lines4.shiftLeftDown,
        s,
        metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': `${leftDown}` },
      });
    }
  }

  steps.push({
    curL: 0,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `🎉 空间压缩区间DP计算完毕！全局最长回文子序列长度 = dp[${n - 1}] = ${dp[n - 1]}`,
    message: `整个字符串 s[0..${n - 1}] 的答案计算完成`,
    log: `done ans=${dp[n - 1]}`,
    codeLine: lines4.returnAns,
    s,
    metrics: { 'metric-space': `O(${n})`, 'metric-ans': `${dp[n - 1]}` },
  });

  return steps;
}

// ==========================================
// 5. 声明式 Visualizer
// ==========================================

const { template, Visualizer } = registerDeclarativeAlgorithm<any>({
  id: 'longest-palindromic-subsequence',
  name: '最长回文子序列 (LPS)',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code04：LeetCode 516 最长回文子序列，区间DP经典半三角矩阵与 leftDown 空间压缩',
  icon: '🪞',
  difficulty: 2,
  levelOrder: 104,
  learningGoal: '理解区间DP的定义、自底向上填表顺序的必然性以及 leftDown 暂存器在对角线压缩中的关键作用',
  badge: {
    mode: '区间 DP · 半三角矩阵',
    complexity: 'O(N^2) · O(N) 空间',
  },
  primaryVisual: {
    title: '🪞 字符串回文对称区间雷达',
    render: (container, step) => {
      renderIntervalView(container, step.s, step.curL, step.curR);
    },
  },
  auxiliaryVisual: {
    title: '📈 半三角状态矩阵与 leftDown 暂存',
    desc: '展示区间从单字符向外扩展、自底向上递推以及一维空间压缩技巧',
    render: (container, step) => {
      renderSpaceOptCard2(
        container,
        `一维滚动数组 dp[0..${step.dp.length - 1}]`,
        step.dp,
        step.curR,
        'leftDown',
        step.leftDown,
        step.s.split('')
      );
    },
  },
  legend: [
    { label: '首尾字符匹配', color: '#10b981' },
    { label: '当前区间端点', color: '#38bdf8' },
    { label: '区间外字符', color: '#475569' },
  ],
  inputs: [
    { id: 'input-s', label: '字符串 s:', type: 'text', defaultValue: 'bbbab', width: '140px' },
  ],
  presets: [
    { label: 'LeetCode 样例 1 ("bbbab" Ans=4)', values: { 'input-s': 'bbbab' } },
    { label: 'LeetCode 样例 2 ("cbbd" Ans=2)', values: { 'input-s': 'cbbd' } },
    { label: '回文串 ("racecar" Ans=7)', values: { 'input-s': 'racecar' } },
  ],
  metrics: [
    { id: 'metric-interval', label: '当前区间', color: '#38bdf8' },
    { id: 'metric-status', label: '状态', color: '#10b981' },
    { id: 'metric-leftDown', label: 'leftDown 寄存器', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['longest-palindromic-subsequence'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-palindromic-subsequence'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-palindromic-subsequence'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildLpsStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^N)',
      theme: 'bg-blue',
      badge: {
        mode: '区间模型 · 暴力递归',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      legend: [
        { label: '首尾边界 L/R', color: '#0284c7' },
        { label: '区间内部字符', color: '#10b981' },
        { label: '区间外部', color: '#94a3b8' },
      ],
      codeLanguages: LPS_STAGE1_CODE_LANGUAGES,
      buildSteps: buildLpsStage1Steps,
      primaryVisual: {
        title: '🪞 字符串区间首尾探查',
        render: (container, step) => {
          renderIntervalView(container, step.s, step.l, step.r);
        },
      },
      auxiliaryVisual: {
        title: '🌿 递归分支展开与调用栈',
        desc: '展示以首尾字符为两端的递归分治调用树与实时调用栈',
        render: (container, step) => {
          renderRecursionCard1(
            container,
            step.currentCall,
            step.callStack,
            `<div style="font-size:12px; font-weight:700; color:#0284c7;">${step.decision}</div>
             <div style="font-size:11px; color:#64748b; margin-top:4px;">${step.message}</div>`
          );
        },
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N^2)',
      theme: 'bg-blue',
      badge: {
        mode: '区间模型 · 记忆化搜索',
        complexity: 'O(N^2) · O(N^2) 备忘录',
      },
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: LPS_STAGE2_CODE_LANGUAGES,
      buildSteps: buildLpsStage2Steps,
      primaryVisual: {
        title: '🎯 2D 区间备忘录矩阵 memo[l][r]',
        render: (container, step) => {
          renderMemoGridCard(
            container,
            'LPS 区间备忘录 memo[l][r]',
            step.memoGrid,
            step.l,
            step.r,
            step.s.split(''),
            step.s.split('')
          );
        },
      },
      auxiliaryVisual: {
        title: '💾 备忘录缓存追踪 (Hit / Miss)',
        desc: '以 memo[l][r] 记录子区间最优回文长度，消除重复区间展开',
        render: (container, step) => {
          renderMemoCard1(
            container,
            step.currentCall,
            step.memoHit,
            step.hitCount,
            step.missCount,
            step.decision,
            step.message,
            step.cachedVal
          );
        },
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格区间 DP 半三角表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N^2)',
      theme: 'bg-emerald',
      badge: {
        mode: '区间模型 · 自底向上半三角表',
        complexity: 'O(N^2) · O(N^2)',
      },
      legend: [
        { label: '当前填表 dp[l][r]', color: '#10b981' },
        { label: '依赖前驱单元格', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: LPS_STAGE3_CODE_LANGUAGES,
      buildSteps: buildLpsStage3Steps,
      primaryVisual: {
        title: '📊 严格半三角状态表 dp[l][r]',
        render: (container, step) => {
          renderDp2DCard2(
            container,
            '半三角二维状态表 dp[l][r]',
            step.dpTable,
            step.curL,
            step.curR,
            step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c })),
            step.s.split(''),
            step.s.split('')
          );
        },
      },
      auxiliaryVisual: {
        title: '📐 状态转移推导与区间扩展',
        desc: '展示区间长度 len 由小到大向外扩展的严格半三角填表推导',
        render: (container, step) => {
          renderDp2DCard1(
            container,
            step.currentCell,
            step.currentVal,
            step.depCells,
            step.decision,
            step.message
          );
        },
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(N) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '区间模型 · leftDown 寄存器暂存优化',
        complexity: 'O(N^2) · O(N) 空间',
      },
      legend: [
        { label: '当前更新 dp[r]', color: '#f59e0b' },
        { label: 'leftDown 暂存器', color: '#6366f1' },
        { label: '历史一维值', color: '#0284c7' },
      ],
      codeLanguages: LPS_STAGE4_CODE_LANGUAGES,
      buildSteps: buildLpsStage4Steps,
      primaryVisual: {
        title: '🪞 字符串回文对称区间雷达',
        render: (container, step) => {
          renderIntervalView(container, step.s, step.curL, step.curR);
        },
      },
      auxiliaryVisual: {
        title: '📈 空间压缩一维向量与 leftDown 暂存器',
        render: (container, step) => {
          renderSpaceOptCard2(
            container,
            `一维滚动数组 dp[0..${step.dp.length - 1}]`,
            step.dp,
            step.curR,
            'leftDown',
            step.leftDown,
            step.s.split('')
          );
        },
      },
    },
  ],
});

function renderIntervalView(
  container: HTMLElement,
  s: string,
  curL: number,
  curR: number
): void {
  if (!container) return;
  const chars = s.split('').map((ch, idx) => {
    const isL = idx === curL;
    const isR = idx === curR;
    const inInterval = idx >= curL && idx <= curR;

    let bg = '#ffffff';
    let border = '1px solid #e2e8f0';
    let textCol = '#64748b';
    let shadow = 'none';

    if (isL || isR) {
      bg = '#e0f2fe';
      border = '2px solid #0284c7';
      textCol = '#0369a1';
      shadow = '0 2px 6px rgba(2, 132, 199, 0.15)';
    } else if (inInterval) {
      bg = '#f0fdf4';
      border = '1.5px solid #bbf7d0';
      textCol = '#166534';
    }

    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      ">
        <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${isL || isR ? '#0284c7' : '#94a3b8'};">
          ${isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : `${idx}`}
        </span>
        <div style="
          padding: 8px 14px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 15px;
          font-weight: 800;
          background: ${bg};
          border: ${border};
          color: ${textCol};
          box-shadow: ${shadow};
          min-width: 32px;
          text-align: center;
        ">${ch}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 480px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前探查区间 [${curL}, ${curR}]</span>
        <span style="font-size: 11px; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 9999px; font-family: monospace; font-weight: 700;">跨度: ${Math.max(0, curR - curL + 1)}</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding: 6px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        ${chars}
      </div>
    </div>
  `;
}

export const LongestPalindromicSubsequenceVisualizer = Visualizer;

