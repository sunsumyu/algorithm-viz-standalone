import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

/**
 * 线性一维 DP (斐波那契数 / 爬楼梯) 独立策略
 */
export class Linear1DStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: 'fibonacci' | 'climb-stairs') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, isMemo, anchorMap } = params;
    const len = Math.max(m, n);

    switch (stage) {
      case 1:
      case 2:
        return this.generateStage1or2(model, len, Boolean(isMemo), anchorMap);
      case 3:
        return this.generateStage3(model, len, anchorMap);
      case 4:
        return this.generateStage4(model, len, anchorMap);
      default:
        return [];
    }
  }

  public generateStage1or2(
    model: IYamlAlgorithmModel,
    nVal: number,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const funcName = isFib ? 'fib' : 'climbStairs';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 6);

    const generated: UniversalStep[] = [];
    const memoCache: Record<number, number> = {};
    const dpState: number[] = new Array(n + 1).fill(null);
    let callCount = 0;
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 1);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 8 : 2);
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 9 : 3);
    const lineBranchLeft = anchorMap?.branch_left || (isMemo ? 10 : 3);
    const lineBranchRight = anchorMap?.branch_right || (isMemo ? 11 : 4);
    const lineCombine = anchorMap?.combine || (isMemo ? 12 : 5);
    const lineReturn = anchorMap?.return || (isMemo ? 5 : 5);

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: n,
      c: 0,
      val: `${funcName}(${n})`,
      status: 'current',
      children: []
    };

    function isBaseCase(k: number): boolean {
      if (isFib) {
        return k <= 0 || k === 1;
      }
      return k <= 1;
    }

    function getBaseValue(k: number): number {
      if (isFib) {
        return k <= 0 ? 0 : 1;
      }
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
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineEntry,
        tag: `调用 #${callCount} (${funcName}(${k}))`,
        log: `| 📥 进入 ${funcName}(n=${k}) [调用 #${callCount}]`,
        msg: `📥 进入 <code>${funcName}(${k})</code>，向下展开子状态分支。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (isBaseCase(k)) {
        const baseVal = getBaseValue(k);
        dpState[k] = baseVal;
        currentNode.status = 'base';
        currentNode.tag = `= ${baseVal}`;

        generated.push({
          type: 'boundary',
          i: k,
          j: 0,
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
          i: k,
          j: 0,
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

      // 分支 1: n - 1
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
        i: k,
        j: 0,
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

      // 分支 2: n - 2
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
        i: k,
        j: 0,
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
      const res = leftVal + rightVal;
      if (isMemo) memoCache[k] = res;
      dpState[k] = res;

      currentNode.status = 'visited';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineCombine,
        tag: '合并子问题',
        log: `| ✨ 合并: ${funcName}(${k}) = ${leftVal} + ${rightVal} = ${res}${isMemo ? ' [写入备忘录]' : ''}`,
        msg: `✨ 汇总子问题：<code>${funcName}(${k}) = ${leftVal} + ${rightVal} = <strong>${res}</strong></code>${isMemo ? '，写入 memo' : ''}。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      return res;
    }

    const total = dfs(n, rootNode);

    generated.push({
      type: 'return',
      i: n,
      j: 0,
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

  public generateStage3(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];
    const dp = new Array(n + 1).fill(null);

    const lineInit = anchorMap?.init || 3;
    const lineInitVal = anchorMap?.init_val || 4;
    const lineTransfer = anchorMap?.transfer || 7;
    const lineReturn = anchorMap?.return || 9;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: [JSON.parse(JSON.stringify(dp))],
      memo: [...dp],
      tag: '初始化 DP 数组',
      log: `| 📦 创建一维 DP 状态数组 dp[0..${n}]`,
      msg: `创建长度为 ${n + 1} 的一维 DP 数组，准备自底向上顺序填表。`
    });

    if (isFib) {
      dp[0] = 0;
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: 'Base Case dp[0]=0',
        log: `| 🎬 初始化 Base Case: dp[0] = 0`,
        msg: `初始化 <code>dp[0] = 0</code>。`
      });
      if (n >= 1) {
        dp[1] = 1;
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: 1,
          j: 0,
          activeSlot: 1,
          grid: [JSON.parse(JSON.stringify(dp))],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code>。`
        });
      }
    } else {
      dp[0] = 1;
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: 'Base Case dp[0]=1',
        log: `| 🎬 初始化 Base Case: dp[0] = 1`,
        msg: `初始化 <code>dp[0] = 1</code> (站在地面直达1种方案)。`
      });
      if (n >= 1) {
        dp[1] = 1;
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: 1,
          j: 0,
          activeSlot: 1,
          grid: [JSON.parse(JSON.stringify(dp))],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code> (跨1阶直达1种方案)。`
        });
      }
    }

    for (let i = 2; i <= n; i++) {
      const prev1 = dp[i - 1];
      const prev2 = dp[i - 2];
      const sum = prev1 + prev2;
      dp[i] = sum;

      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i,
        j: 0,
        activeSlot: i,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: `状态转移 dp[${i}]`,
        log: `| 🔄 dp[${i}] = dp[${i - 1}](${prev1}) + dp[${i - 2}](${prev2}) = ${sum}`,
        msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] (${prev1}) + dp[${i - 2}] (${prev2}) = <strong>${sum}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      grid: [JSON.parse(JSON.stringify(dp))],
      memo: [...dp],
      tag: '最终答案',
      log: `| 🏆 填表计算完成！最终结果 dp[${n}] = ${dp[n]}`,
      msg: `🏆 递推填表完成！最终答案: <code>dp[${n}] = <strong>${dp[n]}</strong></code>。`
    });

    return steps;
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];

    const lineInit = anchorMap?.init || 3;
    const lineAccumulate = anchorMap?.accumulate || 5;
    const lineFetchDown = anchorMap?.fetch_down || 6;
    const lineFetchRight = anchorMap?.fetch_right || 7;
    const lineReturn = anchorMap?.return || 9;

    let p = isFib ? 0 : 1;
    let q = 1;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      down: p,
      right: q,
      memoj: p,
      tag: '初始化双变量',
      log: `| 📦 初始化滚动状态: p = ${p}, q = ${q} [空间复杂度 O(1)]`,
      msg: `初始化双滚动变量 <code>p = ${p}, q = ${q}</code>，空间复杂度降至 <strong>O(1)</strong>。`
    });

    for (let i = 2; i <= n; i++) {
      const r = p + q;

      steps.push({
        type: 'accumulate',
        line: lineAccumulate,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'updated',
        down: p,
        right: q,
        memoj: r,
        tag: `计算当前值 i=${i}`,
        log: `| ✨ 计算当前项: r = p(${p}) + q(${q}) = ${r}`,
        msg: `计算当前项：<code>r = p (${p}) + q (${q}) = <strong>${r}</strong></code>。`
      });

      p = q;
      steps.push({
        type: 'fetch-down',
        line: lineFetchDown,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'down',
        down: p,
        right: q,
        memoj: r,
        tag: '滑动更新 p = q',
        log: `| ⬇️ 滑动状态: p = q (${p})`,
        msg: `滚动变量前移：<code>p = q (${p})</code>。`
      });

      q = r;
      steps.push({
        type: 'fetch-right',
        line: lineFetchRight,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'right',
        down: p,
        right: q,
        memoj: q,
        tag: '滑动更新 q = r',
        log: `| ➡️ 滑动状态: q = r (${q})`,
        msg: `滚动变量前移：<code>q = r (${q})</code>。`
      });
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      slotMode: 'final',
      down: p,
      right: q,
      memoj: q,
      tag: '最终答案',
      log: `| 🏆 O(1) 滚动完成！最终答案 = ${q}`,
      msg: `🏆 O(1) 滚动压缩计算完成！最终结果: <strong>${q}</strong>。`
    });

    return steps;
  }
}
