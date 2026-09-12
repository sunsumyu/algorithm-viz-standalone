import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compileCourseSelection(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeState: UniversalTreeNode = {
      id: 'course-0',
      r: 0,
      c: 0,
      val: '虚拟根#0(分0)',
      status: 'normal',
      tag: '待规划',
      children: [
        {
          id: 'course-1',
          r: 1,
          c: 0,
          val: '课#1(分2)',
          status: 'normal',
          tag: '待规划',
          children: [
            { id: 'course-2', r: 2, c: 0, val: '课#2(分3)', status: 'normal', tag: '待规划', children: [] },
          ],
        },
        {
          id: 'course-3',
          r: 1,
          c: 1,
          val: '课#3(分4)',
          status: 'normal',
          tag: '待规划',
          children: [],
        },
      ],
    };

    const credits = [0, 2, 3, 4];
    const dp: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    function setCourseStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getCourseStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-credits',
          name: 'credits[]',
          label: '课程自身学分',
          indices: ['#0(根)', '#1', '#2', '#3'],
          values: [...credits],
          activeIdx: activeArrName === 'credits' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-dp0',
          name: 'dp[0][]',
          label: '根节点背包最优学分',
          indices: ['选0门', '选1门', '选2门', '选3门'],
          values: [...dp[0]],
          activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-dp1',
          name: 'dp[1][]',
          label: '课#1子树背包学分',
          indices: ['选0门', '选1门', '选2门', '选3门'],
          values: [...dp[1]],
          activeIdx: activeArrName === 'dp1' ? activeSlotIdx : undefined,
          color: 'purple',
        },
      ];
    }

    function addCourseStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getCourseStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 2: public int maxCourseScore(...)
    addCourseStep({
      type: 'entry',
      line: anchorMap?.entry || 2,
      i: 0,
      j: 0,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 0,
      tag: 'maxCourseScore 入口',
      log: '🚀 maxCourseScore 入口：建立虚拟超级根节点 0，容积上限 m=2 (+1虚拟额度=3)',
      msg: '启动 <code>maxCourseScore</code>：以虚拟根节点 <strong>#0</strong> 建立树上依赖背包。',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
    });

    // 课 2 汇报
    dp[2][1] = 3;
    setCourseStatus('course-2', 'visited', '最优学分:3');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 2,
      j: 1,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 1,
      tag: '课#2 初始化 dp[2][1]=3',
      log: '| 📍 课#2(叶节点): 选择1门得学分 3，向父节点课#1汇报',
      msg: '课 <strong>#2</strong> 为叶节点：选 1 门课获得学分 <code>3</code>。',
      activeNodeId: 'course-2',
      treeRoot: cloneTree(treeState),
      activeArrName: 'credits',
      activeArrSlot: 2,
    });

    // 课 1 合并课 2
    dp[1][1] = 2;
    dp[1][2] = 2 + 3; // 5
    setCourseStatus('course-1', 'visited', '最优学分:5');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 1,
      j: 2,
      dp1d: [...dp[1]],
      memo: [...dp[1]],
      activeSlot: 2,
      tag: '课#1合并子课#2: dp[1][2]=5',
      log: '| ⚡ 课#1合并: 选课#1(2分) + 子课#2(3分) -> 选2门获得最大学分 5',
      msg: '课 <strong>#1</strong> 决策：自选修需 1 额度（2分），加上子课 <strong>#2</strong> 共 2 门得 <strong>5</strong> 分。',
      activeNodeId: 'course-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp1',
      activeArrSlot: 2,
    });

    // 课 3 汇报
    dp[3][1] = 4;
    setCourseStatus('course-3', 'visited', '最优学分:4');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 3,
      j: 1,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 1,
      tag: '课#3 初始化 dp[3][1]=4',
      log: '| 📍 课#3(叶节点): 选择1门得学分 4，向根节点汇报',
      msg: '课 <strong>#3</strong> 为叶节点：选 1 门课获得学分 <code>4</code>。',
      activeNodeId: 'course-3',
      treeRoot: cloneTree(treeState),
      activeArrName: 'credits',
      activeArrSlot: 3,
    });

    // 根节点合并课 1 与课 3
    dp[0][1] = 0;
    dp[0][2] = 4; // 选根+课3 = 4
    dp[0][3] = 2 + 4; // 选根+课1+课3 = 6
    setCourseStatus('course-0', 'visited', '最大学分:6');
    addCourseStep({
      type: 'update',
      line: 15,
      i: 0,
      j: 3,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 3,
      tag: '根节点背包合并: dp[0][3]=6',
      log: '| ⚡ 根节点最终分组背包合并: 选课#1(2分) + 课#3(4分) -> 最大学分 6',
      msg: '超级根节点汇总：选修 <strong>课#1 (2分)</strong> 与 <strong>课#3 (4分)</strong>，在 2 门限额下获得最大学分 <strong>6</strong>！',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp0',
      activeArrSlot: 3,
    });

    // Line 19: return dp[0][m + 1];
    addCourseStep({
      type: 'return',
      line: anchorMap?.return || 19,
      i: 0,
      j: 3,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 3,
      tag: '返回最大学分: 6',
      log: '| 🏆 return dp[0][m + 1 = 3] = 6;',
      msg: '🏆 树上分组背包求解完成！最多选 2 门课的最大学分为 <strong>6</strong>。',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp0',
      activeArrSlot: 3,
    });

    return steps;
}
