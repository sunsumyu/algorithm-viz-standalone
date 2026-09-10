/**
 * 第 90 课：左神贪心算法专题 2 - 共享类型与数据结构可视化辅助组件
 * 提供竹子/绳子分段条形图、多轨道甘特图、IPO双堆协同市场、GCD扩散数轴等通用渲染器
 */

import { StepBase } from '../../../../core/step-visualizer';
import type { StepVar } from '../../../../core/interfaces';

// ==========================================
// 1. 通用步进基类定义
// ==========================================
export interface Greedy090Step extends StepBase {
  stepIndex?: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  variables?: Record<string, StepVar>;
}

// ==========================================
// 2. 简易二叉优先队列 (Min/Max Heap)
// ==========================================
export class SimpleHeap<T> {
  private data: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T): void {
    this.data.push(item);
    this.up(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.down(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  size(): number {
    return this.data.length;
  }

  toArray(): T[] {
    return [...this.data];
  }

  private up(idx: number): void {
    while (idx > 0) {
      const p = (idx - 1) >> 1;
      if (this.compare(this.data[idx], this.data[p]) < 0) {
        const tmp = this.data[idx];
        this.data[idx] = this.data[p];
        this.data[p] = tmp;
        idx = p;
      } else {
        break;
      }
    }
  }

  private down(idx: number): void {
    const len = this.data.length;
    while (true) {
      let best = idx;
      const left = idx * 2 + 1;
      const right = idx * 2 + 2;
      if (left < len && this.compare(this.data[left], this.data[best]) < 0) {
        best = left;
      }
      if (right < len && this.compare(this.data[right], this.data[best]) < 0) {
        best = right;
      }
      if (best !== idx) {
        const tmp = this.data[idx];
        this.data[idx] = this.data[best];
        this.data[best] = tmp;
        idx = best;
      } else {
        break;
      }
    }
  }
}

// ==========================================
// 3. 分段切分条形渲染器 (竹子/绳子分段、均分能量条)
// ==========================================
export interface PartitionBarItem {
  length: number;
  label: string;
  color?: string;
  highlighted?: boolean;
}

export function renderPartitionBars(
  container: HTMLElement,
  parts: PartitionBarItem[],
  total: number,
  options?: { title?: string; subtitle?: string; productFormula?: string }
): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';
  container.style.padding = '14px';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.boxSizing = 'border-box';
  container.style.background = '#0f172a';
  container.style.borderRadius = '8px';
  container.style.overflow = 'auto';

  // 顶部信息条
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.borderBottom = '1px solid #334155';
  header.style.paddingBottom = '8px';

  header.innerHTML = `
    <div>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">${options?.title || '📏 分割状态视图'}</span>
      <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">总长: ${total} · 当前段数: ${parts.length}</span>
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #38bdf8;">
      ${options?.productFormula || ''}
    </div>
  `;
  container.appendChild(header);

  // 连续分段条
  const barWrapper = document.createElement('div');
  barWrapper.style.display = 'flex';
  barWrapper.style.width = '100%';
  barWrapper.style.height = '48px';
  barWrapper.style.borderRadius = '6px';
  barWrapper.style.overflow = 'hidden';
  barWrapper.style.border = '2px solid #475569';
  barWrapper.style.background = '#1e293b';

  const actualSum = parts.reduce((acc, p) => acc + p.length, 0);
  const scaleTotal = Math.max(total, actualSum, 1);

  parts.forEach((p, idx) => {
    const seg = document.createElement('div');
    const pct = ((p.length / scaleTotal) * 100).toFixed(2);
    seg.style.width = `${pct}%`;
    seg.style.height = '100%';
    seg.style.background = p.color || (p.length === 3 ? '#10b981' : p.length === 2 ? '#3b82f6' : '#f59e0b');
    seg.style.display = 'flex';
    seg.style.flexDirection = 'column';
    seg.style.alignItems = 'center';
    seg.style.justifyContent = 'center';
    seg.style.borderRight = idx < parts.length - 1 ? '1px dashed rgba(255,255,255,0.4)' : 'none';
    seg.style.boxSizing = 'border-box';
    seg.style.position = 'relative';
    seg.style.transition = 'all 0.25s ease';

    if (p.highlighted) {
      seg.style.boxShadow = 'inset 0 0 0 2px #facc15, 0 0 8px #facc15';
    }

    seg.innerHTML = `
      <span style="font-size: 12px; font-weight: 800; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.6);">${p.label}</span>
      <span style="font-size: 9.5px; color: rgba(255,255,255,0.85);">${pct}%</span>
    `;
    barWrapper.appendChild(seg);
  });

  container.appendChild(barWrapper);

  // 下方独立卡片列
  const cardList = document.createElement('div');
  cardList.style.display = 'flex';
  cardList.style.flexWrap = 'wrap';
  cardList.style.gap = '8px';
  cardList.style.marginTop = '4px';

  parts.forEach((p, idx) => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '8px';
    card.style.padding = '6px 10px';
    card.style.background = '#1e293b';
    card.style.border = p.highlighted ? '1px solid #facc15' : '1px solid #334155';
    card.style.borderRadius = '6px';
    card.style.fontSize = '11.5px';
    card.style.color = '#e2e8f0';

    card.innerHTML = `
      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${p.color || '#10b981'};"></span>
      <span style="font-weight: 700;">第 ${idx + 1} 份:</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: #38bdf8;">${p.length}</span>
    `;
    cardList.appendChild(card);
  });

  container.appendChild(cardList);
}

