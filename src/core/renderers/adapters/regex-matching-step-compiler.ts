/**
 * 正则表达式匹配 (LeetCode 10 / 左程云 Class 074 Code04)
 * Step Compiler: 星号 '*' 任意次匹配转化为完全背包模型，斜率优化消除内层循环
 */

import type { HighlightTarget } from '../../code-panel';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';
import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';

export interface RegexMatchingStep {
  i: number;
  j: number;
  s: string;
  p: string;
  dp: boolean[][];
  matched: boolean;
  decision: string;
  status: 'init' | 'base' | 'cell' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function parseRegexMatchingInputs(inputs: Record<string, any>): {
  s: string;
  p: string;
} {
  const s = String(inputs['input-s'] ?? 'aab');
  const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? 'c*a*b');
  return { s, p };
}

export function buildRegexMatchingSteps(
  str: string,
  pat: string
): RegexMatchingStep[] {
  const steps: RegexMatchingStep[] = [];
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  function makeStep(data: Omit<RegexMatchingStep, 'metrics'>): RegexMatchingStep {
    const iChar = data.i >= 0 && data.i < n ? `'${s[data.i]}'` : data.i === n ? 'EOF' : '—';
    const jChar = data.j >= 0 && data.j < m ? `'${p[data.j]}'` : data.j === m ? 'EOF' : '—';
    return {
      ...data,
      metrics: {
        'metric-pos-i': `i=${data.i} (${iChar})`,
        'metric-pos-j': `j=${data.j} (${jChar})`,
        'metric-decision': data.decision || '—',
        'metric-result': data.matched ? 'MATCHED (true)' : 'NOT MATCHED (false)',
      },
    };
  }

  const lines = {
    entry: { java: 6, cpp: 7, python: 1, javascript: 2 },
    initDp: { java: 10, cpp: 9, python: 3, javascript: 4 },
    base: { java: 11, cpp: 10, python: 4, javascript: 5 },
    emptyStrStar: { java: 13, cpp: 12, python: 6, javascript: 7 },
    singleMatch: { java: 17, cpp: 17, python: 10, javascript: 12 },
    starSlopeOpt: { java: 20, cpp: 20, python: 12, javascript: 14 },
    returnAns: { java: 24, cpp: 24, python: 13, javascript: 18 },
  };

  // 1. 初始化
  steps.push(
    makeStep({
      i: -1,
      j: -1,
      s,
      p,
      dp: snapshotGrid2D(dp),
      matched: false,
      decision: '初始化 DP 表格',
      status: 'init',
      message: `🎯 初始化正则匹配表：进入 isMatch 函数，文本串 s="${s}" (长 ${n})，模式串 p="${p}" (长 ${m})。`,
      log: `init: s="${s}", p="${p}"`,
      codeLine: lines.entry,
    })
  );

  // 空串对空串匹配
  dp[n][m] = true;
  steps.push(
    makeStep({
      i: n,
      j: m,
      s,
      p,
      dp: snapshotGrid2D(dp),
      matched: true,
      decision: '空串基底 dp[n][m]=true',
      status: 'base',
      message: '✨ 基底：空串对空模式串自然匹配成功 dp[n][m] = true。',
      log: 'base: dp[n][m] = true',
      codeLine: lines.base,
    })
  );

  // s 为空，处理模式串末尾以 * 消解的情况
  for (let j = m - 1; j >= 0; j--) {
    const canCancel = j + 1 < m && p[j + 1] === '*' && dp[n][j + 2];
    if (canCancel) {
      dp[n][j] = true;
    }
    steps.push(
      makeStep({
        i: n,
        j,
        s,
        p,
        dp: snapshotGrid2D(dp),
        matched: dp[n][j],
        decision: canCancel ? `* 消解空串: '${p[j]}*' 取 0 次` : `'${p[j]}' 无法消解空串`,
        status: 'base',
        message: canCancel
          ? `✨ 基底：模式串 '${p[j]}*' 可匹配 0 次消去，dp[${n}][${j}] = true。`
          : `🛑 基底：模式串字符 '${p[j]}' 无法匹配消解空文本，dp[${n}][${j}] = false。`,
        log: `base: j=${j}, cancel=${canCancel}`,
        codeLine: lines.emptyStrStar,
      })
    );
  }

  // 严格位置依赖转移
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (j + 1 === m || p[j + 1] !== '*') {
        // 普通单字符匹配
        const curMatch = s[i] === p[j] || p[j] === '.';
        dp[i][j] = curMatch && dp[i + 1][j + 1];
        dec = curMatch
          ? `单字符匹配 '${s[i]}' ↔ '${p[j]}'`
          : `单字符失配 '${s[i]}' ≠ '${p[j]}'`;
      } else {
        // 完全背包斜率优化
        const matchZero = dp[i][j + 2];
        const matchMore = (s[i] === p[j] || p[j] === '.') && dp[i + 1][j];
        dp[i][j] = matchZero || matchMore;
        dec = matchZero
          ? `* 匹配 0 次成功`
          : matchMore
          ? `* 完全背包叠加匹配 '${s[i]}'`
          : `* 匹配失败`;
      }

      steps.push(
        makeStep({
          i,
          j,
          s,
          p,
          dp: snapshotGrid2D(dp),
          matched: dp[i][j],
          decision: dec,
          status: 'cell',
          message: `🔍 计算 dp[${i}][${j}] (s[${i}]='${s[i]}', p[${j}]='${p[j]}'): ${dec} → ${dp[i][j]}。`,
          log: `cell [${i}][${j}]: ${dec} => ${dp[i][j]}`,
          codeLine: j + 1 === m || p[j + 1] !== '*' ? lines.singleMatch : lines.starSlopeOpt,
        })
      );
    }
  }

  const finalMatch = dp[0][0];
  steps.push(
    makeStep({
      i: 0,
      j: 0,
      s,
      p,
      dp: snapshotGrid2D(dp),
      matched: finalMatch,
      decision: finalMatch ? '完全匹配成功' : '匹配失败',
      status: 'done',
      message: `🎉 正则匹配判定完成！dp[0][0] = ${finalMatch}，文本串 "${s}" ${
        finalMatch ? '完全匹配' : '无法匹配'
      } 模式串 "${p}"！`,
      log: `done: ans=${finalMatch}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

// ============================================================================
// 顶层抽象 4 阶段全生命周期 UniversalStep 编译流水线
// ============================================================================

export function compileRegexMatchingSteps(
  str: string,
  pat: string,
  stage: number = 3,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction?: 'forward' | 'reverse' | string
): UniversalStep[] {
  const stageNum = typeof stage === 'number' ? stage : 3;
  if (stageNum === 1) {
    return compileRegexStage1Steps(str, pat, anchorMap);
  } else if (stageNum === 2) {
    return compileRegexStage2Steps(str, pat, anchorMap);
  } else if (stageNum === 3) {
    return compileRegexStage3Steps(str, pat, anchorMap);
  } else {
    return compileRegexStage4Steps(str, pat, anchorMap);
  }
}

// 阶段 1: 暴力递归
function compileRegexStage1Steps(
  s: string,
  p: string,
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = s.length;
  const m = p.length;

  const lineEntry = anchors?.entry || 3;
  const lineDfsEntry = anchors?.dfs_entry || 5;
  const lineBoundary = anchors?.boundary || 6;
  const lineFirstMatch = anchors?.first_match || 7;
  const lineCheckStar = anchors?.check_star || 8;
  const lineBranchZero = anchors?.branch_zero || 9;
  const lineBranchTake = anchors?.branch_take || 10;
  const lineBranchSingle = anchors?.branch_single || 12;

  let nodeCounter = 1;
  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: 0,
    c: 0,
    val: 'dfs(0,0)',
    status: 'current',
    children: [],
  };

  const emptyGrid: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  const activeStack: string[] = [];

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 1,
      grid: JSON.parse(JSON.stringify(emptyGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '递归分支探索',
      log: data.log || '| 探索',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      s,
      p,
      ...data,
    });
  }

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `启动正则匹配递归 dfs(0, 0)`,
    log: `| 🚀 启动正则匹配递归：文本 s="${s}" (长${n})，模式 p="${p}" (长${m})`,
    msg: `启动正则表达式匹配主递归：文本串 <code>"${s}"</code>，模式串 <code>"${p}"</code>。`,
    decision: '启动主函数',
  });

  function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number): boolean {
    if (steps.length > 300) return false;
    const callLabel = `dfs(${i},${j})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `进入帧 ${callLabel}`,
      log: `| 📥 进入帧 ${callLabel} [s[${i}]='${s[i] || 'Ø'}', p[${j}]='${p[j] || 'Ø'}']`,
      msg: `进入递归函数帧：考察文本字符 <code>s[${i}]='${s[i] || 'Ø'}'</code> 与模式字符 <code>p[${j}]='${p[j] || 'Ø'}'</code>。`,
      decision: `考察帧 (${i}, ${j})`,
    });

    if (j === m) {
      const match = i === n;
      parentNode.status = match ? 'target' : 'base';
      parentNode.tag = match ? '完全匹配' : '模式耗尽';
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: match ? '🎯 匹配完毕 true' : '🚫 模式串耗尽 false',
        log: `| 🎯 边界判定: 模式串已到末尾 j=${m}，文本串是否耗尽 i=${i}/${n} → return ${match}`,
        msg: `边界条件判定：模式串已遍历完毕。${match ? '文本串恰好同时遍历完毕，匹配成功返回 <strong>true</strong>！' : '文本串仍有未匹配剩余字符，匹配失败返回 <strong>false</strong>。'}`,
        decision: `边界返回 ${match}`,
      });
      activeStack.pop();
      return match;
    }

    const first = i < n && (s[i] === p[j] || p[j] === '.');
    pushStep({
      type: 'first-match',
      line: lineFirstMatch,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `首字符匹配: ${first}`,
      log: `| 🔍 首字符匹配校验: s[${i}]='${s[i] || 'Ø'}' ↔ p[${j}]='${p[j]}' → ${first}`,
      msg: `首字符对齐校验：文本字符 <code>'${s[i] || 'Ø'}'</code> 与模式字符 <code>'${p[j]}'</code> ${first ? '<strong>匹配成功</strong>' : '<strong>不匹配</strong>'}。`,
      decision: `首字符对齐=${first}`,
    });

    if (j + 1 < m && p[j + 1] === '*') {
      pushStep({
        type: 'check-star',
        line: lineCheckStar,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `检测到通配符 '${p[j]}*'`,
        log: `| ⭐ 模式串下一字符为 '*'，开启完全背包分支决策`,
        msg: `检测到后置通配符 <code>'*'</code>：规则 <code>'${p[j]}*'</code> 可匹配 0 次或无限次！`,
        decision: `开启 '*' 完全背包分支`,
      });

      // 分支 0: * 匹配 0 次
      const child0: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(i, n),
        c: Math.min(j + 2, m),
        val: `dfs(${i},${j + 2})`,
        edgeLabel: '*匹配0次',
        status: 'current',
        children: [],
      };
      parentNode.children.push(child0);

      pushStep({
        type: 'branch-call',
        line: lineBranchZero,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `* 匹配 0 次 -> dfs(${i}, ${j + 2})`,
        log: `| 🌿 分支 0: 让 '${p[j]}*' 匹配 0 次，跳过模式串两位深入 dfs(${i}, ${j + 2})`,
        msg: `完全背包分支 0：让 <code>'${p[j]}*'</code> 匹配 0 次消去，转向 <code>dfs(${i}, ${j + 2})</code>。`,
        decision: `展开分支: * 匹配 0 次`,
      });

      const res0 = dfs(i, j + 2, child0, depth + 1);
      if (res0) {
        parentNode.status = 'target';
        parentNode.tag = '成功(匹配0次)';
        activeStack.pop();
        return true;
      }

      // 分支 1: * 匹配 >= 1 次（完全背包同层复用）
      if (first) {
        const child1: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j, m),
          val: `dfs(${i + 1},${j})`,
          edgeLabel: '*匹配>=1次',
          status: 'current',
          children: [],
        };
        parentNode.children.push(child1);

        pushStep({
          type: 'branch-call',
          line: lineBranchTake,
          i: Math.min(i, n),
          j: Math.min(j, m),
          activeNodeId: parentNode.id,
          tag: `* 匹配 >=1 次 -> dfs(${i + 1}, ${j})`,
          log: `| 🪙 分支 1: 首字符匹配，消耗文本串 1 字符但保留模式规则，深入 dfs(${i + 1}, ${j})`,
          msg: `完全背包分支 1：消耗文本字符 <code>'${s[i]}'</code>，保留模式规则 <code>'${p[j]}*'</code>，继续在同层探索 <code>dfs(${i + 1}, ${j})</code>。`,
          decision: `展开分支: * 匹配 >= 1 次`,
        });

        const res1 = dfs(i + 1, j, child1, depth + 1);
        parentNode.status = res1 ? 'target' : 'base';
        parentNode.tag = res1 ? '成功(复用*)' : '失败';
        activeStack.pop();
        return res1;
      }

      parentNode.status = 'base';
      parentNode.tag = '失败';
      activeStack.pop();
      return false;
    }

    // 普通单字符匹配
    if (first) {
      const childSingle: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(i + 1, n),
        c: Math.min(j + 1, m),
        val: `dfs(${i + 1},${j + 1})`,
        edgeLabel: '单字符对齐',
        status: 'current',
        children: [],
      };
      parentNode.children.push(childSingle);

      pushStep({
        type: 'branch-call',
        line: lineBranchSingle,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `单字符匹配推进 -> dfs(${i + 1}, ${j + 1})`,
        log: `| ➡️ 单字符匹配成功: 双方各消耗 1 字符，转向 dfs(${i + 1}, ${j + 1})`,
        msg: `单字符对齐成功：双指针同步推进，转向 <code>dfs(${i + 1}, ${j + 1})</code>。`,
        decision: '单字符推进',
      });

      const res = dfs(i + 1, j + 1, childSingle, depth + 1);
      parentNode.status = res ? 'target' : 'base';
      parentNode.tag = res ? '单字符对齐成功' : '后续失配';
      activeStack.pop();
      return res;
    }

    parentNode.status = 'base';
    parentNode.tag = '单字符失配';
    activeStack.pop();
    return false;
  }

  dfs(0, 0, rootNode, 1);
  return steps;
}

