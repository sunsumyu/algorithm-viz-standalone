/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包 / 左程云 Class 074 Code01)
 * Step Compiler: 组内物品互斥决策（至多选 1 件），容量倒序枚举状态推演
 * 包含：传统单卡片步进生成器 + 顶层抽象 4 阶段全生命周期 UniversalStep 编译流水线
 */

import {
  runKnapsackEngine,
  type KnapsackExecutionStep,
  type KnapsackItem,
} from '../../knapsack-execution-engine';
import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';

export type PartitionedItem = KnapsackItem & {
  group: number;
};

export type PartitionedKnapsackStep = KnapsackExecutionStep;

export function parsePartitionedInputs(inputs: Record<string, any>): {
  m: number;
  items: PartitionedItem[];
} {
  const m = parseInt(inputs['input-capacity'] || '45', 10);
  let rawArr: [number, number, number][] = [];
  try {
    rawArr = JSON.parse(
      inputs['input-items-json'] || '[[10,10,1],[10,20,1],[20,20,2]]'
    );
  } catch {
    rawArr = [
      [10, 10, 1],
      [10, 20, 1],
      [20, 20, 2],
    ];
  }
  const items: PartitionedItem[] = rawArr.map(([cost, val, group], idx) => ({
    cost,
    val,
    group,
    id: idx + 1,
    name: `物品 #${idx + 1} (组${group})`,
  }));
  return { m, items };
}

export function buildPartitionedKnapsackSteps(
  capacity: number,
  rawItems: PartitionedItem[]
): PartitionedKnapsackStep[] {
  return runKnapsackEngine({
    type: 'partitioned',
    capacity,
    items: rawItems,
    lineMap: {
      sort: { java: 9, cpp: 9, python: 3, javascript: 3 },
      initDp: { java: 10, cpp: 10, python: 4, javascript: 4 },
      outerLoop: { java: 11, cpp: 11, python: 6, javascript: 6 },
      groupEnd: { java: 12, cpp: 12, python: 8, javascript: 8 },
      capLoop: { java: 13, cpp: 14, python: 10, javascript: 9 },
      itemLoop: { java: 14, cpp: 15, python: 11, javascript: 10 },
      ifFit: { java: 15, cpp: 16, python: 13, javascript: 12 },
      updateDp: { java: 16, cpp: 17, python: 14, javascript: 13 },
      advanceLoop: { java: 20, cpp: 21, python: 15, javascript: 17 },
      returnAns: { java: 22, cpp: 23, python: 16, javascript: 19 },
    },
    customMessages: {
      init: `🗂️ 初始化分组背包：总容量 M=${capacity}，共有 ${rawItems.length} 件物品分属于不同组。`,
      done: `🎉 分组背包推演完毕！严格遵守组内互斥选择，最大累计收益为答案！`,
    },
  });
}

// ============================================================================
// 顶层抽象 4 阶段全生命周期 UniversalStep 编译流水线
// ============================================================================

export function compilePartitionedKnapsackSteps(
  rawItems: Array<[number, number, number] | { cost: number; val: number; group: number }>,
  capacity: number,
  stage: number = 3,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction?: 'forward' | 'reverse' | string
): UniversalStep[] {
  const isReverse = direction === 'reverse';
  const stageNum = typeof stage === 'number' ? stage : 3;

  const parsedItems: Array<{ cost: number; val: number; group: number }> = rawItems.map((it: any) => {
    if (Array.isArray(it)) {
      return { cost: Number(it[0]), val: Number(it[1]), group: Number(it[2]) };
    }
    return { cost: Number(it.cost), val: Number(it.val), group: Number(it.group) };
  });

  const groupMap = new Map<number, Array<{ cost: number; val: number }>>();
  for (const item of parsedItems) {
    if (!groupMap.has(item.group)) groupMap.set(item.group, []);
    groupMap.get(item.group)!.push({ cost: item.cost, val: item.val });
  }

  const sortedGroupKeys = Array.from(groupMap.keys()).sort((a, b) => a - b);
  const groups: Array<Array<{ cost: number; val: number }>> = sortedGroupKeys.map(k => groupMap.get(k)!);

  if (stageNum === 1) {
    return compilePartitionedStage1Steps(groups, capacity, anchorMap, isReverse);
  } else if (stageNum === 2) {
    return compilePartitionedStage2Steps(groups, capacity, anchorMap, isReverse);
  } else if (stageNum === 3) {
    return compilePartitionedStage3Steps(groups, capacity, anchorMap, isReverse);
  } else {
    return compilePartitionedStage4Steps(parsedItems, capacity, anchorMap, isReverse);
  }
}

