/**
 * Class 151: 跳表 (SkipList) 步进推演编译器
 * 核心：多层链表、几何分布掷硬币层高分配与自顶向下逐层前驱定位
 */

import { Advanced149Step, SkipListNodeView } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { SKIPLIST_LINES } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-stage-codes';

export interface SkipListStep extends Advanced149Step {
  nodes: SkipListNodeView[];
  activeVal: number;
  currentLevel: number;
  maxLevel: number;
}

export function buildSkipListSteps(values: number[]): SkipListStep[] {
  const steps: SkipListStep[] = [];
  const lines = SKIPLIST_LINES;
  const maxLevel = 4;

  const nodes: SkipListNodeView[] = [];
  const cloneNodes = (): SkipListNodeView[] => nodes.map(n => ({ ...n }));

  // Step 0: 入口
  steps.push({
    nodes: cloneNodes(),
    activeVal: -1,
    currentLevel: maxLevel - 1,
    maxLevel,
    decision: `主函数入口：开始将数值序列 [${values.join(', ')}] 插入多层跳表 (SkipList)`,
    message: `跳表使用随机概率决定每个节点的层高，通过高层稀疏链表向右快速跳跃实现期望 O(log N) 的检索`,
    log: `enter SkipList insert sequence`,
    codeLine: lines.entry,
    metrics: { '最高层数': maxLevel, '待插入节点数': values.length },
  });

  // 固定的确定性层高映射（便于稳定复现与演示）
  const levelGen = (val: number, idx: number): number => {
    const fixedLevels = [1, 3, 2, 4, 1, 2, 3];
    return fixedLevels[idx % fixedLevels.length];
  };

  for (let idx = 0; idx < values.length; idx++) {
    const val = values[idx];

    // 1. 检索插入位置
    steps.push({
      nodes: cloneNodes(),
      activeVal: val,
      currentLevel: maxLevel - 1,
      maxLevel,
      decision: `开始在跳表中检索 ${val} 的插入位置：自顶层 Level ${maxLevel - 1} 向下逐层探测前驱`,
      message: `在每一层中，若当前节点的右侧节点小于 ${val} 则右移，否则下降到下一层记录前驱指针 update[i]`,
      log: `findPre: val=${val}`,
      codeLine: lines.findPre,
      metrics: { '插入值': val, '当前探测层': `Level ${maxLevel - 1}` },
    });

    // 2. 掷硬币随机层高
    const lv = levelGen(val, idx);
    steps.push({
      nodes: cloneNodes(),
      activeVal: val,
      currentLevel: lv - 1,
      maxLevel,
      decision: `掷硬币随机生成层高：节点 ${val} 获得层高 Level = ${lv}`,
      message: `以 1/2 的几何分布概率逐层提升，期望平均每个节点占用 2 个指针`,
      log: `randLevel: val=${val}, level=${lv}`,
      codeLine: lines.randLevel,
      metrics: { '获得层高': lv, '晋升概率': '1/2' },
    });

    // 3. 插入并建立每层的链接
    nodes.push({ val, levels: lv });
    nodes.sort((a, b) => a.val - b.val);

    steps.push({
      nodes: cloneNodes(),
      activeVal: val,
      currentLevel: lv - 1,
      maxLevel,
      decision: `完成节点 ${val} 在 Level 0 ~ ${lv - 1} 各层的指针挂载与链接更新`,
      message: `与前驱节点对接，更新前驱各层 next 指针指向新节点`,
      log: `linkNode: val=${val}, levels=${lv}`,
      codeLine: lines.linkNode,
      statusBadge: { text: `已插入: ${val}`, type: 'info' },
      metrics: { '已存节点数': nodes.length, '跳表层数': maxLevel },
    });
  }

  // 终态
  steps.push({
    nodes: cloneNodes(),
    activeVal: -1,
    currentLevel: 0,
    maxLevel,
    decision: `🎉 跳表构建完毕：成功存储 ${nodes.length} 个有序元素，支持期望 O(log N) 高并发读写`,
    message: `跳表无需树自旋即可实现有序表，是 Redis Sorted Set、LevelDB 等现代存储引擎的标准首选`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: '跳表构建完成', type: 'success' },
    metrics: { '节点总数': nodes.length, '期望时间复杂度': 'O(log N)' },
  });

  return steps;
}
