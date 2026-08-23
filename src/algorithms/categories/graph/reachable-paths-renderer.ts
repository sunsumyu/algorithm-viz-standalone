/**
 * 可达路径可视化器
 * 从源节点出发，用 DFS 找到有向图中所有可达节点
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reachable-paths.html?raw';

interface RPStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  source: number;
  visited: Set<number>;
  currentNode: number | null;
  stack: number[];
  reachableNodes: number[];
  exploringEdge: [number, number] | null;
  action: 'init' | 'visit' | 'explore' | 'skip' | 'backtrack' | 'done';
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
  // Circle layout
  const cx = 240, cy = 150, r = 110;
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / nodeCount - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / nodeCount - Math.PI / 2),
  }));
}

function buildReachableSteps(adjInput: string, sourceStr: string): RPStep[] {
  const steps: RPStep[] = [];
  const { adjList, nodes, edges } = parseAdjList(adjInput);
  const source = parseInt(sourceStr, 10);

  if (isNaN(source) || source < 0 || source >= nodes.length) {
    steps.push({
      nodes, edges, adjList, source: 0,
      visited: new Set(), currentNode: null, stack: [], reachableNodes: [],
      exploringEdge: null, action: 'init',
      message: `源节点 ${sourceStr} 无效，使用节点 0 作为源。`,
      log: '源节点无效',
      codeLine: 0,
    });
    return steps;
  }

  const visited = new Set<number>();
  const stack: number[] = [];
  const reachableNodes: number[] = [];

  steps.push({
    nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
    source, visited: new Set(visited), currentNode: null, stack: [...stack],
    reachableNodes: [...reachableNodes], exploringEdge: null,
    action: 'init',
    message: `有向图包含 ${nodes.length} 个节点、${edges.length} 条边。从源节点 ${source} 出发，用 DFS 寻找所有可达节点。`,
    log: `初始化: ${nodes.length} 节点, ${edges.length} 边, 源 = ${source}`,
    codeLine: 0,
  });

  const dfs = (u: number): void => {
    visited.add(u);
    stack.push(u);
    reachableNodes.push(u);

    steps.push({
      nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
      source, visited: new Set(visited), currentNode: u, stack: [...stack],
      reachableNodes: [...reachableNodes], exploringEdge: null,
      action: 'visit',
      message: `访问节点 ${u}，标记为可达。从 ${source} 到 ${u} 存在路径。`,
      log: `访问 ${u}，可达集合: {${reachableNodes.join(', ')}}`,
      codeLine: [1, 2, 3],
    });

    for (const v of adjList[u]) {
      if (!visited.has(v)) {
        steps.push({
          nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
          source, visited: new Set(visited), currentNode: u, stack: [...stack],
          reachableNodes: [...reachableNodes], exploringEdge: [u, v],
          action: 'explore',
          message: `发现出边 ${u} → ${v}，节点 ${v} 未访问，递归深入。`,
          log: `探索边 ${u} → ${v}`,
          codeLine: [4, 5],
        });
        dfs(v);
      } else {
        steps.push({
          nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
          source, visited: new Set(visited), currentNode: u, stack: [...stack],
          reachableNodes: [...reachableNodes], exploringEdge: [u, v],
          action: 'skip',
          message: `出边 ${u} → ${v}：节点 ${v} 已访问过（已可达），跳过。`,
          log: `跳过已访问的 ${v}`,
          codeLine: [4, 6],
        });
      }
    }

    stack.pop();
    if (stack.length > 0) {
      steps.push({
        nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
        source, visited: new Set(visited), currentNode: stack[stack.length - 1], stack: [...stack],
        reachableNodes: [...reachableNodes], exploringEdge: null,
        action: 'backtrack',
        message: `节点 ${u} 的所有出边处理完毕，回溯到节点 ${stack[stack.length - 1]}。`,
        log: `回溯到 ${stack[stack.length - 1]}`,
        codeLine: 7,
      });
    }
  };

  dfs(source);

  const unreachable = nodes.filter(n => !visited.has(n));
  steps.push({
    nodes: [...nodes], edges: [...edges], adjList: adjList.map(r => [...r]),
    source, visited: new Set(visited), currentNode: null, stack: [],
    reachableNodes: [...reachableNodes], exploringEdge: null,
    action: 'done',
    message: `可达性分析完成！从节点 ${source} 可达 ${reachableNodes.length} 个节点: {${reachableNodes.join(', ')}}。${unreachable.length > 0 ? `不可达节点: {${unreachable.join(', ')}}。` : '所有节点均可达。'}`,
    log: `完成: 可达 {${reachableNodes.join(', ')}}, 不可达 {${unreachable.join(', ') || '无'}}`,
    codeLine: 8,
  });

  return steps;
}

export class ReachablePathsVisualizer extends StepVisualizer<RPStep> {
  protected codeLines = [
    'public Set<Integer> reachable(List<List<Integer>> graph, int source) {',
    '    int n = graph.size();',
    '    boolean[] visited = new boolean[n];',
    '    Set<Integer> reachableSet = new HashSet<>();',
    '    dfs(source, graph, visited, reachableSet);',
    '    return reachableSet;',
    '}',
    'private void dfs(int u, List<List<Integer>> graph,',
    '        boolean[] visited, Set<Integer> reachableSet) {',
    '    visited[u] = true;',
    '    reachableSet.add(u);',
    '    for (int v : graph.get(u)) {',
    '        if (!visited[v]) {',
    '            dfs(v, graph, visited, reachableSet);',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = '可达路径 DFS 代码 (Java)';

  private adjInput: HTMLInputElement | null = null;
  private sourceInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private graphEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private reachableEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private reachableCountEl: HTMLElement | null = null;
  private stackSizeEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.adjInput = this.root.querySelector('#rp-adj-input');
    this.sourceInput = this.root.querySelector('#rp-source-input');
    this.btnStart = this.root.querySelector('#rp-start');
    this.exampleButtons = this.root.querySelectorAll('.rp-example');
    this.graphEl = this.root.querySelector('#rp-graph');
    this.stackEl = this.root.querySelector('#rp-stack');
    this.reachableEl = this.root.querySelector('#rp-reachable-list');
    this.logEl = this.root.querySelector('#rp-log');
    this.currentEl = this.root.querySelector('#rp-current');
    this.visitedEl = this.root.querySelector('#rp-visited');
    this.reachableCountEl = this.root.querySelector('#rp-reachable');
    this.stackSizeEl = this.root.querySelector('#rp-stack-size');
    this.bindPlaybackControls({
      speed: 'rp-speed',
      speedLabel: 'rp-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.adjInput && btn.dataset.adj !== undefined) this.adjInput.value = btn.dataset.adj;
        if (this.sourceInput && btn.dataset.src !== undefined) this.sourceInput.value = btn.dataset.src;
        this.start();
      };
    });
  }

  protected buildSteps(): RPStep[] {
    const adj = this.adjInput?.value || '0:1,2; 1:3; 2:3; 3:';
    const src = this.sourceInput?.value || '0';
    return buildReachableSteps(adj, src);
  }

  protected renderStep(step: RPStep): void {
    if (this.currentEl) this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited.size);
    if (this.reachableCountEl) this.reachableCountEl.textContent = String(step.reachableNodes.length);
    if (this.stackSizeEl) this.stackSizeEl.textContent = String(step.stack.length);

    this.renderGraph(step);
    this.renderStack(step);
    this.renderReachable(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: RPStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const positions = getNodePositions(step.nodes.length);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 300');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '240px';

    // Defs for arrowhead
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'rp-arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', 'rgba(249, 115, 22, 0.6)');
    marker?.appendChild(polygon);
    defs?.appendChild(marker);

    const markerHl = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerHl.setAttribute('id', 'rp-arrowhead-hl');
    markerHl.setAttribute('markerWidth', '10');
    markerHl.setAttribute('markerHeight', '7');
    markerHl.setAttribute('refX', '10');
    markerHl.setAttribute('refY', '3.5');
    markerHl.setAttribute('orient', 'auto');
    const polyHl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyHl.setAttribute('points', '0 0, 10 3.5, 0 7');
    polyHl.setAttribute('fill', '#f59e0b');
    markerHl?.appendChild(polyHl);
    defs?.appendChild(markerHl);

    svg?.appendChild(defs);

    // Draw edges with arrows
    for (const [u, v] of step.edges) {
      const p1 = positions[u];
      const p2 = positions[v];
      const isHl = step.exploringEdge && step.exploringEdge[0] === u && step.exploringEdge[1] === v;

      // Shorten line to not overlap with node circles
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
      line.setAttribute('stroke', isHl ? '#f59e0b' : 'rgba(249, 115, 22, 0.3)');
      line.setAttribute('stroke-width', isHl ? '3' : '2');
      line.setAttribute('marker-end', isHl ? 'url(#rp-arrowhead-hl)' : 'url(#rp-arrowhead)');
      line.classList.add('rp-edge');
      if (isHl) line.style.animation = 'pulse 0.8s infinite';
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = positions[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('rp-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (step.currentNode === node) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (step.visited.has(node)) {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
        circle.setAttribute('stroke', '#10b981');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(249, 115, 22, 0.2)');
        circle.setAttribute('stroke', '#f97316');
        circle.setAttribute('stroke-width', '2');
      }

      // Source node indicator
      if (node === step.source) {
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('stroke-dasharray', '5,3');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', step.currentNode === node ? '#000' : step.visited.has(node) ? '#10b981' : '#f97316');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderStack(step: RPStep): void {
    if (!this.stackEl) return;
    this.stackEl.innerHTML = '';
    step.stack.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'rp-stack-item';
      if (i === step.stack.length - 1) item.classList.add('top');
      item.textContent = String(node);
      this.stackEl?.appendChild(item);
    });
    if (step.stack.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = '(空)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.stackEl?.appendChild(empty);
    }
  }

  private renderReachable(step: RPStep): void {
    if (!this.reachableEl) return;
    this.reachableEl.innerHTML = '';
    step.reachableNodes.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'rp-reachable-item';
      item.textContent = String(node);
      this.reachableEl?.appendChild(item);
    });
    if (step.reachableNodes.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = '(无)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.reachableEl?.appendChild(empty);
    }
  }

  private renderLogLine(step: RPStep): void {
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
  id: 'reachable-paths',
  name: '可达路径',
  viewId: 'algo-reachable-paths-view',
  category: 'graph',
  description: '从源节点出发用 DFS 找有向图中所有可达节点',
  icon: '🎯',
  template,
  Visualizer: ReachablePathsVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握图的可达性分析与 DFS 应用',
});

export {};
