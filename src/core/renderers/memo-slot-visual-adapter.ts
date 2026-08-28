/**
 * 一维空间压缩滚动数组槽位表现适配器 (MemoSlotVisualAdapter Deep Module)
 * 遵循单一职责与深模块原则：
 * 封装 Lite 与 Full 两种模式下一维 memo 槽位构建、数值状态刷新、动画动效与方程徽章渲染。
 */

export class MemoSlotVisualAdapter {
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
    
    // 强制重置容器为竖向列式居中容器，杜绝与上层 HTML 任何 flex-row 冲突
    container.className = 'w-full h-full flex flex-col items-center justify-center gap-2 p-1 relative overflow-auto';
    
    const memoArr = step.memoSnapshot || step.memo || step.dp1d || (step.grid && step.grid[0]) || [];

    // 1. 顶层状态转移等式 / 解释卡片
    const equationWrapper = document.createElement('div');
    equationWrapper.className = 'w-full max-w-md mx-auto mb-1 px-1';

    const activeSlotIdx = step.activeSlot !== undefined
      ? step.activeSlot
      : (Array.isArray(step.highlightSlots) && step.highlightSlots.length > 0)
      ? step.highlightSlots[0]
      : step.currentJ !== undefined
      ? step.currentJ
      : step.j !== undefined
      ? step.j
      : step.currentI !== undefined
      ? step.currentI
      : undefined;

    if (step.slotMode === 'down') {
      const isKeep = step.type === 'keep-val';
      const label = isKeep ? '首列保持旧值 (Down):' : '读取上方旧值 (Down):';
      const val = step.down ?? step.memoj ?? (activeSlotIdx !== undefined ? memoArr[activeSlotIdx] : 0);
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-purple-700 bg-purple-50/90 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center justify-between shadow-xs animate-pulse">
          <span class="flex items-center gap-1.5"><span class="animal-cat">🐱</span> <span>${label}</span></span>
          <span class="font-extrabold bg-purple-200/80 px-2 py-0.5 rounded text-purple-900">memo[${activeSlotIdx ?? 0}] = ${val}</span>
        </div>
      `;
    } else if (step.slotMode === 'right') {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-amber-700 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between shadow-xs animate-pulse">
          <span class="flex items-center gap-1.5"><span class="animal-cat">🐱</span> <span>读取左侧新值 (Right):</span></span>
          <span class="font-extrabold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">right = memo[${activeSlotIdx ?? 0}] = ${step.right ?? step.memoj}</span>
        </div>
      `;
    } else if (step.slotMode === 'updated') {
      const sumVal = step.memoj !== undefined ? step.memoj : (activeSlotIdx !== undefined ? memoArr[activeSlotIdx] : 0);
      const isBlocked = step.type === 'obstacle-cell';
      const icon = isBlocked ? '🚧' : '<span class="animal-frog">🐸</span>';
      const label = isBlocked ? '障碍物清零覆盖:' : '滚动覆盖累加:';
      const color = isBlocked ? 'text-amber-800 bg-amber-50/90 border-amber-300' : 'text-emerald-700 bg-emerald-50/90 border-emerald-200';
      const badgeColor = isBlocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200/80 text-emerald-900';
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold ${color} px-3 py-1.5 rounded-lg border flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5">${icon} <span>${label}</span></span>
          <span class="font-extrabold ${badgeColor} px-2 py-0.5 rounded">memo[${activeSlotIdx ?? 0}] = ${sumVal}</span>
        </div>
      `;
    } else if (activeSlotIdx !== undefined && step.type?.includes('update')) {
      const sumVal = step.memoj !== undefined ? step.memoj : (activeSlotIdx !== undefined ? memoArr[activeSlotIdx] : 0);
      const isBlocked = step.type === 'obstacle-cell';
      const icon = isBlocked ? '🚧' : '<span class="animal-frog">🐸</span>';
      const label = isBlocked ? '障碍物清零覆盖:' : (step.tag || '状态转移更新:');
      const color = isBlocked ? 'text-amber-800 bg-amber-50/90 border-amber-300' : 'text-emerald-700 bg-emerald-50/90 border-emerald-200';
      const badgeColor = isBlocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200/80 text-emerald-900';
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold ${color} px-3 py-1.5 rounded-lg border flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5">${icon} <span>${label}</span></span>
          <span class="font-extrabold ${badgeColor} px-2 py-0.5 rounded">dp[${activeSlotIdx ?? 0}] = ${sumVal}</span>
        </div>
      `;
    } else {
      equationWrapper.innerHTML = `
        <div class="text-xs text-slate-500 font-mono py-1.5 px-3 text-center bg-slate-50/80 rounded-lg border border-slate-200 flex items-center justify-center gap-2">
          <span>📦 一维空间压缩：长度为 <strong>${n}</strong> 的滚动数组</span>
        </div>
      `;
    }
    container.appendChild(equationWrapper);

