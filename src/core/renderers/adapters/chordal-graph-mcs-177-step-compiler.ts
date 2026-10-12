import { CHORDAL_GRAPH_MCS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-stage-codes';
import { Advanced173Step } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';

export interface ChordalMCSStep extends Advanced173Step {
  nodes: number[];
  peo: number[];
  deg: number[];
  activePick: number;
  maxCliqueSize: number;
  stage: string;
}

export function buildChordalMCSSteps(): ChordalMCSStep[] {
  const steps: ChordalMCSStep[] = [];
  const lines = CHORDAL_GRAPH_MCS_LINES;

  const n = 5;
  const nodes = [0, 1, 2, 3, 4];
  const adj: number[][] = [
    [1, 2],       // 0
    [0, 2, 3],    // 1
    [0, 1, 3, 4], // 2
    [1, 2, 4],    // 3
    [2, 3],       // 4
  ];

  const peo: number[] = new Array(n).fill(-1);
  const deg: number[] = new Array(n).fill(0);
  const vis: boolean[] = new Array(n).fill(false);

  // Step 0: 入口帧
  steps.push({
    nodes,
    peo: [],
    deg: [...deg],
    activePick: -1,
    maxCliqueSize: 0,
    stage: '准备弦图拓扑',
    decision: `主函数入口：准备在 5 节点弦图中运行最大势算法 (MCS) 构造完美消除序列 (PEO)`,
    message: `弦图特性：无弦长环不存在，色数等于最大团数，MCS 逆序贪心选取相邻势能最大点`,
    log: `enter mcs: n=5`,
    codeLine: lines.entry,
    metrics: { '顶点数': n, '无弦环检查': '满足弦图性质', '算法复杂度': 'O(N + M)' },
  });

  // 倒序生成 PEO
  for (let i = n - 1; i >= 0; i--) {
    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!vis[j] && (u === -1 || deg[j] > deg[u])) {
        u = j;
      }
    }
    vis[u] = true;
    peo[i] = u;

    // 邻居势能提升
    for (const v of adj[u]) {
      if (!vis[v]) deg[v]++;
    }

    const currentPeoList = peo.filter(x => x !== -1);

    steps.push({
      nodes,
      peo: [...currentPeoList],
      deg: [...deg],
      activePick: u,
      maxCliqueSize: 3,
      stage: `Round #${n - i}: 选取顶点 V${u} 归位至 PEO[${i}]`,
      decision: `当前势能最高未标记点为 V${u} (deg=${deg[u] - 1 < 0 ? 0 : deg[u] - 1})，分配为倒数第 ${n - i} 个消除点`,
      message: `遍历 V${u} 的未选邻居提升其势能，确保后续选点在诱导子图中维持完全图 (团) 性质`,
      log: `pickMaxDeg: i=${i}, pick=V${u}, deg=[${deg.join(',')}]`,
      codeLine: lines.pickMaxDeg,
      statusBadge: { text: `PEO[${i}] = V${u}`, type: 'info' },
      metrics: { '当前入选点': `V${u}`, '序列位置': i, '已确定点数': n - i },
    });
  }

  // Step 终态: PEO 检验与最大团色数输出
  steps.push({
    nodes,
    peo: [...peo],
    deg: [...deg],
    activePick: -1,
    maxCliqueSize: 3,
    stage: 'MCS 完美消除序列构造完成',
    decision: `🎉 MCS 完美消除序列构造完成：PEO = [${peo.map(v => `V${v}`).join(', ')}]`,
    message: `完美消除序列成立，原图判定为标准弦图！最大团大小 = 色数 = 3 (团包含 {V0, V1, V2} 或 {V1, V2, V3})`,
    log: `returnAns: peo=[${peo.join(',')}], maxClique=3`,
    codeLine: lines.returnAns,
    statusBadge: { text: '弦图判定通过 (团=色数=3)', type: 'success' },
    metrics: { '完美消除序列': peo.join(' -> '), '最大团大小': 3, '图色数': 3 },
  });

  return steps;
}
