/**
 * Class 193: 前缀与后缀优化建图 (Prefix/Suffix Graph Optimization)
 * 前缀辅助链 + 传递推导 + 区间互斥线性化 / CF 1215F
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { PREFIX_SUFFIX_GRAPH_CODES, PREFIX_SUFFIX_GRAPH_LINES } from './advanced-191-195-stage-codes';
import { Advanced191Step, renderPrefixSuffixBoard } from './advanced-191-195-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PrefixSuffixStep extends Advanced191Step {
  originNodes: number[];
  prefixNodes: number[];
  stage: string;
}

export function buildPrefixSuffixSteps(): PrefixSuffixStep[] {
  const steps: PrefixSuffixStep[] = [];
  const lines = PREFIX_SUFFIX_GRAPH_LINES;

  const originNodes = [1, 2, 3, 4];
  const prefixNodes = [5, 6, 7, 8];

  // Step 0: 入口帧
  steps.push({
    originNodes,
    prefixNodes: [0, 0, 0, 0],
    stage: '前缀优化建图需求分析',
    decision: `主函数入口：序列包含 4 个元素，存在前缀排他约束 (若选 X_i，则前缀 [1..i-1] 中不能选任何元素)`,
    message: `朴素两两连互斥边需要 O(N^2) 条边；引入前缀虚点链仅需 O(N) 条边`,
    log: `enter prefix graph: n=4`,
    codeLine: lines.entry,
    metrics: { '原变量数': 4, '朴素互斥边': 6 },
  });

  // Step 1: 为每个原变量开辟对应的前缀虚点
  steps.push({
    originNodes,
    prefixNodes,
    stage: '建立前缀虚点 Pre_5..Pre_8',
    decision: `为每个前缀开辟虚点：Pre_5 (代表[1]), Pre_6 (代表[1..2]), Pre_7 (代表[1..3]), Pre_8 (代表[1..4])`,
    message: `前缀虚点具有包含关系，前缀 [1..i] 被激活天然蕴含前缀 [1..i-1] 的所有约束`,
    log: `created prefix nodes: [5, 6, 7, 8]`,
    codeLine: lines.createPrefix,
    statusBadge: { text: '前缀虚点就绪', type: 'info' },
    metrics: { '前缀点数': 4, '虚拟节点': 'Pre_5 ~ Pre_8' },
  });

  // Step 2: 原点连入前缀虚点 (X_i -> Pre_i)
  steps.push({
    originNodes,
    prefixNodes,
    stage: '原点绑定至对应前缀虚点',
    decision: `建立映射边：X1 -> Pre_5, X2 -> Pre_6, X3 -> Pre_7, X4 -> Pre_8`,
    message: `只要任意原点 X_i 被选取，立即无损触发其对应的前缀激活状态`,
    log: `linked X_i -> Pre_i`,
    codeLine: lines.linkOrigin,
    statusBadge: { text: '完成原点向虚点投射', type: 'warning' },
    metrics: { '投射边数': 4, '映射比例': '1:1' },
  });

  // Step 3: 构造前缀传递链 (Pre_{i-1} -> Pre_i)
  steps.push({
    originNodes,
    prefixNodes,
    stage: '构建前缀单向传递链',
    decision: `连边 Pre_5 -> Pre_6 -> Pre_7 -> Pre_8：将前缀状态按顺序向后单向传递`,
    message: `前缀传递链保证了信息只需沿链条流动，任意区间互斥只需一次性桥接至对应前缀端点`,
    log: `chain passed: Pre_5 -> Pre_6 -> Pre_7 -> Pre_8`,
    codeLine: lines.chainPass,
    statusBadge: { text: '前缀单向链闭环', type: 'success' },
    metrics: { '链边数': 3, '总边数': 7 },
  });

  // Step 4: 终态完成
  steps.push({
    originNodes,
    prefixNodes,
    stage: '前缀优化建图完成',
    decision: `🎉 前缀优化建图构造完成：以 O(N) 的线性边数完美实现任意区间推导与互斥`,
    message: `后缀优化建图同理逆向展开；结合 2-SAT 问题，前缀优化建图是解决“序列至多选一”或“区间互斥”的标准武器`,
    log: `prefix graph completed: total edges O(N)`,
    codeLine: lines.chainPass,
    statusBadge: { text: '线性复杂度达成', type: 'success' },
    metrics: { '时间复杂度': 'O(N)', '空间复杂度': 'O(N)', '状态': '求解完成' },
  });

  return steps;
}

export const prefixSuffixGraphVisualizer = registerDeclarativeAlgorithm<PrefixSuffixStep>({
  id: 'prefix-suffix-graph-193',
  name: '前缀与后缀优化建图 (Class 193)',
  category: 'graph',
  icon: '⛓️',
  difficulty: 3,
  levelOrder: 193,
  description: '左程云算法通关课 Class 193：前缀与后缀优化建图。前缀虚点链单向传递排他与蕴含关系，将连续区间互斥约束由 O(N^2) 降维为 O(N)。',
  learningGoal: '掌握前缀虚点定义、前缀链单向传递逻辑以及区间排他向点传递边转化的深层设计',
  problemHtml: ADVANCED_191_195_PROBLEMS.prefixSuffixGraph.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.prefixSuffixGraph.html,
  inputs: [
    {
      id: 'preset',
      label: '前缀链长度预设',
      type: 'select',
      defaultValue: 'chain_4',
      options: [
        { label: '4 点前缀传递链 (7 条边线性构建)', value: 'chain_4' },
      ],
    },
  ],
  codeLanguages: PREFIX_SUFFIX_GRAPH_CODES,
  generateSteps: () => buildPrefixSuffixSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPrefixSuffixBoard(
          step.originNodes,
          step.prefixNodes,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">传递连边机制</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">Pre[i-1] -> Pre[i] 单向传递</div>
          </div>
        </div>

        ${renderFormulaCard(
          '前缀优化建图线性复杂度',
          'E_{chain} = (N - 1) \\text{ 条链边} + N \\text{ 条映射边} = 2N - 1 = O(N)',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
