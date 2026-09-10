/**
 * Class 080: 换根 DP 专题 (Rerooting Tree DP)
 * 两次 DFS 自底向上与自顶向下全树距离和 / LeetCode 834
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { REROOTING_TREE_DP_080_CODES, REROOTING_TREE_DP_080_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderRerootingDpBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface Rerooting080Step extends Dp079Step {
  nodes: { id: number; size: number; ans: number }[];
  curRoot: number;
  phase: 'DFS1' | 'DFS2' | 'COMPLETE';
}

export function buildRerooting080Steps(): Rerooting080Step[] {
  const steps: Rerooting080Step[] = [];
  const lines = REROOTING_TREE_DP_080_LINES;

  // 节点 0 连接 1 和 2，节点 1 连接 3
  // N = 4
  // 拓扑:
  //      0
  //     / \
  //    1   2
  //   /
  //  3
  // size[3]=1, size[2]=1, size[1]=2, size[0]=4
  // ans[0] = dist(0,1)+dist(0,2)+dist(0,3) = 1 + 1 + 2 = 4
  // 换根到 1: ans[1] = ans[0] + 4 - 2*size[1] = 4 + 4 - 4 = 4 (dist(1,0)=1, dist(1,2)=2, dist(1,3)=1 -> sum=4)
  // 换根到 2: ans[2] = ans[0] + 4 - 2*size[2] = 4 + 4 - 2 = 6
  // 换根到 3: ans[3] = ans[1] + 4 - 2*size[3] = 4 + 4 - 2 = 6

  // Step 0: 入口
  steps.push({
    nodes: [
      { id: 0, size: 0, ans: 0 },
      { id: 1, size: 0, ans: 0 },
      { id: 2, size: 0, ans: 0 },
      { id: 3, size: 0, ans: 0 },
    ],
    curRoot: 0,
    phase: 'DFS1',
    decision: '主函数入口：准备在 4 节点树中求解每个节点到其他所有节点的距离和。',
    message: '直接从每个点做 BFS 需 O(N^2)；采用换根 DP 两遍 DFS，可在 O(N) 线性时间完成全树求解！',
    log: 'enter sumOfDistancesInTree: N=4',
    codeLine: lines.entry,
    metrics: { '树规模 N': 4, '当前阶段': 'DFS 1 启动' },
  });

  // Step 1: DFS 1 完成（以 0 为初始临时根）
  steps.push({
    nodes: [
      { id: 0, size: 4, ans: 4 },
      { id: 1, size: 2, ans: 0 },
      { id: 2, size: 1, ans: 0 },
      { id: 3, size: 1, ans: 0 },
    ],
    curRoot: 0,
    phase: 'DFS1',
    decision: 'DFS 1 执行完毕：统计出所有子树大小与根节点 0 的距离和 ans[0] = 4。',
    message: '各子树大小：size[3]=1, size[2]=1, size[1]=2, size[0]=4。',
    log: 'dfs1 complete: ans[0]=4, size=[4, 2, 1, 1]',
    codeLine: lines.dfs1Compute,
    statusBadge: { text: '根 0 距离和 = 4', type: 'info' },
    metrics: { 'ans[0]': 4, '阶段': 'DFS 1 完成' },
  });

  // Step 2: 换根到节点 1
  steps.push({
    nodes: [
      { id: 0, size: 4, ans: 4 },
      { id: 1, size: 2, ans: 4 },
      { id: 2, size: 1, ans: 0 },
      { id: 3, size: 1, ans: 0 },
    ],
    curRoot: 1,
    phase: 'DFS2',
    decision: 'DFS 2 自顶向下换根：根从 0 转移至其子节点 1！',
    message: '换根转移方程：ans[1] = ans[0] + N - 2*size[1] = 4 + 4 - 2*2 = 4！瞬时 O(1) 得出。',
    log: 'reroot 0 -> 1: ans[1] = 4 + 4 - 4 = 4',
    codeLine: lines.rerootTrans,
    statusBadge: { text: '换根节点 1', type: 'success' },
    metrics: { '当前根': 1, 'ans[1]': 4 },
  });

  // Step 3: 换根到节点 2 和节点 3
  steps.push({
    nodes: [
      { id: 0, size: 4, ans: 4 },
      { id: 1, size: 2, ans: 4 },
      { id: 2, size: 1, ans: 6 },
      { id: 3, size: 1, ans: 6 },
    ],
    curRoot: 2,
    phase: 'DFS2',
    decision: '继续辐射换根：节点 2 距离和 = 4 + 4 - 2 = 6；节点 3 距离和 = 4 + 4 - 2 = 6。',
    message: '所有节点的距离和均在常数次算术运算中完成求解。',
    log: 'reroot complete for node 2 and 3',
    codeLine: lines.rerootTrans,
    statusBadge: { text: '全树换根完成', type: 'success' },
    metrics: { 'ans[2]': 6, 'ans[3]': 6 },
  });

  // Step 4: 结果输出
  steps.push({
    nodes: [
      { id: 0, size: 4, ans: 4 },
      { id: 1, size: 2, ans: 4 },
      { id: 2, size: 1, ans: 6 },
      { id: 3, size: 1, ans: 6 },
    ],
    curRoot: 0,
    phase: 'COMPLETE',
    decision: '换根 DP 圆满终结：返回各节点距离和数组 [4, 4, 6, 6]。',
    message: '两遍 DFS 严格保证了全树 O(N) 线性时间复杂度。',
    log: 'sumOfDistancesInTree complete -> return [4, 4, 6, 6]',
    codeLine: lines.returnAns,
    statusBadge: { text: '算法结束', type: 'success' },
    metrics: { '总节点数': 4, '时间复杂度': 'O(N)' },
  });

  return steps;
}

export const rerootingTreeDp080Visualizer = registerDeclarativeAlgorithm<Rerooting080Step>({
  id: 'rerooting-tree-dp-080',
  name: '换根 DP 专题 (Class 080)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_079_083_PROBLEMS.rerootingDp080,
  sourceCodes: REROOTING_TREE_DP_080_CODES,
  generateSteps: buildRerooting080Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderRerootingDpBoard(
          step.nodes,
          step.curRoot,
          step.phase
        )}
        ${renderFormulaCard(
          '换根 DP 经典微积分转移定理',
          'ans[v] = ans[u] - size[v] + (N - size[v]) = ans[u] + N - 2 \\times size[v]',
          '当根由父节点 $u$ 滑动到相邻子节点 $v$ 时，以 $v$ 为根的子树距离全部减少 1（共 $size[v]$ 个点），其余外部所有节点距离全部增加 1（共 $N - size[v]$ 个点），从而实现 $O(1)$ 换根推进。'
        )}
      </div>
    `;
  },
});
