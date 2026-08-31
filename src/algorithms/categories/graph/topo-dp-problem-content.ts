/**
 * DAG 拓扑排序与动态规划 / 关键路径 (DAG Topo DP & Critical Path)
 * 参考左程云《算法通关课》【必备篇】class060: 食物链计数 (洛谷 P4017) 与 并行课程 III (LeetCode 2050)
 */

export const TOPO_DP_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 并行课程 III (LeetCode 2050) / DAG 关键路径动态规划',
    '// 状态转移：cost[v] = max(cost[v], cost[u] + time[v])',
    'int minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {',
    '    vector<vector<int>> graph(n + 1);',
    '    vector<int> inDegree(n + 1, 0);',
    '    vector<int> cost(n + 1, 0);',
    '    ',
    '    for (const auto& r : relations) {',
    '        graph[r[0]].push_back(r[1]);',
    '        inDegree[r[1]]++;',
    '    }',
    '    ',
    '    queue<int> q;',
    '    for (int i = 1; i <= n; ++i) {',
    '        if (inDegree[i] == 0) {',
    '            cost[i] = time[i - 1]; // 基础开销',
    '            q.push(i);',
    '        }',
    '    }',
    '    ',
    '    int totalMax = 0;',
    '    while (!q.empty()) {',
    '        int u = q.front();',
    '        q.pop();',
    '        totalMax = max(totalMax, cost[u]);',
    '        ',
    '        for (int v : graph[u]) {',
    '            cost[v] = max(cost[v], cost[u] + time[v - 1]);',
    '            if (--inDegree[v] == 0) {',
    '                q.push(v);',
    '            }',
    '        }',
    '    }',
    '    return totalMax;',
    '}',
  ],
  java: [
    'package class060;',
    '',
    'import java.util.*;',
    '',
    '// 并行课程 III (LeetCode 2050) - 左程云标准拓扑动态规划',
    'public class Code03_ParallelCoursesIII {',
    '    public static int minimumTime(int n, int[][] relations, int[] time) {',
    '        List<Integer>[] graph = new ArrayList[n + 1];',
    '        for (int i = 0; i <= n; i++) graph[i] = new ArrayList<>();',
    '        ',
    '        int[] inDegree = new int[n + 1];',
    '        for (int[] r : relations) {',
    '            graph[r[0]].add(r[1]);',
    '            inDegree[r[1]]++;',
    '        }',
    '        ',
    '        int[] cost = new int[n + 1];',
    '        int[] queue = new int[n + 1];',
    '        int l = 0, r = 0;',
    '        ',
    '        for (int i = 1; i <= n; i++) {',
    '            if (inDegree[i] == 0) {',
    '                cost[i] = time[i - 1];',
    '                queue[r++] = i;',
    '            }',
    '        }',
    '        ',
    '        int ans = 0;',
    '        while (l < r) {',
    '            int u = queue[l++];',
    '            ans = Math.max(ans, cost[u]);',
    '            ',
    '            for (int v : graph[u]) {',
    '                cost[v] = Math.max(cost[v], cost[u] + time[v - 1]);',
    '                if (--inDegree[v] == 0) {',
    '                    queue[r++] = v;',
    '                }',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def minimum_time(n: int, relations: list[list[int]], time: list[int]) -> int:',
    '    graph = [[] for _ in range(n + 1)]',
    '    in_degree = [0] * (n + 1)',
    '    ',
    '    for u, v in relations:',
    '        graph[u].append(v)',
    '        in_degree[v] += 1',
    '        ',
    '    cost = [0] * (n + 1)',
    '    q = deque()',
    '    for i in range(1, n + 1):',
    '        if in_degree[i] == 0:',
    '            cost[i] = time[i - 1]',
    '            q.append(i)',
    '            ',
    '    max_time = 0',
    '    while q:',
    '        u = q.popleft()',
    '        max_time = max(max_time, cost[u])',
    '        ',
    '        for v in graph[u]:',
    '            cost[v] = max(cost[v], cost[u] + time[v - 1])',
    '            in_degree[v] -= 1',
    '            if in_degree[v] == 0:',
    '                q.append(v)',
    '                ',
    '    return max_time',
  ],
  javascript: [
    '// 拓扑排序与 DAG 关键路径 (JavaScript 版)',
    'function minimumTime(n, relations, time) {',
    '  const graph = Array.from({ length: n + 1 }, () => []);',
    '  const inDegree = Array(n + 1).fill(0);',
    '  for (const [u, v] of relations) {',
    '    graph[u].push(v);',
    '    inDegree[v]++;',
    '  }',
    '',
    '  const cost = Array(n + 1).fill(0);',
    '  const q = [];',
    '  for (let i = 1; i <= n; i++) {',
    '    if (inDegree[i] === 0) {',
    '      cost[i] = time[i - 1];',
    '      q.push(i);',
    '    }',
    '  }',
    '',
    '  let maxTime = 0;',
    '  while (q.length > 0) {',
    '    const u = q.shift();',
    '    maxTime = Math.max(maxTime, cost[u]);',
    '',
    '    for (const v of graph[u]) {',
    '      cost[v] = Math.max(cost[v], cost[u] + time[v - 1]);',
    '      inDegree[v]--;',
    '      if (inDegree[v] === 0) {',
    '        q.push(v);',
    '      }',
    '    }',
    '  }',
    '  return maxTime;',
    '}',
  ],
};

export const TOPO_DP_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎓 并行课程 III / DAG 关键路径工期 (LeetCode 2050)</h3>
    <p>
      有 <code>n</code> 节课程标记为 <code>1 ~ n</code>。给定二维依赖数组 <code>relations</code>，其中 <code>[prev, next]</code> 表示必须先修完 <code>prev</code> 才能开始 <code>next</code>。
      数组 <code>time[i]</code> 表示修完第 <code>i+1</code> 节课程所需的月份。
    </p>
    <p>
      如果某节课的所有前置先修课都已经完成，你可以<b>同时并行</b>开修任意多门课程。请计算完成全部课程所需的<b>最少总月份数</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        n = 5, relations = [[1,5],[2,5],[3,5],[3,4],[4,5]]<br/>
        time = [1, 2, 3, 4, 5]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>12</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：关键路径为 3 → 4 → 5，总花费 time[3]+time[4]+time[5] = 3 + 4 + 5 = 12 个月！
      </div>
    </div>
  </div>
`;

export const TOPO_DP_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 DAG 拓扑 DP 原理：无后效性状态推进</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 拓扑序如何赋予 DP 完美的递推顺序？</div>
      <div style="font-size: 12px; color: #1e40af;">
        DAG（有向无环图）的拓扑排序保证了：<b>对于任意有向边 $u \to v$，$u$ 一定在 $v$ 之前被处理完毕</b>。
        这意味着当处理到节点 $v$ 时，所有能够到达 $v$ 的前驱节点的 DP 值都已经确定（无后效性），直接进行状态合并即可！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 关键路径 (Critical Path) 与食物链模型对比</div>
      <div style="font-size: 12px; color: #15803d;">
        • <b>最长工期 (Max-Op DP)</b>：$cost[v] = \max_{u \to v}(cost[u] + time[v])$，决定了整个项目的木桶最长短板（关键路径）。<br/>
        • <b>路径计数 (Sum-Op DP / 食物链)</b>：$dp[v] = \sum_{u \to v} dp[u]$，统计从初级生产者到顶级捕食者的所有食物链总数。
      </div>
    </div>
  </div>
`;
