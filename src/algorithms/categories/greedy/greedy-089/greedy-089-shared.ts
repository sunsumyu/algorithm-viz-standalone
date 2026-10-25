/**
 * 第 89 课：左神贪心算法专题 1 - 共享类型与数据结构可视化辅助组件
 * 提供二叉堆双形态渲染（逻辑树 + 物理紧凑数组）、甘特时间轴多轨道渲染、决策天平比对卡片等
 */

import { StepBase } from '../../../../core/step-visualizer';
import type { StepVar } from '../../../../core/interfaces';

// ==========================================
// 1. 通用步进基类与树节点定义
// ==========================================
export interface GreedyTreeNode {
  id: string;
  name?: string;
  val?: string;
  tag?: string;
  edgeLabel?: string;
  children?: GreedyTreeNode[];
  status?: string;
}

export interface Greedy089Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  vars?: StepVar[];
  [key: string]: any;
}


// ==========================================
// 2. 二叉堆 (PriorityQueue) 双形态渲染适配器
// ==========================================
export interface HeapVisualItem {
  val: number;
  label?: string;
  id?: string | number;
  highlight?: boolean;
  status?: 'default' | 'top' | 'inserting' | 'popping' | 'swapping';
}

/**
 * 渲染二叉堆（逻辑二叉树形态 + 物理数组形态）
 */
