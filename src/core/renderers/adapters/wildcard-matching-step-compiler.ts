/**
 * 通配符匹配 (LeetCode 44 / 左程云 Class 074 Code05)
 * Step Compiler: 通配符 '*' 匹配任意序列，斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]
 */

import type { HighlightTarget } from '../../code-panel';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';
import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';

export interface WildcardMatchingStep {
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

export function parseWildcardMatchingInputs(inputs: Record<string, any>): {
  s: string;
  p: string;
} {
  const s = String(inputs['input-s'] ?? 'cb');
  const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '?a');
  return { s, p };
}

export function buildWildcardMatchingSteps(
  str: string,
  pat: string
): WildcardMatchingStep[] {
  const steps: WildcardMatchingStep[] = [];
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  function makeStep(data: Omit<WildcardMatchingStep, 'metrics'>): WildcardMatchingStep {
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
    emptyStrStar: { java: 12, cpp: 11, python: 6, javascript: 6 },
    singleMatch: { java: 17, cpp: 15, python: 14, javascript: 10 },
    starSlopeOpt: { java: 19, cpp: 17, python: 16, javascript: 12 },
    returnAns: { java: 23, cpp: 21, python: 17, javascript: 16 },
  };

  // 1. 初始化
  steps.push(
    makeStep({
      i: n,
      j: m,
      s,
      p,
      dp: snapshotGrid2D(dp),
      matched: false,
      decision: '初始化 DP 表格',
      status: 'init',
      message: `🏁 初始化 ${n + 1} × ${m + 1} 二维匹配矩阵。所有状态默认标记为 false。`,
      log: `init dp table ${n + 1}x${m + 1}`,
      codeLine: lines.initDp,
    })
  );

  // 2. 基底：dp[n][m] = true
  dp[n][m] = true;
  steps.push(
    makeStep({
      i: n,
      j: m,
      s,
      p,
      dp: snapshotGrid2D(dp),
      matched: true,
      decision: '空串匹配空模式串',
      status: 'base',
      message: `🎯 基底设置: 两个空串天然完全匹配，dp[${n}][${m}] = true。`,
      log: `base dp[${n}][${m}] = true`,
      codeLine: lines.base,
    })
  );

  // 3. 空文本串基底行：遇到连续 '*' 可匹配空串
  for (let j = m - 1; j >= 0 && p[j] === '*'; j--) {
    dp[n][j] = true;
    steps.push(
      makeStep({
        i: n,
        j,
        s,
        p,
        dp: snapshotGrid2D(dp),
        matched: true,
        decision: `通配符 '*' 匹配空串`,
        status: 'base',
        message: `🎯 空文本串基底: p[${j}]='*' 可以匹配空串，dp[${n}][${j}] = true。`,
        log: `base dp[${n}][${j}] = true (star match empty)`,
        codeLine: lines.emptyStrStar,
      })
    );
  }

  // 4. 自底向上填表
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (p[j] !== '*') {
        const charMatch = s[i] === p[j] || p[j] === '?';
        dp[i][j] = charMatch && dp[i + 1][j + 1];
        dec = charMatch
          ? p[j] === '?'
            ? `问号 '?' 通配 '${s[i]}'`
            : `单字符精确对齐 '${s[i]}' ↔ '${p[j]}'`
          : `字符失配 '${s[i]}' ≠ '${p[j]}'`;
      } else {
        // 斜率优化：dp[i][j] = dp[i + 1][j] || dp[i][j + 1]
        const matchEmpty = dp[i][j + 1];
        const matchMore = dp[i + 1][j];
        dp[i][j] = matchEmpty || matchMore;
        dec = matchEmpty
          ? `* 匹配 0 字符成功`
          : matchMore
          ? `* 匹配至少 1 字符 ('${s[i]}') 成功`
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
          codeLine: p[j] !== '*' ? lines.singleMatch : lines.starSlopeOpt,
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
      message: `🎉 通配符匹配完毕！dp[0][0] = ${finalMatch}，文本串 "${s}" ${
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

export function compileWildcardMatchingSteps(
  str: string,
  pat: string,
  stage: number = 3,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction?: 'forward' | 'reverse' | string
): UniversalStep[] {
  const stageNum = typeof stage === 'number' ? stage : 3;
  if (stageNum === 1) {
    return compileWildcardStage1Steps(str, pat, anchorMap);
  } else if (stageNum === 2) {
    return compileWildcardStage2Steps(str, pat, anchorMap);
  } else if (stageNum === 3) {
    return compileWildcardStage3Steps(str, pat, anchorMap);
  } else {
    return compileWildcardStage4Steps(str, pat, anchorMap);
  }
}

// 阶段 1: 暴力递归分支展开
function compileWildcardStage1Steps(
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
  const lineCheckChar = anchors?.check_char || 7;
  const lineFirstMatch = anchors?.first_match || 8;
  const lineBranchSingle = anchors?.branch_single || 9;
  const lineBranchEmpty = anchors?.branch_empty || 11;
  const lineBranchTake = anchors?.branch_take || 12;

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
      log: data.log || '| 递归调用',
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
    tag: `开始通配符匹配: s="${s}", p="${p}"`,
    log: `| 🏁 算法入口: 尝试将文本串 "${s}" 与模式串 "${p}" 展开递归判定`,
    msg: `开始通配符匹配：文本串长度 <code>${n}</code>，模式串长度 <code>${m}</code>。`,
    decision: '算法启动',
  });

  function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number = 1): boolean {
    if (steps.length > 250) return false;
    const callLabel = `dfs(${i},${j})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `进入帧 ${callLabel}`,
      log: `| 📥 进入递归帧 ${callLabel}`,
      msg: `考察状态 <code>(${i}, ${j})</code>：文本串后缀 <code>"${s.slice(i)}"</code> ↔ 模式串后缀 <code>"${p.slice(j)}"</code>。`,
      decision: `递归展开 (${i},${j})`,
    });

    // 边界条件：模式串耗尽
    if (j === m) {
      const matched = i === n;
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `边界判定: j=${m} -> ${matched}`,
        log: `| 🎯 边界基底: 模式串耗尽，文本串 ${matched ? '亦完全耗尽(成功)' : '仍有剩余(失败)'}`,
        msg: `到达边界：模式串耗尽 (j=${m})，文本串 ${matched ? '同时耗尽，匹配成功！' : '仍有残留字符，匹配失败。'}`,
        decision: `边界返回: ${matched}`,
      });
      parentNode.status = matched ? 'target' : 'base';
      parentNode.tag = matched ? '匹配成功' : '失配';
      activeStack.pop();
      return matched;
    }

    // 分类讨论：非 '*' 字符
    if (p[j] !== '*') {
      pushStep({
        type: 'check-char',
        line: lineCheckChar,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `检测非星号字符 p[${j}]='${p[j]}'`,
        log: `| 🔍 非星号字符: p[${j}]='${p[j]}'，进行单字符精确或问号通配对齐`,
        msg: `非星号判定：当前模式字符为 <code>'${p[j]}'</code>，检查是否与 <code>s[${i}]</code> 对齐。`,
        decision: `非星号对齐判定`,
      });

      const first = i < n && (s[i] === p[j] || p[j] === '?');
      pushStep({
        type: 'first-match',
        line: lineFirstMatch,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `单字符对齐: ${first}`,
        log: `| 🔤 单字符判定: s[${i}]='${s[i] || 'EOF'}' 与 p[${j}]='${p[j]}' 对齐结果: ${first}`,
        msg: `单字符匹配：<code>s[${i}]='${s[i] || 'EOF'}'</code> 与 <code>p[${j}]='${p[j]}'</code> 对齐结果为 <strong>${first}</strong>。`,
        decision: `单字符判定: ${first}`,
      });

      if (first) {
        const childNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j + 1, m),
          val: `dfs(${i + 1},${j + 1})`,
          edgeLabel: '单字符匹配',
          status: 'current',
          children: [],
        };
        parentNode.children.push(childNode);

        pushStep({
          type: 'branch-call',
          line: lineBranchSingle,
          i: Math.min(i, n),
          j: Math.min(j, m),
          activeNodeId: parentNode.id,
          tag: `对齐推进 -> dfs(${i + 1}, ${j + 1})`,
          log: `| ➡️ 单字符匹配成功，双指针同步推进深入 dfs(${i + 1}, ${j + 1})`,
          msg: `匹配推进：双指针各前进 1 位，深入子问题 <code>dfs(${i + 1}, ${j + 1})</code>。`,
          decision: '推进到下一步',
        });

        const res = dfs(i + 1, j + 1, childNode, depth + 1);
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

    // 分类讨论：遇到通配符 '*'
    const childEmpty: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: Math.min(i, n),
      c: Math.min(j + 1, m),
      val: `dfs(${i},${j + 1})`,
      edgeLabel: '*匹配空串',
      status: 'current',
      children: [],
    };
    parentNode.children.push(childEmpty);

    pushStep({
      type: 'branch-call',
      line: lineBranchEmpty,
      i: Math.min(i, n),
      j: Math.min(j, m),
      activeNodeId: parentNode.id,
      tag: `* 匹配空串 -> dfs(${i}, ${j + 1})`,
      log: `| 🃏 分支 1: 通配符 '*' 匹配空串，模式指针前移深入 dfs(${i}, ${j + 1})`,
      msg: `完全背包分支 1：让 <code>'*'</code> 匹配空串，不消耗文本字符，模式指针前移深入 <code>dfs(${i}, ${j + 1})</code>。`,
      decision: '* 匹配 0 字符',
    });

    const resEmpty = dfs(i, j + 1, childEmpty, depth + 1);
    if (resEmpty) {
      parentNode.status = 'target';
      parentNode.tag = '*匹配空串成功';
      activeStack.pop();
      return true;
    }

    if (i < n) {
      const childTake: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(i + 1, n),
        c: Math.min(j, m),
        val: `dfs(${i + 1},${j})`,
        edgeLabel: '*吃掉1字符',
        status: 'current',
        children: [],
      };
      parentNode.children.push(childTake);

      pushStep({
        type: 'branch-call',
        line: lineBranchTake,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `* 匹配 >=1 字符 -> dfs(${i + 1}, ${j})`,
        log: `| 🪙 分支 2: 通配符 '*' 吃掉字符 '${s[i]}' 且继续保留星号，深入 dfs(${i + 1}, ${j})`,
        msg: `完全背包分支 2：通配符 <code>'*'</code> 吃掉当前文本字符 <code>'${s[i]}'</code>，保留星号继续在同层探索 <code>dfs(${i + 1}, ${j})</code>。`,
        decision: '* 匹配 >= 1 字符',
      });

      const resTake = dfs(i + 1, j, childTake, depth + 1);
      parentNode.status = resTake ? 'target' : 'base';
      parentNode.tag = resTake ? '星号复用成功' : '失败';
      activeStack.pop();
      return resTake;
    }

    parentNode.status = 'base';
    parentNode.tag = '星号分支均失配';
    activeStack.pop();
    return false;
  }

  dfs(0, 0, rootNode, 1);
  return steps;
}

