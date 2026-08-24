import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from './model-repository';

describe('AlgorithmModelRepository Deep Module', () => {
  it('应该成功预加载并获取 unique-paths 算法模型', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths');
    expect(model).toBeDefined();
    expect(model.id).toBe('unique-paths');
    expect(model.name).toBe('不同路径');
    expect(model.defaultStage).toBe('stage-1');
    expect(model.defaultParams).toEqual({ m: 3, n: 4 });
  });

  it('应该成功预加载并获取 unique-paths-ii (不同路径 II) 算法模型', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    expect(model).toBeDefined();
    expect(model.id).toBe('unique-paths-ii');
    expect(model.name).toBe('不同路径 II');
    expect(model.defaultStage).toBe('stage-1');
    expect(model.icon).toBe('🚧');
  });

  it('应该成功预加载并获取 min-path-sum (最小路径和) 算法模型', () => {
    const model = AlgorithmModelRepository.getModel('min-path-sum');
    expect(model).toBeDefined();
    expect(model.id).toBe('min-path-sum');
    expect(model.name).toBe('最小路径和');
    expect(model.defaultStage).toBe('stage-1');
    expect(model.icon).toBe('📉');
  });

  it('应该成功预加载并获取 fibonacci (斐波那契数) 与 climb-stairs (爬楼梯) 算法模型', () => {
    const fib = AlgorithmModelRepository.getModel('fibonacci');
    expect(fib).toBeDefined();
    expect(fib.name).toBe('斐波那契数');
    expect(fib.stages['stage-1']).toBeDefined();

    const climb = AlgorithmModelRepository.getModel('climb-stairs');
    expect(climb).toBeDefined();
    expect(climb.name).toBe('爬楼梯');
  });

  it('应该成功预加载并获取 knapsack-01 (0-1 背包问题) 算法模型', () => {
    const knapsack = AlgorithmModelRepository.getModel('01-knapsack');
    expect(knapsack).toBeDefined();
    expect(knapsack.name).toBe('0-1 背包问题');
    expect(knapsack.stages['stage-4']).toBeDefined();
    const stage4Name = typeof knapsack.stages['stage-4'].name === 'string'
      ? knapsack.stages['stage-4'].name
      : knapsack.stages['stage-4'].name.forward;
    expect(stage4Name).toContain('一维空间压缩');
  });

  it('应该能获取所有注册的模型 ID 列表', () => {
    const ids = AlgorithmModelRepository.getAllIds();
    expect(ids).toContain('unique-paths');
    expect(ids).toContain('unique-paths-ii');
    expect(ids).toContain('min-path-sum');
    expect(ids).toContain('fibonacci');
    expect(ids).toContain('climb-stairs');
    expect(ids).toContain('01-knapsack');
    expect(ids).toContain('knapsack-01');
  });

  it('查询不存在的模型时抛出明确异常', () => {
    expect(() => AlgorithmModelRepository.getModel('non-existent-algo')).toThrow(
      /未找到算法模型: non-existent-algo/
    );
  });

  it('应该正确编译阶段 1 (递归) 的顺推与逆推视图配置', () => {
    const stage1Forward = AlgorithmModelRepository.getCompiledStage('unique-paths', 'stage-1', 'forward');
    expect(stage1Forward.name).toContain('阶段 1');
    expect(stage1Forward.variants).toBeDefined();
    expect(stage1Forward.variants?.boundary).toBeDefined();
    expect(stage1Forward.variants?.terminal).toBeDefined();
    expect(stage1Forward.variants?.boundary.anchorMap.boundary).toBeDefined();

    const stage1Reverse = AlgorithmModelRepository.getCompiledStage('unique-paths', 'stage-1', 'reverse');
    expect(stage1Reverse.name).toContain('阶段 1');
  });

  it('应该正确编译阶段 3 (二维DP) 与阶段 4 (一维优化)', () => {
    const stage3 = AlgorithmModelRepository.getCompiledStage('unique-paths', 'stage-3', 'forward');
    expect(stage3.variants?.if).toBeDefined();
    expect(stage3.variants?.for).toBeDefined();
    expect(stage3.variants?.if.codeHtml).toContain('dp');

    const stage4 = AlgorithmModelRepository.getCompiledStage('unique-paths', 'stage-4', 'forward');
    expect(stage4.variants?.if).toBeDefined();
    expect(stage4.variants?.for).toBeDefined();
  });

  it('支持动态注册新模型', () => {
    const customModel: any = {
      id: 'custom-demo',
      name: '自定义测试题目',
      defaultStage: 'stage-1',
      directions: { forward: { label: '正向' } },
      stages: {
        'stage-1': {
          name: '阶段 1',
          desc: '测试阶段',
          card2Title: '测试卡片',
          card2Desc: '测试描述',
          code: {
            forward: {
              title: 'Demo.java',
              source: 'public void test() {} // @step:entry'
            }
          }
        }
      }
    };
    AlgorithmModelRepository.register('custom-demo', customModel);
    expect(AlgorithmModelRepository.hasModel('custom-demo')).toBe(true);
    const compiled = AlgorithmModelRepository.getCompiledStage('custom-demo', 'stage-1', 'forward');
    expect(compiled.name).toBe('阶段 1');
    expect(compiled.anchorMap?.entry).toBe(1);
  });
});
