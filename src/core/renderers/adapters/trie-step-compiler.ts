/**
 * 01-Trie 二进制字典树统一状态推演编译器 (BinaryTrieStepCompiler)
 * 深度模块 (Deep Module): 封装 01-Trie 逐位构建、高位对偶分支贪心探测、连续静态数组映射与前缀异或转化
 * 遵循 Matt Pocock 深模块架构规范，为所有 01-Trie 算法提供单一推演事实源
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  TrieVisualNode,
  StaticTableRowDef,
  PrefixXorItemDef,
} from './trie-canvas-adapter';

export interface BinaryTrieStep extends StepBase {
  nums: number[];
  curNum: number;
  curBit: number;
  expectedBit: number;
  actualBit: number;
  path: number[];
  curXor: number;
  globalMaxXor: number;
  trieSize: number;
  decision: string;
  message: string;
  log: string;
  stepIndex?: number;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };

  // 表现层与 SVG 沙盘强类型状态
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';
  activeNodeId?: number;
  activePathNodeIds?: number[];
  nodesList?: TrieVisualNode[];
  bestPair?: [number, number];
  staticTable?: { rows: StaticTableRowDef[]; activeRow: number };
  prefixXorList?: PrefixXorItemDef[];
}

export const BINARY_TRIE_DEFAULT_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 34, cpp: 30, python: 2, javascript: 1, typescript: 1 },
  insert: { java: 7, cpp: 7, python: 4, javascript: 3, typescript: 3 },
  insertBit: { java: 10, cpp: 10, python: 7, javascript: 6, typescript: 6 },
  insertNew: { java: 12, cpp: 11, python: 9, javascript: 7, typescript: 7 },
  queryBit: { java: 23, cpp: 20, python: 17, javascript: 15, typescript: 15 },
  queryBranch: { java: 25, cpp: 22, python: 19, javascript: 17, typescript: 17 },
  queryFallback: { java: 28, cpp: 25, python: 22, javascript: 20, typescript: 20 },
  maxUpdate: { java: 38, cpp: 33, python: 28, javascript: 28, typescript: 28 },
  done: { java: 40, cpp: 34, python: 29, javascript: 30, typescript: 30 },
};

export const BINARY_TRIE_STAGE2_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 4, cpp: 4, python: 3, javascript: 2, typescript: 2 },
  insert: { java: 6, cpp: 6, python: 5, javascript: 4, typescript: 4 },
  insertNew: { java: 12, cpp: 10, python: 11, javascript: 8, typescript: 8 },
  insertBit: { java: 14, cpp: 11, python: 12, javascript: 9, typescript: 9 },
  queryBranch: { java: 23, cpp: 20, python: 19, javascript: 18, typescript: 18 },
  queryFallback: { java: 26, cpp: 23, python: 22, javascript: 21, typescript: 21 },
  maxUpdate: { java: 36, cpp: 32, python: 25, javascript: 28, typescript: 28 },
  done: { java: 37, cpp: 33, python: 25, javascript: 29, typescript: 29 },
};

export const BINARY_TRIE_STAGE3_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 6, cpp: 6, python: 5, javascript: 4, typescript: 4 },
  queryBranch: { java: 9, cpp: 9, python: 8, javascript: 7, typescript: 7 },
  maxUpdate: { java: 10, cpp: 10, python: 9, javascript: 8, typescript: 8 },
  done: { java: 13, cpp: 13, python: 11, javascript: 11, typescript: 11 },
};

export class BinaryTrieStepCompiler {
  /**
   * Stage 1: 经典两数最大异或推演 (LeetCode 421)
   */
  public static compileTwoNumbersMaxXorSteps(
    nums: number[],
    maxBit: number = 5,
    codeLines: Record<string, HighlightTarget> = BINARY_TRIE_DEFAULT_CODE_LINES
  ): BinaryTrieStep[] {
    const steps: BinaryTrieStep[] = [];
    let globalMaxXor = 0;
    let bestPair: [number, number] = [nums[0], nums[0]];

    const nodes: TrieVisualNode[] = [
      { id: 1, depth: 0, label: 'ROOT', bit: null, parentId: null, children: [0, 0] },
    ];
    let nodeCount = 1;

    // 1. 初始化帧
    steps.push({
      nums,
      curNum: nums[0],
      curBit: maxBit,
      expectedBit: 0,
      actualBit: 0,
      path: [],
      curXor: 0,
      globalMaxXor: 0,
      trieSize: 1,
      decision: '初始化 01-Trie 字典树根节点',
      message: `初始化 01-Trie，最高考虑位为 bit ${maxBit} (值域 <= ${Math.pow(2, maxBit + 1) - 1})。`,
      log: `Init 01-Trie with maxBit = ${maxBit}`,
      stepIndex: 0,
      codeLine: codeLines.init,
      stageId: 'stage-1',
      activeNodeId: 1,
      activePathNodeIds: [1],
      nodesList: JSON.parse(JSON.stringify(nodes)),
      statusBadge: { text: '初始化', type: 'info' },
    });

    // 2. 逐位插入每个数
    for (const num of nums) {
      let curId = 1;
      const path: number[] = [];
      const activePath = [1];

      for (let i = maxBit; i >= 0; i--) {
        const bit = (num >> i) & 1;
        path.push(bit);
        const curNode = nodes.find((n) => n.id === curId)!;

        if (curNode.children[bit] === 0) {
          nodeCount++;
          const newNodeId = nodeCount;
          curNode.children[bit] = newNodeId;
          nodes.push({
            id: newNodeId,
            depth: maxBit - i + 1,
            label: String(bit),
            bit,
            parentId: curId,
            children: [0, 0],
          });
          curId = newNodeId;
          activePath.push(curId);

          steps.push({
            nums,
            curNum: num,
            curBit: i,
            expectedBit: bit,
            actualBit: bit,
            path: [...path],
            curXor: globalMaxXor,
            globalMaxXor,
            trieSize: nodeCount,
            decision: `插入数字 ${num}: 分支 ${bit} 不存在，新建节点 #${curId}`,
            message: `将数字 ${num} 的第 ${i} 位 (${bit}) 插入 01-Trie，开辟新节点 #${curId}。`,
            log: `Insert num ${num}, bit ${i} = ${bit} -> new node ${curId}`,
            stepIndex: steps.length,
            codeLine: codeLines.insertNew,
            stageId: 'stage-1',
            activeNodeId: curId,
            activePathNodeIds: [...activePath],
            nodesList: JSON.parse(JSON.stringify(nodes)),
            statusBadge: { text: `建节点 ${bit}`, type: 'warning' },
          });
        } else {
          curId = curNode.children[bit];
          activePath.push(curId);

          steps.push({
            nums,
            curNum: num,
            curBit: i,
            expectedBit: bit,
            actualBit: bit,
            path: [...path],
            curXor: globalMaxXor,
            globalMaxXor,
            trieSize: nodeCount,
            decision: `插入数字 ${num}: 复用已有分支 ${bit} 走向节点 #${curId}`,
            message: `数字 ${num} 的第 ${i} 位 (${bit}) 已存在，复用节点 #${curId} 下潜。`,
            log: `Insert num ${num}, bit ${i} = ${bit} -> traverse to node ${curId}`,
            stepIndex: steps.length,
            codeLine: codeLines.insertBit,
            stageId: 'stage-1',
            activeNodeId: curId,
            activePathNodeIds: [...activePath],
            nodesList: JSON.parse(JSON.stringify(nodes)),
            statusBadge: { text: `复用 ${bit}`, type: 'info' },
          });
        }
      }

      // 叶子节点标记
      const leaf = nodes.find((n) => n.id === curId)!;
      leaf.storedVal = num;

      // 3. 贪心查询当前数与树中已有数能达到的最大异或和
      let queryNodeId = 1;
      let curXor = 0;
      const queryActivePath = [1];

      for (let i = maxBit; i >= 0; i--) {
        const bit = (num >> i) & 1;
        const want = 1 ^ bit; // 贪心期望分支
        const qNode = nodes.find((n) => n.id === queryNodeId)!;

        let chosenBit = want;
        let isDual = true;

        if (qNode.children[want] !== 0) {
          chosenBit = want;
          queryNodeId = qNode.children[want];
          curXor |= 1 << i;
        } else {
          chosenBit = bit;
          queryNodeId = qNode.children[bit];
          isDual = false;
        }

        queryActivePath.push(queryNodeId);
        const targetNode = nodes.find((n) => n.id === queryNodeId)!;
        targetNode.isDualMatch = isDual;
        targetNode.isFallback = !isDual;

        steps.push({
          nums,
          curNum: num,
          curBit: i,
          expectedBit: want,
          actualBit: chosenBit,
          path: [...queryActivePath],
          curXor,
          globalMaxXor,
          trieSize: nodeCount,
          decision: isDual
            ? `贪心命中对偶分支: bit ${i} 成功选择 ${want}，该位贡献异或值 1`
            : `对偶分支 ${want} 缺失，保底走向分支 ${chosenBit}，该位贡献 0`,
          message: isDual
            ? `探测数字 ${num} 在 bit ${i} 处期望走 ${want}，分支存在！当前累加异或值升至 ${curXor}。`
            : `探测数字 ${num} 在 bit ${i} 处期望走 ${want} 但不存在，被迫走保底分支 ${chosenBit}。`,
          log: `Query num ${num} at bit ${i}: want ${want}, took ${chosenBit}, curXor = ${curXor}`,
          stepIndex: steps.length,
          codeLine: isDual ? codeLines.queryBranch : codeLines.queryFallback,
          stageId: 'stage-1',
          activeNodeId: queryNodeId,
          activePathNodeIds: [...queryActivePath],
          nodesList: JSON.parse(JSON.stringify(nodes)),
          bestPair,
          statusBadge: {
            text: isDual ? `命中对偶 ${want}` : `保底分支 ${chosenBit}`,
            type: isDual ? 'success' : 'warning',
          },
        });
      }

      // 更新全局最优异或解
      if (curXor > globalMaxXor) {
        globalMaxXor = curXor;
        const matchedLeaf = nodes.find((n) => n.id === queryNodeId);
        bestPair = [matchedLeaf?.storedVal ?? num, num];

        steps.push({
          nums,
          curNum: num,
          curBit: 0,
          expectedBit: 0,
          actualBit: 0,
          path: [...queryActivePath],
          curXor,
          globalMaxXor,
          trieSize: nodeCount,
          decision: `🎉 刷新全局最大异或值: ${globalMaxXor} (由数字对 [${bestPair[0]}, ${bestPair[1]}] 产生)`,
          message: `当前数字 ${num} 成功找到互斥极值！${bestPair[0]} ^ ${bestPair[1]} = ${globalMaxXor}。`,
          log: `New Global Max XOR: ${globalMaxXor} by pair (${bestPair[0]}, ${bestPair[1]})`,
          stepIndex: steps.length,
          codeLine: codeLines.maxUpdate,
          stageId: 'stage-1',
          activeNodeId: queryNodeId,
          activePathNodeIds: [...queryActivePath],
          nodesList: JSON.parse(JSON.stringify(nodes)),
          bestPair,
          statusBadge: { text: `刷新极值 ${globalMaxXor}`, type: 'danger' },
        });
      }
    }

    // 4. 终态完成帧
    steps.push({
      nums,
      curNum: nums[nums.length - 1],
      curBit: 0,
      expectedBit: 0,
      actualBit: 0,
      path: [],
      curXor: globalMaxXor,
      globalMaxXor,
      trieSize: nodeCount,
      decision: `推演结束: 两数最大异或和为 ${globalMaxXor}`,
      message: `01-Trie 全部数字插入与贪心对偶检索完成。全局两数最大异或值为 ${globalMaxXor}。`,
      log: `Trie XOR Max done, final maxXor = ${globalMaxXor}`,
      stepIndex: steps.length,
      codeLine: codeLines.done,
      stageId: 'stage-1',
      activeNodeId: 1,
      activePathNodeIds: [1],
      nodesList: JSON.parse(JSON.stringify(nodes)),
      bestPair,
      statusBadge: { text: '推演完成', type: 'success' },
    });

    return steps;
  }

  /**
   * Stage 2: 竞赛连续静态数组 tree[N][2] 扁平化内存映射推演
   */
  public static compileStaticArraySteps(
    nums: number[],
    maxBit: number = 5,
    codeLines: Record<string, HighlightTarget> = BINARY_TRIE_STAGE2_CODE_LINES
  ): BinaryTrieStep[] {
    const steps: BinaryTrieStep[] = [];
    const MAX_NODES = (nums.length + 1) * (maxBit + 2);
    const treeTable: Array<[number, number]> = Array.from({ length: MAX_NODES }, () => [0, 0]);
    let cnt = 1;
    let globalMax = 0;
    let bestPair: [number, number] = [nums[0], nums[0]];

    const nodes: TrieVisualNode[] = [
      { id: 1, depth: 0, label: 'ROOT', bit: null, parentId: null, children: [0, 0] },
    ];

    const getTableRows = (activeRow: number): StaticTableRowDef[] => {
      const rows: StaticTableRowDef[] = [];
      for (let i = 1; i <= Math.min(cnt, 15); i++) {
        rows.push({
          index: i,
          left: treeTable[i][0],
          right: treeTable[i][1],
          isCurrent: i === activeRow,
        });
      }
      return rows;
    };

    steps.push({
      nums,
      curNum: nums[0],
      curBit: maxBit,
      expectedBit: 0,
      actualBit: 0,
      path: [1],
      curXor: 0,
      globalMaxXor: 0,
      trieSize: 1,
      decision: '静态数组 tree[MAX_N][2] 内存初始化，根节点 cnt = 1',
      message: `开辟静态数组 tree[${MAX_NODES}][2]，消除动态对象与指针开销，提升 CPU 缓存命中率。`,
      log: 'Init static tree table cnt=1',
      stepIndex: 0,
      codeLine: codeLines.init,
      stageId: 'stage-2',
      activeNodeId: 1,
      activePathNodeIds: [1],
      nodesList: JSON.parse(JSON.stringify(nodes)),
      staticTable: { rows: getTableRows(1), activeRow: 1 },
      statusBadge: { text: '静态初始化', type: 'info' },
    });

    for (const num of nums) {
      let cur = 1;
      const pathNodes = [1];

      for (let i = maxBit; i >= 0; i--) {
        const bit = (num >> i) & 1;
        if (treeTable[cur][bit] === 0) {
          cnt++;
          treeTable[cur][bit] = cnt;
          const parentId = cur;
          cur = cnt;
          pathNodes.push(cur);

          nodes.push({
            id: cur,
            depth: maxBit - i + 1,
            label: String(bit),
            bit,
            parentId,
            children: [0, 0],
          });

          steps.push({
            nums,
            curNum: num,
            curBit: i,
            expectedBit: bit,
            actualBit: bit,
            path: [...pathNodes],
            curXor: globalMax,
            globalMaxXor: globalMax,
            trieSize: cnt,
            decision: `tree[${parentId}][${bit}] 为空 ➔ 分配静态下标 ++cnt = ${cnt}`,
            message: `静态数组连续分配：tree[${parentId}][${bit}] = ${cnt}，无堆内存分配垃圾。`,
            log: `Static assign tree[${parentId}][${bit}] = ${cnt}`,
            stepIndex: steps.length,
            codeLine: codeLines.insertNew,
            stageId: 'stage-2',
            activeNodeId: cur,
            activePathNodeIds: [...pathNodes],
            nodesList: JSON.parse(JSON.stringify(nodes)),
            staticTable: { rows: getTableRows(cur), activeRow: cur },
            statusBadge: { text: `分配下标 ${cnt}`, type: 'warning' },
          });
        } else {
          cur = treeTable[cur][bit];
          pathNodes.push(cur);

          steps.push({
            nums,
            curNum: num,
            curBit: i,
            expectedBit: bit,
            actualBit: bit,
            path: [...pathNodes],
            curXor: globalMax,
            globalMaxXor: globalMax,
            trieSize: cnt,
            decision: `tree[${pathNodes[pathNodes.length - 2]}][${bit}] 已存在 ➔ 直接寻址下潜至下标 ${cur}`,
            message: `连续静态内存寻址：指针直接按下标跳转到 tree[${cur}]。`,
            log: `Static jump to idx ${cur}`,
            stepIndex: steps.length,
            codeLine: codeLines.insertBit,
            stageId: 'stage-2',
            activeNodeId: cur,
            activePathNodeIds: [...pathNodes],
            nodesList: JSON.parse(JSON.stringify(nodes)),
            staticTable: { rows: getTableRows(cur), activeRow: cur },
            statusBadge: { text: `寻址 idx ${cur}`, type: 'info' },
          });
        }
      }

      // 静态查询
      let qCur = 1;
      let curXor = 0;
      const qPath = [1];

      for (let i = maxBit; i >= 0; i--) {
        const bit = (num >> i) & 1;
        const want = 1 ^ bit;
        let isDual = true;

        if (treeTable[qCur][want] !== 0) {
          qCur = treeTable[qCur][want];
          curXor |= 1 << i;
        } else {
          qCur = treeTable[qCur][bit];
          isDual = false;
        }
        qPath.push(qCur);
      }

      if (curXor > globalMax) {
        globalMax = curXor;
        bestPair = [num, curXor ^ num];

        steps.push({
          nums,
          curNum: num,
          curBit: 0,
          expectedBit: 0,
          actualBit: 0,
          path: [...qPath],
          curXor,
          globalMaxXor: globalMax,
          trieSize: cnt,
          decision: `静态数组贪心命中新极大值: ${globalMax}`,
          message: `静态数组加速寻址达成全局最大异或 ${globalMax}。`,
          log: `Static tree maxXor update = ${globalMax}`,
          stepIndex: steps.length,
          codeLine: codeLines.maxUpdate,
          stageId: 'stage-2',
          activeNodeId: qCur,
          activePathNodeIds: [...qPath],
          nodesList: JSON.parse(JSON.stringify(nodes)),
          staticTable: { rows: getTableRows(qCur), activeRow: qCur },
          bestPair,
          statusBadge: { text: `极值 ${globalMax}`, type: 'danger' },
        });
      }
    }

    return steps;
  }

  /**
   * Stage 3: 子数组最大异或和与前缀异或转化推演 (洛谷 P4551)
   */
  public static compileSubarrayMaxXorSteps(
    nums: number[],
    maxBit: number = 5,
    codeLines: Record<string, HighlightTarget> = BINARY_TRIE_STAGE3_CODE_LINES
  ): BinaryTrieStep[] {
    const steps: BinaryTrieStep[] = [];
    const prefixXorList: PrefixXorItemDef[] = [{ idx: 0, num: 0, eor: 0, isCurrent: true }];
    let currentEor = 0;
    let globalMaxXor = 0;
    let bestPair: [number, number] = [0, 0];

    const nodes: TrieVisualNode[] = [
      { id: 1, depth: 0, label: 'ROOT', bit: null, parentId: null, children: [0, 0] },
    ];
    let nodeCount = 1;

    function insertToTrie(val: number) {
      let curId = 1;
      for (let i = maxBit; i >= 0; i--) {
        const bit = (val >> i) & 1;
        const curNode = nodes.find((n) => n.id === curId)!;
        if (curNode.children[bit] === 0) {
          nodeCount++;
          curNode.children[bit] = nodeCount;
          nodes.push({
            id: nodeCount,
            depth: maxBit - i + 1,
            label: String(bit),
            bit,
            parentId: curId,
            children: [0, 0],
          });
          curId = nodeCount;
        } else {
          curId = curNode.children[bit];
        }
      }
    }

    function queryMaxXor(val: number): { maxXor: number; path: number[] } {
      let curId = 1;
      let ans = 0;
      const path = [1];
      for (let i = maxBit; i >= 0; i--) {
        const bit = (val >> i) & 1;
        const want = 1 ^ bit;
        const curNode = nodes.find((n) => n.id === curId)!;
        if (curNode.children[want] !== 0) {
          ans |= 1 << i;
          curId = curNode.children[want];
        } else {
          curId = curNode.children[bit];
        }
        path.push(curId);
      }
      return { maxXor: ans, path };
    }

    // 先插入前缀 0 (代表空前缀 eor[0] = 0)
    insertToTrie(0);

    steps.push({
      nums,
      curNum: 0,
      curBit: maxBit,
      expectedBit: 0,
      actualBit: 0,
      path: [1],
      curXor: 0,
      globalMaxXor: 0,
      trieSize: nodeCount,
      decision: '前缀异或基底初始化: eor[0] = 0 插入 01-Trie',
      message: '利用前缀异或自反性：eor[j..i] = eor[i] ^ eor[j-1]。初始将 eor[0]=0 注入树中。',
      log: 'Init prefix XOR eor[0]=0',
      stepIndex: 0,
      codeLine: codeLines.init,
      stageId: 'stage-3',
      activeNodeId: 1,
      activePathNodeIds: [1],
      nodesList: JSON.parse(JSON.stringify(nodes)),
      prefixXorList: JSON.parse(JSON.stringify(prefixXorList)),
      statusBadge: { text: '前缀基底', type: 'info' },
    });

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      currentEor ^= num;
      prefixXorList.push({ idx: i + 1, num, eor: currentEor, isCurrent: true });

      // 查询
      const { maxXor, path } = queryMaxXor(currentEor);

      steps.push({
        nums,
        curNum: num,
        curBit: maxBit,
        expectedBit: 0,
        actualBit: 0,
        path,
        curXor: maxXor,
        globalMaxXor,
        trieSize: nodeCount,
        decision: `处理数字 nums[${i}]=${num}: 累加前缀 eor[0..${i + 1}] = ${currentEor}，在树中贪心查询匹配`,
        message: `在 01-Trie 中检索与前缀异或 ${currentEor} 产生最大异或的早期前缀，得出当前子数组最大可能异或 = ${maxXor}。`,
        log: `Prefix XOR i=${i}, num=${num}, eor=${currentEor}, queried maxXor=${maxXor}`,
        stepIndex: steps.length,
        codeLine: codeLines.queryBranch,
        stageId: 'stage-3',
        activeNodeId: path[path.length - 1],
        activePathNodeIds: [...path],
        nodesList: JSON.parse(JSON.stringify(nodes)),
        prefixXorList: JSON.parse(JSON.stringify(prefixXorList)),
        bestPair,
        statusBadge: { text: `探测前缀 ${currentEor}`, type: 'warning' },
      });

      if (maxXor > globalMaxXor) {
        globalMaxXor = maxXor;
        bestPair = [currentEor ^ maxXor, currentEor];

        steps.push({
          nums,
          curNum: num,
          curBit: 0,
          expectedBit: 0,
          actualBit: 0,
          path,
          curXor: maxXor,
          globalMaxXor,
          trieSize: nodeCount,
          decision: `🎉 刷新全局子数组最大异或和: ${globalMaxXor}`,
          message: `子数组异或和刷新为 ${globalMaxXor} (区间异或 eor[j..${i + 1}])。`,
          log: `New Subarray Max XOR = ${globalMaxXor}`,
          stepIndex: steps.length,
          codeLine: codeLines.maxUpdate,
          stageId: 'stage-3',
          activeNodeId: path[path.length - 1],
          activePathNodeIds: [...path],
          nodesList: JSON.parse(JSON.stringify(nodes)),
          prefixXorList: JSON.parse(JSON.stringify(prefixXorList)),
          bestPair,
          statusBadge: { text: `子数组极值 ${globalMaxXor}`, type: 'danger' },
        });
      }

      // 将当前前缀插入树中
      insertToTrie(currentEor);
    }

    return steps;
  }
}
