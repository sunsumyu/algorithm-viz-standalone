/**
 * Class 107: 01-Trie 与异或最大值 (01-Trie Max XOR)
 * 经典高频权威：LeetCode 421 / 洛谷 P4551 / LeetCode 1707
 *
 * 核心三阶段演化架构:
 *  - Stage 1: 经典动态 01-Trie 逐位构建与两数贪心最大异或 (LeetCode 421)
 *  - Stage 2: 算法竞赛连续静态数组 (tree[N][2]) 与内存紧凑扁平化
 *  - Stage 3: 子数组最大异或和与前缀异或转化 (洛谷 P4551)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { TRIE_XOR_107_PROBLEM_HTML } from './trie-xor-max-107-problem-content';
import {
  TRIE_XOR_STAGE1_CODES,
  TRIE_XOR_STAGE2_CODES,
  TRIE_XOR_STAGE3_CODES,
} from './trie-xor-max-107-stage-codes';

// ==========================================
// 数据结构定义与接口
// ==========================================

export interface VisualTrieNode {
  id: number;
  depth: number;
  bit: number | null; // 0 or 1, null for root
  parentId: number | null;
  children: [number, number]; // [left(0), right(1)]
  x: number;
  y: number;
  storedVal?: number; // 终端叶节点保存的数字
  isHighlighted?: boolean;
  isActive?: boolean;
}

export interface StaticTableRow {
  index: number;
  left: number;
  right: number;
  isCurrent?: boolean;
}

export interface Trie107Step extends StepBase {
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
  nodesList?: VisualTrieNode[];
  bestPair?: [number, number];
  staticTable?: { rows: StaticTableRow[]; activeRow: number };
  prefixXorList?: Array<{ idx: number; num: number; eor: number; isCurrent?: boolean }>;
}

// 兼容既有测试与门禁导出的代码对象
export const TRIE_XOR_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE1_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE1_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE1_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE1_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE1_CODES.javascript.join('\n'),
};

export const TRIE_STAGE2_STATIC_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE2_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE2_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE2_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE2_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE2_CODES.javascript.join('\n'),
};

export const TRIE_STAGE3_SUBARRAY_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE3_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE3_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE3_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE3_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE3_CODES.javascript.join('\n'),
};

export const TRIE_XOR_CODE_LINES: Record<string, HighlightTarget> = {
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

// ==========================================
// 树坐标布局辅助函数
// ==========================================

function computeNodeCoordinates(nodes: VisualTrieNode[], width: number = 720, height: number = 400) {
  if (nodes.length === 0) return;

  // 按 depth 分层
  const levels: Map<number, VisualTrieNode[]> = new Map();
  let maxDepth = 0;
  for (const n of nodes) {
    if (!levels.has(n.depth)) levels.set(n.depth, []);
    levels.get(n.depth)!.push(n);
    if (n.depth > maxDepth) maxDepth = n.depth;
  }

  const verticalStep = Math.min(65, (height - 80) / Math.max(1, maxDepth));
  const rootY = 40;

  // 递归计算左右子树横坐标范围
  function assignX(nodeId: number, left: number, right: number) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.x = Math.round((left + right) / 2);
    node.y = Math.round(rootY + node.depth * verticalStep);

    const [lId, rId] = node.children;
    if (lId !== 0 && rId !== 0) {
      const mid = (left + right) / 2;
      assignX(lId, left, mid);
      assignX(rId, mid, right);
    } else if (lId !== 0) {
      assignX(lId, left, right);
    } else if (rId !== 0) {
      assignX(rId, left, right);
    }
  }

  assignX(1, 30, width - 30);
}

function cloneNodes(nodes: VisualTrieNode[]): VisualTrieNode[] {
  return nodes.map(n => ({
    ...n,
    children: [n.children[0], n.children[1]],
  }));
}

// ==========================================
// Stage 1: 经典动态 01-Trie 构建与两数最大异或
// ==========================================

export function buildTrieXorMaxSteps(nums: number[], maxBit: number = 5): Trie107Step[] {
  const steps: Trie107Step[] = [];
  const nodes: VisualTrieNode[] = [
    {
      id: 1,
      depth: 0,
      bit: null,
      parentId: null,
      children: [0, 0],
      x: 360,
      y: 40,
    },
  ];
  let nodeCount = 1;
  let stepIdx = 0;

  // 1. 入口步
  computeNodeCoordinates(nodes);
  steps.push({
    stepIndex: stepIdx++,
    stageId: 'stage-1',
    nums,
    curNum: 0,
    curBit: -1,
    expectedBit: -1,
    actualBit: -1,
    path: [],
    curXor: 0,
    globalMaxXor: 0,
    trieSize: 1,
    activeNodeId: 1,
    activePathNodeIds: [1],
    nodesList: cloneNodes(nodes),
    decision: `算法入口：输入数组 [${nums.join(', ')}]，准备建立 01-Trie 字典树并贪心求解两数最大异或和`,
    message: '核心原理：高位具有最高权重 (2^i)，贪心优先保证最高位异或结果为 1',
    log: `init nums=[${nums.join(',')}]`,
    codeLine: TRIE_XOR_CODE_LINES.init,
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
      const curNode = nodes.find(n => n.id === curId)!;

      if (curNode.children[bit] === 0) {
        nodeCount++;
        const newNodeId = nodeCount;
        curNode.children[bit] = newNodeId;
        nodes.push({
          id: newNodeId,
          depth: maxBit - i + 1,
          bit,
          parentId: curId,
          children: [0, 0],
          x: 0,
          y: 0,
        });
      }
      curId = curNode.children[bit];
      activePath.push(curId);
    }

    // 标记叶节点保存的值
    const leafNode = nodes.find(n => n.id === curId);
    if (leafNode) leafNode.storedVal = num;

    computeNodeCoordinates(nodes);

    steps.push({
      stepIndex: stepIdx++,
      stageId: 'stage-1',
      nums,
      curNum: num,
      curBit: -1,
      expectedBit: -1,
      actualBit: -1,
      path: [...path],
      curXor: 0,
      globalMaxXor: 0,
      trieSize: nodeCount,
      activeNodeId: curId,
      activePathNodeIds: [...activePath],
      nodesList: cloneNodes(nodes),
      decision: `将数字 ${num} (二进制 0b${num.toString(2).padStart(maxBit + 1, '0')}) 插入 01-Trie`,
      message: `树当前共有 ${nodeCount} 个节点，构建路径深度 ${maxBit + 1}`,
      log: `insert(${num}) done`,
      codeLine: TRIE_XOR_CODE_LINES.insert,
      statusBadge: { text: `插入 ${num}`, type: 'warning' },
    });
  }

  // 3. 对每个数贪心探查最大异或值
  let globalMax = 0;
  let bestPair: [number, number] = [nums[0], nums[0]];

  for (const num of nums) {
    let curId = 1;
    let ans = 0;
    const queryPath: number[] = [];
    const activePath = [1];

    for (let i = maxBit; i >= 0; i--) {
      const status = (num >> i) & 1;
      const want = status ^ 1;
      let actual = status;
      const curNode = nodes.find(n => n.id === curId)!;

      if (curNode.children[want] !== 0) {
        ans |= (1 << i);
        actual = want;
        curId = curNode.children[want];
      } else {
        curId = curNode.children[status];
      }
      queryPath.push(actual);
      activePath.push(curId);

      steps.push({
        stepIndex: stepIdx++,
        stageId: 'stage-1',
        nums,
        curNum: num,
        curBit: i,
        expectedBit: want,
        actualBit: actual,
        path: [...queryPath],
        curXor: ans,
        globalMaxXor: Math.max(globalMax, ans),
        trieSize: nodeCount,
        activeNodeId: curId,
        activePathNodeIds: [...activePath],
        nodesList: cloneNodes(nodes),
        decision: `探查 ${num} 第 ${i} 位 (值 ${status})：期望寻找对偶位 ${want}，实际走向分支 [${actual}]`,
        message: actual === want
          ? `🎉 成功匹配对偶位，当前位异或贡献 2^${i} = ${1 << i}！`
          : `⚠️ 对偶位不存在，只能走向同值分支，当前位贡献 0`,
        log: `query(${num}, bit=${i}) -> curXor=${ans}`,
        codeLine: actual === want ? TRIE_XOR_CODE_LINES.queryBranch : TRIE_XOR_CODE_LINES.queryFallback,
        statusBadge: actual === want
          ? { text: `对偶匹配 +${1 << i}`, type: 'success' }
          : { text: '无对偶分支', type: 'danger' },
      });
    }

    const partner = num ^ ans;
    if (ans > globalMax) {
      globalMax = ans;
      bestPair = [num, partner];
    }

    steps.push({
      stepIndex: stepIdx++,
      stageId: 'stage-1',
      nums,
      curNum: num,
      curBit: 0,
      expectedBit: -1,
      actualBit: -1,
      path: [...queryPath],
      curXor: ans,
      globalMaxXor: globalMax,
      trieSize: nodeCount,
      activeNodeId: curId,
      activePathNodeIds: [...activePath],
      nodesList: cloneNodes(nodes),
      bestPair,
      decision: `数字 ${num} 探查完毕，其最佳对偶伙伴为 ${partner}，产生异或值为 ${ans}`,
      message: `当前全局最大异或值更新为: ${globalMax}`,
      log: `maxSoFar = ${globalMax}`,
      codeLine: TRIE_XOR_CODE_LINES.maxUpdate,
      statusBadge: { text: `最大异或: ${globalMax}`, type: 'success' },
    });
  }

  // 4. 收尾步
  steps.push({
    stepIndex: stepIdx++,
    stageId: 'stage-1',
    nums,
    curNum: bestPair[0],
    curBit: -1,
    expectedBit: -1,
    actualBit: -1,
    path: [],
    curXor: globalMax,
    globalMaxXor: globalMax,
    trieSize: nodeCount,
    activeNodeId: 1,
    activePathNodeIds: [1],
    nodesList: cloneNodes(nodes),
    bestPair,
    decision: `算法完成！两数最大异或值为 ${globalMax}，由 ${bestPair[0]} XOR ${bestPair[1]} 产生`,
    message: `全部数字查询完毕，总节点数 ${nodeCount}，复杂度 O(31N) 验证通过`,
    log: `finalMax = ${globalMax}`,
    codeLine: TRIE_XOR_CODE_LINES.done,
    statusBadge: { text: `终态 Max=${globalMax}`, type: 'success' },
  });

  return steps;
}

// ==========================================
// Stage 2: 竞赛连续静态数组版 (tree[N][2])
// ==========================================

export function buildStage2StaticSteps(nums: number[], maxBit: number = 5): Trie107Step[] {
  const steps: Trie107Step[] = [];
  const maxNodes = 64;
  const tree: [number, number][] = Array.from({ length: maxNodes }, () => [0, 0]);
  let cnt = 1;
  let stepIdx = 0;

  const makeTable = (activeRow: number) => {
    const rows: StaticTableRow[] = [];
    const limit = Math.min(cnt + 2, maxNodes);
    for (let i = 1; i <= limit; i++) {
      rows.push({
        index: i,
        left: tree[i][0],
        right: tree[i][1],
        isCurrent: i === activeRow,
      });
    }
    return { rows, activeRow };
  };

  // 入口
  steps.push({
    stepIndex: stepIdx++,
    stageId: 'stage-2',
    nums,
    curNum: 0,
    curBit: -1,
    expectedBit: -1,
    actualBit: -1,
    path: [],
    curXor: 0,
    globalMaxXor: 0,
    trieSize: 1,
    staticTable: makeTable(1),
    decision: `【Stage 2 竞赛静态数组】初始化：静态连续数组 tree[MAXN][2] 就绪，cnt=1 充当根节点指针`,
    message: `无任何对象分配与 GC 损耗，扁平数组直接按索引寻址`,
    log: 'static init cnt=1',
    codeLine: { java: 33, cpp: 31, python: 3, javascript: 3, typescript: 3 },
    statusBadge: { text: '静态初始化', type: 'info' },
  });

  // 插入
  for (const num of nums) {
    let cur = 1;
    for (let i = maxBit; i >= 0; i--) {
      const b = (num >> i) & 1;
      if (tree[cur][b] === 0) {
        cnt++;
        tree[cur][b] = cnt;
      }
      cur = tree[cur][b];
    }

    steps.push({
      stepIndex: stepIdx++,
      stageId: 'stage-2',
      nums,
      curNum: num,
      curBit: -1,
      expectedBit: -1,
      actualBit: -1,
      path: [],
      curXor: 0,
      globalMaxXor: 0,
      trieSize: cnt,
      staticTable: makeTable(cur),
      decision: `静态数组插入数字 ${num}：更新 tree[cur][b]，静态指针累计分配至 cnt = ${cnt}`,
      message: `二维连续数组映射保持空间连续性，CPU 缓存命中率极高`,
      log: `static insert(${num}) cnt=${cnt}`,
      codeLine: { java: 11, cpp: 11, python: 11, javascript: 8, typescript: 8 },
      statusBadge: { text: `静态插入 ${num}`, type: 'warning' },
    });
  }

  // 贪心查询
  let maxVal = 0;
  for (const num of nums) {
    let cur = 1;
    let ans = 0;
    for (let i = maxBit; i >= 0; i--) {
      const b = (num >> i) & 1;
      const want = b ^ 1;
      if (tree[cur][want] !== 0) {
        ans |= (1 << i);
        cur = tree[cur][want];
      } else {
        cur = tree[cur][b];
      }
    }
    maxVal = Math.max(maxVal, ans);

    steps.push({
      stepIndex: stepIdx++,
      stageId: 'stage-2',
      nums,
      curNum: num,
      curBit: 0,
      expectedBit: -1,
      actualBit: -1,
      path: [],
      curXor: ans,
      globalMaxXor: maxVal,
      trieSize: cnt,
      staticTable: makeTable(cur),
      decision: `静态查询 ${num}：在 tree 数组中顺沿索引寻址，求得局部最大异或值 ${ans}`,
      message: `当前全局最大异或 Max = ${maxVal}`,
      log: `static query(${num}) ans=${ans}`,
      codeLine: { java: 36, cpp: 33, python: 25, javascript: 28, typescript: 28 },
      statusBadge: { text: `静态探查: ${ans}`, type: 'success' },
    });
  }

  return steps;
}

// ==========================================
// Stage 3: 子数组最大异或和 (洛谷 P4551 / 前缀异或转化)
// ==========================================

export function buildStage3SubarrayXorSteps(nums: number[] = [3, 1, 4, 2, 5], maxBit: number = 5): Trie107Step[] {
  const steps: Trie107Step[] = [];
  const nodes: VisualTrieNode[] = [
    {
      id: 1,
      depth: 0,
      bit: null,
      parentId: null,
      children: [0, 0],
      x: 360,
      y: 40,
    },
  ];
  let nodeCount = 1;
  let stepIdx = 0;

  function insertToTrie(val: number) {
    let curId = 1;
    for (let i = maxBit; i >= 0; i--) {
      const bit = (val >> i) & 1;
      const curNode = nodes.find(n => n.id === curId)!;
      if (curNode.children[bit] === 0) {
        nodeCount++;
        curNode.children[bit] = nodeCount;
        nodes.push({
          id: nodeCount,
          depth: maxBit - i + 1,
          bit,
          parentId: curId,
          children: [0, 0],
          x: 0,
          y: 0,
        });
      }
      curId = curNode.children[bit];
    }
  }

  function queryMaxXor(val: number): number {
    let curId = 1;
    let ans = 0;
    for (let i = maxBit; i >= 0; i--) {
      const bit = (val >> i) & 1;
      const want = bit ^ 1;
      const curNode = nodes.find(n => n.id === curId)!;
      if (curNode.children[want] !== 0) {
        ans |= (1 << i);
        curId = curNode.children[want];
      } else {
        curId = curNode.children[bit];
      }
    }
    return ans;
  }

  const prefixList: Array<{ idx: number; num: number; eor: number; isCurrent?: boolean }> = [];
  prefixList.push({ idx: -1, num: 0, eor: 0 });
  insertToTrie(0); // 哨兵前缀

  computeNodeCoordinates(nodes);

  steps.push({
    stepIndex: stepIdx++,
    stageId: 'stage-3',
    nums,
    curNum: 0,
    curBit: -1,
    expectedBit: -1,
    actualBit: -1,
    path: [],
    curXor: 0,
    globalMaxXor: 0,
    trieSize: nodeCount,
    nodesList: cloneNodes(nodes),
    prefixXorList: [...prefixList],
    decision: `【Stage 3 子数组最大异或和】：插入哨兵前缀 0 (代表空前缀)，准备动态扫描序列`,
    message: `利用异或自反性 nums[j..i] = eor[i] ^ eor[j-1]，将子数组异或归约为前缀异或两数最大值`,
    log: 'subarray init insert(0)',
    codeLine: { java: 6, cpp: 6, python: 6, javascript: 5, typescript: 5 },
    statusBadge: { text: '前缀初始化', type: 'info' },
  });

  let eor = 0;
  let globalMax = 0;

  for (let idx = 0; idx < nums.length; idx++) {
    const x = nums[idx];
    eor ^= x;
    const bestXorWithEor = queryMaxXor(eor);
    const subMax = eor ^ (eor ^ bestXorWithEor); // bestXorWithEor
    if (bestXorWithEor > globalMax) {
      globalMax = bestXorWithEor;
    }

    prefixList.push({ idx, num: x, eor, isCurrent: true });
    insertToTrie(eor);
    computeNodeCoordinates(nodes);

    steps.push({
      stepIndex: stepIdx++,
      stageId: 'stage-3',
      nums,
      curNum: x,
      curBit: 0,
      expectedBit: -1,
      actualBit: -1,
      path: [],
      curXor: bestXorWithEor,
      globalMaxXor: globalMax,
      trieSize: nodeCount,
      nodesList: cloneNodes(nodes),
      prefixXorList: [...prefixList],
      decision: `处理元素 nums[${idx}] = ${x}：累计前缀异或 eor = ${eor}，在 01-Trie 中查得最大异或子段 = ${bestXorWithEor}`,
      message: `当前全局最大连续子数组异或和更新为: ${globalMax}`,
      log: `subarray idx=${idx} eor=${eor} ans=${bestXorWithEor}`,
      codeLine: { java: 10, cpp: 10, python: 9, javascript: 9, typescript: 9 },
      statusBadge: { text: `子段 Max=${globalMax}`, type: 'success' },
    });
  }

  return steps;
}

// ==========================================
// 表现层渲染器 (Card 1: 纯净 SVG 沙盘; Card 2: 指标与内存面板)
// ==========================================

export function render01TrieCanvas(container: HTMLElement, step: Trie107Step) {
  const width = 760;
  const height = 420;
  const nodes = step.nodesList || [];
  const activePathSet = new Set(step.activePathNodeIds || []);
  const activeNodeId = step.activeNodeId;

  // 1. 生成树边 (Edges)
  const edgeSvgList: string[] = [];
  for (const n of nodes) {
    const [lId, rId] = n.children;
    if (lId !== 0) {
      const child = nodes.find(c => c.id === lId);
      if (child) {
        const isPath = activePathSet.has(n.id) && activePathSet.has(child.id);
        const strokeColor = isPath ? '#10b981' : '#f43f5e';
        const strokeWidth = isPath ? 3.5 : 2;
        const midX = (n.x + child.x) / 2;
        const midY = (n.y + child.y) / 2;
        edgeSvgList.push(`
          <line x1="${n.x}" y1="${n.y}" x2="${child.x}" y2="${child.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${isPath ? 'stroke-dasharray="4,2"' : ''} />
          <circle cx="${midX}" cy="${midY}" r="7" fill="#ffffff" stroke="#f43f5e" stroke-width="1.5" />
          <text x="${midX}" y="${midY + 3.5}" text-anchor="middle" font-size="9" font-weight="800" fill="#e11d48">0</text>
        `);
      }
    }
    if (rId !== 0) {
      const child = nodes.find(c => c.id === rId);
      if (child) {
        const isPath = activePathSet.has(n.id) && activePathSet.has(child.id);
        const strokeColor = isPath ? '#10b981' : '#0284c7';
        const strokeWidth = isPath ? 3.5 : 2;
        const midX = (n.x + child.x) / 2;
        const midY = (n.y + child.y) / 2;
        edgeSvgList.push(`
          <line x1="${n.x}" y1="${n.y}" x2="${child.x}" y2="${child.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${isPath ? 'stroke-dasharray="4,2"' : ''} />
          <circle cx="${midX}" cy="${midY}" r="7" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" />
          <text x="${midX}" y="${midY + 3.5}" text-anchor="middle" font-size="9" font-weight="800" fill="#0369a1">1</text>
        `);
      }
    }
  }

  // 2. 生成节点 (Nodes)
  const nodeSvgList: string[] = [];
  for (const n of nodes) {
    const isActive = n.id === activeNodeId;
    const isPath = activePathSet.has(n.id);
    const isRoot = n.id === 1;

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let strokeWidth = 2;

    if (isActive) {
      fill = '#eff6ff';
      stroke = '#0284c7';
      strokeWidth = 3.5;
    } else if (isPath) {
      fill = '#f0fdf4';
      stroke = '#10b981';
      strokeWidth = 2.5;
    }

    const radius = isRoot ? 16 : 14;

    nodeSvgList.push(`
      <g class="trie-node" transform="translate(${n.x}, ${n.y})">
        ${isActive ? `<circle r="${radius + 5}" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.6"><animate attributeName="r" values="${radius + 3};${radius + 8};${radius + 3}" dur="1.8s" repeatCount="indefinite" /></circle>` : ''}
        <circle r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        <text y="4" text-anchor="middle" font-size="${isRoot ? 11 : 10}" font-weight="700" fill="${isActive ? '#0369a1' : '#334155'}">
          ${isRoot ? 'Root' : n.id}
        </text>
        ${n.storedVal != null ? `
          <g transform="translate(0, ${radius + 12})">
            <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#0284c7" />
            <text y="3" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff">${n.storedVal}</text>
          </g>
        ` : ''}
      </g>
    `);
  }

  // 3. 左侧二进制位深度标尺 (Bit Ruler)
  const rulerSvgList: string[] = [];
  for (let b = 5; b >= 0; b--) {
    const depth = 5 - b + 1;
    const y = 40 + depth * 55;
    const isCurrentBit = step.curBit === b;
    rulerSvgList.push(`
      <g transform="translate(18, ${y})">
        <text x="0" y="4" font-size="10" font-weight="${isCurrentBit ? '800' : '600'}" fill="${isCurrentBit ? '#0284c7' : '#94a3b8'}">
          Bit ${b} <tspan font-size="8.5" fill="${isCurrentBit ? '#38bdf8' : '#cbd5e1'}">(2^${b}=${1 << b})</tspan>
        </text>
        ${isCurrentBit ? `<polygon points="78,4 84,0 84,8" fill="#0284c7" />` : ''}
      </g>
    `);
  }

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
      <!-- 顶部轻量浮动状态标牌 (严格杜绝 Card 1 套娃) -->
      <div style="position: absolute; top: 12px; right: 16px; display: flex; gap: 8px; z-index: 5;">
        <span style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #475569;">
          节点总数: ${step.trieSize}
        </span>
        <span style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #16a34a;">
          全局最大异或: ${step.globalMaxXor}
        </span>
      </div>

      <!-- SVG 主沙盘 -->
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; flex: 1; min-height: 360px;" preserveAspectRatio="xMidYMid meet">
        <!-- 背景网格修饰 -->
        <defs>
          <pattern id="grid-dots-01trie" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#e2e8f0" />
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grid-dots-01trie)" />

        <!-- 标尺 -->
        ${rulerSvgList.join('')}

        <!-- 树边与节点 -->
        <g class="edges">${edgeSvgList.join('')}</g>
        <g class="nodes">${nodeSvgList.join('')}</g>

        <!-- 底部图例 -->
        <g transform="translate(18, ${height - 20})">
          <circle cx="6" cy="0" r="4" fill="#f43f5e" />
          <text x="14" y="3" font-size="9.5" fill="#64748b">0 分支 (左)</text>
          <circle cx="85" cy="0" r="4" fill="#0284c7" />
          <text x="93" y="3" font-size="9.5" fill="#64748b">1 分支 (右)</text>
          <line x1="165" y1="0" x2="185" y2="0" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3,2" />
          <text x="190" y="3" font-size="9.5" font-weight="700" fill="#16a34a">活跃探索路径</text>
        </g>
      </svg>
    </div>
  `;
}

export function render01TrieCard2(container: HTMLElement, step: Trie107Step) {
  const bitStr = step.curNum.toString(2).padStart(6, '0');

  // 二进制位寄存器对比
  const bitsComparison = Array.from({ length: 6 }, (_, idx) => {
    const bitPos = 5 - idx;
    const curVal = (step.curNum >> bitPos) & 1;
    const isCurrent = step.curBit === bitPos;
    return `
      <div style="flex: 1; text-align: center; background: ${isCurrent ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isCurrent ? '#0284c7' : '#e2e8f0'}; border-radius: 6px; padding: 6px 2px;">
        <div style="font-size: 9px; color: ${isCurrent ? '#0284c7' : '#94a3b8'}; font-weight: 700;">Bit ${bitPos}</div>
        <div style="font-size: 14px; font-weight: 800; color: ${curVal === 1 ? '#0284c7' : '#e11d48'}; margin-top: 2px;">${curVal}</div>
        <div style="font-size: 9px; color: #64748b; margin-top: 2px;">^1=${curVal ^ 1}</div>
      </div>
    `;
  }).join('');

  // 阶段 2: 静态数组视图
  let stage2Html = '';
  if (step.stageId === 'stage-2' && step.staticTable) {
    const rowsHtml = step.staticTable.rows.map(r => `
      <tr style="background: ${r.isCurrent ? '#eff6ff' : '#ffffff'}; font-size: 11px;">
        <td style="padding: 4px 8px; border: 1px solid #e2e8f0; font-weight: 700; color: ${r.isCurrent ? '#0284c7' : '#334155'};">tree[${r.index}]</td>
        <td style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: center; color: ${r.left > 0 ? '#e11d48' : '#94a3b8'};">${r.left}</td>
        <td style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: center; color: ${r.right > 0 ? '#0284c7' : '#94a3b8'};">${r.right}</td>
      </tr>
    `).join('');

    stage2Html = `
      <div style="margin-top: 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 6px;">
          📊 静态数组连续映射表 (tree[cnt][2])
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; font-size: 10px; color: #64748b;">
              <th style="padding: 4px 8px; border: 1px solid #e2e8f0;">索引节点</th>
              <th style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: center;">[0] 左子行号</th>
              <th style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: center;">[1] 右子行号</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // 阶段 3: 前缀异或流视图
  let stage3Html = '';
  if (step.stageId === 'stage-3' && step.prefixXorList) {
    const listHtml = step.prefixXorList.map(item => `
      <div style="background: ${item.isCurrent ? '#f0fdf4' : '#ffffff'}; border: 1px solid ${item.isCurrent ? '#16a34a' : '#e2e8f0'}; border-radius: 6px; padding: 6px 10px; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748b;">${item.idx === -1 ? '哨兵基底' : `nums[${item.idx}]=${item.num}`}</span>
        <span style="font-weight: 800; color: #16a34a;">eor=${item.eor}</span>
      </div>
    `).join('');

    stage3Html = `
      <div style="margin-top: 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 6px;">
          ⛓️ 连续前缀异或流 (eor[0..i] 集合)
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          ${listHtml}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; border-radius: 12px; height: 100%; box-sizing: border-box; overflow-y: auto;">
      <!-- 顶部四格指标面板 -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600;">当前探查数字</div>
          <div style="font-size: 16px; font-weight: 800; color: #0284c7; margin-top: 2px;">
            ${step.curNum} <span style="font-size: 11px; color: #94a3b8;">(0b${bitStr})</span>
          </div>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600;">当前探查位</div>
          <div style="font-size: 16px; font-weight: 800; color: #8b5cf6; margin-top: 2px;">
            ${step.curBit >= 0 ? `第 ${step.curBit} 位 (权值 ${1 << step.curBit})` : '完成 / 闲置'}
          </div>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600;">当前累计异或值</div>
          <div style="font-size: 18px; font-weight: 800; color: #059669; margin-top: 2px;">
            ${step.curXor}
          </div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; color: #166534; font-weight: 600;">全局最大异或 Max</div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 2px;">
            ${step.globalMaxXor}
          </div>
        </div>
      </div>

      <!-- 6-bit 寄存器对照条 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">
          🔍 二进制位贪心寄存器比对
        </div>
        <div style="display: flex; gap: 4px;">
          ${bitsComparison}
        </div>
      </div>

      <!-- 贪心决策状态条 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">🧠 贪心分支决断</span>
          ${step.statusBadge ? `
            <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${step.statusBadge.type === 'success' ? '#dcfce7' : step.statusBadge.type === 'danger' ? '#ffe4e6' : step.statusBadge.type === 'warning' ? '#fef3c7' : '#e0f2fe'}; color: ${step.statusBadge.type === 'success' ? '#15803d' : step.statusBadge.type === 'danger' ? '#be123c' : step.statusBadge.type === 'warning' ? '#b45309' : '#0369a1'};">
              ${step.statusBadge.text}
            </span>
          ` : ''}
        </div>
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
          ${step.decision}
        </p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
          ${step.message}
        </p>
      </div>

      <!-- 阶段专有视图 -->
      ${stage2Html}
      ${stage3Html}
    </div>
  `;
}

// ==========================================
// 算法自注册 (Declarative Algorithm Manifest)
// ==========================================

export const trieXorMaxVisualizer = registerDeclarativeAlgorithm<Trie107Step>({
  id: 'trie-xor-max-107',
  name: '01-Trie 与异或最大值 (Class 107)',
  aliases: ['class107-code01', 'trie-xor-max', 'trie-xor-max-107', 'maximum-xor', 'leetcode-421', 'luogu-p4551'],
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 107,
  learningGoal: '掌握 01-Trie 字典树对二进制数逐位构建、高位贪心走对偶分支达到 O(N * 32) 极速求最大异或和',
  problemHtml: TRIE_XOR_107_PROBLEM_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 两数最大异或 (LeetCode 421)',
      shortName: '动态两数异或',
      card2Title: '01-Trie 拓扑构建与对偶分支决策',
      card2Desc: '经典动态 01-Trie 逐位构建与贪心探索对偶分支，达成 O(31N) 极速两数最大异或值',
      codeLanguages: TRIE_XOR_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildTrieXorMaxSteps(nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8], 5);
      },
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 竞赛静态连续数组 (tree[N][2])',
      shortName: '静态连续数组',
      card2Title: '静态内存映射表与连续索引推演',
      card2Desc: '零 GC 扁平化连续静态数组排布，指针下标寻址，展示内存紧凑分配与常数级压榨',
      codeLanguages: TRIE_STAGE2_STATIC_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildStage2StaticSteps(nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8], 5);
      },
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 子数组最大异或和 (前缀异或转化)',
      shortName: '前缀异或转化',
      card2Title: '前缀异或自反性与子数组区间求解',
      card2Desc: '利用异或自反性 eor[j..i] = eor[i] ^ eor[j-1]，动态维护前缀异或集合并贪心查询',
      codeLanguages: TRIE_STAGE3_SUBARRAY_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 1, 4, 2, 5');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildStage3SubarrayXorSteps(nums.length > 0 ? nums : [3, 1, 4, 2, 5], 5);
      },
    },
  ],
  presets: [
    {
      label: '经典双数：5 XOR 25 = 28 (LC 421 样例)',
      values: { nums: '3, 10, 5, 25, 2, 8' },
    },
    {
      label: '紧凑全互斥集：两两对偶异或',
      values: { nums: '1, 2, 4, 8, 16, 31' },
    },
    {
      label: '高位集中进位测试',
      values: { nums: '14, 70, 53, 83, 49, 91' },
    },
    {
      label: '连续子数组异或经典用例',
      values: { nums: '3, 1, 4, 2, 5' },
    },
  ],
  inputs: [
    {
      id: 'nums',
      label: '正整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '3, 10, 5, 25, 2, 8',
      placeholder: '请输入正整数列表',
    },
  ],
  codeLanguages: TRIE_XOR_CODES,
  generateSteps: (inputs, stageId) => {
    const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const validNums = nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8];

    if (stageId === 'stage-2') {
      return buildStage2StaticSteps(validNums, 5);
    } else if (stageId === 'stage-3') {
      return buildStage3SubarrayXorSteps(validNums, 5);
    }
    return buildTrieXorMaxSteps(validNums, 5);
  },
  renderCanvas: (container, step) => {
    render01TrieCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    render01TrieCard2(container, step);
  },
});
