/**
 * 有向图强连通分量 (SCC) 与 Tarjan 缩点建 DAG (Strongly Connected Components)
 * 参考左程云《算法通关课》class066: DFN/LOW 追溯、栈维护分量、缩点转化为 DAG (洛谷 P3387)
 */

export const TARJAN_SCC_DAG_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <stack>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// Tarjan 强连通分量 (SCC) 与缩点 (洛谷 P3387 / 左程云 class066)',
    'int timer = 0, sccCount = 0;',
    'vector<int> dfn, low, sccId;',
    'vector<bool> inStack;',
    'stack<int> stk;',
    '',
    'void tarjan(int u, const vector<vector<int>>& graph) {',
    '    dfn[u] = low[u] = ++timer;',
    '    stk.push(u);',
    '    inStack[u] = true;',
    '    ',
    '    for (int v : graph[u]) {',
    '        if (!dfn[v]) {',
    '            tarjan(v, graph);',
    '            low[u] = min(low[u], low[v]);',
    '        } else if (inStack[v]) { // 形成强连通环路',
    '            low[u] = min(low[u], dfn[v]);',
    '        }',
    '    }',
    '    ',
    '    // 根节点触发强连通分量结算',
    '    if (low[u] == dfn[u]) {',
    '        sccCount++;',
    '        while (true) {',
    '            int node = stk.top(); stk.pop();',
    '            inStack[node] = false;',
    '            sccId[node] = sccCount;',
    '            if (node == u) break;',
    '        }',
    '    }',
    '}',
    '',
    '// 缩点建 DAG: 遍历原图跨分量边',
    'vector<vector<int>> buildDAG(int n, const vector<vector<int>>& graph) {',
    '    vector<vector<int>> dag(sccCount + 1);',
    '    for (int u = 1; u <= n; ++u) {',
    '        for (int v : graph[u]) {',
    '            if (sccId[u] != sccId[v]) {',
    '                dag[sccId[u]].push_back(sccId[v]);',
    '            }',
    '        }',
    '    }',
    '    return dag;',
    '}',
  ],
  java: [
    'package class066;',
    '',
    'import java.util.*;',
    '',
    '// 有向图 Tarjan 强连通分量与缩点 - 左程云标准实现',
    'public class Code01_TarjanSCC {',
    '    public static int timer = 0, sccCount = 0;',
    '    public static int[] dfn, low, sccId;',
    '    public static boolean[] inStack;',
    '    public static Stack<Integer> stack = new Stack<>();',
    '    ',
    '    public static void tarjan(int u, List<Integer>[] graph) {',
    '        dfn[u] = low[u] = ++timer;',
    '        stack.push(u);',
    '        inStack[u] = true;',
    '        ',
    '        for (int v : graph[u]) {',
    '            if (dfn[v] == 0) {',
    '                tarjan(v, graph);',
    '                low[u] = Math.min(low[u], low[v]);',
    '            } else if (inStack[v]) {',
    '                low[u] = Math.min(low[u], dfn[v]);',
    '            }',
    '        }',
    '        ',
    '        if (low[u] == dfn[u]) {',
    '            sccCount++;',
    '            while (true) {',
    '                int node = stack.pop();',
    '                inStack[node] = false;',
    '                sccId[node] = sccCount;',
    '                if (node == u) break;',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'def tarjan_scc(n: int, graph: list[list[int]]):',
    '    timer = 0',
    '    scc_count = 0',
    '    dfn = [0] * (n + 1)',
    '    low = [0] * (n + 1)',
    '    scc_id = [0] * (n + 1)',
    '    in_stack = [False] * (n + 1)',
    '    stk = []',
    '    ',
    '    def dfs(u: int):',
    '        nonlocal timer, scc_count',
    '        timer += 1',
    '        dfn[u] = low[u] = timer',
    '        stk.append(u)',
    '        in_stack[u] = True',
    '        ',
    '        for v in graph[u]:',
    '            if not dfn[v]:',
    '                dfs(v)',
    '                low[u] = min(low[u], low[v])',
    '            elif in_stack[v]:',
    '                low[u] = min(low[u], dfn[v])',
    '                ',
    '        if low[u] == dfn[u]:',
    '            scc_count += 1',
    '            while True:',
    '                node = stk.pop()',
    '                in_stack[node] = False',
    '                scc_id[node] = scc_count',
    '                if node == u:',
    '                    break',
    '                    ',
    '    for i in range(1, n + 1):',
    '        if not dfn[i]:',
    '            dfs(i)',
    '            ',
    '    return scc_count, scc_id',
  ],
  javascript: [
    '// Tarjan 强连通分量与缩点 (JavaScript 版)',
    'function tarjanSCC(n, graph) {',
    '  let timer = 0, sccCount = 0;',
    '  const dfn = Array(n + 1).fill(0);',
    '  const low = Array(n + 1).fill(0);',
    '  const sccId = Array(n + 1).fill(0);',
    '  const inStack = Array(n + 1).fill(false);',
    '  const stk = [];',
    '  ',
    '  function dfs(u) {',
    '    dfn[u] = low[u] = ++timer;',
    '    stk.push(u);',
    '    inStack[u] = true;',
    '    ',
    '    for (const v of graph[u]) {',
    '      if (!dfn[v]) {',
    '        dfs(v);',
    '        low[u] = Math.min(low[u], low[v]);',
    '      } else if (inStack[v]) {',
    '        low[u] = Math.min(low[u], dfn[v]);',
    '      }',
    '    }',
    '    ',
    '    if (low[u] === dfn[u]) {',
    '      sccCount++;',
    '      while (true) {',
    '        const node = stk.pop();',
    '        inStack[node] = false;',
    '        sccId[node] = sccCount;',
    '        if (node === u) break;',
    '      }',
    '    }',
    '  }',
    '  ',
    '  for (let i = 1; i <= n; i++) {',
    '    if (!dfn[i]) dfs(i);',
    '  }',
    '  return { sccCount, sccId };',
    '}',
  ],
};

