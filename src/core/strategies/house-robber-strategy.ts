import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
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
      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 5,
        i: 0,
        j: i,
        grid: [[...dp]],
        memo: [...dp],
        dp1d: [...dp],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察房屋 #${i}`,
        log: `| 🔄 循环步进: 准备决策房屋 #${i} (金额 ${nums[i]})`,
        msg: `循环迭代：考察房屋 <code>#${i}</code> (金额: ${nums[i]})。`,
      });

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

    if (stage === 1 || stage === 2) {
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: `robCircle(0..${n - 1})`,
        status: 'current',
        children: []
      };

      steps.push({
        type: 'init',
        line: anchorMap?.entry || 1,
        i: 0,
        j: 0,
        grid: [[...nums]],
        memo: [...nums],
        dp1d: [...nums],
        activeSlot: 0,
        highlightSlots: [0, n - 1],
        tag: '破环成链',
        log: `| 📋 环形拆解: 首尾相连冲突，拆分为 [0..${n - 2}] 与 [1..${n - 1}] 两段独立递归`,
        msg: `环形结构破环成链：将环拆解为子问题 A <code>[0..${n - 2}]</code> 与子问题 B <code>[1..${n - 1}]</code>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      const memoA: Record<number, number> = {};
      const memoB: Record<number, number> = {};

      const nodeA: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: 0, c: 0, val: `rob[0..${n - 2}]`, edgeLabel: '不选尾', status: 'current', children: [] };
      const nodeB: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: 0, c: 0, val: `rob[1..${n - 1}]`, edgeLabel: '不选首', status: 'current', children: [] };
      rootNode.children.push(nodeA, nodeB);

      function robSub(subNums: number[], idx: number, node: UniversalTreeNode, memo: Record<number, number>, label: string, offset: number): number {
        const globalIdx = idx + offset;
        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 4,
          i: 0,
          j: globalIdx < n ? globalIdx : n - 1,
          activeSlot: globalIdx < n ? globalIdx : n - 1,
          highlightSlots: [globalIdx < n ? globalIdx : n - 1],
          tag: `${label} 考察 #${globalIdx}`,
          log: `| ➡️ ${label}: 递归房屋 ${globalIdx} (金额 ${idx < subNums.length ? subNums[idx] : 0})`,
          msg: `${label} 递归：考察房屋 <code>#${globalIdx}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map((_, k) => (k >= offset && k < offset + subNums.length ? (memo[k - offset] ?? 0) : 0))
        });

        if (idx >= subNums.length) {
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
            j: globalIdx,
            activeSlot: globalIdx,
            highlightSlots: [globalIdx],
            tag: `${label} 缓存命中 memo[${idx}]=${memo[idx]}`,
            log: `| ⚡ ${label}: 命中缓存 memo[${idx}] = ${memo[idx]}，剪枝返回`,
            msg: `${label} 命中缓存 <code>memo[${idx}] = ${memo[idx]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
            dp1d: nums.map((_, k) => (k >= offset && k < offset + subNums.length ? (memo[k - offset] ?? 0) : 0))
          });
          return memo[idx];
        }

        const childNotRob: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: idx + 1, c: 0, val: `rob(${idx + 1})`, edgeLabel: '不偷', status: 'current', children: [] };
        node.children.push(childNotRob);
        const notRobVal = robSub(subNums, idx + 1, childNotRob, memo, label, offset);

        const childRob: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: idx + 2, c: 0, val: `rob(${idx + 2})`, edgeLabel: '偷', status: 'current', children: [] };
        node.children.push(childRob);
        const robVal = subNums[idx] + robSub(subNums, idx + 2, childRob, memo, label, offset);

        const res = Math.max(notRobVal, robVal);
        if (isMemo) memo[idx] = res;
        node.status = 'visited';
        node.val = `rob(${idx})=${res}`;

        steps.push({
          type: 'dfs-return',
          line: anchorMap?.combine || 7,
          i: 0,
          j: globalIdx,
          activeSlot: globalIdx,
          highlightSlots: [globalIdx],
          tag: `${label} 决策最优: ${res}`,
          log: `| ↩️ ${label}: 房屋 ${globalIdx} 决策完成: max(不偷:${notRobVal}, 偷:${robVal}) = ${res}`,
          msg: `${label} 决策完成：<code>max(${notRobVal}, ${robVal}) = <strong>${res}</strong></code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map((_, k) => (k >= offset && k < offset + subNums.length ? (memo[k - offset] ?? 0) : 0))
        });
        return res;
      }

      const ansA = robSub(rangeA, 0, nodeA, memoA, '子问题A', 0);
      const ansB = robSub(rangeB, 0, nodeB, memoB, '子问题B', 1);
      const finalAns = Math.max(ansA, ansB);

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
        tag: `环形全局最优: ${finalAns}`,
        log: `| 🏆 环形决策归纳完成！max(子问题A:${ansA}, 子问题B:${ansB}) = ${finalAns}`,
        msg: `🏆 全局推导完成！取两子问题最大值：<code>max(${ansA}, ${ansB}) = <strong>${finalAns}</strong></code>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      return steps;
    }

    // Stage 3 & 4: 数组填表与空间压缩
    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...nums]],
      memo: [...nums],
      dp1d: [...nums],
      activeSlot: 0,
      highlightSlots: [0, n - 1],
      tag: '环形数组拆解为两个单链',
      log: `| 📋 环形首尾相连：拆分为 [0..${n - 2}] 和 [1..${n - 1}] 两个独立子问题`,
      msg: `首尾成环：分解为 <code>[0..${n - 2}]</code>（不偷末尾）与 <code>[1..${n - 1}]</code>（不偷首位）两段线性 DP。`
    });

    function solveRangeSteps(arr: number[], label: string, offset: number): number {
      const len = arr.length;
      const dpSub = new Array(len).fill(0);
      dpSub[0] = arr[0];

      steps.push({
        type: 'init',
        line: anchorMap?.init || 2,
        i: 0,
        j: offset,
        grid: [[...nums]],
        memo: [...nums],
        dp1d: [...nums],
        activeSlot: offset,
        highlightSlots: [offset],
        tag: `${label} 初始化基底 dp[0]=${dpSub[0]}`,
        log: `| 📋 ${label} 边界初始化: dp[0] = arr[0] = ${dpSub[0]}`,
        msg: `${label} 边界初始化：<code>dp[0] = ${dpSub[0]}</code>。`
      });

      if (len > 1) {
        dpSub[1] = Math.max(arr[0], arr[1]);
        steps.push({
          type: 'init',
          line: anchorMap?.init || 2,
          i: 0,
          j: offset + 1,
          grid: [[...nums]],
          memo: [...nums],
          dp1d: [...nums],
          activeSlot: offset + 1,
          highlightSlots: [offset, offset + 1],
          tag: `${label} 决策前两间 dp[1]=${dpSub[1]}`,
          log: `| 📋 ${label} 前两间选优: dp[1] = max(${arr[0]}, ${arr[1]}) = ${dpSub[1]}`,
          msg: `${label} 前两间选优：<code>dp[1] = max(${arr[0]}, ${arr[1]}) = <strong>${dpSub[1]}</strong></code>。`
        });
      }

      for (let i = 2; i < len; i++) {
        const globalIdx = i + offset;
        steps.push({
          type: 'loop',
          line: anchorMap?.loop || 5,
          i: 0,
          j: globalIdx,
          grid: [[...nums]],
          memo: [...nums],
          dp1d: [...nums],
          activeSlot: globalIdx,
          currentI: globalIdx,
          highlightSlots: [globalIdx],
          tag: `${label} 考察 #${globalIdx}`,
          log: `| 🔄 ${label} 迭代: 考察房屋 #${globalIdx} (金额 ${arr[i]})`,
          msg: `${label} 循环迭代：考察房屋 <code>#${globalIdx}</code>。`
        });

        const notRob = dpSub[i - 1];
        const rob = dpSub[i - 2] + arr[i];
        dpSub[i] = Math.max(notRob, rob);

        steps.push({
          type: stage === 4 ? 'update-1d' : 'update',
          line: anchorMap?.transfer || 6,
          i: 0,
          j: globalIdx,
          grid: [[...nums]],
          memo: [...nums],
          dp1d: [...nums],
          activeSlot: globalIdx,
          currentI: globalIdx,
          highlightSlots: [globalIdx],
          tag: `${label} dp[${i}] = max(${notRob}, ${rob}) = ${dpSub[i]}`,
          log: `| ⚡ ${label} 状态转移: 房屋 #${globalIdx}，收益更新为 ${dpSub[i]}`,
          msg: `${label} 转移：<code>dp[${i}] = max(${notRob}, ${rob}) = <strong>${dpSub[i]}</strong></code>。`
        });
      }

      return dpSub[len - 1];
    }

    const ansA = solveRangeSteps(rangeA, '子问题A [0..n-2]', 0);
    const ansB = solveRangeSteps(rangeB, '子问题B [1..n-1]', 1);
    const finalAns = Math.max(ansA, ansB);

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
      tag: `环形全局最优: ${finalAns}`,
      log: `| 🏆 环形全阶段计算完成！max(子问题A:${ansA}, 子问题B:${ansB}) = ${finalAns}`,
      msg: `🏆 环形 DP 求解完成！取两个子问题最优解 <code>max(${ansA}, ${ansB}) = <strong>${finalAns}</strong></code>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, 'house-robber-ii', step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  // =========================================================================
  // 3. 打家劫舍 III (House Robber III, LC 337 - 树形 DP)
  // =========================================================================
  private compileHouseRobberIII(
    _model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];

    const treeState: UniversalTreeNode = {
      id: 'rob-1',
      r: 0,
      c: 0,
      val: '房#1(值3)',
      status: 'normal',
      tag: '待考察',
      children: [
        {
          id: 'rob-2',
          r: 1,
          c: 0,
          val: '房#2(值2)',
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'rob-4', r: 2, c: 0, val: '房#4(值3)', status: 'normal', tag: '待考察', children: [] },
          ],
        },
        {
          id: 'rob-3',
          r: 1,
          c: 1,
          val: '房#3(值3)',
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'rob-5', r: 2, c: 1, val: '房#5(值1)', status: 'normal', tag: '待考察', children: [] },
          ],
        },
      ],
    };

    const nodeVals: Record<number, number> = { 1: 3, 2: 2, 3: 3, 4: 3, 5: 1 };
    const val0: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const val1: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    function setNodeStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    interface SimRobNode {
      id: string;
      u: number;
      val: number;
      left?: SimRobNode;
      right?: SimRobNode;
    }

    const rn4: SimRobNode = { id: 'rob-4', u: 4, val: 3 };
    const rn5: SimRobNode = { id: 'rob-5', u: 5, val: 1 };
    const rn2: SimRobNode = { id: 'rob-2', u: 2, val: 2, right: rn4 };
    const rn3: SimRobNode = { id: 'rob-3', u: 3, val: 3, right: rn5 };
    const rn1: SimRobNode = { id: 'rob-1', u: 1, val: 3, left: rn2, right: rn3 };

    if (stage === 1 || stage === 2) {
      const lineEntry = anchorMap?.entry ?? 2;
      const lineBoundary = anchorMap?.boundary ?? 3;
      const lineMemo = anchorMap?.memo ?? anchorMap?.cache_hit ?? 4;
      const lineBranchLeft = anchorMap?.branch_left ?? 5;
      const lineBranchRight = anchorMap?.branch_right ?? 6;
      const lineCombine = anchorMap?.combine ?? 8;
      const lineReturn = anchorMap?.return ?? 8;

      const memoMap: Record<number, number> = {};

      steps.push({
        type: 'entry',
        line: lineEntry,
        i: 0,
        j: 0,
        dp1d: [0, 0],
        memo: [0, 0],
        activeSlot: 0,
        tag: 'rob(root) 入口',
        log: '🚀 public int rob(TreeNode root) 递归求解树形盗窃收益',
        msg: '启动 <code>rob(root)</code>：准备后序树递归遍历。',
        activeNodeId: 'rob-1',
        treeRoot: cloneTree(treeState),
      });

      function robTreeNaive(node?: SimRobNode): number {
        if (!node) {
          steps.push({
            type: 'boundary',
            line: lineBoundary,
            i: 0,
            j: 0,
            dp1d: [0, 0],
            memo: [0, 0],
            activeSlot: 0,
            tag: 'node == null',
            log: '| 空节点返回 0',
            msg: '遇到空节点，收益为 <code>0</code>。',
            treeRoot: cloneTree(treeState),
          });
          return 0;
        }

        const u = node.u;
        setNodeStatus(node.id, 'current', '计算中');

        steps.push({
          type: 'entry',
          line: lineEntry,
          i: u,
          j: 0,
          dp1d: [node.val, 0],
          memo: [0, 0],
          activeSlot: u - 1,
          tag: `考察房#${u}`,
          log: `| ➡️ 递归房#${u} (金额 ${node.val})`,
          msg: `进入递归：考察房屋 <strong>房#${u}</strong>（金额 <code>${node.val}</code>）。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        if (isMemo && memoMap[u] !== undefined) {
          setNodeStatus(node.id, 'visited', `缓存=${memoMap[u]}`);
          steps.push({
            type: 'memo-hit',
            line: lineMemo,
            i: u,
            j: 0,
            dp1d: [memoMap[u], 0],
            memo: [memoMap[u], 0],
            activeSlot: u - 1,
            tag: `memo命中 房#${u}=${memoMap[u]}`,
            log: `| ⚡ memo[${u}] = ${memoMap[u]} 缓存命中，剪枝返回`,
            msg: `缓存命中：房屋 <strong>房#${u}</strong> 已计算过，收益为 <code>${memoMap[u]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(treeState),
          });
          return memoMap[u];
        }

        // 分支 1：偷当前节点
        steps.push({
          type: 'branch',
          line: lineBranchLeft,
          i: u,
          j: 0,
          dp1d: [node.val, 0],
          memo: [0, 0],
          activeSlot: u - 1,
          tag: `偷房#${u}: 探测孙子节点`,
          log: `| 偷房#${u}，只能跳过子代偷孙子代`,
          msg: `决策 1（偷房#${u}）：子房屋不能偷，向下探测孙子房屋。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        let doRob = node.val;
        if (node.left) {
          doRob += robTreeNaive(node.left.left) + robTreeNaive(node.left.right);
        }
        if (node.right) {
          doRob += robTreeNaive(node.right.left) + robTreeNaive(node.right.right);
        }

        // 分支 2：不偷当前节点
        steps.push({
          type: 'branch',
          line: lineBranchRight,
          i: u,
          j: 0,
          dp1d: [doRob, 0],
          memo: [0, 0],
          activeSlot: u - 1,
          tag: `不偷房#${u}: 探测直接子节点`,
          log: `| 不偷房#${u}，可自由偷直接子代`,
          msg: `决策 2（不偷房#${u}）：直接探查左右子节点。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        const notRob = robTreeNaive(node.left) + robTreeNaive(node.right);
        const best = Math.max(doRob, notRob);
        if (isMemo) memoMap[u] = best;
        setNodeStatus(node.id, 'visited', `最优=${best}`);

        steps.push({
          type: 'combine',
          line: lineCombine,
          i: u,
          j: 0,
          dp1d: [best, 0],
          memo: [best, 0],
          activeSlot: u - 1,
          tag: `房#${u}最优: max(${doRob}, ${notRob})=${best}`,
          log: `| ↩️ 房#${u} 归纳完成: max(偷:${doRob}, 不偷:${notRob}) = ${best}`,
          msg: `房屋 <strong>房#${u}</strong> 决策完成：<code>max(${doRob}, ${notRob}) = <strong>${best}</strong></code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        return best;
      }

      const finalAns = robTreeNaive(rn1);

      steps.push({
        type: 'return',
        line: lineReturn,
        i: 0,
        j: 0,
        dp1d: [finalAns, 0],
        memo: [finalAns, 0],
        activeSlot: 0,
        tag: `全局最优: ${finalAns}`,
        log: `🏆 树形递归全部完成，最大盗取金额 = ${finalAns}`,
        msg: `🏆 树形递归计算完成！整棵树最大收益为 <strong>${finalAns}</strong>。`,
        activeNodeId: 'rob-1',
        treeRoot: cloneTree(treeState),
      });

      return steps;
    }

    // Stage >= 3: 树形 DP (后序遍历二元状态汇报)
    const lineEntry = anchorMap?.entry ?? 2;
    const lineInit = anchorMap?.init ?? 3;
    const lineReturn = anchorMap?.return ?? 4;
    const lineRecursion = anchorMap?.recursion ?? 7;
    const lineBoundary = anchorMap?.boundary ?? 8;
    const lineBranchLeft = anchorMap?.branch_left ?? 9;
    const lineBranchRight = anchorMap?.branch_right ?? 10;
    const lineTransfer = anchorMap?.transfer ?? 11;
    const lineCombine = anchorMap?.combine ?? 13;

    function getRobStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-val',
          name: 'val[]',
          label: '房屋金额',
          indices: ['#1', '#2', '#3', '#4', '#5'],
          values: [nodeVals[1], nodeVals[2], nodeVals[3], nodeVals[4], nodeVals[5]],
          activeIdx: activeArrName === 'val' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-val0',
          name: 'val0[]',
          label: '不偷当前节点',
          indices: ['#1', '#2', '#3', '#4', '#5'],
          values: [val0[1], val0[2], val0[3], val0[4], val0[5]],
          activeIdx: activeArrName === 'val0' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-val1',
          name: 'val1[]',
          label: '偷当前节点',
          indices: ['#1', '#2', '#3', '#4', '#5'],
          values: [val1[1], val1[2], val1[3], val1[4], val1[5]],
          activeIdx: activeArrName === 'val1' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addRobStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getRobStateArrays(activeArrName, activeArrSlot),
      });
    }

    addRobStep({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: 'rob(root) 入口',
      log: '🚀 public int rob(TreeNode root) 函数入口，启动二叉树树形 DP',
      msg: '启动 <code>rob(root)</code>：准备后序深度优先遍历二叉树房屋群。',
      activeNodeId: 'rob-1',
      treeRoot: cloneTree(treeState),
    });

    addRobStep({
      type: 'call',
      line: lineInit,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '调用 dfs(root)',
      log: '🌲 int[] res = dfs(root); 递归开始',
      msg: '调用 <code>dfs(root)</code>，深入自底向上汇报二元组 <code>[不偷, 偷]</code>。',
      activeNodeId: 'rob-1',
      treeRoot: cloneTree(treeState),
    });

    function simulateRobTree(node: SimRobNode | undefined): [number, number] {
      if (!node) {
        addRobStep({
          type: 'boundary',
          line: lineBoundary,
          i: 0,
          j: 0,
          dp1d: [0, 0],
          memo: [0, 0],
          activeSlot: 0,
          tag: 'cur == null (空节点)',
          log: '| if (cur == null) 为真，返回 [0, 0]',
          msg: '遇到空节点，返回 <code>[不偷: 0, 偷: 0]</code>。',
          treeRoot: cloneTree(treeState),
        });
        return [0, 0];
      }

      const u = node.u;
      setNodeStatus(node.id, 'current', '计算中');

      addRobStep({
        type: 'entry',
        line: lineRecursion,
        i: u,
        j: 0,
        dp1d: [val0[u], val1[u]],
        memo: [val0[u], val1[u]],
        activeSlot: u - 1,
        tag: `dfs(房#${u})`,
        log: `进入 dfs(cur = 房#${u}, 金额=${node.val})`,
        msg: `进入后序遍历：考察房屋 <strong>房#${u}</strong>（金额 <code>${node.val}</code>）。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
      });

      addRobStep({
        type: 'call',
        line: lineBranchLeft,
        i: u,
        j: 0,
        dp1d: [val0[u], val1[u]],
        memo: [val0[u], val1[u]],
        activeSlot: u - 1,
        tag: `递归左子树 dfs(cur.left)`,
        log: `| 递归左子树: dfs(cur.left = ${node.left ? '#' + node.left.u : 'null'})`,
        msg: `递归左子树：准备求解 <strong>房#${u}</strong> 的左子房屋最优策略。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
      });
      const left = simulateRobTree(node.left);

      addRobStep({
        type: 'call',
        line: lineBranchRight,
        i: u,
        j: 0,
        dp1d: [val0[u], val1[u]],
        memo: [val0[u], val1[u]],
        activeSlot: u - 1,
        tag: `递归右子树 dfs(cur.right)`,
        log: `| 递归右子树: dfs(cur.right = ${node.right ? '#' + node.right.u : 'null'})`,
        msg: `递归右子树：准备求解 <strong>房#${u}</strong> 的右子房屋最优策略。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
      });
      const right = simulateRobTree(node.right);

      const curVal1 = node.val + left[0] + right[0];
      val1[u] = curVal1;

      addRobStep({
        type: 'update',
        line: lineTransfer,
        i: u,
        j: 1,
        dp1d: [val0[u], val1[u]],
        memo: [val0[u], val1[u]],
        activeSlot: u - 1,
        tag: `偷#${u}: ${curVal1}`,
        log: `| ⚡ 偷房#${u}: val(${node.val}) + left[0](${left[0]}) + right[0](${right[0]}) = ${curVal1}`,
        msg: `若<strong>偷房#${u}</strong>：左右直接相邻子节点绝对不能偷，收益为 <code>${node.val} + ${left[0]} + ${right[0]} = <strong>${curVal1}</strong></code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'val1',
        activeArrSlot: u - 1,
      });

      const curVal0 = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
      val0[u] = curVal0;
      setNodeStatus(node.id, 'visited', `不偷:${curVal0}|偷:${curVal1}`);

      addRobStep({
        type: 'update',
        line: lineTransfer,
        i: u,
        j: 0,
        dp1d: [val0[u], val1[u]],
        memo: [val0[u], val1[u]],
        activeSlot: u - 1,
        tag: `不偷#${u}: ${curVal0}`,
        log: `| ⚡ 不偷房#${u}: max(左${left[0]},${left[1]}) + max(右${right[0]},${right[1]}) = ${curVal0}`,
        msg: `若<strong>不偷房#${u}</strong>：左右子房屋可偷可不偷取较大者，收益为 <code>max(${left[0]}, ${left[1]}) + max(${right[0]}, ${right[1]}) = <strong>${curVal0}</strong></code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'val0',
        activeArrSlot: u - 1,
      });

      addRobStep({
        type: 'return',
        line: lineCombine,
        i: u,
        j: 0,
        dp1d: [curVal0, curVal1],
        memo: [curVal0, curVal1],
        activeSlot: u - 1,
        tag: `房#${u} 汇报 [${curVal0}, ${curVal1}]`,
        log: `| return new int[]{val0=${curVal0}, val1=${curVal1}}; 汇报父节点`,
        msg: `房屋 <strong>房#${u}</strong> 决策汇报：<code>[不偷: ${curVal0}, 偷: ${curVal1}]</code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'val0',
        activeArrSlot: u - 1,
      });

      return [curVal0, curVal1];
    }

    const res = simulateRobTree(rn1);
    const finalAns = Math.max(res[0], res[1]);

    addRobStep({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: 0,
      dp1d: [finalAns],
      memo: [finalAns],
      activeSlot: 0,
      tag: `最大盗取金额: ${finalAns}`,
      log: `🏆 return Math.max(res[0]=${res[0]}, res[1]=${res[1]}) = ${finalAns};`,
      msg: `🏆 演化推导全部完成！整棵二叉树最大可盗取金额为 <code>max(${res[0]}, ${res[1]}) = <strong>${finalAns}</strong></code>。`,
      activeNodeId: 'rob-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'val1',
      activeArrSlot: 0,
    });

    return steps;
  }
}
