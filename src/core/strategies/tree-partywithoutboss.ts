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
 */
export function compilePartyWithoutBoss(
  model: IYamlAlgorithmModel,
  _stage: number,
  anchorMap?: Record<string, number>
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

  const lineEntry = anchorMap?.entry || 2;
  const lineFindRoot = anchorMap?.find_root || 3;
  const lineInit = anchorMap?.init || 4;
  const lineReturn = anchorMap?.return || 5;
  const lineDfsEntry = anchorMap?.dfs_entry || 8;
  const lineInitNotCome = anchorMap?.init_not_come || 9;
  const lineInitCome = anchorMap?.init_come || 10;
  const lineLoopChild = anchorMap?.loop_child || 11;
  const lineBranchCall = anchorMap?.branch_call || 12;
  const lineAccumNotCome = anchorMap?.accum_not_come || 13;
  const lineAccumCome = anchorMap?.accum_come || 14;
  const lineCombine = anchorMap?.combine || 16;

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
      activeNodeId,
      treeRoot: getTreeSnapshot(activeNodeId),
      stateArrays: getPartyStateArrays(activeArrName, activeArrSlot),
    });
  }

  // Step 0: 主入口
  addPartyStep({
    type: 'entry',
    line: lineEntry,
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
    i: root,
    j: 0,
    dp1d: [0, 0],
    memo: [0, 0],
    activeSlot: 0,
    tag: `调用 dfs(root=${root})`,
    log: `🌲 调用 dfs(u=${root})：深入后序遍历，递归各级主管与员工汇报决策`,
    msg: `调用 <code>dfs(root=${root})</code>，向子部门递归，收集子树汇报。`,
    activeEmp: root,
  });

  // 递归函数 dfs(u): 返回 [notCome, come]
  function dfs(u: number): [number, number] {
    statuses.set(u, 'current');

    // a. 进入递归帧
    addPartyStep({
      type: 'entry',
      line: lineDfsEntry,
      i: u,
      j: 0,
      dp1d: [0, happy[u] || 0],
      memo: [0, happy[u] || 0],
      activeSlot: 0,
      tag: `进入员工 #${u}`,
      log: `| 📥 进入递归帧：dfs(u=${u})，考察员工 #${u} 的参会决策`,
      msg: `进入递归函数：考察员工 <strong>#${u}</strong>（固有快乐值: <code>${happy[u] || 0}</code>）。`,
      activeEmp: u,
    });

    // b. 初始化 notCome = 0
    let notCome = 0;
    dp0[u] = 0;
    addPartyStep({
      type: 'update',
      line: lineInitNotCome,
      i: u,
      j: 0,
      dp1d: [notCome, 0],
      memo: [notCome, 0],
      activeSlot: 0,
      activeArrName: 'dp0',
      activeArrSlot: u - 1,
      tag: `员工#${u} notCome = 0`,
      log: `| 📍 员工 #${u} 初始化不参加收益: notCome = 0`,
      msg: `若员工 <strong>#${u}</strong> 不参加舞会，基础收益初始化为 <code>0</code>。`,
      activeEmp: u,
    });

    // c. 初始化 come = happy[u]
    let come = happy[u] || 0;
    dp1[u] = come;
    addPartyStep({
      type: 'update',
      line: lineInitCome,
      i: u,
      j: 0,
      dp1d: [notCome, come],
      memo: [notCome, come],
      activeSlot: 1,
      activeArrName: 'dp1',
      activeArrSlot: u - 1,
      tag: `员工#${u} come = ${come}`,
      log: `| 📍 员工 #${u} 初始化参加收益: come = happy[${u}] = ${come}`,
      msg: `若员工 <strong>#${u}</strong> 参加舞会，可立即获得自身固有快乐值 <code>come = ${come}</code>。`,
      activeEmp: u,
    });

    // d. 遍历每一个直接下属
    for (const next of adj[u] || []) {
      // loop 帧
      addPartyStep({
        type: 'loop',
        line: lineLoopChild,
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 0,
        tag: `考察下属 #${next}`,
        log: `| 🔄 员工 #${u} 遍历直接下属 #${next}`,
        msg: `员工 <strong>#${u}</strong> 准备深入考察直接下属 <strong>#${next}</strong> 的参会汇报。`,
        activeEmp: u,
      });

      // Zero Step Skipping 拦截帧 (branch-call)
      addPartyStep({
        type: 'branch-call',
        line: lineBranchCall,
        branchType: 'bottom',
        varName: 'sub',
        i: u,
        j: next,
        dp1d: [notCome, come],
        memo: [notCome, come],
        activeSlot: 0,
        tag: `调用 dfs(next=${next})`,
        log: `| 🌿 【分支调用】员工 #${u} 调用 dfs(${next}) 收集下属 #${next} 决策`,
        msg: `深入下属子树：调用 <code>dfs(${next})</code> 求解下属 <strong>#${next}</strong> 汇报二元组。`,
        activeEmp: u,
      });

      const sub = dfs(next);

      // Call-Return Parity 回溯赋值闭环帧 (branch-return)
      addPartyStep({
        type: 'branch-return',
        line: lineBranchCall,
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

  return steps;
}

