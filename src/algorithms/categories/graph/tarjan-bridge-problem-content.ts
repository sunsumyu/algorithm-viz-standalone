/**
 * 无向图割点与割边（桥）Tarjan 算法 (Cut Vertices and Bridges)
 * 参考左程云《算法通关课》class068: DFN 时间戳、LOW 追溯值、DFS 树边与返祖回边 (洛谷 P3388 / LeetCode 1192)
 */

export const TARJAN_BRIDGE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// Tarjan 算法求无向图割点与桥 (LeetCode 1192 / 洛谷 P3388)',
    'int timer = 0;',
    'vector<int> dfn, low;',
    'vector<bool> isCut;',
    'vector<pair<int, int>> bridges;',
    '',
    'void tarjan(int u, int father, const vector<vector<int>>& graph) {',
    '    dfn[u] = low[u] = ++timer;',
    '    int children = 0;',
    '    ',
    '    for (int v : graph[u]) {',
    '        if (v == father) continue; // 不走通往父节点的原路',
    '        ',
    '        if (!dfn[v]) { // 树枝边 (Tree Edge)',
    '            children++;',
    '            tarjan(v, u, graph);',
    '            low[u] = min(low[u], low[v]);',
    '            ',
    '            // 1. 割点判定 (非根节点 low[v] >= dfn[u]; 根节点 children >= 2)',
    '            if (father != 0 && low[v] >= dfn[u]) isCut[u] = true;',
    '            ',
    '            // 2. 桥 (割边) 判定: low[v] > dfn[u]',
    '            if (low[v] > dfn[u]) bridges.push_back({u, v});',
    '        } else { // 返祖边 / 回边 (Back Edge)',
    '            low[u] = min(low[u], dfn[v]);',
    '        }',
    '    }',
    '    if (father == 0 && children >= 2) isCut[u] = true;',
    '}',
  ],
  java: [
    'package class068;',
    '',
    'import java.util.*;',
    '',
    '// Tarjan 无向图割点与割边判定 - 左程云标准实现',
    'public class Code01_TarjanCutVerticesAndBridges {',
    '    public static int timer = 0;',
    '    public static int[] dfn, low;',
    '    public static boolean[] isCut;',
    '    public static List<List<Integer>> bridges = new ArrayList<>();',
    '    ',
    '    public static void tarjan(int u, int father, List<Integer>[] graph) {',
    '        dfn[u] = low[u] = ++timer;',
    '        int children = 0;',
    '        ',
    '        for (int v : graph[u]) {',
    '            if (v == father) continue;',
    '            ',
    '            if (dfn[v] == 0) { // 树边',
    '                children++;',
    '                tarjan(v, u, graph);',
    '                low[u] = Math.min(low[u], low[v]);',
    '                ',
    '                if (father != 0 && low[v] >= dfn[u]) isCut[u] = true;',
    '                if (low[v] > dfn[u]) bridges.add(Arrays.asList(u, v));',
    '            } else { // 回边',
    '                low[u] = Math.min(low[u], dfn[v]);',
    '            }',
    '        }',
    '        if (father == 0 && children >= 2) isCut[u] = true;',
    '    }',
    '}',
  ],
  python: [
    'def tarjan_cut_and_bridges(n: int, graph: list[list[int]]):',
    '    timer = 0',
    '    dfn = [0] * (n + 1)',
    '    low = [0] * (n + 1)',
    '    is_cut = [False] * (n + 1)',
    '    bridges = []',
    '    ',
    '    def dfs(u: int, father: int):',
    '        nonlocal timer',
    '        timer += 1',
    '        dfn[u] = low[u] = timer',
    '        children = 0',
    '        ',
    '        for v in graph[u]:',
    '            if v == father:',
    '                continue',
    '            if not dfn[v]: # 树边',
    '                children += 1',
    '                dfs(v, u)',
    '                low[u] = min(low[u], low[v])',
    '                if father != 0 and low[v] >= dfn[u]:',
    '                    is_cut[u] = True',
    '                if low[v] > dfn[u]:',
    '                    bridges.append((u, v))',
    '            else: # 返祖回边',
    '                low[u] = min(low[u], dfn[v])',
    '                ',
    '        if father == 0 and children >= 2:',
    '            is_cut[u] = True',
    '            ',
    '    for i in range(1, n + 1):',
    '        if not dfn[i]:',
    '            dfs(i, 0)',
    '            ',
    '    return is_cut, bridges',
  ],
  javascript: [
    '// Tarjan 求无向图割点与桥 (JavaScript 版)',
    'function findCutAndBridges(n, graph) {',
    '  let timer = 0;',
    '  const dfn = Array(n + 1).fill(0);',
    '  const low = Array(n + 1).fill(0);',
    '  const isCut = Array(n + 1).fill(false);',
    '  const bridges = [];',
    '  ',
    '  function dfs(u, father) {',
    '    dfn[u] = low[u] = ++timer;',
    '    let children = 0;',
    '    ',
    '    for (const v of graph[u]) {',
    '      if (v === father) continue;',
    '      if (!dfn[v]) {',
    '        children++;',
    '        dfs(v, u);',
    '        low[u] = Math.min(low[u], low[v]);',
    '        if (father !== 0 && low[v] >= dfn[u]) isCut[u] = true;',
    '        if (low[v] > dfn[u]) bridges.push([u, v]);',
    '      } else {',
    '        low[u] = Math.min(low[u], dfn[v]);',
    '      }',
    '    }',
    '    if (father === 0 && children >= 2) isCut[u] = true;',
    '  }',
    '  ',
    '  for (let i = 1; i <= n; i++) {',
    '    if (!dfn[i]) dfs(i, 0);',
    '  }',
    '  return { isCut, bridges };',
    '}',
  ],
};

