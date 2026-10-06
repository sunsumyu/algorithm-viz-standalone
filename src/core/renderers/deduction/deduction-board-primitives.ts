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
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 shadow-2xs">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
            <i class="fa-solid fa-tree text-blue-600"></i>
            ${opts.title}
          </span>
          <span class="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
            ${opts.badge}
          </span>
        </div>
        <p class="text-[11px] text-slate-600 mb-2 leading-relaxed">
          ${opts.descriptionHtml}
        </p>
        <div class="font-mono text-[10px] bg-slate-900 text-slate-200 rounded-lg p-2 leading-relaxed">
          <span class="text-emerald-400">初始状态</span>：${opts.initialStateText}
        </div>
      </div>
    `;
  }

  public static renderBaseCases(rows: BaseCaseRow[]): string {
    const rowsHtml = rows
      .map(
        (r, idx) => `
          <div>
            <div class="text-slate-600 font-bold flex items-center gap-1">
              <span class="text-emerald-600">${r.prefix || (idx === rows.length - 1 ? '└───' : '├───')}</span> ${r.label}
            </div>
            <div class="pl-5 text-emerald-700 font-extrabold text-[10.5px]">
              └── ${r.valuesStr} ✅
            </div>
          </div>
        `
      )
      .join('');

    return `
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          第一阶段：填 Base Case（边界条件）
        </div>
        <div class="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  public static renderInnerStep(opts: InnerStepOptions): string {
    const details = opts.detailLines.map(line => `<div>${line}</div>`).join('');
    return `
      <div class="border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0">
        <div class="font-bold text-slate-700 flex items-center gap-1.5">
          <span class="text-slate-400">${opts.connector}</span>
          <span>${opts.label}</span>
          ${opts.badgeHtml}
        </div>
        <div class="pl-6 space-y-0.5 text-[10.5px] mt-1 text-slate-600">
          ${details}
          <div class="text-emerald-700 font-bold">${opts.fillLine}</div>
        </div>
      </div>
    `;
  }

  public static renderOuterRound(opts: OuterRoundOptions): string {
    return `
      <div class="border border-slate-200/90 rounded-lg overflow-hidden bg-slate-50/50">
        <div class="bg-slate-100/90 px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
          <span class="font-bold text-slate-800 text-[11px] font-mono">
            ${opts.title}
          </span>
          <span class="text-[10px] text-slate-500 font-mono">${opts.subtitle}</span>
        </div>
        <div class="p-2 space-y-2 font-mono text-[11px]">
          ${opts.stepLinesHtml}
        </div>
      </div>
    `;
  }

  public static renderLoopSection(roundsHtml: string, subtitle?: string): string {
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="font-extrabold text-slate-800 flex items-center justify-between text-xs mb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            第二阶段：核心双重循环推演
          </div>
          <span class="text-[10px] font-mono text-slate-500">
            ${subtitle || '自底向上 逐格推导'}
          </span>
        </div>
        <div class="space-y-3">
          ${roundsHtml}
        </div>
      </div>
    `;
  }

  public static renderFinalReturn(opts: FinalReturnOptions): string {
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div class="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          第三阶段：返回最终结果
        </div>
        <div class="font-mono text-[11px] bg-slate-900 text-slate-200 rounded-lg p-3 space-y-1">
          <div class="text-slate-400">回到代码最后一行：<span class="text-amber-300">${opts.returnCode}</span></div>
          <div class="text-emerald-400 font-bold text-xs pt-1">
            🏆 最终返回：${opts.answerDescription}
          </div>
        </div>
      </div>
    `;
  }

  public static wrapBoard(contentHtml: string): string {
    return `
      <div class="deduction-board flex flex-col gap-3 font-sans text-xs text-slate-700 select-text pb-6">
        ${contentHtml}
      </div>
    `;
  }
}