export const TARJAN_SCC_DAG_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔄 有向图强连通分量 (SCC) 与 Tarjan 缩点</h3>
    <p>
      在有向图 $G$ 中，如果两个节点 $u, v$ 之间既存在 $u \to v$ 的路径，又存在 $v \to u$ 的路径，则称它们是<b>强连通的</b>。
    </p>
    <p>
      <b>强连通分量 (SCC)</b> 是极大的强连通子图。通过 Tarjan 算法求出所有 SCC 后，将每个 SCC 缩成一个超级大节点，
      原图即可转化为一个纯净的<b>有向无环图 (DAG)</b>，从而可以使用拓扑排序与动态规划解决复杂路径问题（如洛谷 P3387）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 Tarjan SCC 判据</div>
      <div style="font-size: 11.5px; color: #334155;">
        当 DFS 回溯到节点 $u$ 时，若 <code>low[u] == dfn[u]</code>，说明以 $u$ 为根的一整个强连通环路已经闭环。<br/>
        此时从当前栈中不断弹出节点直至 $u$，所有弹出的节点即构成一个完整的独立 SCC！
      </div>
    </div>
  </div>
`;

export const TARJAN_SCC_DAG_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云有向图 Tarjan 缩点与 DAG 转化解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 栈的维护与在栈标记 <code>inStack</code></div>
      <div style="font-size: 12px; color: #1e40af;">
        只有当目标节点 $v$ 仍在栈中时，才能执行 <code>low[u] = min(low[u], dfn[v])</code>。<br/>
        如果 $v$ 已经被弹出，说明它属于先前已闭合结算的另一个 SCC（横叉边），不能更新当前节点的 $low$ 值！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 缩点建 DAG 的工程威力</div>
      <div style="font-size: 12px; color: #15803d;">
        有向图中的环是动态规划求最值的大敌（死循环）。通过 SCC 缩点将每个环的所有点权/贡献累加打包为单个超级节点后，整张图彻底化为严格的 DAG，DP 无后效性瞬间恢复！
      </div>
    </div>
  </div>
`;
