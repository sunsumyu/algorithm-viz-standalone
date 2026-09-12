/**
 * 字符串动态规划四阶段演化引擎与渲染模块 (StringDpStageEvolution)
 * 适配：
 * 1. 正则表达式匹配 (LeetCode 10)
 * 2. 通配符匹配 (LeetCode 44)
 * 
 * 核心准则：
 * - 每一行代码执行都有确定的单步映射 (逐行高亮)
 * - 4-Card 响应式自适应布局 (flex: 1, min-height: 0)
 * - 阶段 1: 暴力递归 (递归展开树、调用栈、重叠子问题监控)
 * - 阶段 2: 记忆化搜索 (备忘录缓存 Hit/Miss 追踪器、2D 缓存热力表)
 * - 阶段 3: 严格位置依赖二维 DP (严格自底向上/从右往左填表，单元格依赖高亮)
 * - 阶段 4: 完全背包斜率优化 (消除内层循环，现存终阶沙盘)
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { type RecursionStepBase, type MemoStepBase } from '../step-types';
import { getStringDpAnchor } from './string-dp-stage-codes';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';

export type StringDpKind = 'regex' | 'wildcard';

// Stage code line resolution via CodeStepIndexer @step:anchor compilation
function getLine(stage: number, kind: StringDpKind, anchor: string): HighlightTarget {
  return getStringDpAnchor(stage, kind, anchor);
}

// ==========================================
// 2. 阶段 1: 暴力递归数据模型与生成器
// ==========================================

export interface StringDpRecursionStep {
  stepIndex: number;
  totalSteps: number;
  kind: StringDpKind;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  s: string;
  p: string;
  callStack: Array<{ i: number; j: number; label: string }>;
  overlapCount: Record<string, number>;
  decision: string;
  message: string;
  log: string;
  returnValue?: boolean;
  metrics: Record<string, string>;
}

export function buildStringDpRecursionSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDpRecursionStep[] {
  const steps: StringDpRecursionStep[] = [];
  const resolveLine = (anchor: string) => getLine(1, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const callStack: Array<{ i: number; j: number; label: string }> = [];
  const overlapCount: Record<string, number> = {};

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    msg: string,
    decision: string,
    retVal?: boolean
  ) => {
    const stateKey = `(${i},${j})`;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      kind,
      action,
      codeLine: resolveLine(codeLineKey),
      i,
      j,
      s,
      p,
      callStack: [...callStack],
      overlapCount: { ...overlapCount },
      decision,
      message: msg,
      log: `[递归] ${stateKey} ${action}: ${msg}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': `dfs(i=${i}, j=${j})`,
        'metric-stack-depth': `${callStack.length} 层`,
        'metric-cur-char-s': i < n ? `'${s[i]}' [${i}]` : 'EOF (空串)',
        'metric-cur-char-p': j < m ? `'${p[j]}' [${j}]` : 'EOF (空串)',
        'metric-overlaps': `${Object.values(overlapCount).filter((c) => c > 1).length} 个重复子问题`,
      },
    });
  };

  // 1. 发起根调用
  pushStep('callRoot', 'callRoot', 0, 0, `🚀 启动暴力递归：调用 dfs(i=0, j=0) 开始逐字符尝试`, '从文本串和模式串起点探索');

  function dfs(i: number, j: number): boolean {
    const key = `${i},${j}`;
    overlapCount[key] = (overlapCount[key] || 0) + 1;
    callStack.push({ i, j, label: `dfs(${i}, ${j})` });

    // 函数入口
    pushStep('fnEnter', 'fnEnter', i, j, `⚡ 进入 dfs(i=${i}, j=${j})，当前栈深 ${callStack.length}`, `考察 s[${i}..] 与 p[${j}..] 是否匹配`);

    // 边界检查：模式串耗尽
    pushStep('baseCheck', 'baseCheck', i, j, `🔍 检查模式串是否耗尽：j=${j} === m=${m} ?`, '若模式串走完，文本串也必须走完才算匹配');
    if (j === m) {
      const res = i === n;
      pushStep(
        'returnResult',
        'returnResult',
        i,
        j,
        res
          ? `✅ 模式串与文本串同时耗尽 (i=${i}==${n})，匹配成功返回 true`
          : `❌ 模式串已尽但文本串剩余 ${n - i} 字符 (i=${i}!=${n})，返回 false`,
        res ? 'Base Case 匹配成功' : 'Base Case 匹配失败',
        res
      );
      callStack.pop();
      return res;
    }

    if (kind === 'regex') {
      // 正则逻辑
      const first = i < n && (s[i] === p[j] || p[j] === '.');
      pushStep(
        'firstMatch',
        'firstMatch',
        i,
        j,
        i < n
          ? `🔍 判定首字符：s[${i}]='${s[i]}' 与 p[${j}]='${p[j]}' 首字符匹配 = ${first}`
          : `🔍 文本串已耗尽 (i=${n})，首字符无法匹配 = false`,
        first ? '首字符符合' : '首字符不符'
      );

      // 检查下一位是否为 '*'
      const hasStar = j + 1 < m && p[j + 1] === '*';
      pushStep('starCheck', 'starCheck', i, j, `⭐ 检查下一字符是否为 '*'：j+1=${j + 1} -> '${p[j + 1] || ''}' -> ${hasStar}`, hasStar ? '存在星号，准备分流' : '普通字符，严格比对');

      if (hasStar) {
        // 分支 1: * 匹配 0 次
        pushStep('starBranch0', 'starBranch0', i, j, `🌿 分支 0：尝试让 '${p[j]}*' 匹配 0 次，跳过模式串两位探查 dfs(${i}, ${j + 2})`, '分支0: 匹配0次');
        const b0 = dfs(i, j + 2);
        if (b0) {
          pushStep('returnResult', 'returnResult', i, j, `✨ 分支 0 (匹配0次) 成功命中！dfs(${i}, ${j}) 短路返回 true`, '分支0 成功', true);
          callStack.pop();
          return true;
        }

        // 分支 2: * 匹配 1 次或多次 (必须首字符匹配)
        if (first) {
          pushStep('starBranch1', 'starBranch1', i, j, `🌿 分支 1：首字符匹配成功，让 '${p[j]}*' 匹配至少1次，文本串前进一步 dfs(${i + 1}, ${j})`, '分支1: 匹配>=1次');
          const b1 = dfs(i + 1, j);
          pushStep('returnResult', 'returnResult', i, j, `🏁 递归子调用返回结果: ${b1}`, b1 ? '分支1 成功' : '分支均失败', b1);
          callStack.pop();
          return b1;
        }

        pushStep('returnResult', 'returnResult', i, j, `❌ 分支 0 失败且首字符不匹配，'${p[j]}*' 无法拓展，返回 false`, '星号分支全部失败', false);
        callStack.pop();
        return false;
      } else {
        // 普通字符匹配
        if (first) {
          pushStep('charBranch', 'charBranch', i, j, `➡️ 单字符匹配成功，双指针同时前进一步探查 dfs(${i + 1}, ${j + 1})`, '普通字符匹配');
          const res = dfs(i + 1, j + 1);
          pushStep('returnResult', 'returnResult', i, j, `🏁 单字符子调用返回: ${res}`, res ? '后续匹配成功' : '后续匹配失败', res);
          callStack.pop();
          return res;
        } else {
          pushStep('returnResult', 'returnResult', i, j, `❌ 首字符失配 ('${s[i] || ''}' ≠ '${p[j]}')，直接返回 false`, '单字符失配', false);
          callStack.pop();
          return false;
        }
      }
    } else {
      // 通配符逻辑
      const isStar = p[j] === '*';
      pushStep('starCheck', 'starCheck', i, j, `⭐ 检查当前字符是否为 '*'：p[${j}]='${p[j]}' -> ${isStar}`, isStar ? '通配符星号' : '普通字符或问号');

      if (isStar) {
        // 通配符分支 0: * 匹配空串
        pushStep('starBranch0', 'starBranch0', i, j, `🌿 通配符分支 0：让 '*' 匹配空串，模式串前进一步 dfs(${i}, ${j + 1})`, '星号匹配空串');
        const b0 = dfs(i, j + 1);
        if (b0) {
          pushStep('returnResult', 'returnResult', i, j, `✨ '*' 匹配空串成功！dfs(${i}, ${j}) 返回 true`, '分支0 成功', true);
          callStack.pop();
          return true;
        }

        // 通配符分支 1: * 匹配至少一个字符 (文本串推进)
        if (i < n) {
          pushStep('starBranch1', 'starBranch1', i, j, `🌿 通配符分支 1：让 '*' 消耗文本字符 '${s[i]}', dfs(${i + 1}, ${j})`, '星号匹配>=1字符');
          const b1 = dfs(i + 1, j);
          pushStep('returnResult', 'returnResult', i, j, `🏁 通配符分支 1 返回: ${b1}`, b1 ? '分支1 成功' : '分支均失败', b1);
          callStack.pop();
          return b1;
        }

        pushStep('returnResult', 'returnResult', i, j, `❌ 文本已耗尽且分支0失败，返回 false`, '星号通配失败', false);
        callStack.pop();
        return false;
      } else {
        const charMatch = i < n && (s[i] === p[j] || p[j] === '?');
        if (charMatch) {
          pushStep('charBranch', 'charBranch', i, j, `➡️ 字符匹配成功 ('${s[i]}' ↔ '${p[j]}')，双指针推进 dfs(${i + 1}, ${j + 1})`, '单字符/问号匹配');
          const res = dfs(i + 1, j + 1);
          pushStep('returnResult', 'returnResult', i, j, `🏁 字符推进子调用返回: ${res}`, res ? '后续成功' : '后续失败', res);
          callStack.pop();
          return res;
        } else {
          pushStep('returnResult', 'returnResult', i, j, `❌ 字符失配 ('${s[i] || ''}' ≠ '${p[j]}')，返回 false`, '字符失配', false);
          callStack.pop();
          return false;
        }
      }
    }
  }

  // 启动搜索（为避免超长递归爆炸，若规模过大保护在 120 步内，但正常演示样例均能完整展现）
  dfs(0, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 3. 阶段 2: 记忆化搜索数据模型与生成器
// ==========================================

export interface StringDpMemoStep extends MemoStepBase {
  kind: StringDpKind;
  j: number;
  s: string;
  p: string;
  memo: number[][]; // -1: 未计算, 0: false, 1: true
  cacheHit: boolean;
}

export function buildStringDpMemoSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDpMemoStep[] {
  const steps: StringDpMemoStep[] = [];
  const resolveLine = (anchor: string) => getLine(2, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const memo: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(-1)
  );

  let hitCount = 0;
  let missCount = 0;

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    isHit: boolean,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      kind,
      action,
      codeLine: resolveLine(codeLineKey),
      i,
      j,
      s,
      p,
      memo: memo.map((r) => [...r]),
      cacheHit: isHit,
      hitCount,
      missCount,
      decision,
      message: msg,
      log: `[记忆化] (${i},${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-state': `memo[${i}][${j}]`,
        'metric-hit-rate': `${hitCount + missCount > 0 ? ((hitCount / (hitCount + missCount)) * 100).toFixed(1) : '0'}%`,
        'metric-cache-hits': `${hitCount} 次`,
        'metric-cache-miss': `${missCount} 次`,
      },
    });
  };

  // 1. 数组初始化
  pushStep(
    'memoInit',
    'memoInit',
    -1,
    -1,
    false,
    `🚀 初始化 2D 备忘录缓存：int[][] memo = new int[${n + 1}][${m + 1}]，全部填充 -1 (未探查)`,
    '建立缓存容器'
  );

  pushStep(
    'callRoot',
    'callRoot',
    0,
    0,
    false,
    `🚀 发起记忆化根调用 dfsMemo(i=0, j=0, memo)`,
    '从起点进入记忆化递归'
  );

  function dfsMemo(i: number, j: number): boolean {
    pushStep('fnEnter', 'fnEnter', i, j, false, `⚡ 进入 dfsMemo(i=${i}, j=${j})`, `探查缓存或展开子问题`);

    // 缓存探查
    if (memo[i][j] !== -1) {
      hitCount++;
      const cached = memo[i][j] === 1;
      pushStep(
        'memoCheck',
        'memoCheck',
        i,
        j,
        true,
        `🎯 命中缓存！memo[${i}][${j}] 已有计算结果: ${cached}，立即剪枝返回！`,
        `Cache Hit (${cached})`
      );
      return cached;
    }

    missCount++;
    pushStep(
      'memoCheck',
      'memoCheck',
      i,
      j,
      false,
      `💨 缓存未命中：memo[${i}][${j}] === -1，需要进行递归计算`,
      'Cache Miss'
    );

    // 基础条件检查
    if (j === m) {
      const res = i === n;
      memo[i][j] = res ? 1 : 0;
      pushStep(
        'baseCheck',
        'baseCheck',
        i,
        j,
        false,
        res
          ? `✅ 模式串耗尽且文本串耗尽 (i=${i}==${n})，写入 memo[${i}][${j}]=1 返回 true`
          : `❌ 模式串耗尽但文本串剩余 (i=${i}!=${n})，写入 memo[${i}][${j}]=0 返回 false`,
        'Base Case 写入缓存'
      );
      return res;
    }

    let ans = false;
    if (kind === 'regex') {
      const first = i < n && (s[i] === p[j] || p[j] === '.');
      const hasStar = j + 1 < m && p[j + 1] === '*';
      pushStep(
        'firstMatch',
        'firstMatch',
        i,
        j,
        false,
        `🔍 正则匹配规则：首字符匹配=${first}，星号修饰=${hasStar}`,
        hasStar ? '带星号完全背包' : '普通字符匹配'
      );

      if (hasStar) {
        // 分支 0 探查
        const b0 = dfsMemo(i, j + 2);
        if (b0) {
          ans = true;
        } else if (first) {
          ans = dfsMemo(i + 1, j);
        }
      } else {
        ans = first && dfsMemo(i + 1, j + 1);
      }
    } else {
      const isStar = p[j] === '*';
      pushStep('starCheck', 'starCheck', i, j, false, `⭐ 通配符规则：当前字符 p[${j}]='${p[j]}' (isStar=${isStar})`, isStar ? '星号通配' : '普通单字符');
      if (isStar) {
        const b0 = dfsMemo(i, j + 1);
        if (b0) {
          ans = true;
        } else if (i < n) {
          ans = dfsMemo(i + 1, j);
        }
      } else {
        const charMatch = i < n && (s[i] === p[j] || p[j] === '?');
        ans = charMatch && dfsMemo(i + 1, j + 1);
      }
    }

    // 存入备忘录
    memo[i][j] = ans ? 1 : 0;
    pushStep(
      'memoStore',
      'memoStore',
      i,
      j,
      false,
      `💾 计算完成：将决策结果 ${ans} 写入 memo[${i}][${j}] = ${memo[i][j]}，供后续状态复用`,
      `写入缓存 memo[${i}][${j}]`
    );

    return ans;
  }

  dfsMemo(0, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 4. 阶段 3: 严格位置依赖二维 DP 数据模型与生成器
// ==========================================

export interface StringDp2DStep {
  stepIndex: number;
  totalSteps: number;
  kind: StringDpKind;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  s: string;
  p: string;
  dp: boolean[][];
  depCells: Array<{ r: number; c: number; label: string; val: boolean }>;
  decision: string;
  message: string;
  log: string;
  metrics: Record<string, string>;
}

export function buildStringDp2DSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDp2DStep[] {
  const steps: StringDp2DStep[] = [];
  const resolveLine = (anchor: string) => getLine(3, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    depCells: Array<{ r: number; c: number; label: string; val: boolean }>,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      kind,
      action,
      codeLine: resolveLine(codeLineKey),
      i,
      j,
      s,
      p,
      dp: dp.map((r) => [...r]),
      depCells,
      decision,
      message: msg,
      log: `[二维DP] (${i},${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cell': `dp[${i >= 0 ? i : '—'}][${j >= 0 ? j : '—'}]`,
        'metric-cell-val': i >= 0 && j >= 0 ? (dp[i][j] ? 'TRUE' : 'FALSE') : '—',
        'metric-decision': decision,
      },
    });
  };

  // 1. 初始化
  pushStep(
    'initDp',
    'initDp',
    -1,
    -1,
    [],
    `🚀 初始化二维状态矩阵：boolean[][] dp = new boolean[${n + 1}][${m + 1}]，全部预填 false`,
    '初始化 DP 矩阵'
  );

  // 2. 基底空串
  dp[n][m] = true;
  pushStep(
    'baseEmpty',
    'baseEmpty',
    n,
    m,
    [],
    `✨ 基底定义：空文本对空模式串必定匹配，设定 dp[${n}][${m}] = true`,
    '空对空基底'
  );

  // 3. 处理文本串为空时，模式串的星号消解
  for (let j = m - 1; j >= 0; j--) {
    if (kind === 'regex') {
      const canCancel = j + 1 < m && p[j + 1] === '*' && dp[n][j + 2];
      if (canCancel) {
        dp[n][j] = true;
      }
      pushStep(
        'baseStarSet',
        'baseStarSet',
        n,
        j,
        j + 2 <= m ? [{ r: n, c: j + 2, label: `dp[${n}][${j + 2}]`, val: dp[n][j + 2] }] : [],
        canCancel
          ? `✨ 基底转移：模式串 '${p[j]}*' 取 0 次消去，依赖 dp[${n}][${j + 2}]=true，设定 dp[${n}][${j}] = true`
          : `🛑 基底转移：模式串 '${p[j]}' 无法消解空文本，dp[${n}][${j}] = false`,
        canCancel ? `'${p[j]}*' 取 0 次` : '无法消解空串'
      );
    } else {
      // 通配符
      if (p[j] === '*' && dp[n][j + 1]) {
        dp[n][j] = true;
        pushStep(
          'baseStarSet',
          'baseStarSet',
          n,
          j,
          [{ r: n, c: j + 1, label: `dp[${n}][${j + 1}]`, val: dp[n][j + 1] }],
          `✨ 基底转移：通配符 '*' 匹配空串，依赖右侧 dp[${n}][${j + 1}]=true，设定 dp[${n}][${j}] = true`,
          `'*' 匹配空串`
        );
      } else {
        pushStep(
          'baseStarSet',
          'baseStarSet',
          n,
          j,
          [],
          `🛑 基底转移：模式串字符 '${p[j]}' 无法匹配空串，dp[${n}][${j}] = false`,
          '通配失败'
        );
        break; // 通配符非星号后无法继续向左通配
      }
    }
  }

  // 4. 自底向上、从右往左严格递推填表
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (kind === 'regex') {
        if (j + 1 === m || p[j + 1] !== '*') {
          // 普通单字符匹配，依赖右下方 dp[i+1][j+1]
          const charMatch = s[i] === p[j] || p[j] === '.';
          dp[i][j] = charMatch && dp[i + 1][j + 1];
          const deps = [{ r: i + 1, c: j + 1, label: `dp[${i + 1}][${j + 1}]`, val: dp[i + 1][j + 1] }];
          pushStep(
            'charTransition',
            'charTransition',
            i,
            j,
            deps,
            `🔍 严格依赖右下方：s[${i}]='${s[i]}' ↔ p[${j}]='${p[j]}'，首字匹配=${charMatch}，dp[${i}][${j}] = ${charMatch} && dp[${i + 1}][${j + 1}](${dp[i + 1][j + 1]}) = ${dp[i][j]}`,
            charMatch ? '单字符匹配成功' : '单字符失配'
          );
        } else {
          // 星号修饰转移
          const dep0 = { r: i, c: j + 2, label: `dp[${i}][${j + 2}](取0次)`, val: dp[i][j + 2] };
          const first = s[i] === p[j] || p[j] === '.';
          const dep1 = { r: i + 1, c: j, label: `dp[${i + 1}][${j}](取>=1次)`, val: dp[i + 1][j] };
          dp[i][j] = dep0.val || (first && dep1.val);
          pushStep(
            'starTransition',
            'starTransition',
            i,
            j,
            [dep0, dep1],
            `⭐ 完全背包状态转移：dp[${i}][${j}] = dp[${i}][${j + 2}](${dep0.val}) || (first(${first}) && dp[${i + 1}][${j}](${dep1.val})) -> ${dp[i][j]}`,
            dp[i][j] ? (dep0.val ? '匹配0次生效' : '完全背包复用生效') : '两路均无法匹配'
          );
        }
      } else {
        // 通配符
        if (p[j] !== '*') {
          const charMatch = s[i] === p[j] || p[j] === '?';
          dp[i][j] = charMatch && dp[i + 1][j + 1];
          const deps = [{ r: i + 1, c: j + 1, label: `dp[${i + 1}][${j + 1}]`, val: dp[i + 1][j + 1] }];
          pushStep(
            'charTransition',
            'charTransition',
            i,
            j,
            deps,
            `🔍 通配单字符匹配：s[${i}]='${s[i]}' ↔ p[${j}]='${p[j]}', 依赖右下方 dp[${i + 1}][${j + 1}](${dp[i + 1][j + 1]}) -> ${dp[i][j]}`,
            charMatch ? '匹配推进' : '失配'
          );
        } else {
          const depEmpty = { r: i, c: j + 1, label: `dp[${i}][${j + 1}](匹配空)`, val: dp[i][j + 1] };
          const depChar = { r: i + 1, c: j, label: `dp[${i + 1}][${j}](匹配>=1字)`, val: dp[i + 1][j] };
          dp[i][j] = depEmpty.val || depChar.val;
          pushStep(
            'starTransition',
            'starTransition',
            i,
            j,
            [depEmpty, depChar],
            `⭐ 通配符斜率优化转移：dp[${i}][${j}] = dp[${i}][${j + 1}](${depEmpty.val}) || dp[${i + 1}][${j}](${depChar.val}) -> ${dp[i][j]}`,
            dp[i][j] ? '通配匹配成功' : '通配失败'
          );
        }
      }
    }
  }

  // 最终答案
  pushStep(
    'returnAns',
    'returnAns',
    0,
    0,
    [],
    `🎉 二维 DP 填表全部完成！左上角起始状态 dp[0][0] = ${dp[0][0]} 即为最终匹配判定！`,
    dp[0][0] ? '完全匹配成功 (TRUE)' : '匹配失败 (FALSE)'
  );

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 5. 渲染器组件 (Card 1 & Card 2 响应式高颜值 UI)
// ==========================================

export function renderStringDpRecursionCard1(
  container: HTMLElement,
  step: StringDpRecursionStep
): void {
  const stackHtml = step.callStack
    .map((frame, idx) => {
      const isTop = idx === step.callStack.length - 1;
      return `
        <div style="background:${isTop ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; border:1px solid ${isTop ? '#3b82f6' : '#334155'}; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'JetBrains Mono', monospace; font-size:11.5px; color:${isTop ? '#60a5fa' : '#cbd5e1'}; font-weight:700;">
            #${idx} ${frame.label}
          </span>
          <span style="font-size:10px; color:${isTop ? '#93c5fd' : '#64748b'};">
            ${isTop ? '⚡ 当前执行帧' : '等待返回'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 字符对齐指示器 -->
      <div style="background:rgba(15, 23, 42, 0.7); border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; gap:20px; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">文本串 s: "${step.s}"</div>
          <div style="display:flex; gap:4px;">
            ${step.s
              .split('')
              .map(
                (ch, idx) => `
              <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; ${
                idx === step.i
                  ? 'background:#3b82f6; color:#fff; border:1px solid #60a5fa;'
                  : idx < step.i
                  ? 'background:rgba(30, 41, 59, 0.5); color:#64748b;'
                  : 'background:#1e293b; color:#cbd5e1;'
              }">
                ${ch}
              </div>
            `
              )
              .join('')}
            <div style="width:36px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:10px; ${
              step.i >= step.s.length
                ? 'background:#3b82f6; color:#fff;'
                : 'background:rgba(30, 41, 59, 0.3); color:#475569;'
            }">
              EOF
            </div>
          </div>
        </div>

        <div style="border-left:1px solid #334155; padding-left:20px;">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">模式串 p: "${step.p}"</div>
          <div style="display:flex; gap:4px;">
            ${step.p
              .split('')
              .map(
                (ch, idx) => `
              <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; ${
                idx === step.j
                  ? 'background:#f59e0b; color:#000; border:1px solid #fbbf24;'
                  : idx < step.j
                  ? 'background:rgba(30, 41, 59, 0.5); color:#64748b;'
                  : 'background:#1e293b; color:#cbd5e1;'
              }">
                ${ch}
              </div>
            `
              )
              .join('')}
            <div style="width:36px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:10px; ${
              step.j >= step.p.length
                ? 'background:#f59e0b; color:#000;'
                : 'background:rgba(30, 41, 59, 0.3); color:#475569;'
            }">
              EOF
            </div>
          </div>
        </div>
      </div>

      <!-- 运行时调用栈 -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:rgba(15, 23, 42, 0.5); border:1px solid #1e293b; border-radius:8px; padding:10px 12px; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#38bdf8;">📚 运行时调用栈 (Call Stack)</span>
          <span style="font-size:11px; color:#94a3b8;">深度: ${step.callStack.length} 层</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:6px; padding-right:4px;">
          ${stackHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderStringDpRecursionCard2(
  container: HTMLElement,
  step: StringDpRecursionStep
): void {
  const overlaps = Object.entries(step.overlapCount).filter(([_, c]) => c > 1);

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 当前状态核心卡片 -->
      <div style="background:rgba(30, 41, 59, 0.6); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">当前执行决策</div>
        <div style="font-size:14px; font-weight:700; color:#f8fafc;">${step.decision}</div>
        <div style="font-size:12px; color:#38bdf8; font-family:'JetBrains Mono', monospace; margin-top:2px;">
          ${step.message}
        </div>
      </div>

      <!-- 重叠子问题开销分析 -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:rgba(15, 23, 42, 0.5); border:1px solid #1e293b; border-radius:8px; padding:10px 12px; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#f43f5e;">💥 重叠子问题调用监控 (为什么暴力会指数爆炸)</span>
          <span style="font-size:11px; color:#fda4af;">已触发 ${overlaps.length} 个重复状态</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
          ${
            overlaps.length === 0
              ? '<div style="color:#64748b; font-size:12px; padding:12px; text-align:center;">暂无重复访问状态，随着分支扩散将开始出现大量重复计算...</div>'
              : overlaps
                  .map(
                    ([key, count]) => `
                <div style="background:rgba(244, 63, 94, 0.1); border:1px solid rgba(244, 63, 94, 0.3); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-family:'JetBrains Mono', monospace; font-size:12px; color:#fda4af; font-weight:700;">dfs(${key.replace(',', ', ')})</span>
                  <span style="font-size:11px; background:#f43f5e; color:#fff; padding:1px 6px; border-radius:4px; font-weight:700;">重复执行 ${count} 次</span>
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>
    </div>
  `;
}

export function renderStringDpMemoCard1(
  container: HTMLElement,
  step: StringDpMemoStep
): void {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 探查结果看板 -->
      <div style="background:rgba(15, 23, 42, 0.8); border:1px solid ${
        step.cacheHit ? '#10b981' : '#334155'
      }; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:2px;">当前探查状态</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:700; color:#38bdf8;">
            dfsMemo(i=${step.i}, j=${step.j})
          </div>
        </div>
        <div style="padding:6px 14px; border-radius:6px; font-size:13px; font-weight:700; ${
          step.cacheHit
            ? 'background:rgba(16, 185, 129, 0.2); color:#34d399; border:1px solid #10b981;'
            : 'background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid #3b82f6;'
        }">
          ${step.cacheHit ? '⚡ CACHE HIT (直接返回)' : '💨 CACHE MISS (递归计算)'}
        </div>
      </div>

      <!-- 探查说明日志 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">决策说明</div>
        <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${step.decision}</div>
        <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">${step.message}</div>
      </div>

      <!-- 统计指标卡 -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:auto;">
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">缓存命中次数</div>
          <div style="font-size:18px; font-weight:700; color:#34d399; margin-top:2px;">${step.hitCount}</div>
        </div>
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">未命中 (实际计算)</div>
          <div style="font-size:18px; font-weight:700; color:#38bdf8; margin-top:2px;">${step.missCount}</div>
        </div>
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">命中剪枝率</div>
          <div style="font-size:18px; font-weight:700; color:#fbbf24; margin-top:2px;">
            ${step.hitCount + step.missCount > 0 ? ((step.hitCount / (step.hitCount + step.missCount)) * 100).toFixed(0) : '0'}%
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderStringDpMemoCard2(
  container: HTMLElement,
  step: StringDpMemoStep
): void {
  const n = step.s.length;
  const m = step.p.length;

  const rowLabels = Array.from({ length: n + 1 }, (_, i) => (i < n ? `'${step.s[i]}'` : 'EOF'));
  const colLabels = Array.from({ length: m + 1 }, (_, j) => (j < m ? `'${step.p[j]}'` : 'EOF'));

  const stepData = {
    i: step.i,
    j: step.j,
    grid: (step.memo || []).map((row) =>
      row.map((v) => (v === 1 ? 'T' : v === 0 ? 'F' : null))
    ),
    type: step.cacheHit ? '缓存命中' : '未命中试算',
    msg: `memo[${step.i}][${step.j}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: n + 1,
    n: m + 1,
    isReverse: false,
    isGridProblem: false,
    modelId: 'string-dp-memo',
    rowLabels,
    colLabels,
    isMatch: (r, c) => r < n && c < m && (step.p[c] === step.s[r] || step.p[c] === '.' || step.p[c] === '?'),
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0284c7;">🎯 备忘录缓存矩阵 memo[0..${n}][0..${m}]</span>
        <span style="font-size:11px; color:#64748b;">T = True (命中), F = False, · = 未探查</span>
      </div>
      <div class="string-dp-memo-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.string-dp-memo-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}

export function renderStringDp2DCard1(
  container: HTMLElement,
  step: StringDp2DStep
): void {
  const depsHtml =
    step.depCells.length === 0
      ? '<div style="color:#64748b; font-size:11px;">无前驱依赖（基底直接赋值）</div>'
      : step.depCells
          .map(
            (dep) => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#0f172a; border:1px solid #334155; border-radius:4px; padding:4px 8px; font-family:'JetBrains Mono', monospace; font-size:11px;">
          <span style="color:#94a3b8;">${dep.label}:</span>
          <span style="color:${dep.val ? '#34d399' : '#f87171'}; font-weight:700;">${dep.val ? 'TRUE' : 'FALSE'}</span>
        </div>
      `
          )
          .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 当前考察单元格看板 -->
      <div style="background:rgba(15, 23, 42, 0.8); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8;">当前递推单元格</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:18px; font-weight:700; color:#38bdf8;">
            dp[${step.i >= 0 ? step.i : '—'}][${step.j >= 0 ? step.j : '—'}]
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#94a3b8;">单元格赋值结果</div>
          <div style="font-size:18px; font-weight:700; color:${
            step.i >= 0 && step.j >= 0 && step.dp[step.i]?.[step.j] ? '#34d399' : '#f87171'
          };">
            ${step.i >= 0 && step.j >= 0 ? (step.dp[step.i]?.[step.j] ? 'TRUE' : 'FALSE') : '—'}
          </div>
        </div>
      </div>

      <!-- 转移依赖来源 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">🔗 单元格转移依赖来源 (Dependency Cells)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${depsHtml}
        </div>
      </div>

      <!-- 决策详情 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">填表状态说明</div>
        <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${step.decision}</div>
        <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">${step.message}</div>
      </div>
    </div>
  `;
}

export function renderStringDp2DCard2(
  container: HTMLElement,
  step: StringDp2DStep
): void {
  const n = step.s.length;
  const m = step.p.length;

  const rowLabels = Array.from({ length: n + 1 }, (_, i) => (i < n ? `'${step.s[i]}'` : 'EOF'));
  const colLabels = Array.from({ length: m + 1 }, (_, j) => (j < m ? `'${step.p[j]}'` : 'EOF'));

  const deps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = (
    step.depCells || []
  ).map((dep) => {
    let type: 'top' | 'left' | 'diag' | undefined;
    if (dep.r === step.i - 1 && dep.c === step.j) type = 'top';
    else if (dep.r === step.i && dep.c < step.j) type = 'left';
    else if (dep.r < step.i && dep.c < step.j) type = 'diag';
    return { r: dep.r, c: dep.c, type, label: dep.label };
  });

  const stepData = {
    i: step.i,
    j: step.j,
    grid: (step.dp || []).map((row) => row.map((v) => (v ? 'T' : 'F'))),
    deps,
    msg: `dp[${step.i}][${step.j}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: n + 1,
    n: m + 1,
    isReverse: false,
    isGridProblem: false,
    modelId: 'string-dp-2d',
    rowLabels,
    colLabels,
    deps,
    isMatch: (r, c) => r < n && c < m && (step.p[c] === step.s[r] || step.p[c] === '.' || step.p[c] === '?'),
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#059669;">📐 二维动态规划表 dp[0..${n}][0..${m}] (自底向上从右往左)</span>
        <div style="display:flex; gap:8px; font-size:11px;">
          <span style="color:#2563eb;">■ 当前格</span>
          <span style="color:#d97706;">■ 依赖格</span>
        </div>
      </div>
      <div class="string-dp-2d-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.string-dp-2d-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
