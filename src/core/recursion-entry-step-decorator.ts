/**
 * 进入递归装饰器 (RecursionEntryStepDecorator) — 核心深模块
 *
 * 与 ReturnStepDecorator 对称的「发起递归调用压栈帧」判定与视觉装饰事实来源，供两条渲染路径共用：
 *   1. 声明式主路径：CodeLineRenderer.highlightLineInternal (dark-code-terminal)
 *   2. 旧路径：RightPanelTabCoordinator.updateCodeHighlight (visualizer-theme)
 *
 * 职责：
 *   - isRecursionEntryStep：分层判定当前步是否为「深入递归调用」压栈下行帧
 *     （显式 focusMode ➔ 规范 action/phase/type ➔ 文本兜底），与 ReturnStepDecorator 严格互斥
 *     （返回帧优先，压栈帧绝不同时挂 ↩ 与 ↘ 双徽章）；
 *   - applyRecursionEntryBadge：向活跃代码行注入 ↘ 进入递归徽章（置于行号与代码文本之间）；
 *   - clearRecursionEntryBadges：清除容器内全部进入徽章与 call-line 标记，杜绝跨步残留。
 *
 * 判定信号来源（与 StepNormalizationEngine.synthesizeReturnUnwindFrames 的合成结构对齐）：
 *   - USNE 拆分合成：focusMode === 'recursive-call' 的「聚焦递归调用」步；
 *   - 规范 action：recurse-left / recurse-right / call-left / call-right（-arrive 到达步不算进入）。
 */
import { ReturnStepDecorator } from './return-step-decorator';

export class RecursionEntryStepDecorator {
  /** 规范 action 压栈信号：recurse/call × left/right，负向断言排除 -arrive 到达步 */
  private static readonly ENTRY_SIGNAL_REGEX = /(?:recurse|call)-(left|right)(?!-arrive)|recursive-call|call-enter|压栈/i;

  /** 到达步否定守卫：「到达语句/准备发起」是前置到达帧，严禁触发文本兜底 */
  private static readonly ENTRY_NEGATION_REGEX = /(到达|准备|即将|暂不|尚未|不会|跳过|而非)/;

  /**
   * 判定当前步是否为「深入递归调用」压栈下行帧（唯一事实来源）
   *
   * 分层判定：
   *   0. 互斥守卫：返回帧（ReturnStepDecorator 判定为真）严禁再判为进入帧；
   *   1. 显式标记：step.focusMode === 'recursive-call' / step.focusTarget === '@recursive-call'
   *      / step.isCall === true / step.flowPhase === 'call'；
   *   2. 规范信号：action/phase/type 命中 recurse-left|recurse-right|call-left|call-right
   *      （负向断言排除 -arrive 到达步）与 recursive-call / 压栈；
   *   3. 文本兜底：message/decision/log 按标点切分子句后，存在「含 进入子调用/深入子树/发起递归调用
   *      且无到达否定词」的子句。
   */
  public static isRecursionEntryStep(step?: unknown): boolean {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, any>;

    // 0. 与返回帧严格互斥：返回帧优先（单一事实来源 ReturnStepDecorator），压栈帧绝不双徽章
    if (ReturnStepDecorator.isReturnStep(s)) return false;

    if (s.focusMode === 'recursive-call' || s.focusTarget === '@recursive-call') return true;
    if (s.isCall === true || s.flowPhase === 'call') return true;

    const signalText = `${s.action || ''} ${s.phase || ''} ${s.type || ''}`;
    if (this.ENTRY_SIGNAL_REGEX.test(signalText)) return true;

    const bodyText = `${s.message || ''} ${s.decision || ''} ${s.log || ''}`;
    const clauses = bodyText.split(/[，。；,;!！？\n]/);
    return clauses.some((clause) => {
      const hasEntrySignal =
        clause.includes('进入子调用') ||
        clause.includes('压栈') ||
        /深入.{0,6}子树/.test(clause) ||
        /发起.{0,8}递归调用/.test(clause);
      return hasEntrySignal && !this.ENTRY_NEGATION_REGEX.test(clause);
    });
  }

  /**
   * 向活跃代码行注入 ↘ 进入递归徽章（幂等）
   * 徽章优先插在代码文本 span 之前（即行号与代码之间）；无文本子元素时兜底 prepend（旧路径兼容）。
   */
  public static applyRecursionEntryBadge(lineEl: HTMLElement | null | undefined): void {
    if (!lineEl) return;
    if (typeof lineEl.querySelector === 'function' && lineEl.querySelector('.code-recursion-entry-icon')) return;

    const icon = typeof document !== 'undefined' ? document.createElement('span') : null;
    if (!icon) return;
    icon.className = 'code-recursion-entry-icon';
    icon.textContent = '↘';
    icon.title = '发起递归调用 · 压栈深入子调用';

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
   * 清除容器内全部进入徽章与 call-line 标记（跨步残留防护）
   */
  public static clearRecursionEntryBadges(container?: Element | null): void {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    container.querySelectorAll('.code-recursion-entry-icon').forEach((el) => {
      if (typeof el.remove === 'function') el.remove();
      else if (el.parentElement) el.parentElement.removeChild(el);
    });
    container.querySelectorAll('.call-line').forEach((el) => {
      if (typeof el.classList?.remove === 'function') el.classList.remove('call-line');
    });
  }
}
