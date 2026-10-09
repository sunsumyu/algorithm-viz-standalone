/**
 * 最短路算法总结篇步进推演编译器 (Shortest Path Summary Step Compiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：对比五大最短路算法 (Dijkstra, Bellman-Ford, SPFA, Floyd, A*) 特性与步骤生成
 */

export interface SPSStep {
  activeAlgo: string;
  cards: { id: string; icon: string; name: string; desc: string; tags: { text: string; color: string }[] }[];
  detail: string | null;
  message: string;
  log: string;
  codeLine: number | number[];
}

export const SPS_ALGOS = [
  {
    id: 'dijkstra',
    icon: '🟢',
    name: 'Dijkstra',
    desc: '贪心策略，每次选距离最小的节点扩展。仅适用于非负权图，配合优先队列效率极高。',
    tags: [
      { text: '单源', color: '' },
      { text: 'O((V+E)logV)', color: 'green' },
      { text: '非负权', color: 'yellow' },
    ],
    detail: `<strong>Dijkstra 算法</strong>
<ul>
<li><strong>核心思想：</strong>维护一个已确定最短路的集合，每次从中扩展最近的未访问节点。</li>
<li><strong>贪心策略：</strong>每次选 dist 最小的节点 u，松弛其所有邻居。</li>
<li><strong>数据结构：</strong>优先队列（最小堆）优化，O((V+E)logV)。</li>
<li><strong>限制：</strong>不能处理负权边（贪心假设被破坏）。</li>
<li><strong>典型应用：</strong>地图导航、网络路由。</li>
</ul>`,
  },
  {
    id: 'bellman-ford',
    icon: '🔴',
    name: 'Bellman-Ford',
    desc: 'V-1 轮松弛所有边，可处理负权、判断负环。最坏 O(VE)。',
    tags: [
      { text: '单源', color: '' },
      { text: 'O(VE)', color: 'yellow' },
      { text: '支持负权', color: 'green' },
    ],
    detail: `<strong>Bellman-Ford 算法</strong>
<ul>
<li><strong>核心思想：</strong>对所有边做 V-1 轮松弛操作。</li>
<li><strong>负环检测：</strong>第 V 轮仍可松弛则存在负环。</li>
<li><strong>有限边数：</strong>迭代 k 轮即得最多 k 条边的最短路。</li>
<li><strong>优势：</strong>能处理负权边，实现简单。</li>
<li><strong>劣势：</strong>时间复杂度 O(VE) 较高。</li>
</ul>`,
  },
  {
    id: 'spfa',
    icon: '🔵',
    name: 'SPFA',
    desc: 'Bellman-Ford 的队列优化版，平均 O(kE)。负权可处理，但最坏仍 O(VE)。',
    tags: [
      { text: '单源', color: '' },
      { text: 'O(kE) 平均', color: 'green' },
      { text: '支持负权', color: 'green' },
    ],
    detail: `<strong>SPFA (Shortest Path Faster Algorithm)</strong>
<ul>
<li><strong>核心思想：</strong>用队列存储待松弛节点，避免冗余松弛。</li>
<li><strong>优化：</strong>只有被更新过的节点才重新入队。</li>
<li><strong>复杂度：</strong>平均 O(kE)，k 为常数。最坏 O(VE)（被卡）。</li>
<li><strong>注意：</strong>竞赛中容易被构造数据卡，不建议盲目使用。</li>
<li><strong>典型应用：</strong>负权图单源最短路。</li>
</ul>`,
  },
  {
    id: 'floyd',
    icon: '🟣',
    name: 'Floyd-Warshall',
    desc: '动态规划求所有点对最短路。O(V^3)，代码极简短，小规模图首选。',
    tags: [
      { text: '全源', color: '' },
      { text: 'O(V^3)', color: 'yellow' },
      { text: '支持负权', color: 'green' },
    ],
    detail: `<strong>Floyd-Warshall 算法</strong>
<ul>
<li><strong>核心思想：</strong>dp[i][j][k] = min(dp[i][j][k-1], dp[i][k][k-1] + dp[k][j][k-1])。</li>
<li><strong>简化：</strong>第一维可省略，in-place 更新。</li>
<li><strong>三重循环：</strong>k 为中间点，i,j 为端点对。</li>
<li><strong>优势：</strong>代码极短（3 行循环），全源一次算出。</li>
<li><strong>劣势：</strong>O(V^3)，大规模图效率低。</li>
</ul>`,
  },
  {
    id: 'a-star',
    icon: '🟡',
    name: 'A* 搜索',
    desc: '启发式搜索 f(n)=g(n)+h(n)，结合 Dijkstra 和贪心最佳优先搜索的优点。',
    tags: [
      { text: '单源', color: '' },
      { text: 'O(b^d)', color: 'yellow' },
      { text: '需启发函数', color: 'yellow' },
    ],
    detail: `<strong>A* 算法</strong>
<ul>
<li><strong>核心思想：</strong>f(n) = g(n) + h(n)，g 为实际代价，h 为启发估计。</li>
<li><strong>最优性：</strong>当 h 可容许（不超过真实代价）时，保证找到最优解。</li>
<li><strong>效率：</strong>好的启发函数可大幅减少搜索范围。</li>
<li><strong>启发函数：</strong>曼哈顿距离、欧几里得距离、对角距离。</li>
<li><strong>典型应用：</strong>游戏 AI 寻路、机器人路径规划。</li>
</ul>`,
  },
];

const lines: Record<string, number | number[]> = {
  overview: 0,
  summaryDone: 6,
};

export function buildSPSSteps(): SPSStep[] {
  const steps: SPSStep[] = [];

  steps.push({
    activeAlgo: '',
    cards: SPS_ALGOS.map((a) => ({ id: a.id, icon: a.icon, name: a.name, desc: a.desc, tags: a.tags })),
    detail: null,
    message: '最短路问题总结：5 种算法各有适用场景。点击查看每种算法的详细说明。',
    log: '总览: 最短路算法对比',
    codeLine: lines.overview,
  });

  for (const algo of SPS_ALGOS) {
    steps.push({
      activeAlgo: algo.id,
      cards: SPS_ALGOS.map((a) => ({ id: a.id, icon: a.icon, name: a.name, desc: a.desc, tags: a.tags })),
      detail: algo.detail,
      message: `正在查看 ${algo.name} 算法的详细说明。`,
      log: `查看: ${algo.name}`,
      codeLine: SPS_ALGOS.indexOf(algo) + 1,
    });
  }

  steps.push({
    activeAlgo: '',
    cards: SPS_ALGOS.map((a) => ({ id: a.id, icon: a.icon, name: a.name, desc: a.desc, tags: a.tags })),
    detail: null,
    message: '总结完成！选择算法时：非负权单源→Dijkstra，负权→Bellman-Ford/SPFA，全源→Floyd，有启发→A*。',
    log: '总结完成',
    codeLine: lines.summaryDone,
  });

  return steps;
}
