import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

/**
 * 到达首都的最少油耗 (Minimum Fuel Cost to Report to the Capital / LeetCode 2477 / 左程云 Class 079 Code03)
 * 严格遵循黄金准则：
 * 1. 动态自构建多叉树：以首都 0 号城市为根建立有向父子层次结构；
 * 2. 状态机完备：people[u] 汇总子树总人数，每条边跨越车数 ⌈people[u] / seats⌉；
 * 3. 递归调用与回溯闭环：branch-call 与 branch-return 物理对齐；
 * 4. 三状态数组联动：people[], cars[], totalFuel 实时切片展示；
 * 5. 双向推导支持（Forward 自底向上人数汇聚拼车 / Reverse 自顶向下发车调度对比）。
 */
export function compileMinimumFuelCost(
  model: IYamlAlgorithmModel,
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const params = (model.defaultParams as any) || {};
  const n: number = params.n || 7;
  const seats: number = params.seats || 2;
  const roads: number[][] = params.roads || [
    [0, 1],
    [0, 4],
    [0, 5],
    [1, 2],
    [1, 3],
    [4, 6],
  ];

  // 1. 构建无向邻接表与多叉树父子拓扑
  const graph: number[][] = Array.from({ length: n }, () => []);
  roads.forEach(([u, v]) => {
    if (u < n && v < n) {
      graph[u].push(v);
      graph[v].push(u);
    }
  });

  const childrenOf: number[][] = Array.from({ length: n }, () => []);
  const parentOf = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);

  function buildHierarchy(u: number) {
    visited[u] = true;
    for (const v of graph[u]) {
      if (!visited[v]) {
        parentOf[v] = u;
        childrenOf[u].push(v);
        buildHierarchy(v);
      }
    }
  }
  buildHierarchy(0);

  // 2. 动态构建 UniversalTreeNode 树骨架与布局坐标
  const colCounters: number[] = [];
  function buildTreeNode(u: number, depth: number): UniversalTreeNode {
    const c = colCounters[depth] || 0;
    colCounters[depth] = c + 1;
    const label = u === 0 ? '首都#0' : `市#${u}`;
    const childNodes = childrenOf[u].map((v) => buildTreeNode(v, depth + 1));
    return {
      id: `city-${u}`,
      r: depth,
      c,
      val: label,
      status: 'normal',
      tag: '1人待汇聚',
      children: childNodes,
    };
  }
  const treeTemplate = buildTreeNode(0, 0);

  const tags = new Map<number, string>();
  const statuses = new Map<number, UniversalTreeNode['status']>();
  const people = new Array(n).fill(0);
  const cars = new Array(n).fill(0);
  let totalFuel = 0;

  function getTreeSnapshot(activeId?: string): UniversalTreeNode {
    function mapNode(node: UniversalTreeNode): UniversalTreeNode {
      const u = parseInt(node.id.replace('city-', ''), 10);
      let status = statuses.get(u) || 'normal';
      if (activeId === node.id) {
        status = 'current';
      }
      const tag = tags.get(u) || node.tag;
      return {
        ...node,
        status,
        tag,
        children: node.children.map(mapNode),
      };
    }
    return mapNode(treeTemplate);
  }

  function getFuelStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
    const cityLabels = Array.from({ length: n }, (_, i) => (i === 0 ? '首都#0' : `市#${i}`));
    return [
      {
        id: 'arr-people',
        name: 'people[]',
        label: '各城子树总人数',
        indices: cityLabels,
        values: [...people],
        activeIdx: activeArrName === 'people' ? activeSlotIdx : undefined,
        color: 'blue',
      },
      {
        id: 'arr-cars',
        name: 'cars[]',
        label: '驶向父城车数(油耗)',
        indices: cityLabels,
        values: [...cars],
        activeIdx: activeArrName === 'cars' ? activeSlotIdx : undefined,
        color: 'indigo',
      },
      {
        id: 'arr-fuel',
        name: 'totalFuel',
        label: '全国累计总油耗',
        indices: ['全国耗油'],
        values: [totalFuel],
        activeIdx: activeArrName === 'fuel' ? activeSlotIdx : undefined,
        color: 'amber',
      },
    ];
  }

  function addStep(
    data: Partial<UniversalStep> & {
      activeCity?: number;
      activeArrName?: string;
      activeArrSlot?: number;
    }
  ) {
    const activeNodeId = data.activeCity !== undefined ? `city-${data.activeCity}` : undefined;
    const { activeCity, activeArrName, activeArrSlot, ...rest } = data;
    steps.push({
      ...rest,
      activeNodeId,
      treeRoot: getTreeSnapshot(activeNodeId),
      stateArrays: getFuelStateArrays(activeArrName, activeArrSlot),
    } as UniversalStep);
  }

  // 3. 区分正反推导
  if (direction === 'reverse') {
    // 逆向自顶向下发车调度对比
    const isHigherStage = _stage > 1;
    const lineEntryR = anchorMap?.entry ?? (isHigherStage ? 2 : 2);
    const lineBuildR = anchorMap?.build_tree ?? (isHigherStage ? 3 : 3);
    const lineInitR = anchorMap?.init_graph ?? (isHigherStage ? 4 : 6);
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (isHigherStage ? 5 : 9);
    const lineLoopChildR = anchorMap?.loop_child ?? (isHigherStage ? 7 : 11);
    const lineBranchCallR = anchorMap?.branch_call ?? (isHigherStage ? 8 : 12);
    const lineCalcFuelR = anchorMap?.calc_fuel ?? (isHigherStage ? 9 : 13);
    const lineReturnR = anchorMap?.return ?? (isHigherStage ? 10 : 7);

    addStep({
      type: 'entry',
      line: lineEntryR,
      codeLine: lineEntryR,
      i: 0,
      j: 0,
      dp1d: [0],
      tag: '逆向自顶向下调度',
      log: '🔍 【逆向对比】启动自顶向下发车调度探查：从首都 0 号城市自顶向下派送车辆',
      msg: '启动自顶向下发车调度对比：假定由首都统一向外派送车辆，对比检验自底向上子树汇聚拼车的极佳油耗优化。',
      activeCity: 0,
    });

    addStep({
      type: 'init',
      line: lineBuildR,
      codeLine: lineBuildR,
      i: 0,
      j: 0,
      dp1d: [0],
      tag: '公路网络拓扑建立',
      log: `| 🗺️ 建立全国 ${n} 座城市公路拓扑网络，每辆车最多容纳 seats=${seats} 人`,
      msg: `全国共有 <code>${n}</code> 座城市，车座容量 <code>seats = ${seats}</code>。`,
      activeCity: 0,
    });

    let topDownFuel = 0;
    const queue: { u: number; p: number }[] = [{ u: 0, p: -1 }];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const u = curr.u;
      statuses.set(u, 'current');

      addStep({
        type: 'update',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: u,
        j: 0,
        dp1d: [topDownFuel],
        activeSlot: u,
        tag: `调度探测城市 #${u}`,
        log: `| 🚗 【自顶向下】从城市 #${curr.p >= 0 ? curr.p : '首都'} 驶向城市 #${u}`,
        msg: `派送空车调度到达城市 <strong>#${u}</strong>。`,
        activeCity: u,
      });

      statuses.set(u, 'visited');
      for (const v of childrenOf[u]) {
        topDownFuel += 1;
        cars[v] = 1;
        tags.set(v, `逆向派车:1车`);
        queue.push({ u: v, p: u });
      }
    }

    addStep({
      type: 'return',
      line: lineReturnR,
      codeLine: lineReturnR,
      i: 0,
      j: 0,
      dp1d: [topDownFuel],
      tag: `逆向调度油耗: ${topDownFuel}L`,
      log: `| 🏆 逆向自顶向下发车探查完成：对比验证后序子树汇聚拼车最优`,
      msg: `逆向发车调度探索完毕！对比验证后序自底向上汇聚拼车能最大化利用每辆车的 <code>seats=${seats}</code> 个座位。`,
      activeCity: 0,
    });
  } else {
    // 正向自底向上子树人数汇聚 (Bottom-Up Tree DP)
    const isHigherStage = _stage > 1;
    const lineEntry = anchorMap?.entry ?? (isHigherStage ? 2 : 2);
    const lineBuild = anchorMap?.build_tree ?? (isHigherStage ? 3 : 4);
    const lineInitGraph = anchorMap?.init_graph ?? (isHigherStage ? 4 : 7);
    const lineDfsCall = anchorMap?.dfs_call ?? (isHigherStage ? 5 : 8);
    const lineReturn = anchorMap?.return ?? (isHigherStage ? 13 : 9);
    const lineDfsEntry = anchorMap?.dfs_entry ?? (isHigherStage ? 6 : 11);
    const lineInitPeople = anchorMap?.init_people ?? (isHigherStage ? 7 : 12);
    const lineLoopChild = anchorMap?.loop_child ?? (isHigherStage ? 8 : 13);
    const lineBranchCall = anchorMap?.branch_call ?? (isHigherStage ? 9 : 14);
    const lineCheckRoot = anchorMap?.check_root ?? (isHigherStage ? 10 : 16);
    const lineCalcFuel = anchorMap?.calc_fuel ?? (isHigherStage ? 11 : 17);
    const lineReturnPeople = anchorMap?.return_people ?? (isHigherStage ? 12 : 19);

    // Step 1: 算法入口
    addStep({
      type: 'entry',
      line: lineEntry,
      codeLine: lineEntry,
      i: 0,
      j: 0,
      dp1d: [0],
      tag: 'minimumFuelCost 启动',
      log: `🚀 minimumFuelCost 入口：${n}座城市，车座配额 seats=${seats}`,
      msg: `启动 <code>minimumFuelCost</code>：每辆车最多坐 <code>${seats}</code> 人，后序统计各子树人数与拼车跨边油耗。`,
      activeCity: 0,
    });

    // Step 2: 拓扑图建立
    addStep({
      type: 'init',
      line: lineInitGraph,
      codeLine: lineInitGraph,
      i: 0,
      j: 0,
      dp1d: [0],
      tag: `构建 ${n} 节点公路双向图`,
      log: `| 🗺️ 公路双向图构建完毕，以首都 0 号城市为总汇聚点`,
      msg: `建立以 <strong>首都 0 号节点</strong> 为根的多叉树公路网。`,
      activeCity: 0,
    });

    // Step 3: 发起后序遍历
    addStep({
      type: 'call',
      line: lineDfsCall,
      codeLine: lineDfsCall,
      i: 0,
      j: 0,
      dp1d: [0],
      tag: '深入首都 dfs(0, -1)',
      log: `| 📥 调用 dfs(0, -1, tree, ${seats}) 发起后序子树汇聚`,
      msg: `调用 <code>dfs(0, -1)</code>，自底向上递归汇聚各地代表。`,
      activeCity: 0,
    });

    function dfs(u: number, p: number): number {
      statuses.set(u, 'current');
      tags.set(u, '正在探查...');

      // 帧入口
      addStep({
        type: 'dfs-entry',
        line: lineDfsEntry,
        codeLine: lineDfsEntry,
        i: u,
        j: p >= 0 ? p : 0,
        dp1d: [totalFuel],
        activeSlot: u,
        tag: `dfs(#${u}, 父:#${p >= 0 ? p : '无'})`,
        log: `| 📥 进入 dfs(#${u}, p=${p})：考察城市 #${u}`,
        msg: `进入城市 <strong>市#${u}</strong> 递归帧（父城 <strong>#${p >= 0 ? p : '无'}</strong>）。`,
        activeCity: u,
      });

      // 初始化本城代表 1 人
      let subtreePeople = 1;
      people[u] = 1;
      addStep({
        type: 'init',
        line: lineInitPeople,
        codeLine: lineInitPeople,
        i: u,
        j: 0,
        dp1d: [subtreePeople],
        activeSlot: u,
        activeArrName: 'people',
        activeArrSlot: u,
        tag: `市#${u} 固有代表: 1人`,
        log: `| 👤 初始化城市 #${u} 自身代表：people = 1`,
        msg: `城市 <strong>市#${u}</strong> 本地固有代表 <strong>1 人</strong>。`,
        activeCity: u,
      });

      // 遍历所有子城市
      const children = childrenOf[u];
      for (let idx = 0; idx < children.length; idx++) {
        const v = children[idx];

        addStep({
          type: 'loop',
          line: lineLoopChild,
          codeLine: lineLoopChild,
          i: u,
          j: v,
          dp1d: [subtreePeople],
          activeSlot: u,
          tag: `考察下级分支 [${idx + 1}/${children.length}]: 市#${v}`,
          log: `| 🔍 遍历子节点公路：考察连接城市 #${v}`,
          msg: `城市 #${u} 考察公路通向 <strong>市#${v}</strong>。`,
          activeCity: u,
        });

        addStep({
          type: 'branch-call',
          line: lineBranchCall,
          codeLine: lineBranchCall,
          branchType: 'bottom',
          varName: `child_${v}`,
          i: u,
          j: v,
          dp1d: [subtreePeople],
          activeSlot: u,
          tag: `递归子树 dfs(#${v})`,
          log: `| 🌿 【分支深入】城市 #${u} 递归进入子城市 dfs(#${v}, #${u})`,
          msg: `递归深入子树 <code>dfs(#${v})</code> 统计该分支总人数。`,
          activeCity: u,
        });

        const childPeople = dfs(v, u);

        addStep({
          type: 'branch-return',
          line: lineBranchCall,
          codeLine: lineBranchCall,
          branchType: 'bottom',
          subResult: childPeople,
          i: u,
          j: v,
          dp1d: [subtreePeople, childPeople],
          activeSlot: u,
          tag: `市#${v}汇聚返回: ${childPeople}人`,
          log: `| ↩️ 【回溯返回】城市 #${v} 子树代表汇聚完毕，向市 #${u} 返回 ${childPeople} 人`,
          msg: `子树 <strong>市#${v}</strong> 汇聚完毕，向父城汇报：<code>childPeople = <strong>${childPeople} 人</strong></code>。`,
          activeCity: u,
        });

        subtreePeople += childPeople;
        people[u] = subtreePeople;

        addStep({
          type: 'update',
          line: lineBranchCall,
          codeLine: lineBranchCall,
          i: u,
          j: v,
          dp1d: [subtreePeople],
          activeSlot: u,
          activeArrName: 'people',
          activeArrSlot: u,
          tag: `市#${u}子树人数累加: ${subtreePeople}人`,
          log: `| ➕ 城市 #${u} 累加子树人数：people += ${childPeople} -> 当前子树总计 ${subtreePeople} 人`,
          msg: `累加子树人数：市 #${u} 累计代表总数增至 <strong>${subtreePeople} 人</strong>。`,
          activeCity: u,
        });
      }

      // 计算驶向父节点的跨边油耗
      if (u !== 0) {
        addStep({
          type: 'check',
          line: lineCheckRoot,
          codeLine: lineCheckRoot,
          i: u,
          j: 0,
          dp1d: [subtreePeople],
          activeSlot: u,
          tag: `市#${u} 非首都: 计算跨边车辆`,
          log: `| ⚖️ 城市 #${u} 为非首都城市，其子树中 ${subtreePeople} 人必须乘车驶向市 #${p}`,
          msg: `城市 <strong>市#${u}</strong> 非首都，子树 <code>${subtreePeople}</code> 人必须拼车驶向父城 <strong>市#${p}</strong>。`,
          activeCity: u,
        });

        const needCars = Math.ceil(subtreePeople / seats);
        cars[u] = needCars;
        totalFuel += needCars;

        statuses.set(u, 'visited');
        tags.set(u, `${subtreePeople}人|${needCars}车(${needCars}L)`);

        addStep({
          type: 'update',
          line: lineCalcFuel,
          codeLine: lineCalcFuel,
          i: u,
          j: p,
          dp1d: [totalFuel],
          activeSlot: u,
          activeArrName: 'cars',
          activeArrSlot: u,
          tag: `跨边需 ⌈${subtreePeople}/${seats}⌉=${needCars}车, 耗油+${needCars}L`,
          log: `| ⛽ 【跨边油耗】市#${u} -> 市#${p}：⌈${subtreePeople}/${seats}⌉ = ${needCars} 辆车，累计耗油 +${needCars}L (全国总计 ${totalFuel}L)`,
          msg: `拼车跨边：<code>⌈${subtreePeople} / ${seats}⌉ = <strong>${needCars} 辆车</strong></code>，消耗 <strong>${needCars} 升油</strong>驶向市 #${p}。全国累计总油耗：<strong>${totalFuel} 升</strong>。`,
          activeCity: u,
        });
      } else {
        statuses.set(0, 'visited');
        tags.set(0, `全国${subtreePeople}人抵京`);
      }

      // 返回子树人数
      addStep({
        type: 'combine',
        line: lineReturnPeople,
        codeLine: lineReturnPeople,
        i: u,
        j: 0,
        dp1d: [subtreePeople],
        activeSlot: u,
        tag: `市#${u} 返回子树总人数: ${subtreePeople}人`,
        log: `| ⬆️ 城市 #${u} 汇聚完成，向父节点返回 people = ${subtreePeople}`,
        msg: `城市 <strong>市#${u}</strong> 汇聚决策完成，向父城返回 <strong>${subtreePeople} 人</strong>。`,
        activeCity: u,
      });

      return subtreePeople;
    }

    dfs(0, -1);

    // 最终全局答案
    addStep({
      type: 'return',
      line: lineReturn,
      codeLine: lineReturn,
      i: 0,
      j: 0,
      dp1d: [totalFuel],
      tag: `全国最少总油耗: ${totalFuel} 升`,
      log: `| 🏆 计算全部完成！return totalFuel = ${totalFuel}L`,
      msg: `🏆 演化推导完成！所有代表到达首都的最少总油耗为 <strong>${totalFuel} 升</strong>。`,
      activeCity: 0,
      activeArrName: 'fuel',
      activeArrSlot: 0,
    });
  }

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '到达首都的最少油耗状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || {
      '最少总油耗': `${totalFuel} 升`,
      '车座配额': `${seats} 人/车`,
      '城市总数': `${n} 座`,
    },
  }));
}
