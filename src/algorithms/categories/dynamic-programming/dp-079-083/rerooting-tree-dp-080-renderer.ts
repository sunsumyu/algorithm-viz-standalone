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

export interface Rerooting080Input {
  n?: number;
  edges?: [number, number][];
}

export function buildRerooting080Steps(input?: Rerooting080Input): Rerooting080Step[] {
  const steps: Rerooting080Step[] = [];
  const lines = REROOTING_TREE_DP_080_LINES;

  const n = input?.n !== undefined ? input.n : 4;
  const edges = input?.edges || [
    [0, 1],
    [0, 2],
    [1, 3],
  ];

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    if (u < n && v < n) {
      adj[u]!.push(v);
      adj[v]!.push(u);
    }
  }

  const size: number[] = new Array(n).fill(0);
  const ans: number[] = new Array(n).fill(0);

  function snapshotNodes(): { id: number; size: number; ans: number }[] {
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      size: size[i]!,
      ans: ans[i]!,
    }));
  }

  // Step 0: 入口
  steps.push({
    nodes: snapshotNodes(),
    curRoot: 0,
    phase: 'DFS1',
    decision: `主函数入口：准备在 ${n} 节点树中求解每个节点到其他所有节点的距离和。`,
    message: '直接从每个点做 BFS 需 O(N^2)；采用换根 DP 两遍 DFS，可在 O(N) 线性时间完成全树求解！',
    log: `enter sumOfDistancesInTree: N=${n}`,
    codeLine: lines.entry,
    metrics: { '树规模 N': n, '当前阶段': 'DFS 1 启动' },
  });

  // Step 1: 启动 DFS 1
  steps.push({
    nodes: snapshotNodes(),
    curRoot: 0,
    phase: 'DFS1',
    decision: '以节点 0 为临时基准根，启动 DFS 1 自底向上递归统计。',
    message: '第一遍遍历计算各子树规模 size[u] 以及根节点 0 到其子树内所有节点的距离和。',
    log: 'start dfs1(0, -1)',
    codeLine: lines.startDfs1,
    metrics: { '临时根': 0, '阶段': 'DFS 1 自底向上' },
  });

  function dfs1(u: number, p: number) {
    size[u] = 1;
    for (const v of adj[u]!) {
      if (v !== p) {
        dfs1(v, u);
        size[u]! += size[v]!;
        ans[u]! += ans[v]! + size[v]!;
        steps.push({
          nodes: snapshotNodes(),
          curRoot: 0,
          phase: 'DFS1',
          decision: `DFS 1 自底向上聚合：子节点 ${v} 回溯至父节点 ${u}，更新 size[${u}]=${size[u]}，子树距离和贡献累加至 ans[${u}]=${ans[u]}。`,
          message: `节点 ${u} 的子树规模累加子节点规模 size[${v}]=${size[v]}；距离增加 ans[${v}] + size[${v}]。`,
          log: `dfs1 back: node ${u} merged child ${v}, size[${u}]=${size[u]}, ans[${u}]=${ans[u]}`,
          codeLine: lines.dfs1Compute,
          statusBadge: { text: `聚合节点 ${u}`, type: 'info' },
          metrics: { '当前节点': u, '子节点': v, '更新后 size': size[u]! },
        });
      }
    }
  }

  dfs1(0, -1);

  // Step: 启动 DFS 2
  steps.push({
    nodes: snapshotNodes(),
    curRoot: 0,
    phase: 'DFS2',
    decision: `DFS 1 统计完成：根节点 0 的全树距离和为 ans[0] = ${ans[0]}。现在启动 DFS 2 自顶向下换根辐射！`,
    message: '第二遍遍历利用换根公式 ans[v] = ans[u] + N - 2*size[v]，O(1) 瞬时推出所有子节点作为新根的全局距离和。',
    log: 'start dfs2(0, -1)',
    codeLine: lines.startDfs2,
    statusBadge: { text: `根 0 距离和 = ${ans[0]}`, type: 'info' },
    metrics: { 'ans[0]': ans[0]!, '阶段': 'DFS 2 换根辐射' },
  });

  function dfs2(u: number, p: number) {
    for (const v of adj[u]!) {
      if (v !== p) {
        // 核心换根公式：ans[v] = ans[u] + N - 2 * size[v]
        ans[v] = ans[u]! + n - 2 * size[v]!;
        steps.push({
          nodes: snapshotNodes(),
          curRoot: v,
          phase: 'DFS2',
          decision: `DFS 2 自顶向下换根：根从 ${u} 转移至子节点 ${v}！`,
          message: `换根转移方程：ans[${v}] = ans[${u}] + N - 2*size[${v}] = ${ans[u]} + ${n} - 2*${size[v]} = ${ans[v]}！常数时间 O(1) 瞬时得出。`,
          log: `reroot ${u} -> ${v}: ans[${v}] = ${ans[v]}`,
          codeLine: lines.rerootTrans,
          statusBadge: { text: `换根节点 ${v}`, type: 'success' },
          metrics: { '当前根': v, [`ans[${v}]`]: ans[v]! },
        });
        dfs2(v, u);
      }
    }
  }

  dfs2(0, -1);

  // Step: 结果输出
  steps.push({
    nodes: snapshotNodes(),
    curRoot: 0,
    phase: 'COMPLETE',
    decision: `换根 DP 圆满终结：返回各节点距离和数组 [${ans.join(', ')}]。`,
    message: '两遍 DFS 严格保证了全树 O(N) 线性时间复杂度。',
    log: `sumOfDistancesInTree complete -> return [${ans.join(', ')}]`,
    codeLine: lines.returnAns,
    statusBadge: { text: '算法结束', type: 'success' },
    metrics: { '总节点数': n, '时间复杂度': 'O(N)' },
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
