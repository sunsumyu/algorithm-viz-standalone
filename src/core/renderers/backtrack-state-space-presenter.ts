/**
 * BacktrackStateSpacePresenter (回溯状态空间与沙盘呈现器)
 * 
 * 专为回溯算法定制的深模块呈现器：
 * 1. 路径栈呈现 (Path Stack): 动态 push/pop/collect 动效与指示器
 * 2. 剪枝监视器 (Pruning Monitor): 实时展示剪枝边界公式、剩余容量与触发状态
 * 3. 结果集收集箱 (Result Collection): 实时解集卡片与溯源交互
 * 4. 实时变量监控 (Variable Watch): startIndex, depth, sum, target 等关键状态
 * 5. 回溯语义日志流 (Log Stream): 记录探索、深入、剪枝、回溯撤销动作
 */

export interface PathStackOptions {
  activeIndex?: number;
  action?: 'push' | 'pop' | 'collect' | 'idle';
  highlightLast?: boolean;
}

export interface PruningMonitorOptions {
  enabled: boolean;
  formula?: string;
  conditionMet?: boolean;
  remainingCapacity?: number;
  neededElements?: number;
  message?: string;
}

export interface VariableWatchItem {
  label?: string;
  name?: string;
  value: string | number;
  highlight?: boolean;
}

export interface BacktrackLogItem {
  text: string;
  type?: 'push' | 'pop' | 'collect' | 'prune' | 'info';
  stepNumber?: number;
}

