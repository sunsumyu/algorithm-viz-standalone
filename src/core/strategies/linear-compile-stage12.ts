/**
 * 基础线性 DP 统一步骤矩阵编译器 — Stage 1 & 2：递归树展开与记忆化剪枝（重叠子问题监控）
 * 从 linear-step-matrix-compiler 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import { type UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

export function compileLinearStage1or2(
  model: IYamlAlgorithmModel,
  nVal: number,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>
): UniversalStep[] {
  const modelId = model.id;
  const generated: UniversalStep[] = [];
  const memoCache: Record<number, number> = {};
  let callCount = 0;
  let nodeIdCounter = 0;

  const lineEntry = anchorMap?.entry || (isMemo ? 7 : 1);
  const lineBoundary = anchorMap?.boundary || (isMemo ? 8 : 2);
  const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 9 : 3);
  const lineBranchLeft = anchorMap?.branch_left || (isMemo ? 10 : 3);
  const lineBranchRight = anchorMap?.branch_right || (isMemo ? 11 : 4);
  const lineCombine = anchorMap?.combine || (isMemo ? 12 : 5);
  const lineReturn = anchorMap?.return || (isMemo ? 5 : 5);

  // 针对不同算法配置元数据
  let funcName = 'solve';
  let maxSafeN = 6;
  if (modelId === 'fibonacci') {
    funcName = 'fib';
    maxSafeN = 6;
  } else if (modelId === 'climb-stairs') {
    funcName = 'climbStairs';
    maxSafeN = 5;
  } else if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
    funcName = 'minCost';
    maxSafeN = 4;
  } else if (modelId === 'integer-break') {
    funcName = 'integerBreak';
    maxSafeN = 6;
  } else if (modelId === 'unique-bst') {
    funcName = 'numTrees';
    maxSafeN = 4;
  } else if (modelId === 'decode-ways') {
    funcName = 'numDecodings';
    maxSafeN = 4;
  }

  const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), maxSafeN);
  const dpState: number[] = new Array(n + 1).fill(null);

  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: n,
    c: 0,
    val: `${funcName}(${n})`,
    status: 'current',
    children: []
  };

  function isBase(k: number): boolean {
    if (modelId === 'fibonacci') return k <= 0 || k === 1;
    if (modelId === 'climb-stairs') return k <= 1;
    if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') return k <= 1;
    if (modelId === 'integer-break') return k <= 2;
    if (modelId === 'unique-bst') return k <= 1;
    if (modelId === 'decode-ways') return k <= 1;
    return k <= 1;
  }

  function getBaseVal(k: number): number {
    if (modelId === 'fibonacci') return k <= 0 ? 0 : 1;
    if (modelId === 'climb-stairs') return 1;
    if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') return 0;
    if (modelId === 'integer-break') return 1;
    if (modelId === 'unique-bst') return 1;
    if (modelId === 'decode-ways') return 1;
    return 1;
  }

  function dfs(k: number, currentNode: UniversalTreeNode): number {
    callCount++;
    const isRepeated = !isMemo && memoCache[k] !== undefined;
    currentNode.status = 'current';
    if (isRepeated) {
      currentNode.tag = '⚠️重复';
    }

    generated.push({
      type: 'dfs-call',
      i: 0,
      j: k,
      activeSlot: k,
      grid: [JSON.parse(JSON.stringify(dpState))],
      memo: [...dpState],
      line: lineEntry,
      tag: `调用 #${callCount} (${funcName}(${k}))`,
      log: `| 📥 进入 ${funcName}(n=${k}) [调用 #${callCount}]`,
      msg: `📥 进入 <code>${funcName}(${k})</code>，向下展开子状态分支。`,
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    if (isBase(k)) {
      const baseVal = getBaseVal(k);
      dpState[k] = baseVal;
      currentNode.status = 'base';
      currentNode.tag = `= ${baseVal}`;

      generated.push({
        type: 'boundary',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineBoundary,
        tag: 'Base Case',
        log: `| 🎬 满足 Base Case: ${funcName}(${k}) = ${baseVal}`,
        msg: `🎬 达到基础边界条件：<code>${funcName}(${k}) = <strong>${baseVal}</strong></code>，直接返回。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });
      return baseVal;
    }

    if (isMemo && memoCache[k] !== undefined) {
      currentNode.status = 'pruned';
      currentNode.tag = `⚡=${memoCache[k]}`;

      generated.push({
        type: 'cache-hit',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineCacheHit,
        tag: '⚡ 备忘录命中',
        log: `| ⚡ 【备忘录命中剪枝】memo[${k}] 已缓存 ${memoCache[k]}！直接 O(1) 返回`,
        msg: `⚡ 【备忘录剪枝】<code>memo[${k}]</code> 已命中缓存 <strong>${memoCache[k]}</strong>，无需重复递归！`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });
      return memoCache[k];
    }

    memoCache[k] = (memoCache[k] || 0) + 1;

    let res = 0;

    if (modelId === 'integer-break') {
      // 整数拆分多分支枚举
      let maxProd = 0;
      for (let j = 1; j <= Math.floor(k / 2); j++) {
        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: k - j,
          c: j,
          val: `拆分 ${j}+(${k - j})`,
          status: 'normal',
          children: []
        };
        currentNode.children.push(childNode);

        generated.push({
          type: 'branch-left',
          i: 0,
          j: k,
          activeSlot: k,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineBranchLeft,
          tag: `拆出 ${j}`,
          log: `| ↙️ 枚举拆出 ${j}，剩余 ${k - j}`,
          msg: `枚举拆出 <code>j = ${j}</code>，子问题为拆分 <code>${k - j}</code>。`,
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const subVal = dfs(k - j, childNode);
        const currentProd = Math.max(j * (k - j), j * subVal);
        maxProd = Math.max(maxProd, currentProd);
      }
      res = maxProd;
    } else if (modelId === 'unique-bst') {
      // BST 笛卡尔积枚举
      let totalWays = 0;
      for (let j = 1; j <= k; j++) {
        const childLeft: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: j - 1,
          c: 0,
          val: `左子树(${j - 1})`,
          status: 'normal',
          children: []
        };
        const childRight: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: k - j,
          c: 0,
          val: `右子树(${k - j})`,
          status: 'normal',
          children: []
        };
        currentNode.children.push(childLeft, childRight);

        const leftWays = dfs(j - 1, childLeft);
        const rightWays = dfs(k - j, childRight);
        totalWays += leftWays * rightWays;
      }
      res = totalWays;
    } else {
      // 标准二分支 (Fibonacci, ClimbStairs, MinCost, DecodeWays)
      const leftNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: k - 1,
        c: 0,
        val: `${funcName}(${k - 1})`,
        status: 'normal',
        children: []
      };
      currentNode.children.push(leftNode);

      generated.push({
        type: 'branch-left',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineBranchLeft,
        tag: `计算 ${funcName}(${k - 1})`,
        log: `| ↙️ 递归求解左分支 ${funcName}(${k - 1})`,
        msg: `↙️ 执行 <code>${funcName}(${k - 1})</code>，进入左子分支计算。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const leftVal = dfs(k - 1, leftNode);

      const rightNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: k - 2,
        c: 0,
        val: `${funcName}(${k - 2})`,
        status: 'normal',
        children: []
      };
      currentNode.children.push(rightNode);

      generated.push({
        type: 'branch-right',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineBranchRight,
        tag: `计算 ${funcName}(${k - 2})`,
        log: `| ↘️ 递归求解右分支 ${funcName}(${k - 2}) [左分支已得 ${leftVal}]`,
        msg: `↘️ 执行 <code>${funcName}(${k - 2})</code>，左分支已得 ${leftVal}，进入右子分支。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const rightVal = dfs(k - 2, rightNode);

      if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
        const cost = [10, 15, 20, 25, 30];
        const cost1 = cost[k - 1] || 10;
        const cost2 = cost[k - 2] || 15;
        res = Math.min(leftVal + cost1, rightVal + cost2);
      } else {
        res = leftVal + rightVal;
      }
    }

    if (isMemo) memoCache[k] = res;
    dpState[k] = res;
    currentNode.status = 'visited';
    currentNode.tag = `= ${res}`;

    generated.push({
      type: 'update',
      i: 0,
      j: k,
      activeSlot: k,
      grid: [JSON.parse(JSON.stringify(dpState))],
      memo: [...dpState],
      line: lineCombine,
      tag: '合并子问题',
      log: `| ✨ 合并: ${funcName}(${k}) = ${res}${isMemo ? ' [写入备忘录]' : ''}`,
      msg: `✨ 汇总子问题：<code>${funcName}(${k}) = <strong>${res}</strong></code>${isMemo ? '，写入 memo' : ''}。`,
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return res;
  }

  const total = dfs(n, rootNode);

  generated.push({
    type: 'return',
    i: 0,
    j: n,
    activeSlot: n,
    grid: [JSON.parse(JSON.stringify(dpState))],
    memo: [...dpState],
    line: lineReturn,
    tag: '最终答案',
    log: `| 🏆 最终答案: ${funcName}(${n}) = ${total}`,
    msg: `🏆 演化计算完成！最终结果: <code>${funcName}(${n}) = <strong>${total}</strong></code>。`,
    activeNodeId: rootNode.id,
    treeRoot: cloneTree(rootNode)
  });

  return generated;
}

/**
 * Stage 3: 一维自底向上 DP 表递推
 */
