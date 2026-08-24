/**
 * 视觉表现适配器深度模块 (Grid & RecursionTree VisualAdapter Deep Module)
 * 封装二维网格 DOM 渲染、SVG 递归树自适应布局计算、探险家小人动效与一维压缩槽位更新。
 */

export interface AdventurerRenderOptions {
  state?: 'walking' | 'cheering' | 'jumping' | 'blocked';
  isFinish?: boolean;
}

export interface GridRenderOptions {
  m: number;
  n: number;
  isReverse?: boolean;
}

export interface TreeMeasureResult {
  totalW: number;
  totalH: number;
  leafCount: number;
  maxDepth: number;
}

export class GridVisualAdapter {
  /**
   * 生成探险家小人矢量 SVG
   */
  public static getAdventurerSvgHtml(options: AdventurerRenderOptions = {}): string {
    const isBlocked = options.state === 'blocked';
    const isCheering = options.isFinish || options.state === 'cheering';
    const extraHead = isBlocked
      ? `
         <circle cx="0" cy="-22" r="15" fill="rgba(239, 68, 68, 0.35)" />
         <text x="-12" y="-22" font-size="11">💥</text>
         <text x="6" y="-22" font-size="11">💦</text>
        `
      : isCheering
      ? `
         <circle cx="0" cy="-22" r="16" fill="rgba(250, 204, 21, 0.28)" />
         <text x="-13" y="-22" font-size="10">✨</text>
         <text x="7" y="-24" font-size="10">⭐</text>
         <text x="7" y="-16" font-size="12">🏆</text>
        `
      : `
         <circle cx="0" cy="-22" r="13" fill="rgba(56, 189, 248, 0.25)" />
         <text x="-12" y="-22" font-size="9">✨</text>
        `;

    const charAnimClass = isBlocked
      ? 'is-jumping'
      : isCheering
      ? 'is-cheering'
      : 'is-jumping';

    return `
      <svg class="adventurer-char ${charAnimClass}" viewBox="-22 -36 44 56" width="38" height="48" style="overflow: visible;">
        <ellipse cx="0" cy="17" rx="11" ry="3.2" fill="rgba(0, 0, 0, 0.35)" class="char-shadow" />
        <g class="char-body">
          <rect x="-13" y="-5" width="6.5" height="13" rx="2.5" fill="#854d0e" stroke="#713f12" stroke-width="0.8" />
          <ellipse cx="-9.5" cy="-5" rx="3" ry="2" fill="#a16207" />
          <rect x="-5.5" y="7" width="3.5" height="7" rx="1.5" fill="#1e293b" />
          <rect x="2" y="7" width="3.5" height="7" rx="1.5" fill="#1e293b" />
          <rect x="-7.5" y="11.5" width="6" height="4" rx="1.5" fill="#b45309" stroke="#78350f" stroke-width="0.7" />
          <rect x="1.5" y="11.5" width="6" height="4" rx="1.5" fill="#b45309" stroke="#78350f" stroke-width="0.7" />
          <rect x="-8.5" y="-6" width="17" height="15" rx="4.5" fill="${isBlocked ? '#ef4444' : '#0284c7'}" stroke="${isBlocked ? '#b91c1c' : '#0369a1'}" stroke-width="1" />
          <path d="M -5 -6 L 0 0 L 5 -6 Z" fill="${isBlocked ? '#facc15' : '#ef4444'}" />
          <rect x="-8" y="3.5" width="16" height="2.5" fill="#334155" />
          <rect x="-2" y="3" width="4.5" height="3.5" rx="0.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />
          ${!isCheering ? `
            <rect x="-11" y="-4" width="4" height="10" rx="2" fill="${isBlocked ? '#ef4444' : '#0284c7'}" stroke="${isBlocked ? '#b91c1c' : '#0369a1'}" stroke-width="0.7" transform="rotate(10 -11 -4)" />
            <circle cx="-10" cy="6" r="2.2" fill="#fed7aa" />
            <rect x="7" y="-4" width="4" height="10" rx="2" fill="${isBlocked ? '#ef4444' : '#0284c7'}" stroke="${isBlocked ? '#b91c1c' : '#0369a1'}" stroke-width="0.7" transform="rotate(-10 7 -4)" />
            <circle cx="10" cy="6" r="2.2" fill="#fed7aa" />
          ` : `
            <circle cx="-11" cy="-14" r="3" fill="#fed7aa" stroke="#ea580c" stroke-width="0.8" />
            <circle cx="11" cy="-14" r="3" fill="#fed7aa" stroke="#ea580c" stroke-width="0.8" />
          `}
          <circle cx="0" cy="-12" r="10" fill="#fed7aa" stroke="#ea580c" stroke-width="0.8" />
          <ellipse cx="-5.5" cy="-10" rx="2.2" ry="1.3" fill="rgba(248, 113, 113, 0.45)" />
          <ellipse cx="5.5" cy="-10" rx="2.2" ry="1.3" fill="rgba(248, 113, 113, 0.45)" />
          ${isBlocked ? `
            <text x="-6" y="-9" font-size="8">😵</text>
          ` : isCheering ? `
            <path d="M -4.5 -13 Q -3 -15.5 -1.5 -13" fill="none" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" />
            <path d="M 1.5 -13 Q 3 -15.5 4.5 -13" fill="none" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" />
          ` : `
            <ellipse cx="-3.2" cy="-13" rx="1.5" ry="2" fill="#0f172a" />
            <circle cx="-3.8" cy="-14" r="0.7" fill="#ffffff" />
            <ellipse cx="3.2" cy="-13" rx="1.5" ry="2" fill="#0f172a" />
            <circle cx="2.6" cy="-14" r="0.7" fill="#ffffff" />
          `}
          <path d="M -2.5 -8 Q 0 -5.5 2.5 -8" fill="none" stroke="#9a3412" stroke-width="1.2" stroke-linecap="round" />
          <ellipse cx="0" cy="-16.5" rx="16" ry="4.8" fill="#d97706" stroke="#92400e" stroke-width="1" />
          <path d="M -9.5 -16.5 C -9.5 -25.5, 9.5 -25.5, 9.5 -16.5 Z" fill="#b45309" stroke="#78350f" stroke-width="1" />
          <path d="M -9.5 -17.5 Q 0 -15 9.5 -17.5" stroke="#ef4444" stroke-width="2" fill="none" />
          <circle cx="-4.5" cy="-20" r="1.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />
          ${extraHead}
        </g>
      </svg>
    `;
  }

