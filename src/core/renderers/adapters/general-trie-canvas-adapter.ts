/**
 * 通用 26-Trie 字典树拓扑画板与辅助视图适配器 (GeneralTrieCanvasAdapter)
 * 深度模块 (Deep Module): 封装多字符前缀树拓扑自适应布局、平滑贝塞尔连接线、字符胶囊徽标与 Card 2 字符下潜滑轨
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

import { StepBase } from '../../step-visualizer';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

export interface GeneralTrieNodeSnapshot {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: { [char: string]: number };
}

export interface GeneralTrieStepDef extends StepBase {
  nodes: GeneralTrieNodeSnapshot[];
  activeNodeId: number;
  curWord: string;
  curCharIndex: number;
  operation: 'insert' | 'search' | 'prefixNumber';
  resultCount?: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: string;
  activePath?: number[];
  staticTable?: {
    rows: Array<{ id: number; char: string; pass: number; end: number; nexts: Record<string, number> }>;
  };
  metrics?: Record<string, string | number>;
}

interface LayoutNode {
  id: number;
  char: string;
  pass: number;
  end: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  children: Array<{ char: string; node: LayoutNode }>;
}

export class GeneralTrieCanvasAdapter {
  /**
   * 自底向上层级拓扑布局算法
   */
  public static computeTrieLayout(nodes: GeneralTrieNodeSnapshot[]): {
    layoutNodes: Map<number, LayoutNode>;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const nodeMap = new Map<number, GeneralTrieNodeSnapshot>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const buildSubtree = (nodeId: number, depth: number): LayoutNode => {
      const raw = nodeMap.get(nodeId)!;
      const childrenList: Array<{ char: string; node: LayoutNode }> = [];
      const sortedChars = Object.keys(raw.children).sort();
      for (const ch of sortedChars) {
        const childId = raw.children[ch];
        if (nodeMap.has(childId)) {
          childrenList.push({ char: ch, node: buildSubtree(childId, depth + 1) });
        }
      }
      return {
        id: raw.id,
        char: raw.char,
        pass: raw.pass,
        end: raw.end,
        depth,
        x: 0,
        y: depth * 76 + 50,
        width: 1,
        children: childrenList,
      };
    };

    const rootLayout = buildSubtree(1, 0);

    const calcWidth = (node: LayoutNode): number => {
      if (node.children.length === 0) {
        node.width = 64;
        return 64;
      }
      let sum = 0;
      for (const c of node.children) {
        sum += calcWidth(c.node);
      }
      node.width = Math.max(64, sum);
      return node.width;
    };
    calcWidth(rootLayout);

    const layoutNodes = new Map<number, LayoutNode>();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const assignPositions = (node: LayoutNode, leftBound: number) => {
      layoutNodes.set(node.id, node);
      if (node.children.length === 0) {
        node.x = leftBound + node.width / 2;
      } else {
        let curLeft = leftBound;
        for (const c of node.children) {
          assignPositions(c.node, curLeft);
          curLeft += c.node.width;
        }
        const firstX = node.children[0].node.x;
        const lastX = node.children[node.children.length - 1].node.x;
        node.x = (firstX + lastX) / 2;
      }

      minX = Math.min(minX, node.x - 30);
      maxX = Math.max(maxX, node.x + 30);
      minY = Math.min(minY, node.y - 30);
      maxY = Math.max(maxY, node.y + 40);
    };

    assignPositions(rootLayout, 0);

    return { layoutNodes, minX, maxX, minY, maxY };
  }

  /**
   * Card 1: 纯净 SVG 树拓扑沙盘渲染
   */
  public static renderTrieCanvas(container: HTMLElement, step: GeneralTrieStepDef): void {
    container.innerHTML = '';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.overflow = 'hidden';
    container.style.background = '#090d16';

    if (!step.nodes || step.nodes.length === 0) {
      container.innerHTML = `<div class="text-slate-500 font-mono text-sm">前缀树为空</div>`;
      return;
    }

    const { layoutNodes, minX, maxX, minY, maxY } = GeneralTrieCanvasAdapter.computeTrieLayout(step.nodes);
    const activePathSet = new Set(step.activePath || [step.activeNodeId]);
    const activeNodeId = step.activeNodeId;

    const width = Math.max(300, maxX - minX + 80);
    const height = Math.max(260, maxY - minY + 60);
    const viewBox = `${minX - 40} ${minY - 30} ${width} ${height}`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '100%';
    svg.style.maxHeight = '100%';
    svg.style.userSelect = 'none';

    // 1. 绘制连线与边上字符
    layoutNodes.forEach(node => {
      node.children.forEach(edge => {
        const child = edge.node;
        const isPathActive = activePathSet.has(node.id) && activePathSet.has(child.id);

        const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY = (node.y + child.y) / 2;
        const d = `M ${node.x} ${node.y} C ${node.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`;
        pathElem.setAttribute('d', d);
        pathElem.setAttribute('fill', 'none');
        pathElem.setAttribute('stroke', isPathActive ? '#38bdf8' : '#334155');
        pathElem.setAttribute('stroke-width', isPathActive ? '2.5' : '1.5');
        if (isPathActive) {
          pathElem.setAttribute('filter', 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))');
        }
        svg.appendChild(pathElem);

        // 边中间的字符胶囊徽标
        const mx = (node.x + child.x) / 2;
        const my = midY;
        const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeGroup.setAttribute('transform', `translate(${mx}, ${my})`);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '-9');
        rect.setAttribute('y', '-9');
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', isPathActive ? '#0284c7' : '#1e293b');
        rect.setAttribute('stroke', isPathActive ? '#38bdf8' : '#475569');
        rect.setAttribute('stroke-width', '1');

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('dominant-baseline', 'central');
        txt.setAttribute('fill', isPathActive ? '#ffffff' : '#94a3b8');
        txt.setAttribute('font-size', '11');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('font-family', 'monospace');
        txt.textContent = edge.char;

        badgeGroup.appendChild(rect);
        badgeGroup.appendChild(txt);
        svg.appendChild(badgeGroup);
      });
    });

    // 2. 绘制节点
    layoutNodes.forEach(node => {
      const isActive = node.id === activeNodeId;
      const isPath = activePathSet.has(node.id);
      const isRoot = node.id === 1;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

      if (isActive) {
        const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseRing.setAttribute('r', '27');
        pulseRing.setAttribute('fill', 'none');
        pulseRing.setAttribute('stroke', '#38bdf8');
        pulseRing.setAttribute('stroke-width', '2');
        pulseRing.setAttribute('opacity', '0.6');
        pulseRing.setAttribute('stroke-dasharray', '4 2');
        g.appendChild(pulseRing);
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '20');
      circle.setAttribute(
        'fill',
        isActive
          ? '#0369a1'
          : isPath
          ? '#0f172a'
          : isRoot
          ? '#1e293b'
          : '#0b1329'
      );
      circle.setAttribute(
        'stroke',
        isActive
          ? '#38bdf8'
          : isPath
          ? '#0284c7'
          : isRoot
          ? '#64748b'
          : '#334155'
      );
      circle.setAttribute('stroke-width', isActive ? '2.5' : '1.5');
      if (isActive) {
        circle.setAttribute('filter', 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))');
      }
      g.appendChild(circle);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('fill', isActive ? '#ffffff' : '#f8fafc');
      label.setAttribute('font-size', isRoot ? '9' : '13');
      label.setAttribute('font-weight', '800');
      label.setAttribute('font-family', 'sans-serif');
      label.textContent = isRoot ? 'ROOT' : node.char;
      g.appendChild(label);

      const passG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      passG.setAttribute('transform', 'translate(-12, 17)');
      const passBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      passBg.setAttribute('x', '-11');
      passBg.setAttribute('y', '-6');
      passBg.setAttribute('width', '22');
      passBg.setAttribute('height', '12');
      passBg.setAttribute('rx', '4');
      passBg.setAttribute('fill', '#0284c7');
      passBg.setAttribute('stroke', '#38bdf8');
      passBg.setAttribute('stroke-width', '0.5');
      const passTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      passTxt.setAttribute('text-anchor', 'middle');
      passTxt.setAttribute('dominant-baseline', 'central');
      passTxt.setAttribute('fill', '#ffffff');
      passTxt.setAttribute('font-size', '8');
      passTxt.setAttribute('font-weight', '700');
      passTxt.textContent = `p:${node.pass}`;
      passG.appendChild(passBg);
      passG.appendChild(passTxt);
      g.appendChild(passG);

      if (node.end > 0 || isRoot) {
        const endG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        endG.setAttribute('transform', 'translate(12, 17)');
        const endBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        endBg.setAttribute('x', '-11');
        endBg.setAttribute('y', '-6');
        endBg.setAttribute('width', '22');
        endBg.setAttribute('height', '12');
        endBg.setAttribute('rx', '4');
        endBg.setAttribute('fill', node.end > 0 ? '#e11d48' : '#475569');
        endBg.setAttribute('stroke', node.end > 0 ? '#fb7185' : '#64748b');
        endBg.setAttribute('stroke-width', '0.5');
        const endTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        endTxt.setAttribute('text-anchor', 'middle');
        endTxt.setAttribute('dominant-baseline', 'central');
        endTxt.setAttribute('fill', '#ffffff');
        endTxt.setAttribute('font-size', '8');
        endTxt.setAttribute('font-weight', '700');
        endTxt.textContent = `e:${node.end}`;
        endG.appendChild(endBg);
        endG.appendChild(endTxt);
        g.appendChild(endG);
      }

      svg.appendChild(g);
    });

    container.appendChild(svg);
  }

  /**
   * Card 2: 4 维指标面板 + 字符推进滑轨 (Word Ribbon) + 静态映射表 + 调用树
   */
  public static renderTrieCard2(container: HTMLElement, step: GeneralTrieStepDef): void {
    container.innerHTML = '';
    container.className = 'w-full h-full flex flex-col gap-2 p-2.5 overflow-hidden bg-slate-950 text-slate-100';

    // 1. 顶部 4 维指标看板
    const statsRow = document.createElement('div');
    statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
    statsRow.innerHTML = `
      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold">当前操作</span>
        <span class="text-sky-300 font-mono font-bold text-xs mt-0.5 truncate">
          ${step.operation === 'insert' ? '插入单词' : step.operation === 'prefixNumber' ? '前缀统计' : '完整匹配'}
        </span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold">目标单词</span>
        <span class="text-amber-300 font-mono font-bold text-xs mt-0.5 truncate">"${step.curWord || '—'}"</span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold">活跃节点</span>
        <span class="text-emerald-300 font-mono font-bold text-xs mt-0.5 truncate">节点 #${step.activeNodeId}</span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold">结果计数</span>
        <span class="text-purple-300 font-mono font-bold text-xs mt-0.5 truncate">
          ${step.resultCount !== undefined ? step.resultCount : '—'}
        </span>
      </div>
    `;
    container.appendChild(statsRow);

    // 2. 单词字符推进滑轨 (Word Character Ribbon)
    if (step.curWord) {
      const ribbonCard = document.createElement('div');
      ribbonCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex flex-col gap-1 flex-shrink-0';
      ribbonCard.innerHTML = `
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
          <span>🔤 字符下潜滑轨 (Word Characters Ribbon)</span>
          <span class="text-[10px] text-slate-500 font-mono">active: index ${step.curCharIndex >= 0 ? step.curCharIndex : 'head'}</span>
        </div>
      `;

      const ribbonTrack = document.createElement('div');
      ribbonTrack.className = 'flex gap-1.5 overflow-x-auto py-1 items-center';
      for (let i = 0; i < step.curWord.length; i++) {
        const ch = step.curWord[i];
        const isActive = i === step.curCharIndex;
        const isPassed = i < step.curCharIndex;
        const pill = document.createElement('div');
        pill.className = `flex flex-col items-center justify-center px-2 py-1 min-w-[34px] rounded border font-mono text-xs font-bold transition-all ${
          isActive
            ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/30 ring-1 ring-sky-400'
            : isPassed
            ? 'bg-emerald-500/10 border-emerald-600/40 text-emerald-300'
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`;
        pill.innerHTML = `<span>${ch}</span><span class="text-[8px] font-normal opacity-70">#${i}</span>`;
        ribbonTrack.appendChild(pill);
      }
      ribbonCard.appendChild(ribbonTrack);
      container.appendChild(ribbonCard);
    }

    // 3. Stage 2 静态内存映射表看板 (若提供 staticTable)
    if (step.staticTable && step.staticTable.rows.length > 0) {
      const staticCard = document.createElement('div');
      staticCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex flex-col gap-1 flex-shrink-0';
      staticCard.innerHTML = `
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
          <span>💾 静态连续数组映射表 (tree[id][26] & pass & end)</span>
          <span class="text-[10px] text-emerald-400 font-mono">cnt = ${step.nodes.length}</span>
        </div>
        <div class="max-h-[85px] overflow-y-auto text-[11px] font-mono border border-slate-800/80 rounded">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-800/70 text-slate-400 sticky top-0">
              <tr>
                <th class="p-1 border-b border-slate-700">id</th>
                <th class="p-1 border-b border-slate-700">字符</th>
                <th class="p-1 border-b border-slate-700 text-sky-400">pass</th>
                <th class="p-1 border-b border-slate-700 text-rose-400">end</th>
                <th class="p-1 border-b border-slate-700">子分支 (char ➔ id)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              ${step.staticTable.rows.map(r => {
                const isCur = r.id === step.activeNodeId;
                const nextsStr = Object.entries(r.nexts).map(([c, id]) => `${c}➔${id}`).join(', ') || '—';
                return `
                  <tr class="${isCur ? 'bg-sky-500/20 text-sky-200 font-bold' : 'text-slate-300'}">
                    <td class="p-1">#${r.id}</td>
                    <td class="p-1">${r.char}</td>
                    <td class="p-1 text-sky-400">${r.pass}</td>
                    <td class="p-1 text-rose-400">${r.end}</td>
                    <td class="p-1 text-slate-400 text-[10px]">${nextsStr}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.appendChild(staticCard);
    }

    // 4. 调用链路树 (Figure 1 层次规范适配器)
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌳 前缀树状态演进与调用链 (Call Trace)',
        maxHeight: '100%',
      });
      container.appendChild(traceBox);
    }
  }
}
