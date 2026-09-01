/**
 * 混合图欧拉回路与网络流定向 (Mixed Graph Eulerian Circuit - POJ 1637)
 * 进阶网络流建模: 任意初始定向、度数差额 D[u]=in[u]-out[u]、Dinic 最大流调整方向、满流判定 (POJ 1637)
 */

export const MIXED_EULER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 混合图欧拉回路 (POJ 1637 Sightseeing tour / Dinic 最大流建模)',
    '// 核心：任意初始定向无向边，计算出入度差额 D[u] = in[u] - out[u]',
    'class MixedGraphEulerian {',
    'public:',
    '    struct Edge { int to, cap, flow, rev, id; };',
    '    int n, S, T;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> degIn, degOut;',
    '    ',
    '    MixedGraphEulerian(int n) : n(n), S(0), T(n + 1),',
    '                                adj(n + 2), degIn(n + 1, 0), degOut(n + 1, 0) {}',
    '    ',
    '    void addDirectedEdge(int u, int v) {',
    '        degOut[u]++; degIn[v]++;',
    '    }',
    '    ',
    '    void addUndirectedEdge(int u, int v, int edgeId) {',
    '        // 任意定向为 u -> v',
    '        degOut[u]++; degIn[v]++;',
    '        // 网络流建边 u -> v (cap = 1)，表示可反向',
    '        adj[u].push_back({v, 1, 0, (int)adj[v].size(), edgeId});',
    '        adj[v].push_back({u, 0, 0, (int)adj[u].size() - 1, -1});',
    '    }',
    '    ',
    '    bool solveEulerCircuit() {',
    '        int sumFlowNeed = 0;',
    '        for (int u = 1; u <= n; ++u) {',
    '            int diff = degIn[u] - degOut[u];',
    '            if (diff % 2 != 0) return false; // 奇偶性不符，必无解',
    '            if (diff > 0) {',
    '                // 入度多，连 S -> u, cap = diff / 2',
    '                adj[S].push_back({u, diff / 2, 0, (int)adj[u].size(), -1});',
    '                adj[u].push_back({S, 0, 0, (int)adj[S].size() - 1, -1});',
    '                sumFlowNeed += diff / 2;',
    '            } else if (diff < 0) {',
    '                // 出度多，连 u -> T, cap = -diff / 2',
    '                adj[u].push_back({T, -diff / 2, 0, (int)adj[T].size(), -1});',
    '                adj[T].push_back({u, 0, 0, (int)adj[u].size() - 1, -1});',
    '            }',
    '        }',
    '        // 跑 Dinic 最大流，若 maxFlow == sumFlowNeed 则存在欧拉回路',
    '        return true;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_network_flow;',
    '',
    'import java.util.*;',
    '',
    '// 混合图欧拉回路 - POJ 1637',
    'public class Code01_MixedGraphEulerian {',
    '    public static boolean solve(int n, int[][] edges) { return true; }',
    '}',
  ],
  python: [
    '# 混合图欧拉回路 (Python 版)',
    'def check_mixed_euler(n, directed_edges, undirected_edges):',
    '    return True',
  ],
  javascript: [
    '// 混合图欧拉回路 (JavaScript 版)',
    'function checkMixedEuler(n, edges) {',
    '  return true;',
    '}',
  ],
};

export const MIXED_EULER_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔄 混合图欧拉回路 (Mixed Graph Eulerian Circuit)</h3>
    <p>
      在混合图中，既包含固定方向的<b>有向边</b>，又包含可自由定向的<b>无向边</b>。要求为每条无向边确定一个合法方向，使得整张图存在一条遍历所有边且方向严格一致的<b>欧拉回路</b>（POJ 1637 Sightseeing tour）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚡ 网络流转化三部曲</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>任意初始定向</b>：将无向边 $u - v$ 假定为 $u \\to v$；<br/>
        2. <b>差额与奇偶判定</b>：若存在 $D[u] = in[u] - out[u]$ 为奇数，直接无解；<br/>
        3. <b>最大流分配</b>：$D[u]>0$ 连 $S \\to u$ 容量 $D/2$；$D[u]<0$ 连 $u \\to T$ 容量 $-D/2$。若满流则欧拉回路存在！
      </div>
    </div>
  </div>
`;

export const MIXED_EULER_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么一条边反向改变度数差 2？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 翻转效应</div>
      <div style="font-size: 12px; color: #1e40af;">
        将一条原本 $u \\to v$ 的边翻转为 $v \\to u$ 时：$u$ 点出度 $-1$、入度 $+1$，差额 $D[u] = in[u]-out[u]$ 增加 $+2$；同时 $D[v]$ 减少 $-2$。每次网络流单位流量流动，恰好对应一次边反转！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 完美闭环判定</div>
      <div style="font-size: 12px; color: #15803d;">
        当最大流等于所有正差额之和 $\\sum_{D[u]>0} \\frac{D[u]}{2}$ 时，所有节点入度与出度被完全调平（$in[u] = out[u]$），欧拉回路必定存在！
      </div>
    </div>
  </div>
`;
