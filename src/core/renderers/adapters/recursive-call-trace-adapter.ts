/**
 * 递归调用跟踪树深度适配器 (RecursiveCallTraceAdapter Deep Module)
 * 职责：
 * 接收纯净的递归调用状态快照 (CallTraceSnapshot)，渲染具有缩进树干线、
 * 判定序号 ①~⑤、命中徽章与高亮平滑滚动的现代暗黑等宽代码/推演视图。
 */

export type CallTraceLineKind =
  | 'header'
  | 'condition-pass'
  | 'condition-skip'
  | 'condition-hit'
  | 'recurse-prep'
  | 'return-leaf'
  | 'unwind-calc'
  | 'final-result';

export interface CallTraceLine {
  id: string;
  depth: number;
  text: string;
  kind: CallTraceLineKind;
  comment?: string;
  formula?: string;
  status?: 'active' | 'done' | 'pending';
}

export interface CallTraceSnapshot {
  lines: CallTraceLine[];
  activeLineId?: string;
  finalResult?: number | string;
}

export interface RecursiveCallTraceOptions {
  title?: string;
  maxHeight?: string;
  showTerminalHeader?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class RecursiveCallTraceAdapter {
  /**
   * 渲染递归调用推演跟踪树
   */
  public static render(
    container: HTMLElement,
    snapshot: CallTraceSnapshot | null,
    options: RecursiveCallTraceOptions = {}
  ): void {
    if (!container) return;

    if (!snapshot || !snapshot.lines || snapshot.lines.length === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 12px; gap: 8px; width: 100%;">
          <div style="font-size: 28px; opacity: 0.8;">🌳</div>
          <div>准备递归推演...</div>
          <div style="font-size: 11px; color: #475569;">点击单步调试或播放，观察调用树实时展开</div>
        </div>
      `;
      return;
    }

    const {
      title = '🌳 递归调用推演跟踪树 (Call Trace)',
      maxHeight = '100%',
      showTerminalHeader = true,
    } = options;

    let linesHtml = '';
    snapshot.lines.forEach((line) => {
      const isActive = line.id === snapshot.activeLineId;

      // 根据深度构造缩进前缀
      let indentGuide = '';
      if (line.depth > 0) {
        // 每层深度 16px 留白或垂直树枝
        indentGuide = `<span style="display: inline-block; width: ${line.depth * 20}px; color: #334155; user-select: none;">${'│ '.repeat(line.depth)}</span>`;
      }

      // 语法色彩与图标
      let textStyle = 'color: #cbd5e1;';
      let icon = '';

      switch (line.kind) {
        case 'header':
          textStyle = 'color: #38bdf8; font-weight: 700;';
          break;
        case 'condition-hit':
          textStyle = 'color: #34d399; font-weight: 600;';
          break;
        case 'condition-skip':
          textStyle = 'color: #64748b;';
          break;
        case 'condition-pass':
          textStyle = 'color: #94a3b8;';
          break;
        case 'recurse-prep':
          textStyle = 'color: #a78bfa; font-weight: 500;';
          break;
        case 'return-leaf':
          textStyle = 'color: #fbbf24; font-weight: 600;';
          break;
        case 'unwind-calc':
          textStyle = 'color: #38bdf8; font-weight: 500;';
          break;
        case 'final-result':
          textStyle = 'color: #10b981; font-weight: 700; font-size: 12px;';
          break;
      }

      const activeClass = isActive ? 'rct-active-line' : '';
      const activeStyle = isActive
        ? 'background: rgba(56, 189, 248, 0.12); border-left: 3px solid #38bdf8; padding-left: 6px;'
        : 'border-left: 3px solid transparent; padding-left: 6px;';

      const commentHtml = line.comment
        ? `<span style="color: #64748b; margin-left: 16px; font-style: italic; font-size: 11px;">${escapeHtml(line.comment)}</span>`
        : '';

      const lineContent = escapeHtml(line.text);

      linesHtml += `
        <div class="rct-line ${activeClass}" id="rct-line-${line.id}" style="display: flex; align-items: baseline; min-height: 22px; padding: 2px 4px; border-radius: 3px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; line-height: 1.5; ${activeStyle}">
          <span style="display: flex; align-items: center; white-space: pre;">${indentGuide}${icon}</span>
          <span style="${textStyle}; white-space: pre-wrap; word-break: break-all;">${lineContent}</span>
          ${commentHtml}
        </div>
      `;
    });

    const headerHtml = showTerminalHeader
      ? `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #090d16; border-bottom: 1px solid #1e293b; user-select: none;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-left: 8px;">${escapeHtml(title)}</span>
          </div>
          <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">${snapshot.lines.length} 帧展开</span>
        </div>
      `
      : '';

    container.innerHTML = `
      <div class="rct-terminal-container" style="display: flex; flex-direction: column; height: 100%; max-height: ${maxHeight}; background: #020617; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
        ${headerHtml}
        <div class="rct-scroll-body" style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px;">
          ${linesHtml}
        </div>
      </div>
    `;

    // 自动平滑滚动高亮行至可见区域
    if (snapshot.activeLineId) {
      const activeEl = container.querySelector(`#rct-line-${snapshot.activeLineId}`) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}
