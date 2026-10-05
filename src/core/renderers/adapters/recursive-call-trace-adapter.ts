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
   * 渲染递归调用推演跟踪树 (高雅层次化树形分支拓扑 - Figure 1 黄金范式)
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

    // ==========================================
    // 1. 构建调用树拓扑栈与帧索引 (Tree Topology Resolver)
    // ==========================================
    interface CallFrameInfo {
      frameId: string;
      headerLineIndex: number;
      depth: number;
      parentFrameIndex: number | null;
      childFrameIndices: number[];
      isLastChild: boolean;
    }

    const frames: CallFrameInfo[] = [];
    const frameStack: number[] = [];
    const lineToFrameIndex: number[] = [];

    for (let i = 0; i < snapshot.lines.length; i++) {
      const line = snapshot.lines[i];
      if (line.kind === 'header') {
        while (frameStack.length > 0 && frames[frameStack[frameStack.length - 1]].depth >= line.depth) {
          frameStack.pop();
        }
        const parentFrameIndex = frameStack.length > 0 ? frameStack[frameStack.length - 1] : null;
        const newFrameIndex = frames.length;
        const frame: CallFrameInfo = {
          frameId: line.id,
          headerLineIndex: i,
          depth: line.depth,
          parentFrameIndex,
          childFrameIndices: [],
          isLastChild: true,
        };
        if (parentFrameIndex !== null) {
          frames[parentFrameIndex].childFrameIndices.push(newFrameIndex);
        }
        frames.push(frame);
        frameStack.push(newFrameIndex);
        lineToFrameIndex.push(newFrameIndex);
      } else {
        let matchedFrameIndex = frameStack.length > 0 ? frameStack[frameStack.length - 1] : 0;
        for (let s = frameStack.length - 1; s >= 0; s--) {
          if (frames[frameStack[s]].depth === line.depth) {
            matchedFrameIndex = frameStack[s];
            break;
          }
        }
        lineToFrameIndex.push(matchedFrameIndex);
      }
    }

    // 判定每个帧在其父级作用域内是否为末位子节点 (isLastChild)
    for (let f = 0; f < frames.length; f++) {
      const frame = frames[f];
      if (frame.parentFrameIndex !== null) {
        const parent = frames[frame.parentFrameIndex];
        const siblings = parent.childFrameIndices;
        const posInSiblings = siblings.indexOf(f);
        if (posInSiblings >= 0 && posInSiblings < siblings.length - 1) {
          frame.isLastChild = false;
        } else {
          // 若当前为已知最后一个兄弟，检查是否显式为左孩子/第一分支
          const headerLine = snapshot.lines[frame.headerLineIndex];
          const commentOrText = `${headerLine.comment || ''} ${headerLine.text}`;
          const isExplicitLeft = /左|left|first|①|前序/i.test(commentOrText) && !/右|right|second|后/i.test(commentOrText);
          frame.isLastChild = !isExplicitLeft;
        }
      }
    }

    // 获取特定帧在各深度的祖先帧映射
    function getAncestorsByDepth(frameIndex: number, maxDepth: number): (CallFrameInfo | null)[] {
      const res: (CallFrameInfo | null)[] = new Array(maxDepth).fill(null);
      let cur: CallFrameInfo | null = frames[frameIndex] || null;
      while (cur !== null) {
        if (cur.depth < maxDepth && !res[cur.depth]) {
          res[cur.depth] = cur;
        }
        cur = cur.parentFrameIndex !== null ? frames[cur.parentFrameIndex] : null;
      }
      return res;
    }

    // 构建各祖先层级的纵向导轨前缀
    function buildAncestorGuide(ancestors: (CallFrameInfo | null)[], endDepth: number): string {
      let res = '';
      for (let d = 0; d < endDepth; d++) {
        const childAtNext = ancestors[d + 1];
        if (childAtNext && !childAtNext.isLastChild) {
          res += '│   ';
        } else {
          res += '    ';
        }
      }
      return res;
    }

    // 调色盘配置
    const trunkColor = isLight ? '#cbd5e1' : '#334155';
    const branchColor = isLight ? '#0284c7' : '#38bdf8';
    const bulletColor = isLight ? '#2563eb' : '#60a5fa';
    const commentColor = isLight ? '#64748b' : '#94a3b8';

    // ==========================================
    // 2. 逐行编译树状导轨、分支连线与徽章装饰
    // ==========================================
    let bodyHtml = '';

    for (let i = 0; i < snapshot.lines.length; i++) {
      const line = snapshot.lines[i];
      const isActive = line.id === snapshot.activeLineId;
      const frameIndex = lineToFrameIndex[i];
      const curFrame = frames[frameIndex];
      const depth = line.depth;
      const ancestors = getAncestorsByDepth(frameIndex, depth + 1);

      // --- 检查是否需要在当前行之前插入纵向连通空导轨 (Spacer) ---
      if (i > 0) {
        const prevLine = snapshot.lines[i - 1];
        let spacerTrunk: string | null = null;

        // 场景 A: 上一行是 header，本行是同层帧内检查 -> 开启本帧树干
        if (prevLine.kind === 'header' && line.kind !== 'header' && line.depth === prevLine.depth) {
          const ancestorGuide = buildAncestorGuide(ancestors, depth);
          spacerTrunk = `${ancestorGuide}│`;
        }
        // 场景 B: 上一行是帧内检查，本行是子调用 header -> 保持父级纵向树干
        else if (prevLine.kind !== 'header' && line.kind === 'header' && line.depth > prevLine.depth) {
          const prevAncestors = getAncestorsByDepth(lineToFrameIndex[i - 1], prevLine.depth + 1);
          const ancestorGuide = buildAncestorGuide(prevAncestors, prevLine.depth);
          spacerTrunk = `${ancestorGuide}│`;
        }
        // 场景 C: 上一行是帧内检查，本行是 return-leaf -> 叶子收拢前导轨
        else if (prevLine.kind !== 'header' && prevLine.kind !== 'return-leaf' && line.kind === 'return-leaf') {
          const ancestorGuide = buildAncestorGuide(ancestors, depth);
          spacerTrunk = `${ancestorGuide}│`;
        }
        // 场景 D: 上一行是回溯/返回，本行是同级或父级后继 sibling header
        else if ((prevLine.kind === 'unwind-calc' || prevLine.kind === 'return-leaf') && line.kind === 'header') {
          const parentDepth = Math.max(0, line.depth - 1);
          const parentAncestors = getAncestorsByDepth(lineToFrameIndex[i], parentDepth + 1);
          const ancestorGuide = buildAncestorGuide(parentAncestors, parentDepth);
          spacerTrunk = `${ancestorGuide}│`;
        }
        // 场景 E: 上一行是最后一个子调用的回溯，本行回到根节点最终归约
        else if (prevLine.kind === 'unwind-calc' && line.depth === 0 && prevLine.depth > 0) {
          spacerTrunk = '';
        }

        if (spacerTrunk !== null) {
          bodyHtml += `
            <div class="rct-spacer" style="display: flex; align-items: center; min-height: 12px; padding: 0 6px; user-select: none;">
              <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; color: ${trunkColor}; white-space: pre;">${escapeHtml(spacerTrunk)}</span>
            </div>
          `;
        }
      }

      // --- 构建当前行的导轨前缀与连接符 ---
      let guidePrefix = '';
      let branchConnector = '';
      let bulletHtml = '';

      if (depth === 0) {
        if (line.kind === 'header' || line.kind === 'final-result' || line.kind === 'unwind-calc') {
          guidePrefix = '';
        } else {
          guidePrefix = '│  ';
          bulletHtml = `<span style="color: ${bulletColor}; font-weight: 700; margin-right: 6px; user-select: none;">•</span>`;
        }
      } else {
        const ancestorPrefix = buildAncestorGuide(ancestors, depth - 1);

        if (line.kind === 'header') {
          branchConnector = curFrame && curFrame.isLastChild ? '└── ' : '├── ';
          guidePrefix = ancestorPrefix;
        } else if (line.kind === 'return-leaf') {
          const parentTrunk = ancestors[depth] && !ancestors[depth]!.isLastChild ? '│   ' : '    ';
          guidePrefix = ancestorPrefix + parentTrunk;
          branchConnector = '└── ';
        } else if (line.kind === 'unwind-calc') {
          guidePrefix = ancestorPrefix + '│   ';
        } else {
          // 帧内条件判定与准备步
          const parentTrunk = ancestors[depth] && !ancestors[depth]!.isLastChild ? '│   ' : '    ';
          guidePrefix = ancestorPrefix + parentTrunk + '│  ';
          bulletHtml = `<span style="color: ${bulletColor}; font-weight: 700; margin-right: 6px; user-select: none;">•</span>`;
        }
      }

      // 文本与语义色彩
      let textStyle = isLight ? 'color: #334155;' : 'color: #cbd5e1;';
      let badgesHtml = '';

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
          // 蓝色三连胶囊指示器 [---][---][---]
          badgesHtml = `
            <span style="display: inline-flex; align-items: center; gap: 2px; margin-left: 8px; vertical-align: middle;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 800; line-height: 1;">-</span>
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 800; line-height: 1;">-</span>
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 800; line-height: 1;">-</span>
            </span>
          `;
          break;
        case 'unwind-calc':
          textStyle = isLight
            ? 'color: #0284c7; font-weight: 600;'
            : 'color: #38bdf8; font-weight: 500;';
          if (line.text.includes('返回 2') || line.text.includes('return 2')) {
            badgesHtml = `
              <span style="display: inline-flex; align-items: center; gap: 2px; margin-left: 8px; vertical-align: middle;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 800; line-height: 1;">-</span>
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 800; line-height: 1;">-</span>
              </span>
            `;
          }
          break;
        case 'final-result':
          textStyle = isLight
            ? 'color: #166534; font-weight: 800; font-size: 12px;'
            : 'color: #10b981; font-weight: 700; font-size: 12px;';
          badgesHtml = `
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 3px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; margin-left: 8px; vertical-align: middle;">✓</span>
          `;
          break;
      }

      // 高亮背景与左侧指示条
      const activeClass = isActive ? 'rct-active-line' : '';
      let activeStyle = 'border-left: 3px solid transparent; padding-left: 6px;';
      if (isActive) {
        activeStyle = isLight
          ? 'background: #eff6ff; border-left: 3px solid #2563eb; padding-left: 6px; font-weight: 600;'
          : 'background: rgba(56, 189, 248, 0.12); border-left: 3px solid #38bdf8; padding-left: 6px; font-weight: 600;';
      }

      // 右侧注释对齐 (保留原始内容供测试断言)
      const commentHtml = line.comment
        ? `<span class="rct-comment" style="color: ${commentColor}; margin-left: auto; padding-left: 20px; font-style: italic; font-size: 11px; white-space: nowrap; user-select: none;">${escapeHtml(line.comment)}</span>`
        : '';

      const lineContent = escapeHtml(line.text);

      bodyHtml += `
        <div class="rct-line ${activeClass}" id="rct-line-${line.id}" style="display: flex; align-items: baseline; min-height: 22px; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; line-height: 1.5; ${activeStyle}">
          <span style="display: inline-flex; align-items: baseline; white-space: pre; user-select: none;">
            <span style="color: ${trunkColor}; font-weight: 600;">${escapeHtml(guidePrefix)}</span>
            <span style="color: ${branchColor}; font-weight: 700;">${escapeHtml(branchConnector)}</span>
            ${bulletHtml}
          </span>
          <span style="${textStyle}; white-space: pre-wrap; word-break: break-all;">${lineContent}</span>
          ${badgesHtml}
          ${commentHtml}
        </div>
      `;
    }

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
          ${bodyHtml}
        </div>
      </div>
    `;

    // 自动平滑滚动高亮行至可见区域
    if (snapshot.activeLineId) {
      const activeEl = container.querySelector(`#rct-line-${snapshot.activeLineId}`) as HTMLElement | null;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
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

  /** 添加回溯撤销与栈恢复行 (语义归约至 unwind-calc) */
  public addBacktrack(text: string, depth: number, comment?: string): string {
    return this.addUnwindCalc(text, depth, comment);
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

