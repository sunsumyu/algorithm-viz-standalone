/**
 * 声明式 4-Card 舞台模板片段构建器 (DeclarativeStageFragments)
 *
 * 从 declarative-stage-presenter 拆出的纯 HTML 片段层：
 * 顶栏输入控件 / 模式切换器 / 阶段演化 Tabs / 图例 / 指标网格 / 头部上下文解析。
 * 全部为纯字符串函数 —— 组装见 declarative-stage-presenter。
 */

import { PresetCasePresenter } from './preset-case-presenter';
import {
  DeclarativeAlgorithmSpec,
  DeclarativeStageSpec,
  InputControlDef,
  LegendItemDef,
  MetricCardDef,
  ModeOptionDef,
  resolveLegendDotColor,
} from './declarative-stage-spec';

/** 头部上下文：徽章文案、卡片标题与当前阶段解析结果（localStorage 记忆在此生效） */
export interface StageHeaderContext {
  viewId: string;
  icon: string;
  curStageId: string | undefined;
  curStage: DeclarativeStageSpec | undefined;
  modeBadge: string;
  complexityBadge: string;
  card1Title: string;
  card2Title: string;
  card2Desc: string;
}

/** 解析当前阶段（含 localStorage 记忆回放）与头部徽章/标题链 */
export function resolveHeaderContext(spec: DeclarativeAlgorithmSpec): StageHeaderContext {
  const viewId = spec.viewId || `algo-${spec.id}-view`;
  const icon = spec.icon || '📊';
  let initialStageId = spec.defaultStage || (spec.stages && spec.stages.length > 0 ? spec.stages[0].id : undefined);
  if (typeof localStorage !== 'undefined' && spec.stages && spec.stages.length > 0) {
    try {
      const saved = localStorage.getItem(`algo-stage-${spec.id}`);
      if (saved && spec.stages.some((s) => s.id === saved)) {
        initialStageId = saved;
      }
    } catch {}
  }
  const curStageId = initialStageId;
  const curStage = curStageId && spec.stages ? spec.stages.find((s) => s.id === curStageId) : undefined;
  const modeBadge = curStage?.badge?.mode || spec.badge?.mode || '标准模式';
  const complexityBadge = curStage?.badge?.complexity || curStage?.timeBadge || spec.badge?.complexity || 'O(n) · O(1)';
  const card1Title =
    curStage?.primaryVisual?.title || curStage?.card1Title || spec.primaryVisual?.title || spec.card1Title || '📊 算法执行沙盘';
  const card2Title =
    curStage?.auxiliaryVisual?.title || curStage?.card2Title || spec.auxiliaryVisual?.title || spec.card2Title || '🧭 状态空间与指标监视器';
  const card2Desc =
    curStage?.auxiliaryVisual?.desc || curStage?.card2Desc || spec.auxiliaryVisual?.desc || spec.card2Desc || '当前操作指令、关键指标与状态记录';
  return { viewId, icon, curStageId, curStage, modeBadge, complexityBadge, card1Title, card2Title, card2Desc };
}

/** 1. 顶栏参数输入控件 */
export function renderInputsHtml(inputs: InputControlDef[] | undefined): string {
  return (inputs || [])
    .map((input) => {
      const widthStyle = input.width ? `style="width: ${input.width};"` : 'style="width: 110px;"';
      const cleanLabel = input.label.replace(/[:：]\s*$/, '');
      if (input.type === 'select') {
        const opts = (input.options || [])
          .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
          .join('');
        return `
            <div class="dsp-input-group">
              <label for="${input.id}">${cleanLabel}:</label>
              <select id="${input.id}" class="dsp-select" ${widthStyle}>${opts}</select>
            </div>
          `;
      }
      const minAttr = input.min !== undefined ? `min="${input.min}"` : '';
      const maxAttr = input.max !== undefined ? `max="${input.max}"` : '';
      const stepAttr = input.step !== undefined ? `step="${input.step}"` : '';
      return `
          <div class="dsp-input-group">
            <label for="${input.id}">${cleanLabel}:</label>
            <input type="${input.type}" id="${input.id}" value="${input.defaultValue}" class="dsp-input" placeholder="${input.placeholder || ''}" ${minAttr} ${maxAttr} ${stepAttr} ${widthStyle} />
          </div>
        `;
    })
    .join('');
}

/** 2. 预设案例下拉选框（统一走 Shared PresetCasePresenter） */
export function renderPresetSelectHtml(spec: DeclarativeAlgorithmSpec): string {
  return PresetCasePresenter.renderSelectHtml(spec.presets);
}

