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
   * 格式化并归一化任意算法步骤的执行日志，100% 对齐《不同路径》(unique-paths) 黄金标准：
   * 1. 始终以 "| " 开头；
   * 2. 具备阶段语义 Emoji (📥, 🔍, 🎯, 🌿, 🔄, ⚡, 🔙, 🎬, 🏆, 🚧)；
   * 3. 优先使用具备中文教育叙事性的 message/decision，彻底清洗英文生硬调试字串 (done stage, visit, recurse left, hit target 等)；
   * 4. 纯英文兜底时自动进行高保真意图翻译。
   */
  public static formatLogMessage(st: StepLogEntry, idx: number): string {
    if (!st) return `| 📝 步骤 #${idx + 1}`;

    const rawLog = String(st.log || '').trim();
    const rawMsg = String(st.message || st.msg || '').trim();
    const rawDecision = String(st.decision || '').trim();

    const hasChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);

    // 检查 log 是否为粗糙的未本地化开发者调试字串
    const isCrudeEnglish = (text: string) => {
      if (!text) return true;
      if (hasChinese(text)) return false;
      return (
        /^(visit|recurse|done|depth|step|check|hit|search|insert|delete|harvest|backtrack|call|enter|return|isLeaf|update)/i.test(text) ||
        /^(root\s*==|node\s*==|already\s*exists|done\s*stage|target\s*<|target\s*>)/i.test(text)
      );
    };

    let selectedText = '';

    // 优先策略 1: 若 rawLog 已对齐标准 (以 "| " 开头且包含中文)，直接采纳
    if (rawLog.startsWith('|') && hasChinese(rawLog)) {
      selectedText = rawLog;
    }
    // 优先策略 2: 若 rawLog 是生硬英文，但 message 或 decision 包含丰富中文，果断采用中文解说
    else if (isCrudeEnglish(rawLog) && hasChinese(rawMsg)) {
      selectedText = rawMsg;
    } else if (isCrudeEnglish(rawLog) && hasChinese(rawDecision)) {
      selectedText = rawDecision;
    }
    // 优先策略 3: 正常取非空的 log -> message -> decision
    else if (rawLog && (!isCrudeEnglish(rawLog) || (!rawMsg && !rawDecision))) {
      selectedText = rawLog;
    } else if (rawMsg) {
      selectedText = rawMsg;
    } else if (rawDecision) {
      selectedText = rawDecision;
    } else if (st.type) {
      selectedText = `步骤 ${idx + 1}: ${st.type}`;
    } else {
      selectedText = `步骤 #${idx + 1}`;
    }

    // 清理英文调试短语（如仅有英文时）
    if (!hasChinese(selectedText)) {
      selectedText = this.translateEnglishLog(selectedText, st);
    }

    // 统一规范化为 《不同路径》 格式：以 "| " 开头并带 Emoji
    return this.ensureStandardPrefix(selectedText, st);
  }

  private static ensureStandardPrefix(text: string, st: StepLogEntry): string {
    let clean = text.replace(/^\|\s*/, '').trim();

    // 提取或推断语义 Emoji
    const emojiRegex = /^([\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\u2B50\u231A-\u23FA\u200D\uFE0F]+)/;
    const match = clean.match(emojiRegex);
    if (match) {
      return `| ${clean}`;
    }

    // 根据 action / phase / type / 文本推断合适 Emoji
    const action = String(st.action || st.phase || st.type || '').toLowerCase();
    const str = clean.toLowerCase();

    let emoji = '📝';
    if (
      action.includes('enter') ||
      action.includes('init') ||
      action.includes('call') ||
      str.includes('进入') ||
      str.includes('启动') ||
      str.includes('开始') ||
      str.includes('初始化')
    ) {
      emoji = '📥';
    } else if (action.includes('found') || action.includes('match') || str.includes('命中') || str.includes('找到') || str.includes('目标')) {
      emoji = '🎯';
    } else if (action.includes('done') || action.includes('finish') || str.includes('完成') || str.includes('成功') || str.includes('结束')) {
      emoji = '🏆';
    } else if (action.includes('left') || str.includes('左')) {
      emoji = '🌿';
    } else if (action.includes('right') || str.includes('右')) {
      emoji = '🌿';
    } else if (action.includes('backtrack') || action.includes('unwind') || str.includes('回溯') || str.includes('退栈') || str.includes('返回')) {
      emoji = '🔙';
    } else if (action.includes('check') || str.includes('检查') || str.includes('比对') || str.includes('校验') || str.includes('探查')) {
      emoji = '🔍';
    } else if (action.includes('insert') || str.includes('插入') || str.includes('挂载')) {
      emoji = '🌱';
    } else if (action.includes('update') || action.includes('calc') || str.includes('转移') || str.includes('计算') || str.includes('更新')) {
      emoji = '🔄';
    } else if (str.includes('空') || str.includes('越界') || str.includes('阻断') || str.includes('null')) {
      emoji = '🚧';
    }

    return `| ${emoji} ${clean}`;
  }

  private static translateEnglishLog(text: string, _st: StepLogEntry): string {
    // 递归深入
    if (/^recurse\s+left:?\s*(.*)$/i.test(text)) {
      const target = text.replace(/^recurse\s+left:?\s*/i, '');
      return `递归深入左子树 (${target || 'node.left'})`;
    }
    if (/^recurse\s+right:?\s*(.*)$/i.test(text)) {
      const target = text.replace(/^recurse\s+right:?\s*/i, '');
      return `递归深入右子树 (${target || 'node.right'})`;
    }
    // 节点访问/比对
    if (/^(?:visit|check\s*node:?)\s*(.*)$/i.test(text)) {
      const val = text.replace(/^(?:visit|check\s*node:?)\s*/i, '');
      return `检查并比对当前节点 Node(${val})`;
    }
    // 命中目标
    if (/^hit\s*target:?\s*(.*)$/i.test(text)) {
      const val = text.replace(/^hit\s*target:?\s*/i, '');
      return `命中目标节点 (${val})！返回对应子树`;
    }
    // 完成阶段
    if (/^done\s*stage[-_\s]*(\d+)\s*(.*)$/i.test(text)) {
      const match = text.match(/^done\s*stage[-_\s]*(\d+)\s*(.*)$/i);
      const res = match?.[2] ? ` (${match[2]})` : '';
      return `第 ${match?.[1] || ''} 阶段推演完成${res}`;
    }
    if (/^done\s*insert\s*(.*)$/i.test(text)) {
      return `动态插入完成，树结构更新完毕`;
    }
    if (/^return\s*null/i.test(text)) {
      return `到达空节点，返回 null`;
    }
    if (/^root\s*==\s*null/i.test(text)) {
      return `根节点为空，直接返回`;
    }
    if (/^check\s*slot:?\s*(.*)$/i.test(text)) {
      const val = text.replace(/^check\s*slot:?\s*/i, '');
      return `探查可用插槽，当前位置 Node(${val})`;
    }
    return text;
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
    const html = visibleSteps
      .map((st: any, idx: number) => {
        const isCurrent = idx === currentIndex;
        const logMsg = ExecutionLogPresenter.formatLogMessage(st, idx);

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
      })
      .join('');

    const finishLine =
      currentIndex === steps.length - 1
        ? `<div style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 0 4px; color: #94a3b8; font-size: 10.5px; font-family: monospace;"><span>🏁 全部执行完成 (共 ${steps.length} 步)</span></div>`
        : '';

    container.innerHTML = html + finishLine;
    container.scrollTop = container.scrollHeight;
  }
}