// ==========================================
// 4. 甘特多轨道时间轴调度器 (区间调度 / 每日参会)
// ==========================================
export interface GanttIntervalItem {
  id: string;
  name: string;
  start: number;
  end: number;
  track: number;
  status: 'selected' | 'discarded' | 'active' | 'pending';
  tag?: string;
}

export function renderGanttTimeline(
  container: HTMLElement,
  config: {
    intervals: GanttIntervalItem[];
    currentTime?: number;
    minTime: number;
    maxTime: number;
    tracksCount: number;
    cursorLabel?: string;
  }
): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = '12px';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.boxSizing = 'border-box';
  container.style.background = '#0f172a';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';

  const { intervals, currentTime, minTime, maxTime, tracksCount, cursorLabel } = config;
  const timeSpan = Math.max(1, maxTime - minTime);

  // 标尺
  const ruler = document.createElement('div');
  ruler.style.display = 'flex';
  ruler.style.justifyContent = 'space-between';
  ruler.style.padding = '0 8px 6px 48px';
  ruler.style.borderBottom = '1px solid #334155';
  ruler.style.fontSize = '10px';
  ruler.style.color = '#94a3b8';
  ruler.style.fontFamily = 'monospace';

  const ticksCount = Math.min(10, timeSpan);
  for (let i = 0; i <= ticksCount; i++) {
    const t = Math.round(minTime + (timeSpan * i) / ticksCount);
    const tick = document.createElement('span');
    tick.textContent = `T=${t}`;
    ruler.appendChild(tick);
  }
  container.appendChild(ruler);

  // 轨道沙盘区
  const tracksArea = document.createElement('div');
  tracksArea.style.flex = '1';
  tracksArea.style.position = 'relative';
  tracksArea.style.marginTop = '6px';
  tracksArea.style.overflowY = 'auto';

  // 渲染轨道底色与标号
  const actualTracks = Math.max(1, tracksCount);
  const trackHeight = 36;
  for (let t = 0; t < actualTracks; t++) {
    const trackRow = document.createElement('div');
    trackRow.style.position = 'absolute';
    trackRow.style.top = `${t * (trackHeight + 6)}px`;
    trackRow.style.left = '0';
    trackRow.style.right = '0';
    trackRow.style.height = `${trackHeight}px`;
    trackRow.style.background = t % 2 === 0 ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)';
    trackRow.style.border = '1px solid rgba(51, 65, 85, 0.5)';
    trackRow.style.borderRadius = '4px';

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.left = '6px';
    label.style.top = '10px';
    label.style.fontSize = '10px';
    label.style.fontWeight = '700';
    label.style.color = '#64748b';
    label.textContent = `轨道 ${t + 1}`;
    trackRow.appendChild(label);

    tracksArea.appendChild(trackRow);
  }

  // 渲染区间条
  intervals.forEach((item) => {
    const bar = document.createElement('div');
    const leftPct = ((item.start - minTime) / timeSpan) * 100;
    const widthPct = Math.max(1.5, ((item.end - item.start) / timeSpan) * 100);

    bar.style.position = 'absolute';
    bar.style.left = `calc(48px + ${leftPct * 0.88}%)`;
    bar.style.width = `calc(${widthPct * 0.88}%)`;
    bar.style.top = `${item.track * (trackHeight + 6) + 4}px`;
    bar.style.height = `${trackHeight - 8}px`;
    bar.style.borderRadius = '4px';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'space-between';
    bar.style.padding = '0 6px';
    bar.style.boxSizing = 'border-box';
    bar.style.fontSize = '10.5px';
    bar.style.fontWeight = '700';
    bar.style.zIndex = '2';
    bar.style.transition = 'all 0.25s ease';

    if (item.status === 'selected') {
      bar.style.background = 'linear-gradient(90deg, #059669, #10b981)';
      bar.style.border = '1px solid #34d399';
      bar.style.color = '#ffffff';
      bar.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
    } else if (item.status === 'active') {
      bar.style.background = 'linear-gradient(90deg, #d97706, #f59e0b)';
      bar.style.border = '1px solid #facc15';
      bar.style.color = '#ffffff';
      bar.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)';
    } else if (item.status === 'discarded') {
      bar.style.background = 'rgba(239, 68, 68, 0.25)';
      bar.style.border = '1px dashed #ef4444';
      bar.style.color = '#f87171';
      bar.style.opacity = '0.6';
    } else {
      bar.style.background = 'rgba(51, 65, 85, 0.8)';
      bar.style.border = '1px solid #64748b';
      bar.style.color = '#cbd5e1';
    }

    bar.innerHTML = `
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
      <span style="font-family:monospace; font-size:9.5px; opacity:0.9;">[${item.start}, ${item.end}]</span>
    `;
    tracksArea.appendChild(bar);
  });

  // 时间游标红线
  if (currentTime !== undefined && currentTime >= minTime && currentTime <= maxTime) {
    const cursorPct = ((currentTime - minTime) / timeSpan) * 100;
    const cursorLine = document.createElement('div');
    cursorLine.style.position = 'absolute';
    cursorLine.style.left = `calc(48px + ${cursorPct * 0.88}%)`;
    cursorLine.style.top = '0';
    cursorLine.style.bottom = '0';
    cursorLine.style.width = '2px';
    cursorLine.style.background = '#ef4444';
    cursorLine.style.boxShadow = '0 0 6px #ef4444';
    cursorLine.style.zIndex = '5';
    cursorLine.style.pointerEvents = 'none';

    const cursorTag = document.createElement('div');
    cursorTag.style.position = 'absolute';
    cursorTag.style.top = '-2px';
    cursorTag.style.left = '50%';
    cursorTag.style.transform = 'translateX(-50%)';
    cursorTag.style.background = '#ef4444';
    cursorTag.style.color = '#ffffff';
    cursorTag.style.padding = '1px 5px';
    cursorTag.style.borderRadius = '3px';
    cursorTag.style.fontSize = '9px';
    cursorTag.style.fontWeight = '800';
    cursorTag.style.whiteSpace = 'nowrap';
    cursorTag.textContent = cursorLabel ? `${cursorLabel}: ${currentTime}` : `t = ${currentTime}`;

    cursorLine.appendChild(cursorTag);
    tracksArea.appendChild(cursorLine);
  }

  container.appendChild(tracksArea);
}

