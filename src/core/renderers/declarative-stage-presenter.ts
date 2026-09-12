/**
 * 声明式 4-Card 舞台呈现引擎 (DeclarativeStagePresenter)
 * 遵循 LSP、OCP 与六边形架构：
 * 统一作为对外呈现接缝，根据算法声明式 Spec 自动生成无冗余子框、标准对齐、紧凑输入的 4-Card 顶层布局
 */

import { ThreeViewControlsAdapter } from './three-view-controls-adapter';
import { PresetCasePresenter, PresetCaseDef } from './preset-case-presenter';

export type { PresetCaseDef };

export interface InputControlDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  defaultValue: any;
  width?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ModeOptionDef {
  id: string;
  label: string;
}

export interface MetricCardDef {
  id: string;
  label: string;
  color?: string;
  badge?: boolean;
}

export interface LegendItemDef {
  label: string;
  color: string;
}

/**
 * 视觉槽位定义规范 (VisualSlot)
 * 强制约束 Card 1 (主视觉/顶部沙盘) 与 Card 2 (辅助视觉/底部栈与状态) 的语义角色
 */
export interface VisualSlot<TStep = any> {
  title: string;
  desc?: string;
  render: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export interface DeclarativeStageSpec<TStep = any> {
  id: string; // 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4'
  name: string; // '阶段 1: 暴力递归'
  shortName: string; // '递归'
  num?: number;
  theme?: string;
  timeBadge?: string; // 'O(2ⁿ)'
  badge?: {
    mode: string;
    complexity: string;
  };
  /**
   * 顶部主视觉槽位 (Card 1): 恒定映射到顶部沙盘/画布/雷达/矩阵
   */
  primaryVisual?: VisualSlot<TStep>;
  /**
   * 底部辅助视觉槽位 (Card 2): 恒定映射到底部调用栈/决策树/指标诊断
   */
  auxiliaryVisual?: VisualSlot<TStep>;

  // 兼容遗留字段
  card1Title?: string;
  card2Title?: string;
  card2Desc?: string;
  legend?: LegendItemDef[];
  metrics?: MetricCardDef[];
  has3D?: boolean;
  codeLanguages?: Record<string, string[] | string>;
  modeCodeLanguages?: Record<string, Record<string, string[]>>;
  buildSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  generateSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas?: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics?: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export interface DeclarativeAlgorithmSpec<TStep = any> {
  id: string;
  name?: string;
  title?: string;
  viewId?: string;
  category: string;
  categoryName?: string;
  icon?: string;
  description?: string;
  difficulty?: 1 | 2 | 3 | 'easy' | 'medium' | 'hard' | string;
  levelOrder?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  learningGoal?: string;
  /** 名称别名（中英文变体、旧称）：参与搜索命中，不参与目录展示 */
  aliases?: string[];
  badge?: {
    mode: string;
    complexity: string;
  };
  /**
   * 顶部主视觉槽位 (Card 1): 恒定映射到顶部沙盘/画布/雷达/矩阵
   */
  primaryVisual?: VisualSlot<TStep>;
  /**
   * 底部辅助视觉槽位 (Card 2): 恒定映射到底部调用栈/决策树/指标诊断
   */
  auxiliaryVisual?: VisualSlot<TStep>;

  // 兼容遗留字段
  card1Title?: string;
  card2Title?: string;
  card2Desc?: string;
  legend?: LegendItemDef[];
  inputs?: InputControlDef[];
  presets?: PresetCaseDef[];
  modes?: ModeOptionDef[];
  metrics?: MetricCardDef[];
  codeLanguages?: Record<string, string[] | string>;
  sourceCodes?: any;
  problemHtml?: string;
  analysisHtml?: string;
  problemContent?: any;
  stages?: DeclarativeStageSpec<TStep>[];
  defaultStage?: string;
  buildSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  generateSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas?: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics?: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export class DeclarativeStagePresenter {
  /**
   * 根据声明式 Spec 编译生成纯粹、无多余嵌套框的标准 4-Card HTML 骨架
   */
  public static generateTemplate(spec: DeclarativeAlgorithmSpec): string {
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

    // 1. 顶栏输入控件
    const inputsHtml = (spec.inputs || [])
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

    // 2. 预设案例下拉选框 (采用全局统一 Shared PresetCasePresenter 渲染)
    const presetSelectHtml = PresetCasePresenter.renderSelectHtml(spec.presets);

    // 3. 顺推 / 逆推 方向切换器 (100% 像素级复用《不同路径》标准 dir-tabs-container 模板)
    let modeBarHtml = '';
    if (spec.modes && spec.modes.length > 0) {
      const modeChipsHtml = spec.modes
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
      modeBarHtml = `
        <div class="flex items-center gap-0.5 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200 flex-shrink-0 dir-tabs-container" id="dir-tabs-container">
          ${modeChipsHtml}
        </div>
      `;
    }

    // 4. 图例 Bar
    const activeLegend = curStage?.legend || spec.legend || [];
    const legendHtml = activeLegend
      .map(
        (lg) =>
          `<div><span class="dsp-legend-dot" style="background: ${lg.color};"></span> ${lg.label}</div>`
      )
      .join('');

    // 5. Card 2 指标网格
    const metricsHtml = (spec.metrics || [])
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

    // 0. 阶段演化胶囊导航栏 (Stage Tabs Bar - 基准极简规范：绝不塞一大串时空复杂度把顶栏挤爆出窗口)
    let stageTabsHtml = '';
    if (spec.stages && spec.stages.length > 0) {
      const activeStageId = curStageId || spec.defaultStage || spec.stages[0].id;
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
      const stageButtonsHtml = spec.stages
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
      stageTabsHtml = `
        <div class="dsp-stage-tabs-wrap" id="stage-tabs-container">
          ${stageButtonsHtml}
        </div>
      `;
    }

    return `
<style>
  #${viewId} {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f1f5f9;
    padding: 8px 10px;
    gap: 8px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #0f172a;
    overflow: hidden;
  }
  #${viewId} .dsp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    flex-shrink: 0;
    gap: 16px;
    height: 46px;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
  }
  #${viewId} .dsp-header::-webkit-scrollbar {
    height: 0px;
  }
  #${viewId} .dsp-header-left-zone {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 12px;
  }
  #${viewId} .dsp-stage-nav-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-header-right-zone {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-dir-nav-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-stage-tabs-wrap {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 2.5px 4px;
    background: #f1f5f9;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  #${viewId} .dsp-stage-tab-btn {
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 11.5px;
    font-weight: 600;
    color: #475569;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    line-height: 1;
  }
  #${viewId} .dsp-stage-tab-btn:hover {
    color: #0f172a;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  #${viewId} .dsp-stage-tab-btn .dsp-stage-num {
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    background: #e2e8f0;
    color: #475569;
    font-size: 9.5px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  #${viewId} .dsp-stage-tab-btn.active {
    background: #2563eb !important;
    color: #ffffff !important;
    border-color: #2563eb !important;
    font-weight: 700 !important;
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25) !important;
  }
  #${viewId} .dsp-stage-tab-btn.active .dsp-stage-num {
    background: rgba(255, 255, 255, 0.25) !important;
    color: #ffffff !important;
  }
  #${viewId} .dir-tabs-container {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    background: rgba(241, 245, 249, 0.9);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  #${viewId} .dir-tab-btn {
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    line-height: 1;
  }
  #${viewId} .dir-tab-btn:hover {
    color: #0f172a;
    background: #ffffff;
  }
  #${viewId} .dir-tab-btn.active {
    background: #2563eb !important;
    color: #ffffff !important;
    border-color: #2563eb !important;
    font-weight: 700 !important;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25) !important;
  }
  #${viewId} .dsp-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    min-width: 0;
  }
  #${viewId} .dsp-icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-main-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }
  #${viewId} .dsp-btn-problem {
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    cursor: pointer;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
  }
  #${viewId} .dsp-btn-problem:hover {
    background: #f1f5f9;
  }
  #${viewId} .dsp-badge-mode {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 4px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #dbeafe;
    white-space: nowrap;
    flex-shrink: 0;
  }
  #${viewId} .dsp-badge-complexity {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 4px;
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
    flex-shrink: 0;
  }
  #${viewId} .dsp-header-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    flex-shrink: 0 !important;
    justify-content: flex-end;
  }
  #${viewId} .dsp-input-group {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: #475569;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  #${viewId} .dsp-input, #${viewId} .dsp-select {
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: #0f172a;
    outline: none;
    box-sizing: border-box;
    height: 24px;
    background: #ffffff;
  }
  #${viewId} .dsp-input:focus, #${viewId} .dsp-select:focus {
    border-color: #2563eb;
  }
  #${viewId} .dsp-btn-generate {
    padding: 2px 10px;
    border-radius: 5px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    min-width: 28px;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
    transition: background 0.15s ease;
  }
  #${viewId} .dsp-btn-generate:hover {
    background: #1d4ed8;
  }
  #${viewId} .dsp-btn-reset {
    padding: 2px 8px;
    border-radius: 5px;
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    height: 24px;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
    transition: all 0.15s ease;
  }
  #${viewId} .dsp-btn-reset:hover {
    background: #f1f5f9;
  }
  #${viewId} .dsp-output-capsule {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 8px;
    height: 24px;
    border-radius: 6px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    font-size: 11px;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
    transition: all 0.2s ease;
  }
  #${viewId} .dsp-output-capsule.is-accepted {
    background: #f0fdf4 !important;
    border-color: #22c55e !important;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15) !important;
  }
  #${viewId} .dsp-output-label {
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
  }
  #${viewId} .dsp-output-capsule.is-accepted .dsp-output-label {
    color: #166534;
  }
  #${viewId} .dsp-output-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
  }
  #${viewId} .dsp-output-capsule.is-accepted .dsp-output-val {
    color: #15803d;
  }
  #${viewId} .dsp-output-badge-status {
    padding: 1px 5px;
    border-radius: 4px;
    background: #22c55e;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 800;
    line-height: 1.2;
    display: inline-block;
  }
  #${viewId} .dsp-playback-ans-capsule {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 8px;
    border-radius: 4px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    font-size: 11px;
    font-weight: 700;
    color: #166534;
    margin-left: auto;
    white-space: nowrap;
  }

  @media (max-width: 1380px) {
    #${viewId} .dsp-badge-mode {
      display: none !important;
    }
  }
  @media (max-width: 1200px) {
    #${viewId} .dsp-badge-complexity {
      display: none !important;
    }
    #${viewId} .dsp-main-title {
      max-width: 150px;
    }
  }

  /* 4-Card 布局 (彻底杜绝溢出，支持侧边抽屉展开时自适应弹性压缩) */
  #${viewId} .dsp-main-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    padding: 0;
    flex: 1;
    min-height: 0;
    min-width: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  #${viewId} .dsp-left-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: hidden;
  }
  #${viewId} .dsp-right-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* 通用卡片容器 (标准单层边框，内部绝不搞白底嵌套框) */
  #${viewId} .dsp-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    padding: 10px 12px;
    box-sizing: border-box;
  }
  #${viewId} .dsp-left-section .dsp-card:first-child {
    flex: 1 1 0;
  }
  #${viewId} .dsp-left-section .dsp-card:last-child {
    flex: 0 0 240px;
  }
  #${viewId} .dsp-left-section .dsp-card:last-child.algo-panel-collapsed,
  #${viewId} .dsp-right-section .dsp-log-card.algo-panel-collapsed {
    margin-top: auto !important;
  }
  #${viewId} .dsp-sandbox-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  #${viewId} #dsp-custom-metrics-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  #${viewId} .dsp-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-card-title {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  #${viewId} #btn-toggle-3d,
  #${viewId} .three-view-toggle-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    padding: 2px 8px !important;
    border-radius: 8px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
    margin-left: 8px !important;
    line-height: 1.2 !important;
    user-select: none !important;
    outline: none !important;
    box-sizing: border-box !important;
    border: 1px solid #c7d2fe !important;
    background: rgba(238, 242, 255, 0.85) !important;
    color: #4338ca !important;
  }
  #${viewId} #btn-toggle-3d:hover,
  #${viewId} .three-view-toggle-btn:hover {
    background: #e0e7ff !important;
  }
  #${viewId} .dsp-card-desc {
    font-size: 10.5px;
    color: #64748b;
    margin-top: 1px;
  }
  #${viewId} .dsp-legend-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10.5px;
    color: #64748b;
    flex-wrap: wrap;
  }
  #${viewId} .dsp-legend-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    margin-right: 2px;
  }

  /* 单一纯净沙盘画板视口 (去框核心：无多层白框) */
  #${viewId} .dsp-sandbox-wrap {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    box-sizing: border-box;
  }



  /* 贯穿式 Scrubber 进度条与播放控制器 */
  #${viewId} .dsp-playback-bar {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    box-sizing: border-box;
  }
  #${viewId} .dsp-slider {
    flex: 1;
    accent-color: #2563eb;
    cursor: pointer;
    height: 4px;
  }
  #${viewId} .dsp-counter-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 1px 6px;
    white-space: nowrap;
  }
  #${viewId} .dsp-ctrl-btn {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 10px;
  }
  #${viewId} .dsp-ctrl-btn:hover {
    background: #f1f5f9;
  }
  #${viewId} .dsp-play-btn {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 10px;
  }
  #${viewId} .dsp-play-btn:hover {
    background: #1d4ed8;
  }

  /* Card 2 指标栅格与输出面板 (零白框平铺) */
  #${viewId} .dsp-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 6px;
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  #${viewId} .dsp-metric-label {
    font-size: 9.5px;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
  }
  #${viewId} .dsp-metric-val {
    font-size: 13px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: #0f172a;
  }
  #${viewId} .dsp-live-text-card {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11px;
    color: #1e40af;
    line-height: 1.4;
    margin-top: 4px;
    flex-shrink: 0;
  }

  /* 右侧暗色代码终端挂载点 (自适应填充上半区，与左侧沙盘+控制条对齐) */
  #${viewId} .dsp-terminal-card {
    background: transparent;
    border: none;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1 1 0;
    min-height: 0;
    box-sizing: border-box;
  }

  /* 右下角执行日志卡片 (与左下状态面板严格水平对齐) */
  #${viewId} .dsp-log-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 0 0 240px;
    min-height: 0;
    padding: 10px 12px;
    box-sizing: border-box;
  }
  #${viewId} .dsp-log-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
</style>

<div id="${viewId}">
  <!-- 1. 顶栏 Header: 左右两翼分别对齐左侧沙盘面板中心与右侧代码终端面板中心 -->
  <header class="dsp-header">
    <!-- 左翼 (对应左面板沙盘区): 算法标题/徽章 + 阶段演化 Tabs + 顺推/逆推 方向切换器 (归位在核心演化控制区) -->
    <div class="dsp-header-left-zone">
      <div class="dsp-header-left">
        <div class="dsp-icon-btn">${icon}</div>
        <h1 class="dsp-main-title" id="dsp-main-title" title="${spec.name}">${spec.name}</h1>
        <button id="btn-open-problem-modal" class="dsp-btn-problem">📋 题目</button>
        <span class="dsp-badge-mode" id="dsp-badge-mode">${modeBadge}</span>
        <span class="dsp-badge-complexity" id="dsp-badge-complexity">${complexityBadge}</span>
      </div>

      <!-- 阶段与方向演化核心导航区: 紧随阶段演化 Tabs，杜绝顺推/逆推被甩到最末尾 -->
      <div class="dsp-stage-nav-wrap">
        ${stageTabsHtml}
        ${modeBarHtml}
      </div>
    </div>

    <!-- 右翼 (对应右面板代码与控制区): 预设案例 + 参数输入 + [应用] + [重置] + [LeetCode 输出槽] -->
    <div class="dsp-header-right">
      ${presetSelectHtml}
      ${inputsHtml}
      <button id="btn-generate" class="dsp-btn-generate" title="应用参数并生成演示">
        应用
      </button>
      <button id="btn-reset" class="dsp-btn-reset" title="重置状态">
        重置
      </button>
      <div class="dsp-output-capsule" id="dsp-output-capsule" title="最终执行返回值 (LeetCode Return Value)">
        <span class="dsp-output-label">输出:</span>
        <span class="dsp-output-val" id="dsp-output-val">—</span>
        <span class="dsp-output-badge-status" id="dsp-output-status" style="display: none;">✓ Accepted</span>
      </div>
    </div>
  </header>

  <!-- 2. 主演示区 4-Card 布局 -->
  <main class="dsp-main-layout">
    <!-- 左侧：沙盘看板 + 进度条 + 状态监视器 -->
    <section class="dsp-left-section">
      <!-- Card 1: 算法沙盘 (100% 充实展示高度，绝不被臃肿预设栏霸占) -->
      <div class="dsp-card">
        <div class="dsp-card-header">
          <div class="dsp-card-title flex items-center gap-2">
            <span id="dsp-card1-title-text">${card1Title}</span>
            ${ThreeViewControlsAdapter.renderToggleButtonHtml(false, !!curStage?.has3D)}
          </div>
          <div class="dsp-legend-bar">
            ${legendHtml}
          </div>
        </div>

        <!-- 扁平纯净沙盘画板 (绝无多层白框) -->
        <div class="dsp-sandbox-wrap" id="dsp-sandbox-container"></div>
      </div>

      <!-- 贯穿式 Scrubber 进度条 -->
      <div class="dsp-playback-bar">
        <input type="range" id="slider-progress" min="0" max="0" value="0" class="dsp-slider" />
        <div class="dsp-counter-badge">
          <span id="step-cur" style="color: #2563eb;">0</span> / <span id="step-total">0</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <button id="btn-step-prev" title="上一步" class="dsp-ctrl-btn">◀</button>
          <button id="btn-play-pause" title="自动播放/暂停" class="dsp-play-btn">
            <span id="play-icon">▶</span>
          </button>
          <button id="btn-step-next" title="下一步" class="dsp-ctrl-btn">▶</button>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; margin-left: 4px;">
          <select id="select-speed" class="dsp-select" style="width: 60px;">
            <option value="1200">慢速</option>
            <option value="500" selected>正常</option>
            <option value="200">快速</option>
          </select>
        </div>
        <div class="dsp-playback-ans-capsule" id="dsp-playback-ans-capsule" style="display: none;">
          <span>🏆 最终解:</span>
          <span id="dsp-playback-ans-val">—</span>
        </div>
      </div>

      <!-- Card 2: 状态指标监视器 -->
      <div class="dsp-card">
        <div class="dsp-card-header">
          <div>
            <div class="dsp-card-title">${card2Title}</div>
            <div class="dsp-card-desc">${card2Desc}</div>
          </div>
        </div>

        ${metricsHtml ? `<div class="dsp-metrics-grid">${metricsHtml}</div>` : ''}

        <div id="dsp-custom-metrics-container" style="display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;"></div>

        <div class="dsp-live-text-card" id="dsp-live-text">
          💡 点击运行或单步调试开始观察算法状态。
        </div>
      </div>
    </section>

    <!-- 右侧：暗色代码终端 + 执行日志流 -->
    <section class="dsp-right-section">
      <!-- Card 3: 暗色代码终端 -->
      <div class="dsp-terminal-card" id="dsp-terminal-container"></div>

      <!-- Card 4: 执行日志流 -->
      <div class="dsp-log-card">
        <div class="dsp-card-header">
          <div class="dsp-card-title" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #1e293b;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>执行日志</span>
          </div>
          <span id="log-count" style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #94a3b8; font-weight: 500;">0 条记录</span>
        </div>
        <div class="dsp-log-list" id="log-container"></div>
      </div>
    </section>
  </main>
</div>
    `;
  }
}
