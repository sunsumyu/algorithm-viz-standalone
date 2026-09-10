/**
 * 左程云《算法讲解075【必备】背包dp-多重背包、混合背包》DDD 文档数据仓
 * 包含全套 5 题的官方题面、算法证明推导分析、以及 C++ / Java / Python / JavaScript 4 语言全真代码
 */

export interface Knapsack075ProblemData {
  id: string;
  name: string;
  problemHtml: string;
  analysisHtml: string;
  codeLanguages: Record<string, string[]>;
}

export const KNAPSACK_075_PROBLEMS: Record<string, Knapsack075ProblemData> = {
  'bounded-knapsack-naive': {
    id: 'bounded-knapsack-naive',
    name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
    problemHtml: `
      <div class="problem-content">
        <h3>洛谷 P1776 宝物筛选 (多重背包朴素枚举版)</h3>
        <p>一共有 <code>n</code> 种货物，背包容量为 <code>t</code>。每种货物的价值为 <code>v[i]</code>、重量为 <code>w[i]</code>、数量为 <code>c[i]</code>。</p>
        <p>请返回选择货物不超过背包容量的情况下，能得到的最大价值。</p>
        <h4>输入样例</h4>
        <pre><code>n = 4, t = 20
货物:
1: 价值=3, 重量=2, 数量=2
2: 价值=4, 重量=3, 数量=3
3: 价值=7, 重量=5, 数量=2
4: 价值=8, 重量=9, 数量=1</code></pre>
        <h4>输出样例</h4>
        <pre><code>23</code></pre>
        <h4>评测说明</h4>
        <p>在洛谷 P1776 中，本朴素枚举代码部分大用例会超时，其作为多重背包的 baseline 教学基准，展示三重循环枚举件数 $k$ 的运行原理。</p>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>多重背包状态转移与朴素枚举分析</h3>
        <h4>1. 状态定义</h4>
        <p>设 <code>dp[i][j]</code> 表示前 <code>i</code> 种货物，背包容量为 <code>j</code> 时所能取得的最大价值。</p>
        <h4>2. 状态转移方程</h4>
        <p>对于第 <code>i</code> 种货物，枚举其拿取的件数 <code>k</code>（其中 $0 \\le k \\le c[i]$ 且 $k \\times w[i] \\le j$）：</p>
        <pre><code>dp[i][j] = max( dp[i-1][j - k * w[i]] + k * v[i] )</code></pre>
        <h4>3. 空间压缩</h4>
        <p>因为 <code>dp[j]</code> 只依赖上一行左侧的格子，所以容量 <code>j</code> 必须从大到小<strong>倒序枚举</strong>：</p>
        <pre><code>for j from t down to 0:
    for k from 1 to c[i] and k * w[i] <= j:
        dp[j] = max(dp[j], dp[j - k * w[i]] + k * v[i])</code></pre>
        <h4>4. 复杂度分析</h4>
        <p>时间复杂度：$O(t \\times \\sum c[i])$，空间复杂度：$O(t)$。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 洛谷 P1776 宝物筛选 - 空间压缩朴素版',
        'public static int compute2(int n, int t, int[] v, int[] w, int[] c) {',
        '    int[] dp = new int[t + 1];',
        '    for (int i = 1; i <= n; i++) {',
        '        for (int j = t; j >= 0; j--) {',
        '            for (int k = 1; k <= c[i] && w[i] * k <= j; k++) {',
        '                dp[j] = Math.max(dp[j], dp[j - k * w[i]] + k * v[i]);',
        '            }',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      cpp: [
        '// 洛谷 P1776 宝物筛选 - C++ 朴素枚举',
        'int compute(int n, int t, const vector<int>& v, const vector<int>& w, const vector<int>& c) {',
        '    vector<int> dp(t + 1, 0);',
        '    for (int i = 1; i <= n; ++i) {',
        '        for (int j = t; j >= 0; --j) {',
        '            for (int k = 1; k <= c[i] && w[i] * k <= j; ++k) {',
        '                dp[j] = max(dp[j], dp[j - k * w[i]] + k * v[i]);',
        '            }',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      python: [
        '# 洛谷 P1776 宝物筛选 - Python 朴素枚举',
        'def compute(n: int, t: int, v: list, w: list, c: list) -> int:',
        '    dp = [0] * (t + 1)',
        '    for i in range(1, n + 1):',
        '        for j in range(t, -1, -1):',
        '            k = 1',
        '            while k <= c[i] and w[i] * k <= j:',
        '                dp[j] = max(dp[j], dp[j - k * w[i]] + k * v[i])',
        '                k += 1',
        '    return dp[t]',
      ],
      javascript: [
        '// 洛谷 P1776 宝物筛选 - JavaScript 朴素枚举',
        'export function compute(n, t, v, w, c) {',
        '  const dp = new Array(t + 1).fill(0);',
        '  for (let i = 1; i <= n; i++) {',
        '    for (let j = t; j >= 0; j--) {',
        '      for (let k = 1; k <= c[i] && w[i] * k <= j; k++) {',
        '        dp[j] = Math.max(dp[j], dp[j - k * w[i]] + k * v[i]);',
        '      }',
        '    }',
        '  }',
        '  return dp[t];',
        '}',
      ],
    },
  },

  'bounded-knapsack-binary': {
    id: 'bounded-knapsack-binary',
    name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
    problemHtml: `
      <div class="problem-content">
        <h3>洛谷 P1776 宝物筛选 (二进制拆分模板)</h3>
        <p>一共有 <code>n</code> 种货物，背包容量为 <code>t</code>。每种货物的价值为 <code>v[i]</code>、重量为 <code>w[i]</code>、数量为 <code>c[i]</code>。</p>
        <p>利用<strong>二进制分组技术</strong>将多重背包高效转化为 01 背包，在规定时限内完全通过洛谷评测。</p>
        <h4>二进制拆分法则</h4>
        <p>任意正整数 $C$ 均可被拆分成 $1, 2, 4, 8, \\dots, 2^k$ 以及剩余的余数 $R = C - \\sum 2^i$。这些衍生小包能通过“选或不选”精确且不重不漏地拼凑出 $[0, C]$ 内的任意整数！</p>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>二进制拆分数学证明与算法推导</h3>
        <h4>1. 完备性与不越界证明</h4>
        <p>设 $k$ 是满足 $2^0 + 2^1 + \\dots + 2^k \\le C$ 的最大幂和，$S = 2^{k+1} - 1$，余数 $R = C - S$。</p>
        <ul>
          <li>利用二进制位权 $1, 2, 4, \\dots, 2^k$ 可以唯一组合出 $[0, S]$ 范围内的任何整数；</li>
          <li>加上余数 $R$ 之后，与前述组合叠加，可覆盖 $[R, S + R] = [R, C]$；</li>
          <li>因为 $R < 2^{k+1} = S + 1$，两个区间 $[0, S]$ 与 $[R, C]$ 必定发生连续无缝重叠，从而无死角覆盖 $[0, C]$，且总和绝不超过 $C$！</li>
        </ul>
        <h4>2. 复杂度跃迁</h4>
        <p>每种商品拆分出的衍生商品件数仅为 $\\lfloor \\log_2 c_i \\rfloor + 1$ 件。总时间复杂度降至 $O(t \\times \\sum \\log c_i)$，在绝大部分算法竞赛与工业场景中效率完全达标。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 洛谷 P1776 宝物筛选 - 二进制拆分转化为 01 背包模版',
        'public static int computeBinary(int n, int t, int[] v, int[] w, int[] c) {',
        '    int[] nv = new int[1001];',
        '    int[] nw = new int[1001];',
        '    int m = 0;',
        '    for (int i = 1; i <= n; i++) {',
        '        int cnt = c[i];',
        '        for (int k = 1; k <= cnt; k <<= 1) {',
        '            nv[++m] = k * v[i]; nw[m] = k * w[i];',
        '            cnt -= k;',
        '        }',
        '        if (cnt > 0) {',
        '            nv[++m] = cnt * v[i]; nw[m] = cnt * w[i];',
        '        }',
        '    }',
        '    int[] dp = new int[t + 1];',
        '    for (int i = 1; i <= m; i++) {',
        '        for (int j = t; j >= nw[i]; j--) {',
        '            dp[j] = Math.max(dp[j], dp[j - nw[i]] + nv[i]);',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      cpp: [
        '// 洛谷 P1776 宝物筛选 - C++ 二进制拆分',
        'int computeBinary(int n, int t, const vector<int>& v, const vector<int>& w, const vector<int>& c) {',
        '    vector<int> nv, nw;',
        '    for (int i = 1; i <= n; ++i) {',
        '        int cnt = c[i];',
        '        for (int k = 1; k <= cnt; k <<= 1) {',
        '            nv.push_back(k * v[i]); nw.push_back(k * w[i]);',
        '            cnt -= k;',
        '        }',
        '        if (cnt > 0) {',
        '            nv.push_back(cnt * v[i]); nw.push_back(cnt * w[i]);',
        '        }',
        '    }',
        '    vector<int> dp(t + 1, 0);',
        '    for (size_t i = 0; i < nv.size(); ++i) {',
        '        for (int j = t; j >= nw[i]; --j) {',
        '            dp[j] = max(dp[j], dp[j - nw[i]] + nv[i]);',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      python: [
        '# 洛谷 P1776 宝物筛选 - Python 二进制拆分',
        'def compute_binary(n: int, t: int, v: list, w: list, c: list) -> int:',
        '    nv, nw = [], []',
        '    for i in range(1, n + 1):',
        '        cnt = c[i]',
        '        k = 1',
        '        while k <= cnt:',
        '            nv.append(k * v[i]); nw.append(k * w[i])',
        '            cnt -= k',
        '            k <<= 1',
        '        if cnt > 0:',
        '            nv.append(cnt * v[i]); nw.append(cnt * w[i])',
        '    dp = [0] * (t + 1)',
        '    for item_v, item_w in zip(nv, nw):',
        '        for j in range(t, item_w - 1, -1):',
        '            dp[j] = max(dp[j], dp[j - item_w] + item_v)',
        '    return dp[t]',
      ],
      javascript: [
        '// 洛谷 P1776 宝物筛选 - JavaScript 二进制拆分',
        'export function computeBinary(n, t, v, w, c) {',
        '  const nv = [], nw = [];',
        '  for (let i = 1; i <= n; i++) {',
        '    let cnt = c[i];',
        '    for (let k = 1; k <= cnt; k <<= 1) {',
        '      nv.push(k * v[i]); nw.push(k * w[i]);',
        '      cnt -= k;',
        '    }',
        '    if (cnt > 0) {',
        '      nv.push(cnt * v[i]); nw.push(cnt * w[i]);',
        '    }',
        '  }',
        '  const dp = new Array(t + 1).fill(0);',
        '  for (let i = 0; i < nv.length; i++) {',
        '    for (let j = t; j >= nw[i]; j--) {',
        '      dp[j] = Math.max(dp[j], dp[j - nw[i]] + nv[i]);',
        '    }',
        '  }',
        '  return dp[t];',
        '}',
      ],
    },
  },

  'cherry-blossom-viewing': {
    id: 'cherry-blossom-viewing',
    name: '观赏樱花 (洛谷 P1833 混合背包)',
    problemHtml: `
      <div class="problem-content">
        <h3>洛谷 P1833 观赏樱花 (经典混合背包)</h3>
        <p>爱与愁大神在美妙的樱花树下观赏樱花。时间从 <code>startTime</code> 到 <code>endTime</code>，可用时间为 <code>t</code> 分钟。</p>
        <p>一共有 <code>n</code> 棵樱花树。第 <code>i</code> 棵树消耗时间 <code>cost[i]</code>，能获得的美学价值为 <code>val[i]</code>，最多可看次数为 <code>cnt[i]</code>：</p>
        <ul>
          <li>若 <code>cnt[i] == 0</code>：代表该树可以无限次观赏（完全背包）；</li>
          <li>若 <code>cnt[i] > 0</code>：代表该树最多观赏 <code>cnt[i]</code> 次（多重背包 / 01背包）。</li>
        </ul>
        <p>在总时间不超过 <code>t</code> 的前提下，返回能取得的最大价值。</p>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>混合背包统一转化与二进制高效处理</h3>
        <h4>1. 背包容量上限分析</h4>
        <p>由于时间不超过 1000 分钟，且每棵树看一次至少花费 1 分钟，因此即使是无限次观赏（<code>cnt == 0</code>），在物理上也至多只能看 1000 次！</p>
        <p>因此，对于 <code>cnt == 0</code> 的樱花树，我们可以直接设定 <code>cnt = 1000</code>，从而将完全背包<strong>无损转化为多重背包</strong>！</p>
        <h4>2. 二进制快速分拆</h4>
        <p>将全部转化后的多重背包统一用二进制拆分成衍生 01 背包物品，随后执行标准 01 空间压缩。无论面对哪种背包模型，统一流水线一击必杀！</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 洛谷 P1833 观赏樱花 - 混合背包转多重二进制拆分',
        'public static int computeCherry(int t, int n, int[] cost, int[] val, int[] cnt) {',
        '    int[] nv = new int[100001];',
        '    int[] nw = new int[100001];',
        '    int m = 0;',
        '    for (int i = 1; i <= n; i++) {',
        '        int c = cnt[i] == 0 ? 1001 : cnt[i];',
        '        for (int k = 1; k <= c; k <<= 1) {',
        '            nv[++m] = k * val[i]; nw[m] = k * cost[i];',
        '            c -= k;',
        '        }',
        '        if (c > 0) {',
        '            nv[++m] = c * val[i]; nw[m] = c * cost[i];',
        '        }',
        '    }',
        '    int[] dp = new int[t + 1];',
        '    for (int i = 1; i <= m; i++) {',
        '        for (int j = t; j >= nw[i]; j--) {',
        '            dp[j] = Math.max(dp[j], dp[j - nw[i]] + nv[i]);',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      cpp: [
        '// 洛谷 P1833 观赏樱花 - C++ 实现',
        'int computeCherry(int t, int n, const vector<int>& cost, const vector<int>& val, const vector<int>& cnt) {',
        '    vector<int> nv, nw;',
        '    for (int i = 1; i <= n; ++i) {',
        '        int c = (cnt[i] == 0) ? 1001 : cnt[i];',
        '        for (int k = 1; k <= c; k <<= 1) {',
        '            nv.push_back(k * val[i]); nw.push_back(k * cost[i]);',
        '            c -= k;',
        '        }',
        '        if (c > 0) {',
        '            nv.push_back(c * val[i]); nw.push_back(c * cost[i]);',
        '        }',
        '    }',
        '    vector<int> dp(t + 1, 0);',
        '    for (size_t i = 0; i < nv.size(); ++i) {',
        '        for (int j = t; j >= nw[i]; --j) {',
        '            dp[j] = max(dp[j], dp[j - nw[i]] + nv[i]);',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      python: [
        '# 洛谷 P1833 观赏樱花 - Python 混合背包',
        'def compute_cherry(t: int, n: int, cost: list, val: list, cnt: list) -> int:',
        '    nv, nw = [], []',
        '    for i in range(1, n + 1):',
        '        c = 1001 if cnt[i] == 0 else cnt[i]',
        '        k = 1',
        '        while k <= c:',
        '            nv.append(k * val[i]); nw.append(k * cost[i])',
        '            c -= k',
        '            k <<= 1',
        '        if c > 0:',
        '            nv.append(c * val[i]); nw.append(c * cost[i])',
        '    dp = [0] * (t + 1)',
        '    for item_v, item_w in zip(nv, nw):',
        '        for j in range(t, item_w - 1, -1):',
        '            dp[j] = max(dp[j], dp[j - item_w] + item_v)',
        '    return dp[t]',
      ],
      javascript: [
        '// 洛谷 P1833 观赏樱花 - JavaScript 混合背包',
        'export function computeCherry(t, n, cost, val, cnt) {',
        '  const nv = [], nw = [];',
        '  for (let i = 1; i <= n; i++) {',
        '    let c = cnt[i] === 0 ? 1001 : cnt[i];',
        '    for (let k = 1; k <= c; k <<= 1) {',
        '      nv.push(k * val[i]); nw.push(k * cost[i]);',
        '      c -= k;',
        '    }',
        '    if (c > 0) {',
        '      nv.push(c * val[i]); nw.push(c * cost[i]);',
        '    }',
        '  }',
        '  const dp = new Array(t + 1).fill(0);',
        '  for (let i = 0; i < nv.length; i++) {',
        '    for (let j = t; j >= nw[i]; j--) {',
        '      dp[j] = Math.max(dp[j], dp[j - nw[i]] + nv[i]);',
        '    }',
        '  }',
        '  return dp[t];',
        '}',
      ],
    },
  },

  'bounded-knapsack-monotonic-queue': {
    id: 'bounded-knapsack-monotonic-queue',
    name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
    problemHtml: `
      <div class="problem-content">
        <h3>洛谷 P1776 宝物筛选 (单调队列终极优化)</h3>
        <p>一共有 <code>n</code> 种货物，背包容量为 <code>t</code>。每种货物的价值为 <code>v[i]</code>、重量为 <code>w[i]</code>、数量为 <code>c[i]</code>。</p>
        <p>利用<strong>同余分组 + 单调双端队列滑动窗口</strong>，在严格 $O(n \\times t)$ 线性时间内求得全局最优价值，实现多重背包的理论性能天花板！</p>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>同余分组与单调队列最值代数推导</h3>
        <h4>1. 同余线性分组</h4>
        <p>对于第 <code>i</code> 种货物（重量 <code>w</code>，价值 <code>v</code>，数量 <code>c</code>），观察状态转移：</p>
        <pre><code>dp[i][j] = max_{0 \\le k \\le c} ( dp[i-1][j - k*w] + k*v )</code></pre>
        <p>只有当两个容量模 <code>w</code> 同余时，它们之间才可能发生转移。因此，按余数 $mod \\in [0, w-1]$ 将所有容量严格划分为 $w$ 条互不相交的线性链！</p>
        <h4>2. 变形为滑动窗口最值</h4>
        <p>令 $j = p \\times w + mod$，则 $j - k \\times w = (p - k) \\times w + mod$。代入转移方程并提取常数：</p>
        <pre><code>dp[i][p*w+mod] = max_{p-c \\le q \\le p} ( dp[i-1][q*w+mod] - q*v ) + p*v</code></pre>
        <p>定义指标函数 $val(q) = dp[i-1][q*w+mod] - q \\times v$。此时问题完全退化为：<strong>在长度为 $c+1$ 的滑动窗口内，动态维护 $val(q)$ 的最大值</strong>！</p>
        <h4>3. 单调双端队列维护</h4>
        <p>使用双端单调队列可以在平摊 $O(1)$ 的时间内滑动窗口，因此每种物品只需遍历容量一次，总复杂度降为绝对无冗余的 $O(n \\times t)$！</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 洛谷 P1776 宝物筛选 - 空间压缩单调队列版 (左程云 075 Code04)',
        'public static int computeMonoQueue(int n, int t, int[] v, int[] w, int[] c) {',
        '    int[] dp = new int[t + 1];',
        '    int[] queue = new int[t + 1];',
        '    for (int i = 1; i <= n; i++) {',
        '        int weight = w[i], val = v[i], cnt = c[i];',
        '        for (int mod = 0; mod < Math.min(t + 1, weight); mod++) {',
        '            int l = 0, r = 0;',
        '            for (int j = t - mod, cCount = 1; j >= 0 && cCount <= cnt; j -= weight, cCount++) {',
        '                while (l < r && (dp[queue[r - 1]] - queue[r - 1] / weight * val) <= (dp[j] - j / weight * val)) r--;',
        '                queue[r++] = j;',
        '            }',
        '            for (int j = t - mod, enter = j - weight * cnt; j >= 0; j -= weight, enter -= weight) {',
        '                if (enter >= 0) {',
        '                    while (l < r && (dp[queue[r - 1]] - queue[r - 1] / weight * val) <= (dp[enter] - enter / weight * val)) r--;',
        '                    queue[r++] = enter;',
        '                }',
        '                dp[j] = (dp[queue[l]] - queue[l] / weight * val) + j / weight * val;',
        '                if (queue[l] == j) l++;',
        '            }',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      cpp: [
        '// 洛谷 P1776 宝物筛选 - C++ 单调队列优化',
        'int computeMonoQueue(int n, int t, const vector<int>& v, const vector<int>& w, const vector<int>& c) {',
        '    vector<int> dp(t + 1, 0), q(t + 1, 0);',
        '    for (int i = 1; i <= n; ++i) {',
        '        int weight = w[i], val = v[i], cnt = c[i];',
        '        auto get_val = [&](int pos) { return dp[pos] - pos / weight * val; };',
        '        for (int mod = 0; mod < min(t + 1, weight); ++mod) {',
        '            int l = 0, r = 0;',
        '            for (int j = t - mod, cCount = 1; j >= 0 && cCount <= cnt; j -= weight, ++cCount) {',
        '                while (l < r && get_val(q[r - 1]) <= get_val(j)) --r;',
        '                q[r++] = j;',
        '            }',
        '            for (int j = t - mod, enter = j - weight * cnt; j >= 0; j -= weight, enter -= weight) {',
        '                if (enter >= 0) {',
        '                    while (l < r && get_val(q[r - 1]) <= get_val(enter)) --r;',
        '                    q[r++] = enter;',
        '                }',
        '                dp[j] = get_val(q[l]) + j / weight * val;',
        '                if (q[l] == j) ++l;',
        '            }',
        '        }',
        '    }',
        '    return dp[t];',
        '}',
      ],
      python: [
        '# 洛谷 P1776 宝物筛选 - Python 单调队列优化',
        'def compute_mono_queue(n: int, t: int, v: list, w: list, c: list) -> int:',
        '    dp = [0] * (t + 1)',
        '    q = [0] * (t + 1)',
        '    for i in range(1, n + 1):',
        '        weight, val, cnt = w[i], v[i], c[i]',
        '        for mod in range(min(t + 1, weight)):',
        '            l, r = 0, 0',
        '            j = t - mod',
        '            cCount = 1',
        '            while j >= 0 and cCount <= cnt:',
        '                val_j = dp[j] - (j // weight) * val',
        '                while l < r and (dp[q[r-1]] - (q[r-1] // weight) * val) <= val_j:',
        '                    r -= 1',
        '                q[r] = j; r += 1',
        '                j -= weight; cCount += 1',
        '            j = t - mod',
        '            enter = j - weight * cnt',
        '            while j >= 0:',
        '                if enter >= 0:',
        '                    val_enter = dp[enter] - (enter // weight) * val',
        '                    while l < r and (dp[q[r-1]] - (q[r-1] // weight) * val) <= val_enter:',
        '                        r -= 1',
        '                    q[r] = enter; r += 1',
        '                dp[j] = (dp[q[l]] - (q[l] // weight) * val) + (j // weight) * val',
        '                if q[l] == j:',
        '                    l += 1',
        '                j -= weight; enter -= weight',
        '    return dp[t]',
      ],
      javascript: [
        '// 洛谷 P1776 宝物筛选 - JavaScript 单调队列优化',
        'export function computeMonoQueue(n, t, v, w, c) {',
        '  const dp = new Array(t + 1).fill(0);',
        '  const q = new Array(t + 1).fill(0);',
        '  for (let i = 1; i <= n; i++) {',
        '    const weight = w[i], val = v[i], cnt = c[i];',
        '    const getVal = (pos) => dp[pos] - Math.floor(pos / weight) * val;',
        '    for (let mod = 0; mod < Math.min(t + 1, weight); mod++) {',
        '      let l = 0, r = 0;',
        '      for (let j = t - mod, cCount = 1; j >= 0 && cCount <= cnt; j -= weight, cCount++) {',
        '        while (l < r && getVal(q[r - 1]) <= getVal(j)) r--;',
        '        q[r++] = j;',
        '      }',
        '      for (let j = t - mod, enter = j - weight * cnt; j >= 0; j -= weight, enter -= weight) {',
        '        if (enter >= 0) {',
        '          while (l < r && getVal(q[r - 1]) <= getVal(enter)) r--;',
        '          q[r++] = enter;',
        '        }',
        '        dp[j] = getVal(q[l]) + Math.floor(j / weight) * val;',
        '        if (q[l] === j) l++;',
        '      }',
        '    }',
        '  }',
        '  return dp[t];',
        '}',
      ],
    },
  },

  'coins-change-kinds': {
    id: 'coins-change-kinds',
    name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
    problemHtml: `
      <div class="problem-content">
        <h3>POJ 1742 Coins (能成功找零的钱数种类)</h3>
        <p>每一种货币都给定面值 <code>val[i]</code> 和拥有的数量 <code>cnt[i]</code>。</p>
        <p>想知道目前拥有的货币，在钱数恰好为 $1, 2, 3, \\dots, m$ 时，能够成功拼凑/找零的钱数一共有多少种？</p>
        <h4>输入样例</h4>
        <pre><code>n = 3, m = 10
面值 val: [1, 2, 4]
数量 cnt: [2, 1, 1]</code></pre>
        <h4>输出样例</h4>
        <pre><code>8</code></pre>
        <p>解释：可以凑出 1, 2, 3, 4, 5, 6, 7, 8 共 8 种面值，9 和 10 无法凑出。</p>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>混合背包自适应分支与布尔窗口滑块优化</h3>
        <h4>1. 混合背包的三路自适应分支</h4>
        <p>左程云老师指出的绝妙优化：针对不同货币属性采取不同背包策略：</p>
        <ul>
          <li><strong>单张硬币（<code>cnt[i] == 1</code>）</strong>：退化为 01 背包，从右向左更新；</li>
          <li><strong>硬币用不完（<code>val[i] * cnt[i] >= m</code>）</strong>：退化为完全背包，从左向右正序更新；</li>
          <li><strong>普通多重背包（<code>val[i] * cnt[i] < m</code>）</strong>：同余分组，维护布尔真值滑块！</li>
        </ul>
        <h4>2. 布尔窗口优化（无需单调队列）</h4>
        <p>由于本题只需要判断<strong>能否凑出（true/false）</strong>，在同余链上维护一个长度为 $c+1$ 的窗口内“true 的个数 <code>trueCnt</code>”。</p>
        <p>只要窗口内存在至少一个 true，且当前位置尚未被访问，则当前位置即可成功找零！平摊时间复杂度 $O(1)$，极其轻量！</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// POJ 1742 Coins - 混合背包 + 布尔窗口优化 (左程云 075 Code05)',
        'public static int computeCoins(int n, int m, int[] val, int[] cnt) {',
        '    boolean[] dp = new boolean[m + 1];',
        '    dp[0] = true;',
        '    for (int i = 1; i <= n; i++) {',
        '        if (cnt[i] == 1) {',
        '            for (int j = m; j >= val[i]; j--) if (dp[j - val[i]]) dp[j] = true;',
        '        } else if (val[i] * cnt[i] >= m) {',
        '            for (int j = val[i]; j <= m; j++) if (dp[j - val[i]]) dp[j] = true;',
        '        } else {',
        '            for (int mod = 0; mod < val[i]; mod++) {',
        '                int trueCnt = 0;',
        '                for (int j = m - mod, sz = 0; j >= 0 && sz <= cnt[i]; j -= val[i], sz++) trueCnt += dp[j] ? 1 : 0;',
        '                for (int j = m - mod, l = j - val[i] * (cnt[i] + 1); j >= 1; j -= val[i], l -= val[i]) {',
        '                    if (dp[j]) trueCnt--;',
        '                    else if (trueCnt > 0) dp[j] = true;',
        '                    if (l >= 0) trueCnt += dp[l] ? 1 : 0;',
        '                }',
        '            }',
        '        }',
        '    }',
        '    int ans = 0;',
        '    for (int j = 1; j <= m; j++) if (dp[j]) ans++;',
        '    return ans;',
        '}',
      ],
      cpp: [
        '// POJ 1742 Coins - C++ 混合背包与布尔窗口',
        'int computeCoins(int n, int m, const vector<int>& val, const vector<int>& cnt) {',
        '    vector<bool> dp(m + 1, false);',
        '    dp[0] = true;',
        '    for (int i = 1; i <= n; ++i) {',
        '        if (cnt[i] == 1) {',
        '            for (int j = m; j >= val[i]; --j) if (dp[j - val[i]]) dp[j] = true;',
        '        } else if (val[i] * cnt[i] >= m) {',
        '            for (int j = val[i]; j <= m; ++j) if (dp[j - val[i]]) dp[j] = true;',
        '        } else {',
        '            for (int mod = 0; mod < val[i]; ++mod) {',
        '                int trueCnt = 0;',
        '                for (int j = m - mod, sz = 0; j >= 0 && sz <= cnt[i]; j -= val[i], ++sz) trueCnt += dp[j] ? 1 : 0;',
        '                for (int j = m - mod, l = j - val[i] * (cnt[i] + 1); j >= 1; j -= val[i], l -= val[i]) {',
        '                    if (dp[j]) trueCnt--;',
        '                    else if (trueCnt > 0) dp[j] = true;',
        '                    if (l >= 0) trueCnt += dp[l] ? 1 : 0;',
        '                }',
        '            }',
        '        }',
        '    }',
        '    int ans = 0;',
        '    for (int j = 1; j <= m; ++j) if (dp[j]) ans++;',
        '    return ans;',
        '}',
      ],
      python: [
        '# POJ 1742 Coins - Python 混合背包布尔滑块',
        'def compute_coins(n: int, m: int, val: list, cnt: list) -> int:',
        '    dp = [False] * (m + 1)',
        '    dp[0] = True',
        '    for i in range(1, n + 1):',
        '        v, c = val[i], cnt[i]',
        '        if c == 1:',
        '            for j in range(m, v - 1, -1):',
        '                if dp[j - v]: dp[j] = True',
        '        elif v * c >= m:',
        '            for j in range(v, m + 1):',
        '                if dp[j - v]: dp[j] = True',
        '        else:',
        '            for mod in range(v):',
        '                trueCnt = 0',
        '                j = m - mod; sz = 0',
        '                while j >= 0 and sz <= c:',
        '                    if dp[j]: trueCnt += 1',
        '                    j -= v; sz += 1',
        '                j = m - mod; l = j - v * (c + 1)',
        '                while j >= 1:',
        '                    if dp[j]: trueCnt -= 1',
        '                    elif trueCnt > 0: dp[j] = True',
        '                    if l >= 0 and dp[l]: trueCnt += 1',
        '                    j -= v; l -= v',
        '    return sum(1 for j in range(1, m + 1) if dp[j])',
      ],
      javascript: [
        '// POJ 1742 Coins - JavaScript 混合背包布尔窗口优化',
        'export function computeCoins(n, m, val, cnt) {',
        '  const dp = new Array(m + 1).fill(false);',
        '  dp[0] = true;',
        '  for (let i = 1; i <= n; i++) {',
        '    const v = val[i], c = cnt[i];',
        '    if (c === 1) {',
        '      for (let j = m; j >= v; j--) if (dp[j - v]) dp[j] = true;',
        '    } else if (v * c >= m) {',
        '      for (let j = v; j <= m; j++) if (dp[j - v]) dp[j] = true;',
        '    } else {',
        '      for (let mod = 0; mod < v; mod++) {',
        '        let trueCnt = 0;',
        '        for (let j = m - mod, sz = 0; j >= 0 && sz <= c; j -= v, sz++) {',
        '          if (dp[j]) trueCnt++;',
        '        }',
        '        for (let j = m - mod, l = j - v * (c + 1); j >= 1; j -= v, l -= v) {',
        '          if (dp[j]) trueCnt--;',
        '          else if (trueCnt > 0) dp[j] = true;',
        '          if (l >= 0 && dp[l]) trueCnt++;',
        '        }',
        '      }',
        '    }',
        '  }',
        '  let ans = 0;',
        '  for (let j = 1; j <= m; j++) if (dp[j]) ans++;',
        '  return ans;',
        '}',
      ],
    },
  },
};
