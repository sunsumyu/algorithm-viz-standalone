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

  // 1. 物理数组展示 (扁平卡片条)
  const arrayItemsHtml = heap.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">堆为空 (Empty)</span>'
    : heap.map((item, idx) => {
        const isRoot = idx === 0;
        let bg = isRoot ? (isMin ? '#ecfdf5' : '#fffbeb') : '#ffffff';
        let border = isRoot ? (isMin ? '#10b981' : '#f59e0b') : '#e2e8f0';
        let text = isRoot ? (isMin ? '#047857' : '#b45309') : '#334155';
        if (item.highlight || item.status === 'inserting') {
          bg = '#eff6ff';
          border = '#3b82f6';
          text = '#1d4ed8';
        } else if (item.status === 'popping') {
          bg = '#fef2f2';
          border = '#ef4444';
          text = '#b91c1c';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <div style="min-width: 38px; height: 32px; padding: 0 6px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${text}; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              ${item.label || item.val}
            </div>
            <span style="font-size: 9px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">[${idx}]</span>
          </div>
        `;
      }).join('');

  // 2. 逻辑二叉树 SVG 计算
  const treeSvg = renderHeapTreeSvg(heap, isMin);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">${title}</span>
          <span style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; background: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}40;">${typeText}</span>
        </div>
        <span style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">容量: <b>${heap.length}</b></span>
      </div>

      <!-- 逻辑树形结构区域 -->
      <div style="flex: 1; min-height: 140px; position: relative; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; overflow: auto; padding: 6px;">
        ${treeSvg}
      </div>

      <!-- 物理连续内存数组区域 -->
      <div style="display: flex; flex-direction: column; gap: 4px; background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 600; color: #475569;">物理底层数组 (Array Store)</span>
          <span style="font-size: 10px; color: #94a3b8;">左孩 2i+1 · 右孩 2i+2 · 亲 (i-1)/2</span>
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
    return `<div style="color: #94a3b8; font-size: 12px; font-style: italic;">暂无节点</div>`;
  }

  const n = heap.length;
  const levels = Math.floor(Math.log2(n)) + 1;
  const svgWidth = Math.max(300, Math.min(600, Math.pow(2, levels - 1) * 70));
  const svgHeight = levels * 48 + 20;

  // 计算每个节点的 (x, y) 坐标
  const coords: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const countInLevel = Math.pow(2, level);
    const stepX = svgWidth / (countInLevel + 1);
    const x = stepX * (posInLevel + 1);
    const y = 24 + level * 46;
    coords.push({ x, y });
  }

  // 连线
  let linesHtml = '';
  for (let i = 0; i < n; i++) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    if (leftChild < n) {
      linesHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[leftChild].x}" y2="${coords[leftChild].y}" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />`;
    }
    if (rightChild < n) {
      linesHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[rightChild].x}" y2="${coords[rightChild].y}" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />`;
    }
  }

  // 节点图元
  let nodesHtml = '';
  for (let i = 0; i < n; i++) {
    const { x, y } = coords[i];
    const isRoot = i === 0;
    const item = heap[i];
    let fill = isRoot ? (isMin ? '#ecfdf5' : '#fffbeb') : '#ffffff';
    let stroke = isRoot ? (isMin ? '#10b981' : '#f59e0b') : '#94a3b8';
    let textFill = isRoot ? (isMin ? '#065f46' : '#92400e') : '#1e293b';

    if (item.highlight) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
      textFill = '#1d4ed8';
    }

    const valText = item.label || String(item.val);
    nodesHtml += `
      <g>
        <circle cx="${x}" cy="${y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="${x}" y="${y + 4}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" fill="${textFill}">${valText}</text>
        ${isRoot ? `<text x="${x}" y="${y - 18}" text-anchor="middle" font-size="9" font-weight="700" fill="${stroke}">TOP</text>` : ''}
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
  const trackHeight = 36;
  const paddingLeft = 60;
  const svgWidth = 520;
  const svgHeight = numTracks * trackHeight + 40;
  const usableWidth = svgWidth - paddingLeft - 30;
  const scale = usableWidth / Math.max(1, maxTimeSpan);

  // 轨道背景线与标签
  let tracksHtml = '';
  for (let t = 0; t < numTracks; t++) {
    const y = 30 + t * trackHeight;
    tracksHtml += `
      <text x="10" y="${y + 20}" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" fill="#64748b">轨道 ${t + 1}</text>
      <line x1="${paddingLeft}" y1="${y + 16}" x2="${svgWidth - 20}" y2="${y + 16}" stroke="#f1f5f9" stroke-width="24" stroke-linecap="round" />
      <line x1="${paddingLeft}" y1="${y + 28}" x2="${svgWidth - 20}" y2="${y + 28}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
    `;
  }

  // 区间矩形
  let intervalsHtml = '';
  intervals.forEach((iv) => {
    const x = paddingLeft + iv.start * scale;
    const width = Math.max(8, (iv.end - iv.start) * scale);
    const y = 30 + iv.trackIndex * trackHeight + 4;
    const fill = iv.color || '#3b82f6';
    const stroke = iv.active ? '#1e40af' : '#2563eb';
    const strokeWidth = iv.active ? 2.5 : 1;

    intervalsHtml += `
      <g>
        <rect x="${x}" y="${y}" width="${width}" height="24" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${iv.active ? '1' : '0.88'}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
        <text x="${x + width / 2}" y="${y + 15}" text-anchor="middle" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" fill="#ffffff">${iv.label} [${iv.start}~${iv.end}]</text>
      </g>
    `;
  });

  // 时间推进红线游标
  let pointerHtml = '';
  if (currentPointerTime !== undefined && currentPointerTime >= 0) {
    const px = paddingLeft + currentPointerTime * scale;
    pointerHtml = `
      <line x1="${px}" y1="16" x2="${px}" y2="${svgHeight - 10}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2" />
      <polygon points="${px - 4},16 ${px + 4},16 ${px},22" fill="#ef4444" />
      <text x="${px}" y="12" text-anchor="middle" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="700" fill="#ef4444">t=${currentPointerTime}</text>
    `;
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; font-weight: 600;">
        <span>📊 甘特轨道占用图 (共 ${numTracks} 间会议室/轨道)</span>
        <span style="font-family: 'JetBrains Mono', monospace; color: #64748b;">时间刻度 [0 ~ ${maxTimeSpan}]</span>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; padding: 6px;">
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

  const leftBg = leftWin ? '#ecfdf5' : '#f8fafc';
  const leftBorder = leftWin ? '#10b981' : '#cbd5e1';
  const leftColor = leftWin ? '#047857' : '#475569';

  const rightBg = rightWin ? '#ecfdf5' : '#f8fafc';
  const rightBorder = rightWin ? '#10b981' : '#cbd5e1';
  const rightColor = rightWin ? '#047857' : '#475569';

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; justify-content: center;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">⚖️ 贪心决策天平 (${modeName})</span>
        <span style="font-size: 11px; font-weight: 600; color: #3b82f6;">${comp.winner === 'equal' ? '两方案等价' : `${comp.winner === 'left' ? comp.leftTitle : comp.rightTitle} 胜出`}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; justify-content: center; padding: 10px 0;">
        <!-- 左侧方案 -->
        <div style="flex: 1; max-width: 180px; padding: 10px; border-radius: 8px; background: ${leftBg}; border: 2px solid ${leftBorder}; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 11px; color: #64748b; font-weight: 600;">${comp.leftTitle}</div>
          <div style="font-size: 18px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${leftColor}; margin-top: 4px;">
            ${comp.leftVal}
          </div>
          ${leftWin ? '<span style="display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 700; color: #10b981;">✓ 优选方案</span>' : ''}
        </div>

        <div style="font-size: 16px; font-weight: 900; color: #94a3b8;">VS</div>

        <!-- 右侧方案 -->
        <div style="flex: 1; max-width: 180px; padding: 10px; border-radius: 8px; background: ${rightBg}; border: 2px solid ${rightBorder}; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 11px; color: #64748b; font-weight: 600;">${comp.rightTitle}</div>
          <div style="font-size: 18px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${rightColor}; margin-top: 4px;">
            ${comp.rightVal}
          </div>
          ${rightWin ? '<span style="display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 700; color: #10b981;">✓ 优选方案</span>' : ''}
        </div>
      </div>

      <div style="padding: 6px 10px; border-radius: 6px; background: #f8fafc; border-left: 3px solid #3b82f6; font-size: 11px; color: #475569; line-height: 1.5;">
        <b>决策判定：</b>${comp.reason}
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