  /**
   * 渲染二维网格容器
   */
  public static renderGrid(container: HTMLElement, step: any, options: GridRenderOptions): void {
    if (!container || !step) return;
    const { m, n, isReverse = false } = options;

    container.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    container.innerHTML = '';

    const cellSizeClass = (m >= 5 || n >= 6)
      ? 'w-8 h-8 sm:w-9 sm:h-9 text-[11px]'
      : (m >= 4 || n >= 5)
      ? 'w-9 h-9 sm:w-10 sm:h-10 text-xs'
      : 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-xs';

    const isOutOfBounds = step.isOutOfBounds || step.type === 'out-of-bounds';
    const isRiverBounce = isOutOfBounds && (step.outOfBoundsDir === 'river' || step.i >= m);
    const isRightWallBounce = isOutOfBounds && (step.outOfBoundsDir === 'right-wall' || step.j >= n);
    const isTopWallBounce = isOutOfBounds && (step.outOfBoundsDir === 'top-wall' || step.i < 0);
    const isLeftWallBounce = isOutOfBounds && (step.outOfBoundsDir === 'left-wall' || step.j < 0);

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const cellVal = step.grid?.[r]?.[c] ?? null;
        const isCur = step.i === r && step.j === c;
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const isFinish = isReverse ? (r === 0 && c === 0) : (r === m - 1 && c === n - 1);
        const isObstacle = step.obstacleGrid?.[r]?.[c] === 1;

        // 越界弹回时的发射源网格
        const isRiverOrigin = isRiverBounce && r === m - 1 && c === (step.fromJ >= 0 ? step.fromJ : step.j);
        const isRightWallOrigin = isRightWallBounce && r === (step.fromI >= 0 ? step.fromI : step.i) && c === n - 1;
        const isTopWallOrigin = isTopWallBounce && r === 0 && c === (step.fromJ >= 0 ? step.fromJ : step.j);
        const isLeftWallOrigin = isLeftWallBounce && r === (step.fromI >= 0 ? step.fromI : step.i) && c === 0;

        const cellEl = document.createElement('div');

        if (isObstacle) {
          cellEl.className = `viz-cell is-obstacle ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="text-base font-bold mt-2 z-10">🚧</span>
          `;
        } else if (isRiverOrigin) {
          // 触水弹回单元格展示
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-sky-100 border-sky-400`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 river-splash-dive">
              ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] pointer-events-none z-30 font-bold text-sky-600 flex items-center gap-0.5">
              <span>⬇️💦</span>
            </div>
          `;
        } else if (isRightWallOrigin) {
          // 撞墙弹回单元格展示
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-red-50 border-red-400`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 wall-recoil-bump">
              ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
            </div>
            <div class="absolute top-1/2 -right-6 -translate-y-1/2 pointer-events-none z-30">
              <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-600 text-white shadow border border-white whitespace-nowrap">
                🚧 撞墙 return 0
              </span>
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isTopWallOrigin || isLeftWallOrigin) {
          // 逆推越界单元格展示
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-red-50 border-red-400`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 wall-recoil-bump">
              ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
            <div class="absolute ${isTopWallOrigin ? '-top-3' : '-left-3'} left-1/2 -translate-x-1/2 text-[10px] pointer-events-none z-30 font-bold text-red-600">
              🚫 越界 return 0
            </div>
          `;
        } else if (isCur) {
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${this.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isTop) {
          cellEl.className = `viz-cell is-top ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold`;
          cellEl.innerHTML = `
            <span class="absolute -top-3 -right-1 text-base select-none"><span class="animal-cat">🐱</span></span>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isLeft) {
          cellEl.className = `viz-cell is-left ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold`;
          cellEl.innerHTML = `
            <span class="absolute -top-3 -right-1 text-base select-none"><span class="animal-cat">🐱</span></span>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (cellVal !== null) {
          cellEl.className = `viz-cell is-done ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-bold mt-2 z-10">${cellVal}</span>
          `;
        } else {
          cellEl.className = `viz-cell is-empty ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] absolute top-0.5 left-1">${r},${c}</span>
            ${isFinish ? `<span class="text-xs absolute bottom-1 right-1 opacity-70">🏁</span>` : ''}
            <span class="cell-val text-sm font-medium mt-2">-</span>
          `;
        }
        container.appendChild(cellEl);
      }
    }

    // 动态更新底部深水河流栏 (触水落水弹回动效)
    const riverBarrier = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
      ? document.getElementById('grid-river-barrier')
      : null;
    if (riverBarrier) {
      if (isRiverBounce) {
        riverBarrier.className = 'w-full max-w-[280px] mt-1.5 relative overflow-hidden rounded-lg border-2 border-red-400 bg-gradient-to-r from-sky-800 via-sky-600 to-sky-800 py-1 px-2.5 flex items-center justify-center shadow-md flex-shrink-0';
        riverBarrier.innerHTML = `
          <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-60" preserveAspectRatio="none">
            <path class="dp-river-waves-1" d="M -60 6 Q -30 2, 0 6 T 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6" fill="none" stroke="#ffffff" stroke-width="1.6" />
            <path class="dp-river-waves-2" d="M -60 14 Q -30 10, 0 14 T 60 14 T 120 14 T 180 14 T 240 14 T 300 14 T 360 14 T 420 14 T 480 14 T 540 14 T 600 14 T 660 14 T 720 14 T 780 14" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="6 4" />
          </svg>
          <div class="relative z-10 flex items-center gap-1.5 river-splash-dive">
            <span class="text-xs">💦</span>
            <span class="text-[10px] font-extrabold text-white bg-red-600/95 px-2 py-0.5 rounded-full border border-red-300 shadow flex items-center gap-1">
              <span>💥 触水弹回!</span>
              <span class="font-mono bg-white/20 px-1 rounded text-[9px]">return 0</span>
            </span>
            <span class="text-xs">💦</span>
          </div>
        `;
      } else {
        riverBarrier.className = 'w-full max-w-[280px] mt-1.5 relative overflow-hidden rounded-lg border border-sky-400/80 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 py-0.5 px-2.5 flex items-center justify-center shadow-xs flex-shrink-0';
        riverBarrier.innerHTML = `
          <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none">
            <path class="dp-river-waves-1" d="M -60 6 Q -30 2, 0 6 T 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6" fill="none" stroke="#ffffff" stroke-width="1.3" />
            <path class="dp-river-waves-2" d="M -60 14 Q -30 10, 0 14 T 60 14 T 120 14 T 180 14 T 240 14 T 300 14 T 360 14 T 420 14 T 480 14 T 540 14 T 600 14 T 660 14 T 720 14 T 780 14" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" />
          </svg>
          <span class="relative z-10 text-[10px] font-bold text-sky-100 flex items-center gap-1 drop-shadow select-none">
            🌊 边界深水河流 · 越界反弹 🚫
          </span>
        `;
      }
    }
  }

  /**
   * 构建一维空间压缩槽位骨架 (Full 模式)
   */
  public static build1DSlots(container: HTMLElement, n: number, labelPrefix = 'dp'): void {
    if (!container) return;
    container.innerHTML = '';
    for (let j = 0; j < n; j++) {
      const slot = document.createElement('div');
      slot.id = `memo-slot-${j}`;
      slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-xs flex flex-col items-center justify-between p-1.5 transition-all duration-200';
      slot.innerHTML = `
        <span class="text-[10px] font-mono-code font-bold text-slate-400">${labelPrefix}[${j}]</span>
        <span class="text-base sm:text-lg font-mono-code font-bold text-slate-800 slot-val">0</span>
        <span class="text-[9px] font-sans px-1 rounded bg-slate-100 text-slate-500 slot-badge">未就绪</span>
      `;
      container.appendChild(slot);
    }
  }

  /**
   * 渲染 Lite 模式下的一维 memo 槽位 (卡片 2)
   */
  public static renderLiteMemoSlots(container: HTMLElement, step: any, n: number): void {
    if (!container || !step) return;
    container.innerHTML = '';
    const memoArr = step.memo || [];
    for (let j = 0; j < n; j++) {
      const val = memoArr[j] !== undefined ? memoArr[j] : 0;
      const isCur = step.memoUpdatedIndex === j;
      const isRef = step.memoRefLeftIndex === j;

      const slotBox = document.createElement('div');
      slotBox.className = 'flex flex-col items-center gap-1';

      let slotClass = 'viz-memo-slot w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-mono-code text-xs font-bold border transition-all relative';
      let iconBadge = '';

      if (isCur) {
        slotClass += ' is-updated font-extrabold';
        iconBadge = '<span class="absolute -top-3 -right-1 text-base"><span class="animal-frog">🐸</span></span>';
      } else if (isRef) {
        slotClass += ' is-ref-left font-bold';
        iconBadge = '<span class="absolute -top-3 -right-1 text-base"><span class="animal-cat">🐱</span></span>';
      } else if (val > 0) {
        slotClass += ' is-done font-bold';
      } else {
        slotClass += ' is-empty';
      }

      slotBox.innerHTML = `
        <span class="text-[10px] font-mono-code text-slate-400">j=${j}</span>
        <div class="${slotClass}">
          ${iconBadge}
          <span class="slot-val">${val}</span>
        </div>
      `;
      container.appendChild(slotBox);
    }
  }

  /**
   * 更新 Full 模式下一维滚动数组槽位状态
   */
  public static updateFullMemoSlots(slotsContainer: HTMLElement | null, step: any, n: number): void {
    if (!step || !step.memo) return;
    for (let j = 0; j < n; j++) {
      const slot = slotsContainer 
        ? (slotsContainer.querySelector(`#memo-slot-${j}`) as HTMLElement || document.getElementById(`memo-slot-${j}`))
        : document.getElementById(`memo-slot-${j}`);
      if (!slot) continue;

      const valEl = slot.querySelector('.slot-val');
      const badgeEl = slot.querySelector('.slot-badge');
      const val = step.memo[j] !== undefined ? step.memo[j] : 0;
      if (valEl) valEl.textContent = String(val);

      const isUpdated = step.memoUpdatedIndex === j;
      const isRefLeft = step.memoRefLeftIndex === j;

      slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-xs flex flex-col items-center justify-between p-1.5 transition-all duration-200';
      if (isUpdated) {
        slot.className += ' is-updated';
        if (badgeEl) {
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-amber-500 text-white font-bold';
          badgeEl.textContent = '当前写入 (覆盖)';
        }
      } else if (isRefLeft) {
        slot.className += ' is-ref-left';
        if (badgeEl) {
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-amber-100 text-amber-800 font-semibold';
          badgeEl.textContent = '左方新值 (累加)';
        }
      } else if (val > 0) {
        slot.className += ' is-done';
        if (badgeEl) {
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-emerald-100 text-emerald-700';
          badgeEl.textContent = '上方旧值';
        }
      } else {
        slot.className += ' is-empty';
        if (badgeEl) {
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-slate-100 text-slate-500';
          badgeEl.textContent = '未就绪';
        }
      }
    }
  }

  /**
   * 渲染 Stage-3 状态转移等式看板 (Lite 模式)
   */
  public static renderTransferEquation(container: HTMLElement, step: any, isReverse = false): void {
    if (!container || !step) return;
    const topTxt = step.topVal !== undefined ? step.topVal : '-';
    const leftTxt = step.leftVal !== undefined ? step.leftVal : '-';
    const sumTxt = step.sumVal !== undefined ? step.sumVal : '-';
    const topLabel = isReverse ? '下方' : '上方';
    const leftLabel = isReverse ? '右方' : '左方';

    container.innerHTML = `
      <div class="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-mono-code">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200">
          <span class="animal-cat">🐱</span> ${topLabel}: ${topTxt}
        </div>
        <span class="text-slate-400 font-bold text-base">+</span>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
          <span class="animal-cat">🐱</span> ${leftLabel}: ${leftTxt}
        </div>
        <span class="text-slate-400 font-bold text-base">=</span>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
          <span class="animal-frog">🐸</span> 当前单元: ${sumTxt}
        </div>
      </div>
    `;
  }
}

