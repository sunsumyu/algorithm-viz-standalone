/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search) 声明式可视化器
 * 进阶图论: MCS 逆序生成完美消除序列 PEO、弦图充要条件检验 (洛谷 P3199)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
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
  edges: Array<{ u: number; v: number; isChord?: boolean }>;
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

  const baseEdges = [
    { u: 1, v: 2 },
    { u: 2, v: 4 },
    { u: 4, v: 3 },
    { u: 3, v: 1 },
  ];
  const edges = isChordalTarget
    ? [...baseEdges, { u: 1, v: 4, isChord: true }]
    : [...baseEdges];

  function makeStep(data: Omit<ChordalStep, 'edges' | 'metrics'>): ChordalStep {
    const peoStr = data.peoOrder.length > 0 ? `[${data.peoOrder.join(', ')}]` : '[]';
    const statusStr =
      data.status === 'done' || data.status === 'fail'
        ? data.isChordal
          ? '✓ 判定为弦图'
          : '❌ 非弦图 (含无弦环)'
        : '检验中...';

    return {
      ...data,
      edges,
      metrics: {
        'metric-cur-node': data.curSelected ? `Node ${data.curSelected}` : '无',
        'metric-peo-len': `${data.peoOrder.length} / 4`,
        'metric-chordal-status': statusStr,
        'cur-node': data.curSelected ? `Node ${data.curSelected}` : '无',
        'peo-len': `${data.peoOrder.length} / 4`,
        'chordal-status': statusStr,
      },
    };
  }

  if (isChordalTarget) {
    // 弦图用例 (含弦 1-4)
    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '🚀 [算法入口] isChordal: 输入 4 节点图，包含环边 1-2, 2-4, 4-3, 3-1 与对角弦 1-4。',
        log: 'isChordal(n=4, edges=5)',
        codeLine: 95,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '📐 [初始化状态数组] 初始化 adj 邻接表, peo[], rankOrder[], label[] 与 vis[]。',
        log: 'init(n=4): label=[0,0,0,0], vis=[F,F,F,F]',
        codeLine: 19,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '🔗 [建无向边] 添加 5 条边至邻接表，注意对角弦 1-4 已连接。',
        log: 'addEdge 5 次完成',
        codeLine: 29,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'mcs',
        message: '⚡ [启动 MCS 搜索] 开始最大势搜索 (Maximum Cardinality Search)，逆序确定各节点 PEO 位次。',
        log: 'mcs() 启动',
        codeLine: 35,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=4] 所有未访问点势均为 0，贪心选取编号最大节点 4。',
        log: 'i=4: maxNode=4, maxLabel=0',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 4 标号为第 4 位：peo[4]=4, rankOrder[4]=4, vis[4]=true。',
        log: 'peo[4] = 4, rankOrder[4] = 4',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 4 的邻居 1, 2, 3 势全部自增：label[1]=1, label[2]=1, label[3]=1。',
        log: '更新邻居: label[1]=1, label[2]=1, label[3]=1',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=3] 节点 1, 2, 3 势均为 1，贪心选取候选最大编号节点 3。',
        log: 'i=3: maxNode=3, maxLabel=1',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 3 标号为第 3 位：peo[3]=3, rankOrder[3]=3, vis[3]=true。',
        log: 'peo[3] = 3, rankOrder[3] = 3',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 3 的未访问邻居 1 的势自增：label[1] 升至 2！',
        log: 'label[1] = 2',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=2] 节点 1(势2) 显著高于节点 2(势1)，贪心选取节点 1！',
        log: 'i=2: maxNode=1, maxLabel=2',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 1 标号为第 2 位：peo[2]=1, rankOrder[1]=2, vis[1]=true。',
        log: 'peo[2] = 1, rankOrder[1] = 2',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 1 的未访问邻居 2 的势自增：label[2] 升至 2！',
        log: 'label[2] = 2',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=1] 仅剩未访问节点 2(势2)，直接选取节点 2。',
        log: 'i=1: maxNode=2, maxLabel=2',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'mcs',
        message: '🏁 [MCS 搜索结束] 逆序构造候选 PEO 序列完成：[2, 1, 3, 4]！',
        log: '候选 PEO = [2, 1, 3, 4]',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'verify',
        message: '🔍 [启动 PEO 检验] verifyPEO(): 检查每个顶点的后继邻居集合是否在首个后继处形成团。',
        log: 'verifyPEO() 开始',
        codeLine: 61,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'verify',
        message: '🔎 [检验点 2] 后继邻居为 {1, 4} (rank: 2, 4)。最早后继为 1，检查 (1, 4) 是否有边：对角弦 1-4 存在！成团！',
        log: 'Node 2: higher={1,4}, hasEdge[1][4]=true (成团)',
        codeLine: 69,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'verify',
        message: '🔎 [检验点 1] 后继邻居为 {3, 4} (rank: 3, 4)。最早后继为 3，检查 (3, 4) 是否有边：边 3-4 存在！成团！',
        log: 'Node 1: higher={3,4}, hasEdge[3][4]=true (成团)',
        codeLine: 69,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'verify',
        message: '🔎 [检验点 3] 后继邻居为 {4} (rank: 4)。后继仅 1 点，平凡成团！',
        log: 'Node 3: higher={4} (平凡成团)',
        codeLine: 69,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 4,
        isChordal: true,
        status: 'verify',
        message: '🔎 [检验点 4] 末尾节点无后继邻居，检查全部通过！所有点后继均诱导完全子图！',
        log: '所有节点验证通过，PEO 成立',
        codeLine: 91,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 1, 3, 4],
        labelWeights: { 1: 2, 2: 2, 3: 1, 4: 0 },
        curSelected: 0,
        isChordal: true,
        status: 'done',
        message: '🎉 [判定成功] 候选序列 [2, 1, 3, 4] 为完美消除序列 (PEO)！该图为弦图！返回 true！',
        log: '✓ return true; 判定为弦图！',
        codeLine: 101,
      })
    );
  } else {
    // 非弦图用例 (4 节点无弦环 C4: 1-2-4-3-1，缺失弦 1-4 与 2-3)
    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '🚀 [算法入口] isChordal: 输入 4 节点无弦四边形 C4，包含边 1-2, 2-4, 4-3, 3-1（无对角弦）。',
        log: 'isChordal(n=4, edges=4)',
        codeLine: 95,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '📐 [初始化图结构] 初始化 adj, peo, rankOrder, label 与 vis 数组。',
        log: 'init(n=4)',
        codeLine: 19,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'init',
        message: '🔗 [建无向边] 建立 4 条环边，注意图内无任何弦边。',
        log: '添加环边 1-2, 2-4, 4-3, 3-1',
        codeLine: 29,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'mcs',
        message: '⚡ [启动 MCS 搜索] 开始最大势搜索，尝试为无弦环寻找候选 PEO。',
        log: 'mcs() 启动',
        codeLine: 35,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=4] 初始势均为 0，贪心选取最大节点 4。',
        log: 'i=4: 选取 Node 4',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 0, 2: 0, 3: 0, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 4 标号第 4 位：peo[4]=4, rankOrder[4]=4, vis[4]=true。',
        log: 'peo[4] = 4',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 0, 2: 1, 3: 1, 4: 0 },
        curSelected: 4,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 4 的邻居 2 与 3 势自增：label[2]=1, label[3]=1（1 与 4 无边，势保持 0）。',
        log: 'label[2]=1, label[3]=1, label[1]=0',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [4],
        labelWeights: { 1: 0, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=3] 节点 2 与 3 势为 1，贪心选取候选最大节点 3。',
        log: 'i=3: 选取 Node 3',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 0, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 3 标号第 3 位：peo[3]=3, rankOrder[3]=3, vis[3]=true。',
        log: 'peo[3] = 3',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 3,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 3 的邻居 1 势自增：label[1]=1。此时未访问点 1 与 2 势均为 1。',
        log: 'label[1] = 1, label[2] = 1',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [3, 4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=2] 节点 1 与 2 势均为 1，贪心选取最大节点 2。',
        log: 'i=2: 选取 Node 2',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 3, 4],
        labelWeights: { 1: 1, 2: 1, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'mcs',
        message: '📍 [放入 PEO] 节点 2 标号第 2 位：peo[2]=2, rankOrder[2]=2, vis[2]=true。',
        log: 'peo[2] = 2',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 2,
        isChordal: false,
        status: 'mcs',
        message: '📈 [更新邻居势] 节点 2 的邻居 1 势自增：label[1] 升至 2。',
        log: 'label[1] = 2',
        codeLine: 52,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'mcs',
        message: '⭐ [MCS 轮次 i=1] 仅剩节点 1(势2)，选取节点 1。',
        log: 'i=1: 选取 Node 1',
        codeLine: 42,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'mcs',
        message: '🏁 [候选 PEO 构造完成] 得到候选序列 [1, 2, 3, 4]，必须严格验证其是否为完美消除序列。',
        log: '候选 PEO = [1, 2, 3, 4]',
        codeLine: 48,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'verify',
        message: '🔍 [启动 PEO 检验] 调用 verifyPEO(): 检查每个点的后继邻居在最早后继处是否成团。',
        log: 'verifyPEO() 开始',
        codeLine: 61,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'verify',
        message: '🔎 [检验点 1] 后继邻居集合为 {2, 3} (rank: 2, 3)。最早后继为 2 (rank=2)。',
        log: 'Node 1: higher={2,3}, firstNext=2',
        codeLine: 69,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'verify',
        message: '⚠️ [团条件判定] 要求其他后继 {3} 必须与最早后继 2 相邻，即检查边 (2, 3) 是否存在？',
        log: '检查 hasEdge[2][3]...',
        codeLine: 75,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'fail',
        message: '❌ [后继不成团] hasEdge[2][3] == false！节点 2 与 3 之间没有边！后继邻居诱导子图不连通、不成团！',
        log: '❌ 检验失败：hasEdge[2][3] == false，后继不成团',
        codeLine: 84,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 1,
        isChordal: false,
        status: 'fail',
        message: '🛑 [否定弦图定理] 完美消除序列条件破损，原图中存在长度为 4 的无弦简单环，必非弦图！',
        log: 'return false; 非弦图',
        codeLine: 87,
      })
    );

    steps.push(
      makeStep({
        peoOrder: [1, 2, 3, 4],
        labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
        curSelected: 0,
        isChordal: false,
        status: 'done',
        message: '❌ [判定结束] 该图不存在完美消除序列 (PEO)，不是弦图！返回 false！',
        log: '✓ return false; 算法判定完毕！',
        codeLine: 101,
      })
    );
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ChordalStep>({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  viewId: 'algo-chordal-graph-view',
  category: 'graph',
  icon: '🎻',
  badge: {
    mode: '最大势搜索 MCS + PEO',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🎻 弦图拓扑与完美消除序列沙盘',
  card2Title: '🧭 节点势 label[u] 与 PEO 监视器',
  card2Desc: 'MCS 逆序生成 PEO 序列、后继完全子图检验与弦图充要判定',
  legend: [
    { label: '未处理节点', color: '#0284c7' },
    { label: '⭐ 当前选取最大势节点', color: '#f59e0b' },
    { label: '🟢 已入 PEO 序列节点', color: '#10b981' },
    { label: '🟡 对角弦边 (若存在)', color: '#facc15' },
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
      width: '190px',
    },
  ],
  presets: [
    { label: '4 节点弦图 (含对角弦 1-4)', values: { 'input-graph-type': 'chordal' } },
    { label: '4 节点无弦环 C4 (非弦图)', values: { 'input-graph-type': 'non-chordal' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前最大势节点', color: '#f59e0b' },
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
        const color = isChord ? '#facc15' : '#475569';
        const width = isChord ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const inPEO = step.peoOrder.includes(u);
        const isCur = step.curSelected === u;
        const bg = isCur ? '#f59e0b' : inPEO ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : inPEO ? '#10b981' : '#38bdf8';
        const weight = step.labelWeights[u] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || inPEO ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${inPEO ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">势:${weight}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
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
        chordalEl.style.color =
          step.isChordal ? '#10b981' : step.status === 'fail' || step.status === 'done' ? '#ef4444' : '#d97706';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const peoStr = step.peoOrder.length > 0 ? step.peoOrder.map((u) => `N${u}`).join(' ➔ ') : '空';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前 PEO 序列:</span>
              <strong style="color: #10b981; font-family: monospace;">[${peoStr}]</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 弦图充要条件:</span>
              <strong style="font-family: monospace; color: #2563eb;">图 G 为弦图 ⟺ 存在完美消除序列 PEO</strong>
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

