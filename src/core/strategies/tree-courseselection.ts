import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';

/**
 * 选课（树上背包 DP / Course Selection on Tree / 洛谷 P2014, 左程云 79 课 Code02）
 * 严格遵循黄金准则：
 * 1. 建立虚拟超级根节点 0，将森林合并为一棵标准多叉树；
 * 2. 状态机完备：dp[u][j] 表示以 u 为根选修 j 门课的最大学分；
 * 3. 分组背包逆序转移：容量 j 从 m+1 到 1 逆序枚举，配额 k 从 0 到 j-1；
 * 4. 双向推导支持（Forward 自底向上树上分组背包 / Reverse 自顶向下预算试探对比）。
 */
export function compileCourseSelection(
  model: IYamlAlgorithmModel,
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const params = (model.defaultParams as any) || {};
  const n: number = params.n || 4;
  const m: number = params.m || 3;
  const rawCourses: number[][] = params.courses || [
    [1, 2, 0],
    [2, 3, 1],
    [3, 4, 0],
    [4, 2, 2],
  ]; // [id, score, parent]

  // 1. 构建树形依赖邻接表与学分数组
  const tree: number[][] = Array.from({ length: n + 1 }, () => []);
  const score = new Array(n + 1).fill(0);
  rawCourses.forEach((c) => {
    const cid = c[0];
    const sc = c[1];
    const p = c[2];
    if (p <= n && cid <= n) {
      tree[p].push(cid);
      score[cid] = sc;
    }
  });

  const maxCap = m + 1; // 虚拟根节点 0 占 1 额度

  // 2. 动态构建树骨架
  const colCounters: number[] = [];
  function buildTreeNode(u: number, depth: number): UniversalTreeNode {
    const c = colCounters[depth] || 0;
    colCounters[depth] = c + 1;
    const label = u === 0 ? '虚拟根#0' : `课#${u}(分${score[u]})`;
    const childNodes = (tree[u] || []).map((v) => buildTreeNode(v, depth + 1));
    return {
      id: `course-${u}`,
      r: depth,
      c,
      val: label,
      status: 'normal',
      children: childNodes,
    };
  }
  const treeTemplate = buildTreeNode(0, 0);

  const tags = new Map<number, string>();
  const statuses = new Map<number, UniversalTreeNode['status']>();
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(maxCap + 1).fill(0));

  function getTreeSnapshot(activeId?: string): UniversalTreeNode {
    function mapNode(node: UniversalTreeNode): UniversalTreeNode {
      const u = parseInt(node.id.replace('course-', ''), 10);
      let status = statuses.get(u) || 'normal';
      if (activeId === node.id) {
        status = 'current';
      }
      const tag = tags.get(u);
      return {
        ...node,
        status,
        tag,
        children: node.children.map(mapNode),
      };
    }
    return mapNode(treeTemplate);
  }

  function getCourseStateArrays(activeArrName?: string, activeSlotIdx?: number, currU: number = 0): StateArrayItem[] {
    const indices: string[] = [];
    const scoreVals: number[] = [];
    for (let i = 0; i <= n; i++) {
      indices.push(i === 0 ? '根#0' : `#${i}`);
      scoreVals.push(score[i]);
    }
    const capIndices: string[] = [];
    for (let j = 0; j <= maxCap; j++) {
      capIndices.push(`容量${j}`);
    }
    return [
      {
        id: 'arr-score',
        name: 'score[]',
        label: '课程固有学分',
        indices,
        values: scoreVals,
        activeIdx: activeArrName === 'score' ? activeSlotIdx : undefined,
        color: 'blue',
      },
      {
        id: 'arr-dp0',
        name: 'dp[0][]',
        label: '虚拟根背包学分',
        indices: capIndices,
        values: [...dp[0]],
        activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
        color: 'emerald',
      },
      {
        id: 'arr-dp-curr',
        name: `dp[${currU}][]`,
        label: `课#${currU}子树背包`,
        indices: capIndices,
        values: [...dp[currU]],
        activeIdx: activeArrName === 'dp-curr' ? activeSlotIdx : undefined,
        color: 'purple',
      },
    ];
  }

  function addCourseStep(
    stepData: Omit<UniversalStep, 'stateArrays' | 'treeRoot'> & {
      activeArrName?: string;
      activeArrSlot?: number;
      activeCourse?: number;
    }
  ) {
    const { activeArrName, activeArrSlot, activeCourse, ...rest } = stepData;
    const activeNodeId = activeCourse !== undefined ? `course-${activeCourse}` : undefined;
    steps.push({
      ...rest,
      line: rest.line || 1,
      codeLine: rest.codeLine || rest.line || 1,
      activeNodeId,
      treeRoot: getTreeSnapshot(activeNodeId),
      stateArrays: getCourseStateArrays(activeArrName, activeArrSlot, activeCourse ?? 0),
    });
  }

  // 逆向模式：自顶向下预算试探对比
  if (direction === 'reverse') {
    const isHigherStage = _stage > 1 && !anchorMap;
    const lineEntryR = anchorMap?.entry ?? 1;
    const lineBuildTreeR = anchorMap?.build_tree ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 7));
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 11));
    const lineInitRootR = anchorMap?.init_root ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 12));
    const lineSubCallR = anchorMap?.sub_call ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 15));
    const lineReturnR = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 8 : 9));

    addCourseStep({
      type: 'entry',
      line: lineEntryR,
      codeLine: lineEntryR,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '逆向自顶向下预算试探',
      log: '🔍 【逆向对比】启动自顶向下预算分配：自根向下试探贪心分配课程名额',
      msg: '启动自顶向下预算探查：对比先序试探贪心与后序树上分组背包全局最优解的差异。',
      activeCourse: 0,
    });

    addCourseStep({
      type: 'init',
      line: lineBuildTreeR,
      codeLine: lineBuildTreeR,
      i: 0,
      j: 0,
      dp1d: [0, maxCap],
      memo: [0, maxCap],
      activeSlot: 0,
      tag: '虚拟超级根节点建立',
      log: `👑 建立超级根节点 0，总配额上限 maxCap=${maxCap}`,
      msg: `虚拟超级根节点 <strong>#0</strong>：先修课预算总额 <code>${maxCap}</code>。`,
      activeCourse: 0,
    });

    let greedyTotal = 0;
    let budgetLeft = m;
    const queue: number[] = [0];
    statuses.set(0, 'visited');
    tags.set(0, '根节点(分0)');

    while (queue.length > 0 && budgetLeft > 0) {
      const u = queue.shift()!;
      for (const v of tree[u] || []) {
        if (budgetLeft <= 0) break;
        budgetLeft--;
        greedyTotal += score[v];
        statuses.set(v, 'visited');
        tags.set(v, `选修(+${score[v]}分)`);
        queue.push(v);

        addCourseStep({
          type: 'update',
          line: lineDfsEntryR,
          codeLine: lineDfsEntryR,
          i: v,
          j: budgetLeft,
          dp1d: [greedyTotal, budgetLeft],
          memo: [greedyTotal, score[v]],
          activeSlot: 0,
          tag: `自顶向下选修: 课#${v}(+${score[v]}分)`,
          log: `| ⚡ 【先序试探】选修课 #${v} (学分 ${score[v]}) -> 累计学分: ${greedyTotal}, 剩余名额: ${budgetLeft}`,
          msg: `自顶向下贪心选修 <strong>课#${v}</strong>：获得学分 <code>+${score[v]}</code>，累计学分 <strong>${greedyTotal}</strong>。`,
          activeCourse: v,
        });
      }
    }

    addCourseStep({
      type: 'return',
      line: lineReturnR,
      codeLine: lineReturnR,
      i: 0,
      j: maxCap,
      dp1d: [greedyTotal],
      memo: [greedyTotal],
      activeSlot: 0,
      tag: `逆向探查完成: ${greedyTotal}`,
      log: `| 🏆 逆向推导完成！先序贪心试探学分为: ${greedyTotal}`,
      msg: `🏆 逆向推导完成！先序自顶向下试探获得学分为 <strong>${greedyTotal}</strong>。`,
      activeCourse: 0,
    });

    return steps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      stage: _stage || 1,
      line: s.line || 1,
      codeLine: s.codeLine || s.line || 1,
      decision: s.decision || s.log || s.tag || '选课逆向预算试探',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || { '累计学分': String(greedyTotal), '推导方向': '逆向先序试探' },
    }));
  }

  // 正向模式：自底向上树上分组背包
  const isHigherStage = _stage > 1 && !anchorMap;
  const lineEntry = anchorMap?.entry ?? 1;
  const lineBuildTree = anchorMap?.build_tree ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 3));
  const lineInitDp = anchorMap?.init_dp ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 8));
  const lineDfsCall = anchorMap?.dfs_call ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 9));
  const lineReturn = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 11 : 10));
  const lineDfsEntry = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 12));
  const lineInitRoot = anchorMap?.init_root ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 13));
  const lineLoopChild = anchorMap?.loop_child ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 14));
  const lineSubCall = anchorMap?.sub_call ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 8 : 15));
  const lineKnapsackCap = anchorMap?.knapsack_cap ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 9 : 16));
  const lineAllocQuota = anchorMap?.alloc_quota ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 10 : 17));
  const lineTransfer = anchorMap?.transfer ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 11 : 18));

  // Step 0: 主函数入口
  addCourseStep({
    type: 'entry',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: '入口: maxCourseScore',
    log: `🚀 进入 maxCourseScore：总课程数 n=${n}, 最大选修门数 m=${m}`,
    msg: `主函数入口：准备求解 <strong>${n}</strong> 门课在限选 <strong>${m}</strong> 门下的树上背包最大学分。`,
    activeCourse: 0,
  });

  // Step 1: 建图
  addCourseStep({
    type: 'init',
    line: lineBuildTree,
    codeLine: lineBuildTree,
    i: 0,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: '构建树形先修关系图',
    log: '🌲 建立以虚拟根节点 0 为基底的多叉树，将无先修课的课程作为根节点 0 的直接子节点',
    msg: '建立虚拟超级根节点 <strong>#0</strong>，统一森林为一棵标准树型结构。',
    activeCourse: 0,
  });

  // Step 2: 初始化 DP 矩阵
  addCourseStep({
    type: 'init',
    line: lineInitDp,
    codeLine: lineInitDp,
    i: 0,
    j: 0,
    dp1d: [...dp[0]],
    memo: [...dp[0]],
    activeSlot: 0,
    tag: `初始化状态表 dp[${n + 1}][${maxCap + 1}]`,
    log: `📊 初始化树上分组背包状态矩阵：${n + 1} 行 × ${maxCap + 1} 列`,
    msg: `初始化动态规划状态表：<code>dp[0..${n}][0..${maxCap}] = 0</code>。`,
    activeCourse: 0,
  });

  // Step 3: 发起递归调用
  addCourseStep({
    type: 'init',
    line: lineDfsCall,
    codeLine: lineDfsCall,
    i: 0,
    j: maxCap,
    dp1d: [...dp[0]],
    memo: [...dp[0]],
    activeSlot: maxCap,
    tag: '启动后序 DFS: dfs(0)',
    log: '| 🚀 启动后序递归遍历：dfs(u=0, maxCap=' + maxCap + ')',
    msg: `准备自底向上后序合并子树：<code>dfs(0, maxCap=${maxCap})</code>。`,
    activeCourse: 0,
  });

  // DFS 递归求解
  function dfs(u: number) {
    statuses.set(u, 'current');
    dp[u][1] = score[u];
    tags.set(u, `自选(分${score[u]})`);

    addCourseStep({
      type: 'update',
      line: lineInitRoot,
      codeLine: lineInitRoot,
      i: u,
      j: 1,
      dp1d: [...dp[u]],
      memo: [...dp[u]],
      activeSlot: 1,
      tag: `节点#${u} 初始选修: dp[${u}][1]=${score[u]}`,
      log: `| 📍 节点 #${u} 初始容量 1：选修自身消耗 1 额度，得学分 ${score[u]}`,
      msg: `节点 <strong>#${u}</strong> 自身初始化：必选自身消耗 1 门配额，获得固有学分 <code>${score[u]}</code>。`,
      activeCourse: u,
      activeArrName: 'dp-curr',
      activeArrSlot: 1,
    });

    for (const v of tree[u] || []) {
      addCourseStep({
        type: 'branch-call',
        line: lineSubCall,
        codeLine: lineSubCall,
        i: u,
        j: v,
        dp1d: [...dp[u]],
        memo: [...dp[v]],
        activeSlot: 1,
        tag: `深入子节点: #${v}`,
        log: `| ⬇️ 【深入分支】节点 #${u} 递归求解子树 #${v}`,
        msg: `深入子树分支：后序求解子节点 <strong>#${v}</strong> 的树上背包状态。`,
        activeCourse: v,
      });

      dfs(v);

      statuses.set(u, 'current');
      tags.set(u, `合并子树#${v}`);

      // 树上分组背包逆序枚举
      for (let j = maxCap; j >= 1; j--) {
        let updated = false;
        let bestK = 0;
        let bestVal = dp[u][j];

        for (let k = 0; k < j; k++) {
          const candidate = dp[u][j - k] + dp[v][k];
          if (candidate > bestVal) {
            bestVal = candidate;
            bestK = k;
            updated = true;
          }
        }

        if (updated) {
          dp[u][j] = bestVal;
          addCourseStep({
            type: 'update',
            line: lineTransfer,
            codeLine: lineTransfer,
            i: u,
            j,
            dp1d: [...dp[u]],
            memo: [dp[u][j - bestK], dp[v][bestK]],
            activeSlot: j,
            tag: `节点#${u}容量${j}更新: 最优${bestVal}`,
            log: `| ⚡ 【分组背包转移】dp[${u}][${j}] = dp[${u}][${j - bestK}] + dp[${v}][${bestK}] = ${bestVal} (分配子树#${v} ${bestK} 门课)`,
            msg: `子树合并：节点 <strong>#${u}</strong> 容量 <code>j=${j}</code> 时，分配给子树 <strong>#${v}</strong> <code>${bestK}</code> 门课，获得学分 <strong>${bestVal}</strong>。`,
            activeCourse: u,
            activeArrName: 'dp-curr',
            activeArrSlot: j,
          });
        }
      }
    }

    statuses.set(u, 'visited');
    tags.set(u, `最优学分:${dp[u][maxCap] || dp[u][1]}`);
  }

  dfs(0);

  const finalAns = dp[0][maxCap];

  // 最终返回
  addCourseStep({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: maxCap,
    dp1d: [...dp[0]],
    memo: [finalAns],
    activeSlot: maxCap,
    tag: `最大学分: ${finalAns}`,
    log: `| 🏆 计算完成！dp[0][${maxCap}] = ${finalAns}，最多选修 ${m} 门课的最大学分为 ${finalAns}`,
    msg: `🏆 演化推导完成！虚拟根节点汇总：在最多选修 <strong>${m}</strong> 门课的先修依赖约束下，能够获得的最大学分为 <strong>${finalAns}</strong>！`,
    activeCourse: 0,
    activeArrName: 'dp0',
    activeArrSlot: maxCap,
  });

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '选课树上背包状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '最大学分': String(finalAns), '课程数': String(n), '最多选修': String(m) },
  }));
}
