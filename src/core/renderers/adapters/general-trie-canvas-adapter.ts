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
      container.innerHTML = `<div style="color: #64748b; font-family: monospace; font-size: 14px;">前缀树为空</div>`;
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
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

    // 1. 顶部 4 维指标看板
    const statsRow = document.createElement('div');
    statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
    statsRow.innerHTML = `
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前操作</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${step.operation === 'insert' ? '插入单词' : step.operation === 'prefixNumber' ? '前缀统计' : '完整匹配'}
        </div>
      </div>
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">目标单词</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">"${step.curWord || '—'}"</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">活跃节点</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">节点 #${step.activeNodeId}</div>
      </div>
      <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">结果计数</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${step.resultCount !== undefined ? step.resultCount : '—'}
        </div>
      </div>
    `;
    container.appendChild(statsRow);

    // 2. 单词字符推进滑轨 (Word Character Ribbon)
    if (step.curWord) {
      const ribbonCard = document.createElement('div');
      ribbonCard.style.cssText = 'background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; gap:6px; flex-shrink:0;';
      ribbonCard.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
          <span>🔤 字符下潜滑轨 (Word Characters Ribbon)</span>
          <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10px;">active: index ${step.curCharIndex >= 0 ? step.curCharIndex : 'head'}</span>
        </div>
      `;

      const ribbonTrack = document.createElement('div');
      ribbonTrack.style.cssText = 'display:flex; gap:6px; overflow-x:auto; padding:4px 0; align-items:center;';
      for (let i = 0; i < step.curWord.length; i++) {
        const ch = step.curWord[i];
        const isActive = i === step.curCharIndex;
        const isPassed = i < step.curCharIndex;
        const pill = document.createElement('div');
        
        let bg = '#f8fafc';
        let border = '#cbd5e1';
        let color = '#64748b';
        if (isActive) {
          bg = '#e0f2fe';
          border = '#38bdf8';
          color = '#0284c7';
        } else if (isPassed) {
          bg = '#f0fdf4';
          border = '#bbf7d0';
          color = '#15803d';
        }

        pill.style.cssText = `display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3px 8px; min-width:34px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color}; transition:all 0.15s; flex-shrink:0;`;
        pill.innerHTML = `<span>${ch}</span><span style="font-size:8px; font-weight:normal; opacity:0.7;">#${i}</span>`;
        ribbonTrack.appendChild(pill);
      }
      ribbonCard.appendChild(ribbonTrack);
      container.appendChild(ribbonCard);
    }

    // 3. Stage 2 静态内存映射表看板 (若提供 staticTable)
    if (step.staticTable && step.staticTable.rows.length > 0) {
      const staticCard = document.createElement('div');
      staticCard.style.cssText = 'background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; gap:6px; flex-shrink:0;';
      staticCard.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
          <span>💾 静态连续数组映射表 (tree[id][26] & pass & end)</span>
          <span style="font-family:ui-monospace,monospace; color:#15803d; font-size:10px;">cnt = ${step.nodes.length}</span>
        </div>
        <div style="max-height:85px; overflow-y:auto; font-size:11px; font-family:ui-monospace,monospace; border:1px solid #e2e8f0; border-radius:4px;">
          <table style="width:100%; text-align:left; border-collapse:collapse;">
            <thead style="background:#f8fafc; color:#64748b; position:sticky; top:0;">
              <tr>
                <th style="padding:4px 6px; border-bottom:1px solid #e2e8f0;">id</th>
                <th style="padding:4px 6px; border-bottom:1px solid #e2e8f0;">字符</th>
                <th style="padding:4px 6px; border-bottom:1px solid #e2e8f0; color:#0284c7;">pass</th>
                <th style="padding:4px 6px; border-bottom:1px solid #e2e8f0; color:#e11d48;">end</th>
                <th style="padding:4px 6px; border-bottom:1px solid #e2e8f0;">子分支 (char ➔ id)</th>
              </tr>
            </thead>
            <tbody>
              ${step.staticTable.rows.map(r => {
                const isCur = r.id === step.activeNodeId;
                const nextsStr = Object.entries(r.nexts).map(([c, id]) => `${c}➔${id}`).join(', ') || '—';
                const rowBg = isCur ? '#e0f2fe' : '#ffffff';
                const rowColor = isCur ? '#0369a1' : '#334155';
                const fontWeight = isCur ? '700' : '500';
                return `
                  <tr style="background:${rowBg}; color:${rowColor}; font-weight:${fontWeight}; border-bottom:1px solid #f1f5f9;">
                    <td style="padding:3px 6px;">#${r.id}</td>
                    <td style="padding:3px 6px;">${r.char}</td>
                    <td style="padding:3px 6px; color:#0284c7;">${r.pass}</td>
                    <td style="padding:3px 6px; color:#e11d48;">${r.end}</td>
                    <td style="padding:3px 6px; color:#64748b; font-size:10px;">${nextsStr}</td>
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
      traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌳 前缀树状态演进与调用链 (Call Trace)',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
      container.appendChild(traceBox);
    }

    // 5. 当前推演决策总结
    if (step.decision) {
      const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('成功');
      const summaryBox = document.createElement('div');
      summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
      summaryBox.innerHTML = `
        <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
        <div style="color:#64748b; font-size:11px;">${step.message}</div>
      `;
      container.appendChild(summaryBox);
    }
  }
}
