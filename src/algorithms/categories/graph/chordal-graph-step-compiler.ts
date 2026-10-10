/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search · 洛谷 P3199) 步进编译器
 * 进阶图论: MCS 逆序生成完美消除序列 PEO、弦图充要条件检验
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

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
  makeStep(94, '🚀 [函数入口] isChordal: 开始判定给定图是否为弦图。', 'isChordal() 入口', 'init');
  makeStep(95, '📦 [调用 init] 调用 init(numNodes=4)，准备初始化全局数据结构。', '调用 init(4)', 'init');
  makeStep(19, '🔧 [赋值节点数] n = 4; 顶点集为 {1, 2, 3, 4}。', 'n = 4', 'init');
  makeStep(20, '📐 [初始化邻接表] adj = new ArrayList<>(); 分配图的邻接表外层引用。', 'adj = new ArrayList<>()', 'init');
  makeStep(21, '📐 [创建邻接链表] 循环为 0..4 每个节点创建独立的邻接表 ArrayList。', 'adj 链表初始化完毕', 'init', 0, 'adj');
  makeStep(22, '📊 [分配 peo 数组] peo = new int[5]; 分配完美消除序列槽位 [_, _, _, _]。', 'peo 数组分配内存', 'init', 0, 'peo');
  makeStep(23, '📊 [分配 rankOrder 数组] rankOrder = new int[5]; 分配节点排名映射表。', 'rankOrder 分配内存', 'init', 0, 'rankOrder');
  makeStep(24, '📊 [分配 label 数组] label = new int[5]; 分配 MCS 势权值计数表。', 'label 分配内存', 'init', 0, 'label');
  makeStep(25, '📊 [分配 vis 数组] vis = new boolean[5]; 分配已入序布尔访问标记。', 'vis 分配内存', 'init', 0, 'vis');

  // ==================== 2. 逐条添加无向边 ====================
  makeStep(96, '🔗 [边迭代] 准备将输入的边集合逐一加入邻接表。', '开始遍历边集合', 'init');

  for (let idx = 0; idx < allEdges.length; idx++) {
    const edge = allEdges[idx];
    const { u, v, isChord } = edge;

    makeStep(97, `🔗 [调用 addEdge] 调用 addEdge(${u}, ${v})，连接无向边 ${u} - ${v}${isChord ? ' (对角弦)' : ''}。`, `addEdge(${u}, ${v})`, 'init', 0, undefined, undefined, [u, v]);
    makeStep(29, `✏️ [单向连边] adj.get(${u}).add(${v}); 顶点 ${u} 添加邻居 ${v}。`, `adj[${u}].add(${v})`, 'init', u, 'adj', u, [u, v]);
    currentEdges.push({ u, v, isChord });
    makeStep(30, `✏️ [反向连边] adj.get(${v}).add(${u}); 顶点 ${v} 添加邻居 ${u}，无向边建图完成。`, `adj[${v}].add(${u})`, 'init', v, 'adj', v, [u, v]);
  }

  // ==================== 3. MCS 最大势搜索构造 PEO ====================
  makeStep(99, '⚡ [调用 MCS] 调用 mcs()，启动最大势搜索算法逆序生成完美消除序列。', '调用 mcs()', 'mcs');
  makeStep(35, '🧹 [清零势表] Arrays.fill(label, 0); 所有节点初始势设为 0。', 'label[:] = 0', 'mcs', 0, 'label');
  makeStep(36, '🧹 [清空访问] Arrays.fill(vis, false); 所有节点未被消除。', 'vis[:] = false', 'mcs', 0, 'vis');

  const mcsSchedule = isChordalTarget ? [4, 3, 1, 2] : [4, 3, 2, 1];

  for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
    const i = 4 - stepIdx; // 4, 3, 2, 1
    const chosenNode = mcsSchedule[stepIdx];

    makeStep(38, `🔄 [MCS 轮次 i=${i}] 外层循环 i=${i}：当前正在寻找第 ${i} 位次的完美消除顶点。`, `MCS 轮次 i=${i}`, 'mcs', 0, 'peo', i);
    makeStep(39, `📌 [重置候选] int maxNode = 0; 准备在未访问点中寻找势最大者。`, 'maxNode = 0', 'mcs');
    makeStep(40, `📌 [重置最大势] int maxLabel = -1; 初始化最大势阈值。`, 'maxLabel = -1', 'mcs');
    makeStep(41, `🔍 [扫描节点] for (int u = 1; u <= 4; u++)：遍历所有顶点对比势权值。`, '遍历节点寻找 maxLabel', 'mcs');

    for (let u = 1; u <= 4; u++) {
      if (!vis[u]) {
        makeStep(42, `⚖️ [条件判断] 检查顶点 ${u}：未访问，势为 label[${u}]=${label[u]}。`, `比较 u=${u}, 势=${label[u]}`, 'mcs', u, 'label', u);
        if (u === chosenNode) {
          makeStep(43, `⭐ [刷新最大势] maxLabel = label[${u}] = ${label[u]}; 顶点 ${u} 成为当前最大势候选！`, `maxLabel = ${label[u]}`, 'mcs', u, 'label', u);
          makeStep(44, `⭐ [更新候选点] maxNode = ${u}; 记录最优候选节点。`, `maxNode = ${u}`, 'mcs', u);
        }
      }
    }

    peo[i] = chosenNode;
    makeStep(47, `🎯 [写入 PEO] peo[${i}] = ${chosenNode}; 将节点 ${chosenNode} 放入 PEO 序列第 ${i} 位！`, `peo[${i}] = ${chosenNode}`, 'mcs', chosenNode, 'peo', i);

    rankOrder[chosenNode] = i;
    makeStep(48, `📍 [记录排名] rankOrder[${chosenNode}] = ${i}; 节点 ${chosenNode} 在序列中排第 ${i} 位。`, `rankOrder[${chosenNode}] = ${i}`, 'mcs', chosenNode, 'rankOrder', chosenNode);

    vis[chosenNode] = true;
    makeStep(49, `🔒 [标记已选] vis[${chosenNode}] = true; 锁定节点 ${chosenNode}，不再参与后续最大势评选。`, `vis[${chosenNode}] = true`, 'mcs', chosenNode, 'vis', chosenNode);

    makeStep(51, `📡 [遍历邻居] 遍历节点 ${chosenNode} 的所有相邻顶点更新势。`, `更新 ${chosenNode} 邻居的势`, 'mcs', chosenNode, 'adj', chosenNode);

    const neighbors = allEdges
      .filter((e) => e.u === chosenNode || e.v === chosenNode)
      .map((e) => (e.u === chosenNode ? e.v : e.u));

    for (const v of neighbors) {
      makeStep(52, `🔎 [检查邻居] 检查邻居节点 ${v}：${vis[v] ? '已入序 (跳过)' : '未入序，其势增加'}。`, `邻居 ${v} 访问状态: ${vis[v]}`, 'mcs', chosenNode, 'vis', v);
      if (!vis[v]) {
        label[v]++;
        makeStep(53, `📈 [势自增] label[${v}]++; 节点 ${v} 的未消除邻居数增加，势更新为 ${label[v]}！`, `label[${v}] = ${label[v]}`, 'mcs', v, 'label', v);
      }
    }
  }

  // ==================== 4. verifyPEO 验证完美消除序列 ====================
  makeStep(100, '🧪 [启动验证] 调用 verifyPEO()，检验生成的候选 PEO 是否为完美消除序列。', '调用 verifyPEO()', 'verify');
  makeStep(61, '📋 [邻接矩阵表] boolean[][] hasEdge = new boolean[5][5]; 建立 O(1) 连边查询表。', '分配 hasEdge 矩阵', 'verify');
  makeStep(62, '📋 [构建邻接矩阵] 遍历图中所有边填入 hasEdge 矩阵。', '填充 hasEdge 矩阵', 'verify');

  const hasEdge: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
  for (const e of allEdges) {
    hasEdge[e.u][e.v] = true;
    hasEdge[e.v][e.u] = true;
  }
  makeStep(65, '✓ [矩阵构建完成] hasEdge 邻接判断表初始化就绪。', 'hasEdge 填充完成', 'verify');

  let chordalResult = true;

  for (let i = 1; i <= n; i++) {
    const u = peo[i]!;

    makeStep(68, `🔍 [检验位次 i=${i}] 遍历 PEO 序列第 ${i} 项：u = peo[${i}] = Node ${u}。`, `检验 PEO 第 ${i} 项: Node ${u}`, 'verify', u, 'peo', i);
    makeStep(69, `📌 [获取节点] int u = peo[${i}] = ${u}; 检验该节点的后继高位邻居是否诱导完全子图。`, `u = peo[${i}] = ${u}`, 'verify', u);
    makeStep(70, '📌 [初始化首邻居] int firstNext = 0; 准备记录 rank 最小的后继邻居。', 'firstNext = 0', 'verify', u);
    makeStep(71, '📌 [初始化最小秩] int minRank = 6; 设定最小排名初值。', 'minRank = 6', 'verify', u);
    makeStep(72, '📂 [收集高位邻居] higherNeighbors = new ArrayList<>(); 收集所有排位在 u 之后的邻居。', '创建 higherNeighbors', 'verify', u);

    const neighborsOfU = allEdges
      .filter((e) => e.u === u || e.v === u)
      .map((e) => (e.u === u ? e.v : e.u));

    const higherNeighbors: number[] = [];
    let firstNext = 0;
    let minRank = n + 2;

    makeStep(74, `📡 [遍历 u 的邻接点] 检查节点 ${u} 的所有邻居的 rankOrder。`, `遍历 Node ${u} 的邻居`, 'verify', u);

    for (const v of neighborsOfU) {
      const vRank = rankOrder[v]!;
      const uRank = rankOrder[u]!;
      makeStep(75, `🔎 [对比位次] 检查邻居 ${v}：rankOrder[${v}]=${vRank} ${vRank > uRank ? '>' : '<='} rankOrder[${u}]=${uRank}。`, `对比 rank: ${v}(${vRank}) vs ${u}(${uRank})`, 'verify', u, 'rankOrder', v);

      if (vRank > uRank) {
        higherNeighbors.push(v);
        makeStep(76, `➕ [加入高位集] higherNeighbors.add(${v}); 节点 ${v} 是 ${u} 的后继邻居！`, `higherNeighbors.add(${v})`, 'verify', v);

        if (vRank < minRank) {
          minRank = vRank;
          makeStep(78, `⭐ [更新最小后继秩] minRank = ${vRank}; 发现更早出现的后继节点。`, `minRank = ${vRank}`, 'verify', v);
          firstNext = v;
          makeStep(79, `⭐ [更新首后继] firstNext = ${v}; 目前最早后继点为 Node ${v}。`, `firstNext = ${v}`, 'verify', v);
        }
      }
    }

    makeStep(84, `🔬 [检验团连边] 检查除 firstNext (${firstNext}) 外的所有高位邻居与 firstNext 之间是否有连边。`, `检验 higherNeighbors 成团`, 'verify', u);

    for (const v of higherNeighbors) {
      if (v !== firstNext) {
        const edgeExists = hasEdge[firstNext][v];
        makeStep(85, `🔍 [边存在性检查] 检查 (${firstNext}, ${v}) 是否连边：hasEdge[${firstNext}][${v}] = ${edgeExists}。`, `hasEdge[${firstNext}][${v}] == ${edgeExists}`, 'verify', u, undefined, undefined, [firstNext, v]);

        if (!edgeExists) {
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
    makeStep(90, '🎉 [全图验证通过] 所有顶点的后继邻居集合均诱导完全子图，PEO 序列完全合法！返回 true！', 'verifyPEO() 成功，return true;', 'done', 0, undefined, undefined, undefined, true);
    makeStep(100, '👑 [判定结论] 该图是弦图 (Chordal Graph)！完美消除序列 PEO = [2, 1, 3, 4]。', 'isChordal -> true', 'done', 0, undefined, undefined, undefined, true);
  } else {
    makeStep(100, '🚫 [判定结论] 该图存在无弦 4-环 C4，无法找到任何合法的完美消除序列 PEO！非弦图！', 'isChordal -> false', 'done', 0, undefined, undefined, undefined, false);
  }

  return steps;
}