// 阶段 2: 记忆化搜索
function compileWildcardStage2Steps(
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
  const lineCheckChar = anchors?.check_char || 12;
  const lineFirstMatch = anchors?.first_match || 13;
  const lineBranchSingle = anchors?.branch_single || 14;
  const lineSingleEval = anchors?.single_eval || 15;
  const lineBranchEmpty = anchors?.branch_empty || 16;
  const lineBranchTake = anchors?.branch_take || 17;
  const lineStarEval = anchors?.star_eval || 18;
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
      msg: `进入递归帧 <code>${callLabel}</code>，优先检查 <code>memo[${i}][${j}]</code> 避免重复分支。`,
      decision: `探查 (${i},${j})`,
    });

    if (memoGrid[i][j] !== null) {
      const cached = memoGrid[i][j] === 1;
      pushStep({
        type: 'cache-hit',
        line: lineCacheHit,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        gridHighlight: { i: Math.min(i, n), j: Math.min(j, m) },
        tag: `⚡ 命中缓存: memo[${i}][${j}] = ${cached}`,
        log: `| ⚡ 命中缓存: memo[${i}][${j}] = ${cached}，剪除重复子树`,
        msg: `⚡ <strong>命中备忘录缓存</strong>！<code>memo[${i}][${j}] = <strong>${cached}</strong></code>，直接 O(1) 返回剪枝。`,
        decision: `命中缓存 ${cached}`,
      });
      parentNode.status = cached ? 'target' : 'base';
      parentNode.tag = `缓存命中(${cached})`;
      activeStack.pop();
      return cached;
    }

    if (j === m) {
      const matched = i === n;
      memoGrid[i][j] = matched ? 1 : 0;
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        gridHighlight: { i: Math.min(i, n), j: Math.min(j, m) },
        tag: `边界设置: memo[${i}][${j}] = ${matched}`,
        log: `| 🎯 边界基底: 模式串耗尽，写入 memo[${i}][${j}] = ${matched}`,
        msg: `模式串耗尽到达边界：写入 <code>memo[${i}][${j}] = <strong>${matched}</strong></code>。`,
        decision: `边界记录 ${matched}`,
      });
      parentNode.status = matched ? 'target' : 'base';
      parentNode.tag = matched ? '成功' : '失败';
      activeStack.pop();
      return matched;
    }

    let ans = false;
    if (p[j] !== '*') {
      pushStep({
        type: 'check-char',
        line: lineCheckChar,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `检测非星号字符 p[${j}]='${p[j]}'`,
        log: `| 🔍 非星号字符: p[${j}]='${p[j]}'，进行单字符精确或问号通配对齐`,
        msg: `非星号判定：当前模式字符为 <code>'${p[j]}'</code>，检查是否与 <code>s[${i}]</code> 对齐。`,
        decision: `非星号对齐判定`,
      });

      const first = i < n && (s[i] === p[j] || p[j] === '?');
      pushStep({
        type: 'first-match',
        line: lineFirstMatch,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `单字符对齐: ${first}`,
        log: `| 🔤 单字符判定: s[${i}]='${s[i] || 'EOF'}' 与 p[${j}]='${p[j]}' 对齐结果: ${first}`,
        msg: `单字符匹配：<code>s[${i}]='${s[i] || 'EOF'}'</code> 与 <code>p[${j}]='${p[j]}'</code> 对齐结果为 <strong>${first}</strong>。`,
        decision: `单字符判定: ${first}`,
      });

      if (first) {
        const childSingle: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j + 1, m),
          val: `dfsMemo(${i + 1},${j + 1})`,
          edgeLabel: '单字符',
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
          tag: `推进 -> dfsMemo(${i + 1}, ${j + 1})`,
          log: `| ➡️ 单字符匹配成功，双指针同步推进深入 dfsMemo(${i + 1}, ${j + 1})`,
          msg: `匹配推进：深入子问题 <code>dfsMemo(${i + 1}, ${j + 1})</code>。`,
          decision: '单字符深入',
        });

        ans = dfsMemo(i + 1, j + 1, childSingle);
      } else {
        ans = false;
      }
      pushStep({
        type: 'single-eval',
        line: lineSingleEval,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `非星号单字符结果: ${ans}`,
        log: `| 🔤 单字符求值完成: (${i}, ${j}) => ${ans}`,
        msg: `非星号求值完成：当前状态判定为 <code>${ans}</code>。`,
        decision: `单字符求值: ${ans}`,
      });
    } else {
      const childEmpty: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(i, n),
        c: Math.min(j + 1, m),
        val: `dfsMemo(${i},${j + 1})`,
        edgeLabel: '*取0次',
        status: 'current',
        children: [],
      };
      parentNode.children.push(childEmpty);

      pushStep({
        type: 'branch-call',
        line: lineBranchEmpty,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `* 匹配空串 -> dfsMemo(${i}, ${j + 1})`,
        log: `| 🃏 分支 1: 通配符 '*' 匹配空串，深入 dfsMemo(${i}, ${j + 1})`,
        msg: `完全背包分支 1：让 <code>'*'</code> 匹配空串，深入 <code>dfsMemo(${i}, ${j + 1})</code>。`,
        decision: '* 匹配 0 字符',
      });

      const resEmpty = dfsMemo(i, j + 1, childEmpty);

      let resTake = false;
      if (!resEmpty && i < n) {
        const childTake: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.min(i + 1, n),
          c: Math.min(j, m),
          val: `dfsMemo(${i + 1},${j})`,
          edgeLabel: '*吃1字符',
          status: 'current',
          children: [],
        };
        parentNode.children.push(childTake);

        pushStep({
          type: 'branch-call',
          line: lineBranchTake,
          i: Math.min(i, n),
          j: Math.min(j, m),
          activeNodeId: parentNode.id,
          tag: `* 匹配 >=1 字符 -> dfsMemo(${i + 1}, ${j})`,
          log: `| 🪙 分支 2: 通配符 '*' 吃掉字符 '${s[i]}'，深入 dfsMemo(${i + 1}, ${j})`,
          msg: `完全背包分支 2：通配符 <code>'*'</code> 吃掉当前文本字符 <code>'${s[i]}'</code>，深入 <code>dfsMemo(${i + 1}, ${j})</code>。`,
          decision: '* 匹配 >= 1 字符',
        });

        resTake = dfsMemo(i + 1, j, childTake);
      }
      ans = resEmpty || resTake;

      pushStep({
        type: 'star-eval',
        line: lineStarEval,
        i: Math.min(i, n),
        j: Math.min(j, m),
        activeNodeId: parentNode.id,
        tag: `通配符 '*' 求值: ${ans}`,
        log: `| 🃏 通配符 '*' 聚合求值: (${i}, ${j}) => ${ans}`,
        msg: `通配符 <code>'*'</code> 决策聚合：<code>dfs(${i}, ${j + 1}) || dfs(${i + 1}, ${j})</code> 结果为 <strong>${ans}</strong>。`,
        decision: `星号求值: ${ans}`,
      });
    }

    memoGrid[i][j] = ans ? 1 : 0;
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

    parentNode.status = ans ? 'target' : 'base';
    parentNode.tag = ans ? '匹配成功' : '失败';
    activeStack.pop();
    return ans;
  }

  dfsMemo(0, 0, rootNode);
  return steps;
}

