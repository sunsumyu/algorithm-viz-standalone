/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RecursionEntryStepDecorator } from './recursion-entry-step-decorator';
import { ReturnStepDecorator } from './return-step-decorator';

describe('RecursionEntryStepDecorator 进入递归帧判定与徽章契约', () => {
  describe('isRecursionEntryStep 分层判定', () => {
    it('USNE 合成的 focusMode recursive-call 聚焦步判为进入帧', () => {
      expect(
        RecursionEntryStepDecorator.isRecursionEntryStep({
          focusMode: 'recursive-call',
          decision: '发起右子树递归调用 (聚焦递归调用)',
          message: '🎯 高亮块移动至行内递归函数调用，压栈进入右子树子调用。',
        })
      ).toBe(true);
    });

    it('规范 action recurse/call × left/right 判为进入帧，-arrive 到达步排除', () => {
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'recurse-left' })).toBe(true);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'recurse-right' })).toBe(true);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'call-left' })).toBe(true);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'call-right' })).toBe(true);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'recurse-left-arrive' })).toBe(false);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ action: 'call-right-arrive' })).toBe(false);
    });

    it('文本兜底：压栈/深入子树/发起递归调用 判真，到达否定子句判假', () => {
      expect(
        RecursionEntryStepDecorator.isRecursionEntryStep({ message: '深入右子树递归求值，进入子调用。' })
      ).toBe(true);
      // 到达步：准备发起 ≠ 进入，严禁误判
      expect(
        RecursionEntryStepDecorator.isRecursionEntryStep({
          decision: '到达右子树判断语句：准备求值内部递归调用',
          message: '执行流到达当前语句行，准备发起右子树递归调用。',
        })
      ).toBe(false);
    });

    it('与返回帧严格互斥：返回帧绝不再挂 ↘ 徽章', () => {
      const returnStep = {
        action: 'return-unwind',
        message: '子调用返回，接收返回值并恢复父现场。',
      };
      expect(ReturnStepDecorator.isReturnStep(returnStep)).toBe(true);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep(returnStep)).toBe(false);
    });

    it('空步与返回语义步安全判假', () => {
      expect(RecursionEntryStepDecorator.isRecursionEntryStep(undefined)).toBe(false);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep(null)).toBe(false);
      expect(RecursionEntryStepDecorator.isRecursionEntryStep({ message: '返回构建好的平衡子树。' })).toBe(false);
    });
  });

  describe('applyRecursionEntryBadge / clearRecursionEntryBadges', () => {
    let lineEl: HTMLElement;

    beforeEach(() => {
      document.body.innerHTML = '';
      lineEl = document.createElement('div');
      lineEl.className = 'code-line active active-line';
      const text = document.createElement('span');
      text.className = 'algo-code-line-text';
      text.textContent = 'root.right = trimBST(root.right, low, high);';
      lineEl.appendChild(text);
      document.body.appendChild(lineEl);
    });

    it('徽章插入行号与代码文本之间，幂等不重复', () => {
      RecursionEntryStepDecorator.applyRecursionEntryBadge(lineEl);
      const icon = lineEl.querySelector('.code-recursion-entry-icon') as HTMLElement;
      expect(icon).not.toBeNull();
      expect(icon.textContent).toBe('↘');
      expect(lineEl.firstChild).toBe(icon);

      RecursionEntryStepDecorator.applyRecursionEntryBadge(lineEl);
      expect(lineEl.querySelectorAll('.code-recursion-entry-icon').length).toBe(1);
    });

    it('清除后容器零残留', () => {
      RecursionEntryStepDecorator.applyRecursionEntryBadge(lineEl);
      lineEl.classList.add('call-line');
      RecursionEntryStepDecorator.clearRecursionEntryBadges(lineEl.parentElement);
      expect(lineEl.querySelector('.code-recursion-entry-icon')).toBeNull();
      expect(lineEl.classList.contains('call-line')).toBe(false);
    });
  });
});
