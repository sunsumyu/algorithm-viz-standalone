import { describe, it, expect } from 'vitest';
import {
  VisualizerStateRouter,
  VisualizerCaretaker,
  VisualizerMemento,
  type VisualizerState
} from './state-router';

describe('VisualizerStateRouter (Deep Module) Pure State Machine Guard', () => {
  it('1. 正确将可视化状态对象序列化为 URL Hash', () => {
    const state: VisualizerState = {
      algo: 'unique-paths-ii',
      stage: 'stage-3',
      dir: 'reverse',
      variant: 'for',
      theme: 'dracula',
      m: 4,
      n: 5,
      step: 12
    };

    const hash = VisualizerStateRouter.serialize(state);
    expect(hash).toContain('algo=unique-paths-ii');
    expect(hash).toContain('stage=stage-3');
    expect(hash).toContain('dir=reverse');
    expect(hash).toContain('variant=for');
    expect(hash).toContain('theme=dracula');
    expect(hash).toContain('m=4');
    expect(hash).toContain('n=5');
    expect(hash).toContain('step=12');
  });

  it('2. 正确从 URL Hash 字符串中反序列化并解析状态', () => {
    const rawHash = '#algo=min-path-sum&stage=stage-2&dir=forward&m=3&n=4&step=5&theme=nord';
    const parsed = VisualizerStateRouter.parseHash(rawHash);

    expect(parsed).toEqual({
      algo: 'min-path-sum',
      stage: 'stage-2',
      dir: 'forward',
      m: 3,
      n: 4,
      step: 5,
      theme: 'nord'
    });
  });

  it('3. 处理空 Hash 或非法 Hash 字符串', () => {
    expect(VisualizerStateRouter.parseHash('')).toBeNull();
    expect(VisualizerStateRouter.parseHash('#')).toBeNull();
    expect(VisualizerStateRouter.parseHash('#invalid-format-without-equals')).toBeNull();
  });

  it('4. 正确合并状态 (mergeState)', () => {
    const base: VisualizerState = {
      algo: 'unique-paths',
      stage: 'stage-1',
      dir: 'forward',
      m: 3,
      n: 4,
      step: 0,
      theme: 'default'
    };

    const merged = VisualizerStateRouter.mergeState(base, {
      stage: 'stage-4',
      dir: 'reverse',
      step: 8
    });

    expect(merged.algo).toBe('unique-paths');
    expect(merged.stage).toBe('stage-4');
    expect(merged.dir).toBe('reverse');
    expect(merged.m).toBe(3);
    expect(merged.n).toBe(4);
    expect(merged.step).toBe(8);
  });

  it('5. 备忘录模式 (Memento Pattern) 快照创建与历史管理器正确运转', () => {
    const caretaker = new VisualizerCaretaker(3);
    const state1: VisualizerState = {
      algo: 'fibonacci',
      stage: 'stage-1',
      dir: 'forward',
      m: 1,
      n: 1,
      step: 0
    };
    const state2: VisualizerState = {
      algo: 'fibonacci',
      stage: 'stage-3',
      dir: 'forward',
      m: 1,
      n: 1,
      step: 5
    };

    const m1 = caretaker.save(state1, '初始状态');
    const m2 = caretaker.save(state2, '完成状态');

    expect(caretaker.getHistory().length).toBe(2);
    expect(caretaker.getLatest()?.title).toBe('完成状态');
    expect(caretaker.getById(m1.id)?.state.step).toBe(0);
    expect(caretaker.getById(m2.id)?.state.step).toBe(5);

    // 测试快照不可变性
    expect(Object.isFrozen(m1.state)).toBe(true);

    // 测试容量限制
    caretaker.save({ ...state2, step: 6 });
    caretaker.save({ ...state2, step: 7 });
    expect(caretaker.getHistory().length).toBe(3);
    expect(caretaker.getHistory()[0].state.step).toBe(5);
  });
});