    // 2. 槽位容器
    const slotsRow = document.createElement('div');
    slotsRow.className = 'w-full flex items-center justify-center gap-3 sm:gap-4 flex-nowrap py-1 overflow-x-auto';

    const activeSet = new Set<number>();
    if (activeSlotIdx !== undefined) activeSet.add(activeSlotIdx);
    if (Array.isArray(step.highlightSlots)) {
      for (const idx of step.highlightSlots) activeSet.add(idx);
    }

    const slotCount = Math.max(n, memoArr.length);
    for (let j = 0; j < slotCount; j++) {
      const val = memoArr[j] !== undefined && memoArr[j] !== null ? memoArr[j] : 0;
      const isCur = activeSet.has(j);
      const mode = isCur ? step.slotMode : undefined;

      const slotBox = document.createElement('div');
      slotBox.className = 'flex flex-col items-center gap-1 relative flex-shrink-0';

      let slotClass = 'viz-memo-slot w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-mono-code text-xs font-bold border-2 transition-all relative shadow-xs';
      let iconBadge = '';
      let bottomTag = '';

      if (isCur && mode === 'updated') {
        const isBlocked = step.type === 'obstacle-cell';
        if (isBlocked) {
          slotClass += ' bg-amber-100 border-amber-500 text-amber-900 font-extrabold ring-2 ring-amber-400 scale-105 shadow-md';
          iconBadge = '<span class="absolute -top-3.5 -right-1 text-base">🚧</span>';
          bottomTag = '<span class="text-[9px] px-1 rounded bg-amber-600 text-white font-sans font-semibold">置0</span>';
        } else {
          slotClass += ' bg-emerald-100 border-emerald-500 text-emerald-900 font-extrabold ring-2 ring-emerald-400 scale-105 shadow-md';
          iconBadge = '<span class="absolute -top-3.5 -right-1 text-base"><span class="animal-frog">🐸</span></span>';
          bottomTag = '<span class="text-[9px] px-1 rounded bg-emerald-600 text-white font-sans font-semibold">覆盖</span>';
        }
      } else if (isCur && mode === 'down') {
        slotClass += ' bg-purple-100 border-purple-500 text-purple-900 font-extrabold ring-2 ring-purple-400 scale-105 shadow-md';
        iconBadge = '<span class="absolute -top-3.5 -right-1 text-base"><span class="animal-cat">🐱</span></span>';
        bottomTag = '<span class="text-[9px] px-1 rounded bg-purple-600 text-white font-sans font-semibold">上方旧</span>';
      } else if (isCur && mode === 'right') {
        slotClass += ' bg-amber-100 border-amber-500 text-amber-900 font-extrabold ring-2 ring-amber-400 scale-105 shadow-md';
        iconBadge = '<span class="absolute -top-3.5 -right-1 text-base"><span class="animal-cat">🐱</span></span>';
        bottomTag = '<span class="text-[9px] px-1 rounded bg-amber-600 text-white font-sans font-semibold">左侧新</span>';
      } else if (isCur) {
        slotClass += ' bg-blue-100 border-blue-500 text-blue-900 font-extrabold ring-2 ring-blue-400 scale-105 shadow-md';
        iconBadge = '<span class="absolute -top-3.5 -right-1 text-base"><span class="animal-cat">🐱</span></span>';
        bottomTag = '<span class="text-[9px] px-1 rounded bg-blue-600 text-white font-sans font-semibold">当前</span>';
      } else if (val !== 0 && val !== null) {
        slotClass += ' bg-slate-50 border-slate-300 text-slate-800 font-bold';
        bottomTag = `<span class="text-[9px] text-slate-400 font-sans">就绪</span>`;
      } else {
        slotClass += ' bg-white border-slate-200 text-slate-400';
        bottomTag = `<span class="text-[9px] text-slate-300 font-sans">0</span>`;
      }

      slotBox.innerHTML = `
        <span class="text-[10px] font-mono-code font-semibold text-slate-500">memo[${j}]</span>
        <div class="${slotClass}">
          ${iconBadge}
          <span class="slot-val text-sm sm:text-base font-extrabold">${val}</span>
        </div>
        ${bottomTag}
      `;
      slotsRow.appendChild(slotBox);
    }
    container.appendChild(slotsRow);
  }

  /**
   * 更新 Full 模式下一维滚动数组槽位状态
   */
  public static updateFullMemoSlots(slotsContainer: HTMLElement | null, step: any, n: number): void {
    if (!step) return;
    const memoArr = step.memoSnapshot || step.memo || [];
    for (let j = 0; j < n; j++) {
      const slot = slotsContainer 
        ? (slotsContainer.querySelector(`#memo-slot-${j}`) as HTMLElement || document.getElementById(`memo-slot-${j}`))
        : document.getElementById(`memo-slot-${j}`);
      if (!slot) continue;

      const valEl = slot.querySelector('.slot-val');
      const badgeEl = slot.querySelector('.slot-badge');
      const val = memoArr[j] !== undefined ? memoArr[j] : 0;
      if (valEl) valEl.textContent = String(val);

      const isCur = step.activeSlot === j;
      const mode = isCur ? step.slotMode : undefined;

      if (isCur && mode === 'updated') {
        slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-md flex flex-col items-center justify-between p-1.5 transition-all duration-200 bg-emerald-100 border-emerald-500 scale-105 ring-2 ring-emerald-400';
        if (badgeEl) {
          badgeEl.textContent = '✨ 累加更新';
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-emerald-600 text-white font-semibold';
        }
      } else if (isCur && mode === 'down') {
        slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-md flex flex-col items-center justify-between p-1.5 transition-all duration-200 bg-purple-100 border-purple-500 scale-105 ring-2 ring-purple-400';
        if (badgeEl) {
          badgeEl.textContent = '⬇️ 上方旧值';
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-purple-600 text-white font-semibold';
        }
      } else if (isCur && mode === 'right') {
        slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-md flex flex-col items-center justify-between p-1.5 transition-all duration-200 bg-amber-100 border-amber-500 scale-105 ring-2 ring-amber-400';
        if (badgeEl) {
          badgeEl.textContent = '➡️ 左侧新值';
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-amber-600 text-white font-semibold';
        }
      } else if (val > 0) {
        slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-xs flex flex-col items-center justify-between p-1.5 transition-all duration-200 bg-slate-50 border-slate-300';
        if (badgeEl) {
          badgeEl.textContent = '已就绪';
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-slate-200 text-slate-700 font-semibold';
        }
      } else {
        slot.className = 'viz-memo-slot w-16 sm:w-20 h-16 rounded-xl border-2 shadow-xs flex flex-col items-center justify-between p-1.5 transition-all duration-200 bg-white border-slate-200';
        if (badgeEl) {
          badgeEl.textContent = '未就绪';
          badgeEl.className = 'text-[9px] font-sans px-1 rounded bg-slate-100 text-slate-400';
        }
      }
    }
  }
}