// 阶段 1: 暴力递归
function compilePartitionedStage1Steps(
  groups: Array<Array<{ cost: number; val: number }>>,
  capacity: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const numGroups = groups.length;
  let nodeCounter = 0;

  const lineEntry = anchors?.entry || 3;
  const lineDfsEntry = anchors?.dfs_entry || 5;
  const lineBoundary = anchors?.boundary || 6;
  const lineBranchNotTake = anchors?.branch_not_take || 7;
  const lineLoopItems = anchors?.loop_items || 8;
  const lineBranchTake = anchors?.branch_take || 11;
  const lineCombine = anchors?.combine || 14;

  const startG = isReverse ? numGroups - 1 : 0;
  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeCounter}`,
    r: Math.max(0, startG),
    c: capacity,
    val: `dfs(${startG},${capacity})`,
    status: 'current',
    children: []
  };

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 1,
      decision: data.decision || '分组背包递归推演',
      log: data.log || '| 暴力递归树展开',
      msg: data.msg || data.log || '',
      line: data.line || lineBranchTake,
      treeRoot: cloneTree(rootNode),
      ...data
    });
  }

  pushStep({
    type: 'dfs-entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `开始暴力递归 dfs(${startG}, ${capacity})`,
    log: `| 📥 分组背包递归启动: dfs(g=${startG}, remCap=${capacity})`,
    msg: `开始分组背包暴力递归，探索从物品组 <code>${startG}</code> 开始在剩余容量 <code>${capacity}</code> 下的互斥组合。`,
    decision: '开始递归探索'
  });

  const activeStack: Array<{ g: number; remCap: number }> = [];

  function dfs(g: number, remCap: number, parentNode: UniversalTreeNode): number {
    activeStack.push({ g, remCap });
    const safeG = Math.max(0, Math.min(numGroups - 1, g));

    pushStep({
      type: 'dfs-call',
      line: lineDfsEntry,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      tag: `进入节点 dfs(${g}, ${remCap})`,
      log: `| 🔍 考察组 #${g} (剩余容量=${remCap})`,
      msg: `递归考察物品组 <code>#${g}</code>，当前背包剩余容量 <code>${remCap}</code>。`,
      decision: `考察组 #${g}`
    });

    const isBase = isReverse ? (g < 0 || remCap <= 0) : (g >= numGroups || remCap <= 0);
    if (isBase) {
      parentNode.status = 'base';
      parentNode.tag = '基底: 0';
      pushStep({
        type: 'base-return',
        line: lineBoundary,
        i: safeG,
        j: remCap,
        activeNodeId: parentNode.id,
        tag: '命中基底 0',
        log: `| 🎯 边界命中: 组号超出或容量耗尽，return 0`,
        msg: `边界条件命中：无更多物品组或容量为 0，直接返回基底值 <strong>0</strong>。`,
        decision: '基底返回 0'
      });
      activeStack.pop();
      return 0;
    }

    const nextG = isReverse ? g - 1 : g + 1;
    const child0: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: Math.max(0, Math.min(numGroups - 1, nextG)),
      c: remCap,
      val: `dfs(${nextG},${remCap})`,
      edgeLabel: '不选',
      status: 'current',
      children: []
    };
    parentNode.children.push(child0);

    pushStep({
      type: 'branch-call',
      line: lineBranchNotTake,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      tag: `组#${g} 不选任何物品`,
      log: `| ⏭️ 分支 0: 组 #${g} 全都不选，继承下一组状态`,
      msg: `分支 0（不选）：组 <code>#${g}</code> 不选任何物品，剩余容量保持 <code>${remCap}</code>，深入下一组。`,
      decision: '分支0: 本组不选'
    });

    let maxVal = dfs(nextG, remCap, child0);

    const groupItems = groups[g] || [];
    for (let k = 0; k < groupItems.length; k++) {
      const item = groupItems[k];
      if (remCap >= item.cost) {
        const childK: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.max(0, Math.min(numGroups - 1, nextG)),
          c: remCap - item.cost,
          val: `dfs(${nextG},${remCap - item.cost})`,
          edgeLabel: `选物${k}`,
          status: 'current',
          children: []
        };
        parentNode.children.push(childK);

        pushStep({
          type: 'branch-call',
          line: lineLoopItems,
          i: safeG,
          j: remCap,
          activeNodeId: parentNode.id,
          tag: `组#${g} 尝试选物品 #${k} (c:${item.cost}, v:${item.val})`,
          log: `| 🗂️ 分支 ${k + 1}: 组 #${g} 尝试选物品 #${k} (体积=${item.cost}, 价值=${item.val})`,
          msg: `尝试互斥分支：在组 <code>#${g}</code> 中选择物品 #${k}（消耗容量 <code>${item.cost}</code>，增加价值 <code>${item.val}</code>）。`,
          decision: `尝试选物品 #${k}`
        });

        const sub = dfs(nextG, remCap - item.cost, childK) + item.val;
        if (sub > maxVal) {
          maxVal = sub;
        }

        pushStep({
          type: 'branch-eval',
          line: lineBranchTake,
          i: safeG,
          j: remCap,
          activeNodeId: parentNode.id,
          tag: `组内比较: 收益=${sub}, 当前最优=${maxVal}`,
          log: `| ⚖️ 组内互斥比较: 物品 #${k} 收益为 ${sub}，当前最大值更新为 ${maxVal}`,
          msg: `组内互斥比较：选物品 #${k} 获得收益 <code>${sub}</code>，当前组内最优决策 <strong>${maxVal}</strong>。`,
          decision: `更新最优收益=${maxVal}`
        });
      }
    }

    parentNode.status = 'visited';
    parentNode.tag = `= ${maxVal}`;

    pushStep({
      type: 'return-ans',
      line: lineCombine,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      tag: `组#${g} 决策完毕，最优收益=${maxVal}`,
      log: `| ↩️ 组 #${g} 决策返回: 最优总收益=${maxVal}`,
      msg: `组 <code>#${g}</code> 全部互斥分支考察完毕，向父节点返回最优收益 <strong>${maxVal}</strong>。`,
      decision: `返回最优收益=${maxVal}`
    });

    activeStack.pop();
    return maxVal;
  }

  dfs(startG, capacity, rootNode);
  return steps;
}

