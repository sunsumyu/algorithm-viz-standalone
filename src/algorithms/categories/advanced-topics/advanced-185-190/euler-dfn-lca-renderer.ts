/**
 * Class 185: 欧拉序与 DFN 序求 LCA (Euler Tour & DFN Order LCA)
 * 欧拉序 + 深度 RMQ + ST 表 O(1) 求解 / 洛谷 P3379 【模板】最近公共祖先
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EULER_DFN_LCA_CODES, EULER_DFN_LCA_LINES } from './advanced-185-190-stage-codes';
import { Advanced185Step, renderEulerDfnBoard } from './advanced-185-190-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface EulerDfnStep extends Advanced185Step {
  nodes: number[];
  eulerTour: number[];
  firstPos: Record<number, number>;
  u: number;
  v: number;
  lca: number;
  stage: string;
}

export function buildEulerDfnSteps(): EulerDfnStep[] {
  const steps: EulerDfnStep[] = [];
  const lines = EULER_DFN_LCA_LINES;

  const nodes = [1, 2, 3, 4, 5];
  // 树结构：1 是根，2 和 3 是 1 的子节点，4 和 5 是 2 的子节点
  // 欧拉序 (进出都记录)：1 -> 2 -> 4 -> 2 -> 5 -> 2 -> 1 -> 3 -> 1
  const eulerTour = [1, 2, 4, 2, 5, 2, 1, 3, 1];
  const firstPos: Record<number, number> = {
    1: 0,
    2: 1,
    4: 2,
    5: 4,
    3: 7,
  };

  // Step 0: 入口帧
  steps.push({
    nodes,
    eulerTour,
    firstPos,
    u: 4,
    v: 5,
    lca: -1,
    stage: '欧拉序与 ST 表就绪',
    decision: `主函数入口：开始对节点 u=4 与节点 v=5 进行最近公共祖先 LCA 查询`,
    message: `欧拉序已生成 (长度 9)，ST 表已对欧拉序序列完成深度 RMQ 预处理`,
    log: `enter euler lca: u=4, v=5`,
    codeLine: lines.entry,
    metrics: { '查询节点 u': 4, '查询节点 v': 5, '欧拉序长度': 9 },
  });

  // Step 1: 获取首次出现下标 [firstPos[4]=2, firstPos[5]=4]
  steps.push({
    nodes,
    eulerTour,
    firstPos,
    u: 4,
    v: 5,
    lca: -1,
    stage: '锁定欧拉序列闭区间 [2, 4]',
    decision: `定位节点首次出现位置：firstPos[4] = 2, firstPos[5] = 4，查询区间为 [2, 4]`,
    message: `区间对应欧拉序列子段为 [4, 2, 5]，其间深度最小者必为两者最近公共祖先`,
    log: `find range: l=2, r=4 (sub-array: 4, 2, 5)`,
    codeLine: lines.firstPos,
    statusBadge: { text: '锁定区间 [2, 4]', type: 'info' },
    metrics: { '左端点 l': 2, '右端点 r': 4, '区间长度': 3 },
  });

  // Step 2: ST 表 O(1) 查询区间深度最小者
  steps.push({
    nodes,
    eulerTour,
    firstPos,
    u: 4,
    v: 5,
    lca: 2,
    stage: 'ST 表 O(1) 极值检索',
    decision: `ST 表常数时间比较：k = log2(4 - 2 + 1) = 1，重叠覆盖 [2, 3] 与 [3, 4]`,
    message: `在深度序列中 dep[2]=1 < dep[4]=2 且 < dep[5]=2，深度最小节点为 2`,
    log: `st table query: lca is node 2`,
    codeLine: lines.queryRMQ,
    statusBadge: { text: '锁定 LCA: 节点 2', type: 'success' },
    metrics: { 'LCA 结果': 2, '深度': 1, '查询耗时': 'O(1)' },
  });

  // Step 3: 终态返回
  steps.push({
    nodes,
    eulerTour,
    firstPos,
    u: 4,
    v: 5,
    lca: 2,
    stage: 'LCA 求解完成',
    decision: `🎉 欧拉序 LCA 查询完毕：LCA(4, 5) = 2`,
    message: `相比树上倍增 O(log N) 单次查询，欧拉序+RMQ 在极高频 LCA 查询场景 (如虚树构建、树上差分) 具有绝对的常数性能优势`,
    log: `return lca: 2`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'LCA(4, 5) = 2', type: 'success' },
    metrics: { '最终结果': 2, '时间复杂度': 'O(1)', '状态': '求解完成' },
  });

  return steps;
}

export const eulerDfnLcaVisualizer = registerDeclarativeAlgorithm<EulerDfnStep>({
  id: 'euler-dfn-lca-185',
  name: '欧拉序与 DFN 序求 LCA (Class 185)',
  category: 'tree',
  icon: '📜',
  difficulty: 3,
  levelOrder: 185,
  description: '左程云算法通关课 Class 185：欧拉序与 DFN 序求 LCA。欧拉序+深度 RMQ 将树上 LCA 转化为区间最值，ST 表预处理 O(N log N)，单次查询 O(1) 秒出祖先。',
  learningGoal: '掌握欧拉序展开机制、树上深度序列的区间极小值映射以及 O(1) 常数时间 LCA 检索',
  problemHtml: ADVANCED_185_190_PROBLEMS.eulerDfnLca.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.eulerDfnLca.html,
  inputs: [
    {
      id: 'preset',
      label: 'LCA 查询点对',
      type: 'select',
      defaultValue: 'lca_4_5',
      options: [
        { label: '查询 LCA(4, 5) -> 节点 2', value: 'lca_4_5' },
      ],
    },
  ],
  codeLanguages: EULER_DFN_LCA_CODES,
  generateSteps: () => buildEulerDfnSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderEulerDfnBoard(
          step.nodes,
          step.eulerTour,
          step.firstPos,
          step.u,
          step.v,
          step.lca,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">单次查询耗时</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">严格 O(1) 常数时间</div>
          </div>
        </div>

        ${renderFormulaCard(
          '欧拉序 RMQ LCA 核心映射',
          'LCA(u, v) = argmin_{i in [pos[u], pos[v]]} dep[euler[i]]',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
