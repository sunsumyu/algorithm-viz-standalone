/**
 * Class 192: 虚点优化建图与虚拟源汇 (Virtual Nodes Graph Construction)
 * 集合间中转虚点 + 边数爆炸降维 / 洛谷 P1983 车站分级
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { VIRTUAL_NODES_CODES, VIRTUAL_NODES_LINES } from './advanced-191-195-stage-codes';
import { Advanced191Step, renderVirtualNodesBoard } from './advanced-191-195-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface VirtualNodesStep extends Advanced191Step {
  setA: number[];
  setB: number[];
  vMid: number;
  edgeCountOld: number;
  edgeCountNew: number;
  stage: string;
}

export function buildVirtualNodesSteps(): VirtualNodesStep[] {
  const steps: VirtualNodesStep[] = [];
  const lines = VIRTUAL_NODES_LINES;

  const setA = [1, 2, 3];
  const setB = [4, 5, 6, 7];
  const edgeCountOld = setA.length * setB.length; // 12
  const edgeCountNew = setA.length + setB.length; // 7

  // Step 0: 入口帧
  steps.push({
    setA,
    setB,
    vMid: 0,
    edgeCountOld,
    edgeCountNew: 0,
    stage: '集合连边需求分析',
    decision: `主函数入口：集合 Set A (3 个点) 需要向集合 Set B (4 个点) 全部连边`,
    message: `朴素完全二分连接需要 3 * 4 = 12 条有向边；在多次批量操作下极易导致边数超过上限`,
    log: `set A size=3, set B size=4, old edges=12`,
    codeLine: lines.entry,
    metrics: { 'Set A 大小': 3, 'Set B 大小': 4, '朴素边数': 12 },
  });

  // Step 1: 创建虚拟中转点 V_mid
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 0,
    stage: '创建虚拟辅助节点 V_8',
    decision: `执行 int vMid = ++totalNodes：在图中动态开辟一个虚拟中转节点 V_8`,
    message: `V_8 不对应现实中的实体，仅作为信息流动的高速汇聚与分发中继`,
    log: `created virtual node: vMid=8`,
    codeLine: lines.createVMid,
    statusBadge: { text: '创建中转虚点 V_8', type: 'info' },
    metrics: { '虚拟节点编号': 8, '角色': '全连边中转站' },
  });

  // Step 2: 集合 A 向虚点连边 (权重 0)
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 3,
    stage: 'Set A 统一汇聚至虚点 (3 条边)',
    decision: `建立流入边：A1 -> V_8, A2 -> V_8, A3 -> V_8，边权均为 0`,
    message: `只需 3 条边即可让 A 集合的全体势能无损汇流至虚拟中转站`,
    log: `linked set A -> vMid (3 edges)`,
    codeLine: lines.connectA,
    statusBadge: { text: 'Set A 流入边构建完成', type: 'warning' },
    metrics: { '已建边数': 3, '边类型': '无权流入' },
  });

  // Step 3: 虚点向集合 B 分发连边 (权重 w)
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 7,
    stage: '虚点统一分发至 Set B (4 条边)',
    decision: `建立流出边：V_8 分别向 B4, B5, B6, B7 连边，边权均为目标权值 w`,
    message: `只需 4 条边即可将中转站信息精准广播给整个目标集合`,
    log: `linked vMid -> set B (4 edges)`,
    codeLine: lines.connectB,
    statusBadge: { text: '虚点优化降维完成', type: 'success' },
    metrics: { '总建边数': 7, '节省边数': 5 },
  });

  // Step 4: 终态返回
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 7,
    stage: '建图优化完成',
    decision: `🎉 虚点优化建图完毕：成功将乘积级 12 条边降解为线性加和级 7 条边`,
    message: `若两个集合规模各为 1000，朴素建边达 1,000,000 条 (炸内存)，虚点优化仅需 2,000 条，性能提升千倍`,
    log: `virtual nodes construction finished: 12 -> 7 edges`,
    codeLine: lines.connectB,
    statusBadge: { text: '边数由乘法变加法', type: 'success' },
    metrics: { '朴素边数': 12, '优化边数': 7, '复杂度': 'O(|A| + |B|)' },
  });

  return steps;
}

export const virtualNodesConstructionVisualizer = registerDeclarativeAlgorithm<VirtualNodesStep>({
  id: 'virtual-nodes-construction-192',
  name: '虚点优化建图与虚拟源汇 (Class 192)',
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 192,
  description: '左程云算法通关课 Class 192：虚点优化建图与虚拟源汇。集合向集合全连边引发边数爆炸，引入虚拟中转节点将 O(|A|*|B|) 边数降维为 O(|A|+|B|)。',
  learningGoal: '深刻理解中转虚点解耦两集合全连接的机制，掌握虚拟源汇在拓扑排序、网络流与最短路中的应用',
  problemHtml: ADVANCED_191_195_PROBLEMS.virtualNodesConstruction.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.virtualNodesConstruction.html,
  inputs: [
    {
      id: 'preset',
      label: '集合规模预设',
      type: 'select',
      defaultValue: 'set_3_4',
      options: [
        { label: 'Set A (3点) -> Set B (4点): 12边降至7边', value: 'set_3_4' },
      ],
    },
  ],
  codeLanguages: VIRTUAL_NODES_CODES,
  generateSteps: () => buildVirtualNodesSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderVirtualNodesBoard(
          step.setA,
          step.setB,
          step.vMid,
          step.edgeCountOld,
          step.edgeCountNew,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">复杂度降维</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">O(|A| * |B|) => O(|A| + |B|)</div>
          </div>
        </div>

        ${renderFormulaCard(
          '虚点建图降维核心准则',
          'E_{naive} = |A| \\times |B| \\implies E_{virtual} = |A| + |B|, \\quad \\text{节省 } (|A|-1)(|B|-1) \\text{ 条边}',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
