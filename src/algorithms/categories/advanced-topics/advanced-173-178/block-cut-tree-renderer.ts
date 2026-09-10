/**
 * Class 178: 圆方树 (Block-Cut Tree / Cactus & BCC)
 * 点双连通分量缩点 / 洛谷 P5236 【模板】静态仙人掌 / 洛谷 P4630 铁人两项
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { BLOCK_CUT_TREE_CODES, BLOCK_CUT_TREE_LINES } from './advanced-173-178-stage-codes';
import { Advanced173Step, BlockCutBlockView, renderBlockCutBoard } from './advanced-173-178-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface BlockCutStep extends Advanced173Step {
  origNodes: number[];
  blocks: BlockCutBlockView[];
  cutVertices: number[];
  stage: string;
}

export function buildBlockCutSteps(): BlockCutStep[] {
  const steps: BlockCutStep[] = [];
  const lines = BLOCK_CUT_TREE_LINES;

  const origNodes = [1, 2, 3, 4, 5];
  // 图由两个环在割点 3 处拼接: {1, 2, 3} 与 {3, 4, 5}
  const blocks: BlockCutBlockView[] = [];

  // Step 0: 入口帧
  steps.push({
    origNodes,
    blocks: [],
    cutVertices: [],
    stage: '主函数入口',
    decision: `主函数入口：开始对 5 节点图进行 Tarjan 点双连通分量 (BCC) 分解并构建圆方树`,
    message: `原图圆点包含 1~5，环结构将在 Tarjan 回溯时缩成方点，割点成为连通多个方点的枢纽圆点`,
    log: `enter tarjanBCT: nodes=5`,
    codeLine: lines.entry,
    metrics: { '原图顶点': 5, '分析模型': '极大点双连通分量' },
  });

  // Step 1: 发现第一个点双连通分量 BCC 1: {1, 2, 3}
  blocks.push({
    squareId: 1,
    circleMembers: [1, 2, 3],
  });
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [],
    stage: '发现点双分量 BCC #1',
    decision: `Tarjan 检索判定 low[2] >= dfn[1]：栈内弹出节点 1, 2, 3，构成极大点双分量 BCC #1`,
    message: `新建方点 S1，圆方树连边 (S1-V1), (S1-V2), (S1-V3)`,
    log: `bccFound: S1 -> {1, 2, 3}`,
    codeLine: lines.bccFound,
    statusBadge: { text: '建立方点 S1', type: 'info' },
    metrics: { '已建立方点': 1, '当前点双成员': 'V1, V2, V3' },
  });

  // Step 2: 发现第二个点双连通分量 BCC 2: {3, 4, 5}
  blocks.push({
    squareId: 2,
    circleMembers: [3, 4, 5],
  });
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [3],
    stage: '发现点双分量 BCC #2 (确定割点 3)',
    decision: `Tarjan 检索判定 low[4] >= dfn[3]：栈内弹出 4, 5，与 3 构成极大点双分量 BCC #2`,
    message: `新建方点 S2，圆方树连边 (S2-V3), (S2-V4), (S2-V5)。由于 V3 同时连接 S1 与 S2，判定 V3 为全图割点！`,
    log: `bccFound: S2 -> {3, 4, 5}, cutNode=3`,
    codeLine: lines.addSquare,
    statusBadge: { text: '建立方点 S2 (确定割点 V3)', type: 'warning' },
    metrics: { '已建立方点': 2, '全图割点': 'V3', '当前点双成员': 'V3, V4, V5' },
  });

  // Step 3: 终态返回
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [3],
    stage: '圆方树构建全部完成',
    decision: `🎉 圆方树构建完成：原图成功转化为无环树状二分图`,
    message: `圆方树性质：任意两圆点间在原图中的所有简单路径点集交集，等价于圆方树树上路径的所有圆点，树上倍增 LCA 直接秒解！`,
    log: `returnAns: totalSquares=2, cut=[3]`,
    codeLine: lines.returnAns,
    statusBadge: { text: '圆方二分树构建成功', type: 'success' },
    metrics: { '圆点数': 5, '方点数': 2, '割点集合': 'V3', '树上结构': '严格二分树' },
  });

  return steps;
}

export const blockCutTreeVisualizer = registerDeclarativeAlgorithm<BlockCutStep>({
  id: 'block-cut-tree-178',
  name: '圆方树 Block-Cut Tree (Class 178)',
  category: 'graph',
  icon: '🌵',
  difficulty: 3,
  levelOrder: 178,
  description: '左程云算法通关课 Class 178：圆方树 (Block-Cut Tree)。Tarjan 点双连通分量 (BCC) 缩点成方点，割点连接多方点，将仙人掌图与无向图降维为树。',
  learningGoal: '掌握极大点双连通分量判定准则与栈内节点弹出机制，深刻理解圆方树将图上路径交集转化为树上路径的代数映射',
  problemHtml: ADVANCED_173_178_PROBLEMS.blockCutTree.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.blockCutTree.html,
  inputs: [
    {
      id: 'preset',
      label: '图拓扑预设',
      type: 'select',
      defaultValue: 'cactus_two_rings',
      options: [
        { label: '双环仙人掌图 (2 个 BCC 环交于割点 V3)', value: 'cactus_two_rings' },
      ],
    },
  ],
  codeLanguages: BLOCK_CUT_TREE_CODES,
  generateSteps: () => buildBlockCutSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderBlockCutBoard(step.origNodes, step.blocks, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">降维打击能力</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">仙人掌/一般图 &rarr; 树上倍增</div>
          </div>
        </div>

        ${renderFormulaCard(
          '圆方树拓扑与路径映射定理',
          `圆点: 原图所有顶点 | 方点: 原图极大点双连通分量 (BCC) | 连边: 方点向所属 BCC 内所有圆点连边 | 简单路径交集 &equiv; 树上圆点路径`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
