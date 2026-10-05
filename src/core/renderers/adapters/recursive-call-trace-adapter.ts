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

export type RecursiveCallTraceSnapshot = CallTraceSnapshot;

export interface RecursiveCallTraceOptions {
  title?: string;
  maxHeight?: string;
  showTerminalHeader?: boolean;
  theme?: 'light' | 'dark';
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
   * 渲染递归调用推演跟踪树 (支持优雅浅色 Card 2 模式与暗黑沉浸模式)
   */
  public static render(
    container: HTMLElement,
    snapshot: CallTraceSnapshot | null,
    options: RecursiveCallTraceOptions = {}
  ): void {
    if (!container) return;

    const {
      title = '🌳 递归调用推演跟踪树 (Call Trace)',
      maxHeight = '100%',
      showTerminalHeader = true,
      theme = 'light',
    } = options;

    const isLight = theme === 'light';

    if (!snapshot || !snapshot.lines || snapshot.lines.length === 0) {
      if (isLight) {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; color: #64748b; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; gap: 6px; width: 100%; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px;">
            <div style="font-size: 22px;">🌳</div>
            <div style="font-weight: 600; color: #334155;">准备递归推演...</div>
            <div style="font-size: 10.5px; color: #94a3b8;">单步调试或播放，观察调用树实时展开与回溯归约</div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 12px; gap: 8px; width: 100%;">
            <div style="font-size: 28px; opacity: 0.8;">🌳</div>
            <div>准备递归推演...</div>
            <div style="font-size: 11px; color: #475569;">点击单步调试或播放，观察调用树实时展开</div>
          </div>
        `;
      }
      return;
    }

    let linesHtml = '';
    snapshot.lines.forEach((line) => {
      const isActive = line.id === snapshot.activeLineId;

      // 根据深度构造缩进前缀
      let indentGuide = '';
      if (line.depth > 0) {
        const guideColor = isLight ? '#cbd5e1' : '#334155';
        indentGuide = `<span style="display: inline-block; width: ${line.depth * 20}px; color: ${guideColor}; user-select: none;">${'│ '.repeat(line.depth)}</span>`;
      }

      // 语法色彩
      let textStyle = isLight ? 'color: #334155;' : 'color: #cbd5e1;';

      switch (line.kind) {
        case 'header':
          textStyle = isLight
            ? 'color: #0369a1; font-weight: 700;'
            : 'color: #38bdf8; font-weight: 700;';
          break;
        case 'condition-hit':
          textStyle = isLight
            ? 'color: #15803d; font-weight: 700;'
            : 'color: #34d399; font-weight: 600;';
          break;
        case 'condition-skip':
          textStyle = isLight ? 'color: #94a3b8;' : 'color: #64748b;';
          break;
        case 'condition-pass':
          textStyle = isLight ? 'color: #475569;' : 'color: #94a3b8;';
          break;
        case 'recurse-prep':
          textStyle = isLight
            ? 'color: #7c3aed; font-weight: 600;'
            : 'color: #a78bfa; font-weight: 500;';
          break;
        case 'return-leaf':
          textStyle = isLight
            ? 'color: #b45309; font-weight: 700;'
            : 'color: #fbbf24; font-weight: 600;';
          break;
        case 'unwind-calc':
          textStyle = isLight
            ? 'color: #0284c7; font-weight: 700;'
            : 'color: #38bdf8; font-weight: 500;';
          break;
        case 'final-result':
          textStyle = isLight
            ? 'color: #166534; font-weight: 800; font-size: 12px;'
            : 'color: #10b981; font-weight: 700; font-size: 12px;';
          break;
      }

      const activeClass = isActive ? 'rct-active-line' : '';
      let activeStyle = '';
      if (isActive) {
        activeStyle = isLight
          ? 'background: rgba(37, 99, 235, 0.08); border-left: 3px solid #2563eb; padding-left: 6px;'
          : 'background: rgba(56, 189, 248, 0.12); border-left: 3px solid #38bdf8; padding-left: 6px;';
      } else {
        activeStyle = 'border-left: 3px solid transparent; padding-left: 6px;';
      }

      const commentColor = isLight ? '#94a3b8' : '#64748b';
      const commentHtml = line.comment
        ? `<span style="color: ${commentColor}; margin-left: 12px; font-style: italic; font-size: 11px;">${escapeHtml(line.comment)}</span>`
        : '';

      const lineContent = escapeHtml(line.text);

      linesHtml += `
        <div class="rct-line ${activeClass}" id="rct-line-${line.id}" style="display: flex; align-items: baseline; min-height: 20px; padding: 2px 4px; border-radius: 3px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; line-height: 1.5; ${activeStyle}">
          <span style="display: flex; align-items: center; white-space: pre;">${indentGuide}</span>
          <span style="${textStyle}; white-space: pre-wrap; word-break: break-all;">${lineContent}</span>
          ${commentHtml}
        </div>
      `;
    });

    let headerHtml = '';
    if (showTerminalHeader) {
      if (isLight) {
        headerHtml = `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; user-select: none;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">🧭</span>
              <span style="font-size: 11px; font-weight: 700; color: #334155;">${escapeHtml(title)}</span>
            </div>
            <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', Consolas, monospace; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${snapshot.lines.length} 帧展开</span>
          </div>
        `;
      } else {
        headerHtml = `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #090d16; border-bottom: 1px solid #1e293b; user-select: none;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-left: 8px;">${escapeHtml(title)}</span>
            </div>
            <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">${snapshot.lines.length} 帧展开</span>
          </div>
        `;
      }
    }

    const containerStyle = isLight
      ? `display: flex; flex-direction: column; height: 100%; max-height: ${maxHeight}; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`
      : `display: flex; flex-direction: column; height: 100%; max-height: ${maxHeight}; background: #020617; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);`;

    container.innerHTML = `
      <div class="rct-terminal-container" style="${containerStyle}">
        ${headerHtml}
        <div class="rct-scroll-body" style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; padding: 8px 10px; display: flex; flex-direction: column; gap: 1px;">
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

/**
 * 递归调用树建造者 (RecursiveCallTraceBuilder - Builder Pattern)
 * 职责：
 * 封装递归生命周期的推演行构建、自增 ID 生成、活跃高亮行管理与快照不可变性深拷贝。
 */
export class RecursiveCallTraceBuilder {
  private lines: CallTraceLine[] = [];
  private activeLineId?: string;
  private currentFinalResult?: number | string;
  private counter: number = 0;

  constructor(initialLines: CallTraceLine[] = []) {
    this.lines = initialLines.map((l) => ({ ...l }));
    if (initialLines.length > 0) {
      this.activeLineId = initialLines[initialLines.length - 1].id;
    }
  }

  private nextId(prefix: string): string {
    this.counter += 1;
    return `${prefix}-${this.counter}`;
  }

  /** 添加函数入口/调用头节点 */
  public addHeader(text: string, depth: number, comment?: string, customId?: string): string {
    const id = customId || this.nextId('hdr');
    this.lines.push({ id, depth, text, kind: 'header', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加条件判定通过行 (如: root != null, left != right) */
  public addConditionPass(text: string, depth: number, comment?: string): string {
    const id = this.nextId('pass');
    this.lines.push({ id, depth, text, kind: 'condition-pass', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加条件判定跳过行 */
  public addConditionSkip(text: string, depth: number, comment?: string): string {
    const id = this.nextId('skip');
    this.lines.push({ id, depth, text, kind: 'condition-skip', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加条件命中基底/特判分支行 (如: null == null √ 命中) */
  public addConditionHit(text: string, depth: number, comment?: string): string {
    const id = this.nextId('hit');
    this.lines.push({ id, depth, text, kind: 'condition-hit', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加递归子调用前序准备/发起行 (如: outside = check(...)) */
  public addRecursePrep(text: string, depth: number, comment?: string): string {
    const id = this.nextId('prep');
    this.lines.push({ id, depth, text, kind: 'recurse-prep', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加叶子/基底返回值行 */
  public addReturnLeaf(text: string, depth: number, comment?: string): string {
    const id = this.nextId('ret');
    this.lines.push({ id, depth, text, kind: 'return-leaf', comment });
    this.activeLineId = id;
    return id;
  }

  /** 添加后序归约计算行 (如: return 1 + max(l, r), return outside && inside) */
  public addUnwindCalc(text: string, depth: number, comment?: string, formula?: string): string {
    const id = this.nextId('calc');
    this.lines.push({ id, depth, text, kind: 'unwind-calc', comment, formula });
    this.activeLineId = id;
    return id;
  }

  /** 添加最终结算行 */
  public addFinalResult(text: string, depth: number, comment?: string, finalResult?: number | string): string {
    const id = this.nextId('final');
    this.lines.push({ id, depth, text, kind: 'final-result', comment });
    this.activeLineId = id;
    if (finalResult !== undefined) {
      this.currentFinalResult = finalResult;
    }
    return id;
  }

  /** 添加底层原始行 */
  public addLine(line: CallTraceLine): string {
    this.lines.push({ ...line });
    this.activeLineId = line.id;
    return line.id;
  }

  /** 设置当前活跃高亮行 ID */
  public setActiveLineId(id?: string): this {
    this.activeLineId = id;
    return this;
  }

  /** 设置最终推演结果值 */
  public setFinalResult(res?: number | string): this {
    this.currentFinalResult = res;
    return this;
  }

  /** 产生不可变的快照副本 (Snapshot) */
  public snapshot(activeLineId?: string, finalResult?: number | string): CallTraceSnapshot {
    return {
      lines: this.lines.map((l) => ({ ...l })),
      activeLineId: activeLineId !== undefined ? activeLineId : this.activeLineId,
      finalResult: finalResult !== undefined ? finalResult : this.currentFinalResult,
    };
  }

  /** 获取当前已记录的推演总行数 */
  public get length(): number {
    return this.lines.length;
  }
}