// 阶段 3: 严格二维动态规划
function compileWildcardStage3Steps(
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
  const lineCheckChar = anchors?.check_char || 10;
  const lineSingleMatch = anchors?.single_match || 11;
  const lineStarSlope = anchors?.star_slope || 13;
  const lineReturn = anchors?.return || 17;

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
    decision: '设置双空基底',
  });

  // 空文本串基底行：遇到连续 '*' 可匹配空串
  for (let j = m - 1; j >= 0; j--) {
    const isStar = p[j] === '*';
    const canMatch = isStar && dp[n][j + 1] === 1;
    dp[n][j] = canMatch ? 1 : 0;

    pushStep({
      type: 'base-row',
      line: lineBaseRow,
      i: n,
      j,
      gridHighlight: { i: n, j },
      deps: isStar ? [{ r: n, c: j + 1, type: 'left', label: '*接续匹配空串' }] : undefined,
      tag: `空文本串匹配 p[${j}..]: ${Boolean(dp[n][j])}`,
      log: `| 🧩 基底行: dp[${n}][${j}] = ${Boolean(dp[n][j])}`,
      msg: `空文本串基底行考察 <code>p[${j}]='${p[j]}'</code>：${isStar ? `是通配符 <code>'*'</code>，继承右侧 <code>dp[${n}][${j + 1}] = <strong>${Boolean(dp[n][j])}</strong></code>。` : `非星号无法匹配空串，<code>dp[${n}][${j}] = <strong>false</strong></code>。`}`,
      decision: `基底 dp[${n}][${j}] = ${Boolean(dp[n][j])}`,
    });
    if (!isStar) break;
  }

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (p[j] !== '*') {
        const curMatch = s[i] === p[j] || p[j] === '?';
        dp[i][j] = curMatch && dp[i + 1][j + 1] === 1 ? 1 : 0;
        dec = curMatch
          ? p[j] === '?'
            ? `问号 '?' 通配 '${s[i]}'`
            : `单字符匹配 '${s[i]}' ↔ '${p[j]}'`
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
        const matchEmpty = dp[i][j + 1] === 1;
        const matchMore = dp[i + 1][j] === 1;
        dp[i][j] = matchEmpty || matchMore ? 1 : 0;
        dec = matchEmpty
          ? `* 匹配 0 字符成功 (借助右侧 dp[${i}][${j + 1}])`
          : matchMore
          ? `* 匹配 >=1 字符成功 (借助下方 dp[${i + 1}][${j}])`
          : `* 匹配失败`;

        pushStep({
          type: 'star-slope',
          line: lineStarSlope,
          i,
          j,
          gridHighlight: { i, j },
          deps: [
            { r: i, c: j + 1, type: 'left', label: '*取0字符' },
            { r: i + 1, c: j, type: 'top', label: '*取>=1字符' },
          ],
          tag: `dp[${i}][${j}] = ${Boolean(dp[i][j])}`,
          log: `| 🃏 通配符星号斜率优化: dp[${i}][${j}] = ${Boolean(dp[i][j])} (${dec})`,
          msg: `通配符 <code>'*'</code> 斜率优化：<code>dp[${i}][${j}] = dp[${i}][${j + 1}] || dp[${i + 1}][${j}] = <strong>${Boolean(dp[i][j])}</strong></code>。`,
          decision: dec,
        });
      }
    }
  }

  const finalAns = dp[0][0] === 1;
  pushStep({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    gridHighlight: { i: 0, j: 0 },
    tag: `最终答案 dp[0][0] = ${finalAns}`,
    log: `| 🏆 匹配完成: dp[0][0] = ${finalAns}`,
    msg: `🎉 填表完毕！左上角 <code>dp[0][0] = <strong>${finalAns}</strong></code>，整个文本串与模式串 ${finalAns ? '完全匹配' : '匹配失败'}！`,
    decision: `完成判定: ${finalAns}`,
  });

  return steps;
}

