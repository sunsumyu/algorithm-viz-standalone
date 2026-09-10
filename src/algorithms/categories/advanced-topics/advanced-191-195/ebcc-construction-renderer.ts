/**
 * Class 191: 边双连通缩点与加边构造 (e-BCC Construction)
 * Tarjan 边双缩点成树 + 叶子匹配消除割边 / 洛谷 P2860 [USACO06JAN] Redundant Paths
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { EBCC_CONSTRUCTION_CODES, EBCC_CONSTRUCTION_LINES } from './advanced-191-195-stage-codes';
import { Advanced191Step, renderEBCCConstructionBoard } from './advanced-191-195-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface EBCCConstructionStep extends Advanced191Step {
  bccs: number[];
  bccDegrees: Record<number, number>;
  leafBCCs: number[];
  addedEdges: { u: number; v: number }[];
  minAdded: number;
  stage: string;
}

export function buildEBCCConstructionSteps(): EBCCConstructionStep[] {
  const steps: EBCCConstructionStep[] = [];
  const lines = EBCC_CONSTRUCTION_LINES;

  const bccs = [1, 2, 3, 4];
  // 缩点树拓扑：中心为 2，连接三个叶子 1, 3, 4 (度数: deg[1]=1, deg[2]=3, deg[3]=1, deg[4]=1)
  // 叶子数 = 3，最少加边 = ceil(3 / 2) = 2

  // Step 0: 入口帧
  steps.push({
    bccs,
    bccDegrees: { 1: 0, 2: 0, 3: 0, 4: 0 },
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: '原图初始化与 Tarjan 准备',
    decision: `主函数入口：开始计算使无向连通图变为边双连通图的最少加边数`,
    message: `首先运行 Tarjan 算法缩点，所有极大边双连通块缩为巨点，割边作为连接边重构为无向树`,
    log: `enter ebcc construction: n=7, m=7`,
    codeLine: lines.entry,
    metrics: { '缩点块数': 4, '目标': '消灭所有割边' },
  });

  // Step 1: Tarjan 缩点成树
  steps.push({
    bccs,
    bccDegrees: { 1: 0, 2: 0, 3: 0, 4: 0 },
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: 'Tarjan 边双缩点成树',
    decision: `Tarjan 算法执行完毕：原图成功聚类为 4 个边双连通块，缩点图是一棵以 BCC_2 为中心的星形树`,
    message: `树中共有 3 条割边连接 (1-2), (2-3), (2-4)`,
    log: `tarjan completed: 4 bccs, 3 bridges`,
    codeLine: lines.tarjanEBCC,
    statusBadge: { text: '缩点成树完成', type: 'info' },
    metrics: { '缩点分量': 4, '割边数': 3 },
  });

  // Step 2: 统计各缩点块树上度数
  const bccDegrees = { 1: 1, 2: 3, 3: 1, 4: 1 };
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: '统计割边在各 BCC 上的度数',
    decision: `遍历所有割边累加度数：deg[1]=1, deg[2]=3, deg[3]=1, deg[4]=1`,
    message: `度数为 1 的节点意味着其仅有一条桥通往外界，正是导致图脆弱的叶子瓶颈`,
    log: `degrees counted: deg[2]=3, others=1`,
    codeLine: lines.countDegree,
    statusBadge: { text: '度数统计完毕', type: 'info' },
    metrics: { '中心块度数': 3, '其它块度数': 1 },
  });

  // Step 3: 锁定叶子节点并计算最少加边数
  const leafBCCs = [1, 3, 4];
  const minAdded = Math.floor((leafBCCs.length + 1) / 2); // 2
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges: [],
    minAdded,
    stage: '锁定叶子节点集合并套用定理',
    decision: `锁定度数等于 1 的叶子块：{BCC_1, BCC_3, BCC_4}，共 3 个叶子`,
    message: `应用叶子消除定理：最少需添加边数 = ceil(3 / 2) = 2 条边`,
    log: `leaves identified: [1, 3, 4], minAdded=2`,
    codeLine: lines.calcLeaves,
    statusBadge: { text: '最少需添 2 条边', type: 'warning' },
    metrics: { '叶子总数': 3, '最少添边': 2 },
  });

  // Step 4: 贪心交叉添边
  const addedEdges = [
    { u: 1, v: 3 },
    { u: 4, v: 2 }, // 或者 4 连向树干
  ];
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges,
    minAdded,
    stage: '输出最优加边构造方案',
    decision: `构造连边：在 BCC_1 与 BCC_3 之间添加新边，在 BCC_4 与 BCC_2 之间添加新边`,
    message: `所有叶子均被大环包裹，整张树的割边被全量消除，任意两点间连通度提升至 2`,
    log: `added edges: (1-3) and (4-2)`,
    codeLine: lines.returnAns,
    statusBadge: { text: '全图变为边双连通', type: 'success' },
    metrics: { '添加边数': 2, '全图边双连通': '达成' },
  });

  // Step 5: 终态返回
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges,
    minAdded,
    stage: '边双构造求解完成',
    decision: `🎉 边双连通图改造完成：最少只需添加 2 条边即可使全图无任何割边`,
    message: `该定理揭示了树形瓶颈消除的数学本质，时间复杂度严格等同于单次 Tarjan 遍历 O(V + E)`,
    log: `return minAdded: 2`,
    codeLine: lines.returnAns,
    statusBadge: { text: '答案: 2', type: 'success' },
    metrics: { '最终答案': 2, '算法复杂度': 'O(V + E)', '状态': '求解完成' },
  });

  return steps;
}

export const ebccConstructionVisualizer = registerDeclarativeAlgorithm<EBCCConstructionStep>({
  id: 'ebcc-construction-191',
  name: '边双连通缩点与加边构造 (Class 191)',
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 191,
  description: '左程云算法通关课 Class 191：边双连通缩点与加边构造。Tarjan 缩点为树，统计叶子节点数 L，最少添加 ceil(L/2) 条边使全图变为边双连通图。',
  learningGoal: '掌握无向图边双缩点成树的性质、叶子度数判定与 ceil(L/2) 最优连边数学证明',
  problemHtml: ADVANCED_191_195_PROBLEMS.ebccConstruction.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.ebccConstruction.html,
  inputs: [
    {
      id: 'preset',
      label: '缩点树结构预设',
      type: 'select',
      defaultValue: 'tree_3leaves',
      options: [
        { label: '3 叶子星形树 (最少加边: 2 条)', value: 'tree_3leaves' },
      ],
    },
  ],
  codeLanguages: EBCC_CONSTRUCTION_CODES,
  generateSteps: () => buildEBCCConstructionSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderEBCCConstructionBoard(
          step.bccs,
          step.bccDegrees,
          step.leafBCCs,
          step.addedEdges,
          step.minAdded,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最优添边定理</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">一加两消：ceil(L / 2)</div>
          </div>
        </div>

        ${renderFormulaCard(
          '边双连通改造核心定理',
          'text{最少添加边数} = \\lceil \\frac{L}{2} \\rceil = \\lfloor \\frac{L + 1}{2} \\rfloor',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
