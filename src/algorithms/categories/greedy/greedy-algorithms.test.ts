import { describe, it, expect } from 'vitest';
import { assignCookiesSteps } from './assign-cookies-renderer';
import { buildLemonadeSteps } from './lemonade-renderer';
import { buildGasStationSteps } from './gas-station-renderer';
import { buildCandySteps } from './candy-renderer';
import { buildReconstructQueueSteps } from './reconstruct-queue-renderer';
import { buildMonotoneDigitsSteps } from './monotone-digits-renderer';
import { buildTreeCameraSteps, parseTreeFromArray } from './tree-cameras-renderer';

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
      const steps = buildLemonadeSteps([5, 5, 5, 10, 20]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.success).toBe(true);
    });

    it('4. 账单 [5, 5, 10, 10, 20] 找零失败返回 success=false', () => {
      const steps = buildLemonadeSteps([5, 5, 10, 10, 20]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('fail');
      expect(lastStep.success).toBe(false);
    });

    it('5. 空账单边界安全返回 true', () => {
      const steps = buildLemonadeSteps([]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.success).toBe(true);
    });
  });

  describe('Gas Station (加油站 LeetCode 134)', () => {
    it('6. gas=[1,2,3,4,5], cost=[3,4,5,1,2] 应返回起点下标 3', () => {
      const steps = buildGasStationSteps([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('success');
      expect(lastStep.startStation).toBe(3);
    });

    it('7. 全局亏空 gas=[2,3,4], cost=[3,4,3] 返回 -1', () => {
      const steps = buildGasStationSteps([2, 3, 4], [3, 4, 3]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('failed');
      expect(lastStep.startStation).toBe(-1);
    });
  });

  describe('Candy (分发糖果 LeetCode 135)', () => {
    it('8. ratings=[1,0,2] 最少糖果总数为 5', () => {
      const steps = buildCandySteps([1, 0, 2]);
      const lastStep = steps[steps.length - 1];
      const sum = lastStep.candies.reduce((a, b) => a + b, 0);
      expect(sum).toBe(5);
    });

    it('9. ratings=[1,2,2] 最少糖果总数为 4', () => {
      const steps = buildCandySteps([1, 2, 2]);
      const lastStep = steps[steps.length - 1];
      const sum = lastStep.candies.reduce((a, b) => a + b, 0);
      expect(sum).toBe(4);
    });
  });

  describe('Queue Reconstruction (根据身高重建队列 LeetCode 406)', () => {
    it('10. 能够根据 [h, k] 排序并插空还原队列', () => {
      const people: Array<[number, number]> = [
        [7, 0],
        [4, 4],
        [7, 1],
        [5, 0],
        [6, 1],
        [5, 2],
      ];
      const steps = buildReconstructQueueSteps(people);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.queue).toEqual([
        [5, 0],
        [7, 0],
        [5, 2],
        [6, 1],
        [4, 4],
        [7, 1],
      ]);
    });
  });

  describe('Monotone Increasing Digits (单调递增的数字 LeetCode 738)', () => {
    it('11. 332 应借位并置9返回 299', () => {
      const steps = buildMonotoneDigitsSteps(332);
      const lastStep = steps[steps.length - 1];
      expect(parseInt(lastStep.digits.join(''), 10)).toBe(299);
    });

    it('12. 1234 已经是单调递增返回 1234', () => {
      const steps = buildMonotoneDigitsSteps(1234);
      const lastStep = steps[steps.length - 1];
      expect(parseInt(lastStep.digits.join(''), 10)).toBe(1234);
    });
  });

  describe('Binary Tree Cameras (监控二叉树 LeetCode 968)', () => {
    it('13. [0,0,null,0,0] 最少需要 1 台摄像头', () => {
      const tree = parseTreeFromArray([0, 0, null, 0, 0]);
      const steps = buildTreeCameraSteps(tree);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.cameraCount).toBe(1);
    });

    it('14. [0,0,null,0,null,0,null,null,1] 最少需要 2 台摄像头', () => {
      const tree = parseTreeFromArray([0, 0, null, 0, null, 0, null, null, 1]);
      const steps = buildTreeCameraSteps(tree);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.cameraCount).toBe(2);
    });
  });
});
