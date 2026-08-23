/**
 * 并查集理论基础可视化器
 * 演示 Union-Find 的路径压缩和按秩合并过程
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './union-find-theory.html?raw';

interface UFStep {
  parent: number[];
  rank: number[];
  activeNodes: number[];
  mergedSets: number[][];
  action: 'init' | 'find' | 'union' | 'compress' | 'done';
  opLabel: string;
  setsCount: number;
  mergesCount: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

const UF_NODE_POSITIONS = [
  { x: 80, y: 50 },
  { x: 200, y: 50 },
  { x: 320, y: 50 },
  { x: 400, y: 50 },
  { x: 140, y: 160 },
  { x: 280, y: 160 },
  { x: 400, y: 160 },
];

function buildUFSteps(): UFStep[] {
  const steps: UFStep[] = [];
  const n = 7;
  let parent = Array.from({ length: n }, (_, i) => i);
  let rank = new Array(n).fill(0);
  let merges = 0;

  const countSets = (p: number[]): number => {
    const roots = new Set<number>();
    for (let i = 0; i < p.length; i++) {
      let r = i;
      while (p[r] !== r) r = p[r];
      roots.add(r);
    }
    return roots.size;
  };

  const getMergedSets = (p: number[]): number[][] => {
    const map = new Map<number, number[]>();
    for (let i = 0; i < p.length; i++) {
      let r = i;
      while (p[r] !== r) r = p[r];
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(i);
    }
    return Array.from(map.values());
  };

  const find = (x: number, p: number[]): number => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  const snap = (action: UFStep['action'], opLabel: string, active: number[], msg: string, log: string, code: number | number[]) => {
    steps.push({
      parent: [...parent],
      rank: [...rank],
      activeNodes: [...active],
      mergedSets: getMergedSets(parent),
      action,
      opLabel,
      setsCount: countSets(parent),
      mergesCount: merges,
      message: msg,
      log,
      codeLine: code,
    });
  };

  snap('init', '初始化', [], `初始化 ${n} 个节点，每个节点自成一个集合。parent[i] = i，rank[i] = 0。共 ${n} 个集合。`, '初始化：7个独立集合', 0);

  // Union(0, 1)
  {
    const r0 = find(0, parent), r1 = find(1, parent);
    snap('find', 'find(0)', [0], `find(0) = ${r0}，find(1) = ${r1}。根不同，需要合并。`, 'find(0)=0, find(1)=1', [1, 2]);
    parent[r0] = r1;
    rank[r1] = Math.max(rank[r1], rank[r0] + 1);
    merges++;
    snap('union', 'union(0,1)', [0, 1], `将集合 0 合并到集合 1（按秩合并）。parent[0]=1, rank[1]=1。`, 'union(0,1): parent[0]=1', [3, 4, 5]);
  }

  // Union(2, 3)
  {
    const r2 = find(2, parent), r3 = find(3, parent);
    snap('find', 'find(2)', [2], `find(2) = ${r2}，find(3) = ${r3}。根不同，需要合并。`, 'find(2)=2, find(3)=3', [1, 2]);
    parent[r2] = r3;
    rank[r3] = Math.max(rank[r3], rank[r2] + 1);
    merges++;
    snap('union', 'union(2,3)', [2, 3], `将集合 2 合并到集合 3（按秩合并）。parent[2]=3, rank[3]=1。`, 'union(2,3): parent[2]=3', [3, 4, 5]);
  }

  // Union(1, 3) - merge two sets
  {
    const r1 = find(1, parent), r3 = find(3, parent);
    snap('find', 'find(1)', [1], `find(1) = ${r1}，find(3) = ${r3}。rank[${r1}]=${rank[r1]}, rank[${r3}]=${rank[r3]}。`, 'find(1)=1, find(3)=3', [1, 2]);
    // rank[1]=1, rank[3]=1, so 1 becomes child of 3 (equal rank)
    parent[r1] = r3;
    rank[r3] = Math.max(rank[r3], rank[r1] + 1);
    merges++;
    snap('union', 'union(1,3)', [1, 3], `将集合 1 合并到集合 3（按秩合并）。parent[1]=3, rank[3]=2。节点0,1,2,3 现在同一集合！`, 'union(1,3): parent[1]=3', [3, 4, 5]);
  }

  // Find with path compression: find(0)
  {
    const oldParent = [...parent];
    snap('find', 'find(0)', [0], `find(0)：从节点 0 开始向上查找根。0->1->3。根为 3。`, 'find(0): 0→1→3, root=3', 1);
    // Path compression
    parent[0] = 3;
    parent[1] = 3;
    snap('compress', '路径压缩', [0, 1, 3], `路径压缩：将 0 和 1 直接指向根节点 3，减少树高。parent[0]=3, parent[1]=3。`, '路径压缩: parent[0]=3, parent[1]=3', 6);
  }

  // Union(4, 5)
  {
    const r4 = find(4, parent), r5 = find(5, parent);
    snap('find', 'find(4)', [4], `find(4) = ${r4}，find(5) = ${r5}。根不同，需要合并。`, 'find(4)=4, find(5)=5', [1, 2]);
    parent[r4] = r5;
    rank[r5] = Math.max(rank[r5], rank[r4] + 1);
    merges++;
    snap('union', 'union(4,5)', [4, 5], `将集合 4 合并到集合 5。parent[4]=5, rank[5]=1。`, 'union(4,5): parent[4]=5', [3, 4, 5]);
  }

  // Union(3, 5) - merge big sets
  {
    const r3 = find(3, parent), r5 = find(5, parent);
    snap('find', 'find(3)', [3], `find(3) = ${r3}，find(5) = ${r5}。rank[3]=${rank[3]}, rank[5]=${rank[5]}。根不同，合并！`, 'find(3)=3, find(5)=5', [1, 2]);
    // rank[3]=2, rank[5]=1, so 5 becomes child of 3
    parent[r5] = r3;
    merges++;
    snap('union', 'union(3,5)', [3, 5], `将集合 5 合并到集合 3（按秩合并）。parent[5]=3。现在节点 0-5 同一集合！`, 'union(3,5): parent[5]=3', [3, 4, 5]);
  }

  // Final find(4) with compression
  {
    snap('find', 'find(4)', [4], `find(4)：从节点 4 向上查找根。4->5->3。根为 3。`, 'find(4): 4→5→3, root=3', 1);
    parent[4] = 3;
    snap('compress', '路径压缩', [4, 5, 3], `路径压缩：将 4 直接指向根节点 3。parent[4]=3。`, '路径压缩: parent[4]=3', 6);
  }

  // Union(6, 0) - last node
  {
    const r6 = find(6, parent), r0 = find(0, parent);
    snap('find', 'find(6)', [6], `find(6) = ${r6}，find(0) = ${r0}。根不同，合并。`, 'find(6)=6, find(0)=3', [1, 2]);
    parent[r6] = r0;
    merges++;
    snap('union', 'union(6,0)', [6, 0], `将节点 6 合并入集合。parent[6]=3。所有 7 个节点现在属于同一集合！`, 'union(6,0): parent[6]=3', [3, 4, 5]);
  }

  snap('done', '完成', [], `并查集操作完成！共进行 ${merges} 次合并。最终所有节点属于同一集合。路径压缩和按秩合并使操作接近 O(α(n))。`, '完成：全部合并', 7);

  return steps;
}

export class UnionFindTheoryVisualizer extends StepVisualizer<UFStep> {
  protected codeLines = [
    'int find(int x) {',
    '    while (parent[x] != x) x = parent[x];',
    '    return x;',
    '}',
    'void union(int x, int y) {',
    '    int rx = find(x), ry = find(y);',
    '    if (rank[rx] < rank[ry]) parent[rx] = ry;',
    '    else { parent[ry] = rx; /* path compression */ }',
    '}',
  ];
  protected codePanelTitle = '并查集代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private parentEl: HTMLElement | null = null;
  private rankEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private opEl: HTMLElement | null = null;
  private setsEl: HTMLElement | null = null;
  private nodesEl: HTMLElement | null = null;
  private mergesEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#uft-graph');
    this.parentEl = this.root.querySelector('#uft-parent');
    this.rankEl = this.root.querySelector('#uft-rank');
    this.logEl = this.root.querySelector('#uft-log');
    this.opEl = this.root.querySelector('#uft-op');
    this.setsEl = this.root.querySelector('#uft-sets');
    this.nodesEl = this.root.querySelector('#uft-nodes');
    this.mergesEl = this.root.querySelector('#uft-merges');
    this.btnStart = this.root.querySelector('#uft-start');
    this.bindPlaybackControls({
      speed: 'uft-speed',
      speedLabel: 'uft-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): UFStep[] {
    return buildUFSteps();
  }

  protected renderStep(step: UFStep): void {
    if (this.opEl) this.opEl.textContent = step.opLabel;
    if (this.setsEl) this.setsEl.textContent = String(step.setsCount);
    if (this.nodesEl) this.nodesEl.textContent = String(step.parent.length);
    if (this.mergesEl) this.mergesEl.textContent = String(step.mergesCount);

    this.renderGraph(step);
    this.renderArrays(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: UFStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 210');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '210px';

    const n = step.parent.length;
    const activeSet = new Set(step.activeNodes);

    // Draw parent edges
    for (let i = 0; i < n; i++) {
      if (step.parent[i] !== i) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const p1 = UF_NODE_POSITIONS[i];
        const p2 = UF_NODE_POSITIONS[step.parent[i]];
        line.setAttribute('x1', String(p1.x));
        line.setAttribute('y1', String(p1.y));
        line.setAttribute('x2', String(p2.x));
        line.setAttribute('y2', String(p2.y));
        const isActive = activeSet.has(i) || activeSet.has(step.parent[i]);
        line.setAttribute('stroke', isActive ? '#10b981' : 'rgba(16, 185, 129, 0.3)');
        line.setAttribute('stroke-width', isActive ? '3' : '2');
        if (isActive) {
          line.setAttribute('stroke-dasharray', '6,3');
        }
        line.classList.add('uft-edge');
        svg?.appendChild(line);

        // arrowhead
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const sz = 6;
        const pts = [
          `${mx + sz * Math.cos(angle)},${my + sz * Math.sin(angle)}`,
          `${mx + sz * Math.cos(angle + 2.5)},${my + sz * Math.sin(angle + 2.5)}`,
          `${mx + sz * Math.cos(angle - 2.5)},${my + sz * Math.sin(angle - 2.5)}`,
        ].join(' ');
        arrow.setAttribute('points', pts);
        arrow.setAttribute('fill', isActive ? '#10b981' : 'rgba(16, 185, 129, 0.4)');
        svg?.appendChild(arrow);
      }
    }

    // Draw nodes
    for (let i = 0; i < n; i++) {
      const pos = UF_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('uft-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (activeSet.has(i)) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (step.parent[i] !== i) {
        circle.setAttribute('fill', 'rgba(52, 211, 153, 0.3)');
        circle.setAttribute('stroke', '#34d399');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.2)');
        circle.setAttribute('stroke', '#10b981');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', activeSet.has(i) ? '#000' : '#10b981');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(i);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderArrays(step: UFStep): void {
    if (!this.parentEl) return;
    this.parentEl.innerHTML = '';
    const activeSet = new Set(step.activeNodes);
    step.parent.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'uft-array-item';
      if (activeSet.has(i)) item.classList.add('changed');
      item.innerHTML = `<span class="uft-idx">${i}</span>${val}`;
      this.parentEl?.appendChild(item);
    });

    if (!this.rankEl) return;
    this.rankEl.innerHTML = '';
    step.rank.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'uft-array-item';
      if (activeSet.has(i)) item.classList.add('changed');
      item.innerHTML = `<span class="uft-idx">${i}</span>${val}`;
      this.rankEl?.appendChild(item);
    });
  }

  private renderLogLine(step: UFStep): void {
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
  id: 'union-find-theory',
  name: '并查集理论基础',
  viewId: 'algo-union-find-theory-view',
  category: 'graph',
  description: 'Union-Find 路径压缩与按秩合并可视化',
  icon: '🔗',
  template,
  Visualizer: UnionFindTheoryVisualizer,
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '理解并查集的 find 和 union 操作，以及路径压缩和按秩合并优化',
});

export {};
