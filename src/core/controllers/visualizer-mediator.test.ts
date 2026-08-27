import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VisualizerMediator } from './visualizer-mediator';
import { AlgorithmModelRepository } from '../model-repository';
import type { IVisualRenderer } from '../renderers/visual-renderer';
import { eventHub } from './visualizer-event-hub';

describe('VisualizerMediator (Deep Module) Full Lifecycle Guard', () => {
  beforeEach(() => {
    // 确保默认模型库已就绪
    expect(AlgorithmModelRepository.hasModel('unique-paths')).toBe(true);
  });

  it('1. 初始化时自动加载默认模型并推导执行步骤', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });
    const state = mediator.getState();

    expect(state.modelId).toBe('unique-paths');
    expect(state.stage).toBe('stage-1');
    expect(state.stageNum).toBe(1);
    expect(state.direction).toBe('forward');
    expect(state.steps.length).toBeGreaterThan(0);
    expect(state.currentStepIndex).toBe(0);
    expect(mediator.getCurrentStep()).toBeDefined();

    mediator.dispose();
  });

  it('2. 切换阶段 (setStage) 能够自动重新推导 steps 并重置时间轴', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });
    const s1StepsCount = mediator.getState().steps.length;

    // 切换到阶段 3 (二维 DP 填表)
    mediator.setStage(3);
    const s3State = mediator.getState();
    expect(s3State.stage).toBe('stage-3');
    expect(s3State.stageNum).toBe(3);
    expect(s3State.currentStepIndex).toBe(0);
    expect(s3State.steps.length).toBeGreaterThan(0);
    // 阶段 3 步骤与阶段 1 步骤序列特征不同
    expect(s3State.steps[s3State.steps.length - 1].type).toBe('return');

    mediator.dispose();
  });

  it('3. 切换方向 (setDirection) 能够自适应调整顺推与逆推步骤', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });
    mediator.setStage(3);
    const forwardLast = mediator.getState().steps[mediator.getState().steps.length - 1];

    mediator.setDirection('reverse');
    expect(mediator.getState().direction).toBe('reverse');
    const reverseSteps = mediator.getState().steps;
    expect(reverseSteps.length).toBeGreaterThan(0);

    mediator.dispose();
  });

  it('4. 动态调整尺寸 (setDimensions) 能够自动重算步骤并触发更新广播', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });
    mediator.setStage(3);

    const listener = vi.fn();
    mediator.onStateChange(listener);

    mediator.setDimensions(4, 5);
    expect(mediator.getState().m).toBe(4);
    expect(mediator.getState().n).toBe(5);
    expect(listener).toHaveBeenCalled();

    mediator.dispose();
  });

  it('5. 时间轴步进 (nextStep / prevStep / seekStep) 能够协调派发渲染器与广播', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });
    const mockRenderer: IVisualRenderer = {
      id: 'mock-test-renderer',
      mount: vi.fn(),
      updateStep: vi.fn(),
      dispose: vi.fn()
    };

    mediator.registerRenderer(mockRenderer);
    expect(mockRenderer.updateStep).toHaveBeenCalled();

    // 步进
    mediator.nextStep();
    expect(mediator.getState().currentStepIndex).toBe(1);
    expect(mockRenderer.updateStep).toHaveBeenCalledTimes(2);

    // 跳转
    mediator.seekStep(5);
    expect(mediator.getState().currentStepIndex).toBe(5);

    // 后退
    mediator.prevStep();
    expect(mediator.getState().currentStepIndex).toBe(4);

    mediator.dispose();
    expect(mockRenderer.dispose).toHaveBeenCalled();
  });

  it('6. 播放与速度控制 (play / pause / togglePlay / setSpeed)', () => {
    const mediator = new VisualizerMediator({ modelId: 'unique-paths' });

    mediator.setSpeed(2);
    expect(mediator.getState().speed).toBe(2);

    mediator.play();
    expect(mediator.getTimeline().getIsPlaying()).toBe(true);

    mediator.pause();
    expect(mediator.getTimeline().getIsPlaying()).toBe(false);

    mediator.togglePlay();
    expect(mediator.getTimeline().getIsPlaying()).toBe(true);

    mediator.dispose();
  });

  it('7. 切换不同题型模型 (loadModel) 自适应提取非网格参数', () => {
    const mediator = new VisualizerMediator();

    // 加载斐波那契数
    mediator.loadModel('fibonacci');
    expect(mediator.getState().modelId).toBe('fibonacci');
    expect(mediator.getState().steps.length).toBeGreaterThan(0);

    // 加载编辑距离
    mediator.loadModel('edit-distance');
    expect(mediator.getState().modelId).toBe('edit-distance');
    expect(mediator.getState().m).toBeGreaterThan(0);
    expect(mediator.getState().n).toBeGreaterThan(0);

    mediator.dispose();
  });

  it('8. 发布-订阅模式 (EventHub) 能够准确捕获阶段切换与模型切换事件', () => {
    const mediator = new VisualizerMediator();
    const switchSpy = vi.fn();
    const stageSpy = vi.fn();

    const u1 = eventHub.on('algorithm:switch', switchSpy);
    const u2 = eventHub.on('stage:change', stageSpy);

    mediator.loadModel('fibonacci');
    expect(switchSpy).toHaveBeenCalled();

    mediator.setStage(3);
    expect(stageSpy).toHaveBeenCalledWith({
      stage: 3,
      isMemo: false,
      direction: 'forward'
    });

    u1();
    u2();
    mediator.dispose();
  });
});