// 阶段 2: 记忆化搜索
function compileRegexStage2Steps(
  s: string,
  p: string,
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = s.length;
  const m = p.length;

  const lineEntry = anchors?.entry || 3;
  const lineDfsEntry = anchors?.dfs_entry || 6;
  const lineCacheHit = anchors?.cache_hit || 7;
  const lineBoundary = anchors?.boundary || 8;
  const lineFirstMatch = anchors?.first_match || 12;
  const lineCheckStar = anchors?.check_star || 14;
  const lineStarEval = anchors?.star_eval || 15;
  const lineSingleEval = anchors?.single_eval || 17;
  const lineMemoStore = anchors?.memo_store || 19;

  let nodeCounter = 1;
  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: 0,
    c: 0,
    val: 'dfsMemo(0,0)',
    status: 'current',
    children: [],
  };

  const memoGrid: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  const activeStack: string[] = [];

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 2,
      grid: JSON.parse(JSON.stringify(memoGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '记忆化探查',
      log: data.log || '| 记忆化搜索',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      s,
      p,
      ...data,
    });
  }

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `创建备忘录 memo[${n + 1}][${m + 1}]`,
    log: `| 📋 初始化规格为 ${n + 1} × ${m + 1} 的记忆化缓存表格`,
    msg: `初始化 <code>${n + 1} × ${m + 1}</code> 的记忆化状态表，防止重叠子问题重复计算。`,
    decision: '初始化备忘录',
  });

  function dfsMemo(i: number, j: number, parentNode: UniversalTreeNode): boolean {
    if (steps.length > 300) return false;
    const callLabel = `dfsMemo(${i},${j})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `探查 memo[${i}][${j}]`,
      log: `| 📥 进入帧 ${callLabel}，探查备忘录缓存`,
      msg: `探查状态 <code>memo[${i}][${j}]</code>：检查该后缀子问题是否曾被计算缓存。`,
      decision: `探查 memo[${i}][${j}]`,
    });

    if (memoGrid[i][j] !== null) {
      const cached = memoGrid[i][j] === 1;
      parentNode.status = 'pruned';
      parentNode.tag = `⚡剪枝: ${cached}`;
      pushStep({
        type: 'cache-hit',
        line: lineCacheHit,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        gridHighlight: { i: Math.min(i, n), j: Math.min(j, m) },
        tag: `⚡ 备忘录命中 memo[${i}][${j}] = ${cached}`,
        log: `| ⚡ 备忘录命中: memo[${i}][${j}] = ${cached}，立即剪枝返回！`,
        msg: `⚡ <strong>备忘录命中</strong>：状态 <code>memo[${i}][${j}]</code> 先前已被计算，直接返回缓存值 <strong>${cached}</strong>，成功剪除庞大子树！`,
        decision: `Cache Hit: 直接返回 ${cached}`,
      });
      activeStack.pop();
      return cached;
    }

    if (j === m) {
      const match = i === n;
      memoGrid[i][j] = match ? 1 : 0;
      parentNode.status = match ? 'target' : 'base';
      parentNode.tag = match ? '匹配成功' : '模式耗尽';
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        gridHighlight: { i: Math.min(i, n), j: Math.min(j, m) },
        tag: `边界条件 memo[${i}][${j}] = ${match}`,
        log: `| 🎯 边界命中: j=${m} 模式耗尽，i=${i}，写入 memo[${i}][${j}] = ${match}`,
        msg: `边界条件命中：写入 <code>memo[${i}][${j}] = <strong>${match}</strong></code>。`,
        decision: `写入基底 ${match}`,
      });
      activeStack.pop();
      return match;
    }

    const first = i < n && (s[i] === p[j] || p[j] === '.');
    pushStep({
      type: 'first-match',
      line: lineFirstMatch,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `首字符匹配: ${first}`,
      log: `| 🔍 校验 s[${i}] ↔ p[${j}] → ${first}`,
      msg: `首字符对齐：<code>'${s[i] || 'Ø'}'</code> ↔ <code>'${p[j]}'</code> → <strong>${first}</strong>。`,
      decision: `首字符对齐=${first}`,
    });

    let ans = false;
    if (j + 1 < m && p[j + 1] === '*') {
      const child0: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(i, n),
        c: Math.min(j + 2, m),
        val: `dfsMemo(${i},${j + 2})`,
        edgeLabel: '*取0次',
        status: 'current',
        children: [],
      };
      parentNode.children.push(child0);
      const res0 = dfsMemo(i, j + 2, child0);

      let res1 = false;
      if (first) {
        const child1: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j, m),
          val: `dfsMemo(${i + 1},${j})`,
          edgeLabel: '*取>=1次',
          status: 'current',
          children: [],
        };
        parentNode.children.push(child1);
        res1 = dfsMemo(i + 1, j, child1);
      }
      ans = res0 || res1;
    } else {
      if (first) {
        const childSingle: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j + 1, m),
          val: `dfsMemo(${i + 1},${j + 1})`,
          edgeLabel: '单字符对齐',
          status: 'current',
          children: [],
        };
        parentNode.children.push(childSingle);
        ans = dfsMemo(i + 1, j + 1, childSingle);
      }
    }

    memoGrid[i][j] = ans ? 1 : 0;
    parentNode.status = ans ? 'target' : 'base';
    parentNode.tag = ans ? 'true' : 'false';

    pushStep({
      type: 'memo-store',
      line: lineMemoStore,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      gridHighlight: { i: Math.min(i, n), j: Math.min(j, m) },
      tag: `💾 写入 memo[${i}][${j}] = ${ans}`,
      log: `| 💾 写入备忘录: memo[${i}][${j}] = ${ans}，落盘供后续剪枝`,
      msg: `💾 <strong>写入备忘录</strong>：将状态 <code>memo[${i}][${j}] = <strong>${ans}</strong></code> 写入表格，供后续分支剪枝复用。`,
      decision: `写入 memo[${i}][${j}]=${ans}`,
    });

    activeStack.pop();
    return ans;
  }

  dfsMemo(0, 0, rootNode);
  return steps;
}

// 阶段 3: 严格二维动态规划
function compileRegexStage3Steps(
  s: string,
  p: string,
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = s.length;
  const m = p.length;

  const lineInit = anchors?.init || 3;
  const lineBase = anchors?.base || 4;
  const lineBaseRow = anchors?.base_row || 5;
  const lineLoopI = anchors?.loop_i || 8;
  const lineLoopJ = anchors?.loop_j || 9;
  const lineCheckStar = anchors?.check_star || 10;
  const lineSingleMatch = anchors?.single_match || 11;
  const lineStarSlope = anchors?.star_slope || 13;
  const lineReturn = anchors?.return || 18;

  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 3,
      grid: JSON.parse(JSON.stringify(dp)),
      decision: data.decision || '二维动态规划状态转移',
      log: data.log || '| DP填表',
      msg: data.msg || data.log || '',
      line: data.line || lineStarSlope,
      s,
      p,
      ...data,
    });
  }

  pushStep({
    type: 'init',
    line: lineInit,
    i: n,
    j: m,
    tag: `创建二维 DP 状态表 dp[${n + 1}][${m + 1}]`,
    log: `| 📋 初始化 dp[${n + 1}][${m + 1}] 二维表格`,
    msg: `建立 <code>${n + 1} × ${m + 1}</code> 的二维 DP 状态表，基底全为待推导状态。`,
    decision: '初始化 DP 矩阵',
  });

  dp[n][m] = 1;
  pushStep({
    type: 'base',
    line: lineBase,
    i: n,
    j: m,
    gridHighlight: { i: n, j: m },
    tag: '基底: dp[n][m] = true',
    log: '| 🎯 基底设置: 空串与空模式串天然完全匹配，dp[n][m] = true',
    msg: `基底设置：空文本串对空模式串天然完全匹配，<code>dp[${n}][${m}] = <strong>true</strong></code>。`,
    decision: '设置空串基底',
  });

  for (let j = m - 1; j >= 0; j--) {
    const canCancel = j + 1 < m && p[j + 1] === '*' && dp[n][j + 2] === 1;
    dp[n][j] = canCancel ? 1 : 0;
    pushStep({
      type: 'base-row',
      line: lineBaseRow,
      i: n,
      j,
      gridHighlight: { i: n, j },
      deps: j + 1 < m && p[j + 1] === '*' ? [{ r: n, c: j + 2, type: 'left', label: '*消解空串' }] : undefined,
      tag: `空文本串匹配 p[${j}..]: ${Boolean(dp[n][j])}`,
      log: `| 🧩 基底行: dp[${n}][${j}] = ${Boolean(dp[n][j])}`,
      msg: `空文本串基底行考察 <code>p[${j}]='${p[j]}'</code>：${canCancel ? `后置为 <code>'*'</code> 且可消解，<code>dp[${n}][${j}] = <strong>true</strong></code>。` : `无法匹配消解空串，<code>dp[${n}][${j}] = <strong>false</strong></code>。`}`,
      decision: `基底 dp[${n}][${j}] = ${Boolean(dp[n][j])}`,
    });
  }

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (j + 1 === m || p[j + 1] !== '*') {
        const curMatch = s[i] === p[j] || p[j] === '.';
        dp[i][j] = curMatch && dp[i + 1][j + 1] === 1 ? 1 : 0;
        dec = curMatch
          ? `单字符匹配 '${s[i]}' ↔ '${p[j]}'`
          : `单字符失配 '${s[i]}' ≠ '${p[j]}'`;

        pushStep({
          type: 'single-match',
          line: lineSingleMatch,
          i,
          j,
          gridHighlight: { i, j },
          deps: [{ r: i + 1, c: j + 1, type: 'diag', label: curMatch ? '单字符对齐' : '失配' }],
          tag: `dp[${i}][${j}] = ${Boolean(dp[i][j])}`,
          log: `| ➡️ 单字符匹配: dp[${i}][${j}] = ${Boolean(dp[i][j])} (${dec})`,
          msg: `单字符精确对齐：<code>s[${i}]='${s[i]}'</code> ↔ <code>p[${j}]='${p[j]}'</code>，状态转移 <code>dp[${i}][${j}] = <strong>${Boolean(dp[i][j])}</strong></code>。`,
          decision: dec,
        });
      } else {
        const matchZero = dp[i][j + 2] === 1;
        const curMatch = s[i] === p[j] || p[j] === '.';
        const matchTake = curMatch && dp[i + 1][j] === 1;
        dp[i][j] = matchZero || matchTake ? 1 : 0;
        dec = matchZero
          ? `* 匹配 0 次消解成功`
          : matchTake
          ? `* 完全背包复用匹配 '${s[i]}'`
          : `* 匹配失败`;

        const deps: Array<{ r: number; c: number; type: 'left' | 'top'; label: string }> = [
          { r: i, c: Math.min(j + 2, m), type: 'left', label: '*取0次' },
        ];
        if (curMatch) {
          deps.push({ r: i + 1, c: j, type: 'top', label: '*取>=1次' });
        }

        pushStep({
          type: 'star-slope',
          line: lineStarSlope,
          i,
          j,
          gridHighlight: { i, j },
          deps,
          tag: `dp[${i}][${j}] = ${Boolean(dp[i][j])}`,
          log: `| ⭐ 完全背包斜率优化: dp[${i}][${j}] = ${Boolean(dp[i][j])} (${dec})`,
          msg: `完全背包斜率优化：<code>dp[${i}][${j}] = dp[${i}][${j + 2}] || (first && dp[${i + 1}][${j}]) = <strong>${Boolean(dp[i][j])}</strong></code>。`,
          decision: dec,
        });
      }
    }
  }

  const finalMatch = dp[0][0] === 1;
  pushStep({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    gridHighlight: { i: 0, j: 0 },
    tag: `全局匹配判定 = ${finalMatch}`,
    log: `| 🏆 全局推导完成！dp[0][0] = ${finalMatch}，文本串 "${s}" ${finalMatch ? '完全匹配' : '无法匹配'} 模式串 "${p}"！`,
    msg: `🏆 <strong>动态规划推导完成</strong>！最终求得 <code>dp[0][0] = <strong>${finalMatch}</strong></code>，文本串 <code>"${s}"</code> ${finalMatch ? '完全匹配' : '无法匹配'} 模式串 <code>"${p}"</code>！`,
    decision: `完成判定: ${finalMatch}`,
  });

  return steps;
}

// 阶段 4: 两行滚动数组空间压缩
function compileRegexStage4Steps(
  s: string,
  p: string,
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = s.length;
  const m = p.length;

  const lineInit = anchors?.init || 3;
  const lineBase = anchors?.base || 4;
  const lineBaseRow = anchors?.base_row || 5;
  const lineLoopI = anchors?.loop_i || 8;
  const lineLoopJ = anchors?.loop_j || 10;
  const lineSingleMatch = anchors?.single_match || 12;
  const lineStarSlope = anchors?.star_slope || 14;
  const lineRoll = anchors?.roll || 17;
  const lineReturn = anchors?.return || 19;

  let nextRow: number[] = new Array(m + 1).fill(0);
  nextRow[m] = 1;
  for (let j = m - 1; j >= 0; j--) {
    if (j + 1 < m && p[j + 1] === '*' && nextRow[j + 2] === 1) {
      nextRow[j] = 1;
    }
  }

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 4,
      grid: [JSON.parse(JSON.stringify(nextRow))],
      dp1d: JSON.parse(JSON.stringify(nextRow)),
      decision: data.decision || '空间压缩滚动推进',
      log: data.log || '| 空间滚动',
      msg: data.msg || data.log || '',
      line: data.line || lineStarSlope,
      s,
      p,
      ...data,
    });
  }

  pushStep({
    type: 'init',
    line: lineInit,
    activeSlot: m,
    tag: `初始化滚动向量 next[${m + 1}]`,
    log: `| 📋 初始化 O(M) 空间压缩基底向量 next[${m + 1}]`,
    msg: `初始化 <code>${m + 1}</code> 长度的一维滚动向量，空间复杂度从 O(NM) 骤降至 O(M)。`,
    decision: '初始化滚动向量',
  });

  for (let i = n - 1; i >= 0; i--) {
    const curRow = new Array(m + 1).fill(0);

    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (j + 1 === m || p[j + 1] !== '*') {
        const curMatch = s[i] === p[j] || p[j] === '.';
        curRow[j] = curMatch && nextRow[j + 1] === 1 ? 1 : 0;
        dec = curMatch ? `单字符匹配` : `单字符失配`;
      } else {
        const matchZero = curRow[j + 2] === 1;
        const curMatch = s[i] === p[j] || p[j] === '.';
        const matchTake = curMatch && nextRow[j] === 1;
        curRow[j] = matchZero || matchTake ? 1 : 0;
        dec = matchZero ? `*匹配0次` : matchTake ? `*复用当前规则` : `*失配`;
      }

      pushStep({
        type: 'step-cell',
        line: j + 1 === m || p[j + 1] !== '*' ? lineSingleMatch : lineStarSlope,
        activeSlot: j,
        highlightSlots: j + 1 < m && p[j + 1] === '*' ? [j + 2] : [j + 1],
        tag: `cur[${j}] = ${Boolean(curRow[j])}`,
        log: `| 🔄 滚动计算 i=${i}, j=${j}: cur[${j}] = ${Boolean(curRow[j])} (${dec})`,
        msg: `行 <code>i=${i}</code> 倒序滚动计算 <code>cur[${j}] = <strong>${Boolean(curRow[j])}</strong></code> (${dec})。`,
        decision: dec,
      });
    }

    nextRow = curRow;
    pushStep({
      type: 'roll',
      line: lineRoll,
      activeSlot: 0,
      tag: `第 ${i} 行更新完成，滚动交换 next = cur`,
      log: `| 🔁 完成第 ${i} 行计算，滚动指针覆盖 next = cur`,
      msg: `完成文本行 <code>i=${i}</code> 的计算，就地滚动向量，为上一行 <code>i-1</code> 的推演提供基底。`,
      decision: `滚动向量覆盖 next=cur`,
    });
  }

  const finalMatch = nextRow[0] === 1;
  pushStep({
    type: 'return',
    line: lineReturn,
    activeSlot: 0,
    tag: `空间优化推导完成！答案 = ${finalMatch}`,
    log: `| 🏆 空间压缩推导完毕！最终答案 = ${finalMatch}`,
    msg: `🏆 <strong>空间优化推导完毕</strong>！在 O(M) 辅助空间下，最终求得匹配答案为 <strong>${finalMatch}</strong>！`,
    decision: `完成推导: ${finalMatch}`,
  });

  return steps;
}