export class RecursionTreeAdapter {
  /**
   * 渲染自适应 SVG 递归调用树
   */
  public static renderRecursionTree(
    container: HTMLElement,
    root: any,
    activeNodeId?: string,
    isMemo = false
  ): void {
    if (!container) return;
    if (!root) {
      container.innerHTML = '<div class="text-xs text-slate-400 py-6">（暂无递归调用树）</div>';
      return;
    }

    function countLeaves(n: any): number {
      if (!n.children || n.children.length === 0) return 1;
      return n.children.reduce((acc: number, c: any) => acc + countLeaves(c), 0);
    }

    function getDepth(n: any): number {
      if (!n.children || n.children.length === 0) return 0;
      return 1 + Math.max(...n.children.map(getDepth));
    }

    const leafCount = countLeaves(root);
    const maxDepth = getDepth(root);

    let nodeW = 66;
    let nodeH = 25;
    let minGap = 12;
    let levelH = 50;
    let fontSize = 10.5;
    let tagFontSize = 8;
    const topPad = 34;

    if (leafCount >= 10 || maxDepth >= 4) {
      nodeW = 44;
      nodeH = 19;
      minGap = 6;
      levelH = 38;
      fontSize = 8.5;
      tagFontSize = 7;
    } else if (leafCount >= 6 || maxDepth >= 3) {
      nodeW = 54;
      nodeH = 22;
      minGap = 9;
      levelH = 44;
      fontSize = 9.5;
      tagFontSize = 7.5;
    }

    function measure(n: any): any {
      const ch = n.children || [];
      if (ch.length === 0) {
        return { node: n, width: nodeW + minGap, children: [] };
      }
      const measuredCh = ch.map(measure);
      const sumW = measuredCh.reduce((acc: number, c: any) => acc + c.width, 0);
      return { node: n, width: Math.max(nodeW + minGap, sumW), children: measuredCh };
    }

    function assign(mNode: any, depth: number, leftX: number): any {
      const x = leftX + mNode.width / 2;
      const y = topPad + depth * levelH;
      let curL = leftX;
      const placedCh = [];
      for (const c of mNode.children) {
        placedCh.push(assign(c, depth + 1, curL));
        curL += c.width;
      }
      return {
        id: mNode.node.id,
        val: mNode.node.val,
        status: mNode.node.status,
        tag: mNode.node.tag,
        x,
        y,
        width: mNode.width,
        children: placedCh,
      };
    }

    const measured = measure(root);
    const totalW = Math.max(340, measured.width + 24);
    const rootPos = assign(measured, 0, (totalW - measured.width) / 2);
    const totalH = Math.max(160, topPad + maxDepth * levelH + 34);

    const lines: string[] = [];
    const nodes: string[] = [];
    let activeX: number | null = null;

    function draw(n: any): void {
      for (const c of n.children) {
        const startX = n.x;
        const startY = n.y + nodeH / 2;
        const endX = c.x;
        const endY = c.y - nodeH / 2;
        const midY = (startY + endY) / 2;

        const isCurrentBranch = n.id === activeNodeId || c.id === activeNodeId;
        const stroke = isCurrentBranch ? '#3b82f6' : '#cbd5e1';
        const strokeW = isCurrentBranch ? '2' : '1.3';
        const strokeDash = c.status === 'pruned' ? '3,3' : 'none';

        lines.push(
          `<path d="M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" stroke-dasharray="${strokeDash}" />`
        );
        draw(c);
      }

      const isCurrent = n.id === activeNodeId;
      if (isCurrent) activeX = n.x;

      const isBase = n.status === 'base';
      const isPruned = n.status === 'pruned';
      const isOutOfBoundsNode = isPruned && n.tag && n.tag.includes('🚫');
      const isRepeated = n.tag && n.tag.includes('重复');
      const isVisited = n.status === 'visited';

      let stroke = '#cbd5e1';
      let strokeW = '1.2';
      let fill = '#ffffff';
      let textColor = '#334155';
      let filterGlow = '';

      if (isCurrent) {
        stroke = '#2563eb';
        strokeW = '2.5';
        fill = '#eff6ff';
        textColor = '#1d4ed8';
        filterGlow = 'filter="drop-shadow(0 0 6px rgba(59, 130, 246, 0.45))"';
      } else if (isOutOfBoundsNode) {
        stroke = '#ef4444';
        fill = '#fef2f2';
        textColor = '#b91c1c';
      } else if (isPruned) {
        stroke = '#9333ea';
        fill = '#faf5ff';
        textColor = '#7e22ce';
      } else if (isRepeated) {
        stroke = '#d97706';
        fill = '#fffbeb';
        textColor = '#b45309';
      } else if (isBase) {
        stroke = '#16a34a';
        fill = '#f0fdf4';
        textColor = '#15803d';
      } else if (isVisited) {
        stroke = '#10b981';
        fill = '#ffffff';
        textColor = '#047857';
      }

      let badgeHtml = '';
      if (n.tag) {
        const tagBg = isOutOfBoundsNode ? '#ef4444' : isPruned ? '#9333ea' : isRepeated ? '#d97706' : '#10b981';
        const badgeW = Math.min(nodeW - 2, Math.max(26, n.tag.length * 6.5 + 4));
        badgeHtml = `
          <g transform="translate(0, ${nodeH / 2 + 7})">
            <rect x="${-badgeW / 2}" y="-5.5" width="${badgeW}" height="11" rx="3" fill="${tagBg}" />
            <text x="0" y="2.5" text-anchor="middle" fill="#ffffff" font-size="${tagFontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.tag}</text>
          </g>
        `;
      }

      let animalHtml = '';
      if (isCurrent) {
        animalHtml = `
          <g transform="translate(0, ${-nodeH / 2 - 5})">
            <text x="0" y="0" text-anchor="middle" font-size="${Math.max(12, fontSize + 3)}" class="animal-frog select-none">🐸</text>
          </g>
        `;
      }

      nodes.push(`
        <g transform="translate(${n.x}, ${n.y})" ${filterGlow}>
          <rect x="${-nodeW / 2}" y="${-nodeH / 2}" width="${nodeW}" height="${nodeH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
          <text x="0" y="3.5" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.val}</text>
          ${badgeHtml}
          ${animalHtml}
        </g>
      `);
    }

    draw(rootPos);

    container.innerHTML = `
      <div id="tree-scroll-box" class="w-full h-full flex items-center justify-start overflow-auto p-1 scroll-smooth">
        <svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="min-width: ${totalW}px; min-height: ${totalH}px; display: block; margin: auto;">
          ${lines.join('')}
          ${nodes.join('')}
        </svg>
      </div>
    `;

    if (activeX !== null) {
      const scrollBox = container.querySelector('#tree-scroll-box');
      if (scrollBox && scrollBox.scrollWidth > scrollBox.clientWidth) {
        const targetScrollLeft = (activeX as number) - scrollBox.clientWidth / 2;
        scrollBox.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  }
}
