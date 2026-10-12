/**
 * Class 158: 树上启发式合并 (DSU on Tree) 步进推演编译器
 * 核心：轻儿子递归并清空桶 (keep=false)、重儿子递归并保留桶 (keep=true)、暴力合并轻儿子
 */

import { Advanced155Step, DSUColorBucketView } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { DSU_ON_TREE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-stage-codes';

export interface DSUStep extends Advanced155Step {
  curNode: number;
  heavySon: number;
  buckets: DSUColorBucketView[];
  ansMap: Record<number, number>;
}

export function buildDSUSteps(): DSUStep[] {
  const steps: DSUStep[] = [];
  const lines = DSU_ON_TREE_LINES;

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
  bucketsMap.set(2, 2);
  bucketsMap.set(3, 1);
  ansMap[2] = 2;
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
  bucketsMap.set(1, (bucketsMap.get(1) || 0) + 2);
  ansMap[1] = 1;
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
