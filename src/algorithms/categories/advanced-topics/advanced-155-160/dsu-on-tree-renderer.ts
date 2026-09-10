/**
 * Class 158: 树上启发式合并 (DSU on Tree)
 * CF600E Lomsat gelh / 树上重链调度与 O(N log N) 离线优雅统计
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { DSU_ON_TREE_CODES, DSU_ON_TREE_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, DSUColorBucketView, renderDSUOnTreeBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DSUStep extends Advanced155Step {
  curNode: number;
  heavySon: number;
  buckets: DSUColorBucketView[];
  ansMap: Record<number, number>;
}

export function buildDSUSteps(): DSUStep[] {
  const steps: DSUStep[] = [];
  const lines = DSU_ON_TREE_LINES;

  // 节点颜色配置: 1:C1, 2:C2, 3:C1, 4:C2, 5:C3
  // 树拓扑: 1 的重儿子是 2 (大小 3)，轻儿子是 3 (大小 1)
  const bucketsMap = new Map<number, number>();
  const ansMap: Record<number, number> = {};

  const getBucketsView = (): DSUColorBucketView[] => {
    return Array.from(bucketsMap.entries()).map(([color, count]) => ({ color, count }));
  };

  // Step 0: 入口
  steps.push({
    curNode: 1,
    heavySon: 2,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `主函数入口：开始对树执行 DSU on Tree 启发式合并，求解各子树出现频次最高颜色的编号`,
    message: `树形分析：根节点 1 的重儿子为节点 2 (子树大小 3)，轻儿子为节点 3 (子树大小 1)`,
    log: `enter dsuOnTree(root=1)`,
    codeLine: lines.entry,
    metrics: { '根节点': 1, '重儿子': 2, '轻儿子': 3 },
  });

  // Step 1: 处理轻儿子 3 (keep = false)
  bucketsMap.set(1, 1);
  ansMap[3] = 1;
  steps.push({
    curNode: 3,
    heavySon: 0,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `处理轻儿子 3 (keep = false)：统计节点 3 的颜色 1，得出子树 3 答案为颜色 1`,
    message: `因为是轻儿子，在回溯前必须将桶计数全部清空，避免对其他兄弟子树产生脏数据污染`,
    log: `dsuLight: node=3`,
    codeLine: lines.lightDsu,
    statusBadge: { text: '轻儿子子树 3 统计中', type: 'info' },
    metrics: { '当前处理': '轻儿子 3', '保留标记 keep': 'false' },
  });

  // 清空轻儿子 3 的贡献
  bucketsMap.clear();
  steps.push({
    curNode: 3,
    heavySon: 0,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `轻儿子 3 回溯：彻底清除颜色 1 的计数，全局计数桶重置为空`,
    message: `满足 DSU on Tree 轻儿子不保留全局贡献的铁律`,
    log: `clearLight: node=3`,
    codeLine: lines.clearKeep,
    metrics: { '全局桶状态': '已清空' },
  });

  // Step 2: 处理重儿子 2 (keep = true)
  bucketsMap.set(2, 2); // 节点 2 和 节点 4 的颜色 2
  bucketsMap.set(3, 1); // 节点 5 的颜色 3
  ansMap[2] = 2; // 出现最多的颜色为 2
  steps.push({
    curNode: 2,
    heavySon: 0,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `处理重儿子 2 (keep = true)：子树节点 (2, 4, 5) 颜色计入全局桶 (颜色 2 出现 2 次，颜色 3 出现 1 次)`,
    message: `由于是重儿子，子树统计信息【直接保留在全局桶中】，免除重复清空与重复遍历的开销！`,
    log: `dsuHeavy: node=2, keep=true`,
    codeLine: lines.heavyDsu,
    statusBadge: { text: '重儿子子树 2 贡献已保留', type: 'success' },
    metrics: { '当前处理': '重儿子 2', '保留标记 keep': 'true', '最高频颜色': 2 },
  });

  // Step 3: 暴力并入轻儿子 3 与根节点 1
  bucketsMap.set(1, (bucketsMap.get(1) || 0) + 2); // 节点 1(颜色 1) + 节点 3(颜色 1)
  ansMap[1] = 1; // 颜色 1 频次达到 2 次，最高频为 1 和 2
  steps.push({
    curNode: 1,
    heavySon: 2,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `并入轻儿子 3 与根节点 1：轻儿子节点 3 与根 1 的颜色 1 并入全局桶，当前颜色 1 达到 2 次`,
    message: `重儿子已经就位，只需遍历轻儿子所有节点合并，每个节点向上跳轻边至多 log N 次，全局稳定 O(N log N)`,
    log: `mergeLightIntoRoot: root=1`,
    codeLine: lines.mergeLight,
    statusBadge: { text: '轻儿子成功并入根节点', type: 'info' },
    metrics: { '全局桶大小': bucketsMap.size, '根节点 1 统计完成': '是' },
  });

  // 终态
  steps.push({
    curNode: 1,
    heavySon: 2,
    buckets: getBucketsView(),
    ansMap: { ...ansMap },
    decision: `🎉 树上启发式合并执行完毕：全树各节点离线询问在 O(N log N) 内全部求出`,
    message: `相较于树上莫队与线段树合并，DSU on Tree 具备极致小常数与超短代码量优势`,
    log: `returnAns: complete`,
    codeLine: lines.entry,
    statusBadge: { text: 'DSU on Tree 统计圆满完成', type: 'success' },
    metrics: { '全树规模': 5, '时间复杂度': 'O(N log N)' },
  });

  return steps;
}

export const dsuOnTreeVisualizer = registerDeclarativeAlgorithm<DSUStep>({
  id: 'dsu-on-tree-158',
  name: '树上启发式合并 DSU on Tree (Class 158)',
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 158,
  description: '左程云算法通关课 Class 158：树上启发式合并 (DSU on Tree)。轻儿子清空、重儿子保留，O(N log N) 优雅解决树上子树无修改离线统计。',
  learningGoal: '深刻理解轻重儿子差别对待调度策略，掌握重儿子保留全局桶与轻儿子暴力并入的均摊 O(N log N) 证明',
  problemHtml: ADVANCED_155_160_PROBLEMS.dsuOnTree.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.dsuOnTree.html,
  inputs: [
    {
      id: 'demoScenario',
      label: '树上启发式场景',
      type: 'select',
      defaultValue: 'standard_dsu',
      options: [
        { label: '5 节点颜色树 (轻儿子 3 清空，重儿子 2 保留)', value: 'standard_dsu' },
      ],
    },
  ],
  codeLanguages: DSU_ON_TREE_CODES,
  generateSteps: () => {
    return buildDSUSteps();
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderDSUOnTreeBoard(step.curNode, step.heavySon, step.buckets, step.ansMap)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前统计核心节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">Node ${step.curNode}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">已求出答案节点数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${Object.keys(step.ansMap).length} 个节点</div>
          </div>
        </div>

        ${renderFormulaCard(
          'DSU on Tree 启发式调度引擎',
          `轻儿子策略: 递归并清空桶 (keep=false) | 重儿子策略: 递归并直接保留桶 (keep=true) | 均摊时间: O(N log N)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
