/**
 * Class 088: 树上背包 DP 与泛化物品优化 (Tree Knapsack DP)
 * 树形依赖选课问题与子树规模上下界剪枝 / 洛谷 P2014
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { TREE_KNAPSACK_088_CODES, TREE_KNAPSACK_088_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderTreeKnapsackBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TreeKnapsack088Step extends Dp084Step {
  nodes: { id: number; score: number }[];
  m: number;
  curU: number;
  dpRow: number[];
}

export interface TreeKnapsack088Input {
  nodes?: { id: number; score: number }[];
  edges?: [number, number][]; // [parent, child]
  m?: number; // 最多选修门数 (不含虚拟超级根 0)
}

export function buildTreeKnapsack088Steps(input?: TreeKnapsack088Input): TreeKnapsack088Step[] {
  const steps: TreeKnapsack088Step[] = [];
  const lines = TREE_KNAPSACK_088_LINES;

  const rawNodes = input?.nodes || [
    { id: 0, score: 0 }, // 虚拟超级根
    { id: 1, score: 3 }, // 课 1 (学分 3)
    { id: 2, score: 2 }, // 课 2 (学分 2, 前置课 1)
  ];
  const edges = input?.edges || [
    [0, 1],
    [1, 2],
  ];
  const m = input?.m !== undefined ? input.m : 2;
  const totalCap = m + 1; // 虚拟根额外占用 1 容量

  const n = rawNodes.length - 1;
  const scoreMap: Record<number, number> = {};
  for (const node of rawNodes) {
    scoreMap[node.id] = node.score;
  }
  const tree: Record<number, number[]> = {};
  for (const node of rawNodes) {
    tree[node.id] = [];
  }
  for (const [p, c] of edges) {
    if (tree[p]) tree[p].push(c);
  }

  // dp[u][j]: 以 u 为根的子树，在容量为 j 时获得的最大学分
  const dp: Record<number, number[]> = {};
  for (const node of rawNodes) {
    dp[node.id] = new Array(totalCap + 1).fill(0);
  }

  // 子树规模预计算
  const sz: Record<number, number> = {};
  function calcSz(u: number): number {
    let s = 1;
    for (const v of tree[u] || []) {
      s += calcSz(v);
    }
    sz[u] = s;
    return s;
  }
  calcSz(0);

  // Step 0: 入口帧
  steps.push({
    nodes: rawNodes,
    m,
    curU: 0,
    dpRow: [...dp[0]],
    decision: `主函数入口：准备在课程依赖树中选修最多 M=${m} 门课，最大化学分收益。`,
    message: `创建虚拟超级根 0，将所有没有前置要求的课程连接至根节点 0。总容量上限设为 M+1=${totalCap}。`,
    log: `enter courseSchedule: n=${n}, m=${m}, totalCap=${totalCap}`,
    codeLine: lines.entry,
    metrics: { '课程数': n, '选修上限': m, '总容量': totalCap },
  });

  // Step 1: 启动递归
  steps.push({
    nodes: rawNodes,
    m,
    curU: 0,
    dpRow: [...dp[0]],
    decision: `从虚拟超级根 0 启动树上背包 DFS 递归遍历。`,
    message: `自底向上计算各子树的泛化物品价值分布。`,
    log: `dfs(0, ${totalCap}) started`,
    codeLine: lines.startRoot,
    metrics: { '当前节点': 0, '子树规模': sz[0] },
  });

  function dfs(u: number) {
    // 强制选择自身
    dp[u][1] = scoreMap[u] || 0;
    steps.push({
      nodes: rawNodes,
      m,
      curU: u,
      dpRow: [...dp[u]],
      decision: `处理节点 ${u}：选择自身消耗 1 门课容量，获得自身学分 ${scoreMap[u] || 0} 分。`,
      message: `dp[${u}][1] = ${scoreMap[u] || 0}。作为泛化物品准备与子树进行容量分配合并。`,
      log: `node ${u}: pick self, dp[${u}][1] = ${scoreMap[u] || 0}`,
      codeLine: lines.pickSelf,
      statusBadge: { text: `节点 ${u} 选自身`, type: 'info' },
      metrics: { '当前节点': u, '自身学分': scoreMap[u] || 0 },
    });

    for (const v of tree[u] || []) {
      dfs(v);

      // 回溯合并子节点 v
      steps.push({
        nodes: rawNodes,
        m,
        curU: u,
        dpRow: [...dp[u]],
        decision: `子树 ${v} 递归返回，准备在父节点 ${u} 处合并子树 ${v} 的泛化物品。`,
        message: `倒序枚举容量 j (从 ${totalCap} 递减至 1)，防止同一子树物品被重复计算；枚举分配给子树 ${v} 的容量 k。`,
        log: `dfs(${u}) merging child ${v}`,
        codeLine: lines.capLoop,
        statusBadge: { text: `节点 ${u} 合并 ${v}`, type: 'warning' },
        metrics: { '当前节点': u, '子节点': v },
      });

      for (let j = totalCap; j >= 1; j--) {
        for (let k = 0; k < j; k++) {
          const candidate = dp[u][j - k] + dp[v][k];
          if (candidate > dp[u][j]) {
            dp[u][j] = candidate;
            steps.push({
              nodes: rawNodes,
              m,
              curU: u,
              dpRow: [...dp[u]],
              decision: `节点 ${u} 合并子树 ${v}：总容量 ${j} (自身及其他分配 ${j - k}，子树 ${v} 分配 ${k})，更新 dp[${u}][${j}] = ${candidate}。`,
              message: `dp[${u}][${j}] = max(dp[${u}][${j}], dp[${u}][${j - k}] + dp[${v}][${k}]) = ${candidate}。`,
              log: `dp[${u}][${j}] updated to ${candidate} (k=${k})`,
              codeLine: lines.mergeChild,
              statusBadge: { text: `dp[${u}][${j}] = ${candidate}`, type: 'info' },
              metrics: { '当前容量': j, '子树分配': k, '更新值': candidate },
            });
          }
        }
      }
    }
  }

  dfs(0);

  const bestScore = dp[0][totalCap];
  // 最终汇总返回
  steps.push({
    nodes: rawNodes,
    m,
    curU: 0,
    dpRow: [...dp[0]],
    decision: `虚拟超级根 0 汇总终结：最多选修 M=${m} 门课程所能获得的最大学分为 ${bestScore} 分！`,
    message: `树上背包借助泛化物品与子树规模剪枝，保证了紧致的 O(N * M) 复杂度。`,
    log: `courseSchedule complete -> return dp[0][${totalCap}] = ${bestScore}`,
    codeLine: lines.returnMax,
    statusBadge: { text: `最大学分: ${bestScore}`, type: 'success' },
    metrics: { '最大学分': bestScore, '选修门数': m, '时间复杂度': 'O(N * M)' },
  });

  return steps;
}

export const treeKnapsack088Visualizer = registerDeclarativeAlgorithm<TreeKnapsack088Step>({
  id: 'tree-knapsack-dp-088',
  name: '树上背包 DP 与泛化物品 (Class 088)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_084_088_PROBLEMS.treeKnapsack088,
  sourceCodes: TREE_KNAPSACK_088_CODES,
  generateSteps: buildTreeKnapsack088Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderTreeKnapsackBoard(
          step.nodes,
          step.m,
          step.curU,
          step.dpRow
        )}
        ${renderFormulaCard(
          '树上背包泛化物品合并方程',
          'dp[u][j] = \\max_{0 \\le k < j} \\{ dp[u][j - k] + dp[v][k] \\}',
          '将每棵子树抽象为一个权值随占用体积变化的泛化物品。先强制扣除根节点自身的占用体积（保证拓扑依赖合规），剩余容量以分组背包的形式在各子树间进行最优资源切分。'
        )}
      </div>
    `;
  },
});
