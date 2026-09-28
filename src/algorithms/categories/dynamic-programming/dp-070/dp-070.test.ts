import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../engine/dp-step-engine';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import { makeEngineBuilder } from '../dp-generated-renderers';
import '../dp-generated-renderers';
import '../../greedy/max-subarray-renderer';

describe('左程云 Class 070: 子数组最大累加和与子矩阵最大累加和专题测试套件', () => {
  describe('1. 最大子数组和 (LeetCode 53 · DP 视角: max-subarray-dp)', () => {
    it('应当在 DpStepEngine 成功注册', () => {
      const spec = DpStepEngine.get('max-subarray-dp');
      expect(spec).toBeDefined();
      expect(spec?.name).toContain('最大子数组和');
    });

    it('应当正确计算常规数组最大子段和', () => {
      const steps = DpStepEngine.generateSteps('max-subarray-dp', {
        nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      const mxVar = lastStep.vars?.find((v) => v.name.includes('maxSum'));
      expect(mxVar?.value).toBe('6');
      expect(lastStep.codeLine).toBeDefined();
    });

    it('通过 makeEngineBuilder 生成步骤并支持参数解析', () => {
      const builder = makeEngineBuilder('max-subarray-dp');
      const steps = builder({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } as any);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].message).toContain('最大子数组和');
    });
  });

  describe('2. 环形子数组的最大和 (LeetCode 918: max-circular-subarray)', () => {
    it('应当在 DpStepEngine 成功注册并拥有元数据与四语言代码', () => {
      const spec = DpStepEngine.get('max-circular-subarray');
      expect(spec).toBeDefined();
      expect(spec?.name).toContain('环形子数组');
      expect(spec?.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec?.code.languages.java.length).toBeGreaterThan(0);
      expect(spec?.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec?.code.languages.python.length).toBeGreaterThan(0);
    });

    it('常规用例计算：不跨越边界情况', () => {
      const steps = DpStepEngine.generateSteps('max-circular-subarray', {
        nums: [1, -2, 3, -2],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(3);
    });

    it('环形跨界用例计算：跨越首尾两端', () => {
      const steps = DpStepEngine.generateSteps('max-circular-subarray', {
        nums: [5, -3, 5],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(10);
    });

    it('全负数极端边界：不可选空数组，直接返回单元素最大负数', () => {
      const steps = DpStepEngine.generateSteps('max-circular-subarray', {
        nums: [-3, -2, -3],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(-2);
    });

    it('通过 makeEngineBuilder 验证步骤结构与 codeLine', () => {
      const builder = makeEngineBuilder('max-circular-subarray');
      const steps = builder({ nums: [1, -2, 3, -2] } as any);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(typeof step.codeLine).toBe('number');
        expect(step.codeLine).toBeGreaterThan(0);
      }
    });
  });

  describe('3. 乘积最大子数组 (LeetCode 152: max-product-subarray)', () => {
    it('应当在 DpStepEngine 成功注册并具备正负双状态描述', () => {
      const spec = DpStepEngine.get('max-product-subarray');
      expect(spec).toBeDefined();
      expect(spec?.name).toContain('乘积最大子数组');
    });

    it('正负数交替与翻转计算正确', () => {
      const steps = DpStepEngine.generateSteps('max-product-subarray', {
        nums: [2, 3, -2, 4],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxProduct).toBe(6);
    });

    it('含有 0 与全负偶数个翻转计算正确', () => {
      const stepsZero = DpStepEngine.generateSteps('max-product-subarray', {
        nums: [-2, 0, -1],
      });
      expect(stepsZero[stepsZero.length - 1].metrics?.maxProduct).toBe(0);

      const stepsEvenNeg = DpStepEngine.generateSteps('max-product-subarray', {
        nums: [-2, 3, -4],
      });
      expect(stepsEvenNeg[stepsEvenNeg.length - 1].metrics?.maxProduct).toBe(24);
    });

    it('通过 makeEngineBuilder 验证步骤结构与 codeLine', () => {
      const builder = makeEngineBuilder('max-product-subarray');
      const steps = builder({ nums: [2, 3, -2, 4] } as any);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(typeof step.codeLine).toBe('number');
        expect(step.codeLine).toBeGreaterThan(0);
      }
    });
  });

  describe('4. 魔法卷轴问题 (Magic Scroll: magic-scroll)', () => {
    it('应当在 DpStepEngine 成功注册', () => {
      const spec = DpStepEngine.get('magic-scroll');
      expect(spec).toBeDefined();
      expect(spec?.name).toContain('魔法卷轴');
    });

    it('正确计算至多两次变零操作的最大收益', () => {
      const steps = DpStepEngine.generateSteps('magic-scroll', {
        nums: [1, -2, 3, 5, -1, 2],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(11);
    });

    it('全负数全变零测试用例', () => {
      const steps = DpStepEngine.generateSteps('magic-scroll', {
        nums: [-5, -2, -3],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(0);
    });

    it('通过 makeEngineBuilder 验证逐分界点高密度步骤与 codeLine', () => {
      const builder = makeEngineBuilder('magic-scroll');
      const steps = builder({ nums: [1, -2, 3, 5, -1, 2] } as any);
      expect(steps.length).toBeGreaterThanOrEqual(5);
      for (const step of steps) {
        expect(typeof step.codeLine).toBe('number');
        expect(step.codeLine).toBeGreaterThan(0);
      }
    });
  });

  describe('5. 双版本长处综合与别名统合验证 (Bi-Version Synthesis)', () => {
    it('贪心版本 max-subarray 正确注册且包含别名', () => {
      const manifest = algorithmRegistry.getManifest('max-subarray');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
      expect(manifest?.aliases).toContain('max-subarray-greedy');
      expect(manifest?.aliases).toContain('kadane-algorithm');
      expect(manifest?.aliases).toContain('leetcode-53');
    });

    it('DP 版本 max-subarray-dp 正确注册且包含别名', () => {
      const manifest = algorithmRegistry.getManifest('max-subarray-dp');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('dynamic-programming');
      expect(manifest?.aliases).toContain('class070-code01');
      expect(manifest?.aliases).toContain('max-subarray-dp-070');
      expect(manifest?.aliases).toContain('leetcode-53-dp');
    });

    it('新扩展算法别名完整配置且单一事实来源无碰撞', () => {
      const circ = algorithmRegistry.getManifest('max-circular-subarray');
      expect(circ).toBeDefined();
      expect(circ?.aliases).toContain('class070-code02');
      expect(circ?.aliases).toContain('max-circular-subarray-070');
      expect(circ?.aliases).toContain('leetcode-918');

      const prod = algorithmRegistry.getManifest('max-product-subarray');
      expect(prod).toBeDefined();
      expect(prod?.aliases).toContain('class070-code03');
      expect(prod?.aliases).toContain('max-product-subarray-070');
      expect(prod?.aliases).toContain('leetcode-152');

      const scroll = algorithmRegistry.getManifest('magic-scroll');
      expect(scroll).toBeDefined();
      expect(scroll?.aliases).toContain('class070-code04');
      expect(scroll?.aliases).toContain('magic-scroll-070');
      expect(scroll?.aliases).toContain('magic-scroll-problem');
    });
  });
});
