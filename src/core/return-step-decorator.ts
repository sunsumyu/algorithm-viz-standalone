/**
 * 返回帧装饰器 (ReturnStepDecorator) — 核心深模块
 *
 * 全库唯一的「递归/回溯返回帧」判定与视觉装饰事实来源，供两条渲染路径共用：
 *   1. 声明式主路径：CodeLineRenderer.highlightLineInternal (dark-code-terminal)
 *   2. 旧路径：RightPanelTabCoordinator.updateCodeHighlight (visualizer-theme)
 *
 * 职责：
 *   - isReturnStep：分层判定当前步是否为返回帧（显式标记 ➔ 规范 action/phase/type ➔ 文本兜底），
 *     判定信号与 StepNormalizationEngine.synthesizeReturnUnwindFrames 的合成启发式完全一致；
 *   - applyReturnBadge：向活跃代码行注入 ↩ 返回徽章（置于行号与代码文本之间）；
 *   - clearReturnBadges：清除容器内全部返回徽章与 return-line 标记，杜绝跨步残留。
 */
export class ReturnStepDecorator {
  /** 规范 action/phase/type 返回信号（覆盖 USNE 合成帧 return-unwind / recurse-return 与旧路径 branch-return / combine 等既有信号） */
  private static readonly RETURN_SIGNAL_REGEX = /return|unwind|backtrack|done|combine/i;

  /** 子句级否定守卫：描述「不返回 / 跳过返回」语义的子句严禁触发文本兜底（如 判空未命中「跳过基底返回」） */
  private static readonly RETURN_NEGATION_REGEX = /(跳过|未命中|无需|暂不|尚未|不必|不会|避免|而非|取消)/;

  /**
   * 判定当前步是否为递归/回溯返回帧（唯一事实来源）
   *
   * 分层判定：
   *   0. 调用帧排除：focusMode === 'recursive-call' 为「发起递归调用」压栈帧（即使行文含 return 源码文本）
   *   1. 显式标记：step.isReturn === true / step.flowPhase === 'backtrack'
   *   2. 规范信号：action/phase/type 命中 return|unwind|backtrack|done|combine
   *      （branch-return、left-done、right-done、return-unwind、recurse-return 全覆盖）
   *   3. 文本兜底：message/decision/log 按标点切分子句后，存在同时满足
   *      「含 返回/return 且无否定词」的子句（与 StepNormalizationEngine 的 isCurReturn 启发式同源，精度更高）
   */
  public static isReturnStep(step?: unknown): boolean {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, any>;

    if (s.isReturn === true) return true;
    if (s.flowPhase === 'backtrack') return true;

    // 0. 「聚焦递归调用」是压栈下行帧，严禁因行文内嵌 return 源码文本而误判为返回帧
    if (s.focusMode === 'recursive-call' || s.focusTarget === '@recursive-call') return false;

    const signalText = `${s.action || ''} ${s.phase || ''} ${s.type || ''}`;
    if (this.RETURN_SIGNAL_REGEX.test(signalText)) return true;

    const bodyText = `${s.message || ''} ${s.decision || ''} ${s.log || ''}`;
    const clauses = bodyText.split(/[，。；,;!！？\n]/);
    return clauses.some((clause) => {
      const hasReturnSignal = clause.includes('返回') || clause.toLowerCase().includes('return');
      return hasReturnSignal && !this.RETURN_NEGATION_REGEX.test(clause);
    });
  }

  /**
   * 向活跃代码行注入 ↩ 返回徽章（幂等）
   * 徽章优先插在代码文本 span 之前（即行号与代码之间）；无文本子元素时兜底 prepend（旧路径兼容）。
   */
  public static applyReturnBadge(lineEl: HTMLElement | null | undefined): void {
    if (!lineEl) return;
    if (typeof lineEl.querySelector === 'function' && lineEl.querySelector('.code-return-icon')) return;

    const icon = typeof document !== 'undefined' ? document.createElement('span') : null;
    if (!icon) return;
    icon.className = 'code-return-icon';
    icon.textContent = '↩';
    icon.title = '递归返回至此行并完成求值';

    const textEl =
      typeof lineEl.querySelector === 'function'
        ? lineEl.querySelector('.algo-code-line-text') || lineEl.querySelector('.code-line-text')
        : null;
    if (textEl && typeof lineEl.insertBefore === 'function' && textEl.parentElement === lineEl) {
      lineEl.insertBefore(icon, textEl);
    } else if (typeof lineEl.prepend === 'function') {
      lineEl.prepend(icon);
    } else if (typeof lineEl.appendChild === 'function') {
      lineEl.appendChild(icon);
    }
  }

  /**
   * 清除容器内全部返回徽章与 return-line 标记（跨步残留防护）
   */
  public static clearReturnBadges(container?: Element | null): void {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    container.querySelectorAll('.code-return-icon').forEach((el) => {
      if (typeof el.remove === 'function') el.remove();
      else if (el.parentElement) el.parentElement.removeChild(el);
    });
    container.querySelectorAll('.return-line').forEach((el) => {
      if (typeof el.classList?.remove === 'function') el.classList.remove('return-line');
    });
  }
}
