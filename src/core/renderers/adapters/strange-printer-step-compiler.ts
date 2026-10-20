/**
 * 奇怪的打印机 (Strange Printer, LC 664 / 左程云 85 课)
 * 核心：字符染色区间 DP——若 s[i]==s[j] 顺带覆盖 dp[i][j]=dp[i][j-1]，否则枚举分割点 k 取 min(dp[i][k]+dp[k+1][j])
 * 四阶段全演化推演编译器 (Stage 1-4, forward/reverse 双向支持)
 */

import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

export interface StrangePrinterStepParams {
  s?: string;
  stage?: number;
  direction?: string;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  params?: Record<string, any>;
}

export function parseStrangePrinterInputs(inputs: Record<string, any>): { s: string } {
  const raw = inputs?.s ?? inputs?.['input-s'] ?? inputs?.str ?? 'aaabbb';
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return { s: raw.trim() };
  }
  return { s: 'aaabbb' };
}

export function buildStrangePrinterSteps(params: StrangePrinterStepParams): UniversalStep[] {
  const rawParams = params.params || {};
  const parsed = parseStrangePrinterInputs(rawParams.s !== undefined ? rawParams : params);
  const s = parsed.s && parsed.s.length > 0 ? parsed.s : 'aaabbb';
  const n = s.length;
  const stage = params.stage ?? 3;
  const isMemo = Boolean(params.isMemo || stage === 2);
  const isReverse = params.direction === 'reverse';
  const anchorMap = params.anchorMap || {};

  // 1-based 行号兜底映射
  const lineEntry = anchorMap.entry || 2;
  const lineInitN = anchorMap.init_n || 3;
  const lineGuardLess = anchorMap.guard_less || 4;
  const lineReturn = anchorMap.return || (stage === 1 ? 5 : (stage === 2 ? 15 : 18));
  const lineDfsEntry = anchorMap.dfs_entry || 7;
  const lineGuardEmpty = anchorMap.guard_empty || 8;
  const lineBoundary = anchorMap.boundary || 9;
  const lineCacheHit = anchorMap.cache_hit || 10;
  const lineCondSame = anchorMap.cond_same || (stage <= 2 ? 11 : 9);
  const lineTransferSame = anchorMap.transfer_same || (stage <= 2 ? 12 : 10);
  const lineInitMin = anchorMap.init_min || (stage <= 2 ? 14 : 12);
  const lineLoopK = anchorMap.loop_k || (stage <= 2 ? 15 : 13);
  const lineCalcTurns = anchorMap.calc_turns || (stage <= 2 ? 16 : 14);
  const lineUpdateMin = anchorMap.update_min || (stage <= 2 ? 17 : 15);
  const lineTransferDiff = anchorMap.transfer_diff || (stage <= 2 ? 19 : 17);
  const lineInitDp = anchorMap.init_dp || 5;
  const lineInitBase = anchorMap.init_base || 6;
  const lineLoopLen = anchorMap.loop_len || 7;
  const lineLoopI = anchorMap.loop_i || 8;
  const lineCalcJ = anchorMap.calc_j || 9;

  const steps: UniversalStep[] = [];

  // ==========================================================================
  // Stage 1 & Stage 2: 递归与记忆化搜索演化 (分治树展开)
  // ==========================================================================
  if (stage === 1 || stage === 2) {
    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    for (let i = 0; i < n; i++) {
      memoGrid[i]![i] = 1;
    }

    const activeStack: Array<{ label: string; coord: string; depth: number }> = [];
    const memoCache: Record<string, number> = {};

    let nodeCounter = 1;
    const rootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: [],
    };

    const pushStep = (st: Partial<UniversalStep>) => {
      if (steps.length >= 180) return;
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(memoGrid),
        dp1d: s.split('').map((c) => c.charCodeAt(0)),
        memo: { ...memoCache },
        activeSlot: st.j ?? 0,
        treeRoot: cloneTree(rootNode),
        activeNodeId: st.activeNodeId || rootNode.id,
        callStack: [...activeStack],
        decision: st.decision || st.tag || '染色推导中',
        tag: st.tag || '',
        log: st.log || '',
        msg: st.msg || '',
        ...st,
      } as UniversalStep);
    };

    // Step 0: 函数入口帧
    pushStep({
      type: 'entry',
      flowPhase: 'forward',
      line: lineEntry,
      tag: `strangePrinter(s) 目标串="${s}" (长度 n=${n})`,
      log: `🎯 进入 strangePrinter：目标字符串 s="${s}"`,
      msg: `主函数入口：目标字符串为 <code>"${s}"</code>（长度 <code>${n}</code>）。每次只能打印由同种字符构成的连续子串，但可以覆盖之前打印过的字符。`,
      decision: '进入主函数',
    });

    // Step 1: 长度特判
    if (n <= 1) {
      pushStep({
        type: 'return',
        flowPhase: 'backtrack',
        line: lineGuardLess,
        tag: `字符串长度 n=${n} <= 1，直接返回 ${n}`,
        log: `| 长度 <= 1，最少打印次数 = ${n}`,
        msg: `长度特判：<code>n = ${n}</code>，最少打印次数为 <strong>${n}</strong>。`,
        decision: `返回 ${n}`,
      });
      return steps;
    }

    // Step 2: 备忘录 / 发起顶层递归
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: stage === 2 ? lineInitDp : lineReturn,
      tag: stage === 2 ? `创建备忘录 memo[${n}][${n}]` : `发起顶层递归 dfs(0, ${n - 1})`,
      log:
        stage === 2
          ? `| 📋 初始化上三角记忆化矩阵 memo[${n}][${n}]`
          : `| 🚀 发起顶层递归调用 dfs(0, ${n - 1})`,
      msg:
        stage === 2
          ? `分配上三角记忆化矩阵 <code>memo = new int[${n}][${n}]</code>，消除重叠子串的重复染色推导。`
          : `发起顶层递归调用 <code>dfs(0, ${n - 1})</code> 求解打印整个字符串的最少次数。`,
      decision: stage === 2 ? '初始化备忘录' : '发起递归',
    });

    function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number): number {
      const callLabel = `dfs(${i}, ${j})`;
      activeStack.push({ label: callLabel, coord: `${i},${j}`, depth });

      pushStep({
        type: 'dfs_entry',
        flowPhase: 'forward',
        line: lineDfsEntry,
        i,
        j,
        activeNodeId: parentNode.id,
        tag: `进入帧 ${callLabel}`,
        log: `| 📥 进入递归帧 ${callLabel}：求解子串 s[${i}..${j}]="${s.slice(i, j + 1)}" 最少打印次数`,
        msg: `深入考察子串 <code>"${s.slice(i, j + 1)}"</code>（区间 <code>[${i}..${j}]</code>）。`,
        decision: `深入 [${i}..${j}]`,
      });

      // 边界特判：空串
      if (i > j) {
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineGuardEmpty,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `边界: i > j 空区间 ➔ 0`,
          log: `| 🎯 边界基底：空子串打印次数为 0`,
          msg: `空子串无须打印，返回 <code>0</code>。`,
          decision: '基底返回 0',
        });
        parentNode.status = 'base';
        activeStack.pop();
        return 0;
      }

      // 单字符基底
      if (i === j) {
        memoGrid[i]![i] = 1;
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineBoundary,
          i,
          j: i,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j: i },
          tag: `单字符基底: s[${i}]='${s[i]}' ➔ 1`,
          log: `| 🎯 单字符基底：单个字符 '${s[i]}' 只需 1 次打印`,
          msg: `单字符 <code>'${s[i]}'</code> 独立打印 1 次，<code>dp[${i}][${i}] = 1</code>。`,
          decision: '基底返回 1',
        });
        parentNode.status = 'base';
        activeStack.pop();
        return 1;
      }

      // 记忆化命中（仅 Stage 2）
      if (isMemo && memoGrid[i]![j] !== null && memoGrid[i]![j]! > 0) {
        const cached = memoGrid[i]![j]!;
        pushStep({
          type: 'cache_hit',
          flowPhase: 'backtrack',
          line: lineCacheHit,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `⚡ 缓存命中: memo[${i}][${j}] = ${cached}`,
          log: `| ⚡ 命中备忘录缓存：子串 s[${i}..${j}] 已求解过，直接返回 ${cached}`,
          msg: `命中记忆化缓存：子串 <code>"${s.slice(i, j + 1)}"</code> 最少打印次数 <strong>${cached}</strong>。`,
          decision: `复用缓存 ${cached}`,
        });
        parentNode.status = 'computed';
        activeStack.pop();
        return cached;
      }

      const charI = s[i]!;
      const charJ = s[j]!;

      // 关键染色优化：首尾字符相同直接顺带覆盖！
      if (charI === charJ) {
        pushStep({
          type: 'condition',
          flowPhase: 'forward',
          line: lineCondSame,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `首尾相同: s[${i}] == s[${j}] == '${charI}'`,
          log: `| ✨ 首尾字符相同：s[${i}] == s[${j}] == '${charI}'，打印左端时可一次刷到右端！`,
          msg: `首尾字符相同：打印首字符 <code>'${charI}'</code> 时直接涂刷覆盖到尾端，无需额外打印，直接归约至 <code>dfs(${i}, ${j - 1})</code>。`,
          decision: `顺带覆盖 s[${j}]`,
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: i,
          c: j - 1,
          val: `dfs(${i}, ${j - 1})`,
          status: 'current',
          children: [],
        };
        parentNode.children.push(childNode);

        const subTurns = dfs(i, j - 1, childNode, depth + 1);
        memoGrid[i]![j] = subTurns;
        memoCache[`${i},${j}`] = subTurns;

        pushStep({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransferSame,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          deps: [{ r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${subTurns}` }],
          tag: `覆盖归约完成: dp[${i}][${j}] = dp[${i}][${j - 1}] = ${subTurns}`,
          log: `| ✨ 首尾相同归约完成：dp[${i}][${j}] = ${subTurns}`,
          msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 顺带覆盖成功，最少打印次数 <code>dp[${i}][${j}] = <strong>${subTurns}</strong></code>。`,
          decision: `完成覆盖归约 ${subTurns}`,
        });

        parentNode.status = 'computed';
        activeStack.pop();
        return subTurns;
      }

      // 首尾相异：枚举中间分割点 k
      pushStep({
        type: 'condition',
        flowPhase: 'forward',
        line: lineInitMin,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        tag: `首尾相异: s[${i}]('${charI}') != s[${j}]('${charJ}')，枚举分割点 k`,
        log: `| 🔀 首尾相异：枚举分割点 k ∈ [${i}..${j - 1}] 分段独立打印`,
        msg: `两端字符相异：尝试所有可能的分割点 <code>k</code>，分段独立打印并取总和最小值。`,
        decision: '枚举分割点 k',
      });

      let minTurns = Infinity;
      let bestK = -1;

      for (let k = i; k < j; k++) {
        const leftNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: i,
          c: k,
          val: `dfs(${i}, ${k})`,
          status: 'current',
          children: [],
        };
        const rightNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: k + 1,
          c: j,
          val: `dfs(${k + 1}, ${j})`,
          status: 'current',
          children: [],
        };
        parentNode.children.push(leftNode, rightNode);

        pushStep({
          type: 'loop_k',
          flowPhase: 'forward',
          line: lineLoopK,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `枚举切分点 k=${k} ("${s.slice(i, k + 1)}" | "${s.slice(k + 1, j + 1)}")`,
          log: `|   尝试切分点 k=${k}：分割为 s[${i}..${k}] 与 s[${k + 1}..${j}]`,
          msg: `在 <code>k = ${k}</code> 处切分：左半段 <code>"${s.slice(i, k + 1)}"</code>，右半段 <code>"${s.slice(k + 1, j + 1)}"</code>。`,
          decision: `切分 k=${k}`,
        });

        const leftTurns = dfs(i, k, leftNode, depth + 1);
        const rightTurns = dfs(k + 1, j, rightNode, depth + 1);
        const total = leftTurns + rightTurns;

        pushStep({
          type: 'calc',
          flowPhase: 'backtrack',
          line: lineCalcTurns,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `k=${k} 得分: ${leftTurns} + ${rightTurns} = ${total}`,
          log: `|   k=${k} 计算：左段 ${leftTurns} + 右段 ${rightTurns} = ${total}`,
          msg: `分割点 <code>k = ${k}</code> 计算结果：左段需 <code>${leftTurns}</code> 次，右段需 <code>${rightTurns}</code> 次，合计 <strong>${total}</strong> 次。`,
          decision: `合计 ${total}`,
        });

        if (total < minTurns) {
          minTurns = total;
          bestK = k;
          pushStep({
            type: 'calc',
            flowPhase: 'backtrack',
            line: lineUpdateMin,
            i,
            j,
            activeNodeId: parentNode.id,
            tag: `⚡ 更新最优: k=${bestK} ➔ minTurns = ${minTurns}`,
            log: `|   ⚡ 刷新最少次数：k=${bestK} 达到当前最优 ${minTurns} 次`,
            msg: `更新当前最优方案：在 <code>k = ${bestK}</code> 处分割仅需 <strong>${minTurns}</strong> 次打印。`,
            decision: `最优 ${minTurns}`,
          });
        }
      }

      memoGrid[i]![j] = minTurns;
      memoCache[`${i},${j}`] = minTurns;

      pushStep({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransferDiff,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        deps: bestK !== -1 ? [
          { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${memoGrid[i]![bestK]}` },
          { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${memoGrid[bestK + 1]![j]}` },
        ] : [],
        tag: `最优切分完成: dp[${i}][${j}] = ${minTurns} (最优 k=${bestK})`,
        log: `| 🔀 最优切分归约：dp[${i}][${j}] = ${minTurns}`,
        msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 决策完成：在 <code>k = ${bestK}</code> 切分最优，总最少打印次数 <strong>${minTurns}</strong>。`,
        decision: `完成决策 ${minTurns}`,
      });

      parentNode.status = 'computed';
      activeStack.pop();
      return minTurns;
    }

    const finalAns = dfs(0, n - 1, rootNode, 0);

    const returnLine = typeof lineReturn === 'number' && lineReturn >= 1 ? lineReturn : lineEntry;
    steps.push({
      type: 'return',
      stage,
      line: returnLine,
      codeLine: returnLine,
      flowPhase: 'backtrack',
      i: 0,
      j: n - 1,
      grid: snapshotGrid2D(memoGrid),
      dp1d: s.split('').map((c) => c.charCodeAt(0)),
      memo: { ...memoCache },
      activeSlot: n - 1,
      treeRoot: cloneTree(rootNode),
      activeNodeId: rootNode.id,
      callStack: [],
      gridHighlight: { i: 0, j: n - 1 },
      decision: `最终返回 ${finalAns}`,
      tag: `🎯 全局收敛: 最少打印次数 = ${finalAns}`,
      log: `🏁 全局求解完成！打印 "${s}" 最少需 ${finalAns} 次操作`,
      msg: `全局递归推导收敛：打印目标字符串 <code>"${s}"</code> 最少需要 <strong>${finalAns}</strong> 次涂色操作。`,
    } as UniversalStep);

    return steps;
  }

  // ==========================================================================
  // Stage 3: 二维动态规划递推 (自底向上按区间长度填表)
  // ==========================================================================
  if (stage === 3) {
    const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

    const pushStep = (st: Partial<UniversalStep>) => {
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage: 3,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(grid),
        dp1d: s.split('').map((c) => c.charCodeAt(0)),
        memo: {},
        activeSlot: st.j ?? 0,
        decision: st.decision || st.tag || '填表推进',
        tag: st.tag || '',
        log: st.log || '',
        msg: st.msg || '',
        ...st,
      } as UniversalStep);
    };

    // Step 0: 函数入口
    pushStep({
      type: 'entry',
      flowPhase: 'forward',
      line: lineEntry,
      tag: `strangePrinter(s) 目标串="${s}" (长度 n=${n})`,
      log: `🎯 进入 strangePrinter：字符串 s="${s}"`,
      msg: `主函数入口：目标字符串为 <code>"${s}"</code>（长度 <code>${n}</code>）。`,
      decision: '进入主函数',
    });

    // Step 1: 长度特判
    if (n <= 1) {
      pushStep({
        type: 'return',
        flowPhase: 'backtrack',
        line: lineGuardLess,
        tag: `字符串长度 n=${n} <= 1，直接返回 ${n}`,
        log: `| 长度 <= 1，最少打印次数 = ${n}`,
        msg: `长度特判：<code>n = ${n}</code>，最少打印次数为 <strong>${n}</strong>。`,
        decision: `返回 ${n}`,
      });
      return steps;
    }

    // Step 2: 分配 DP 表格
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: lineInitDp,
      i: 0,
      j: n - 1,
      tag: `分配 dp[${n}][${n}] 上三角矩阵`,
      log: `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示打印 s[i..j] 最少次数`,
      msg: `创建状态表 <code>dp = new int[${n}][${n}]</code>。`,
      decision: '分配DP表格',
    });

    // Step 3: 单字符基础边界初始化 (dp[i][i] = 1)
    for (let i = 0; i < n; i++) {
      grid[i]![i] = 1;
      pushStep({
        type: 'boundary',
        flowPhase: 'backtrack',
        line: lineInitBase,
        i,
        j: i,
        gridHighlight: { i, j: i },
        tag: `单字符基底: dp[${i}][${i}] = 1 ('${s[i]}')`,
        log: `| 🏁 单字符基底：s[${i}]='${s[i]}' 需 1 次打印`,
        msg: `初始化基底：单个字符 <code>s[${i}] = '${s[i]}'</code> 独立打印 1 次，<code>dp[${i}][${i}] = 1</code>。`,
        decision: `基底 dp[${i}][${i}]=1`,
      });
    }

    // Step 4: 按区间长度 len 从 2 到 n 递推
    for (let len = 2; len <= n; len++) {
      pushStep({
        type: 'loop_len',
        flowPhase: 'forward',
        line: lineLoopLen,
        i: 0,
        j: len - 1,
        tag: `--- 递推区间长度 len = ${len} ---`,
        log: `| 📏 推进区间跨度 len = ${len}`,
        msg: `外层递推推进：考察长度为 <code>len = ${len}</code> 的所有子串。`,
        decision: `递推跨度 len=${len}`,
      });

      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const charI = s[i]!;
        const charJ = s[j]!;

        pushStep({
          type: 'calc',
          flowPhase: 'forward',
          line: lineLoopI,
          i,
          j,
          tag: `子串 s[${i}..${j}] = "${s.slice(i, j + 1)}"`,
          log: `| 🔍 考察区间 [${i}..${j}]："${s.slice(i, j + 1)}"`,
          msg: `考察子串 <code>"${s.slice(i, j + 1)}"</code>：左端 <code>'${charI}'</code>，右端 <code>'${charJ}'</code>。`,
          decision: `考察 [${i}..${j}]`,
        });

        if (charI === charJ) {
          // 首尾字符相同：顺带覆盖
          const inherited = grid[i]![j - 1] ?? 1;
          grid[i]![j] = inherited;

          pushStep({
            type: 'transfer',
            flowPhase: 'backtrack',
            line: lineTransferSame,
            i,
            j,
            gridHighlight: { i, j },
            deps: [{ r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${inherited}` }],
            tag: `首尾相同 s[${i}]==s[${j}]('${charI}'): dp[${i}][${j}] = dp[${i}][${j - 1}] = ${inherited}`,
            log: `| ✨ 首尾字符相同 ('${charI}')：打印首字符时顺带覆盖到尾部，dp[${i}][${j}] = dp[${i}][${j - 1}] = ${inherited}`,
            msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 两端相同 <code>'${charI}' == '${charJ}'</code>：打印首端字符时可直接延伸打到底部，打印次数无需增加：<code>dp[${i}][${j}] = dp[${i}][${j - 1}] = <strong>${inherited}</strong></code>。`,
            decision: `顺带覆盖 ${inherited}`,
          });
        } else {
          // 首尾字符不同：枚举分割点 k ∈ [i, j-1]
          let minTurns = Infinity;
          let bestK = -1;

          for (let k = i; k < j; k++) {
            const leftTurns = grid[i]![k] ?? 1;
            const rightTurns = grid[k + 1]![j] ?? 1;
            const turns = leftTurns + rightTurns;

            pushStep({
              type: 'loop_k',
              flowPhase: 'forward',
              line: lineLoopK,
              i,
              j,
              gridHighlight: { i, j },
              deps: [
                { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftTurns}` },
                { r: k + 1, c: j, type: 'bottom' as any, label: `dp[${k + 1}][${j}]=${rightTurns}` },
              ],
              decision: `切分点 k=${k}`,
              tag: `子串 [${i}..${j}] 尝试切分点 k=${k}: "${s.slice(i, k + 1)}" + "${s.slice(k + 1, j + 1)}" ➔ 次数=${turns}`,
              log: `| 🔍 尝试分割点 k=${k}：左段 dp[${i}][${k}]=${leftTurns} + 右段 dp[${k + 1}][${j}]=${rightTurns} = ${turns}`,
              msg: `尝试在 <code>k = ${k}</code> 处切分：左半段 <code>"${s.slice(i, k + 1)}"</code> 需 <code>${leftTurns}</code> 次，右半段 <code>"${s.slice(k + 1, j + 1)}"</code> 需 <code>${rightTurns}</code> 次，总共 <strong>${turns}</strong> 次。`,
            });

            if (turns < minTurns) {
              minTurns = turns;
              bestK = k;

              pushStep({
                type: 'update_min',
                flowPhase: 'forward',
                line: lineUpdateMin,
                i,
                j,
                gridHighlight: { i, j },
                deps: [
                  { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftTurns}` },
                  { r: k + 1, c: j, type: 'bottom' as any, label: `dp[${k + 1}][${j}]=${rightTurns}` },
                ],
                decision: `更新最少次数 minTurns=${turns}`,
                tag: `更优切分：k=${k} 最少打印次数更新为 ${turns}`,
                log: `| ✨ 找到更优切分点 k=${k}：最少打印次数更新为 ${minTurns}`,
                msg: `更新最优切分：在 <code>k = ${k}</code> 处分段仅需 <strong>${turns}</strong> 次打印，刷新当前子串最少操作数。`,
              });
            }
          }

          grid[i]![j] = minTurns;

          pushStep({
            type: 'transfer',
            flowPhase: 'backtrack',
            line: lineTransferDiff,
            i,
            j,
            gridHighlight: { i, j },
            deps: bestK !== -1 ? [
              { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
              { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${grid[bestK + 1]![j]}` },
            ] : [],
            tag: `首尾不同 s[${i}]('${charI}')!=s[${j}]('${charJ}'): 最优分割 k=${bestK} ➔ ${minTurns}`,
            log: `| 🔀 首尾不同：在 k=${bestK} 分割为 "${s.slice(i, bestK + 1)}" 与 "${s.slice(bestK + 1, j + 1)}" ➔ dp[${i}][${j}] = ${grid[i]![bestK]}+${grid[bestK + 1]![j]} = ${minTurns}`,
            msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 首尾不同：在 <code>k = ${bestK}</code> 分割为两段独立打印最优，最少打印次数 <code>dp[${i}][${bestK}] + dp[${bestK + 1}][${j}] = <strong>${minTurns}</strong></code>。`,
            decision: `最优分割 k=${bestK} ➔ ${minTurns}`,
          });
        }
      }
    }

    const ans = grid[0]![n - 1] ?? 1;

    pushStep({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: 0,
      j: n - 1,
      gridHighlight: { i: 0, j: n - 1 },
      tag: `🏆 全局最优: dp[0][${n - 1}] = ${ans}`,
      log: `🏁 填表完成！打印目标字符串 "${s}" 最少需 ${ans} 次`,
      msg: `填表结束：目标状态 <code>dp[0][${n - 1}]</code> 收敛，打印完整字符串 <code>"${s}"</code> 所需的最少操作次数为 <strong>${ans}</strong>。`,
      decision: `全局最优 ${ans}`,
    });

    return steps;
  }

  // ==========================================================================
  // Stage 4: 对角线倒序填表拓扑演化 (或逆向回溯)
  // ==========================================================================
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  const pushStep = (st: Partial<UniversalStep>) => {
    const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
    steps.push({
      stage: 4,
      line,
      codeLine: line,
      flowPhase: st.flowPhase || (isReverse ? 'backtrack' : 'forward'),
      i: st.i ?? 0,
      j: st.j ?? 0,
      grid: snapshotGrid2D(grid),
      dp1d: s.split('').map((c) => c.charCodeAt(0)),
      memo: {},
      activeSlot: st.j ?? 0,
      decision: st.decision || st.tag || '拓扑演进',
      tag: st.tag || '',
      log: st.log || '',
      msg: st.msg || '',
      ...st,
    } as UniversalStep);
  };

  // Step 0: 函数入口
  pushStep({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    tag: isReverse ? `逆向回溯寻源: "${s}"` : `对角线倒序拓扑演化: "${s}"`,
    log: `🎯 进入 stage-4 拓扑演进：s="${s}"`,
    msg: isReverse
      ? `从全局最优解 <code>dp[0][${n - 1}]</code> 出发逆向分解打印机覆盖与分割链。`
      : `倒序固定左端点 <code>i</code> 从 <code>${n - 2}</code> 到 <code>0</code>，内层终点 <code>j</code> 从 <code>i+1</code> 到 <code>${n - 1}</code>，严格按拓扑序递推。`,
    decision: '进入Stage 4',
  });

  // Step 1: 初始化基底
  for (let i = 0; i < n; i++) {
    grid[i]![i] = 1;
  }
  pushStep({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitBase,
    i: 0,
    j: 0,
    tag: `初始化对角线基底 dp[i][i] = 1`,
    log: `| 🏁 初始化对角线单字符基底：全 1`,
    msg: `快速填充主对角线 <code>dp[i][i] = 1</code>。`,
    decision: '对角线初始化',
  });

  // Step 2: 倒序填表
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      const charI = s[i]!;
      const charJ = s[j]!;

      if (charI === charJ) {
        grid[i]![j] = grid[i]![j - 1] ?? 1;
        pushStep({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransferSame,
          i,
          j,
          gridHighlight: { i, j },
          deps: [{ r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${grid[i]![j]}` }],
          tag: `[${i},${j}] 顺带覆盖: '${charI}'=='${charJ}' ➔ dp[${i}][${j}] = ${grid[i]![j]}`,
          log: `| ✨ 首尾相同直接顺带覆盖：dp[${i}][${j}] = ${grid[i]![j]}`,
          msg: `拓扑演化：<code>s[${i}] == s[${j}] == '${charI}'</code>，打印左端直接覆盖右端，<code>dp[${i}][${j}] = ${grid[i]![j]}</code>。`,
          decision: `顺带覆盖 ${grid[i]![j]}`,
        });
      } else {
        let minTurns = Infinity;
        let bestK = -1;
        for (let k = i; k < j; k++) {
          const val = (grid[i]![k] ?? 1) + (grid[k + 1]![j] ?? 1);
          if (val < minTurns) {
            minTurns = val;
            bestK = k;
          }
        }
        grid[i]![j] = minTurns;

        pushStep({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransferDiff,
          i,
          j,
          gridHighlight: { i, j },
          deps: bestK !== -1 ? [
            { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
            { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${grid[bestK + 1]![j]}` },
          ] : [],
          tag: `[${i},${j}] 最优切分 k=${bestK} ➔ dp[${i}][${j}] = ${minTurns}`,
          log: `| 🔀 拓扑切分：在 k=${bestK} 切分 ➔ dp[${i}][${j}] = ${minTurns}`,
          msg: `拓扑演化：在 <code>k = ${bestK}</code> 处合并两子区间，<code>dp[${i}][${j}] = <strong>${minTurns}</strong></code>。`,
          decision: `最优切分 ${minTurns}`,
        });
      }
    }
  }

  const ans = grid[0]![n - 1] ?? 1;

  pushStep({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `🏆 拓扑演化最优: dp[0][${n - 1}] = ${ans}`,
    log: `🏁 拓扑递推完成，最少打印次数 = ${ans}`,
    msg: `全局收敛：打印 <code>"${s}"</code> 所需的最少操作次数为 <strong>${ans}</strong>。`,
    decision: `最终返回 ${ans}`,
  });

  return steps;
}
