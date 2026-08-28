/**
 * 二维 DP 状态表与转移看板表现适配器 (DpTableVisualAdapter Deep Module)
 * 遵循单一职责与深模块原则：
 * 封装 Lite 模式下 Stage 3 二维 DP 状态转移看板与动态网格表格高亮渲染。
 */

export class DpTableVisualAdapter {
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
    const gridRows = (step.grid && step.grid.length > 0) ? step.grid.length : m;
    const gridCols = (step.grid && step.grid[0] && step.grid[0].length > 0) ? step.grid[0].length : n;

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
          <span>📊 二维 DP 状态表 <code>dp[0..${gridRows - 1}][0..${gridCols - 1}]</code>，准备逐格填表</span>
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
    for (let c = 0; c < gridCols; c++) {
      tableHtml += `<th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-center">j=${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 0; r < gridRows; r++) {
      tableHtml += `<tr><th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-right">i=${r}</th>`;
      for (let c = 0; c < gridCols; c++) {
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
