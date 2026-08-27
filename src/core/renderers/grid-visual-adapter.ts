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

import { MemoSlotVisualAdapter } from './memo-slot-visual-adapter';
import { DpTableVisualAdapter } from './dp-table-visual-adapter';
import { SpatialFlowVisualAdapter } from './spatial-flow-visual-adapter';

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
   * 绘制网格探索箭头与状态转移连线 - 委托 SpatialFlowVisualAdapter 深模块
   */
  public static drawGridArrows(container: HTMLElement, step: any, options: GridRenderOptions): void {
    if (!container || typeof document === 'undefined') return;
    const gridWrapper = container.parentElement;
    const svg = (gridWrapper && typeof gridWrapper.querySelector === 'function')
      ? (gridWrapper.querySelector('#grid-arrows-svg') as SVGElement | null)
      : (typeof document.getElementById === 'function' ? (document.getElementById('grid-arrows-svg') as SVGElement | null) : null);
    if (!svg) return;

    SpatialFlowVisualAdapter.renderGridArrows(svg, container, step, options);
  }

  /**
   * 构建一维空间压缩槽位骨架 (Full 模式) - 委托 MemoSlotVisualAdapter
   */
  public static build1DSlots(container: HTMLElement, n: number, labelPrefix = 'dp'): void {
    MemoSlotVisualAdapter.build1DSlots(container, n, labelPrefix);
  }

  /**
   * 渲染 Lite 模式下的一维 memo 槽位 (卡片 2) - 委托 MemoSlotVisualAdapter
   */
  public static renderLiteMemoSlots(container: HTMLElement, step: any, n: number): void {
    MemoSlotVisualAdapter.renderLiteMemoSlots(container, step, n);
  }

  /**
   * 更新 Full 模式下一维滚动数组槽位状态 - 委托 MemoSlotVisualAdapter
   */
  public static updateFullMemoSlots(slotsContainer: HTMLElement | null, step: any, n: number): void {
    MemoSlotVisualAdapter.updateFullMemoSlots(slotsContainer, step, n);
  }

  /**
   * 渲染 Stage-3 二维 DP 状态表与转移看板 - 委托 DpTableVisualAdapter
   */
  public static renderStage3DPTable(
    container: HTMLElement,
    step: any,
    options: { m: number; n: number; isReverse?: boolean }
  ): void {
    DpTableVisualAdapter.renderStage3DPTable(container, step, options);
  }

  /**
   * 兼容方法：渲染 Stage-3 状态转移看板 - 委托 DpTableVisualAdapter
   */
  public static renderTransferEquation(container: HTMLElement, step: any, isReverse = false): void {
    DpTableVisualAdapter.renderTransferEquation(container, step, isReverse);
  }
}

export { RecursionTreeAdapter } from './recursion-tree-adapter';
export { MemoSlotVisualAdapter } from './memo-slot-visual-adapter';
export { DpTableVisualAdapter } from './dp-table-visual-adapter';
export { SpatialFlowVisualAdapter } from './spatial-flow-visual-adapter';

