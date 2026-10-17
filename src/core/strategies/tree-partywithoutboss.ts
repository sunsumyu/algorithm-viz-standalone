import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';

/**
 * 没有上司的舞会 (Greatest Independent Set on Tree / Happy Party, 洛谷 P1352, 左程云 79 课)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：遍历每个直接下属前发射 branch-call，进入子树发射 dfs_entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：下属返回后发射 branch-return 回溯赋值帧；
 * 3. 完备状态机闭环：
 *    - dp[u][0] = ∑ max(dp[v][0], dp[v][1]) （u 不来，下属自由选择）
 *    - dp[u][1] = happy[u] + ∑ dp[v][0]   （u 参加，下属一律不能来）
 * 4. 三状态数组联动：happy[], dp[u][0], dp[u][1] 实时切片渲染
 * 5. 双向推导支持（Forward 自底向上后序二元汇报 / Reverse 自顶向下先序邀请对比探查）
 */
export function compilePartyWithoutBoss(
  model: IYamlAlgorithmModel,
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const params = (model.defaultParams as any) || {};
  const n: number = params.n || 7;
  const happy: number[] = params.happy || [0, 4, 1, 2, 3, 2, 5, 1]; // 1-indexed
  const relations: number[][] = params.relations || params.edges || [
    [2, 1],
    [3, 1],
    [4, 2],
    [5, 2],
    [6, 3],
    [7, 3],
  ]; // [sub, boss]

  // 1. 构建邻接表与入度
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const hasBoss = new Array(n + 1).fill(false);
  relations.forEach((rel: number[]) => {
    const [sub, boss] = rel;
    if (boss !== undefined && adj[boss]) {
      adj[boss].push(sub);
    }
    if (sub !== undefined && sub <= n) {
      hasBoss[sub] = true;
    }
  });

  // 定位无上司的根节点
  let root = 1;
  while (root <= n && hasBoss[root]) root++;
  if (root > n) root = 1;

  // 2. 动态构建 UniversalTreeNode 树骨架与坐标
  const colCounters: number[] = [];
  function buildTreeNode(u: number, depth: number): UniversalTreeNode {
    const c = colCounters[depth] || 0;
    colCounters[depth] = c + 1;
    const isLeaf = !adj[u] || adj[u].length === 0;
    const role = u === root ? '领导' : isLeaf ? '员工' : '主管';
    const childNodes = (adj[u] || []).map((v) => buildTreeNode(v, depth + 1));

    return {
      id: `emp-${u}`,
      r: depth,
      c,
      val: `${role}#${u}(乐${happy[u] || 0})`,
      status: 'normal',
      children: childNodes,
    };
  }
  const treeTemplate = buildTreeNode(root, 0);

  // 状态集合
  const tags = new Map<number, string>();
  const statuses = new Map<number, UniversalTreeNode['status']>();
  const dp0 = new Array(n + 1).fill(0);
  const dp1 = new Array(n + 1).fill(0);

  function getTreeSnapshot(activeId?: string): UniversalTreeNode {
    function mapNode(node: UniversalTreeNode): UniversalTreeNode {
      const u = parseInt(node.id.replace('emp-', ''), 10);
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

  function getPartyStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
    const indices: string[] = [];
    const happyVals: number[] = [];
    const dp0Vals: number[] = [];
    const dp1Vals: number[] = [];
    for (let u = 1; u <= n; u++) {
      indices.push(`#${u}`);
      happyVals.push(happy[u] || 0);
      dp0Vals.push(dp0[u]);
      dp1Vals.push(dp1[u]);
    }
    return [
      {
        id: 'arr-happy',
        name: 'happy[]',
        label: '员工固有快乐值',
        indices,
        values: happyVals,
        activeIdx: activeArrName === 'happy' ? activeSlotIdx : undefined,
        color: 'blue',
      },
      {
        id: 'arr-dp0',
        name: 'dp[u][0]',
        label: '不参加快乐值',
        indices,
        values: dp0Vals,
        activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
        color: 'amber',
      },
      {
        id: 'arr-dp1',
        name: 'dp[u][1]',
        label: '参加快乐值',
        indices,
        values: dp1Vals,
        activeIdx: activeArrName === 'dp1' ? activeSlotIdx : undefined,
        color: 'emerald',
      },
    ];
  }

  function addPartyStep(
    stepData: Omit<UniversalStep, 'stateArrays' | 'treeRoot'> & {
      activeArrName?: string;
      activeArrSlot?: number;
      activeEmp?: number;
    }
  ) {
    const { activeArrName, activeArrSlot, activeEmp, ...rest } = stepData;
    const activeNodeId = activeEmp !== undefined ? `emp-${activeEmp}` : undefined;
    steps.push({
      ...rest,
      line: rest.line || 1,
      codeLine: rest.codeLine || rest.line || 1,
      activeNodeId,
      treeRoot: getTreeSnapshot(activeNodeId),
      stateArrays: getPartyStateArrays(activeArrName, activeArrSlot),
    });
  }

  // 逆向模式：自顶向下先序邀请对比探查 (Top-Down Pre-Order Exploration)
  if (direction === 'reverse') {
    const isHigherStage = _stage > 1 && !anchorMap;
    const lineEntryR = anchorMap?.entry ?? 1;
    const lineFindRootR = anchorMap?.find_root ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 2));
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 6));
    const lineReturnR = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 4));

    addPartyStep({
      type: 'entry',
      line: lineEntryR,
      codeLine: lineEntryR,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '逆向自顶向下邀请探查',
      log: '🔍 【逆向对比】启动自顶向下先序邀请探查：从最高上司根节点向下试探邀请决策',
      msg: '启动自顶向下先序探查：逐层对比上司出席与缺席时的下属快乐值，验证自底向上后序二元汇报的高效性。',
      activeEmp: root,
    });

    addPartyStep({
      type: 'init',
      line: lineFindRootR,
      codeLine: lineFindRootR,
      i: root,
      j: 0,
      dp1d: [happy[root] || 0, 0],
      memo: [happy[root] || 0, 0],
      activeSlot: 0,
      tag: `根节点最高上司: #${root}`,
      log: `| 👑 考察最高上司 #${root} (固有快乐值: ${happy[root] || 0})`,
      msg: `最高上司 <strong>#${root}</strong>：固有快乐值 <code>${happy[root] || 0}</code>。`,
      activeEmp: root,
    });

    let topDownTotal = 0;
    const queue: { u: number; canInvite: boolean }[] = [{ u: root, canInvite: true }];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const u = curr.u;
      statuses.set(u, 'current');

      const shouldInvite = curr.canInvite && (happy[u] || 0) > 0;
      if (shouldInvite) {
        topDownTotal += (happy[u] || 0);
      }
      tags.set(u, shouldInvite ? `✅出席(+${happy[u]})` : '❌不出席(0)');
      statuses.set(u, shouldInvite ? 'visited' : 'base');

      addPartyStep({
        type: 'update',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: u,
        j: 0,
        dp1d: [topDownTotal, shouldInvite ? 1 : 0],
        memo: [topDownTotal, happy[u] || 0],
        activeSlot: shouldInvite ? 1 : 0,
        tag: shouldInvite ? `职员#${u} 出席(+${happy[u]})` : `职员#${u} 缺席`,
        log: `| ⚡ 【先序决策】职员 #${u}: ${shouldInvite ? `出席舞会 (+${happy[u]})` : '不出席'} -> 当前累计快乐值: ${topDownTotal}`,
        msg: `自顶向下贪心考察职员 <strong>#${u}</strong>：${shouldInvite ? `决定邀请出席，增加快乐值 <code>+${happy[u]}</code>` : '因上司出席或收益非正，决定不出席'}。当前累计快乐值 <strong>${topDownTotal}</strong>。`,
        activeEmp: u,
      });

      for (const v of adj[u] || []) {
        queue.push({ u: v, canInvite: !shouldInvite });
      }
    }

    addPartyStep({
      type: 'return',
      line: lineReturnR,
      codeLine: lineReturnR,
      i: root,
      j: 0,
      dp1d: [topDownTotal],
      memo: [topDownTotal],
      activeSlot: 0,
      tag: `逆向探查完成: ${topDownTotal}`,
      log: `| 🏆 逆向推导完成！先序贪心邀请快乐总和为: ${topDownTotal}`,
      msg: `🏆 逆向推导完成！先序自顶向下邀请总快乐值为 <strong>${topDownTotal}</strong>。`,
      activeEmp: root,
    });

    return steps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      stage: _stage || 1,
      line: s.line || 1,
      codeLine: s.codeLine || s.line || 1,
      decision: s.decision || s.log || s.tag || '逆向探查状态转移',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || { '累计快乐值': String(topDownTotal), '推导方向': '逆向先序对比' },
    }));
  }

  // 正向模式：自底向上后序二元汇报
  const isHigherStage = _stage > 1 && !anchorMap;
  const lineEntry = anchorMap?.entry ?? 1;
  const lineFindRoot = anchorMap?.find_root ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 2));
  const lineInit = anchorMap?.init ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 3));
  const lineReturn = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 4));
  const lineDfsEntry = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 6));
  const lineInitNotCome = anchorMap?.init_not_come ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 7));
  const lineInitCome = anchorMap?.init_come ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 8));
  const lineLoopChild = anchorMap?.loop_child ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 9));
  const lineBranchCall = anchorMap?.branch_call ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 10));
  const lineAccumNotCome = anchorMap?.accum_not_come ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 11));
  const lineAccumCome = anchorMap?.accum_come ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 12));
  const lineCombine = anchorMap?.combine ?? (anchorMap ? anchorMap.return ?? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 13));

  // Step 0: 主入口
  addPartyStep({
    type: 'entry',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: '入口: maxHappy',
    log: '🚀 进入 maxHappy：准备寻找最高上司根节点并构建树型依赖结构',
    msg: '主函数入口：准备自底向上后序遍历多叉树，求解出席员工的最大快乐指数总和。',
    activeEmp: root,
  });

  // Step 1: 定位根节点
  addPartyStep({
    type: 'init',
    line: lineFindRoot,
    codeLine: lineFindRoot,
    i: root,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: `找到根节点: #${root}`,
    log: `👑 寻根完成：员工 #${root} 没有上司（入度为 0），为整棵公司的最高上司`,
    msg: `定位最高上司根节点 <strong>#${root}</strong>，准备对其子树执行多叉树后序遍历。`,
    activeEmp: root,
  });

  // Step 2: 启动后序递归
  addPartyStep({
    type: 'init',
    line: lineInit,
    codeLine: lineInit,
    i: root,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: `启动递归: dfs(#${root})`,
    log: `| 🚀 启动多叉树后序遍历：调用 dfs(员工 #${root})`,
    msg: `准备自底向上汇集员工汇报：<code>dfs(#${root})</code>。`,
    activeEmp: root,
  });

  // 递归求解函数
  function dfs(u: number): [number, number] {
    statuses.set(u, 'current');

    // a. 递归入栈帧 (dfs_entry)
    addPartyStep({
      type: 'entry',
      line: lineDfsEntry,
      codeLine: lineDfsEntry,
      i: u,
      j: 0,
      dp1d: [0, happy[u] || 0],
      memo: [0, happy[u] || 0],
      activeSlot: 0,
      tag: `进入员工 #${u}`,
      log: `| 📥 进入递归帧：dfs(员工 #${u})，其自身快乐值为 ${happy[u] || 0}`,
      msg: `进入员工 <strong>#${u}</strong> 的决策帧，其固有快乐值为 <code>happy[${u}] = ${happy[u] || 0}</code>。`,
      activeEmp: u,
    });

    // b. 初始化不来收益 notCome = 0
    let notCome = 0;
    dp0[u] = notCome;
    addPartyStep({
      type: 'init',
      line: lineInitNotCome,
      codeLine: lineInitNotCome,
      i: u,
      j: 0,
      dp1d: [notCome, 0],
      memo: [notCome, 0],
      activeSlot: 0,
      activeArrName: 'dp0',
      activeArrSlot: u - 1,
      tag: `dp[${u}][0] = 0`,
      log: `| ◽ 初始化不来快乐值：notCome = 0`,
      msg: `初始化不出席基础收益：<code>notCome = 0</code>。`,
      activeEmp: u,
    });

    // c. 初始化参加收益 come = happy[u]
    let come = happy[u] || 0;
    dp1[u] = come;
    addPartyStep({
      type: 'init',
      line: lineInitCome,
      codeLine: lineInitCome,
      i: u,
      j: 0,
      dp1d: [notCome, come],
      memo: [notCome, come],
      activeSlot: 1,
      activeArrName: 'dp1',
      activeArrSlot: u - 1,
      tag: `dp[${u}][1] = ${come}`,
      log: `| ◽ 初始化参加快乐值：come = happy[${u}] = ${come}`,
      msg: `初始化出席基础收益：<code>come = happy[${u}] = <strong>${come}</strong></code>。`,
      activeEmp: u,
    });

    // d. 遍历下属分支
    const children = adj[u] || [];
    for (let idx = 0; idx < children.length; idx++) {
      const next = children[idx];

      // for 循环探测头
      addPartyStep({
        type: 'loop',
        line: lineLoopChild,
        codeLine: lineLoopChild,
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 0,
        tag: `考察下属分支 [${idx + 1}/${children.length}]: #${next}`,
        log: `| 🔍 遍历下属 [${idx + 1}/${children.length}]：考察直接下属 #${next}`,
        msg: `遍历下属：考察员工 #${u} 的第 ${idx + 1} 个直接下属 <strong>#${next}</strong>。`,
        activeEmp: u,
      });

      // 子递归前拦截帧 (branch-call)
      addPartyStep({
        type: 'branch-call',
        line: lineBranchCall,
        codeLine: lineBranchCall,
        branchType: 'bottom',
        varName: `sub_${next}`,
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 0,
        tag: `递归下属: dfs(#${next})`,
        log: `| 🌿 【分支深入】员工 #${u} 准备递归深入直接下属 dfs(#${next})`,
        msg: `向下深入：调用 <code>dfs(#${next})</code>，探查下属汇报收益。`,
        activeEmp: u,
      });

      const sub = dfs(next);

      // Call-Return Parity 回溯赋值闭环帧 (branch-return)
      addPartyStep({
        type: 'branch-return',
        line: lineBranchCall,
        codeLine: lineBranchCall,
        branchType: 'bottom',
        subResult: sub,
        i: u,
        j: next,
        dp1d: [notCome, come, sub[0], sub[1]],
        memo: [sub[0], sub[1]],
        activeSlot: 0,
        tag: `下属#${next}汇报: [不来:${sub[0]}, 来:${sub[1]}]`,
        log: `| ↩️ 【回溯赋值】员工 #${u} 收到下属 #${next} 汇报: [不来:${sub[0]}, 来:${sub[1]}]`,
        msg: `下属返回赋值：收到直接下属 <strong>#${next}</strong> 汇报：<code>sub = [不来:${sub[0]}, 参加:${sub[1]}]</code>。`,
        activeEmp: u,
      });

      // 累加 notCome += max(sub[0], sub[1])
      const bestSub = Math.max(sub[0], sub[1]);
      notCome += bestSub;
      dp0[u] = notCome;
      addPartyStep({
        type: 'update',
        line: lineAccumNotCome,
        codeLine: lineAccumNotCome,
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 0,
        activeArrName: 'dp0',
        activeArrSlot: u - 1,
        tag: `notCome += max(${sub[0]}, ${sub[1]}) = ${notCome}`,
        log: `| ⚡ 累加不参加收益: notCome += max(${sub[0]}, ${sub[1]}) = ${bestSub} -> 当前 notCome = ${notCome}`,
        msg: `员工 <strong>#${u}</strong> 不参加：下属 #${next} 可自由选择 <code>max(${sub[0]}, ${sub[1]}) = ${bestSub}</code>，累加后 <code>notCome = <strong>${notCome}</strong></code>。`,
        activeEmp: u,
      });

      // 累加 come += sub[0]
      come += sub[0];
      dp1[u] = come;
      addPartyStep({
        type: 'update',
        line: lineAccumCome,
        codeLine: lineAccumCome,
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 1,
        activeArrName: 'dp1',
        activeArrSlot: u - 1,
        tag: `come += sub[0] = ${come}`,
        log: `| ⚡ 累加参加收益: come += ${sub[0]} -> 当前 come = ${come}`,
        msg: `员工 <strong>#${u}</strong> 参加：直接下属 #${next} <strong>绝对不能参加</strong>（只能贡献 <code>${sub[0]}</code>），累加后 <code>come = <strong>${come}</strong></code>。`,
        activeEmp: u,
      });
    }

    // e. 汇报收敛 (combine)
    const isLeaf = !adj[u] || adj[u].length === 0;
    tags.set(u, `不来:${notCome}|来:${come}`);
    statuses.set(u, isLeaf ? 'base' : 'visited');

    addPartyStep({
      type: 'combine',
      line: lineCombine,
      codeLine: lineCombine,
      i: u,
      j: 0,
      dp1d: [notCome, come],
      memo: [notCome, come],
      activeSlot: notCome >= come ? 0 : 1,
      tag: `员工#${u} 决策: [不来:${notCome}, 来:${come}]`,
      log: `| ⬆️ 【汇报上级】员工 #${u} 向直接上级汇报: [不来:${notCome}, 来:${come}] (最优: ${Math.max(notCome, come)})`,
      msg: `决策汇总：员工 <strong>#${u}</strong> 向直接上级汇报决策二元组 <code>[不参加:${notCome}, 参加:${come}]</code>。`,
      activeEmp: u,
    });

    return [notCome, come];
  }

  const res = dfs(root);
  const finalAns = Math.max(res[0], res[1]);

  // Step final: 主函数返回
  addPartyStep({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
    i: root,
    j: 0,
    dp1d: [finalAns],
    memo: [res[0], res[1]],
    activeSlot: 0,
    tag: `最大快乐值: ${finalAns}`,
    log: `| 🏆 计算完成！max(res[0], res[1]) = max(${res[0]}, ${res[1]}) = ${finalAns}`,
    msg: `🏆 演化推导完成！最高上司 #${root} 决策：<code>max(不来:${res[0]}, 来:${res[1]}) = <strong>${finalAns}</strong></code>，舞会最大快乐指数为 <strong>${finalAns}</strong>。`,
    activeEmp: root,
  });

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '没有上司的舞会状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '最大快乐值': String(finalAns), '最高上司': `#${root}` },
  }));
}
