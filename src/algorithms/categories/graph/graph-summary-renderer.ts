/**
 * 图论总结篇可视化器
 * 全景浏览图论各领域的核心算法
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './graph-summary.html?raw';

interface GSStep {
  activeCategory: string;
  categories: { id: string; icon: string; name: string; desc: string; algos: string[]; detail: string; color: string }[];
  detail: string | null;
  message: string;
  log: string;
  codeLine: number | number[];
}

const GS_CATEGORIES = [
  {
    id: 'traversal',
    icon: '🔄',
    name: '遍历搜索',
    desc: 'DFS 深度优先 + BFS 广度优先，图论的基石。所有复杂算法的基础。',
    algos: ['DFS', 'BFS', '连通分量'],
    detail: `<strong>遍历搜索</strong>
<ul>
<li><strong>DFS：</strong>递归/栈实现，深入优先。用于路径搜索、拓扑排序、强连通分量。</li>
<li><strong>BFS：</strong>队列实现，层序优先。用于无权图最短路、连通性判定。</li>
<li><strong>连通分量：</strong>DFS/BFS 统计连通块数量，标记组件归属。</li>
<li><strong>核心数据结构：</strong>visited 数组防止重复访问。</li>
</ul>`,
    color: '#10b981',
  },
  {
    id: 'union-find',
    icon: '🔗',
    name: '并查集',
    desc: '高效维护不相交集合，支持查找和合并。路径压缩 + 按秩合并后接近 O(1)。',
    algos: ['查找', '合并', '路径压缩', '按秩合并'],
    detail: `<strong>并查集 (Union-Find)</strong>
<ul>
<li><strong>操作：</strong>find(x) 返回 x 所在集合的代表，union(x,y) 合并两个集合。</li>
<li><strong>路径压缩：</strong>find 时将沿途节点直接指向根。</li>
<li><strong>按秩合并：</strong>合并时将小树挂到大树下。</li>
<li><strong>复杂度：</strong>O(α(n))，α 为反阿克曼函数，几乎为常数。</li>
<li><strong>应用：</strong>判环、连通性、Kruskal 算法。</li>
</ul>`,
    color: '#3b82f6',
  },
  {
    id: 'mst',
    icon: '🌲',
    name: '最小生成树',
    desc: '连接所有节点的最小权重边集。Kruskal + Prim 两大经典算法。',
    algos: ['Kruskal', 'Prim'],
    detail: `<strong>最小生成树 (MST)</strong>
<ul>
<li><strong>Kruskal：</strong>按边权排序，贪心加入不构成环的边。用并查集判环。</li>
<li><strong>Prim：</strong>从某节点出发，每次加入最近的未访问节点。类似 Dijkstra。</li>
<li><strong>性质：</strong>n 个节点的树恰有 n-1 条边。</li>
<li><strong>应用：</strong>网络布线、电路设计、聚类分析。</li>
</ul>`,
    color: '#a855f7',
  },
  {
    id: 'topological',
    icon: '📋',
    name: '拓扑排序',
    desc: '有向无环图的线性排序。每个节点在所有其前驱之后出现。',
    algos: ['Kahn 算法', 'DFS 法'],
    detail: `<strong>拓扑排序</strong>
<ul>
<li><strong>Kahn 算法：</strong>不断移除入度为 0 的节点。用队列维护候选集。</li>
<li><strong>DFS 法：</strong>后序遍历反转即拓扑序。</li>
<li><strong>判环：</strong>如果排序后节点数 < V，说明有环。</li>
<li><strong>应用：</strong>任务调度、依赖解析、课程安排。</li>
</ul>`,
    color: '#eab308',
  },
  {
    id: 'shortest-path',
    icon: '📏',
    name: '最短路径',
    desc: '图中两点间的最小权重路径。五大算法各有适用场景。',
    algos: ['Dijkstra', 'Bellman-Ford', 'SPFA', 'Floyd', 'A*'],
    detail: `<strong>最短路径</strong>
<ul>
<li><strong>Dijkstra：</strong>O((V+E)logV)，非负权。</li>
<li><strong>Bellman-Ford：</strong>O(VE)，支持负权/判负环。</li>
<li><strong>SPFA：</strong>平均 O(kE)，Bellman-Ford 队列优化。</li>
<li><strong>Floyd：</strong>O(V^3)，全源最短路。</li>
<li><strong>A*：</strong>启发式搜索，有启发函数时效率极高。</li>
</ul>`,
    color: '#ef4444',
  },
];

function buildGSSteps(): GSStep[] {
  const steps: GSStep[] = [];

  steps.push({
    activeCategory: '',
    categories: GS_CATEGORIES.map(c => ({
      id: c.id, icon: c.icon, name: c.name, desc: c.desc, algos: c.algos, detail: c.detail, color: c.color,
    })),
    detail: null,
    message: '图论算法全景概览。包含遍历搜索、并查集、最小生成树、拓扑排序、最短路径五大领域。点击分类卡片查看详情。',
    log: '总览: 图论算法全景',
    codeLine: 0,
  });

  for (const cat of GS_CATEGORIES) {
    steps.push({
      activeCategory: cat.id,
      categories: GS_CATEGORIES.map(c => ({
        id: c.id, icon: c.icon, name: c.name, desc: c.desc, algos: c.algos, detail: c.detail, color: c.color,
      })),
      detail: cat.detail,
      message: `正在查看「${cat.name}」领域的核心算法。包含: ${cat.algos.join(', ')}。`,
      log: `查看: ${cat.name}`,
      codeLine: GS_CATEGORIES.indexOf(cat) + 1,
    });
  }

  steps.push({
    activeCategory: '',
    categories: GS_CATEGORIES.map(c => ({
      id: c.id, icon: c.icon, name: c.name, desc: c.desc, algos: c.algos, detail: c.detail, color: c.color,
    })),
    detail: null,
    message: '图论总结完成！五大领域构成了图论的核心知识体系，是面试和竞赛的必考内容。',
    log: '总结完成',
    codeLine: 6,
  });

  return steps;
}

export class GraphSummaryVisualizer extends StepVisualizer<GSStep> {
  protected codeLines = [
    '// Graph Algorithm Knowledge Map (Java)',
    '// 1. Traversal: DFS (recursion) / BFS (Queue<Integer>)',
    '// 2. Union-Find: int[] parent + int[] rank + find() + union()',
    '// 3. MST: Kruskal (Arrays.sort + UF) / Prim (PriorityQueue<int[]>)',
    '// 4. Topological Sort: Queue<Integer> + in-degree array',
    '// 5. Shortest Path: Dijkstra / Bellman-Ford / SPFA / Floyd / A*',
  ];
  protected codePanelTitle = '图论算法总览 (Java)';

  private mindmapEl: HTMLElement | null = null;
  private cardsEl: HTMLElement | null = null;
  private detailEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.mindmapEl = this.root.querySelector('#gs-mindmap');
    this.cardsEl = this.root.querySelector('#gs-cards');
    this.detailEl = this.root.querySelector('#gs-detail');
    this.logEl = this.root.querySelector('#gs-log');
    this.btnStart = this.root.querySelector('#gs-start');
    this.bindPlaybackControls({
      speed: 'gs-speed',
      speedLabel: 'gs-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): GSStep[] {
    return buildGSSteps();
  }

  protected renderStep(step: GSStep): void {
    this.renderMindmap(step);
    this.renderCards(step);
    this.renderDetail(step);
    this.renderLogLine(step);
  }

  private renderMindmap(step: GSStep): void {
    if (!this.mindmapEl) return;
    this.mindmapEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 600 240');
    svg.style.width = '100%';
    svg.style.maxWidth = '600px';
    svg.style.height = '240px';

    const cx = 300, cy = 120;
    const nodeR = 28;
    const branchR = 18;

    // Root node
    const rootG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const rootCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rootCircle.setAttribute('cx', String(cx));
    rootCircle.setAttribute('cy', String(cy));
    rootCircle.setAttribute('r', String(nodeR));
    rootCircle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
    rootCircle.setAttribute('stroke', '#10b981');
    rootCircle.setAttribute('stroke-width', '2.5');
    rootG?.appendChild(rootCircle);

    const rootText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    rootText.setAttribute('x', String(cx));
    rootText.setAttribute('y', String(cy + 1));
    rootText.setAttribute('text-anchor', 'middle');
    rootText.setAttribute('fill', '#10b981');
    rootText.setAttribute('font-size', '12');
    rootText.setAttribute('font-weight', '800');
    rootText.setAttribute('font-family', '-apple-system, sans-serif');
    rootText.textContent = '图论';
    rootG?.appendChild(rootText);
    svg?.appendChild(rootG);

    // Branch nodes
    const branches = [
      { label: '遍历搜索', x: 100, y: 40, color: '#10b981' },
      { label: '并查集', x: 100, y: 200, color: '#3b82f6' },
      { label: '最小生成树', x: 250, y: 20, color: '#a855f7' },
      { label: '拓扑排序', x: 400, y: 20, color: '#eab308' },
      { label: '最短路径', x: 500, y: 200, color: '#ef4444' },
    ];

    // Draw connections
    branches.forEach(b => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cx));
      line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(b.x));
      line.setAttribute('y2', String(b.y));
      line.setAttribute('stroke', b.color);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-opacity', '0.3');
      line.setAttribute('stroke-dasharray', '4,3');
      svg?.appendChild(line);

      // Node
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(b.x));
      circle.setAttribute('cy', String(b.y));
      circle.setAttribute('r', String(branchR));
      circle.setAttribute('fill', b.color + '33');
      circle.setAttribute('stroke', b.color);
      circle.setAttribute('stroke-width', '2');
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(b.x));
      text.setAttribute('y', String(b.y + 1));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', b.color);
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', '-apple-system, sans-serif');
      text.textContent = b.label;
      g?.appendChild(text);
      svg?.appendChild(g);
    });

    this.mindmapEl?.appendChild(svg);
  }

  private renderCards(step: GSStep): void {
    if (!this.cardsEl) return;
    this.cardsEl.innerHTML = '';
    step.categories.forEach(cat => {
      const el = document.createElement('div');
      el.className = 'gs-category-card';
      if (step.activeCategory === cat.id) el.classList.add('active');
      el.style.borderTopColor = cat.color;
      (el as HTMLElement).style.setProperty('--gs-color', cat.color);
      if (el.querySelector('style')) {
        // We'll use inline style for the ::before pseudo-element approach
      }

      el.innerHTML = `
        <div class="gs-category-icon">${cat.icon}</div>
        <div class="gs-category-name">${cat.name}</div>
        <div class="gs-category-desc">${cat.desc}</div>
        <div class="gs-algo-list">
          ${cat.algos.map(a => `<span class="gs-algo-tag">${a}</span>`).join('')}
        </div>
      `;

      el.addEventListener('click', () => {
        const idx = GS_CATEGORIES.findIndex(c => c.id === cat.id);
        if (idx >= 0 && idx + 1 < this.steps.length) {
          this.pause();
          this.currentIndex = idx + 1;
          this.render();
          this.updateButtons();
        }
      });

      this.cardsEl?.appendChild(el);
    });
  }

  private renderDetail(step: GSStep): void {
    if (!this.detailEl) return;
    if (step.detail) {
      (this.detailEl as HTMLElement).style.display = '';
      this.detailEl.innerHTML = `<div class="gs-detail-content">${step.detail}</div>`;
    } else {
      (this.detailEl as HTMLElement).style.display = 'none';
    }
  }

  private renderLogLine(step: GSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'graph-summary',
  name: '图论总结篇',
  viewId: 'algo-graph-summary-view',
  category: 'graph',
  description: '图论算法全景：遍历搜索、并查集、最小生成树、拓扑排序、最短路径',
  icon: '🗺️',
  template,
  Visualizer: GraphSummaryVisualizer,
  difficulty: 1,
  levelOrder: 30,
  learningGoal: '掌握图论五大核心领域及其经典算法',
});

export {};
