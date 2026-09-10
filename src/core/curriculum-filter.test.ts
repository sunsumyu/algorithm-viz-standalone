import { describe, it, expect } from 'vitest';
import {
  isZuoCourseAlgorithm,
  extractZuoCourseTag,
  getCourseStats,
  filterAlgorithmsByCourse,
} from './curriculum-filter';
import { ALL_ALGORITHM_METADATA } from './algorithm-manifests-meta';

describe('课程归属与筛选领域服务 (curriculum-filter) 测试套件', () => {
  it('1. 正确识别左神算法通关课特征', () => {
    // 经典博弈 095
    expect(isZuoCourseAlgorithm({ id: 'bash-game-095', name: '巴什博弈' })).toBe(true);
    // 数论 097
    expect(isZuoCourseAlgorithm({ id: 'small-prime-097', category: 'math' })).toBe(true);
    // 位运算神技
    expect(isZuoCourseAlgorithm({ id: 'bit-tricks', category: 'bit' })).toBe(true);
    // 背包 073
    expect(
      isZuoCourseAlgorithm({
        id: 'knapsack-01-standard',
        description: '左程云算法通关课 Class 073 Code01：洛谷 P1048 采药',
      })
    ).toBe(true);
    // 贪心 089
    expect(
      isZuoCourseAlgorithm({
        id: 'largest-number',
        description: '左程云算法讲解089 Code01：LeetCode 179 最大数',
      })
    ).toBe(true);

    // 普通随想录题库
    expect(isZuoCourseAlgorithm({ id: 'two-sum', name: '两数之和', description: '经典哈希查找' })).toBe(false);
    expect(isZuoCourseAlgorithm({ id: 'climb-stairs', name: '爬楼梯', description: '简单动态规划' })).toBe(false);
  });

  it('2. 正确提取课号标签', () => {
    expect(extractZuoCourseTag({ id: 'bash-game-095', description: '博弈论' })).toBe('第95课');
    expect(
      extractZuoCourseTag({
        id: 'knapsack-01-standard',
        description: '左程云算法通关课 Class 073 Code01',
      })
    ).toBe('第73课');
    expect(extractZuoCourseTag({ id: 'bit-tricks', description: '位运算' })).toBe('第030课');
    expect(extractZuoCourseTag({ id: 'two-sum', description: '哈希表' })).toBeNull();
  });

  it('3. 全量题库分类统计与过滤验证', () => {
    const stats = getCourseStats(ALL_ALGORITHM_METADATA);
    expect(stats.total).toBe(ALL_ALGORITHM_METADATA.length);
    expect(stats.zuo).toBeGreaterThanOrEqual(100);
    expect(stats.standard).toBeGreaterThanOrEqual(200);
    expect(stats.zuo + stats.standard).toBe(stats.total);

    const zuoOnly = filterAlgorithmsByCourse(ALL_ALGORITHM_METADATA, 'zuo');
    expect(zuoOnly.length).toBe(stats.zuo);
    for (const a of zuoOnly) {
      expect(isZuoCourseAlgorithm(a)).toBe(true);
    }

    const standardOnly = filterAlgorithmsByCourse(ALL_ALGORITHM_METADATA, 'standard');
    expect(standardOnly.length).toBe(stats.standard);
    for (const a of standardOnly) {
      expect(isZuoCourseAlgorithm(a)).toBe(false);
    }
  });

  it('4. 统计必备篇 (Class 001~099) 与必学篇 (Class 100~200) 分布', () => {
    const classMap = new Map<number, string[]>();
    for (const a of ALL_ALGORITHM_METADATA) {
      if (!isZuoCourseAlgorithm(a)) continue;
      const tag = extractZuoCourseTag(a);
      if (tag) {
        const m = tag.match(/第(\d+)课/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!classMap.has(num)) classMap.set(num, []);
          classMap.get(num)!.push(a.id);
        }
      }
    }
    const allCoveredClasses = Array.from(classMap.keys()).sort((a, b) => a - b);
    const below100 = allCoveredClasses.filter((c) => c < 100);
    const above100 = allCoveredClasses.filter((c) => c >= 100);
    expect(below100.length).toBeGreaterThanOrEqual(30);
    expect(above100.length).toBeGreaterThanOrEqual(80);
  });
});

