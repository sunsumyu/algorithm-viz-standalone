/**
 * 字符串动态规划步进与四大视口元数据测试
 */

import { describe, it, expect } from 'vitest';
import { stringDpSteps } from './dp-generated-renderers';

function createMockRoot(values: Record<string, string>): HTMLElement {
  return {
    querySelector: (sel: string) => {
      const id = sel.replace('#dp-input-', '');
      if (id in values) {
        return { value: values[id] } as HTMLInputElement;
      }
      return null;
    },
  } as unknown as HTMLElement;
}

describe('stringDpSteps - Edit Distance (编辑距离)', () => {
  function getSteps(s: string, t: string) {
    const root = createMockRoot({ s, t });
    return stringDpSteps(root, 'edit-distance');
  }

  it('horse ➔ ros 最终最小编辑距离为 3', () => {
    const steps = getSteps('horse', 'ros');
    const last = steps[steps.length - 1];
    expect(last.metrics?.answer).toBe(3);
    expect(last.metrics?.status).toBe('已完成');
  });

  it('intention ➔ execution 最终最小编辑距离为 5', () => {
    const steps = getSteps('intention', 'execution');
    const last = steps[steps.length - 1];
    expect(last.metrics?.answer).toBe(5);
  });

  it('所有步骤均不生成多余的伪孤立树节点 (tree 为 null)', () => {
    const steps = getSteps('horse', 'ros');
    steps.forEach((st) => {
      expect(st.tree).toBeNull();
    });
  });

  it('预计算 backtrackPath 结构完整且包含有效 stepIndex', () => {
    const steps = getSteps('horse', 'ros');
    const path = steps[0].backtrackPath;
    expect(path).toBeDefined();
    expect(path!.length).toBeGreaterThan(0);

    // 检查每个回溯节点包含坐标与操作描述
    path!.forEach((node) => {
      expect(node.i).toBeGreaterThanOrEqual(0);
      expect(node.j).toBeGreaterThanOrEqual(0);
      expect(['match', 'replace', 'delete', 'insert']).toContain(node.action);
      expect(node.title).toBeDefined();
      expect(node.desc).toBeDefined();
      if (node.stepIndex != null) {
        expect(node.stepIndex).toBeGreaterThanOrEqual(0);
        expect(node.stepIndex).toBeLessThan(steps.length);
      }
    });
  });

  it('执行步骤正确携带 storyMeta 三路分支比对及最优胜出者', () => {
    const steps = getSteps('horse', 'ros');
    const execSteps = steps.filter((st) => st.metrics?.status === '状态转移');
    expect(execSteps.length).toBe(15); // 5 x 3 = 15 单元格

    execSteps.forEach((st) => {
      expect(st.storyMeta).toBeDefined();
      expect(st.storyMeta?.goal).toBeDefined();
      expect(st.storyMeta?.candidates.length).toBe(3);
      const chosen = st.storyMeta?.candidates.filter((c) => c.isChosen);
      expect(chosen?.length).toBe(1);
      expect(st.storyMeta?.conclusion).toBeDefined();
    });
  });

  it('字符相同时公式无冗余 +1 成本，字符不同时包含 3 方向候选依赖', () => {
    const steps = getSteps('horse', 'ros');

    // S[1]='o' 与 T[1]='o' (i=2, j=2)
    const matchStep = steps.find((st) => st.current?.i === 2 && st.current?.j === 2 && st.metrics?.status === '状态转移');
    expect(matchStep).toBeDefined();
    expect(matchStep?.formula).toBe('dp[2][2] = dp[1][1]');
    expect(matchStep?.dependencies).toEqual([{ i: 1, j: 1 }]);
    expect(matchStep?.actionMeta?.type).toBe('match');

    // S[0]='h' 与 T[0]='r' (i=1, j=1) 字符不同
    const diffStep = steps.find((st) => st.current?.i === 1 && st.current?.j === 1 && st.metrics?.status === '状态转移');
    expect(diffStep).toBeDefined();
    expect(diffStep?.formula).toContain('min(dp[0][1], dp[1][0], dp[0][0]) + 1');
    expect(diffStep?.dependencies).toEqual([{ i: 0, j: 1 }, { i: 1, j: 0 }, { i: 0, j: 0 }]);
  });
});

