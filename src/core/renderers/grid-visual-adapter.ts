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
  isGridProblem?: boolean;
  modelId?: string;
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
      ? 'is-blocked'
      : isCheering
      ? 'is-cheering'
      : 'is-walking';

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
    const isGridProblem = options.isGridProblem ?? (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId) : true);

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

    const isStepOutOfBounds = (step.i >= m || step.j >= n || step.i < 0 || step.j < 0);
    const isObstacleHit = (step.type === 'obstacle-hit' || step.type === 'obstacle-cell')
      || (step.obstacleGrid?.[step.i]?.[step.j] === 1 && (step.isBlockedStep || step.type === 'dfs-call'));
    const isStepBlocked = (isStepOutOfBounds || isObstacleHit) && (step.fromI !== undefined && step.fromI >= 0 && step.fromJ !== undefined && step.fromJ >= 0);

    const activeStandingI = isStepBlocked
      ? step.fromI
      : (isStepOutOfBounds ? Math.min(m - 1, Math.max(0, step.i)) : step.i);
    const activeStandingJ = isStepBlocked
      ? step.fromJ
      : (isStepOutOfBounds ? Math.min(n - 1, Math.max(0, step.j)) : step.j);

    const activeStackList: string[] = Array.isArray(step.activeStack) ? step.activeStack : [];
    const activeTrailSet = new Set<string>(activeStackList);

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const key = `${r},${c}`;
        const cellVal = step.grid?.[r]?.[c] ?? null;
        const isStandingCell = (r === activeStandingI && c === activeStandingJ);
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const isFinish = isReverse ? (r === 0 && c === 0) : (r === m - 1 && c === n - 1);
        const isObstacle = step.obstacleGrid?.[r]?.[c] === 1;

        const isRiverOrigin = isRiverBounce && r === m - 1 && c === (step.fromJ !== undefined && step.fromJ >= 0 ? step.fromJ : Math.min(n - 1, Math.max(0, step.j)));
        const isRightWallOrigin = isRightWallBounce && r === (step.fromI !== undefined && step.fromI >= 0 ? step.fromI : Math.min(m - 1, Math.max(0, step.i))) && c === n - 1;
        const isTopWallOrigin = isTopWallBounce && r === 0 && c === (step.fromJ !== undefined && step.fromJ >= 0 ? step.fromJ : Math.min(n - 1, Math.max(0, step.j)));
        const isLeftWallOrigin = isLeftWallBounce && r === (step.fromI !== undefined && step.fromI >= 0 ? step.fromI : Math.min(m - 1, Math.max(0, step.i))) && c === 0;

        const isObstacleOrigin = isObstacleHit && isStepBlocked && (r === step.fromI && c === step.fromJ);
        const isCur = (isStandingCell || isObstacleOrigin) && !isRiverOrigin && !isRightWallOrigin && !isTopWallOrigin && !isLeftWallOrigin;
        const isTrail = activeTrailSet.has(key) && !isStandingCell && !isObstacleOrigin && !isRiverOrigin && !isRightWallOrigin && !isTopWallOrigin && !isLeftWallOrigin;

        const cellEl = document.createElement('div');
        cellEl.setAttribute('data-coord', `${r},${c}`);

        if (isObstacleOrigin) {
          const isObstacleDown = step.i > (step.fromI ?? -1);
          const isObstacleRight = step.j > (step.fromJ ?? -1);
          const isObstacleUp = step.i < (step.fromI ?? -1);
          const isObstacleLeft = step.j < (step.fromJ ?? -1);
          const obstacleAnimClass = isObstacleDown
            ? 'obstacle-recoil-down'
            : isObstacleRight
            ? 'obstacle-recoil-right'
            : isObstacleUp
            ? 'obstacle-recoil-up'
            : isObstacleLeft
            ? 'obstacle-recoil-left'
            : 'wall-recoil-bump';

          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-amber-50/90 border-amber-500 shadow-md`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              <div class="${obstacleAnimClass}">
                ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
              </div>
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] pointer-events-none z-30 font-bold px-1.5 py-0.5 rounded-full bg-amber-600 text-white shadow whitespace-nowrap border border-white">
              🚧 遇障弹回 ${step.type === 'obstacle-cell' ? '置 0' : 'return 0'}
            </div>
          `;
        } else if (isObstacle && isCur && !isObstacleOrigin) {
          // 🛡️ 兜底分支：当无法确定来源格时的原地受阻反弹（例如起点 (0, 0) 本身就是障碍物）
          cellEl.className = `viz-cell is-obstacle is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-amber-50/90 border-amber-400 shadow-md`;
          cellEl.innerHTML = `
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              <div class="obstacle-bonk-recoil">
                ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
              </div>
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="text-base font-bold mt-2 z-10">🚧</span>
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] pointer-events-none z-30 font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-white shadow whitespace-nowrap border border-white">
              🚧 障碍格置 0
            </div>
          `;
        } else if (isObstacle && (step.type === 'obstacle-cell' || step.type === 'obstacle-hit') && r === step.i && c === step.j) {
          if (!isStepBlocked) {
            // 正在被扫描检查的障碍物目标单元格（小人在当前格呈现受阻高亮与置0提示）
            cellEl.className = `viz-cell is-obstacle is-cur is-target ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-amber-50/90 border-amber-400 shadow-md animate-pulse`;
            cellEl.innerHTML = `
              <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                <div class="obstacle-bonk-recoil">
                  ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
                </div>
              </div>
              <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
              <span class="text-base font-bold mt-2 z-10">🚧</span>
              <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] pointer-events-none z-30 font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-white shadow whitespace-nowrap border border-white">
                🚧 障碍格置 0
              </div>
            `;
          } else {
            cellEl.className = `viz-cell is-obstacle is-target ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border bg-slate-100/90 border-slate-300`;
            cellEl.innerHTML = `
              <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
              <span class="text-base font-bold mt-2 z-10">🚧</span>
            `;
          }
        } else if (isObstacle) {
          // 静态障碍物格子 (非当前活动点)
          cellEl.className = `viz-cell is-obstacle ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border bg-slate-100/90 border-slate-300`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="text-base font-bold mt-2 z-10">🚧</span>
          `;
        } else if (isRiverOrigin) {
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-sky-100 border-sky-400`;
          cellEl.innerHTML = `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              <div class="river-recoil-jump">
                ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
              </div>
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isRightWallOrigin) {
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-red-50 border-red-400`;
          cellEl.innerHTML = `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              <div class="wall-recoil-right">
                ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
              </div>
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
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-red-50 border-red-400`;
          cellEl.innerHTML = `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              <div class="wall-recoil-bump">
                ${this.getAdventurerSvgHtml({ state: 'blocked', isFinish: false })}
              </div>
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
            <div class="absolute ${isTopWallOrigin ? '-top-3' : '-left-3'} left-1/2 -translate-x-1/2 text-[10px] pointer-events-none z-30 font-bold text-red-600">
              🚫 越界 return 0
            </div>
          `;
        } else if (isCur) {
          cellEl.className = `viz-cell is-cur ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-blue-50/90 border-blue-500 shadow-sm`;
          cellEl.innerHTML = isGridProblem ? `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${this.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          ` : `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1 text-blue-700">${r},${c}</span>
            <span class="text-[9px] font-extrabold px-1 py-0.2 rounded bg-blue-600 text-white shadow-2xs absolute top-0.5 right-1 whitespace-nowrap leading-none">当前</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10 text-blue-900">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isTrail) {
          cellEl.className = `viz-cell is-trail ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-sky-50/80 border-sky-400 border-dashed text-sky-700 shadow-2xs`;
          cellEl.innerHTML = isGridProblem ? `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1 text-sky-600">${r},${c}</span>
            <span class="text-sm select-none animate-pulse">👣</span>
            <span class="cell-val text-xs font-extrabold mt-0.5 z-10 text-sky-700">${cellVal !== null ? cellVal : ''}</span>
          ` : `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1 text-sky-600">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10 text-sky-700">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isTop) {
          cellEl.className = `viz-cell is-top ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-purple-50/90 border-purple-400 shadow-2xs`;
          cellEl.innerHTML = isGridProblem ? `
            <span class="absolute -top-3 -right-1 text-base select-none"><span class="animal-cat">🐱</span></span>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          ` : `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1 text-purple-700">${r},${c}</span>
            <span class="text-[9px] font-extrabold px-1 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-300 absolute top-0.5 right-1 whitespace-nowrap leading-none">↑上</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10 text-purple-900">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (isLeft) {
          cellEl.className = `viz-cell is-left ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-amber-50/90 border-amber-400 shadow-2xs`;
          cellEl.innerHTML = isGridProblem ? `
            <span class="absolute -top-3 -right-1 text-base select-none"><span class="animal-cat">🐱</span></span>
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1">${r},${c}</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10">${cellVal !== null ? cellVal : ''}</span>
          ` : `
            <span class="cell-coord text-[9px] font-bold absolute top-0.5 left-1 text-amber-700">${r},${c}</span>
            <span class="text-[9px] font-extrabold px-1 py-0.2 rounded bg-amber-100 text-amber-700 border border-amber-300 absolute top-0.5 right-1 whitespace-nowrap leading-none">←左</span>
            <span class="cell-val text-sm font-extrabold mt-2 z-10 text-amber-900">${cellVal !== null ? cellVal : ''}</span>
          `;
        } else if (cellVal !== null) {
          cellEl.className = `viz-cell is-done ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border font-bold bg-slate-50 border-slate-300 text-slate-800`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] absolute top-0.5 left-1 text-slate-500">${r},${c}</span>
            <span class="cell-val text-sm font-bold mt-2 z-10">${cellVal}</span>
          `;
        } else {
          cellEl.className = `viz-cell is-empty ${cellSizeClass} rounded-lg flex flex-col items-center justify-center relative font-mono-code transition-all border border-slate-200 text-slate-400`;
          cellEl.innerHTML = `
            <span class="cell-coord text-[9px] absolute top-0.5 left-1 text-slate-400">${r},${c}</span>
            ${isFinish && isGridProblem ? `<span class="text-xs absolute bottom-1 right-1 opacity-70">🏁</span>` : ''}
            <span class="cell-val text-sm font-medium mt-2">-</span>
          `;
        }
        container.appendChild(cellEl);
      }
    }

    if (isGridProblem) {
      const hasAdventurer = container.querySelector('.adventurer-char') !== null;
      if (!hasAdventurer) {
        const targetR = Math.min(m - 1, Math.max(0, activeStandingI ?? 0));
        const targetC = Math.min(n - 1, Math.max(0, activeStandingJ ?? 0));
        const targetCell = container.querySelector(`[data-coord="${targetR},${targetC}"]`) || container.firstElementChild;
        if (targetCell) {
          const advHolder = document.createElement('div');
          advHolder.className = 'adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30';
          advHolder.innerHTML = this.getAdventurerSvgHtml({ state: 'walking', isFinish: false });
          targetCell.appendChild(advHolder);
        }
      }
    }

    GridVisualAdapter.drawGridArrows(container, step, options);

    const riverBarrier = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
      ? document.getElementById('grid-river-barrier')
      : null;
    if (riverBarrier) {
      if (!isGridProblem) {
        riverBarrier.style.display = 'none';
      } else {
        riverBarrier.style.display = 'flex';
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
   * 绘制网格探索箭头与状态转移连线
   */
  public static drawGridArrows(container: HTMLElement, step: any, options: GridRenderOptions): void {
    if (!container || typeof document === 'undefined') return;
    const gridWrapper = container.parentElement;
    const svg = (gridWrapper && typeof gridWrapper.querySelector === 'function')
      ? gridWrapper.querySelector('#grid-arrows-svg')
      : (typeof document.getElementById === 'function' ? document.getElementById('grid-arrows-svg') : null);
    if (!svg) return;

    const defs = typeof svg.querySelector === 'function' ? svg.querySelector('defs') : null;
    const defsHtml = defs ? defs.outerHTML : `
      <defs>
        <marker id="arrow-forward" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-reverse" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 9 1 L 0 5 L 9 9 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-top-down" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#9333ea" />
        </marker>
        <marker id="arrow-left-right" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#d97706" />
        </marker>
      </defs>
    `;
    svg.innerHTML = defsHtml;

    const { m, n } = options;
    const isGridProblem = options.isGridProblem ?? (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId) : true);
    const activeStackList: string[] = Array.isArray(step.activeStack) ? step.activeStack : [];

    // 1. 递归路径足迹连线 (Stage 1 & Stage 2) - 仅在网格迷宫问题上绘制空间探索足迹连线
    if (isGridProblem && activeStackList.length >= 2 && typeof document.createElementNS === 'function') {
      for (let i = 0; i < activeStackList.length - 1; i++) {
        const [r1, c1] = activeStackList[i].split(',').map(Number);
        const [r2, c2] = activeStackList[i + 1].split(',').map(Number);

        const idx1 = r1 * n + c1;
        const cellEl1 = container.children[idx1] as HTMLElement;
        if (!cellEl1 || typeof cellEl1.offsetLeft === 'undefined') continue;

        const x1 = cellEl1.offsetLeft + cellEl1.offsetWidth / 2;
        const y1 = cellEl1.offsetTop + cellEl1.offsetHeight / 2;

        if (r2 < m && c2 < n && r2 >= 0 && c2 >= 0) {
          const idx2 = r2 * n + c2;
          const cellEl2 = container.children[idx2] as HTMLElement;
          if (!cellEl2 || typeof cellEl2.offsetLeft === 'undefined') continue;

          const x2 = cellEl2.offsetLeft + cellEl2.offsetWidth / 2;
          const y2 = cellEl2.offsetTop + cellEl2.offsetHeight / 2;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const sx = x1 + (dx / dist) * 12;
          const sy = y1 + (dy / dist) * 12;
          const ex = x2 - (dx / dist) * 14;
          const ey = y2 - (dy / dist) * 14;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#0284c7');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          line.setAttribute('opacity', '0.85');
          svg.appendChild(line);
        } else if (r2 >= m) {
          // 向下跳入深水河流
          const riverBarrier = (typeof document.getElementById === 'function') ? document.getElementById('grid-river-barrier') : null;
          const targetY = riverBarrier ? riverBarrier.offsetTop : (y1 + cellEl1.offsetHeight / 2 + 16);
          const sx = x1;
          const sy = y1 + 12;
          const ex = x1;
          const ey = targetY;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (c2 >= n) {
          // 向右撞墙
          const sx = x1 + 12;
          const sy = y1;
          const ex = x1 + cellEl1.offsetWidth / 2 + 14;
          const ey = y1;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (r2 < 0) {
          // 向上撞墙
          const sx = x1;
          const sy = y1 - 12;
          const ex = x1;
          const ey = container.offsetTop - 8;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (c2 < 0) {
          // 向左撞墙
          const sx = x1 - 12;
          const sy = y1;
          const ex = container.offsetLeft - 8;
          const ey = y1;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        }
      }
    }

    // 2. 状态转移箭头 (Stage 3 二维 DP 填表)
    if ((step.type === 'update' || step.type === 'update-cell' || (step.topI !== undefined && step.topI >= 0) || (step.leftI !== undefined && step.leftI >= 0)) && typeof document.createElementNS === 'function') {
      const curIdx = step.i * n + step.j;
      const curCell = container.children[curIdx] as HTMLElement;
      if (curCell && typeof curCell.offsetLeft !== 'undefined') {
        const curX = curCell.offsetLeft + curCell.offsetWidth / 2;
        const curY = curCell.offsetTop + curCell.offsetHeight / 2;

        if (step.topI !== undefined && step.topI >= 0 && step.topI < m && step.topJ !== undefined && step.topJ >= 0 && step.topJ < n) {
          const topIdx = step.topI * n + step.topJ;
          const topCell = container.children[topIdx] as HTMLElement;
          if (topCell && typeof topCell.offsetLeft !== 'undefined') {
            const topX = topCell.offsetLeft + topCell.offsetWidth / 2;
            const topY = topCell.offsetTop + topCell.offsetHeight / 2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(topX));
            line.setAttribute('y1', String(topY + 12));
            line.setAttribute('x2', String(curX));
            line.setAttribute('y2', String(curY - 14));
            line.setAttribute('stroke', '#9333ea');
            line.setAttribute('stroke-width', '2.2');
            line.setAttribute('marker-end', 'url(#arrow-top-down)');
            svg.appendChild(line);
          }
        }

        if (step.leftI !== undefined && step.leftI >= 0 && step.leftI < m && step.leftJ !== undefined && step.leftJ >= 0 && step.leftJ < n) {
          const leftIdx = step.leftI * n + step.leftJ;
          const leftCell = container.children[leftIdx] as HTMLElement;
          if (leftCell && typeof leftCell.offsetLeft !== 'undefined') {
            const leftX = leftCell.offsetLeft + leftCell.offsetWidth / 2;
            const leftY = leftCell.offsetTop + leftCell.offsetHeight / 2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(leftX + 12));
            line.setAttribute('y1', String(leftY));
            line.setAttribute('x2', String(curX - 14));
            line.setAttribute('y2', String(curY));
            line.setAttribute('stroke', '#d97706');
            line.setAttribute('stroke-width', '2.2');
            line.setAttribute('marker-end', 'url(#arrow-left-right)');
            svg.appendChild(line);
          }
        }
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
    
    // 🛡️ 强制重置容器为竖向列式居中容器，杜绝与上层 HTML 任何 flex-row 冲突
    container.className = 'w-full h-full flex flex-col items-center justify-center gap-2 p-1 relative overflow-auto';
    
    const memoArr = step.memoSnapshot || step.memo || [];

    // 1. 顶层状态转移等式 / 解释卡片 (居中且限定最大宽度，绝对不与槽位争夺水平空间)
    const equationWrapper = document.createElement('div');
    equationWrapper.className = 'w-full max-w-md mx-auto mb-1 px-1';

    if (step.slotMode === 'down') {
      const isKeep = step.type === 'keep-val';
      const label = isKeep ? '首列保持旧值 (Down):' : '读取上方旧值 (Down):';
      const val = step.down ?? step.memoj ?? memoArr[step.activeSlot];
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-purple-700 bg-purple-50/90 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center justify-between shadow-xs animate-pulse">
          <span class="flex items-center gap-1.5"><span class="animal-cat">🐱</span> <span>${label}</span></span>
          <span class="font-extrabold bg-purple-200/80 px-2 py-0.5 rounded text-purple-900">memo[${step.activeSlot}] = ${val}</span>
        </div>
      `;
    } else if (step.slotMode === 'right') {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-amber-700 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between shadow-xs animate-pulse">
          <span class="flex items-center gap-1.5"><span class="animal-cat">🐱</span> <span>读取左侧新值 (Right):</span></span>
          <span class="font-extrabold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">right = memo[${step.activeSlot}] = ${step.right ?? step.memoj}</span>
        </div>
      `;
    } else if (step.slotMode === 'updated') {
      const sumVal = step.memoj !== undefined ? step.memoj : memoArr[step.activeSlot];
      const isBlocked = step.type === 'obstacle-cell';
      const icon = isBlocked ? '🚧' : '<span class="animal-frog">🐸</span>';
      const label = isBlocked ? '障碍物清零覆盖:' : '滚动覆盖累加:';
      const color = isBlocked ? 'text-amber-800 bg-amber-50/90 border-amber-300' : 'text-emerald-700 bg-emerald-50/90 border-emerald-200';
      const badgeColor = isBlocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200/80 text-emerald-900';
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold ${color} px-3 py-1.5 rounded-lg border flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5">${icon} <span>${label}</span></span>
          <span class="font-extrabold ${badgeColor} px-2 py-0.5 rounded">memo[${step.activeSlot}] = ${sumVal}</span>
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

    // 2. 槽位容器 (单行水平居中排列，flex-nowrap，绝对不折行换行)
    const slotsRow = document.createElement('div');
    slotsRow.className = 'w-full flex items-center justify-center gap-3 sm:gap-4 flex-nowrap py-1 overflow-x-auto';

    for (let j = 0; j < n; j++) {
      const val = memoArr[j] !== undefined ? memoArr[j] : 0;
      const isCur = step.activeSlot === j;
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
      } else if (val > 0) {
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

  /**
   * 渲染 Stage-3 二维 DP 状态表与转移看板 (Lite 模式 卡片 2)
   */
  public static renderStage3DPTable(
    container: HTMLElement,
    step: any,
    options: { m: number; n: number; isReverse?: boolean }
  ): void {
    if (!container || !step) return;
    const { m, n, isReverse = false } = options;
    container.innerHTML = '';
    container.className = 'w-full h-full flex flex-col items-center justify-start gap-1.5 p-1 overflow-auto relative';

    // 1. 顶层状态转移等式 / 解释条 (居中限定最大宽度)
    const equationWrapper = document.createElement('div');
    equationWrapper.className = 'w-full max-w-lg mx-auto px-1 flex-shrink-0';

    const topLabel = isReverse ? '下方' : '上方';
    const leftLabel = isReverse ? '右方' : '左方';
    const topTxt = step.topVal !== undefined ? step.topVal : (step.topI >= 0 && step.topJ >= 0 ? step.grid?.[step.topI]?.[step.topJ] ?? '-' : '-');
    const leftTxt = step.leftVal !== undefined ? step.leftVal : (step.leftI >= 0 && step.leftJ >= 0 ? step.grid?.[step.leftI]?.[step.leftJ] ?? '-' : '-');
    const curVal = step.sumVal !== undefined ? step.sumVal : (step.i >= 0 && step.j >= 0 ? step.grid?.[step.i]?.[step.j] ?? '-' : '-');

    if (step.type === 'obstacle-cell' || step.type === 'obstacle-hit' || (step.obstacleGrid?.[step.i]?.[step.j] === 1 && step.i >= 0 && step.j >= 0)) {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-amber-800 bg-amber-50/90 px-3 py-1 rounded-lg border border-amber-300 flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5"><span>🚧</span> <span>障碍格阻断:</span></span>
          <span class="font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">dp[${step.i}][${step.j}] = 0</span>
        </div>
      `;
    } else if (step.type === 'init-row' || step.type === 'init-col' || step.type === 'init-val' || step.type === 'init-slot') {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50/90 px-3 py-1 rounded-lg border border-emerald-200 flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5"><span class="animal-frog">🐸</span> <span>边界/起点初始化:</span></span>
          <span class="font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">dp[${step.i}][${step.j}] = ${curVal}</span>
        </div>
      `;
    } else if (step.type === 'transfer' || (step.topI >= 0 || step.leftI >= 0)) {
      equationWrapper.innerHTML = `
        <div class="flex items-center justify-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono-code flex-wrap">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${topLabel}:</span> <span class="font-extrabold">${topTxt}</span>
          </div>
          <span class="text-slate-400 font-bold text-xs">+</span>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${leftLabel}:</span> <span class="font-extrabold">${leftTxt}</span>
          </div>
          <span class="text-slate-400 font-bold text-xs">=</span>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-300 shadow-2xs">
            <span class="animal-frog text-sm">🐸</span> <span>dp[${step.i}][${step.j}]:</span> <span>${curVal}</span>
          </div>
        </div>
      `;
    } else {
      equationWrapper.innerHTML = `
        <div class="text-xs text-slate-500 font-mono py-1 px-3 text-center bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-2">
          <span>📊 二维 DP 状态表 <code>dp[0..${m - 1}][0..${n - 1}]</code>，准备逐格填表</span>
        </div>
      `;
    }
    container.appendChild(equationWrapper);

    // 2. 状态表格 (DP Table Matrix)
    const tableCard = document.createElement('div');
    tableCard.className = 'w-full flex-1 flex flex-col items-center justify-center min-h-0 py-0.5';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'inline-block bg-white rounded-xl p-2 border border-slate-200/90 shadow-sm relative';

    let tableHtml = '<table class="border-collapse font-mono-code text-xs">';
    // 表头：列索引
    tableHtml += '<thead><tr><th class="p-0.5 text-[10px] text-slate-400 font-normal">i\\j</th>';
    for (let c = 0; c < n; c++) {
      tableHtml += `<th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-center">j=${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 0; r < m; r++) {
      tableHtml += `<tr><th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-right">i=${r}</th>`;
      for (let c = 0; c < n; c++) {
        const isCur = step.i === r && step.j === c;
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const isObstacle = step.obstacleGrid?.[r]?.[c] === 1;
        const val = step.grid?.[r]?.[c] ?? null;

        let cellClass = 'w-10 h-10 sm:w-11 sm:h-11 border rounded-lg text-center font-bold relative transition-all duration-150 flex flex-col items-center justify-center ';
        let content = '';

        if (isCur) {
          cellClass += 'bg-emerald-100/90 border-emerald-500 text-emerald-900 font-extrabold ring-2 ring-emerald-400 scale-105 shadow-md z-10';
          content = `
            <span class="absolute -top-3 -right-1 text-sm"><span class="animal-frog">🐸</span></span>
            <span class="text-sm font-extrabold">${val !== null ? val : (isObstacle ? 0 : '-')}</span>
            <span class="text-[8px] font-sans text-emerald-700 font-semibold leading-none">当前</span>
          `;
        } else if (isTop) {
          cellClass += 'bg-purple-100/90 border-purple-400 text-purple-900 font-bold ring-1 ring-purple-300 shadow-xs';
          content = `
            <span class="absolute -top-3 -right-1 text-sm"><span class="animal-cat">🐱</span></span>
            <span class="text-sm font-bold">${val !== null ? val : '-'}</span>
            <span class="text-[8px] font-sans text-purple-600 font-semibold leading-none">${topLabel}</span>
          `;
        } else if (isLeft) {
          cellClass += 'bg-amber-100/90 border-amber-400 text-amber-900 font-bold ring-1 ring-amber-300 shadow-xs';
          content = `
            <span class="absolute -top-3 -right-1 text-sm"><span class="animal-cat">🐱</span></span>
            <span class="text-sm font-bold">${val !== null ? val : '-'}</span>
            <span class="text-[8px] font-sans text-amber-600 font-semibold leading-none">${leftLabel}</span>
          `;
        } else if (isObstacle) {
          cellClass += 'bg-slate-100 border-slate-300 text-slate-400';
          content = `
            <span class="text-xs leading-none">🚧</span>
            <span class="text-[10px] font-bold text-slate-500 leading-none">0</span>
          `;
        } else if (val !== null) {
          cellClass += 'bg-slate-50/90 border-slate-200 text-slate-800 font-bold';
          content = `<span class="text-sm font-bold text-slate-800">${val}</span>`;
        } else {
          cellClass += 'bg-white border-slate-200/70 text-slate-300';
          content = '<span class="text-xs text-slate-300">-</span>';
        }

        tableHtml += `<td class="p-0.5"><div class="${cellClass}">${content}</div></td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';

    tableWrapper.innerHTML = tableHtml;
    tableCard.appendChild(tableWrapper);
    container.appendChild(tableCard);
  }

  /**
   * 兼容方法：渲染 Stage-3 状态转移看板
   */
  public static renderTransferEquation(container: HTMLElement, step: any, isReverse = false): void {
    const m = step.grid?.length || 3;
    const n = step.grid?.[0]?.length || 3;
    this.renderStage3DPTable(container, step, { m, n, isReverse });
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
    const topPad = 42;

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
    const totalW = Math.max(340, measured.width + 36);
    const rootPos = assign(measured, 0, (totalW - measured.width) / 2);
    const totalH = Math.max(180, topPad + maxDepth * levelH + nodeH + 36);

    const lines: string[] = [];
    const nodes: string[] = [];
    let activeX: number | null = null;
    let activeY: number | null = null;

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
      if (isCurrent) {
        activeX = n.x;
        activeY = n.y;
      }

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
          <g transform="translate(0, ${-nodeH / 2 - 6})">
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

    const svgContent = `
      <svg id="tree-svg-canvas" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="min-width: ${totalW}px; min-height: ${totalH}px; display: block; margin: 0 auto;">
        ${lines.join('')}
        ${nodes.join('')}
      </svg>
    `;

    let scrollBox = container.querySelector('#tree-scroll-box') as HTMLElement | null;
    const isFirstMount = !scrollBox;

    if (!scrollBox) {
      container.innerHTML = `
        <div id="tree-scroll-box" class="w-full h-full flex items-start justify-start overflow-auto p-2">
          ${svgContent}
        </div>
      `;
      scrollBox = container.querySelector('#tree-scroll-box');
    } else {
      // 保持现有 scrollBox DOM 容器，仅更新内部 SVG 内容，绝对不粗暴重置滚动坐标
      scrollBox.innerHTML = svgContent;
    }

    if (scrollBox && typeof scrollBox.scrollTo === 'function') {
      const clientW = scrollBox.clientWidth || 0;
      const scrollW = scrollBox.scrollWidth || 0;
      const clientH = scrollBox.clientHeight || 0;
      const scrollH = scrollBox.scrollHeight || 0;

      let targetLeft = scrollBox.scrollLeft;
      let targetTop = scrollBox.scrollTop;
      let needScroll = false;

      // 水平方向自适应聚焦
      if (activeX !== null && clientW > 0) {
        const curScrollLeft = scrollBox.scrollLeft;
        const leftMargin = 50;
        const leftBound = curScrollLeft + leftMargin;
        const rightBound = curScrollLeft + clientW - leftMargin;

        if (isFirstMount) {
          targetLeft = Math.max(0, activeX - clientW / 2);
          needScroll = true;
        } else if (activeX < leftBound || activeX > rightBound) {
          targetLeft = Math.max(0, activeX - clientW / 2);
          needScroll = true;
        }
      }

      // 垂直方向自适应聚焦 (防止活跃节点被顶部或底部遮挡)
      if (activeY !== null && clientH > 0) {
        const curScrollTop = scrollBox.scrollTop;
        const topMargin = 45;
        const bottomMargin = 45;
        const topBound = curScrollTop + topMargin;
        const bottomBound = curScrollTop + clientH - bottomMargin;

        if (isFirstMount) {
          targetTop = Math.max(0, activeY - clientH / 2);
          needScroll = true;
        } else if (activeY < topBound || activeY > bottomBound) {
          targetTop = Math.max(0, activeY - clientH / 2);
          needScroll = true;
        }
      }

      if (needScroll) {
        if (isFirstMount) {
          scrollBox.scrollLeft = targetLeft;
          scrollBox.scrollTop = targetTop;
        } else {
          scrollBox.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
        }
      }
    }
  }
}
