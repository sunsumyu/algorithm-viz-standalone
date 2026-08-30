/**
 * 声明式 4-Card 舞台呈现引擎 (DeclarativeStagePresenter)
 * 遵循 LSP、OCP 与六边形架构：
 * 统一作为对外呈现接缝，根据算法声明式 Spec 自动生成无冗余子框、标准对齐、紧凑输入的 4-Card 顶层布局
 */

export interface InputControlDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  defaultValue: any;
  width?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
}

export interface PresetCaseDef {
  label: string;
  values: Record<string, any>;
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

export interface DeclarativeAlgorithmSpec<TStep = any> {
  id: string;
  name: string;
  category: string;
  icon?: string;
  badge?: {
    mode: string;
    complexity: string;
  };
  card1Title?: string;
  card2Title?: string;
  card2Desc?: string;
  legend?: LegendItemDef[];
  inputs?: InputControlDef[];
  presets?: PresetCaseDef[];
  modes?: ModeOptionDef[];
  metrics?: MetricCardDef[];
  codeLanguages: Record<string, string[]>;
  problemHtml: string;
  analysisHtml: string;
  buildSteps: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas?: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export class DeclarativeStagePresenter {
  /**
   * 根据声明式 Spec 编译生成纯粹、无多余嵌套框的标准 4-Card HTML 骨架
   */
  public static generateTemplate(spec: DeclarativeAlgorithmSpec): string {
    const viewId = `algo-${spec.id}-view`;
    const icon = spec.icon || '📊';
    const modeBadge = spec.badge?.mode || '标准模式';
    const complexityBadge = spec.badge?.complexity || 'O(n) · O(1)';
    const card1Title = spec.card1Title || '📊 算法执行沙盘';
    const card2Title = spec.card2Title || '🧭 状态空间与指标监视器';
    const card2Desc = spec.card2Desc || '当前操作指令、关键指标与状态记录';

    // 1. 顶栏输入控件
    const inputsHtml = (spec.inputs || [])
      .map((input) => {
        const widthStyle = input.width ? `style="width: ${input.width};"` : 'style="width: 110px;"';
        if (input.type === 'select') {
          const opts = (input.options || [])
            .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
            .join('');
          return `
            <div class="dsp-input-group">
              <label for="${input.id}">${input.label}:</label>
              <select id="${input.id}" class="dsp-select" ${widthStyle}>${opts}</select>
            </div>
          `;
        }
        return `
          <div class="dsp-input-group">
            <label for="${input.id}">${input.label}:</label>
            <input type="${input.type}" id="${input.id}" value="${input.defaultValue}" class="dsp-input" placeholder="${input.placeholder || ''}" ${widthStyle} />
          </div>
        `;
      })
      .join('');

    // 2. 预设案例栏 (单框包裹，左标签，右 flex-list 完美对齐)
    let presetBarHtml = '';
    if (spec.presets && spec.presets.length > 0) {
      const chipsHtml = spec.presets
        .map(
          (p, i) =>
            `<button class="dsp-chip ${i === 0 ? 'active' : ''}" data-preset='${JSON.stringify(p.values)}'>${p.label}</button>`
        )
        .join('');
      presetBarHtml = `
        <div class="dsp-preset-bar">
          <span class="dsp-preset-label">预设案例:</span>
          <div class="dsp-preset-list">
            ${chipsHtml}
          </div>
        </div>
      `;
    }

    // 3. 模式选择栏 (单框包裹)
    let modeBarHtml = '';
    if (spec.modes && spec.modes.length > 0) {
      const modeChipsHtml = spec.modes
        .map(
          (m, i) =>
            `<button class="dsp-chip dsp-mode-chip ${i === 0 ? 'active' : ''}" data-mode="${m.id}">${m.label}</button>`
        )
        .join('');
      modeBarHtml = `
        <div class="dsp-preset-bar" style="margin-top: 4px;">
          <span class="dsp-preset-label">运行模式:</span>
          <div class="dsp-preset-list">
            ${modeChipsHtml}
          </div>
        </div>
      `;
    }

    // 4. 图例 Bar
    const legendHtml = (spec.legend || [])
      .map(
        (lg) =>
          `<div><span class="dsp-legend-dot" style="background: ${lg.color};"></span> ${lg.label}</div>`
      )
      .join('');

    // 5. Card 2 指标网格
    const metricsHtml = (spec.metrics || [])
      .map((m) => {
        const colorStyle = m.color ? `style="color: ${m.color};"` : '';
        return `
          <div class="dsp-metric-card">
            <span class="dsp-metric-label">${m.label}</span>
            <span class="dsp-metric-val" id="metric-${m.id}" ${colorStyle}>—</span>
          </div>
        `;
      })
      .join('');

    return `
<style>
  #${viewId} {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #0f172a;
    overflow: hidden;
  }
  #${viewId} .dsp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
    gap: 12px;
    height: 48px;
    box-sizing: border-box;
  }
  #${viewId} .dsp-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
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
  }
  #${viewId} .dsp-main-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    white-space: nowrap;
  }
  #${viewId} .dsp-btn-problem {
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    cursor: pointer;
    font-weight: 600;
  }
  #${viewId} .dsp-btn-problem:hover {
    background: #f1f5f9;
  }
  #${viewId} .dsp-badge-mode {
    font-size: 10.5px;
    font-weight: 600;
    padding: 1.5px 6px;
    border-radius: 4px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #dbeafe;
    white-space: nowrap;
  }
  #${viewId} .dsp-badge-complexity {
    font-size: 10.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    padding: 1.5px 6px;
    border-radius: 4px;
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
  }
  #${viewId} .dsp-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  #${viewId} .dsp-input-group {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #475569;
    font-weight: 600;
  }
  #${viewId} .dsp-input, #${viewId} .dsp-select {
    padding: 2.5px 6px;
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
    padding: 3px 10px;
    border-radius: 4px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 24px;
  }
  #${viewId} .dsp-btn-generate:hover {
    background: #1d4ed8;
  }
  #${viewId} .dsp-btn-reset {
    padding: 3px 8px;
    border-radius: 4px;
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    height: 24px;
  }
  #${viewId} .dsp-btn-reset:hover {
    background: #f1f5f9;
  }

  /* 4-Card 布局 */
  #${viewId} .dsp-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 8px;
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
  }
  #${viewId} .dsp-left-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    height: 100%;
  }
  #${viewId} .dsp-right-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    height: 100%;
  }

  /* 通用卡片容器 (标准单层边框，内部绝不搞白底嵌套框) */
  #${viewId} .dsp-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    min-height: 0;
    padding: 8px;
    box-sizing: border-box;
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
    border-radius: 6px;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
  }

  /* 标准单外框对齐预设栏 */
  #${viewId} .dsp-preset-bar {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    margin-top: 4px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-preset-label {
    font-size: 10.5px;
    font-weight: 700;
    color: #64748b;
    white-space: nowrap;
    line-height: 20px;
    flex-shrink: 0;
  }
  #${viewId} .dsp-preset-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  #${viewId} .dsp-chip {
    padding: 1.5px 6px;
    border-radius: 4px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    font-size: 10.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    line-height: 16px;
  }
  #${viewId} .dsp-chip:hover {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1d4ed8;
  }
  #${viewId} .dsp-chip.active {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
    font-weight: 700;
  }

  /* 贯穿式 Scrubber 进度条与播放控制器 */
  #${viewId} .dsp-playback-bar {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 10px;
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

  /* 右侧暗色代码终端挂载点 (无多余外框，单层自适应) */
  #${viewId} .dsp-terminal-card {
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 2;
    min-height: 0;
  }

  /* 右下角执行日志卡片 */
  #${viewId} .dsp-log-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    min-height: 0;
    padding: 8px;
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
  <!-- 1. 顶栏 Header -->
  <header class="dsp-header">
    <div class="dsp-header-left">
      <div class="dsp-icon-btn">${icon}</div>
      <h1 class="dsp-main-title">${spec.name}</h1>
      <button id="btn-open-problem-modal" class="dsp-btn-problem">📋 题目</button>
      <span class="dsp-badge-mode">${modeBadge}</span>
      <span class="dsp-badge-complexity">${complexityBadge}</span>
    </div>

    <div class="dsp-header-right">
      ${inputsHtml}
      <button id="btn-generate" class="dsp-btn-generate">
        <span>▶ 运行</span>
      </button>
      <button id="btn-reset" class="dsp-btn-reset">
        重置
      </button>
    </div>
  </header>

  <!-- 2. 主演示区 4-Card 布局 -->
  <main class="dsp-main-layout">
    <!-- 左侧：沙盘看板 + 进度条 + 状态监视器 -->
    <section class="dsp-left-section">
      <!-- Card 1: 算法沙盘 -->
      <div class="dsp-card">
        <div class="dsp-card-header">
          <div class="dsp-card-title">
            <span>${card1Title}</span>
          </div>
          <div class="dsp-legend-bar">
            ${legendHtml}
          </div>
        </div>

        <!-- 扁平纯净沙盘画板 (绝无多层白框) -->
        <div class="dsp-sandbox-wrap" id="dsp-sandbox-container"></div>

        <!-- 模式切换栏 (可选) -->
        ${modeBarHtml}

        <!-- 预设案例栏 (可选) -->
        ${presetBarHtml}
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

        <div id="dsp-custom-metrics-container" style="flex: 1; min-height: 0; overflow-y: auto;"></div>

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
          <div class="dsp-card-title">📜 执行日志与状态转移记录</div>
          <span id="log-count" class="dsp-counter-badge">0 记录</span>
        </div>
        <div class="dsp-log-list" id="log-container"></div>
      </div>
    </section>
  </main>
</div>
    `;
  }
}
