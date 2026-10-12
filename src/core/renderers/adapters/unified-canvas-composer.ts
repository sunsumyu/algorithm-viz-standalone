/**
 * Unified Canvas Composer (全库统一画布装配器深模块)
 * 遵循设计原则与设计模式：
 * 1. 单一职责原则 (SRP) & 单一事实来源 (SSOT)：集中维护外层容器、指标卡网格、定理卡片与响应式样式
 * 2. 模板方法模式 (Template Method Pattern)：固化 Canvas 组装骨架
 * 3. 组合器模式 (Composite Pattern)：统一编排沙盘、指标、公式微组件
 */

export interface CanvasMetricItem {
  label: string;
  value: string | number;
  color?: string;
  subText?: string;
}

export interface CanvasFormulaConfig {
  title: string;
  equation: string;
  explanation?: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export interface UnifiedCanvasSpec {
  /** 顶部指标卡列表 (按 auto-fit 网格自适应排布) */
  metrics?: CanvasMetricItem[];
  /** 领域特异性主沙盘/调用栈/拓扑图 HTML */
  mainBoardHtml: string;
  /** 底部定理/状态转移公式卡 (可选) */
  formula?: CanvasFormulaConfig;
  /** 扩展底部槽位 HTML (可选) */
  extraFooterHtml?: string;
}

const BADGE_COLORS = {
  success: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  warning: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  danger: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  info: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
};

/**
 * 渲染状态说明面板与数学公式卡片 (统一单一事实来源)
 */
export function renderFormulaCard(
  title: string,
  formula: string,
  explanation: string = '',
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' }
): string {
  const badge = statusBadge ? BADGE_COLORS[statusBadge.type] || BADGE_COLORS.info : BADGE_COLORS.info;

  return `
    <div class="dsp-formula-card" data-formula-card="true" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px; margin-top: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 13px; font-weight: 700; color: #1e293b;">💡 ${title}</span>
        ${statusBadge ? `
          <span style="background: ${badge.bg}; color: ${badge.text}; border: 1px solid ${badge.border}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
            ${statusBadge.text}
          </span>
        ` : ''}
      </div>
      <div style="font-family: 'JetBrains Mono', Consolas, monospace; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #2563eb; font-weight: 600; margin-bottom: 6px; word-break: break-all;">
        ${formula}
      </div>
      ${explanation ? `
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">
          ${explanation}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 渲染自适应指标卡网格
 */
export function renderMetricsGrid(metrics: CanvasMetricItem[]): string {
  if (!metrics || metrics.length === 0) return '';
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px;">
      ${metrics.map(m => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b; font-weight: 500;">${m.label}</div>
          <div style="font-size: 16px; font-weight: 700; color: ${m.color || '#1d4ed8'}; margin-top: 4px;">
            ${m.value}
          </div>
          ${m.subText ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${m.subText}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * 模板方法：统一装配算法沙盘画布 (全库唯一样式治理入口)
 */
export function composeUnifiedCanvas(container: HTMLElement, spec: UnifiedCanvasSpec): void {
  const metricsHtml = spec.metrics && spec.metrics.length > 0 ? renderMetricsGrid(spec.metrics) : '';
  const formulaHtml = spec.formula
    ? renderFormulaCard(
        spec.formula.title,
        spec.formula.equation,
        spec.formula.explanation || '',
        spec.formula.statusBadge
      )
    : '';

  container.innerHTML = `
    <div class="unified-algo-canvas" style="padding: 16px; background: #ffffff; border-radius: 12px; font-family: system-ui, -apple-system, sans-serif;">
      ${metricsHtml}
      ${spec.mainBoardHtml}
      ${spec.extraFooterHtml || ''}
      ${formulaHtml}
    </div>
  `;
}

/**
 * 高阶工厂函数：创建声明式画布渲染器
 */
export function createUnifiedCanvasRenderer<TStep>(
  specExtractor: (step: TStep) => UnifiedCanvasSpec
): (container: HTMLElement, step: TStep) => void {
  return (container: HTMLElement, step: TStep) => {
    composeUnifiedCanvas(container, specExtractor(step));
  };
}