export function renderDualHeapVisual(
  container: HTMLElement,
  heap: HeapVisualItem[],
  type: 'min' | 'max' = 'min',
  title = '二叉优先队列 (堆)'
): void {
  const isMin = type === 'min';
  const typeText = isMin ? '小顶堆 (Min-Heap)' : '大顶堆 (Max-Heap)';
  const badgeColor = isMin ? '#10b981' : '#f59e0b';
  const badgeGlow = isMin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';

  // 1. 物理连续内存数组展示 (紧凑寄存器单元)
  const arrayItemsHtml = heap.length === 0
    ? '<span style="color: #64748b; font-size: 11px; font-style: italic;">堆内暂无元素 (Empty)</span>'
    : heap.map((item, idx) => {
        const isRoot = idx === 0;
        let bg = isRoot ? (isMin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)') : '#1e293b';
        let border = isRoot ? (isMin ? '#10b981' : '#f59e0b') : '#334155';
        let text = isRoot ? (isMin ? '#34d399' : '#fbbf24') : '#f1f5f9';
        let glow = isRoot ? `0 0 10px ${badgeGlow}` : 'none';

        if (item.highlight || item.status === 'inserting') {
          bg = 'rgba(59, 130, 246, 0.2)';
          border = '#3b82f6';
          text = '#60a5fa';
          glow = '0 0 10px rgba(59, 130, 246, 0.3)';
        } else if (item.status === 'popping') {
          bg = 'rgba(239, 68, 68, 0.2)';
          border = '#ef4444';
          text = '#f87171';
          glow = '0 0 10px rgba(239, 68, 68, 0.3)';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <div style="min-width: 44px; height: 34px; padding: 0 8px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${text}; box-shadow: ${glow}; transition: all 0.2s ease;">
              ${item.label || item.val}
            </div>
            <span style="font-size: 9px; color: #64748b; font-family: 'JetBrains Mono', monospace;">[${idx}]</span>
          </div>
        `;
      }).join('');

  // 2. 逻辑二叉树 SVG 计算
  const treeSvg = renderHeapTreeSvg(heap, isMin);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; box-sizing: border-box; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${title}</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${badgeGlow}; color: ${badgeColor}; border: 1px solid ${badgeColor};">${typeText}</span>
        </div>
        <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">节点数: <b style="color: #f8fafc;">${heap.length}</b></span>
      </div>

      <!-- 逻辑树形结构区域 -->
      <div style="flex: 1; min-height: 140px; position: relative; display: flex; align-items: center; justify-content: center; background: #020617; border-radius: 8px; border: 1px solid #1e293b; overflow: auto; padding: 8px;">
        ${treeSvg}
      </div>

      <!-- 物理连续内存数组区域 -->
      <div style="display: flex; flex-direction: column; gap: 6px; background: #090d16; padding: 8px; border-radius: 8px; border: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;">📦 物理紧凑连续内存存储 (Array Store)</span>
          <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">左孩 2i+1 · 右孩 2i+2 · 亲 (i-1)/2</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 4px 2px;">
          ${arrayItemsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderHeapTreeSvg(heap: HeapVisualItem[], isMin: boolean): string {
  if (heap.length === 0) {
    return `<div style="color: #64748b; font-size: 12px; font-style: italic;">优先队列为空，暂无树节点</div>`;
  }

  const n = heap.length;
  const levels = Math.floor(Math.log2(n)) + 1;
  const svgWidth = Math.max(320, Math.min(600, Math.pow(2, levels - 1) * 72));
  const svgHeight = levels * 50 + 24;

  // 计算每个节点的 (x, y) 坐标
  const coords: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const countInLevel = Math.pow(2, level);
    const stepX = svgWidth / (countInLevel + 1);
    const x = stepX * (posInLevel + 1);
    const y = 26 + level * 48;
    coords.push({ x, y });
  }

  // 连线 (霓虹暗蓝与发光效果)
  let linesHtml = '';
  for (let i = 0; i < n; i++) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    if (leftChild < n) {
      linesHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[leftChild].x}" y2="${coords[leftChild].y}" stroke="#334155" stroke-width="2" stroke-linecap="round" />`;
    }
    if (rightChild < n) {
      linesHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[rightChild].x}" y2="${coords[rightChild].y}" stroke="#334155" stroke-width="2" stroke-linecap="round" />`;
    }
  }

  // 节点图元
  let nodesHtml = '';
  for (let i = 0; i < n; i++) {
    const { x, y } = coords[i];
    const isRoot = i === 0;
    const item = heap[i];
    let fill = isRoot ? (isMin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)') : '#1e293b';
    let stroke = isRoot ? (isMin ? '#10b981' : '#f59e0b') : '#475569';
    let textFill = isRoot ? (isMin ? '#34d399' : '#fbbf24') : '#f8fafc';
    let glowFilter = isRoot ? (isMin ? 'filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));' : 'filter: drop-shadow(0 0 6px rgba(245,158,11,0.5));') : '';

    if (item.highlight || item.status === 'inserting') {
      fill = 'rgba(59, 130, 246, 0.25)';
      stroke = '#3b82f6';
      textFill = '#60a5fa';
      glowFilter = 'filter: drop-shadow(0 0 6px rgba(59,130,246,0.6));';
    } else if (item.status === 'popping') {
      fill = 'rgba(239, 68, 68, 0.25)';
      stroke = '#ef4444';
      textFill = '#f87171';
      glowFilter = 'filter: drop-shadow(0 0 6px rgba(239,68,68,0.6));';
    }

    const valText = item.label || String(item.val);
    nodesHtml += `
      <g style="${glowFilter}">
        <circle cx="${x}" cy="${y}" r="16" fill="${fill}" stroke="${stroke}" stroke-width="2" />
        <text x="${x}" y="${y + 4}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" fill="${textFill}">${valText}</text>
        ${isRoot ? `<text x="${x}" y="${y - 19}" text-anchor="middle" font-size="9" font-weight="800" fill="${stroke}">TOP</text>` : ''}
      </g>
    `;
  }

  return `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 100%; height: auto;">
      ${linesHtml}
      ${nodesHtml}
    </svg>
  `;
}

// ==========================================
// 3. 甘特图多轨道时间轴 (Gantt Timeline) 适配器
// ==========================================
export interface GanttInterval {
  id: string | number;
  label: string;
  start: number;
  end: number;
  trackIndex: number;
  color?: string;
  active?: boolean;
}