/** 3. 顺推 / 逆推 方向切换器（像素级复用《不同路径》dir-tabs-container 模板） */
export function renderModeBarHtml(modes: ModeOptionDef[] | undefined): string {
  if (!modes || modes.length === 0) return '';
  const modeChipsHtml = modes
    .map((m, i) => {
      const isForward = m.id === 'forward' || m.id.includes('forward');
      const isReverse = m.id === 'reverse' || m.id.includes('reverse');
      const cleanLabel = isForward ? '顺推' : isReverse ? '逆推' : m.label.replace(/\(.*\)/, '').replace(/（.*）/, '').trim() || m.label;
      const arrowSymbol = isForward ? '→' : isReverse ? '←' : '';
      const iconClass = isForward ? 'fa-arrow-right' : isReverse ? 'fa-arrow-left' : '';
      const isActive = i === 0;
      return `
            <button class="dir-tab-btn dsp-mode-chip px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs transition-all flex items-center gap-1 border ${
              isActive ? 'active bg-blue-600 text-white shadow-sm font-bold border-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold'
            }" data-mode="${m.id}" data-dir="${m.id}" title="${m.label || cleanLabel}">
              <span style="font-size: 11px; font-weight: 700; line-height: 1; display: inline-block;">${arrowSymbol}</span>
              <span class="truncate">${cleanLabel}</span>
            </button>
          `;
    })
    .join('');
  return `
        <div class="flex items-center gap-0.5 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200 flex-shrink-0 dir-tabs-container" id="dir-tabs-container">
          ${modeChipsHtml}
        </div>
      `;
}

/** 4. 图例 Bar */
export function renderLegendHtml(legend: LegendItemDef[] | undefined): string {
  return (legend || [])
    .map(
      (lg) =>
        `<div><span class="dsp-legend-dot" style="background: ${resolveLegendDotColor(lg)};"></span> ${lg.label}</div>`
    )
    .join('');
}

/** 5. Card 2 指标网格 */
export function renderMetricsHtml(metrics: MetricCardDef[] | undefined): string {
  return (metrics || [])
    .map((m) => {
      const colorStyle = m.color ? `style="color: ${m.color};"` : '';
      const metricId = m.id.startsWith('metric-') ? m.id : `metric-${m.id}`;
      return `
          <div class="dsp-metric-card">
            <span class="dsp-metric-label">${m.label}</span>
            <span class="dsp-metric-val" id="${metricId}" ${colorStyle}>—</span>
          </div>
        `;
    })
    .join('');
}

/** 0. 阶段演化胶囊导航栏（基准极简规范：不塞时空复杂度挤爆顶栏） */
export function renderStageTabsHtml(stages: DeclarativeStageSpec[] | undefined, activeStageId: string | undefined): string {
  if (!stages || stages.length === 0) return '';
  const defaultShortNames: Record<string, string> = {
    'stage-1': '递归',
    'stage1': '递归',
    'stage-2': '记忆化',
    'stage2': '记忆化',
    'stage-3': '二维DP',
    'stage3': '二维DP',
    'stage-4': '一维优化',
    'stage4': '一维优化',
  };
  const stageButtonsHtml = stages
    .map((stg, idx) => {
      const stageNum = stg.num || idx + 1;
      const isActive = stg.id === activeStageId;
      const shortName = stg.shortName || defaultShortNames[stg.id] || stg.name || `阶段 ${stageNum}`;
      const isStage4 = stg.id === 'stage-4' || stg.id === 'stage4' || stageNum === 4;
      const isStage3 = stg.id === 'stage-3' || stg.id === 'stage3' || stageNum === 3;
      const theme = isStage4
        ? isActive
          ? 'active bg-amber'
          : ''
        : isStage3
        ? isActive
          ? 'active bg-emerald'
          : ''
        : isActive
        ? 'active bg-blue'
        : '';
      return `
          <button class="dsp-stage-tab-btn ${theme}" data-stage="${stg.id}" title="${stg.name || shortName}${stg.timeBadge ? ` (${stg.timeBadge})` : ''}">
            <span class="dsp-stage-num">${stageNum}</span>
            <span class="dsp-stage-label">${shortName}</span>
          </button>
        `;
    })
    .join('');
  return `
        <div class="dsp-stage-tabs-wrap" id="stage-tabs-container">
          ${stageButtonsHtml}
        </div>
      `;
}
