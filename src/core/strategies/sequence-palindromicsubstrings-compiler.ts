import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';


export function compilePalindromicSubstringsStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, boolean> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let count = 0;

    const lineCheck = anchorMap?.check || 6;
    const lineBoundary = anchorMap?.boundary || (isMemo ? 17 : 16);
    const lineCacheHit = anchorMap?.cache_hit || 19;
    const lineDiff = anchorMap?.diff || (isMemo ? 21 : 18);
    const lineRecurse = anchorMap?.recurse || (isMemo ? 23 : 20);
    const lineReturn = anchorMap?.return || 12;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `countSubstrings("${s}")`,
      status: 'current',
      children: []
    };

    function isPalindrome(i: number, j: number, parentNode?: UniversalTreeNode): boolean {
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);

      const currentNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i,
        c: j,
        val: `isPalin(${i},${j}): "${s.slice(i, j + 1)}"`,
        status: 'current',
        children: []
      };
      if (parentNode) {
        parentNode.children.push(currentNode);
      }

      generated.push({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCheck,
        tag: `检验区间 [${i}, ${j}] "${s.slice(i, j + 1)}"`,
        log: `| 🔍 检验子串 [${i}, ${j}] "${s.slice(i, j + 1)}" 是否为回文`,
        msg: `检验子串 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 的回文性。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (i >= j) {
        gridState[i][j] = 1;
        currentNode.status = 'base';
        currentNode.tag = '= true (Base)';

        generated.push({
          type: 'boundary',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: 'Base Case (长度<=1)',
          log: `| 🎬 满足 Base Case: i >= j (i=${i}, j=${j})，长度 <= 1 必然回文，返回 true`,
          msg: `🎬 满足 <code>i >= j</code>：长度 <= 1 的子串必定为回文，返回 <strong>true</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return true;
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentNode.status = 'pruned';
        currentNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      if (s[i] !== s[j]) {
        if (isMemo) memoCache[key] = false;
        gridState[i][j] = 0;
        currentNode.status = 'pruned';
        currentNode.tag = '= false';

        generated.push({
          type: 'diff-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDiff,
          tag: `端点不同 '${s[i]}' != '${s[j]}'`,
          log: `| ❌ 端点字符不匹配 s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，判定非回文`,
          msg: `❌ 端点字符不匹配 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，子串必定非回文，返回 <strong>false</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return false;
      }

      generated.push({
        type: 'match-branch',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `端点相同 '${s[i]}'，递推内层`,
        log: `| 🔀 端点字符相同 s[${i}] == s[${j}] ('${s[i]}')，继续检验内层子串 isPalindrome(${i + 1}, ${j - 1})`,
        msg: `🔀 端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>，继续递归检验内层子串 <code>[${i + 1}..${j - 1}]</code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const res = isPalindrome(i + 1, j - 1, currentNode);

      if (isMemo) memoCache[key] = res;
      gridState[i][j] = res ? 1 : 0;

      currentNode.status = res ? 'visited' : 'pruned';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `区间 [${i}, ${j}] 判定为 ${res}`,
        log: `| ✨ 区间 [${i}, ${j}] "${s.slice(i, j + 1)}" 判定结果: ${res}${isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 区间 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 判定结果为 <strong>${res}</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      activeStack.pop();
      return res;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (isPalindrome(i, j, rootNode)) {
          count++;
        }
      }
    }

    generated.push({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终统计总数',
      log: `| 🏆 回文子串统计演化完成！countSubstrings("${s}") = ${count}`,
      msg: `🏆 演化计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为 <strong>${count}</strong>。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

export function compilePalindromicSubstringsStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineInit = anchorMap?.init || 4;
    const lineCond = anchorMap?.cond || 12;
    const lineTransferShort = anchorMap?.transfer_short || 14;
    const lineTransferSub = anchorMap?.transfer_sub || 18;
    const lineReturn = anchorMap?.return || 25;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 n×n 上三角状态表',
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (仅填上三角 i <= j)`,
      msg: `创建 <code>${n}×${n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 是否为回文。`
    });

    for (let i = n - 1; i >= 0; i--) {
      for (let j = i; j < n; j++) {
        const isMatch = s[i] === s[j];

        if (isMatch) {
          if (j - i <= 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferShort,
              i,
              j,
              topI: -1,
              topJ: -1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `长度 <= 2 回文: "${s.slice(i, j + 1)}"`,
              log: `| 🎬 s[${i}] == s[${j}] ('${s[i]}') 且长度 <= 2: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code> 且长度 <code>${j - i + 1} <= 2</code>：<code>dp[${i}][${j}] = true</code>，回文总数累加至 <strong>${count}</strong>。`
            });
          } else if (dp[i + 1][j - 1] === 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层回文: dp[${i}][${j}] = true`,
              log: `| 🔄 s[${i}] == s[${j}] 且内层 dp[${i + 1}][${j - 1}] == true: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同且内层 <code>dp[${i + 1}][${j - 1}] == true</code>：<code>dp[${i}][${j}] = true</code>，回文子串 <code>"${s.slice(i, j + 1)}"</code> 成立，总数 = <strong>${count}</strong>。`
            });
          } else {
            dp[i][j] = 0;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层非回文: dp[${i}][${j}] = false`,
              log: `| ❌ s[${i}] == s[${j}] 但内层 dp[${i + 1}][${j - 1}] == false: dp[${i}][${j}] = false`,
              msg: `端点虽相同但内层 <code>dp[${i + 1}][${j - 1}] == false</code>：<code>dp[${i}][${j}] = false</code>。`
            });
          }
        } else {
          dp[i][j] = 0;

          steps.push({
            type: 'transfer',
            line: lineCond,
            i,
            j,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点不同: dp[${i}][${j}] = false`,
            log: `| ❌ s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): dp[${i}][${j}] = false`,
            msg: `端点字符不匹配 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>dp[${i}][${j}] = false</code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！回文子串总数 count = ${count}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${s}"</code> 中共有 <strong>${count}</strong> 个回文子串。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

export function compilePalindromicSubstringsStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineLoopCenter = anchorMap?.loop_center || 5;
    const lineMatchInc = anchorMap?.match_inc || 12;
    const lineReturn = anchorMap?.return || 18;

    steps.push({
      type: 'init',
      line: lineLoopCenter,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化中心扩散',
      log: `| 📦 准备遍历 2n-1 = ${2 * n - 1} 个回文中心`,
      msg: `准备遍历 <code>${2 * n - 1}</code> 个潜在回文中心（包含 <code>${n}</code> 个单字符中心与 <code>${n - 1}</code> 个双字符间隙）。`
    });

    for (let center = 0; center < 2 * n - 1; center++) {
      let l = Math.floor(center / 2);
      let r = l + (center % 2);
      const isOdd = center % 2 === 0;

      steps.push({
        type: 'init-center',
        line: lineLoopCenter,
        i: l,
        j: r,
        activeSlot: l,
        slotMode: 'updated',
        memoj: count,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `中心 #${center} (${isOdd ? `单字符 '${s[l]}'` : `间隙 '${s[l]}'-'${s[r]}'`})`,
        log: `| 🎯 探索中心 #${center}: l=${l}, r=${r} [${isOdd ? `奇数中心 "${s[l]}"` : `偶数间隙 "${s[l]}|${s[r]}"`}]`,
        msg: `探索回文中心 <code>#${center}</code>：<code>l = ${l}, r = ${r}</code>（${isOdd ? `单字符 "${s[l]}"` : `双字符间隙 "${s[l]}|${s[r]}"`}）。`
      });

      while (l >= 0 && r < n && s[l] === s[r]) {
        count++;
        memo[l] = count;
        gridState[l][r] = 1;

        steps.push({
          type: 'spread',
          line: lineMatchInc,
          i: l,
          j: r,
          activeSlot: l,
          slotMode: 'updated',
          down: l,
          right: r,
          memoj: count,
          memo: [...memo],
          memoSnapshot: [...memo],
          grid: JSON.parse(JSON.stringify(gridState)),
          tag: `扩散命中: "${s.slice(l, r + 1)}" (count=${count})`,
          log: `| ✨ 双向扩散成功 s[${l}] == s[${r}] ('${s[l]}'): 发现回文子串 "${s.slice(l, r + 1)}", count = ${count}`,
          msg: `双向扩散成功 <code>s[${l}] == s[${r}] == '${s[l]}'</code>：发现回文子串 <code>"${s.slice(l, r + 1)}"</code>，回文总数累加至 <strong>${count}</strong>。`
        });

        l--;
        r++;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      activeSlot: n - 1,
      slotMode: 'final',
      down: count,
      right: count,
      memoj: count,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 中心扩散完成！回文子串总数 count = ${count}`,
      msg: `🏆 中心扩散法计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为: <strong>${count}</strong>。`
    });

    return steps;
  }

