/**
 * Class 175: 二分图最大匹配与匈牙利算法 (Hungarian Algorithm)
 * 增广路交替轨 DFS / 洛谷 P3386 【模板】二分图最大匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { HUNGARIAN_MATCHING_CODES, HUNGARIAN_MATCHING_LINES } from './advanced-173-178-stage-codes';
import { Advanced173Step, renderHungarianBoard } from './advanced-173-178-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface HungarianStep extends Advanced173Step {
  nLeft: number;
  nRight: number;
  edges: { u: number; v: number }[];
  matchRight: number[];
  activeLeft: number;
  stage: string;
}

export function buildHungarianSteps(): HungarianStep[] {
  const steps: HungarianStep[] = [];
  const lines = HUNGARIAN_MATCHING_LINES;

  const nLeft = 3;
  const nRight = 3;
  const edges = [
    { u: 0, v: 0 },
    { u: 0, v: 1 },
    { u: 1, v: 0 },
    { u: 1, v: 2 },
    { u: 2, v: 1 },
  ];

  let match = [-1, -1, -1];

  // Step 0: 入口帧
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: -1,
    stage: '准备二分图匹配',
    decision: `主函数入口：开始在包含 ${nLeft} 个左部点与 ${nRight} 个右部点的二分图中计算最大匹配`,
    message: `利用交替路与增广链翻转，寻找使得没有两条匹配边共享公共顶点的最大边集合`,
    log: `enter hungarian: nL=3, nR=3`,
    codeLine: lines.entry,
    metrics: { '左部点数': nLeft, '右部点数': nRight, '可选边数': edges.length, '初始匹配': 0 },
  });

  // Step 1: 处理左部点 U0 (U0 与 V0 直连成功)
  match[0] = 0;
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 0,
    stage: '为左部点 U0 寻增广路',
    decision: `U0 尝试与未配对的 V0 配对：V0 当前空闲，直接达成匹配 U0 <-> V0`,
    message: `匹配数提升至 1`,
    log: `match: U0 -> V0`,
    codeLine: lines.reassign,
    statusBadge: { text: '匹配 U0 <-> V0', type: 'info' },
    metrics: { '当前匹配数': 1, '当前增广点': 'U0' },
  });

  // Step 2: 处理左部点 U1 (U1 协商 V0，U0 腾挪至 V1)
  match[1] = 0; // U0 挪到 V1
  match[0] = 1; // U1 拿到 V0
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 1,
    stage: '为左部点 U1 寻增广路 (伴侣腾挪协商)',
    decision: `U1 尝试配对 V0：V0 已有伴侣 U0；递归要求 U0 寻找替代，U0 成功挪窝至空闲点 V1！`,
    message: `达成增广轨翻转：原边 U0-V0 变为 U1-V0，新增 U0-V1，匹配数提升至 2`,
    log: `reassign: U1->V0, U0->V1`,
    codeLine: lines.reassign,
    statusBadge: { text: '增广翻转成功 (匹配 2)', type: 'warning' },
    metrics: { '当前匹配数': 2, '增广链': 'U1 -> V0 -> U0 -> V1' },
  });

  // Step 3: 处理左部点 U2 (链式传递腾挪：U2 争 V1，U0 争 V0，U1 挪到 V2)
  match[2] = 1; // U1 挪到 V2
  match[0] = 0; // U0 挪回 V0
  match[1] = 2; // U2 拿到 V1
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 2,
    stage: '为左部点 U2 寻增广路 (多级链式交替腾挪)',
    decision: `U2 尝试配对 V1 (伴侣 U0) &rarr; U0 尝试配对 V0 (伴侣 U1) &rarr; U1 成功找到空闲点 V2！`,
    message: `整条交替路 U2 -> V1 -> U0 -> V0 -> U1 -> V2 状态全面反转，所有左部点全部完美配对！`,
    log: `reassignChain: U2->V1, U0->V0, U1->V2`,
    codeLine: lines.reassign,
    statusBadge: { text: '完美匹配达成 (匹配 3)', type: 'success' },
    metrics: { '当前匹配数': 3, '交替轨长度': 5 },
  });

  // Step 4: 终态
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: -1,
    stage: '二分图最大匹配全部完成',
    decision: `🎉 匈牙利算法计算完成：二分图最大匹配数为 3 (完美匹配)`,
    message: `匹配方案为：U0 <-> V0, U1 <-> V2, U2 <-> V1。根据 König 定理，最小点覆盖数亦为 3`,
    log: `returnAns: matches=3`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'MaxMatch = 3', type: 'success' },
    metrics: { '最大匹配数': 3, '最小点覆盖数': 3, '独立集大小': 3 },
  });

  return steps;
}

export const hungarianMatchingVisualizer = registerDeclarativeAlgorithm<HungarianStep>({
  id: 'hungarian-matching-175',
  name: '二分图最大匹配 匈牙利算法 (Class 175)',
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 175,
  description: '左程云算法通关课 Class 175：二分图最大匹配与匈牙利算法。交替轨与增广路翻转，DFS 伴侣腾挪协商机制，König 定理与最小点覆盖。',
  learningGoal: '掌握增广路交替轨核心性质，深刻理解已匹配顶点的递归让位机制与最大匹配与最小割的等价性',
  problemHtml: ADVANCED_173_178_PROBLEMS.hungarianMatching.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.hungarianMatching.html,
  inputs: [
    {
      id: 'preset',
      label: '二分图关系预设',
      type: 'select',
      defaultValue: 'bipartite_3x3',
      options: [
        { label: '3x3 二分图全链交替示例 (最大匹配: 3)', value: 'bipartite_3x3' },
      ],
    },
  ],
  codeLanguages: HUNGARIAN_MATCHING_CODES,
  generateSteps: () => buildHungarianSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderHungarianBoard(step.nLeft, step.nRight, step.edges, step.matchRight, step.activeLeft, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">König 定理</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">最大匹配 = 最小点覆盖</div>
          </div>
        </div>

        ${renderFormulaCard(
          '匈牙利增广路定理',
          `增广路定义: 起点与终点均未匹配的交替路 | 增广反转: 匹配边与未匹配边状态对调 &rArr; 匹配数 + 1 | 充要条件: 不存在增广路即为最大匹配`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