// 阶段 2: 记忆化搜索
function compilePartitionedStage2Steps(
  groups: Array<Array<{ cost: number; val: number }>>,
  capacity: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const numGroups = groups.length;
  let nodeCounter = 0;

  const lineInitMemo = anchors?.init_memo || 4;
  const lineEntry = anchors?.entry || 6;
  const lineDfsEntry = anchors?.dfs_entry || 8;
  const lineBoundary = anchors?.boundary || 9;
  const lineCacheHit = anchors?.cache_hit || 10;
  const lineBranchNotTake = anchors?.branch_not_take || 11;
  const lineLoopItems = anchors?.loop_items || 12;
  const lineBranchTake = anchors?.branch_take || 15;
  const lineCombine = anchors?.combine || 18;

  const memoGrid: Array<Array<number | null>> = Array.from(
    { length: numGroups },
    () => new Array(capacity + 1).fill(null)
  );

  const startG = isReverse ? numGroups - 1 : 0;
  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeCounter}`,
    r: Math.max(0, startG),
    c: capacity,
    val: `dfsMemo(${startG},${capacity})`,
    status: 'current',
    children: []
  };

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 2,
      decision: data.decision || '分组背包记忆化推演',
      log: data.log || '| 记忆化搜索剪枝',
      msg: data.msg || data.log || '',
      line: data.line || lineBranchTake,
      treeRoot: cloneTree(rootNode),
      grid: memoGrid.map(row => row.map(v => (v === null ? 0 : v))),
      ...data
    });
  }

  pushStep({
    type: 'init-memo',
    line: lineInitMemo,
    tag: `初始化备忘录 memo[${numGroups}][${capacity + 1}] 全为 -1`,
    log: `| 📋 初始化备忘录: memo[0..${numGroups - 1}][0..${capacity}] = -1`,
    msg: `初始化 <code>${numGroups} × ${capacity + 1}</code> 的二维备忘录数组，准备记录各组在各容量下的最优收益。`,
    decision: '初始化备忘录'
  });

  pushStep({
    type: 'dfs-entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `启动记忆化递归 dfsMemo(${startG}, ${capacity})`,
    log: `| 📥 记忆化搜索启动: dfsMemo(g=${startG}, remCap=${capacity})`,
    msg: `启动记忆化递归，遇到已计算状态将直接 O(1) 剪枝返回。`,
    decision: '启动记忆化搜索'
  });

  const activeStack: Array<{ g: number; remCap: number }> = [];

  function dfsMemo(g: number, remCap: number, parentNode: UniversalTreeNode): number {
    activeStack.push({ g, remCap });
    const safeG = Math.max(0, Math.min(numGroups - 1, g));

    pushStep({
      type: 'dfs-call',
      line: lineDfsEntry,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      tag: `考察节点 dfsMemo(${g}, ${remCap})`,
      log: `| 🔍 考察组 #${g} (剩余容量=${remCap})`,
      msg: `检查组 <code>#${g}</code>，剩余容量 <code>${remCap}</code>。`,
      decision: `考察组 #${g}`
    });

    const isBase = isReverse ? (g < 0 || remCap <= 0) : (g >= numGroups || remCap <= 0);
    if (isBase) {
      parentNode.status = 'base';
      parentNode.tag = '基底: 0';
      pushStep({
        type: 'base-return',
        line: lineBoundary,
        i: safeG,
        j: remCap,
        activeNodeId: parentNode.id,
        tag: '命中基底 0',
        log: `| 🎯 边界命中: 组号超出或容量耗尽，return 0`,
        msg: `边界条件命中，直接返回基底值 <strong>0</strong>。`,
        decision: '基底返回 0'
      });
      activeStack.pop();
      return 0;
    }

    if (memoGrid[g][remCap] !== null) {
      const cached = memoGrid[g][remCap]!;
      parentNode.status = 'pruned';
      parentNode.tag = `⚡剪枝: ${cached}`;
      pushStep({
        type: 'cache-hit',
        line: lineCacheHit,
        i: safeG,
        j: remCap,
        activeNodeId: parentNode.id,
        gridHighlight: { i: safeG, j: remCap },
        tag: `⚡ 备忘录命中 memo[${g}][${remCap}] = ${cached}`,
        log: `| ⚡ 备忘录命中: memo[${g}][${remCap}] = ${cached}，立即剪枝返回！`,
        msg: `⚡ <strong>备忘录命中</strong>：状态 <code>memo[${g}][${remCap}]</code> 先前已被计算，直接返回缓存值 <strong>${cached}</strong>，成功剪除庞大子树！`,
        decision: `Cache Hit: 直接返回 ${cached}`
      });
      activeStack.pop();
      return cached;
    }

    const nextG = isReverse ? g - 1 : g + 1;
    const child0: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: Math.max(0, Math.min(numGroups - 1, nextG)),
      c: remCap,
      val: `dfsMemo(${nextG},${remCap})`,
      edgeLabel: '不选',
      status: 'current',
      children: []
    };
    parentNode.children.push(child0);

    pushStep({
      type: 'branch-call',
      line: lineBranchNotTake,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      tag: `组#${g} 不选任何物品`,
      log: `| ⏭️ 分支 0: 组 #${g} 全都不选，继承下一组状态`,
      msg: `分支 0（不选）：组 <code>#${g}</code> 不选任何物品，深入下一组。`,
      decision: '分支0: 本组不选'
    });

    let maxVal = dfsMemo(nextG, remCap, child0);

    const groupItems = groups[g] || [];
    for (let k = 0; k < groupItems.length; k++) {
      const item = groupItems[k];
      if (remCap >= item.cost) {
        const childK: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: Math.max(0, Math.min(numGroups - 1, nextG)),
          c: remCap - item.cost,
          val: `dfsMemo(${nextG},${remCap - item.cost})`,
          edgeLabel: `选物${k}`,
          status: 'current',
          children: []
        };
        parentNode.children.push(childK);

        pushStep({
          type: 'branch-call',
          line: lineLoopItems,
          i: safeG,
          j: remCap,
          activeNodeId: parentNode.id,
          tag: `组#${g} 尝试选物品 #${k} (c:${item.cost}, v:${item.val})`,
          log: `| 🗂️ 分支 ${k + 1}: 组 #${g} 尝试选物品 #${k} (体积=${item.cost}, 价值=${item.val})`,
          msg: `尝试互斥分支：在组 <code>#${g}</code> 中选择物品 #${k}。`,
          decision: `尝试选物品 #${k}`
        });

        const sub = dfsMemo(nextG, remCap - item.cost, childK) + item.val;
        if (sub > maxVal) {
          maxVal = sub;
        }

        pushStep({
          type: 'branch-eval',
          line: lineBranchTake,
          i: safeG,
          j: remCap,
          activeNodeId: parentNode.id,
          tag: `组内比较: 收益=${sub}, 当前最优=${maxVal}`,
          log: `| ⚖️ 组内互斥比较: 物品 #${k} 收益为 ${sub}，当前最大值更新为 ${maxVal}`,
          msg: `比较分支收益：选物品 #${k} 收益为 <code>${sub}</code>，当前最优 <strong>${maxVal}</strong>。`,
          decision: `更新最优收益=${maxVal}`
        });
      }
    }

    memoGrid[g][remCap] = maxVal;
    parentNode.status = 'visited';
    parentNode.tag = `= ${maxVal}`;

    pushStep({
      type: 'memo-store',
      line: lineCombine,
      i: safeG,
      j: remCap,
      activeNodeId: parentNode.id,
      gridHighlight: { i: safeG, j: remCap },
      tag: `💾 写入 memo[${g}][${remCap}] = ${maxVal}`,
      log: `| 💾 写入备忘录: memo[${g}][${remCap}] = ${maxVal}，落盘回溯`,
      msg: `💾 <strong>写入备忘录</strong>：将状态 <code>memo[${g}][${remCap}] = <strong>${maxVal}</strong></code> 存入表格，供后续剪枝使用。`,
      decision: `缓存落盘 memo[${g}][${remCap}] = ${maxVal}`
    });

    activeStack.pop();
    return maxVal;
  }

  dfsMemo(startG, capacity, rootNode);
  return steps;
}

