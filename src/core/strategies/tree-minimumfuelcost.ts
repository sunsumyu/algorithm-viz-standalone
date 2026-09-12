import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compileMinimumFuelCost(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const seats = 2;
    const treeState: UniversalTreeNode = {
      id: 'city-0',
      r: 0,
      c: 0,
      val: '首都#0',
      status: 'normal',
      tag: '待统计',
      children: [
        {
          id: 'city-1',
          r: 1,
          c: 0,
          val: '市#1',
          status: 'normal',
          tag: '待统计',
          children: [
            { id: 'city-2', r: 2, c: 0, val: '市#2', status: 'normal', tag: '待统计', children: [] },
            { id: 'city-3', r: 2, c: 1, val: '市#3', status: 'normal', tag: '待统计', children: [] },
          ],
        },
        {
          id: 'city-4',
          r: 1,
          c: 1,
          val: '市#4',
          status: 'normal',
          tag: '待统计',
          children: [
            { id: 'city-6', r: 2, c: 2, val: '市#6', status: 'normal', tag: '待统计', children: [] },
          ],
        },
        {
          id: 'city-5',
          r: 1,
          c: 2,
          val: '市#5',
          status: 'normal',
          tag: '待统计',
          children: [],
        },
      ],
    };

    const people = [0, 0, 0, 0, 0, 0, 0];
    const cars = [0, 0, 0, 0, 0, 0, 0];
    let totalFuel = 0;

    function setCityStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getFuelStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-people',
          name: 'people[]',
          label: '各城子树总人数',
          indices: ['#0(首都)', '#1', '#2', '#3', '#4', '#5', '#6'],
          values: [...people],
          activeIdx: activeArrName === 'people' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-cars',
          name: 'cars[]',
          label: '驶向父城车数/油耗',
          indices: ['#0(首都)', '#1', '#2', '#3', '#4', '#5', '#6'],
          values: [...cars],
          activeIdx: activeArrName === 'cars' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-fuel',
          name: 'totalFuel',
          label: '累计总油耗',
          indices: ['全国耗油'],
          values: [totalFuel],
          activeIdx: activeArrName === 'fuel' ? activeSlotIdx : undefined,
          color: 'amber',
        },
      ];
    }

    function addFuelStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getFuelStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 3: public long minimumFuelCost(...)
    addFuelStep({
      type: 'entry',
      line: anchorMap?.entry || 3,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'minimumFuelCost 入口',
      log: '🚀 minimumFuelCost 入口：7座城市6条公路，每车座位 seats=2',
      msg: '启动 <code>minimumFuelCost</code>：每辆车最多载客 <code>2</code> 人，后序统计子树人数与拼车跨边油耗。',
      activeNodeId: 'city-0',
      treeRoot: cloneTree(treeState),
    });

    const cityOrder = [
      { u: 2, p: 1, c: 1 },
      { u: 3, p: 1, c: 1 },
      { u: 1, p: 0, c: 3 },
      { u: 6, p: 4, c: 1 },
      { u: 4, p: 0, c: 2 },
      { u: 5, p: 0, c: 1 },
    ];

    for (const item of cityOrder) {
      const u = item.u;
      const count = item.c;
      people[u] = count;
      const needCars = Math.ceil(count / seats);
      cars[u] = needCars;
      totalFuel += needCars;
      setCityStatus(`city-${u}`, 'visited', `${count}人|${needCars}车(${needCars}L)`);

      addFuelStep({
        type: 'update',
        line: 19,
        i: u,
        j: 0,
        dp1d: [totalFuel],
        memo: [totalFuel],
        activeSlot: u,
        tag: `市#${u}: ${count}人驶向#${item.p}需${needCars}车`,
        log: `| 📍 市#${u} 后序汇聚: 子树总人数 ${count} 人 -> 需 ⌈${count}/${seats}⌉ = ${needCars} 辆车驶向市#${item.p} (总油耗累积 +${needCars}L = ${totalFuel}L)`,
        msg: `城市 <strong>市#${u}</strong> 汇聚 <code>${count}</code> 人，拼车需 <code>⌈${count} / 2⌉ = ${needCars}</code> 辆车，消耗 <strong>${needCars}</strong> 升油驶向市 <strong>#${item.p}</strong>。`,
        activeNodeId: `city-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'people',
        activeArrSlot: u,
      });
    }

    people[0] = 7;
    setCityStatus('city-0', 'visited', '全国7人汇聚首都|总耗油7L');

    // Line 9: return totalFuel;
    addFuelStep({
      type: 'return',
      line: anchorMap?.return || 9,
      i: 0,
      j: 0,
      dp1d: [totalFuel],
      memo: [totalFuel],
      activeSlot: 0,
      tag: `最少总油耗: ${totalFuel} 升`,
      log: `| 🏆 return totalFuel = ${totalFuel}L;`,
      msg: `🏆 演化推导全部完成！所有代表到达首都的最少总油耗为 <strong>${totalFuel} 升</strong>。`,
      activeNodeId: 'city-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'fuel',
      activeArrSlot: 0,
    });

    return steps;
}
