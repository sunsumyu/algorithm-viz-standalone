/**
 * 全景推演展板核心呈现积木 (Deduction Board Visual Primitives)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

export interface BoardHeaderOptions {
  title: string;
  badge: string;
  descriptionHtml: string;
  initialStateText: string;
}

export interface BaseCaseRow {
  prefix: string;
  label: string;
  valuesStr: string;
}

export interface InnerStepOptions {
  connector: string;
  label: string;
  badgeHtml: string;
  detailLines: string[];
  fillLine: string;
}

export interface OuterRoundOptions {
  title: string;
  subtitle: string;
  stepLinesHtml: string;
}

export interface FinalReturnOptions {
  returnCode: string;
  answerDescription: string;
}

export class DeductionBoardPrimitives {
  public static renderHeader(opts: BoardHeaderOptions): string {
    return `
      <div class="deduction-header-card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 shadow-2xs">
        <div class="deduction-header-top flex items-center justify-between mb-1.5">
          <span class="deduction-header-title font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
            <i class="fa-solid fa-tree text-blue-600"></i>
            ${opts.title}
          </span>
          <span class="deduction-header-badge font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
            ${opts.badge}
          </span>
        </div>
        <p class="deduction-header-desc text-[11px] text-slate-600 mb-2 leading-relaxed">
          ${opts.descriptionHtml}
        </p>
        <div class="deduction-header-state font-mono text-[10px] bg-slate-900 text-slate-200 rounded-lg p-2 leading-relaxed">
          <span class="state-label text-emerald-400">初始状态</span>：${opts.initialStateText}
        </div>
      </div>
    `;
  }

  public static renderBaseCases(rows: BaseCaseRow[]): string {
    const rowsHtml = rows
      .map(
        (r, idx) => `
          <div class="deduction-basecase-row">
            <div class="deduction-basecase-label text-slate-600 font-bold flex items-center gap-1">
              <span class="guide-stem text-emerald-600">${r.prefix || (idx === rows.length - 1 ? '└───' : '├───')}</span> ${r.label}
            </div>
            <div class="deduction-basecase-val pl-5 text-emerald-700 font-extrabold text-[10.5px]">
              └── ${r.valuesStr} ✅
            </div>
          </div>
        `
      )
      .join('');

    return `
      <div class="deduction-section-card bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="deduction-section-top font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
          <span class="deduction-indicator-dot base w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="deduction-section-title">第一阶段：填 Base Case（边界条件）</span>
        </div>
        <div class="deduction-basecase-box font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  public static renderInnerStep(opts: InnerStepOptions): string {
    const details = opts.detailLines.map(line => `<div>${line}</div>`).join('');
    return `
      <div class="deduction-step-item border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0">
        <div class="deduction-step-head font-bold text-slate-700 flex items-center gap-1.5">
          <span class="guide-stem text-slate-400">${opts.connector}</span>
          <span>${opts.label}</span>
          <span class="deduction-step-badge">${opts.badgeHtml}</span>
        </div>
        <div class="deduction-step-details pl-6 space-y-0.5 text-[10.5px] mt-1 text-slate-600">
          ${details}
          <div class="deduction-step-fill text-emerald-700 font-bold">${opts.fillLine}</div>
        </div>
      </div>
    `;
  }

  public static renderOuterRound(opts: OuterRoundOptions): string {
    return `
      <div class="deduction-round-card border border-slate-200/90 rounded-lg overflow-hidden bg-slate-50/50">
        <div class="deduction-round-header bg-slate-100/90 px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
          <span class="deduction-round-title font-bold text-slate-800 text-[11px] font-mono">
            ${opts.title}
          </span>
          <span class="deduction-round-badge text-[10px] text-slate-500 font-mono">${opts.subtitle}</span>
        </div>
        <div class="deduction-round-body p-2 space-y-2 font-mono text-[11px]">
          ${opts.stepLinesHtml}
        </div>
      </div>
    `;
  }

  public static renderLoopSection(roundsHtml: string, subtitle?: string): string {
    return `
      <div class="deduction-section-card bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="deduction-section-top font-extrabold text-slate-800 flex items-center justify-between text-xs mb-2.5">
          <div class="deduction-section-title flex items-center gap-1.5">
            <span class="deduction-indicator-dot loop w-2 h-2 rounded-full bg-blue-500"></span>
            第二阶段：核心双重循环推演
          </div>
          <span class="deduction-section-subtitle text-[10px] font-mono text-slate-500">
            ${subtitle || '自底向上 逐格推导'}
          </span>
        </div>
        <div class="deduction-rounds-wrap space-y-3">
          ${roundsHtml}
        </div>
      </div>
    `;
  }

  public static renderFinalReturn(opts: FinalReturnOptions): string {
    return `
      <div class="deduction-section-card bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="deduction-section-top font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
          <span class="deduction-indicator-dot ret w-2 h-2 rounded-full bg-purple-500"></span>
          <span class="deduction-section-title">第三阶段：返回最终结果</span>
        </div>
        <div class="deduction-return-box font-mono text-[11px] bg-slate-900 text-slate-200 rounded-lg p-3 space-y-1">
          <div class="deduction-return-line text-slate-400">回到代码最后一行：<span class="deduction-return-code text-amber-300">${opts.returnCode}</span></div>
          <div class="deduction-return-desc text-emerald-400 font-bold text-xs pt-1">
            🏆 最终返回：${opts.answerDescription}
          </div>
        </div>
      </div>
    `;
  }

  public static wrapBoard(contentHtml: string): string {
    return `
      <div class="deduction-board deduction-board-root flex flex-col gap-3 font-sans text-xs text-slate-700 select-text pb-6">
        ${contentHtml}
      </div>
    `;
  }
}
