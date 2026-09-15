/**
 * 声明式 4-Card 舞台呈现引擎 (DeclarativeStagePresenter)
 * 遵循 LSP、OCP 与六边形架构：
 * 统一作为对外呈现接缝，根据算法声明式 Spec 自动生成无冗余子框、标准对齐、紧凑输入的 4-Card 顶层布局。
 *
 * 职责分层（SRP 拆分）：
 * - 数据契约（Spec/Slot/控件类型）→ declarative-stage-spec
 * - 样式主题（650 行 <style>）→ declarative-stage-styles
 * - 模板片段（输入/模式/阶段 Tabs/图例/指标）→ declarative-stage-fragments
 * - 本模块仅负责 4-Card 骨架组装
 */

import { ThreeViewControlsAdapter } from './three-view-controls-adapter';
import { PLAYBACK_SPEED_PRESETS } from './playback-speed-presets';
import { renderStageStyles } from './declarative-stage-styles';
import {
  renderInputsHtml,
  renderPresetSelectHtml,
  renderModeBarHtml,
  renderLegendHtml,
  renderMetricsHtml,
  renderStageTabsHtml,
  resolveHeaderContext,
} from './declarative-stage-fragments';
import type { DeclarativeAlgorithmSpec } from './declarative-stage-spec';

export * from './declarative-stage-spec';
export { renderMetricsHtml } from './declarative-stage-fragments';

export class DeclarativeStagePresenter {
  /**
   * 根据声明式 Spec 编译生成纯粹、无多余嵌套框的标准 4-Card HTML 骨架
   */
  public static generateTemplate(spec: DeclarativeAlgorithmSpec): string {
    const ctx = resolveHeaderContext(spec);
    const activeStageId =
      ctx.curStageId || spec.defaultStage || (spec.stages && spec.stages.length > 0 ? spec.stages[0].id : undefined);

    const stageTabsHtml = renderStageTabsHtml(spec.stages, activeStageId);
    let activeModeId = spec.defaultMode || (spec.modes && spec.modes.length > 0 ? spec.modes[0].id : undefined);
    if (typeof localStorage !== 'undefined' && spec.id) {
      try {
        const savedMode = localStorage.getItem(`algo-mode-${spec.id}`);
        if (savedMode && spec.modes?.some((m) => m.id === savedMode)) {
          activeModeId = savedMode;
        }
      } catch {}
    }
    const modeBarHtml = renderModeBarHtml(spec.modes, activeModeId);
    const inputsHtml = renderInputsHtml(spec.inputs);
    const presetSelectHtml = renderPresetSelectHtml(spec);
    const legendHtml = renderLegendHtml(ctx.curStage?.legend || spec.legend);
    const metricsHtml = renderMetricsHtml(ctx.curStage?.metrics || spec.metrics);

    return `
${renderStageStyles(ctx.viewId)}

<div id="${ctx.viewId}">
  <!-- 1. 顶栏 Header: 左右两翼分别对齐左侧沙盘面板中心与右侧代码终端面板中心 -->
  <header class="dsp-header">
    <!-- 左翼 (对应左面板沙盘区): 算法标题/徽章 + 阶段演化 Tabs + 顺推/逆推 方向切换器 (归位在核心演化控制区) -->
    <div class="dsp-header-left-zone">
      <div class="dsp-header-left">
        <div class="dsp-icon-btn">${ctx.icon}</div>
        <h1 class="dsp-main-title" id="dsp-main-title" title="${spec.name}">${spec.name}</h1>
        <button id="btn-open-problem-modal" class="dsp-btn-problem">📋 题目</button>
        <span class="dsp-badge-mode" id="dsp-badge-mode">${ctx.modeBadge}</span>
        <span class="dsp-badge-complexity" id="dsp-badge-complexity">${ctx.complexityBadge}</span>
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
            <span id="dsp-card1-title-text">${ctx.card1Title}</span>
            ${ThreeViewControlsAdapter.renderToggleButtonHtml(false, !!ctx.curStage?.has3D)}
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
            ${PLAYBACK_SPEED_PRESETS.map((p) => `<option value="${p.ms}"${p.default ? ' selected' : ''}>${p.label}</option>`).join('\n            ')}
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
            <div class="dsp-card-title">${ctx.card2Title}</div>
            <div class="dsp-card-desc">${ctx.card2Desc}</div>
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
