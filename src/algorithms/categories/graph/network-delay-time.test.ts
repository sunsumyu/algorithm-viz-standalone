import { describe, it, expect } from 'vitest';
import {
  NetworkDelayTimeVisualizer,
  buildNetworkDelaySteps,
  buildNetworkDelayPrunedSteps,
} from './network-delay-time-renderer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PRUNED_CODE_LANGUAGES,
} from './network-delay-time-problem-content';
import { DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES } from './dijkstra-index-heap-problem-content';
import { buildIndexHeapSteps } from './dijkstra-index-heap-step-compiler';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';
import { VariableContextResolver } from '../../../core/variable-context-resolver';

describe('NetworkDelayTime (LeetCode 743)', () => {
  it('should instantiate NetworkDelayTimeVisualizer properly', () => {
    const viz = new NetworkDelayTimeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for reachable case', () => {
    const steps = buildNetworkDelaySteps(true);
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: NETWORK_DELAY_CODE_LANGUAGES,
    });
    for (const step of steps) {
      expect(step.distList).toBeDefined();
      expect(step.visitedList).toBeDefined();
      expect(step.pqSnapshot).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isAllReached).toBe(true);
    expect(lastStep.maxDelaySoFar).toBe(2);
  });

  it('should generate at least 20 granular steps for unreachable case', () => {
    const steps = buildNetworkDelaySteps(false);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = NETWORK_DELAY_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine =
        typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
          ? (step.codeLine as any).java
          : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isAllReached).toBe(false);
    expect(lastStep.maxDelaySoFar).toBe(-1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(NETWORK_DELAY_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/networkdelaytime|network_delay_time/i, /dist/i, /visited/i, /pq|priority_queue|heap/i],
    });
  });

  it('should maintain activeSlot on distance[i] during updateMax scan', () => {
    const steps = buildNetworkDelaySteps(true);
    const updateMaxSteps = steps.filter((s) => s.status === 'check' && s.message.includes('刷新最大延迟'));
    expect(updateMaxSteps.length).toBeGreaterThan(0);
    for (const s of updateMaxSteps) {
      expect(s.activeArray).toBe('dist');
      expect(typeof s.activeSlot).toBe('number');
      expect(s.activeSlot).toBeGreaterThan(0);
    }
  });

  it('should generate at least 20 granular steps for Stage 2 distance pruning (reachable)', () => {
    const steps = buildNetworkDelayPrunedSteps(true);
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: NETWORK_DELAY_PRUNED_CODE_LANGUAGES,
    });
    for (const step of steps) {
      expect(step.distList).toBeDefined();
      expect(step.pqSnapshot).toBeDefined();
    }
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isAllReached).toBe(true);
    expect(lastStep.maxDelaySoFar).toBe(2);
  });

  it('should generate at least 20 granular steps for Stage 2 distance pruning (unreachable)', () => {
    const steps = buildNetworkDelayPrunedSteps(false);
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: NETWORK_DELAY_PRUNED_CODE_LANGUAGES,
    });
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isAllReached).toBe(false);
    expect(lastStep.maxDelaySoFar).toBe(-1);
  });

  it('should have complete code across all languages for Stage 2 distance pruning', () => {
    assertMultiLanguageCodeContract(NETWORK_DELAY_PRUNED_CODE_LANGUAGES, {
      minLines: 30,
      requiredPatterns: [/networkdelaytime|network_delay_time/i, /distance/i, /pq|priority_queue|heap/i],
    });
  });

  it('should generate at least 20 granular steps for Stage 3 index heap', () => {
    const steps = buildIndexHeapSteps('classic_4node');
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
    });
    for (const step of steps) {
      expect(step.whereArray).toBeDefined();
      expect(step.distanceArray).toBeDefined();
      expect(step.heapArray).toBeDefined();
    }
    const decreaseSteps = steps.filter((s) => s.status === 'decrease');
    expect(decreaseSteps.length).toBeGreaterThan(0);
  });

  it('should capture d and distance correctly during pruning and relaxation steps', () => {
    const steps = buildNetworkDelayPrunedSteps(true);
    const pruningSteps = steps.filter((s) => s.message.includes('距离剪枝') || s.message.includes('最短路确认锁定'));
    expect(pruningSteps.length).toBeGreaterThan(0);

    for (const step of pruningSteps) {
      expect(step.d).toBeDefined();
      expect(typeof step.d).toBe('number');
      const varsMap = VariableContextResolver.resolve(step, 'java');
      const resolvedD = VariableContextResolver.getVariable(varsMap, 'd', step);
      expect(resolvedD).toBeDefined();
      expect(resolvedD?.value).toBe(String(step.d));
      expect(resolvedD?.detail).toBeDefined();
      expect(resolvedD?.detail).toContain('延迟');
    }
  });

  it('should provide clear business semantic descriptions (detail) for core variables', () => {
    const steps = buildNetworkDelayPrunedSteps(true);
    const step = steps[2]; // after initSrc, distance[k] = 0
    const varsMap = VariableContextResolver.resolve(step, 'java');

    const resolvedK = VariableContextResolver.getVariable(varsMap, 'k', step);
    expect(resolvedK).toBeDefined();
    expect(resolvedK?.value).toBe('2');
    expect(resolvedK?.detail).toBe('信号广播源点 (起始发射节点)');

    const resolvedDistance = VariableContextResolver.getVariable(varsMap, 'distance', step);
    expect(resolvedDistance).toBeDefined();
    expect(resolvedDistance?.detail).toContain('最短');

    const resolvedN = VariableContextResolver.getVariable(varsMap, 'n', step);
    expect(resolvedN).toBeDefined();
    expect(resolvedN?.detail).toContain('网络节点总数');
  });

  it('should explicitly trigger d > distance[u] continue pruning branch in shortcut_prune case', () => {
    const steps = buildNetworkDelayPrunedSteps('shortcut_prune');
    const skippedSteps = steps.filter((s) => s.message.includes('距离剪枝跳过') || s.log.includes('skip stale'));
    expect(skippedSteps.length).toBeGreaterThan(0);

    const pruneStep = skippedSteps[0];
    expect(pruneStep.d).toBeDefined();
    expect(pruneStep.curNode).toBeDefined();
    // d > distance[u] 严格成立
    expect(pruneStep.d!).toBeGreaterThan(pruneStep.distList[pruneStep.curNode]);
    expect((pruneStep.codeLine as any).java).toBe(28); // if (d > distance[u]) continue;
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(NetworkDelayTimeVisualizer, {
      algorithmId: 'network-delay-time',
      viewId: 'algo-network-delay-time-view',
    });
  });
});
