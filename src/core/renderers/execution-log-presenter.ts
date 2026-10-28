/**
 * 统一执行日志呈现器深模块 (ExecutionLogPresenter Deep Module)
 * 遵循 Matt Pocock 深模块哲学与设计模式：
 * 
 * 1. 单一事实来源 (SSOT)：全库所有 658+ 算法演示的 Card 4 (执行日志流) 骨架与逐帧渲染统一归约至此，
 *    严格对齐《不同路径》(unique-paths / stage-explorer) 黄金标准。
 * 2. 纯粹薄接口深实现 (Thin Interface, Deep Module)：
 *    - renderCard4Html(options?: ExecutionLogCardOptions): string  // 编译生成标准 Card 4 容器与头部骨架
 *    - renderStepLogs(container, steps, currentIndex, logCountEl): void // 逐帧渲染日志条目，高亮当前步，自动滚动
 * 3. 优雅容错与环境无关性：在真实 DOM 与测试环境（JSDOM / 0-DOM）中 100% 稳健运行。
 */

export interface ExecutionLogCardOptions {
  title?: string;
  countLabel?: string;
  containerId?: string;
  countId?: string;
  customClass?: string;
}

export interface StepLogEntry {
  log?: string;
  message?: string;
  msg?: string;
  decision?: string;
  type?: string;
  [key: string]: any;
}

export class ExecutionLogPresenter {
  /**
   * 生成对齐《不同路径》(unique-paths) 的标准 Card 4 HTML 骨架
   */
  public static renderCard4Html(options: ExecutionLogCardOptions = {}): string {
    const title = options.title || '执行日志';
    const containerId = options.containerId || 'log-container';
    const countId = options.countId || 'log-count';
    const countLabel = options.countLabel || '0 条记录';
    const customClass = options.customClass ? ` ${options.customClass}` : '';

    return `
      <div class="dsp-log-card${customClass}" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; overflow: hidden; flex: 0 0 240px; min-height: 0; box-sizing: border-box;">
        <div class="dsp-log-header" style="background: #f8fafc; padding: 7px 12px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span style="font-size: 11.5px; font-weight: 700; color: #1e293b;">${title}</span>
          </div>
          <span id="${countId}" class="dsp-log-count-badge" style="font-size: 10.5px; font-family: 'JetBrains Mono', Consolas, monospace; color: #64748b; background: #ffffff; border: 1px solid #e2e8f0; padding: 1px 7px; border-radius: 5px; font-weight: 500;">${countLabel}</span>
        </div>
        <div class="dsp-log-list" id="${containerId}" style="flex: 1; min-height: 0; padding: 8px 10px; overflow-y: auto; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; scroll-behavior: smooth;"></div>
      </div>
    `.trim();
  }

  /**
   * 渲染动态执行日志流 (逐帧渲染，自动高亮当前步与自动滚动)
   * 对齐 unique-paths 黄金标准的颜色、留白、边框与徽章层次
   */
  public static renderStepLogs(
    container: HTMLElement | null,
    steps: StepLogEntry[],
    currentIndex: number,
    logCountEl?: HTMLElement | null
  ): void {
    if (!container || !steps || steps.length === 0) return;

    if (logCountEl) {
      logCountEl.textContent = `${currentIndex + 1} / ${steps.length} 记录`;
    }

    const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const visibleSteps = steps.slice(0, currentIndex + 1);
    const html = visibleSteps.map((st: any, idx: number) => {
      const isCurrent = idx === currentIndex;
      const logMsg = st.log || st.decision || st.message || st.msg || (st.type ? `步骤 ${idx + 1}: ${st.type}` : `步骤 #${idx + 1}`);

      const baseStyle = isCurrent
        ? 'padding: 3.5px 8px; border-radius: 6px; background: #eff6ff; color: #1e3a8a; font-weight: 700; border-left: 3px solid #3b82f6; display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 2px; font-family: monospace; box-shadow: 0 1px 2px rgba(59, 130, 246, 0.08);'
        : 'padding: 2.5px 8px; border-radius: 4px; color: #64748b; font-size: 11px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; font-family: monospace;';

      const safeMsg = String(logMsg)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `
        <div style="${baseStyle}">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px;">${safeMsg}</span>
          <span style="color: #94a3b8; font-size: 10px; font-weight: normal; flex-shrink: 0;">#${idx + 1}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }
}
