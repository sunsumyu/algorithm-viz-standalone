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
  label: string;
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
        <div class="empty-path-placeholder" style="color: rgba(255,255,255,0.35); font-size: 13px; font-style: italic; padding: 8px 12px; text-align: center;">
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
        let badgeColor = 'rgba(59, 130, 246, 0.2)';
        let borderColor = 'rgba(96, 165, 250, 0.4)';
        let textColor = '#93c5fd';

        if (isLast && highlightLast) {
          if (action === 'push') {
            actionClass = 'path-node-push';
            badgeColor = 'rgba(16, 185, 129, 0.25)';
            borderColor = '#10b981';
            textColor = '#6ee7b7';
          } else if (action === 'pop') {
            actionClass = 'path-node-pop';
            badgeColor = 'rgba(239, 68, 68, 0.25)';
            borderColor = '#ef4444';
            textColor = '#fca5a5';
          } else if (action === 'collect') {
            actionClass = 'path-node-collect';
            badgeColor = 'rgba(234, 179, 8, 0.25)';
            borderColor = '#eab308';
            textColor = '#fde047';
          }
        }

        return `
          <div class="path-stack-node ${actionClass}" style="
            display: inline-flex; align-items: center; gap: 6px;
            padding: 4px 10px; border-radius: 8px;
            background: ${badgeColor}; border: 1px solid ${borderColor};
            color: ${textColor}; font-weight: 600; font-family: monospace; font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            <span style="font-size: 10px; opacity: 0.6; font-weight: normal;">#${idx}</span>
            <span>${val}</span>
          </div>
        `;
      })
      .join('<span style="color: rgba(255,255,255,0.3); font-weight: bold; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 4px 6px;">
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
        <div style="color: rgba(255,255,255,0.35); font-size: 12px; padding: 6px 10px;">
          当前阶段未启用剪枝（朴素回溯全搜索）
        </div>
      `;
      return;
    }

    const isPruned = !!options.conditionMet;
    const statusBg = isPruned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    const statusBorder = isPruned ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
    const statusText = isPruned ? '#f87171' : '#34d399';
    const statusBadge = isPruned ? '✂️ 触发剪枝 (跳过后续搜索)' : '✅ 条件合法 (继续探索)';

    let formulaHtml = '';
    if (options.formula) {
      formulaHtml = `
        <div style="font-family: monospace; font-size: 12px; color: #cbd5e1; margin-bottom: 4px;">
          <strong>剪枝判定:</strong> <code>${options.formula}</code>
        </div>
      `;
    }

    let detailHtml = '';
    if (options.remainingCapacity !== undefined || options.neededElements !== undefined) {
      detailHtml = `
        <div style="display: flex; gap: 12px; font-size: 12px; color: #94a3b8; margin-top: 4px;">
          ${options.remainingCapacity !== undefined ? `<span>剩余可选数: <strong style="color: #e2e8f0;">${options.remainingCapacity}</strong></span>` : ''}
          ${options.neededElements !== undefined ? `<span>还需元素: <strong style="color: #e2e8f0;">${options.neededElements}</strong></span>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="
        background: ${statusBg}; border: 1px solid ${statusBorder};
        border-radius: 8px; padding: 8px 12px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          ${formulaHtml}
          <span style="color: ${statusText}; font-size: 11px; font-weight: 700; border-radius: 4px; padding: 2px 6px; background: rgba(0,0,0,0.2);">
            ${statusBadge}
          </span>
        </div>
        ${options.message ? `<div style="font-size: 12px; color: #e2e8f0; line-height: 1.4;">${options.message}</div>` : ''}
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
        <div style="color: rgba(255,255,255,0.35); font-size: 12px; font-style: italic; padding: 6px 10px;">
          (暂未找到合法解集)
        </div>
      `;
      return;
    }

    const cardsHtml = results
      .map((res, idx) => {
        const isActive = idx === activeIndex || (activeIndex === -1 && idx === results.length - 1);
        const bg = isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        const border = isActive ? '#10b981' : 'rgba(255, 255, 255, 0.12)';
        const color = isActive ? '#6ee7b7' : '#e2e8f0';

        return `
          <button class="result-solution-chip" data-index="${idx}" style="
            display: inline-flex; align-items: center; gap: 4px;
            padding: 4px 8px; border-radius: 6px;
            background: ${bg}; border: 1px solid ${border};
            color: ${color}; font-size: 12px; font-family: monospace; font-weight: 600;
            cursor: pointer; transition: all 0.2s; outline: none;
          ">
            <span style="opacity: 0.5; font-size: 10px;">#${idx + 1}</span>
            <span>[${res.join(', ')}]</span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 4px 6px;">
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
        const border = v.highlight ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        const bg = v.highlight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)';
        const valueColor = v.highlight ? '#fcd34d' : '#38bdf8';

        return `
          <div style="
            display: flex; flex-direction: column; gap: 2px;
            padding: 6px 10px; border-radius: 6px;
            background: ${bg}; border: 1px solid ${border};
            min-width: 60px; text-align: center;
          ">
            <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">${v.label}</span>
            <span style="font-size: 13px; font-weight: bold; color: ${valueColor}; font-family: monospace;">${v.value}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 4px 6px;">
        ${itemsHtml}
      </div>
    `;
  }

  /**
   * 渲染回溯语义日志流 (Log Stream)
   */
  public static renderBacktrackLogStream(
    container: HTMLElement | null,
    logs: BacktrackLogItem[],
    activeIndex: number = -1
  ): void {
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<div style="color: #64748b; font-size: 12px;">(暂无执行日志)</div>';
      return;
    }

    const itemsHtml = logs
      .map((item, idx) => {
        const isCurrent = idx === activeIndex || (activeIndex === -1 && idx === logs.length - 1);
        let tagColor = '#94a3b8';
        let tagBg = 'rgba(255,255,255,0.06)';
        let tagName = '执行';

        if (item.type === 'push') {
          tagColor = '#60a5fa';
          tagBg = 'rgba(59, 130, 246, 0.15)';
          tagName = '选择';
        } else if (item.type === 'pop') {
          tagColor = '#f87171';
          tagBg = 'rgba(239, 68, 68, 0.15)';
          tagName = '撤销';
        } else if (item.type === 'collect') {
          tagColor = '#34d399';
          tagBg = 'rgba(16, 185, 129, 0.15)';
          tagName = '解集';
        } else if (item.type === 'prune') {
          tagColor = '#fbbf24';
          tagBg = 'rgba(245, 158, 11, 0.15)';
          tagName = '剪枝';
        }

        return `
          <div style="
            display: flex; align-items: baseline; gap: 8px;
            padding: 4px 8px; border-radius: 4px;
            background: ${isCurrent ? 'rgba(59, 130, 246, 0.12)' : 'transparent'};
            border-left: ${isCurrent ? '3px solid #3b82f6' : '3px solid transparent'};
            font-size: 12px; line-height: 1.5; color: ${isCurrent ? '#f8fafc' : '#94a3b8'};
          ">
            <span style="font-size: 10px; color: ${tagColor}; background: ${tagBg}; padding: 1px 4px; border-radius: 3px; font-weight: 700;">
              ${tagName}
            </span>
            <span style="font-family: monospace; font-size: 11px; opacity: 0.5;">#${item.stepNumber ?? idx + 1}</span>
            <span style="flex: 1;">${item.text}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${itemsHtml}
      </div>
    `;

    // 自动滚动到最新日志
    container.scrollTop = container.scrollHeight;
  }
}
