/**
 * Class 177: 弦图与最大势算法 MCS (Maximum Cardinality Search)
 * 完美消除序列 PEO 构造 / 洛谷 P3196 [HNOI2008] 神奇的国度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { CHORDAL_GRAPH_MCS_CODES, CHORDAL_GRAPH_MCS_LINES } from './advanced-173-178-stage-codes';
import { Advanced173Step, renderChordalMCSBoard } from './advanced-173-178-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  // PEO = [4, 3, 2, 1, 0]
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

export const chordalGraphMCSVisualizer = registerDeclarativeAlgorithm<ChordalMCSStep>({
  id: 'chordal-graph-mcs-177',
  name: '弦图与最大势算法 MCS (Class 177)',
  category: 'graph',
  icon: '🎻',
  difficulty: 3,
  levelOrder: 177,
  description: '左程云算法通关课 Class 177：弦图与最大势算法 (MCS)。贪心构造完美消除序列 (PEO)，O(N + M) 线性求解弦图最大团、最小染色与色数。',
  learningGoal: '掌握弦图无弦环定义与完美消除序列 PEO 充要条件，深刻理解 MCS 最大势势能贪心与线性图着色',
  problemHtml: ADVANCED_173_178_PROBLEMS.chordalGraphMCS.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.chordalGraphMCS.html,
  inputs: [
    {
      id: 'preset',
      label: '图结构预设',
      type: 'select',
      defaultValue: 'chordal_5node',
      options: [
        { label: '5 节点标准弦图 (PEO: [4, 3, 2, 1, 0], 最大团: 3)', value: 'chordal_5node' },
      ],
    },
  ],
  codeLanguages: CHORDAL_GRAPH_MCS_CODES,
  generateSteps: () => buildChordalMCSSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderChordalMCSBoard(step.nodes, step.peo, step.deg, step.activePick, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #6d28d9;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">完美图性质</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">最大团 = 团数 = 色数</div>
          </div>
        </div>

        ${renderFormulaCard(
          '弦图与 PEO 完美消除序列定理',
          `PEO 准则: &forall; v_i，其在序列后继中相连邻居诱导子图为团 (完全图) | 最大团 &omega;(G) = 色数 &chi;(G) | MCS 复杂度: O(N + M)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
