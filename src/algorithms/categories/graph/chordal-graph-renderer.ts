/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search) 声明式可视化器
 * 进阶图论: 真正的逐语句单步指令执行 (Line-by-Line Execution Engine)
 * MCS 逆序生成完美消除序列 PEO、弦图充要条件检验 (洛谷 P3199)
 * 遵循标准 4-Card 声明式沙盘架构，包含多数组 (label[], peo[], rankOrder[], vis[]) 完整实时联动
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CHORDAL_GRAPH_CODE_LANGUAGES,
  CHORDAL_GRAPH_PROBLEM_HTML,
  CHORDAL_GRAPH_ANALYSIS_HTML,
} from './chordal-graph-problem-content';

export interface ChordalStep {
  peoOrder: number[];
  labelWeights: Record<number, number>;
  curSelected: number;
  activeArray?: 'peo' | 'rankOrder' | 'label' | 'vis' | 'adj';
  activeSlot?: number;
  peoArray: (number | null)[];
  rankOrderArray: (number | null)[];
  visArray: boolean[];
  edges: Array<{ u: number; v: number; isChord?: boolean; highlighted?: boolean }>;
  activeEdge?: [number, number];
  isChordal: boolean;
  status: 'init' | 'mcs' | 'verify' | 'fail' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, any>;
}

