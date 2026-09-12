/**
 * 声明式 4-Card 舞台样式表 (DeclarativeStageStyles)
 *
 * 从 declarative-stage-presenter 拆出的纯样式层：
 * generateTemplate 的 650 行内联 <style> 主题，按 viewId 作用域生成。
 * 纯字符串函数 —— 结构骨架见 declarative-stage-presenter，数据契约见 declarative-stage-spec。
 */

/**
 * 渲染舞台样式表：所有选择器以 #viewId 作用域隔离，避免多实例相互污染
 */
export function renderStageStyles(viewId: string): string {
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
`;
}
