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
    options: {
      m: number;
      n: number;
      isReverse?: boolean;
      rowLabels?: string[];
      colLabels?: string[];
      cornerLabel?: string;
      tableName?: string;
      tableAction?: string;
      category?: string;
    }
  ): void {
    if (!container || !step) return;
    const { m, n, isReverse = false, rowLabels, colLabels, cornerLabel } = options;
    const gridRows = (step.grid && step.grid.length > 0) ? step.grid.length : m;
    const gridCols = (step.grid && step.grid[0] && step.grid[0].length > 0) ? step.grid[0].length : n;

    container.innerHTML = '';
    container.className = 'w-full h-full flex flex-col items-center justify-start gap-1.5 p-1 overflow-auto relative';

    // 1. 顶层状态转移等式 / 解释条 (居中限定最大宽度)
    const equationWrapper = document.createElement('div');
    equationWrapper.className = 'w-full max-w-lg mx-auto px-1 flex-shrink-0';

    const topLabel = isReverse ? '下方' : '上方';
    const leftLabel = isReverse ? '右方' : '左方';
    const diagLabel = isReverse ? '右下' : '左上';
    const topTxt = step.topVal !== undefined ? step.topVal : (step.topI >= 0 && step.topJ >= 0 ? step.grid?.[step.topI]?.[step.topJ] ?? '-' : '-');
    const leftTxt = step.leftVal !== undefined ? step.leftVal : (step.leftI >= 0 && step.leftJ >= 0 ? step.grid?.[step.leftI]?.[step.leftJ] ?? '-' : '-');
    const diagTxt = step.diagVal !== undefined ? step.diagVal : (step.diagI >= 0 && step.diagJ >= 0 ? step.grid?.[step.diagI]?.[step.diagJ] ?? '-' : '-');
    const curVal = step.sumVal !== undefined ? step.sumVal : (step.i >= 0 && step.j >= 0 ? step.grid?.[step.i]?.[step.j] ?? '-' : '-');
    const hasDiag = (step.diagI !== undefined && step.diagI >= 0 && step.diagJ !== undefined && step.diagJ >= 0) || step.diagVal !== undefined;
    const hasTop = (step.topI !== undefined && step.topI >= 0 && step.topJ !== undefined && step.topJ >= 0) || step.topVal !== undefined;
    const hasLeft = (step.leftI !== undefined && step.leftI >= 0 && step.leftJ !== undefined && step.leftJ >= 0) || step.leftVal !== undefined;
    const isGreedy = options.category === 'greedy' || step.category === 'greedy' || !!step.matrix;
    const targetVar = isGreedy ? 'matrix' : 'dp';

    if (step.type === 'obstacle-cell' || step.type === 'obstacle-hit' || (step.obstacleGrid?.[step.i]?.[step.j] === 1 && step.i >= 0 && step.j >= 0)) {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-amber-800 bg-amber-50/90 px-3 py-1 rounded-lg border border-amber-300 flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5"><span>🚧</span> <span>障碍格阻断:</span></span>
          <span class="font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">${targetVar}[${step.i}][${step.j}] = 0</span>
        </div>
      `;
    } else if (step.type === 'init-row' || step.type === 'init-col' || step.type === 'init-val' || step.type === 'init-slot') {
      equationWrapper.innerHTML = `
        <div class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50/90 px-3 py-1 rounded-lg border border-emerald-200 flex items-center justify-between shadow-xs">
          <span class="flex items-center gap-1.5"><span class="animal-frog">🐸</span> <span>边界/起点初始化:</span></span>
          <span class="font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">${targetVar}[${step.i}][${step.j}] = ${curVal}</span>
        </div>
      `;
    } else if (hasDiag && hasTop && hasLeft) {
      // 🌟 三向分支决策看板（如编辑距离字符不匹配：min(替换, 删除, 插入) + 1）
      equationWrapper.innerHTML = `
        <div class="flex items-center justify-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono-code flex-wrap">
          <span class="text-slate-500 font-bold text-xs">min(</span>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 font-bold border border-cyan-300 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${diagLabel}(替换):</span> <span class="font-extrabold">${diagTxt}</span>
          </div>
          <span class="text-slate-400 font-bold text-xs">,</span>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${topLabel}(删除):</span> <span class="font-extrabold">${topTxt}</span>
          </div>
          <span class="text-slate-400 font-bold text-xs">,</span>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${leftLabel}(插入):</span> <span class="font-extrabold">${leftTxt}</span>
          </div>
          <span class="text-slate-500 font-bold text-xs">)</span>
          <span class="text-slate-400 font-bold text-xs">+ 1 ➔</span>
          <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-300 shadow-2xs">
            <span class="animal-frog text-sm">🐸</span> <span>${targetVar}[${step.i}][${step.j}]:</span> <span>${curVal}</span>
          </div>
        </div>
      `;
    } else if (hasDiag) {
      // 🌟 对角线单向转移（如字符匹配继承）
      equationWrapper.innerHTML = `
        <div class="flex items-center justify-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono-code flex-wrap">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 font-bold border border-cyan-300 shadow-2xs">
            <span class="animal-cat text-sm">🐱</span> <span>${diagLabel}(对角匹配):</span> <span class="font-extrabold">${diagTxt}</span>
          </div>
          <span class="text-slate-400 font-bold text-xs">➔</span>
          <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-300 shadow-2xs">
            <span class="animal-frog text-sm">🐸</span> <span>${targetVar}[${step.i}][${step.j}]:</span> <span>${curVal}</span>
          </div>
        </div>
      `;
    } else if (step.type === 'transfer' || (hasTop || hasLeft)) {
      const isMax = step.msg?.includes('max(') || step.tag?.includes('max') || step.log?.includes('max');
      const isMin = step.msg?.includes('min(') || step.tag?.includes('min') || step.log?.includes('min');

      if (isMax || isMin) {
        const opName = isMax ? 'max' : 'min';
        equationWrapper.innerHTML = `
          <div class="flex items-center justify-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono-code flex-wrap">
            <span class="text-slate-500 font-bold text-xs">${opName}(</span>
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-2xs">
              <span class="animal-cat text-sm">🐱</span> <span>${topLabel}:</span> <span class="font-extrabold">${topTxt}</span>
            </div>
            <span class="text-slate-400 font-bold text-xs">,</span>
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-2xs">
              <span class="animal-cat text-sm">🐱</span> <span>${leftLabel}:</span> <span class="font-extrabold">${leftTxt}</span>
            </div>
            <span class="text-slate-500 font-bold text-xs">)</span>
            <span class="text-slate-400 font-bold text-xs">➔</span>
            <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-300 shadow-2xs">
              <span class="animal-frog text-sm">🐸</span> <span>${targetVar}[${step.i}][${step.j}]:</span> <span>${curVal}</span>
            </div>
          </div>
        `;
      } else {
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
            <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-300 shadow-2xs">
              <span class="animal-frog text-sm">🐸</span> <span>${targetVar}[${step.i}][${step.j}]:</span> <span>${curVal}</span>
            </div>
          </div>
        `;
      }
    } else {
      const tableName = options.tableName || (isGreedy ? '二维决策演进表 matrix' : '二维 DP 状态表 dp');
      const tableAction = options.tableAction || (isGreedy ? '准备动态追踪决策演进' : '准备逐格填表');
      equationWrapper.innerHTML = `
        <div class="text-xs text-slate-500 font-mono py-1 px-3 text-center bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-2">
          <span>📊 ${tableName} <code>[0..${gridRows - 1}][0..${gridCols - 1}]</code>，${tableAction}</span>
        </div>
      `;
    }
    container.appendChild(equationWrapper);

    // 2. 状态表格 (DP Table Matrix)
    const tableCard = document.createElement('div');
    tableCard.className = 'w-full flex-1 flex flex-col items-center justify-center min-h-0 py-0.5';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'inline-block bg-white rounded-xl p-2 border border-slate-200/90 shadow-sm relative';

    const corner = cornerLabel || 'i\\j';
    let tableHtml = '<table class="border-collapse font-mono-code text-xs">';
    // 表头：列索引
    tableHtml += `<thead><tr><th class="p-0.5 text-[10px] text-slate-400 font-normal">${corner}</th>`;
    for (let c = 0; c < gridCols; c++) {
      const colTxt = colLabels?.[c] ?? `j=${c}`;
      tableHtml += `<th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-center">${colTxt}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 0; r < gridRows; r++) {
      const rowTxt = rowLabels?.[r] ?? `i=${r}`;
      tableHtml += `<tr><th class="px-1.5 py-0.5 text-[11px] font-bold text-slate-500 text-right">${rowTxt}</th>`;
      for (let c = 0; c < gridCols; c++) {
        const isCur = step.i === r && step.j === c;
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const isDiag = step.diagI === r && step.diagJ === c;
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
        } else if (isDiag) {
          cellClass += 'bg-cyan-100/90 border-cyan-400 text-cyan-900 font-bold ring-1 ring-cyan-300 shadow-xs';
          content = `
            <span class="absolute -top-3 -right-1 text-sm"><span class="animal-cat">🐱</span></span>
            <span class="text-sm font-bold">${val !== null ? val : '-'}</span>
            <span class="text-[8px] font-sans text-cyan-600 font-semibold leading-none">${diagLabel}</span>
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