export function renderGanttTimeline(
  container: HTMLElement,
  intervals: GanttInterval[],
  numTracks: number,
  currentPointerTime?: number,
  maxTimeSpan = 30
): void {
  const trackHeight = 38;
  const paddingLeft = 68;
  const svgWidth = 540;
  const svgHeight = numTracks * trackHeight + 48;
  const usableWidth = svgWidth - paddingLeft - 24;
  const scale = usableWidth / Math.max(1, maxTimeSpan);

  // 轨道背景线与标签
  let tracksHtml = '';
  for (let t = 0; t < numTracks; t++) {
    const y = 32 + t * trackHeight;
    tracksHtml += `
      <text x="12" y="${y + 20}" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" fill="#94a3b8">轨道 #${t + 1}</text>
      <rect x="${paddingLeft}" y="${y + 4}" width="${usableWidth}" height="26" rx="4" fill="rgba(30, 41, 59, 0.4)" stroke="#1e293b" stroke-width="1" />
      <line x1="${paddingLeft}" y1="${y + 30}" x2="${svgWidth - 24}" y2="${y + 30}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3 3" />
    `;
  }

  // 区间矩形 (发光彩色胶囊)
  let intervalsHtml = '';
  intervals.forEach((iv) => {
    const x = paddingLeft + iv.start * scale;
    const width = Math.max(12, (iv.end - iv.start) * scale);
    const y = 32 + iv.trackIndex * trackHeight + 5;
    const fill = iv.color || '#3b82f6';
    const stroke = iv.active ? '#60a5fa' : '#2563eb';
    const strokeWidth = iv.active ? 2.5 : 1.5;
    const glow = iv.active ? 'filter: drop-shadow(0 0 8px rgba(59,130,246,0.6));' : '';

    intervalsHtml += `
      <g style="${glow}">
        <rect x="${x}" y="${y}" width="${width}" height="24" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${iv.active ? '1' : '0.88'}" />
        <text x="${x + width / 2}" y="${y + 16}" text-anchor="middle" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" fill="#ffffff">${iv.label} [${iv.start}~${iv.end}]</text>
      </g>
    `;
  });

  // 时间推进红线激光游标
  let pointerHtml = '';
  if (currentPointerTime !== undefined && currentPointerTime >= 0) {
    const px = paddingLeft + currentPointerTime * scale;
    pointerHtml = `
      <g style="filter: drop-shadow(0 0 6px rgba(239,68,68,0.7));">
        <line x1="${px}" y1="18" x2="${px}" y2="${svgHeight - 12}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2" />
        <polygon points="${px - 4},18 ${px + 4},18 ${px},24" fill="#ef4444" />
        <text x="${px}" y="14" text-anchor="middle" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="800" fill="#f87171">t=${currentPointerTime}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #cbd5e1; font-weight: 700;">
        <span>📊 物理甘特时间轴与轨道占用矩阵 (共 ${numTracks} 间会议室/轨道)</span>
        <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">时间刻度 [0 ~ ${maxTimeSpan}]</span>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #020617; border-radius: 8px; border: 1px solid #1e293b; overflow-x: auto; padding: 6px;">
        <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
          ${tracksHtml}
          ${intervalsHtml}
          ${pointerHtml}
        </svg>
      </div>
    </div>
  `;
}

// ==========================================
// 4. 决策比对天平 / 比较器看板 (Decision Balance)
// ==========================================
export interface BalanceComparisonDef {
  leftTitle: string;
  leftVal: string | number;
  rightTitle: string;
  rightVal: string | number;
  winner: 'left' | 'right' | 'equal';
  reason: string;
}

export function renderDecisionBalance(
  container: HTMLElement,
  comp: BalanceComparisonDef,
  modeName = '拼接字典序比对'
): void {
  const leftWin = comp.winner === 'left';
  const rightWin = comp.winner === 'right';

  const leftBg = leftWin ? 'rgba(16, 185, 129, 0.15)' : '#1e293b';
  const leftBorder = leftWin ? '#10b981' : '#334155';
  const leftColor = leftWin ? '#34d399' : '#94a3b8';
  const leftGlow = leftWin ? 'box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);' : '';

  const rightBg = rightWin ? 'rgba(16, 185, 129, 0.15)' : '#1e293b';
  const rightBorder = rightWin ? '#10b981' : '#334155';
  const rightColor = rightWin ? '#34d399' : '#94a3b8';
  const rightGlow = rightWin ? 'box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);' : '';

  const statusText = comp.winner === 'equal'
    ? '两方案等价'
    : `${comp.winner === 'left' ? comp.leftTitle : comp.rightTitle} 胜出 (更优)`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; justify-content: center; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #f8fafc;">⚖️ 贪心决策天平 (${modeName})</span>
        <span style="font-size: 11px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">${statusText}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; justify-content: center; padding: 12px 0;">
        <!-- 左侧方案托盘 -->
        <div style="flex: 1; max-width: 180px; padding: 12px; border-radius: 8px; background: ${leftBg}; border: 2px solid ${leftBorder}; text-align: center; ${leftGlow} transition: all 0.2s ease;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">${comp.leftTitle}</div>
          <div style="font-size: 18px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${leftColor}; margin-top: 6px;">
            ${comp.leftVal}
          </div>
          ${leftWin ? '<span style="display: inline-block; margin-top: 6px; font-size: 10px; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px;">✓ 优选前移</span>' : ''}
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 16px; font-weight: 900; color: #64748b; font-family: 'JetBrains Mono', monospace;">VS</span>
          <span style="font-size: 9px; color: #475569;">比对天平</span>
        </div>

        <!-- 右侧方案托盘 -->
        <div style="flex: 1; max-width: 180px; padding: 12px; border-radius: 8px; background: ${rightBg}; border: 2px solid ${rightBorder}; text-align: center; ${rightGlow} transition: all 0.2s ease;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">${comp.rightTitle}</div>
          <div style="font-size: 18px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${rightColor}; margin-top: 6px;">
            ${comp.rightVal}
          </div>
          ${rightWin ? '<span style="display: inline-block; margin-top: 6px; font-size: 10px; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px;">✓ 优选前移</span>' : ''}
        </div>
      </div>

      <div style="padding: 8px 12px; border-radius: 6px; background: #020617; border-left: 3px solid #38bdf8; font-size: 11px; color: #cbd5e1; line-height: 1.5; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
        <span style="color: #38bdf8; font-weight: 700;">📐 决策判定：</span>${comp.reason}
      </div>
    </div>
  `;
}

// ==========================================
// 5. 简单小根堆 / 大根堆模拟类
// ==========================================
export class SimpleHeap<T = any> {
  private data: Array<{ val: number; extra?: T }> = [];
  private isMin: boolean;

  constructor(type: 'min' | 'max' = 'min') {
    this.isMin = type === 'min';
  }

  public size(): number {
    return this.data.length;
  }

  public peek(): { val: number; extra?: T } | undefined {
    return this.data[0];
  }

  public toVisualItems(): HeapVisualItem[] {
    return this.data.map((d, idx) => ({
      val: d.val,
      label: typeof d.extra === 'string' ? d.extra : String(d.val),
      status: idx === 0 ? 'top' : 'default',
    }));
  }

  public push(val: number, extra?: T): void {
    this.data.push({ val, extra });
    this.siftUp(this.data.length - 1);
  }

  public pop(): { val: number; extra?: T } | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  private compare(a: number, b: number): boolean {
    return this.isMin ? a < b : a > b;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.compare(this.data[i].val, this.data[p].val)) {
        const tmp = this.data[i];
        this.data[i] = this.data[p];
        this.data[p] = tmp;
        i = p;
      } else {
        break;
      }
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (2 * i + 1 < n) {
      let target = 2 * i + 1;
      const right = 2 * i + 2;
      if (right < n && this.compare(this.data[right].val, this.data[target].val)) {
        target = right;
      }
      if (this.compare(this.data[target].val, this.data[i].val)) {
        const tmp = this.data[i];
        this.data[i] = this.data[target];
        this.data[target] = tmp;
        i = target;
      } else {
        break;
      }
    }
  }
}