// 阶段 3: 严格二维动态规划
function compilePartitionedStage3Steps(
  groups: Array<Array<{ cost: number; val: number }>>,
  capacity: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const numGroups = groups.length;

  const lineInitDp = anchors?.init_dp || 3;
  const lineOuterLoop = anchors?.outer_loop || 4;
  const lineInnerCap = anchors?.inner_cap || 5;
  const lineBranchNotTake = anchors?.branch_not_take || 6;
  const lineLoopItems = anchors?.loop_items || 7;
  const lineTransition = anchors?.transition || 10;
  const lineReturnAns = anchors?.return_ans || 15;

  const dp: number[][] = Array.from({ length: numGroups + 1 }, () => new Array(capacity + 1).fill(0));

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 3,
      grid: JSON.parse(JSON.stringify(dp)),
      decision: data.decision || '二维动态规划状态转移',
      log: data.log || '| DP填表',
      msg: data.msg || data.log || '',
      line: data.line || lineTransition,
      ...data
    });
  }

  pushStep({
    type: 'init-dp',
    line: lineInitDp,
    i: 0,
    j: 0,
    tag: `创建二维 DP 矩阵 dp[${numGroups + 1}][${capacity + 1}]`,
    log: `| 📋 创建规格为 ${numGroups + 1} × ${capacity + 1} 的二维动态规划状态表`,
    msg: `建立二维动态规划状态表 <code>dp[${numGroups + 1}][${capacity + 1}]</code>，初始基底全为 0。`,
    decision: '初始化 DP 矩阵'
  });

  const groupIndices = isReverse
    ? Array.from({ length: numGroups }, (_, idx) => numGroups - idx)
    : Array.from({ length: numGroups }, (_, idx) => idx + 1);

  for (const g of groupIndices) {
    const curGroupItems = groups[g - 1] || [];

    pushStep({
      type: 'outer-loop',
      line: lineOuterLoop,
      i: g,
      j: 0,
      tag: `外层遍历物品组 #${g} (包含 ${curGroupItems.length} 件物品)`,
      log: `| 🔁 外层主循环: 推进至物品组 #${g}，组内包含 ${curGroupItems.length} 件候选物品`,
      msg: `外层主循环进入物品组 <code>#${g}</code>。同一个组内的物品存在<strong>互斥性（至多选 1 件）</strong>。`,
      decision: `推进至物品组 #${g}`
    });

    const capIndices = isReverse
      ? Array.from({ length: capacity + 1 }, (_, idx) => capacity - idx)
      : Array.from({ length: capacity + 1 }, (_, idx) => idx);

    for (const j of capIndices) {
      pushStep({
        type: 'inner-cap',
        line: lineInnerCap,
        i: g,
        j,
        tag: `枚举背包容量 j = ${j}`,
        log: `| 📦 考察容量 j = ${j}: 准备进行组内互斥决策`,
        msg: `考察容量 <code>j = ${j}</code>：先继承上一组结果（不选），再枚举本组候选物品更新。`,
        decision: `考察容量 j=${j}`
      });

      const prevG = isReverse ? (g === numGroups ? 0 : g + 1) : g - 1;
      dp[g][j] = dp[prevG][j];

      pushStep({
        type: 'branch-not-take',
        line: lineBranchNotTake,
        i: g,
        j,
        highlightCells: [{ r: prevG, c: j }],
        tag: `分支 0 (不选): dp[${g}][${j}] = dp[${prevG}][${j}] = ${dp[g][j]}`,
        log: `| ⏭️ 分支 0 (本组不选): 继承上一组 dp[${prevG}][${j}] = ${dp[g][j]}`,
        msg: `分支 0（本组全都不选）：直接继承前一组收益 <code>dp[${prevG}][${j}] = <strong>${dp[g][j]}</strong></code>。`,
        decision: `继承前一组收益=${dp[g][j]}`
      });

      for (let k = 0; k < curGroupItems.length; k++) {
        const item = curGroupItems[k];
        if (j >= item.cost) {
          const candidate = dp[prevG][j - item.cost] + item.val;
          const isUpdate = candidate > dp[g][j];
          if (isUpdate) {
            dp[g][j] = candidate;
          }

          pushStep({
            type: 'transition',
            line: lineTransition,
            i: g,
            j,
            highlightCells: [{ r: prevG, c: j - item.cost }],
            tag: `尝试物品 #${k} (c:${item.cost}, v:${item.val}): dp[${g}][${j}] = ${dp[g][j]}`,
            log: `| 🗂️ 组内互斥: 试选物品 #${k} -> dp[${prevG}][${j - item.cost}] + ${item.val} = ${candidate} (当前 max=${dp[g][j]})`,
            msg: `组内互斥决策：尝试选物品 #${k}（消耗容量 <code>${item.cost}</code>，收益 <code>${item.val}</code>），从 <code>dp[${prevG}][${j - item.cost}]</code> 转移，状态更新为 <code>dp[${g}][${j}] = <strong>${dp[g][j]}</strong></code>。`,
            decision: isUpdate ? `更新 dp[${g}][${j}]=${dp[g][j]}` : `保持当前最优`
          });
        }
      }
    }
  }

  const finalG = isReverse ? 1 : numGroups;
  pushStep({
    type: 'return-ans',
    line: lineReturnAns,
    i: finalG,
    j: capacity,
    highlightCells: [{ r: finalG, c: capacity }],
    tag: `填表完成！最大收益 = ${dp[finalG][capacity]}`,
    log: `| 🏆 二维分组背包填表完成！全局最大收益 dp[${finalG}][${capacity}] = ${dp[finalG][capacity]}`,
    msg: `🎉 <strong>二维动态规划推演完毕</strong>！最终在全部 <code>${numGroups}</code> 组物品且容量限制为 <code>${capacity}</code> 条件下，求得最大收益为 <strong>${dp[finalG][capacity]}</strong>。`,
    decision: '完成填表推导'
  });

  return steps;
}