// ==========================================
// 5. IPO 双堆协同资本市场沙盘
// ==========================================
export interface IPOProjectItem {
  id: string;
  name: string;
  cost: number;
  profit: number;
}

export function renderIPOTwoHeapMarket(
  container: HTMLElement,
  config: {
    capital: number;
    kLeft: number;
    lockedProjects: IPOProjectItem[]; // 资金不足锁住 (小根堆按启动金排)
    unlockedProjects: IPOProjectItem[]; // 可投资项目池 (大根堆按纯利润排)
    activeProject?: IPOProjectItem;
  }
): void {
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = '1.2fr 1fr 1fr';
  container.style.gap = '12px';
  container.style.padding = '12px';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.boxSizing = 'border-box';
  container.style.background = '#0b1120';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';

  const { capital, kLeft, lockedProjects, unlockedProjects, activeProject } = config;

  // 1. 资本钱包看板
  const walletCol = document.createElement('div');
  walletCol.style.display = 'flex';
  walletCol.style.flexDirection = 'column';
  walletCol.style.gap = '10px';
  walletCol.style.background = '#1e293b';
  walletCol.style.border = '1px solid #334155';
  walletCol.style.borderRadius = '6px';
  walletCol.style.padding = '12px';

  walletCol.innerHTML = `
    <div style="font-size: 13px; font-weight: 700; color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 6px;">
      💼 资本中心 & 轮次控制
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      <span style="font-size: 11px; color: #94a3b8;">当前总资本 (w):</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: #10b981;">
        $${capital}
      </span>
    </div>
    <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; background:#0f172a; border-radius:4px;">
      <span style="font-size: 11px; color: #94a3b8;">剩余投资轮数 (k):</span>
      <span style="font-size: 14px; font-weight: 700; color: #38bdf8;">${kLeft} 轮</span>
    </div>
    ${
      activeProject
        ? `
      <div style="margin-top:auto; padding:8px; background:rgba(16, 185, 129, 0.15); border:1px solid #10b981; border-radius:6px;">
        <div style="font-size: 11px; font-weight: 700; color: #10b981;">✨ 正在投资落地项目:</div>
        <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-top:2px;">${activeProject.name}</div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top:2px;">
          门槛: $${activeProject.cost} ➔ 纯增益: <b style="color:#10b981;">+$${activeProject.profit}</b>
        </div>
      </div>
    `
        : `
      <div style="margin-top:auto; padding:8px; background:#0f172a; border:1px dashed #475569; border-radius:6px; font-size:11px; color:#64748b; text-align:center;">
        等待选择最优项目...
      </div>
    `
    }
  `;
  container.appendChild(walletCol);

  // 2. 利润大根堆（可选池）
  const unlockedCol = document.createElement('div');
  unlockedCol.style.display = 'flex';
  unlockedCol.style.flexDirection = 'column';
  unlockedCol.style.background = '#1e293b';
  unlockedCol.style.border = '1px solid #059669';
  unlockedCol.style.borderRadius = '6px';
  unlockedCol.style.padding = '10px';
  unlockedCol.style.overflow = 'hidden';

  const unlockedHeader = document.createElement('div');
  unlockedHeader.style.fontSize = '12px';
  unlockedHeader.style.fontWeight = '700';
  unlockedHeader.style.color = '#34d399';
  unlockedHeader.style.borderBottom = '1px solid #334155';
  unlockedHeader.style.paddingBottom = '6px';
  unlockedHeader.textContent = `🎯 已解锁利润大根堆 (${unlockedProjects.length})`;
  unlockedCol.appendChild(unlockedHeader);

  const unlockedList = document.createElement('div');
  unlockedList.style.flex = '1';
  unlockedList.style.overflowY = 'auto';
  unlockedList.style.display = 'flex';
  unlockedList.style.flexDirection = 'column';
  unlockedList.style.gap = '6px';
  unlockedList.style.marginTop = '6px';

  if (unlockedProjects.length === 0) {
    unlockedList.innerHTML = `<div style="font-size:11px; color:#64748b; text-align:center; padding:16px;">当前本金无法承担任何新项目</div>`;
  } else {
    unlockedProjects.forEach((p, idx) => {
      const card = document.createElement('div');
      card.style.padding = '6px 8px';
      card.style.borderRadius = '4px';
      card.style.border = idx === 0 ? '1px solid #10b981' : '1px solid #334155';
      card.style.background = idx === 0 ? 'rgba(16, 185, 129, 0.2)' : '#0f172a';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';

      card.innerHTML = `
        <div>
          <div style="font-size:11.5px; font-weight:700; color:#f8fafc;">
            ${idx === 0 ? '👑 [堆顶] ' : ''}${p.name}
          </div>
          <div style="font-size:10px; color:#94a3b8;">门槛: $${p.cost}</div>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:13px; font-weight:800; color:#10b981;">
          +$${p.profit}
        </div>
      `;
      unlockedList.appendChild(card);
    });
  }
  unlockedCol.appendChild(unlockedList);
  container.appendChild(unlockedCol);

  // 3. 成本小根堆（待解锁池）
  const lockedCol = document.createElement('div');
  lockedCol.style.display = 'flex';
  lockedCol.style.flexDirection = 'column';
  lockedCol.style.background = '#1e293b';
  lockedCol.style.border = '1px solid #475569';
  lockedCol.style.borderRadius = '6px';
  lockedCol.style.padding = '10px';
  lockedCol.style.overflow = 'hidden';

  const lockedHeader = document.createElement('div');
  lockedHeader.style.fontSize = '12px';
  lockedHeader.style.fontWeight = '700';
  lockedHeader.style.color = '#94a3b8';
  lockedHeader.style.borderBottom = '1px solid #334155';
  lockedHeader.style.paddingBottom = '6px';
  lockedHeader.textContent = `🔒 待解锁成本小根堆 (${lockedProjects.length})`;
  lockedCol.appendChild(lockedHeader);

  const lockedList = document.createElement('div');
  lockedList.style.flex = '1';
  lockedList.style.overflowY = 'auto';
  lockedList.style.display = 'flex';
  lockedList.style.flexDirection = 'column';
  lockedList.style.gap = '6px';
  lockedList.style.marginTop = '6px';

  if (lockedProjects.length === 0) {
    lockedList.innerHTML = `<div style="font-size:11px; color:#64748b; text-align:center; padding:16px;">所有项目均已解锁完毕</div>`;
  } else {
    lockedProjects.forEach((p, idx) => {
      const card = document.createElement('div');
      card.style.padding = '6px 8px';
      card.style.borderRadius = '4px';
      card.style.border = '1px solid #334155';
      card.style.background = '#0f172a';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';

      card.innerHTML = `
        <div>
          <div style="font-size:11.5px; font-weight:700; color:#94a3b8;">
            ${idx === 0 ? '🔑 [堆顶门槛] ' : ''}${p.name}
          </div>
          <div style="font-size:10px; color:#64748b;">收益: +$${p.profit}</div>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:12px; font-weight:700; color:#ef4444;">
          需 $${p.cost}
        </div>
      `;
      lockedList.appendChild(card);
    });
  }
  lockedCol.appendChild(lockedList);
  container.appendChild(lockedCol);
}

