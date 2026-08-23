/**
 * 有向图完全连通性检测 (Strongly Connected)
 * 从每个节点 BFS，检查是否可达所有节点
 * 若每个节点的可达集均为全集，则为强连通
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './strongly-connected.html?raw';

interface SCCStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  bfsSource: number | null;
  visited: Set<number>;
  currentNode: number | null;
  exploringEdge: [number, number] | null;
  reachableNodes: number[];
  allReachable: boolean[];
  isStronglyConnected: boolean | null;
  phase: 'init' | 'bfs-start' | 'bfs-explore' | 'bfs-done' | 'final';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseAdjList(input: string): { adjList: number[][]; nodes: number[]; edges: [number, number][] } {
  const entries = input.split(';').map(s => s.trim()).filter(s => s.length > 0);
  let maxNode = 0;
  const rawEdges: [number, number][] = [];
  const rawAdj: Map<number, number[]> = new Map();

  for (const entry of entries) {
    const [srcPart, dstPart] = entry.split(':');
    const src = parseInt(srcPart.trim(), 10);
    if (isNaN(src)) continue;
    const dsts = dstPart
      ? dstPart.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : [];
    rawAdj.set(src, dsts);
    maxNode = Math.max(maxNode, src);
    for (const d of dsts) {
      maxNode = Math.max(maxNode, d);
      rawEdges.push([src, d]);
    }
  }

  const n = maxNode + 1;
  const adjList: number[][] = Array.from({ length: n }, () => []);
  for (const [src, dsts] of rawAdj) {
    adjList[src] = dsts;
  }

  const nodes = Array.from({ length: n }, (_, i) => i);
  return { adjList, nodes, edges: rawEdges };
}

function getNodePositions(nodeCount: number): { x: number; y: number }[] {
  if (nodeCount <= 4) {
    const positions = [
      { x: 240, y: 40 },
      { x: 400, y: 140 },
      { x: 300, y: 260 },
      { x: 100, y: 260 },
      { x: 80, y: 140 },
      { x: 240, y: 160 },
    ];
    return positions.slice(0, nodeCount);
  }
  const cx = 240, cy = 140, r = 110;
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / nodeCount - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / nodeCount - Math.PI / 2),
  }));
}

function buildSteps(adjInput: string): SCCStep[] {
  const steps: SCCStep[] = [];
  const { adjList, nodes, edges } = parseAdjList(adjInput);
  const n = nodes.length;

  steps.push({
    nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
    bfsSource: null, visited: new Set(), currentNode: null, exploringEdge: null,
    reachableNodes: [], allReachable: Array(n).fill(false),
    isStronglyConnected: null, phase: 'init',
    message: `有向图包含 ${n} 个节点、${edges.length} 条边。将从每个节点 BFS 检测可达性。`,
    log: `初始化: ${n} 节点, ${edges.length} 边`,
    codeLine: 0,
  });

  const allReachable = Array(n).fill(false);

  for (let source = 0; source < n; source++) {
    const visited = new Set<number>();
    const reachableNodes: number[] = [];
    const queue: number[] = [];

    visited.add(source);
    queue.push(source);
    reachableNodes.push(source);

    steps.push({
      nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
      bfsSource: source, visited: new Set(visited), currentNode: source, exploringEdge: null,
      reachableNodes: [...reachableNodes], allReachable: [...allReachable],
      isStronglyConnected: null, phase: 'bfs-start',
      message: `从节点 ${source} 开始 BFS。`,
      log: `BFS from ${source}:`,
      codeLine: [1, 2],
    });

    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];

      for (const v of adjList[u]) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          reachableNodes.push(v);

          steps.push({
            nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
            bfsSource: source, visited: new Set(visited), currentNode: u, exploringEdge: [u, v],
            reachableNodes: [...reachableNodes], allReachable: [...allReachable],
            isStronglyConnected: null, phase: 'bfs-explore',
            message: `发现 ${u} → ${v}，节点 ${v} 未访问，标记可达。`,
            log: `  ${u} → ${v} ✓`,
            codeLine: [3, 4, 5],
          });
        }
      }
    }

    const sourceReachableAll = visited.size === n;
    allReachable[source] = sourceReachableAll;

    steps.push({
      nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
      bfsSource: source, visited: new Set(visited), currentNode: null, exploringEdge: null,
      reachableNodes: [...reachableNodes], allReachable: [...allReachable],
      isStronglyConnected: null, phase: 'bfs-done',
      message: `节点 ${source} 的 BFS 完成：可达 ${visited.size}/${n} 个节点。${sourceReachableAll ? '可达全部！' : '存在不可达节点！'}`,
      log: `  结果: ${visited.size}/${n} ${sourceReachableAll ? '✓' : '✗'}`,
      codeLine: 6,
    });
  }

  const isSC = allReachable.every(b => b);

  steps.push({
    nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
    bfsSource: null, visited: new Set(), currentNode: null, exploringEdge: null,
    reachableNodes: [], allReachable: [...allReachable],
    isStronglyConnected: isSC, phase: 'final',
    message: isSC
      ? `结论：图是强连通的！所有节点都能互相到达。`
      : `结论：图不是强连通的。节点 {${allReachable.map((b, i) => b ? null : i).filter(x => x !== null).join(',')}} 不能到达所有节点。`,
    log: `最终: ${isSC ? '强连通 ✓' : '非强连通 ✗'}`,
    codeLine: 8,
  });

  return steps;
}

export class StronglyConnectedVisualizer extends StepVisualizer<SCCStep> {
  protected codeLines = [
    'public boolean isStronglyConnected(List<List<Integer>> graph) {',
    '    int n = graph.size();',
    '    for (int source = 0; source < n; source++) {',
    '        boolean[] visited = new boolean[n];',
    '        Queue<Integer> queue = new LinkedList<>();',
    '        visited[source] = true;',
    '        queue.offer(source);',
    '        int count = 0;',
    '        while (!queue.isEmpty()) {',
    '            int u = queue.poll();',
    '            count++;',
    '            for (int v : graph.get(u))',
    '                if (!visited[v]) {',
    '                    visited[v] = true;',
    '                    queue.offer(v);',
    '                }',
    '        }',
    '        if (count < n) return false;',
    '    }',
    '    return true;',
    '}',
  ];
  protected codePanelTitle = '完全连通检测代码 (Java)';

  private adjInput: HTMLInputElement | null = null;
  private graphEl: HTMLElement | null = null;
  private reachEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private sourceEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private totalEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.adjInput = this.root.querySelector('#scc-adj-input');
    this.graphEl = this.root.querySelector('#scc-graph');
    this.reachEl = this.root.querySelector('#scc-reach-list');
    this.logEl = this.root.querySelector('#scc-log');
    this.sourceEl = this.root.querySelector('#scc-source');
    this.visitedEl = this.root.querySelector('#scc-visited');
    this.totalEl = this.root.querySelector('#scc-total');
    this.resultEl = this.root.querySelector('#scc-result');

    const startBtn = this.root.querySelector('#scc-start') as HTMLButtonElement | null;
    if (startBtn) startBtn.onclick = () => this.start();

    this.root.querySelectorAll('.scc-example').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        if (this.adjInput) this.adjInput.value = (btn as HTMLElement).dataset.adj || '';
        this.start();
      };
    });

    this.bindPlaybackControls({ speed: 'scc-speed', speedLabel: 'scc-speed-label', message: 'step-message' });
  }

  protected buildSteps(): SCCStep[] {
    const val = this.adjInput?.value || '0:1; 1:2; 2:0';
    return buildSteps(val);
  }

  protected renderStep(step: SCCStep): void {
    if (this.sourceEl) this.sourceEl.textContent = step.bfsSource !== null ? String(step.bfsSource) : '-';
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited.size);
    if (this.totalEl) this.totalEl.textContent = String(step.nodes.length);
    if (this.resultEl) {
      if (step.isStronglyConnected === true) this.resultEl.textContent = 'SC';
      else if (step.isStronglyConnected === false) this.resultEl.textContent = 'NO';
      else this.resultEl.textContent = '...';
    }

    this.renderGraph(step);
    this.renderReach(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: SCCStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const positions = getNodePositions(step.nodes.length);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '260px';

    // Arrowhead defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'scc-arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', 'rgba(99,102,241,0.5)');
    marker?.appendChild(polygon);
    defs?.appendChild(marker);

    const markerHl = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerHl.setAttribute('id', 'scc-arrowhead-hl');
    markerHl.setAttribute('markerWidth', '10');
    markerHl.setAttribute('markerHeight', '7');
    markerHl.setAttribute('refX', '10');
    markerHl.setAttribute('refY', '3.5');
    markerHl.setAttribute('orient', 'auto');
    const polyHl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyHl.setAttribute('points', '0 0, 10 3.5, 0 7');
    polyHl.setAttribute('fill', '#a5b4fc');
    markerHl?.appendChild(polyHl);
    defs?.appendChild(markerHl);

    const markerFail = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerFail.setAttribute('id', 'scc-arrowhead-fail');
    markerFail.setAttribute('markerWidth', '10');
    markerFail.setAttribute('markerHeight', '7');
    markerFail.setAttribute('refX', '10');
    markerFail.setAttribute('refY', '3.5');
    markerFail.setAttribute('orient', 'auto');
    const polyFail = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyFail.setAttribute('points', '0 0, 10 3.5, 0 7');
    polyFail.setAttribute('fill', '#fda4af');
    markerFail?.appendChild(polyFail);
    defs?.appendChild(markerFail);

    svg?.appendChild(defs);

    // Draw edges
    for (const [u, v] of step.edges) {
      const p1 = positions[u];
      const p2 = positions[v];
      const isHl = step.exploringEdge && step.exploringEdge[0] === u && step.exploringEdge[1] === v;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nodeR = 24;
      const startX = p1.x + (dx / len) * nodeR;
      const startY = p1.y + (dy / len) * nodeR;
      const endX = p2.x - (dx / len) * nodeR;
      const endY = p2.y - (dy / len) * nodeR;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(startX));
      line.setAttribute('y1', String(startY));
      line.setAttribute('x2', String(endX));
      line.setAttribute('y2', String(endY));

      if (isHl) {
        line.setAttribute('stroke', '#a5b4fc');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('marker-end', 'url(#scc-arrowhead-hl)');
        line.style.animation = 'pulse 0.8s infinite';
      } else {
        line.setAttribute('stroke', 'rgba(99,102,241,0.3)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#scc-arrowhead)');
      }

      line.classList.add('scc-edge');
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = positions[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('scc-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (step.currentNode === node && step.bfsSource === node) {
        circle.setAttribute('fill', '#818cf8');
        circle.setAttribute('stroke', '#818cf8');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (step.visited.has(node)) {
        circle.setAttribute('fill', 'rgba(165,180,252,0.3)');
        circle.setAttribute('stroke', '#a5b4fc');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(99,102,241,0.15)');
        circle.setAttribute('stroke', '#6366f1');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('stroke-dasharray', '4,3');
      }

      // Show unreachable nodes in red when final step
      if (step.phase === 'final' && !step.allReachable[node] && !step.isStronglyConnected) {
        circle.setAttribute('fill', 'rgba(244,63,94,0.2)');
        circle.setAttribute('stroke', '#f43f5e');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('stroke-dasharray', 'none');
      }

      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', step.visited.has(node) ? '#a5b4fc' : '#6366f1');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderReach(step: SCCStep): void {
    if (!this.reachEl) return;
    this.reachEl.innerHTML = '';

    step.reachableNodes.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'scc-reach-item';
      item.textContent = String(node);
      this.reachEl?.appendChild(item);
    });

    // Show unreachable nodes in red
    if (step.phase === 'bfs-done') {
      const unreachable = step.nodes.filter(n => !step.visited.has(n));
      unreachable.forEach((node) => {
        const item = document.createElement('div');
        item.className = 'scc-reach-item unreachable';
        item.textContent = String(node);
        this.reachEl?.appendChild(item);
      });
    }

    if (step.reachableNodes.length === 0 && step.phase !== 'bfs-done') {
      const empty = document.createElement('span');
      empty.textContent = '(等待开始)';
      empty.style.color = 'rgba(204,214,244,0.4)';
      empty.style.fontSize = '13px';
      this.reachEl?.appendChild(empty);
    }
  }

  private renderLogLine(step: SCCStep): void {
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
  id: 'strongly-connected',
  name: '完全连通性',
  viewId: 'algo-strongly-connected-view',
  category: 'graph',
  description: '检测有向图中所有节点是否能互相到达（强连通）',
  icon: '🔗',
  template,
  Visualizer: StronglyConnectedVisualizer,
  difficulty: 3,
  levelOrder: 13,
  learningGoal: '掌握强连通性检测与 BFS 遍历',
});

export {};
