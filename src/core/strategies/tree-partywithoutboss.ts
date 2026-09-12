import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compilePartyWithoutBoss(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'emp-1',
      r: 0,
      c: 0,
      val: '领导#1(乐4)',
      status: 'visited',
      tag: '不来:7|来:8',
      children: [
        {
          id: 'emp-2',
          r: 1,
          c: 0,
          val: '主管#2(乐1)',
          status: 'visited',
          tag: '不来:5|来:4',
          children: [
            { id: 'emp-4', r: 2, c: 0, val: '员工#4(乐3)', status: 'base', tag: '不来:0|来:3', children: [] },
            { id: 'emp-5', r: 2, c: 1, val: '员工#5(乐2)', status: 'base', tag: '不来:0|来:2', children: [] },
          ],
        },
        {
          id: 'emp-3',
          r: 1,
          c: 1,
          val: '主管#3(乐2)',
          status: 'visited',
          tag: '不来:6|来:2',
          children: [
            { id: 'emp-6', r: 2, c: 2, val: '员工#6(乐5)', status: 'base', tag: '不来:0|来:5', children: [] },
            { id: 'emp-7', r: 2, c: 3, val: '员工#7(乐1)', status: 'base', tag: '不来:0|来:1', children: [] },
          ],
        },
      ],
    };

    const happy = [0, 4, 1, 2, 3, 2, 5, 1];
    const dp0 = [0, 0, 0, 0, 0, 0, 0, 0];
    const dp1 = [0, 0, 0, 0, 0, 0, 0, 0];

    function getPartyStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-happy',
          name: 'happy[]',
          label: '员工固有快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [happy[1], happy[2], happy[3], happy[4], happy[5], happy[6], happy[7]],
          activeIdx: activeArrName === 'happy' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-dp0',
          name: 'dp[u][0]',
          label: '不参加快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [dp0[1], dp0[2], dp0[3], dp0[4], dp0[5], dp0[6], dp0[7]],
          activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
          color: 'amber',
        },
        {
          id: 'arr-dp1',
          name: 'dp[u][1]',
          label: '参加快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [dp1[1], dp1[2], dp1[3], dp1[4], dp1[5], dp1[6], dp1[7]],
          activeIdx: activeArrName === 'dp1' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
      ];
    }

    function addPartyStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getPartyStateArrays(activeArrName, activeArrSlot),
      });
    }

    // 1. 入口: maxHappy
    addPartyStep({
      type: 'entry',
      line: anchorMap?.entry || 2,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '入口: maxHappy',
      log: '🚀 进入 maxHappy：准备寻找最高上司根节点并构建树型依赖结构',
      msg: '算法启动：寻找没有上司的最高管理者（根节点 <strong>#1</strong>）。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 2. 定位根节点
    addPartyStep({
      type: 'init',
      line: anchorMap?.init || 8,
      i: 1,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '找到根节点: #1',
      log: '👑 寻根完成：节点 #1 没有上司，为整棵公司树的最高上司 (root=1)',
      msg: '定位最高上司根节点 <strong>#1</strong>，准备对其子树执行后序 DFS。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 3. 调用 dfs(root=1)
    addPartyStep({
      type: 'call',
      line: 9,
      i: 1,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '调用 dfs(root=1)',
      log: '🌲 调用 dfs(u=1)：深入后序遍历，递归各级主管与员工汇报决策',
      msg: '调用 <code>dfs(root=1)</code>，向左右子部门递归，收集子树汇报。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 4. 员工 #4 汇报
    dp0[4] = 0;
    dp1[4] = 3;
    addPartyStep({
      type: 'update',
      line: 15,
      i: 4,
      j: 0,
      dp1d: [0, 3],
      memo: [0, 3],
      activeSlot: 1,
      tag: '员工#4: [不来:0, 来:3]',
      log: '| 📍 员工#4(快乐值3)为叶子: 不来=0, 参加=3，向主管#2汇报 [0, 3]',
      msg: '员工 <strong>#4</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>3</code>，汇报 <code>[0, 3]</code>。',
      activeNodeId: 'emp-4',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 3,
    });

    // 5. 员工 #5 汇报
    dp0[5] = 0;
    dp1[5] = 2;
    addPartyStep({
      type: 'update',
      line: 15,
      i: 5,
      j: 0,
      dp1d: [0, 2],
      memo: [0, 2],
      activeSlot: 1,
      tag: '员工#5: [不来:0, 来:2]',
      log: '| 📍 员工#5(快乐值2)为叶子: 不来=0, 参加=2，向主管#2汇报 [0, 2]',
      msg: '员工 <strong>#5</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>2</code>，汇报 <code>[0, 2]</code>。',
      activeNodeId: 'emp-5',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 4,
    });

    // 6. 主管 #2 状态转移
    dp0[2] = Math.max(dp0[4], dp1[4]) + Math.max(dp0[5], dp1[5]); // 3 + 2 = 5
    dp1[2] = happy[2] + dp0[4] + dp0[5]; // 1 + 0 + 0 = 4
    addPartyStep({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 2,
      j: 0,
      dp1d: [5, 4],
      memo: [5, 4],
      activeSlot: 0,
      tag: '主管#2决策: [不来:5, 来:4]',
      log: '| ⚡ 主管#2合并下属决策: 不来=max(0,3)+max(0,2)=5; 参加=1+0+0=4，汇报 [5, 4]',
      msg: '主管 <strong>#2</strong> 汇总：若不来，下属 4 与 5 自选最优 <code>3 + 2 = 5</code>；若参加，下属均不能来，得 <code>1 + 0 + 0 = 4</code>。',
      activeNodeId: 'emp-2',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp0',
      activeArrSlot: 1,
    });

    // 7. 员工 #6 汇报
    dp0[6] = 0;
    dp1[6] = 5;
    addPartyStep({
      type: 'update',
      line: 15,
      i: 6,
      j: 0,
      dp1d: [0, 5],
      memo: [0, 5],
      activeSlot: 1,
      tag: '员工#6: [不来:0, 来:5]',
      log: '| 📍 员工#6(快乐值5)为叶子: 不来=0, 参加=5，向主管#3汇报 [0, 5]',
      msg: '员工 <strong>#6</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>5</code>，汇报 <code>[0, 5]</code>。',
      activeNodeId: 'emp-6',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 5,
    });

    // 8. 员工 #7 汇报
    dp0[7] = 0;
    dp1[7] = 1;
    addPartyStep({
      type: 'update',
      line: 15,
      i: 7,
      j: 0,
      dp1d: [0, 1],
      memo: [0, 1],
      activeSlot: 1,
      tag: '员工#7: [不来:0, 来:1]',
      log: '| 📍 员工#7(快乐值1)为叶子: 不来=0, 参加=1，向主管#3汇报 [0, 1]',
      msg: '员工 <strong>#7</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>1</code>，汇报 <code>[0, 1]</code>。',
      activeNodeId: 'emp-7',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 6,
    });

    // 9. 主管 #3 状态转移
    dp0[3] = Math.max(dp0[6], dp1[6]) + Math.max(dp0[7], dp1[7]); // 5 + 1 = 6
    dp1[3] = happy[3] + dp0[6] + dp0[7]; // 2 + 0 + 0 = 2
    addPartyStep({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 3,
      j: 0,
      dp1d: [6, 2],
      memo: [6, 2],
      activeSlot: 0,
      tag: '主管#3决策: [不来:6, 来:2]',
      log: '| ⚡ 主管#3合并下属决策: 不来=max(0,5)+max(0,1)=6; 参加=2+0+0=2，汇报 [6, 2]',
      msg: '主管 <strong>#3</strong> 汇总：若不来，下属 6 与 7 自选最优 <code>5 + 1 = 6</code>；若参加，下属均不能来，得 <code>2 + 0 + 0 = 2</code>。',
      activeNodeId: 'emp-3',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp0',
      activeArrSlot: 2,
    });

    // 10. 最高领导 #1 最终决策
    dp0[1] = Math.max(dp0[2], dp1[2]) + Math.max(dp0[3], dp1[3]); // 5 + 6 = 11
    dp1[1] = happy[1] + dp0[2] + dp0[3]; // 4 + 5 + 6 = 15
    addPartyStep({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 1,
      j: 0,
      dp1d: [11, 15],
      memo: [11, 15],
      activeSlot: 1,
      tag: '领导#1决策: [不来:11, 来:15]',
      log: '| ⚡ 领导#1决策: 不来 = max(5,4)+max(6,2) = 11; 参加 = 4 + 5 + 6 = 15',
      msg: '最高领导 <strong>#1</strong>：若不来得 <code>5 + 6 = 11</code>；若参加则直接下属不能来，总快乐值为 <code>4 + 5 + 6 = 15</code>。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 0,
    });

    // 11. 返回结果
    addPartyStep({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 1,
      j: 0,
      dp1d: [15],
      memo: [15],
      activeSlot: 0,
      tag: '舞会最大快乐值: 15',
      log: '| 🏆 计算完成！max(res[0], res[1]) = max(11, 15) = 15',
      msg: '🏆 演化推导完成！舞会最大快乐指数为 <strong>15</strong>。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
      activeArrName: 'dp1',
      activeArrSlot: 0,
    });

    return steps;
}
