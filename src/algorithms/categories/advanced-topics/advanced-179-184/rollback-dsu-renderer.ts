/**
 * Class 182: 可撤销并查集 (Rollback DSU)
 * 按秩合并 + 历史栈精确回滚 / 洛谷 P5490 衍生与各类分治底层
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { ROLLBACK_DSU_CODES, ROLLBACK_DSU_LINES } from './advanced-179-184-stage-codes';
import { Advanced179Step, RollbackHistoryRecord, renderRollbackDSUBoard } from './advanced-179-184-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

export const rollbackDSUVisualizer = registerDeclarativeAlgorithm<RollbackDSUStep>({
  id: 'rollback-dsu-182',
  name: '可撤销并查集 (Rollback DSU / Class 182)',
  category: 'tree',
  icon: '⏪',
  difficulty: 3,
  levelOrder: 182,
  description: '左程云算法通关课 Class 182：可撤销并查集 (Rollback DSU)。严格按秩合并维持树高 O(log N)，历史操作栈记录变更，O(1) 精确回滚任意层级状态。',
  learningGoal: '掌握可撤销并查集按秩合并原理、禁用路径压缩的深层原因以及 O(1) 历史栈精准回退',
  problemHtml: ADVANCED_179_184_PROBLEMS.rollbackDSU.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.rollbackDSU.html,
  inputs: [
    {
      id: 'preset',
      label: '操作序列预设',
      type: 'select',
      defaultValue: 'union3_rollback1',
      options: [
        { label: '连续合并 3 次 -> 回退 1 次', value: 'union3_rollback1' },
      ],
    },
  ],
  codeLanguages: ROLLBACK_DSU_CODES,
  generateSteps: () => buildRollbackDSUSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderRollbackDSUBoard(
          step.nodes,
          step.parent,
          step.rank,
          step.history,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">回退复杂度</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">历史栈弹栈 O(1) 精确还原</div>
          </div>
        </div>

        ${renderFormulaCard(
          '按秩合并树高定理',
          'h <= floor(log_2 N) + 1 | 严禁使用路径压缩，撤销时直接弹栈赋值，单步代价 O(1)',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