// 阶段 4: 两行滚动数组空间压缩
function compileWildcardStage4Steps(
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
  for (let j = m - 1; j >= 0 && p[j] === '*'; j--) {
    nextRow[j] = 1;
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
    msg: `初始化 <code>${m + 1}</code> 长度的一维滚动向量，空间复杂度从 O(NM) 降至 O(M)。`,
    decision: '初始化滚动向量',
  });

  for (let i = n - 1; i >= 0; i--) {
    const curRow = new Array(m + 1).fill(0);

    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (p[j] !== '*') {
        const curMatch = s[i] === p[j] || p[j] === '?';
        curRow[j] = curMatch && nextRow[j + 1] === 1 ? 1 : 0;
        dec = curMatch ? `单字符匹配` : `单字符失配`;

        pushStep({
          type: 'single-match',
          line: lineSingleMatch,
          activeSlot: j,
          tag: `cur[${j}] = ${Boolean(curRow[j])}`,
          log: `| ➡️ 行内单字符对齐: cur[${j}] = ${Boolean(curRow[j])} (${dec})`,
          msg: `计算当前行 <code>cur[${j}]</code>：<code>s[${i}]</code> 对齐 <code>p[${j}]</code>，依赖 <code>next[${j + 1}]</code>，结果为 <strong>${Boolean(curRow[j])}</strong>。`,
          decision: dec,
        });
      } else {
        const matchEmpty = curRow[j + 1] === 1;
        const matchMore = nextRow[j] === 1;
        curRow[j] = matchEmpty || matchMore ? 1 : 0;
        dec = matchEmpty ? `* 取空串` : matchMore ? `* 取字符` : `* 失配`;

        pushStep({
          type: 'star-slope',
          line: lineStarSlope,
          activeSlot: j,
          tag: `cur[${j}] = ${Boolean(curRow[j])}`,
          log: `| 🃏 通配符斜率更新: cur[${j}] = next[${j}] || cur[${j + 1}] => ${Boolean(curRow[j])}`,
          msg: `通配符 <code>'*'</code> 滚动转移：<code>cur[${j}] = next[${j}] || cur[${j + 1}] = <strong>${Boolean(curRow[j])}</strong></code>。`,
          decision: dec,
        });
      }
    }

    nextRow = [...curRow];
    pushStep({
      type: 'roll',
      line: lineRoll,
      activeSlot: 0,
      tag: `完成第 ${i} 行，滚动更新 next = cur`,
      log: `| 🔄 第 ${i} 行推导完成，两行向量发生滚动置换`,
      msg: `完成第 <code>${i}</code> 行计算，当前行置换为下一轮的 <code>next</code> 向量。`,
      decision: '滚动数组置换',
    });
  }

  const finalAns = nextRow[0] === 1;
  pushStep({
    type: 'return',
    line: lineReturn,
    activeSlot: 0,
    tag: `最终答案 next[0] = ${finalAns}`,
    log: `| 🏆 空间压缩推导完成: next[0] = ${finalAns}`,
    msg: `🎉 空间压缩推导完成！最终答案 <code>next[0] = <strong>${finalAns}</strong></code>。`,
    decision: `完成判定: ${finalAns}`,
  });

  return steps;
}
