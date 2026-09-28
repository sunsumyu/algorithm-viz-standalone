import { describe, it, expect } from 'vitest';
import { buildFoodChain060Steps } from './food-chain-060-renderer';
import { buildLoudAndRich060Steps } from './loud-and-rich-060-renderer';
import { buildParallelCourses060Steps } from './parallel-courses-iii-060-renderer';
import { buildMaxEmployees060Steps } from './max-employees-meeting-060-renderer';
import { buildStampingSequence060Steps } from './stamping-sequence-060-renderer';
import { buildLargestColorValue060Steps } from './largest-color-value-060-renderer';

describe('左程云算法通关课 Class 060: 拓扑排序扩展专题测试套件', () => {
  // 1. Code01: 最大食物链计数 (洛谷 P4017)
  describe('Code01: 最大食物链计数 (洛谷 P4017 · DAG 路径动态规划)', () => {
    it('在 5 种生物经典生态网中正确统计完整食物链总数', () => {
      const steps = buildFoodChain060Steps('classic_ecosystem');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      // 1->2->4->5 (1), 1->3->4->5 (1), 1->2->5 (1) -> total = 3
      expect(last.total).toBe(3);
      expect(last.statusBadge?.text).toBe('计算完成');
      expect(steps.every((s) => s.codeLine !== undefined)).toBe(true);
    });

    it('在多生产者水生生态网中正常累加各生产链路', () => {
      const steps = buildFoodChain060Steps('multi_producer');
      const last = steps[steps.length - 1];
      expect(last.total).toBe(2);
    });
  });

  // 2. Code02: 喧闹和富有 (LeetCode 851)
  describe('Code02: 喧闹和富有 (LeetCode 851 · 拓扑最值传递)', () => {
    it('在 5 人富裕关系网络中正确传播祖先最安静值', () => {
      const steps = buildLoudAndRich060Steps('classic_5people');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      // quiet = [3, 2, 5, 1, 4]
      // 0: quiet 3, ans[0] = 0
      // 1: quiet 2 < 3, ans[1] = 1
      // 3: quiet 1 < 2, ans[3] = 3
      // 4: 继承 2(ans 1, quiet 2) 和 3(ans 3, quiet 1) -> ans[4] = 3
      expect(last.ans[0]).toBe(0);
      expect(last.ans[1]).toBe(1);
      expect(last.ans[3]).toBe(3);
      expect(last.ans[4]).toBe(3);
    });

    it('在单向线性富裕链条中逐级单调传递', () => {
      const steps = buildLoudAndRich060Steps('linear_chain');
      const last = steps[steps.length - 1];
      // quiet: [4, 1, 6, 2], chain 0->1->2->3
      expect(last.ans[1]).toBe(1);
      expect(last.ans[2]).toBe(1);
      expect(last.ans[3]).toBe(1);
    });
  });

  // 3. Code03: 并行课程 III (LeetCode 2050)
  describe('Code03: 并行课程 III (LeetCode 2050 · DAG 关键路径 CPM)', () => {
    it('在 5 门课程依赖图中准确求解汇聚瓶颈关键路径', () => {
      const steps = buildParallelCourses060Steps('classic_5courses');
      expect(steps.length).toBeGreaterThan(5);
      const last = steps[steps.length - 1];
      // C1: 3
      // C2: 3 + 2 = 5
      // C3: 3 + 5 = 8
      // C4: max(5, 8) + 2 = 10
      // C5: 10 + 4 = 14
      expect(last.total).toBe(14);
      expect(last.cost[5]).toBe(14);
    });

    it('在 4 门课程菱形并行图中取耗时较长分支', () => {
      const steps = buildParallelCourses060Steps('diamond_4courses');
      const last = steps[steps.length - 1];
      // time: [2, 3, 4, 1]
      // C1: 2
      // C2: 2 + 3 = 5
      // C3: 2 + 4 = 6
      // C4: max(5, 6) + 1 = 7
      expect(last.total).toBe(7);
    });
  });

  // 4. Code04: 参加会议的最多员工数 (LeetCode 2127)
  describe('Code04: 参加会议的最多员工数 (LeetCode 2127 · 内向基环树拓扑分解)', () => {
    it('在包含二元互偶环与外挂链的基环树中正确累加所有二元对', () => {
      const steps = buildMaxEmployees060Steps('mixed_rings');
      expect(steps.length).toBeGreaterThan(5);
      const last = steps[steps.length - 1];
      // favorite: [1, 2, 1, 2, 5, 4]
      // 0->1, 3->2
      // ring 1<->2 (size 2), 0 hangs on 1 (depth 1), 3 hangs on 2 (depth 1) -> 2 + 1 + 1 = 4
      // ring 4<->5 (size 2), no arms -> 2 + 0 + 0 = 2
      // total sumTwoRing = 4 + 2 = 6
      expect(last.sumTwoRing).toBe(6);
      expect(last.finalAns).toBe(6);
    });

    it('在独立 3 节点大环图中大环独立取胜', () => {
      const steps = buildMaxEmployees060Steps('big_ring_3');
      const last = steps[steps.length - 1];
      // 0->1->2->0 (size 3), 3->0
      expect(last.maxRing).toBe(3);
      expect(last.finalAns).toBe(3);
    });
  });

  // 5. Code05: 戳印序列 (LeetCode 936)
  describe('Code05: 戳印序列 (LeetCode 936 · 逆向拓扑排序)', () => {
    it('在经典用例中成功解构并产出合法的正向戳印序列', () => {
      const steps = buildStampingSequence060Steps('classic_ababc');
      expect(steps.length).toBeGreaterThan(3);
      const last = steps[steps.length - 1];
      expect(last.isSuccess).toBe(true);
      expect(last.path.length).toBe(3); // n - m + 1 = 5 - 3 + 1 = 3
    });

    it('在嵌套字符用例中成功完成通配符扩散', () => {
      const steps = buildStampingSequence060Steps('nested_aabc');
      const last = steps[steps.length - 1];
      expect(last.isSuccess).toBe(true);
    });
  });

  // 6. Code06: 有向图中的最长颜色路径 (LeetCode 1857)
  describe('Code06: 有向图中的最长颜色路径 (LeetCode 1857 · 26 维拓扑动态规划)', () => {
    it('在标准 DAG 中正确统计单颜色最长频次 3', () => {
      const steps = buildLargestColorValue060Steps('dag_colors');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      expect(last.hasCycle).toBe(false);
      expect(last.ans).toBe(3); // 'a' at 0, 2, 4 -> 3
    });

    it('在含有向环图中拓扑中断并准确拦截返回 -1', () => {
      const steps = buildLargestColorValue060Steps('cycle_colors');
      const last = steps[steps.length - 1];
      expect(last.hasCycle).toBe(true);
      expect(last.ans).toBe(-1);
      expect(last.statusBadge?.type).toBe('danger');
    });
  });
});