// ==========================================
// 6. GCD 数论与差值扩散格网沙盘
// ==========================================
export function renderGcdDiffusionGrid(
  container: HTMLElement,
  config: {
    currentArray: number[];
    newlyAdded?: number[];
    comparingPair?: [number, number];
    diffResult?: number;
    gcdValue?: number;
    maxVal?: number;
    theoreticalCount?: number;
  }
): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  container.style.padding = '12px';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.boxSizing = 'border-box';
  container.style.background = '#0f172a';
  container.style.borderRadius = '8px';
  container.style.overflow = 'auto';

  const { currentArray, newlyAdded = [], comparingPair, diffResult, gcdValue, maxVal, theoreticalCount } = config;

  // 顶部数论仪表板
  const dash = document.createElement('div');
  dash.style.display = 'flex';
  dash.style.justifyContent = 'space-between';
  dash.style.alignItems = 'center';
  dash.style.background = '#1e293b';
  dash.style.padding = '8px 12px';
  dash.style.borderRadius = '6px';
  dash.style.border = '1px solid #334155';

  dash.innerHTML = `
    <div>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">🧮 欧几里得 GCD 数论监视</span>
      <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">当前元素数量: <b style="color:#38bdf8;">${currentArray.length}</b></span>
    </div>
    <div style="display:flex; gap:16px; font-size: 12px;">
      <span>最大值 Max: <b style="color:#f59e0b; font-family:monospace;">${maxVal ?? Math.max(...currentArray, 0)}</b></span>
      <span>全局 GCD(g): <b style="color:#10b981; font-family:monospace;">${gcdValue ?? '计算中...'}</b></span>
      <span>理论终态容量: <b style="color:#a855f7; font-family:monospace;">${theoreticalCount ?? '推导中...'}</b></span>
    </div>
  `;
  container.appendChild(dash);

  // 差值绝对值计算比对卡片
  if (comparingPair) {
    const compareCard = document.createElement('div');
    compareCard.style.display = 'flex';
    compareCard.style.alignItems = 'center';
    compareCard.style.justifyContent = 'center';
    compareCard.style.gap = '12px';
    compareCard.style.background = 'rgba(56, 189, 248, 0.1)';
    compareCard.style.border = '1px solid #0284c7';
    compareCard.style.borderRadius = '6px';
    compareCard.style.padding = '8px';

    compareCard.innerHTML = `
      <span style="font-size:12px; color:#cbd5e1;">两数配对差值:</span>
      <span style="font-family:'JetBrains Mono', monospace; font-size:14px; font-weight:800; color:#38bdf8;">
        |${comparingPair[0]} - ${comparingPair[1]}| = ${diffResult !== undefined ? diffResult : Math.abs(comparingPair[0] - comparingPair[1])}
      </span>
      <span style="font-size:11px; color:${newlyAdded.includes(diffResult!) ? '#10b981' : '#f59e0b'}; font-weight:700;">
        ${newlyAdded.includes(diffResult!) ? '🎉 生成新差值入库' : '⚠️ 已存在于集合中，不重复添加'}
      </span>
    `;
    container.appendChild(compareCard);
  }

  // 元素卡片网格
  const gridWrapper = document.createElement('div');
  gridWrapper.style.flex = '1';
  gridWrapper.style.display = 'flex';
  gridWrapper.style.flexWrap = 'wrap';
  gridWrapper.style.gap = '8px';
  gridWrapper.style.alignContent = 'flex-start';
  gridWrapper.style.overflowY = 'auto';

  // 排序后展示
  const sorted = [...currentArray].sort((a, b) => a - b);
  sorted.forEach((num) => {
    const card = document.createElement('div');
    const isNew = newlyAdded.includes(num);
    const isPair = comparingPair && (comparingPair[0] === num || comparingPair[1] === num);

    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';
    card.style.width = '52px';
    card.style.height = '48px';
    card.style.borderRadius = '6px';
    card.style.boxSizing = 'border-box';
    card.style.transition = 'all 0.25s ease';

    if (isPair) {
      card.style.background = '#d97706';
      card.style.border = '2px solid #facc15';
      card.style.boxShadow = '0 0 8px rgba(250, 204, 21, 0.6)';
    } else if (isNew) {
      card.style.background = '#059669';
      card.style.border = '2px solid #34d399';
      card.style.boxShadow = '0 0 8px rgba(52, 211, 153, 0.6)';
    } else {
      card.style.background = '#1e293b';
      card.style.border = '1px solid #475569';
    }

    card.innerHTML = `
      <span style="font-family:'JetBrains Mono', monospace; font-size:14px; font-weight:800; color:#ffffff;">${num}</span>
      <span style="font-size:9px; color:rgba(255,255,255,0.7);">${isNew ? '新生成' : isPair ? '对比中' : '已有'}</span>
    `;
    gridWrapper.appendChild(card);
  });

  container.appendChild(gridWrapper);
}