export class BacktrackStateSpacePresenter {
  /**
   * 渲染当前路径栈 (Path Stack)
   */
  public static renderPathStack(
    container: HTMLElement | null,
    path: Array<number | string>,
    options: PathStackOptions = {}
  ): void {
    if (!container) return;

    if (!path || path.length === 0) {
      container.innerHTML = `
        <div class="empty-path-placeholder" style="color: #94a3b8; font-size: 12px; font-style: italic; padding: 6px 10px;">
          (当前路径栈为空 [ ])
        </div>
      `;
      return;
    }

    const { action = 'idle', highlightLast = true } = options;
    const itemsHtml = path
      .map((val, idx) => {
        const isLast = idx === path.length - 1;
        let actionClass = '';
        let badgeBg = '#eff6ff';
        let borderColor = '#93c5fd';
        let textColor = '#1e40af';

        if (isLast && highlightLast) {
          if (action === 'push') {
            actionClass = 'path-node-push';
            badgeBg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#047857';
          } else if (action === 'pop') {
            actionClass = 'path-node-pop';
            badgeBg = '#fef2f2';
            borderColor = '#ef4444';
            textColor = '#b91c1c';
          } else if (action === 'collect') {
            actionClass = 'path-node-collect';
            badgeBg = '#fefce8';
            borderColor = '#eab308';
            textColor = '#854d0e';
          }
        }

        return `
          <div class="path-stack-node ${actionClass}" style="
            display: inline-flex; align-items: center; gap: 5px;
            padding: 3px 9px; border-radius: 7px;
            background: ${badgeBg}; border: 1px solid ${borderColor};
            color: ${textColor}; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            <span style="font-size: 10px; opacity: 0.6; font-weight: normal;">#${idx}</span>
            <span>${val}</span>
          </div>
        `;
      })
      .join('<span style="color: #94a3b8; font-weight: bold; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 2px 4px;">
        ${itemsHtml}
      </div>
    `;
  }

  /**
   * 渲染剪枝监视器 (Pruning Monitor)
   */
  public static renderPruningMonitor(
    container: HTMLElement | null,
    options: PruningMonitorOptions
  ): void {
    if (!container) return;

    if (!options.enabled) {
      container.innerHTML = `
        <div style="color: #94a3b8; font-size: 12px; padding: 6px 8px;">
          当前阶段未启用剪枝（朴素回溯全搜索）
        </div>
      `;
      return;
    }

    const isPruned = !!options.conditionMet;
    const statusBg = isPruned ? '#fef2f2' : '#ecfdf5';
    const statusBorder = isPruned ? '#fca5a5' : '#a7f3d0';
    const statusText = isPruned ? '#b91c1c' : '#047857';
    const statusBadge = isPruned ? '✂️ 触发剪枝 (跳过后续搜索)' : '✅ 条件合法 (继续探索)';

    let formulaHtml = '';
    if (options.formula) {
      formulaHtml = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #334155; margin-bottom: 2px;">
          <strong>剪枝判定:</strong> <code>${options.formula}</code>
        </div>
      `;
    }

    let detailHtml = '';
    if (options.remainingCapacity !== undefined || options.neededElements !== undefined) {
      detailHtml = `
        <div style="display: flex; gap: 12px; font-size: 11.5px; color: #64748b; margin-top: 2px;">
          ${options.remainingCapacity !== undefined ? `<span>剩余可选数: <strong style="color: #0f172a;">${options.remainingCapacity}</strong></span>` : ''}
          ${options.neededElements !== undefined ? `<span>还需元素: <strong style="color: #0f172a;">${options.neededElements}</strong></span>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="
        background: ${statusBg}; border: 1px solid ${statusBorder};
        border-radius: 8px; padding: 6px 10px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          ${formulaHtml}
          <span style="color: ${statusText}; font-size: 10.5px; font-weight: 700; border-radius: 4px; padding: 1.5px 6px; background: rgba(255,255,255,0.7); border: 1px solid ${statusBorder}; flex-shrink: 0;">
            ${statusBadge}
          </span>
        </div>
        ${options.message ? `<div style="font-size: 11.5px; color: ${statusText}; line-height: 1.4; margin-top: 2px;">${options.message}</div>` : ''}
        ${detailHtml}
      </div>
    `;
  }

  /**
   * 渲染解集收集箱 (Result Collection)
   */
  public static renderResultCollection(
    container: HTMLElement | null,
    results: Array<Array<number | string>>,
    activeIndex: number = -1,
    onSelect?: (index: number) => void
  ): void {
    if (!container) return;

    if (!results || results.length === 0) {
      container.innerHTML = `
        <div style="color: #94a3b8; font-size: 12px; font-style: italic; padding: 4px 8px;">
          (暂未找到合法解集)
        </div>
      `;
      return;
    }

    const cardsHtml = results
      .map((res, idx) => {
        const isActive = idx === activeIndex || (activeIndex === -1 && idx === results.length - 1);
        const bg = isActive ? '#ecfdf5' : '#f8fafc';
        const border = isActive ? '#10b981' : '#e2e8f0';
        const color = isActive ? '#047857' : '#334155';
        const weight = isActive ? '700' : '600';

        return `
          <button class="result-solution-chip" data-index="${idx}" style="
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 8px; border-radius: 6px;
            background: ${bg}; border: 1px solid ${border};
            color: ${color}; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: ${weight};
            cursor: pointer; transition: all 0.15s; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          ">
            <span style="opacity: 0.6; font-size: 10px;">#${idx + 1}</span>
            <span>[${res.join(', ')}]</span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 2px 4px;">
        ${cardsHtml}
      </div>
    `;

    if (onSelect) {
      container.querySelectorAll<HTMLButtonElement>('.result-solution-chip').forEach((btn) => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index || '0', 10);
          onSelect(idx);
        };
      });
    }
  }

  /**
   * 渲染实时变量监控 (Variable Watch)
   */
  public static renderVariableWatch(
    container: HTMLElement | null,
    variables: VariableWatchItem[]
  ): void {
    if (!container) return;

    const itemsHtml = variables
      .map((v) => {
        const border = v.highlight ? '#fde68a' : '#e2e8f0';
        const bg = v.highlight ? '#fffbeb' : '#f8fafc';
        const valueColor = v.highlight ? '#d97706' : '#2563eb';

        return `
          <div style="
            display: flex; flex-direction: column; gap: 1px;
            padding: 4px 8px; border-radius: 6px;
            background: ${bg}; border: 1px solid ${border};
            min-width: 54px; text-align: center;
          ">
            <span style="font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase;">${v.label || v.name || 'VAR'}</span>
            <span style="font-size: 12px; font-weight: 800; color: ${valueColor}; font-family: 'JetBrains Mono', monospace;">${v.value}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 2px 4px;">
        ${itemsHtml}
      </div>
    `;
  }

  /**
   * 渲染回溯语义日志流 (Execution Log Stream, 100% 对标 DP 标准模板)
   */
  public static renderBacktrackLogStream(
    container: HTMLElement | null,
    logs: BacktrackLogItem[],
    activeIndex: number = -1
  ): void {
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<div class="text-slate-400 text-xs italic p-2 text-center">(暂无执行日志)</div>';
      return;
    }

    const itemsHtml = logs
      .map((item, idx) => {
        const isCurrent = idx === activeIndex;
        let icon = '▶';
        let tagName = '执行';
        let tagColor = '#64748b';
        let tagBg = '#f1f5f9';

        if (item.type === 'push') {
          icon = '➕';
          tagName = '选择';
          tagColor = '#1d4ed8';
          tagBg = '#eff6ff';
        } else if (item.type === 'pop') {
          icon = '🔙';
          tagName = '撤销';
          tagColor = '#b91c1c';
          tagBg = '#fef2f2';
        } else if (item.type === 'collect') {
          icon = '🏆';
          tagName = '解集';
          tagColor = '#047857';
          tagBg = '#ecfdf5';
        } else if (item.type === 'prune') {
          icon = '✂️';
          tagName = '剪枝';
          tagColor = '#c2410c';
          tagBg = '#fff7ed';
        }

        const activeClass = isCurrent
          ? 'bg-blue-50/90 border-blue-200 text-blue-900 font-bold shadow-2xs'
          : 'text-slate-600 border-transparent hover:bg-slate-50';

        const indicatorColor = isCurrent ? 'bg-blue-600' : 'bg-slate-300';

        return `
          <div id="bt-log-item-${idx}" class="log-item flex items-center justify-between p-1.5 rounded-lg border transition font-mono text-[11px] ${activeClass}">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-1 h-3 rounded-full ${indicatorColor} flex-shrink-0"></span>
              <span style="font-size: 9.5px; color: ${tagColor}; background: ${tagBg}; padding: 1px 4px; border-radius: 4px; font-weight: 700; flex-shrink: 0;">${icon} ${tagName}</span>
              <span class="truncate">${item.text}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-sans flex-shrink-0 ml-2">#${item.stepNumber ?? idx + 1}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="space-y-1">
        ${itemsHtml}
      </div>
    `;

    // 自动平滑滚动当前活跃项至可视区
    if (typeof container.querySelector === 'function') {
      if (activeIndex >= 0) {
        const activeEl = container.querySelector(`#bt-log-item-${activeIndex}`);
        if (activeEl && typeof activeEl.scrollIntoView === 'function') {
          activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
}