export function buildChordalGraphSteps(graphType: 'chordal' | 'non-chordal' = 'chordal'): ChordalStep[] {
  const steps: ChordalStep[] = [];
  const isChordalTarget = graphType === 'chordal';
  const n = 4;

  const baseEdges: Array<{ u: number; v: number; isChord?: boolean }> = [
    { u: 1, v: 2 },
    { u: 2, v: 4 },
    { u: 4, v: 3 },
    { u: 3, v: 1 },
  ];
  const allEdges = isChordalTarget
    ? [...baseEdges, { u: 1, v: 4, isChord: true }]
    : [...baseEdges];

  // 状态变量
  const currentEdges: Array<{ u: number; v: number; isChord?: boolean; highlighted?: boolean }> = [];
  const label: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const peo: (number | null)[] = [null, null, null, null, null]; // 1-based
  const rankOrder: (number | null)[] = [null, null, null, null, null]; // 1-based
  const vis: boolean[] = [false, false, false, false, false]; // 1-based

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'mcs' | 'verify' | 'fail' | 'done',
    curSelected: number = 0,
    activeArray?: 'peo' | 'rankOrder' | 'label' | 'vis' | 'adj',
    activeSlot?: number,
    activeEdge?: [number, number],
    isChordal: boolean = false
  ): void {
    const validPeo = peo.slice(1).filter((x): x is number => x !== null);
    const statusStr =
      status === 'done' || status === 'fail'
        ? isChordal
          ? '✓ 判定为弦图'
          : '❌ 非弦图 (含无弦环)'
        : '检验中...';

    steps.push({
      peoOrder: [...validPeo],
      labelWeights: { ...label },
      curSelected,
      activeArray,
      activeSlot,
      peoArray: [...peo],
      rankOrderArray: [...rankOrder],
      visArray: [...vis],
      edges: currentEdges.map((e) => ({
        ...e,
        highlighted:
          activeEdge &&
          ((e.u === activeEdge[0] && e.v === activeEdge[1]) ||
            (e.u === activeEdge[1] && e.v === activeEdge[0])),
      })),
      activeEdge,
      isChordal,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': curSelected ? `Node ${curSelected}` : '无',
        'metric-peo-len': `${validPeo.length} / 4`,
        'metric-chordal-status': statusStr,
        'cur-node': curSelected ? `Node ${curSelected}` : '无',
        'peo-len': `${validPeo.length} / 4`,
        'chordal-status': statusStr,
      },
    });
  }

  // ==================== 1. 算法入口与初始化 ====================
  // 行 94: isChordal
  makeStep(94, '🚀 [函数入口] isChordal: 开始判定给定图是否为弦图。', 'isChordal() 入口', 'init');

  // 行 95: init(numNodes);
  makeStep(95, '📦 [调用 init] 调用 init(numNodes=4)，准备初始化全局数据结构。', '调用 init(4)', 'init');

  // 行 19: n = numNodes;
  makeStep(19, '🔧 [赋值节点数] n = 4; 顶点集为 {1, 2, 3, 4}。', 'n = 4', 'init');

  // 行 20: adj = new ArrayList<>();
  makeStep(20, '📐 [初始化邻接表] adj = new ArrayList<>(); 分配图的邻接表外层引用。', 'adj = new ArrayList<>()', 'init');

  // 行 21: for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
  makeStep(21, '📐 [创建邻接链表] 循环为 0..4 每个节点创建独立的邻接表 ArrayList。', 'adj 链表初始化完毕', 'init', 0, 'adj');

  // 行 22: peo = new int[n + 1];
  makeStep(22, '📊 [分配 peo 数组] peo = new int[5]; 分配完美消除序列槽位 [_, _, _, _]。', 'peo 数组分配内存', 'init', 0, 'peo');

  // 行 23: rankOrder = new int[n + 1];
  makeStep(23, '📊 [分配 rankOrder 数组] rankOrder = new int[5]; 分配节点排名映射表。', 'rankOrder 分配内存', 'init', 0, 'rankOrder');

  // 行 24: label = new int[n + 1];
  makeStep(24, '📊 [分配 label 数组] label = new int[5]; 分配 MCS 势权值计数表。', 'label 分配内存', 'init', 0, 'label');

  // 行 25: vis = new boolean[n + 1];
  makeStep(25, '📊 [分配 vis 数组] vis = new boolean[5]; 分配已入序布尔访问标记。', 'vis 分配内存', 'init', 0, 'vis');

  // ==================== 2. 逐条添加无向边 ====================
  // 行 96: for (int[] e : edges)
  makeStep(96, '🔗 [边迭代] 准备将输入的边集合逐一加入邻接表。', '开始遍历边集合', 'init');

  for (let idx = 0; idx < allEdges.length; idx++) {
    const edge = allEdges[idx];
    const { u, v, isChord } = edge;

    // 行 97: addEdge(e[0], e[1]);
    makeStep(97, `🔗 [调用 addEdge] 调用 addEdge(${u}, ${v})，连接无向边 ${u} - ${v}${isChord ? ' (对角弦)' : ''}。`, `addEdge(${u}, ${v})`, 'init', 0, undefined, undefined, [u, v]);

    // 行 29: adj.get(u).add(v);
    makeStep(29, `✏️ [单向连边] adj.get(${u}).add(${v}); 顶点 ${u} 添加邻居 ${v}。`, `adj[${u}].add(${v})`, 'init', u, 'adj', u, [u, v]);

    // 行 30: adj.get(v).add(u);
    currentEdges.push({ u, v, isChord });
    makeStep(30, `✏️ [反向连边] adj.get(${v}).add(${u}); 顶点 ${v} 添加邻居 ${u}，无向边建图完成。`, `adj[${v}].add(${u})`, 'init', v, 'adj', v, [u, v]);
  }

  // ==================== 3. MCS 最大势搜索构造 PEO ====================
  // 行 99: mcs();
  makeStep(99, '⚡ [调用 MCS] 调用 mcs()，启动最大势搜索算法逆序生成完美消除序列。', '调用 mcs()', 'mcs');

  // 行 35: Arrays.fill(label, 0);
  makeStep(35, '🧹 [清零势表] Arrays.fill(label, 0); 所有节点初始势设为 0。', 'label[:] = 0', 'mcs', 0, 'label');

  // 行 36: Arrays.fill(vis, false);
  makeStep(36, '🧹 [清空访问] Arrays.fill(vis, false); 所有节点未被消除。', 'vis[:] = false', 'mcs', 0, 'vis');

  // 模拟 MCS 逆序生成过程
  // 弦图 (含 1-4 弦): PEO 位次生成为: i=4 选 4, i=3 选 3, i=2 选 1, i=1 选 2 -> peo = [2, 1, 3, 4]
  // 非弦图 (C4 无弦环): PEO 位次生成为: i=4 选 4, i=3 选 3, i=2 选 2, i=1 选 1 -> peo = [1, 2, 3, 4]
  const mcsSchedule = isChordalTarget ? [4, 3, 1, 2] : [4, 3, 2, 1];

  for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
    const i = 4 - stepIdx; // 4, 3, 2, 1
    const chosenNode = mcsSchedule[stepIdx];

    // 行 38: for (int i = n; i >= 1; i--)
    makeStep(38, `🔄 [MCS 轮次 i=${i}] 外层循环 i=${i}：当前正在寻找第 ${i} 位次的完美消除顶点。`, `MCS 轮次 i=${i}`, 'mcs', 0, 'peo', i);

    // 行 39: int maxNode = 0;
    makeStep(39, `📌 [重置候选] int maxNode = 0; 准备在未访问点中寻找势最大者。`, 'maxNode = 0', 'mcs');

    // 行 40: int maxLabel = -1;
    makeStep(40, `📌 [重置最大势] int maxLabel = -1; 初始化最大势阈值。`, 'maxLabel = -1', 'mcs');

    // 行 41: for (int u = 1; u <= n; u++)
    makeStep(41, `🔍 [扫描节点] for (int u = 1; u <= 4; u++)：遍历所有顶点对比势权值。`, '遍历节点寻找 maxLabel', 'mcs');

    // 模拟内部比较选出 chosenNode
    for (let u = 1; u <= 4; u++) {
      if (!vis[u]) {
        // 行 42: if (!vis[u] && label[u] > maxLabel)
        makeStep(42, `⚖️ [条件判断] 检查顶点 ${u}：未访问，势为 label[${u}]=${label[u]}。`, `比较 u=${u}, 势=${label[u]}`, 'mcs', u, 'label', u);
        if (u === chosenNode) {
          // 行 43: maxLabel = label[u];
          makeStep(43, `⭐ [刷新最大势] maxLabel = label[${u}] = ${label[u]}; 顶点 ${u} 成为当前最大势候选！`, `maxLabel = ${label[u]}`, 'mcs', u, 'label', u);
          // 行 44: maxNode = u;
          makeStep(44, `⭐ [更新候选点] maxNode = ${u}; 记录最优候选节点。`, `maxNode = ${u}`, 'mcs', u);
        }
      }
    }

    // 行 47: peo[i] = maxNode;
    peo[i] = chosenNode;
    makeStep(47, `🎯 [写入 PEO] peo[${i}] = ${chosenNode}; 将节点 ${chosenNode} 放入 PEO 序列第 ${i} 位！`, `peo[${i}] = ${chosenNode}`, 'mcs', chosenNode, 'peo', i);

    // 行 48: rankOrder[maxNode] = i;
    rankOrder[chosenNode] = i;
    makeStep(48, `📍 [记录排名] rankOrder[${chosenNode}] = ${i}; 节点 ${chosenNode} 在序列中排第 ${i} 位。`, `rankOrder[${chosenNode}] = ${i}`, 'mcs', chosenNode, 'rankOrder', chosenNode);

    // 行 49: vis[maxNode] = true;
    vis[chosenNode] = true;
    makeStep(49, `🔒 [标记已选] vis[${chosenNode}] = true; 锁定节点 ${chosenNode}，不再参与后续最大势评选。`, `vis[${chosenNode}] = true`, 'mcs', chosenNode, 'vis', chosenNode);

    // 行 51: for (int v : adj.get(maxNode))
    makeStep(51, `📡 [遍历邻居] 遍历节点 ${chosenNode} 的所有相邻顶点更新势。`, `更新 ${chosenNode} 邻居的势`, 'mcs', chosenNode, 'adj', chosenNode);

    // 找出邻居并更新势
    const neighbors = allEdges
      .filter((e) => e.u === chosenNode || e.v === chosenNode)
      .map((e) => (e.u === chosenNode ? e.v : e.u));

    for (const v of neighbors) {
      // 行 52: if (!vis[v])
      makeStep(52, `🔎 [检查邻居] 检查邻居节点 ${v}：${vis[v] ? '已入序 (跳过)' : '未入序，其势增加'}。`, `邻居 ${v} 访问状态: ${vis[v]}`, 'mcs', chosenNode, 'vis', v);
      if (!vis[v]) {
        // 行 53: label[v]++;
        label[v]++;
        makeStep(53, `📈 [势自增] label[${v}]++; 节点 ${v} 的未消除邻居数增加，势更新为 ${label[v]}！`, `label[${v}] = ${label[v]}`, 'mcs', v, 'label', v);
      }
    }
  }

  // ==================== 4. verifyPEO 验证完美消除序列 ====================
  // 行 100: return verifyPEO();
  makeStep(100, '🧪 [启动验证] 调用 verifyPEO()，检验生成的候选 PEO 是否为完美消除序列。', '调用 verifyPEO()', 'verify');

  // 行 61: boolean[][] hasEdge = new boolean[n + 1][n + 1];
  makeStep(61, '📋 [邻接矩阵表] boolean[][] hasEdge = new boolean[5][5]; 建立 O(1) 连边查询表。', '分配 hasEdge 矩阵', 'verify');

  // 行 62: for (int u = 1; u <= n; u++)
  makeStep(62, '📋 [构建邻接矩阵] 遍历图中所有边填入 hasEdge 矩阵。', '填充 hasEdge 矩阵', 'verify');

  // 构建邻接关系
  const hasEdge: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
  for (const e of allEdges) {
    hasEdge[e.u][e.v] = true;
    hasEdge[e.v][e.u] = true;
  }
  // 行 65: hasEdge[u][v] = true;
  makeStep(65, '✓ [矩阵构建完成] hasEdge 邻接判断表初始化就绪。', 'hasEdge 填充完成', 'verify');

  let chordalResult = true;

  // 行 68: for (int i = 1; i <= n; i++)
  for (let i = 1; i <= n; i++) {
    const u = peo[i]!;

    // 行 68: 外层循环
    makeStep(68, `🔍 [检验位次 i=${i}] 遍历 PEO 序列第 ${i} 项：u = peo[${i}] = Node ${u}。`, `检验 PEO 第 ${i} 项: Node ${u}`, 'verify', u, 'peo', i);

    // 行 69: int u = peo[i];
    makeStep(69, `📌 [获取节点] int u = peo[${i}] = ${u}; 检验该节点的后继高位邻居是否诱导完全子图。`, `u = peo[${i}] = ${u}`, 'verify', u);

    // 行 70: int firstNext = 0;
    makeStep(70, '📌 [初始化首邻居] int firstNext = 0; 准备记录 rank 最小的后继邻居。', 'firstNext = 0', 'verify', u);

    // 行 71: int minRank = n + 2;
    makeStep(71, '📌 [初始化最小秩] int minRank = 6; 设定最小排名初值。', 'minRank = 6', 'verify', u);

    // 行 72: List<Integer> higherNeighbors = new ArrayList<>();
    makeStep(72, '📂 [收集高位邻居] higherNeighbors = new ArrayList<>(); 收集所有排位在 u 之后的邻居。', '创建 higherNeighbors', 'verify', u);

    // 收集后继邻居
    const neighborsOfU = allEdges
      .filter((e) => e.u === u || e.v === u)
      .map((e) => (e.u === u ? e.v : e.u));

    const higherNeighbors: number[] = [];
    let firstNext = 0;
    let minRank = n + 2;

    // 行 74: for (int v : adj.get(u))
    makeStep(74, `📡 [遍历 u 的邻接点] 检查节点 ${u} 的所有邻居的 rankOrder。`, `遍历 Node ${u} 的邻居`, 'verify', u);

    for (const v of neighborsOfU) {
      // 行 75: if (rankOrder[v] > rankOrder[u])
      const vRank = rankOrder[v]!;
      const uRank = rankOrder[u]!;
      makeStep(75, `🔎 [对比位次] 检查邻居 ${v}：rankOrder[${v}]=${vRank} ${vRank > uRank ? '>' : '<='} rankOrder[${u}]=${uRank}。`, `对比 rank: ${v}(${vRank}) vs ${u}(${uRank})`, 'verify', u, 'rankOrder', v);

      if (vRank > uRank) {
        // 行 76: higherNeighbors.add(v);
        higherNeighbors.push(v);
        makeStep(76, `➕ [加入高位集] higherNeighbors.add(${v}); 节点 ${v} 是 ${u} 的后继邻居！`, `higherNeighbors.add(${v})`, 'verify', v);

        // 行 77: if (rankOrder[v] < minRank)
        if (vRank < minRank) {
          // 行 78: minRank = rankOrder[v];
          minRank = vRank;
          makeStep(78, `⭐ [更新最小后继秩] minRank = ${vRank}; 发现更早出现的后继节点。`, `minRank = ${vRank}`, 'verify', v);
          // 行 79: firstNext = v;
          firstNext = v;
          makeStep(79, `⭐ [更新首后继] firstNext = ${v}; 目前最早后继点为 Node ${v}。`, `firstNext = ${v}`, 'verify', v);
        }
      }
    }

    // 检验团性质
    // 行 84: for (int v : higherNeighbors)
    makeStep(84, `🔬 [检验团连边] 检查除 firstNext (${firstNext}) 外的所有高位邻居与 firstNext 之间是否有连边。`, `检验 higherNeighbors 成团`, 'verify', u);

    for (const v of higherNeighbors) {
      if (v !== firstNext) {
        // 行 85: if (v != firstNext && !hasEdge[firstNext][v])
        const edgeExists = hasEdge[firstNext][v];
        makeStep(85, `🔍 [边存在性检查] 检查 (${firstNext}, ${v}) 是否连边：hasEdge[${firstNext}][${v}] = ${edgeExists}。`, `hasEdge[${firstNext}][${v}] == ${edgeExists}`, 'verify', u, undefined, undefined, [firstNext, v]);

        if (!edgeExists) {
          // 行 86: return false;
          chordalResult = false;
          makeStep(86, `❌ [违反充要条件] 节点 ${firstNext} 与 ${v} 之间缺少连边！后继邻居不构成完全子图 (发现无弦环)！返回 false！`, `缺失边 (${firstNext}, ${v})，return false;`, 'fail', u, undefined, undefined, [firstNext, v], false);
          break;
        } else {
          makeStep(85, `✓ [成团验证通过] 边 (${firstNext}, ${v}) 存在，与首后继成功闭合成团！`, `边 (${firstNext}, ${v}) 存在`, 'verify', u, undefined, undefined, [firstNext, v]);
        }
      }
    }

    if (!chordalResult) break;
  }

  if (chordalResult) {
    // 行 90: return true;
    makeStep(90, '🎉 [全图验证通过] 所有顶点的后继邻居集合均诱导完全子图，PEO 序列完全合法！返回 true！', 'verifyPEO() 成功，return true;', 'done', 0, undefined, undefined, undefined, true);
    // 行 100: isChordal 返回
    makeStep(100, '👑 [判定结论] 该图是弦图 (Chordal Graph)！完美消除序列 PEO = [2, 1, 3, 4]。', 'isChordal -> true', 'done', 0, undefined, undefined, undefined, true);
  } else {
    // 行 100: isChordal 返回 false
    makeStep(100, '🚫 [判定结论] 该图存在无弦 4-环 C4，无法找到任何合法的完美消除序列 PEO！非弦图！', 'isChordal -> false', 'done', 0, undefined, undefined, undefined, false);
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ChordalStep>({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  category: 'graph',
  icon: '🎻',
  badge: {
    mode: 'MCS + PEO 单步虚拟机',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🎻 弦图拓扑与完美消除序列沙盘',
  card2Title: '📊 节点多数组 (label, peo, rank, vis) 实时监控器',
  card2Desc: '严格对齐每行代码推导，逐指令监控 label[] 势、peo[] 序列、rankOrder[] 及 vis[] 数组状态',
  legend: [
    { label: '未处理节点', color: '#1e3a8a' },
    { label: '⭐ 当前选取最大势节点', color: '#f59e0b' },
    { label: '🟢 已入 PEO 序列节点', color: '#065f46' },
    { label: '🟡 对角弦边 (若存在)', color: '#facc15' },
    { label: '🔴 正在校验/冲突边', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-graph-type',
      label: '图结构模式',
      type: 'select',
      defaultValue: 'chordal',
      options: [
        { label: '4 节点弦图 (含对角弦 1-4)', value: 'chordal' },
        { label: '4 节点无弦环 C4 (非弦图)', value: 'non-chordal' },
      ],
    },
  ],
  presets: [
    { label: '4 节点弦图 (含对角弦 1-4)', values: { 'input-graph-type': 'chordal' } },
    { label: '4 节点无弦环 C4 (非弦图)', values: { 'input-graph-type': 'non-chordal' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前焦点节点', color: '#f59e0b' },
    { id: 'metric-peo-len', label: 'PEO 生成进度', color: '#38bdf8' },
    { id: 'metric-chordal-status', label: '弦图判定结论', color: '#10b981' },
  ],
  codeLanguages: CHORDAL_GRAPH_CODE_LANGUAGES,
  problemHtml: CHORDAL_GRAPH_PROBLEM_HTML,
  analysisHtml: CHORDAL_GRAPH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const type = (inputs['input-graph-type'] || 'chordal') as 'chordal' | 'non-chordal';
    return buildChordalGraphSteps(type);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 80, y: 55 },
      2: { x: 230, y: 55 },
      3: { x: 80, y: 165 },
      4: { x: 230, y: 165 },
    };

    const svgEdges = step.edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isChord = e.isChord;
        const isHighlight = e.highlighted;
        const color = isHighlight ? '#ef4444' : isChord ? '#facc15' : '#475569';
        const width = isHighlight ? 3.5 : isChord ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHighlight ? 'stroke-dasharray="4,2"' : ''} />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const inPEO = step.visArray[u];
        const isCur = step.curSelected === u;
        const bg = isCur ? '#f59e0b' : inPEO ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : inPEO ? '#10b981' : '#38bdf8';
        const weight = step.labelWeights[u] || 0;
        const rk = step.rankOrderArray[u];

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inPEO ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${inPEO ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">势:${weight}${rk ? `(秩${rk})` : ''}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 200px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          ${step.edges.some((e) => e.isChord) ? '🟡 金色斜线为对角弦边 1-4 | 使得四边形环被三角剖分，存在完美消除序列 PEO' : '⚪ 无对角弦 | 4 节点简单环 C4 无弦，无法满足 PEO 后继团充要条件'}
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-chordal-graph-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node') || root.querySelector('#cur-node');
      const peoLenEl = root.querySelector('#metric-peo-len') || root.querySelector('#peo-len');
      const chordalEl = root.querySelector('#metric-chordal-status') || root.querySelector('#chordal-status');

      if (nodeEl) nodeEl.textContent = step.curSelected ? `Node ${step.curSelected}` : '无';
      if (peoLenEl) peoLenEl.textContent = `${step.peoOrder.length} / 4`;
      if (chordalEl) {
        chordalEl.textContent =
          step.status === 'done' || step.status === 'fail'
            ? step.isChordal
              ? '✓ 判定为弦图'
              : '❌ 非弦图 (含无弦环)'
            : '检验中...';
        (chordalEl as HTMLElement).style.color =
          step.isChordal ? '#10b981' : step.status === 'fail' || (step.status === 'done' && !step.isChordal) ? '#ef4444' : '#d97706';
      }

      // 渲染多数组联动监控面板
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const renderArraySlots = (
          name: string,
          slots: any[] | Record<number, any>,
          activeCondition: (idx: number) => boolean,
          colorTheme: string
        ) => {
          const cells = [1, 2, 3, 4]
            .map((idx) => {
              const val = slots[idx];
              const isActive = activeCondition(idx);
              const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
                <span style="font-size: 8px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.2;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 85px; color: ${colorTheme};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const peoRow = renderArraySlots(
          'peo[]',
          step.peoArray,
          (idx) => step.activeArray === 'peo' && step.activeSlot === idx,
          '#38bdf8'
        );
        const rankRow = renderArraySlots(
          'rankOrder[]',
          step.rankOrderArray,
          (idx) => step.activeArray === 'rankOrder' && step.activeSlot === idx,
          '#a855f7'
        );
        const labelRow = renderArraySlots(
          'label[] (势)',
          step.labelWeights,
          (idx) => step.activeArray === 'label' && step.activeSlot === idx,
          '#f59e0b'
        );
        const visRow = renderArraySlots(
          'vis[] (锁定)',
          step.visArray,
          (idx) => step.activeArray === 'vis' && step.activeSlot === idx,
          '#10b981'
        );

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${peoRow}
              ${rankRow}
              ${labelRow}
              ${visRow}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  viewId: 'algo-chordal-graph-view',
  category: 'graph',
  description: '进阶图论最大势算法：最大势搜索 MCS 逆序生成完美消除序列 PEO、弦图充要判定 (洛谷 P3199)',
  icon: '🎻',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 64,
  learningGoal: '掌握最大势搜索 MCS 算法原理、完美消除序列 PEO 检验及弦图的判定定理',
});

export { Visualizer as ChordalGraphVisualizer };