export const TARJAN_BRIDGE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">✂️ 无向图割点与割边（桥）(Tarjan 算法)</h3>
    <p>
      给定一个连通无向图 $G = (V, E)$：
    </p>
    <ul>
      <li><b>割点 (Cut Vertex / 关节点)</b>：如果去掉节点 $u$ 以及与 $u$ 相连的所有边后，原图分裂为两个或更多不连通分量，则称 $u$ 为割点。</li>
      <li><b>割边 / 桥 (Bridge / 关键连接)</b>：如果去掉某条边 $e = (u, v)$ 后，原图分裂为两个不连通分量，则称 $e$ 为桥。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 Tarjan 核心判据</div>
      <div style="font-size: 11.5px; color: #334155;">
        • <b>割点判据</b>：对于非根节点 $u$，若存在子节点 $v$ 满足 <code>low[v] >= dfn[u]</code>，则 $u$ 是割点；对于根节点，子树分支数 <code>children >= 2</code> 则是割点。<br/>
        • <b>割边判据</b>：对于树枝边 $(u, v)$，若满足 <code>low[v] > dfn[u]</code>，则 $(u, v)$ 是一座桥！
      </div>
    </div>
  </div>
`;

export const TARJAN_BRIDGE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 DFN 与 LOW 追溯原理深度剖析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. DFN 与 LOW 的直观物理意义</div>
      <div style="font-size: 12px; color: #1e40af;">
        • <code>dfn[u]</code>：DFS 访问到节点 $u$ 的自然时间先后序号（绝对时间戳）。<br/>
        • <code>low[u]</code>：从 $u$ 出发沿着 DFS 树枝边往下走，通过子树中的<b>至多一条返祖回边</b>所能触碰到的最早祖先的 $dfn$ 最小值。
      </div>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #991b1b; margin-bottom: 4px;">2. 为什么等于号 <code>>=</code> 是割点，严格大于 <code>></code> 是桥？</div>
      <div style="font-size: 12px; color: #b91c1c;">
        • 若 <code>low[v] == dfn[u]</code>：说明子树 $v$ 能够绕回到 $u$ 本身，但<b>无法绕到 $u$ 的祖先</b>。此时删掉边 $(u, v)$ 后 $v$ 还能连接 $u$（不是桥）；但如果删掉节点 $u$，$v$ 就彻底与外界失联了，故 $u$ 是<b>割点</b>！<br/>
        • 若 <code>low[v] > dfn[u]</code>：说明子树 $v$ 连 $u$ 本身都绕不回来，仅靠边 $(u, v)$ 吊着，因此边 $(u, v)$ 是<b>桥</b>！
      </div>
    </div>
  </div>
`;
