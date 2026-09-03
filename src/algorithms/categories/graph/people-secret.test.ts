import { describe, it, expect } from 'vitest';
import {
  PeopleSecretVisualizer,
  buildSecretExpertSteps,
} from './people-secret-renderer';
import { PEOPLE_SECRET_CODE_LANGUAGES } from './people-secret-problem-content';

describe('FindAllPeopleWithSecret (LeetCode 2092)', () => {
  it('should instantiate PeopleSecretVisualizer properly', () => {
    const viz = new PeopleSecretVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6expert preset', () => {
    const steps = buildSecretExpertSteps('classic_6expert');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PEOPLE_SECRET_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
        ? (step.codeLine as any).java
        : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-secret-time']).toBeDefined();
      expect(step.metrics?.['metric-known-count']).toBeDefined();
      expect(step.metrics?.['metric-cur-meeting']).toBeDefined();
      expect(step.metrics?.['metric-secret-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.knownExperts).toEqual([0, 1, 2, 3]);
    expect(lastStep.knownExperts.includes(4)).toBe(false);
    expect(lastStep.knownExperts.includes(5)).toBe(false);
  });

  it('should generate at least 20 granular steps for multitime_5expert preset', () => {
    const steps = buildSecretExpertSteps('multitime_5expert');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PEOPLE_SECRET_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
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
    expect(lastStep.knownExperts).toEqual([0, 1, 2, 3, 4]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = PEOPLE_SECRET_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/findallpeople|find_all_people/i);
      expect(joined).toMatch(/parent|father/i);
      expect(joined).toMatch(/find/i);
      expect(joined).toMatch(/union|unite/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PeopleSecretVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'people-secret',
      viewId: 'algo-people-secret-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
