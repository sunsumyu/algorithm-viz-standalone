import { describe, it, expect } from 'vitest';
import { assignCookiesSteps } from './assign-cookies-renderer';
import { lemonadeSteps } from './lemonade-renderer';

describe('Greedy Algorithms Step Generation (贪心核心算法推导测试)', () => {
  describe('Assign Cookies (分发饼干 LeetCode 455)', () => {
    it('1. g=[1,2,3], s=[1,1] 只能满足 1 个孩子 (胃口 1)', () => {
      const steps = assignCookiesSteps([1, 2, 3], [1, 1]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done');
      expect(lastStep.satisfiedCount).toBe(1);
    });

    it('2. g=[1,2], s=[1,2,3] 可以满足全部 2 个孩子', () => {
      const steps = assignCookiesSteps([1, 2], [1, 2, 3]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.satisfiedCount).toBe(2);
    });
  });

  describe('Lemonade Change (柠檬水找零 LeetCode 860)', () => {
    it('3. 账单 [5, 5, 5, 10, 20] 可以成功全部找零返回 success=true', () => {
      const steps = lemonadeSteps([5, 5, 5, 10, 20]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done');
      expect(lastStep.success).toBe(true);
    });

    it('4. 账单 [5, 5, 10, 10, 20] 找零失败返回 success=false', () => {
      const steps = lemonadeSteps([5, 5, 10, 10, 20]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('fail');
      expect(lastStep.success).toBe(false);
    });

    it('5. 空账单边界安全返回 true', () => {
      const steps = lemonadeSteps([]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.success).toBe(true);
    });
  });
});
