import { ROLLBACK_DSU_LINES } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-stage-codes';
import { Advanced179Step, RollbackHistoryRecord } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';

export interface RollbackDSUStep extends Advanced179Step {
  nodes: number[];
  parent: number[];
  rank: number[];
  history: RollbackHistoryRecord[];
  stage: string;
}

export function buildRollbackDSUSteps(): RollbackDSUStep[] {
  const steps: RollbackDSUStep[] = [];
  const lines = ROLLBACK_DSU_LINES;

  const nodes = [1, 2, 3, 4];
  const parent = [0, 1, 2, 3, 4]; // 1-indexed
  const rank = [0, 1, 1, 1, 1];
  const history: RollbackHistoryRecord[] = [];

  // Step 0: 入口帧
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '初始化并查集',
    decision: `主函数入口：初始化 4 个独立连通块，严禁使用路径压缩，仅采用按秩合并维护树高严格 <= O(log N)`,
    message: `路径压缩会打乱树形结构的不可逆指针，破坏回滚能力；按秩合并保证树高在回滚时仅需常数次指针恢复`,
    log: `enter rollback dsu: n=4`,
    codeLine: lines.entry,
    metrics: { '节点数': 4, '历史栈深度': 0 },
  });

  // Step 1: union(1, 2)
  parent[1] = 2;
  rank[2] = 2;
  history.push({ u: 1, v: 2, addRank: 1 });
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '执行 union(1, 2)',
    decision: `合并节点 1 与 2：两节点初始秩均为 1，将节点 1 挂接至 2 下 (parent[1]=2)，2 的秩增加为 2`,
    message: `将操作 (u=1, v=2, addRank=1) 压入历史栈，当前快照栈深度 = 1`,
    log: `union: 1 -> 2, rank[2]=2, history.push`,
    codeLine: lines.historyPush,
    statusBadge: { text: '合并 1 -> 2', type: 'info' },
    metrics: { '当前连通块数': 3, '历史栈深度': 1 },
  });

  // Step 2: union(3, 4)
  parent[3] = 4;
  rank[4] = 2;
  history.push({ u: 3, v: 4, addRank: 1 });
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '执行 union(3, 4)',
    decision: `合并节点 3 与 4：两节点秩均为 1，将节点 3 挂接至 4 下 (parent[3]=4)，4 的秩增加为 2`,
    message: `将操作 (u=3, v=4, addRank=1) 压入历史栈，当前快照栈深度 = 2`,
    log: `union: 3 -> 4, rank[4]=2, history.push`,
    codeLine: lines.historyPush,
    statusBadge: { text: '合并 3 -> 4', type: 'info' },
    metrics: { '当前连通块数': 2, '历史栈深度': 2 },
  });

  // Step 3: union(2, 4)
  parent[2] = 4;
  rank[4] = 3;
  history.push({ u: 2, v: 4, addRank: 1 });
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '执行 union(2, 4)',
    decision: `合并连通块 {1, 2} 与 {3, 4}：两块根节点秩相同，将根 2 挂接至根 4 下，4 的秩升为 3`,
    message: `此时所有 4 个节点全部连通，历史栈深度为 3`,
    log: `union: 2 -> 4, rank[4]=3, history.push`,
    codeLine: lines.unionRank,
    statusBadge: { text: '合并 2 -> 4，全图连通', type: 'warning' },
    metrics: { '当前连通块数': 1, '历史栈深度': 3 },
  });

  // Step 4: 回滚一步 rollback(targetSize=2)
  const lastOp = history.pop()!;
  parent[lastOp.u] = lastOp.u;
  rank[lastOp.v] -= lastOp.addRank;
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '执行 rollback(2)：撤销最近一次合并',
    decision: `触发回滚：弹出栈顶操作 (u=2, v=4, addRank=1)，精准恢复 parent[2]=2，并将 rank[4] 减回 2`,
    message: `连通块瞬间无损分裂为 {1, 2} 和 {3, 4} 两个独立集合，无任何垃圾回收与拓扑重建开销`,
    log: `rollback: popped (2, 4), restored parent[2]=2, rank[4]=2`,
    codeLine: lines.rollbackPop,
    statusBadge: { text: '回退 1 步合并', type: 'info' },
    metrics: { '当前连通块数': 2, '历史栈深度': 2 },
  });

  // Step 5: 演示结束
  steps.push({
    nodes,
    parent: [...parent],
    rank: [...rank],
    history: [...history],
    stage: '可撤销并查集演示完成',
    decision: `🎉 可撤销并查集展示完成：通过历史栈可以支持任意深度的 O(1) 精确回溯`,
    message: `单次 union 和 find 耗时严格为 O(log N)，回滚一步仅需 O(1)，是线段树分治与动态树等算法不可或缺的底层支柱`,
    log: `rollback dsu demo finished`,
    codeLine: lines.returnAns,
    statusBadge: { text: '支持任意回溯', type: 'success' },
    metrics: { '单次操作复杂度': 'O(log N)', '回溯复杂度': 'O(1)', '状态': '正常' },
  });

  return steps;
}
