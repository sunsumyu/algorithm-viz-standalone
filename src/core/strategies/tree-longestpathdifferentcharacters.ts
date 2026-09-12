import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compileLongestPathDifferentCharacters(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeState: UniversalTreeNode = {
      id: 'char-0',
      r: 0,
      c: 0,
      val: "点#0('a')",
      status: 'normal',
      tag: '待考察',
      children: [
        {
          id: 'char-1',
          r: 1,
          c: 0,
          val: "点#1('b')",
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'char-3', r: 2, c: 0, val: "点#3('c')", status: 'normal', tag: '待考察', children: [] },
            { id: 'char-4', r: 2, c: 1, val: "点#4('b')", status: 'normal', tag: '待考察', children: [] },
          ],
        },
        {
          id: 'char-2',
          r: 1,
          c: 1,
          val: "点#2('a')",
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'char-5', r: 2, c: 2, val: "点#5('e')", status: 'normal', tag: '待考察', children: [] },
          ],
        },
      ],
    };

    const chars = ['a', 'b', 'a', 'c', 'b', 'e'];
    const maxChain = [0, 0, 0, 0, 0, 0];
    let maxPath = 1;

    function setCharStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getCharStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-chars',
          name: 'chars[]',
          label: '节点字符标号',
          indices: ['#0', '#1', '#2', '#3', '#4', '#5'],
          values: [...chars],
          activeIdx: activeArrName === 'chars' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-chain',
          name: 'chain[]',
          label: '单侧最长链向父汇报',
          indices: ['#0', '#1', '#2', '#3', '#4', '#5'],
          values: [...maxChain],
          activeIdx: activeArrName === 'chain' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-ans',
          name: 'maxPath',
          label: '全局最长互异路径',
          indices: ['全局最优'],
          values: [maxPath],
          activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addCharStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getCharStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 3: public int longestPath(...)
    addCharStep({
      type: 'entry',
      line: anchorMap?.entry || 3,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: [1],
      activeSlot: 0,
      tag: 'longestPath 入口',
      log: "🚀 longestPath 入口：字符序列 [a, b, a, c, b, e]，后序贪心维护最长与次长互异子链",
      msg: '启动 <code>longestPath</code>：相邻节点字符不同才可拼接，每个节点向父汇报单侧最长链 <code>1 + max1</code>。',
      activeNodeId: 'char-0',
      treeRoot: cloneTree(treeState),
    });

    const dfsOrder = [
      { u: 3, chain: 1, tag: "叶节点('c') 单链:1" },
      { u: 4, chain: 1, tag: "叶节点('b') 单链:1" },
      { u: 1, chain: 2, tag: "点#1('b') 与#3('c')拼接, 单链:2" },
      { u: 5, chain: 1, tag: "叶节点('e') 单链:1" },
      { u: 2, chain: 2, tag: "点#2('a') 与#5('e')拼接, 单链:2" },
      { u: 0, chain: 3, tag: "点#0('a') 与#1('b')拼接, 最长拐点:3" },
    ];

    for (const item of dfsOrder) {
      const u = item.u;
      maxChain[u] = item.chain;
      if (item.chain > maxPath) maxPath = item.chain;
      setCharStatus(`char-${u}`, 'visited', item.tag);

      addCharStep({
        type: 'update',
        line: 20,
        i: u,
        j: 0,
        dp1d: [maxPath],
        memo: [maxPath],
        activeSlot: u,
        tag: item.tag,
        log: `| 📍 节点 #${u}('${chars[u]}'): 单侧最长链=${item.chain}, 当前全局最长互异路径 maxPath=${maxPath}`,
        msg: `节点 <strong>点#${u}('${chars[u]}')</strong>：向父节点汇报单链 <strong>${item.chain}</strong>，刷新全局最长互异路径 <strong>${maxPath}</strong>。`,
        activeNodeId: `char-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'chain',
        activeArrSlot: u,
      });
    }

    // Line 9: return maxPath;
    addCharStep({
      type: 'return',
      line: anchorMap?.return || 9,
      i: 0,
      j: 0,
      dp1d: [maxPath],
      memo: [maxPath],
      activeSlot: 0,
      tag: `最长互异路径: ${maxPath}`,
      log: `| 🏆 return maxPath = ${maxPath};`,
      msg: `🏆 演化推导全部完成！树中相邻字符互异的最长路径为 <strong>${maxPath}</strong>。`,
      activeNodeId: 'char-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    return steps;
}