// 阶段 4: 一维空间压缩
function compilePartitionedStage4Steps(
  rawItems: Array<{ cost: number; val: number; group: number }>,
  capacity: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const lineSortItems = anchors?.sort_items || 3;
  const lineInitDp = anchors?.init_dp || 4;
  const lineOuterGroup = anchors?.outer_group || 5;
  const lineGroupEnd = anchors?.group_end || 6;
  const lineCapLoop = anchors?.cap_loop || 7;
  const lineItemLoop = anchors?.item_loop || 8;
  const lineTransition = anchors?.transition || 10;
  const lineAdvanceGroup = anchors?.advance_group || 14;
  const lineReturnAns = anchors?.return_ans || 16;

  const items = [...rawItems].sort((a, b) => isReverse ? b.group - a.group : a.group - b.group);
  const n = items.length;
  const dp = new Array(capacity + 1).fill(0);

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 4,
      grid: [dp.slice()],
      slotVector: dp.slice(),
      metrics: { space: 'O(M)' },
      decision: data.decision || '空间压缩状态流转',
      log: data.log || '| 一维压缩流转',
      msg: data.msg || data.log || '',
      line: data.line || lineTransition,
      ...data
    });
  }

  pushStep({
    type: 'sort-items',
    line: lineSortItems,
    activeSlot: 0,
    tag: `对全量 ${n} 件物品按组号进行排序`,
    log: `| 🔀 物品预处理: 按组号排序，使相同组物品在内存中连续排列`,
    msg: `对 <code>${n}</code> 件物品按组号递增排序，以便双指针批量切分处理每一组。`,
    decision: '按组号排序物品'
  });

  pushStep({
    type: 'init-dp',
    line: lineInitDp,
    activeSlot: 0,
    tag: `初始化一维滚动数组 dp[0..${capacity}] 全为 0`,
    log: `| 📋 初始化一维滚动数组 dp[0..${capacity}] 全为 0`,
    msg: `初始化长度为 <code>${capacity + 1}</code> 的一维滚动数组，辅助空间由 O(G×M) 大幅降至 <strong>O(M)</strong>。`,
    decision: '初始化一维数组'
  });

  for (let start = 0, end = 1; start < n;) {
    while (end < n && items[end].group === items[start].group) end++;
    const curGroup = items[start].group;
    const groupCount = end - start;

    pushStep({
      type: 'outer-group',
      line: lineOuterGroup,
      activeSlot: 0,
      tag: `外层遍历推进至组 #${curGroup} (区间 [${start}, ${end}))`,
      log: `| 🔁 空间压缩外层: 推进至组 #${curGroup}，共包含 ${groupCount} 件候选物品`,
      msg: `外层循环处理组 <code>#${curGroup}</code>。核心铁律：<strong>容量必须在外层倒序遍历，组内候选物品在内层枚举</strong>，防止单组多次选取！`,
      decision: `处理组 #${curGroup}`
    });

    pushStep({
      type: 'group-end',
      line: lineGroupEnd,
      activeSlot: 0,
      tag: `组 #${curGroup} 边界确定：共 ${groupCount} 件物品`,
      log: `| 📐 组边界确定: 组 #${curGroup} 包含下标 [${start}..${end - 1}] 的物品`,
      msg: `双指针扫描确定组 <code>#${curGroup}</code> 的边界，共 <code>${groupCount}</code> 件候选物品。`,
      decision: `确定组 #${curGroup} 边界`
    });

    for (let j = capacity; j >= 0; j--) {
      pushStep({
        type: 'cap-loop',
        line: lineCapLoop,
        activeSlot: j,
        tag: `容量倒序枚举 j = ${j} (严格倒序杜绝同组多选)`,
        log: `| ⬅️ 容量倒序: j = ${j}，外层枚举保证同组互斥`,
        msg: `容量倒序枚举 <code>j = ${j}</code>：外层倒序保证本轮组内任何更新只使用上一组的旧状态，彻底杜绝单组内多选！`,
        decision: `倒序枚举容量 j=${j}`
      });

      for (let k = start; k < end; k++) {
        const item = items[k];
        if (j >= item.cost) {
          const candidate = dp[j - item.cost] + item.val;
          const isUpdate = candidate > dp[j];
          if (isUpdate) {
            dp[j] = candidate;
          }

          pushStep({
            type: 'transition',
            line: lineTransition,
            activeSlot: j,
            highlightSlots: [j - item.cost],
            tag: `组内互斥比较: 试选 (c:${item.cost}, v:${item.val}) -> dp[${j}] = ${dp[j]}`,
            log: `| 🗂️ 尝试组 #${curGroup} 物品 #${k}: dp[${j - item.cost}] + ${item.val} = ${candidate} -> dp[${j}] = ${dp[j]}`,
            msg: `组内互斥尝试：选物品 #${k}（消耗容量 <code>${item.cost}</code>，增加价值 <code>${item.val}</code>），从 <code>dp[${j - item.cost}]</code> 转移，更新 <code>dp[${j}] = <strong>${dp[j]}</strong></code>。`,
            decision: isUpdate ? `更新 dp[${j}] = ${dp[j]}` : `保持当前最优`
          });
        }
      }
    }

    start = end++;
    pushStep({
      type: 'advance-group',
      line: lineAdvanceGroup,
      activeSlot: 0,
      tag: `组 #${curGroup} 决策完成，推进至下一组`,
      log: `| ⏩ 组 #${curGroup} 处理完毕，指针推进 start = ${start}`,
      msg: `组 <code>#${curGroup}</code> 组内所有物品与全容量流转完毕，指针推进至下一组。`,
      decision: `组 #${curGroup} 处理完毕`
    });
  }

  pushStep({
    type: 'return-ans',
    line: lineReturnAns,
    activeSlot: capacity,
    tag: `一维压缩推导完毕！最大收益 = ${dp[capacity]}`,
    log: `| 🎉 一维空间压缩完成！dp[${capacity}] = ${dp[capacity]}`,
    msg: `🎉 <strong>空间压缩演化完成</strong>！在 O(M) 辅助空间下，求得全局最大收益为 <strong>${dp[capacity]}</strong>。`,
    decision: '完成 O(M) 空间压缩'
  });

  return steps;
}
