import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build1DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export type HouseRobberModelId =
  | 'house-robber'
  | 'house-robber-ii'
  | 'house-robber-iii';

/**
 * 打家劫舍家族独立算法策略模块 (HouseRobberStrategy)
 * 覆盖全部 3 道经典打家劫舍题型：
 * - 打家劫舍 I (LC 198): 线性间隔选优
 * - 打家劫舍 II (LC 213): 环形数组拆解为两个单链线性问题
 * - 打家劫舍 III (LC 337): 树形 DP 后序遍历
 */
export class HouseRobberStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: HouseRobberModelId | string = 'house-robber') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'house-robber' && (modelId === 'rob' || modelId === 'house-robber-1')) ||
      (this.modelId === 'house-robber-ii' && (modelId === 'rob2' || modelId === 'house-robber-2')) ||
      (this.modelId === 'house-robber-iii' && (modelId === 'rob3' || modelId === 'house-robber-3'))
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (this.modelId) {
      case 'house-robber-ii':
        return this.compileHouseRobberII(model, stage, Boolean(isMemo), anchorMap);
      case 'house-robber-iii':
        return this.compileHouseRobberIII(model, stage, Boolean(isMemo), anchorMap);
      case 'house-robber':
      default:
        return this.compileHouseRobberI(model, stage, Boolean(isMemo), anchorMap);
    }
  }

  // =========================================================================
  // 1. 打家劫舍 I (House Robber I, LC 198)
  // =========================================================================
  private compileHouseRobberI(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [2, 7, 9, 3, 1];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const n = nums.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      const memo: Record<number, number> = {};
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: `rob(0)`,
        status: 'current',
        children: []
      };

      function rob(idx: number, node: UniversalTreeNode): number {
        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 4,
          i: 0,
          j: idx < n ? idx : n - 1,
          activeSlot: idx < n ? idx : n - 1,
          highlightSlots: [idx < n ? idx : n - 1],
          tag: `考察房屋 #${idx}`,
          log: `| ➡️ 递归考察房屋 ${idx} (金额 ${idx < n ? nums[idx] : 0})`,
          msg: `进入递归：考察房屋 <code>${idx}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map((_, k) => memo[k] ?? 0)
        });

        if (idx >= n) {
          node.status = 'base';
          node.tag = '= 0';
          return 0;
        }
        if (isMemo && memo[idx] !== undefined) {
          node.status = 'visited';
          node.tag = `⚡=${memo[idx]}`;
          steps.push({
            type: 'memo-hit',
            line: anchorMap?.memo || 3,
            i: 0,
            j: idx,
            activeSlot: idx,
            highlightSlots: [idx],
            tag: `缓存命中 memo[${idx}]=${memo[idx]}`,
            log: `| ⚡ 命中缓存 memo[${idx}] = ${memo[idx]}，直接剪枝返回`,
            msg: `命中缓存 <code>memo[${idx}] = ${memo[idx]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
            dp1d: nums.map((_, k) => memo[k] ?? 0)
          });
          return memo[idx];
        }

        // 决策 1: 不偷当前房屋 -> rob(idx + 1)
        const childNotRob: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: idx + 1, c: 0, val: `rob(${idx + 1})`, edgeLabel: '不偷', status: 'current', children: [] };
        node.children.push(childNotRob);
        const notRobVal = rob(idx + 1, childNotRob);

        // 决策 2: 偷当前房屋 -> nums[idx] + rob(idx + 2)
        const childRob: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: idx + 2, c: 0, val: `rob(${idx + 2})`, edgeLabel: `偷(+${nums[idx]})`, status: 'current', children: [] };
        node.children.push(childRob);
        const robVal = nums[idx] + rob(idx + 2, childRob);

        const res = Math.max(notRobVal, robVal);
        if (isMemo) memo[idx] = res;
        node.status = 'visited';
        node.tag = `= ${res}`;

        steps.push({
          type: 'dfs-return',
          line: anchorMap?.return || 10,
          i: 0,
          j: idx,
          activeSlot: idx,
          highlightSlots: [idx],
          tag: `房屋 #${idx} 返回 ${res}`,
          log: `| ⬅️ 房屋 ${idx} 决策返回 max(不偷:${notRobVal}, 偷:${robVal}) = ${res}`,
          msg: `房屋 <code>${idx}</code> 决策结果为 <strong>${res}</strong>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map((_, k) => memo[k] ?? 0)
        });

        return res;
      }

      rob(0, rootNode);
      return steps;
    }

    // Stage 3 & 4: DP
    const steps: UniversalStep[] = [];
    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    if (n > 1) dp[1] = Math.max(nums[0], nums[1]);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: 0,
      highlightSlots: [0, Math.min(1, n - 1)],
      tag: `初始化 dp[0]=${dp[0]}, dp[1]=${dp[1] ?? dp[0]}`,
      log: `| 📋 初始化 dp[0] = nums[0] = ${dp[0]}, dp[1] = max(nums[0], nums[1]) = ${dp[1] ?? dp[0]}`,
      msg: `初始化基础边界：<code>dp[0] = ${dp[0]}</code>，<code>dp[1] = ${dp[1] ?? dp[0]}</code>。`
    });

    for (let i = 2; i < n; i++) {
      const notRob = dp[i - 1];
      const rob = dp[i - 2] + nums[i];
      dp[i] = Math.max(notRob, rob);

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dp]],
        memo: [...dp],
        dp1d: [...dp],
        activeSlot: i,
        currentI: i,
        srcSlots: [i - 1, i - 2],
        highlightSlots: [i],
        tag: `dp[${i}] = max(${notRob}, ${rob}) = ${dp[i]}`,
        log: `| ⚡ 状态转移: 房屋 ${i} (金额 ${nums[i]})，dp[${i}] = max(不偷:${notRob}, 偷:${rob}) = ${dp[i]}`,
        msg: `决策房屋 <code>${i}</code>：<code>dp[${i}] = max(dp[${i - 1}], dp[${i - 2}] + ${nums[i]}) = <strong>${dp[i]}</strong></code>。`
      });
    }

    const finalAns = dp[n - 1];
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `最大可偷窃金额: ${finalAns}`,
      log: `| 🏆 计算完成！最大金额 dp[${n - 1}] = ${finalAns}`,
      msg: `🏆 演化推导完成！在不触发警报的前提下最多可偷窃金额为 <strong>${finalAns}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, 'house-robber', step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  // =========================================================================
  // 2. 打家劫舍 II (House Robber II, LC 213 - 环形拆解)
  // =========================================================================
  private compileHouseRobberII(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 2, 3, 1];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const n = nums.length;
    if (n === 1) {
      return [{
        type: 'return',
        line: 1,
        i: 0,
        j: 0,
        grid: [[nums[0]]],
        memo: [nums[0]],
        dp1d: [nums[0]],
        activeSlot: 0,
        highlightSlots: [0],
        tag: `单房屋收益: ${nums[0]}`,
        log: `| 🏆 只有 1 间房屋，直接返回 ${nums[0]}`,
        msg: `只有 1 间房屋，直接返回 <strong>${nums[0]}</strong>。`
      }];
    }

    const steps: UniversalStep[] = [];
    const rangeA = nums.slice(0, n - 1);
    const rangeB = nums.slice(1);

    function solveRange(arr: number[]): number {
      let prev = 0, curr = 0;
      for (const x of arr) {
        const next = Math.max(curr, prev + x);
        prev = curr;
        curr = next;
      }
      return curr;
    }

    const ansA = solveRange(rangeA);
    const ansB = solveRange(rangeB);
    const finalAns = Math.max(ansA, ansB);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...nums]],
      memo: [...nums],
      dp1d: [...nums],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '环形数组拆解为两个单链',
      log: `| 📋 环形首尾相连：拆分为 [0..${n - 2}] 和 [1..${n - 1}] 两个独立子问题`,
      msg: `首尾成环：成环冲突通过分解为 <code>[0..${n - 2}]</code>（不偷末尾）与 <code>[1..${n - 1}]</code>（不偷首位）两段线性 DP。`
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 6,
      i: 0,
      j: n - 2,
      grid: [[...nums]],
      memo: [...nums],
      dp1d: [...nums],
      activeSlot: n - 2,
      highlightSlots: [0, n - 2],
      tag: `区间 A [0..${n - 2}] 最大值 = ${ansA}`,
      log: `| ⚡ 子问题 A 计算: 忽略尾房，区间 [${rangeA.join(', ')}] 最大收益 = ${ansA}`,
      msg: `子问题 1 计算：区间 <code>[0..${n - 2}]</code> 最大收益为 <strong>${ansA}</strong>。`
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 7,
      i: 0,
      j: n - 1,
      grid: [[...nums]],
      memo: [...nums],
      dp1d: [...nums],
      activeSlot: n - 1,
      highlightSlots: [1, n - 1],
      tag: `区间 B [1..${n - 1}] 最大值 = ${ansB}`,
      log: `| ⚡ 子问题 B 计算: 忽略首房，区间 [${rangeB.join(', ')}] 最大收益 = ${ansB}`,
      msg: `子问题 2 计算：区间 <code>[1..${n - 1}]</code> 最大收益为 <strong>${ansB}</strong>。`
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...nums]],
      memo: [...nums],
      dp1d: [...nums],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `环形最大收益: ${finalAns}`,
      log: `| 🏆 计算完成！max(方案A:${ansA}, 方案B:${ansB}) = ${finalAns}`,
      msg: `🏆 计算完成！取两个子问题最优解 <code>max(${ansA}, ${ansB}) = <strong>${finalAns}</strong></code>。`
    });

    return steps;
  }

  // =========================================================================
  // 3. 打家劫舍 III (House Robber III, LC 337 - 树形 DP)
  // =========================================================================
  private compileHouseRobberIII(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const rootNode: UniversalTreeNode = {
      id: 'tree-node-1',
      r: 0,
      c: 0,
      val: 'Node(3)',
      status: 'visited',
      tag: '偷:7, 不偷:6',
      children: [
        {
          id: 'tree-node-2',
          r: 1,
          c: 0,
          val: 'Node(2)',
          status: 'visited',
          tag: '偷:2, 不偷:3',
          children: [
            { id: 'tree-node-4', r: 2, c: 0, val: 'Node(3)', status: 'base', tag: '偷:3, 不偷:0', children: [] }
          ]
        },
        {
          id: 'tree-node-3',
          r: 1,
          c: 1,
          val: 'Node(3)',
          status: 'visited',
          tag: '偷:4, 不偷:1',
          children: [
            { id: 'tree-node-5', r: 2, c: 1, val: 'Node(1)', status: 'base', tag: '偷:1, 不偷:0', children: [] }
          ]
        }
      ]
    };

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      grid: [[7, 6]],
      memo: [7, 6],
      dp1d: [7, 6],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '后序遍历树形 DP',
      log: '| 🌲 树形 DP: 每个节点返回 [偷该节点的最大值, 不偷该节点的最大值]',
      msg: `后序遍历树形 DP：每个节点返回状态元组 <code>[rob, notRob]</code>。`,
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 6,
      i: 0,
      j: 0,
      grid: [[7, 6]],
      memo: [7, 6],
      dp1d: [7, 6],
      activeSlot: 1,
      highlightSlots: [1],
      tag: '左右子树状态汇总',
      log: '| ⚡ 状态计算: rob = val + left[1] + right[1]; notRob = max(left) + max(right)',
      msg: `状态转移：<code>rob = val + left[0] + right[0]</code>，<code>notRob = max(left) + max(right)</code>。`,
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: 0,
      grid: [[7, 6]],
      memo: [7, 6],
      dp1d: [7, 6],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '树形 DP 最终收益: 7',
      log: '| 🏆 根节点计算完成，最大可偷窃金额 = max(rob, notRob) = 7',
      msg: `🏆 演化推导完成！二叉树最多可偷窃金额为 <strong>7</strong>。`,
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return steps;
  }
}
