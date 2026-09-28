import { describe, it, expect } from 'vitest';
import { buildSmallPrimeSteps } from './small-prime-renderer';
import { buildMillerRabinSteps } from './large-prime-renderer';
import { buildPrimeFactorsSteps } from './prime-factors-renderer';
import { buildEulerSieveSteps } from './ehrlich-euler-sieve-renderer';
import {
  SMALL_PRIME_CODES,
  LARGE_PRIME_CODES,
  PRIME_FACTORS_CODES,
  EHRLICH_EULER_CODES,
} from './math-097-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|接收|准备)/);

  for (const step of steps) {
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, 'Step must have codeLine').toBeDefined();
    for (const [lang, line] of Object.entries(lineMap)) {
      const codeArray = codes[lang];
      expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }
}

describe('左渗透数论专题一 (math-097) 自动化测试套件', () => {
  it('1. 试除法判素数 (Small Prime)', () => {
    // 97 为质数
    const steps97 = buildSmallPrimeSteps(97);
    verifyLineMap(steps97, SMALL_PRIME_CODES);
    expect(steps97[steps97.length - 1].isResultPrime).toBe(true);

    // 100 为合数
    const steps100 = buildSmallPrimeSteps(100);
    verifyLineMap(steps100, SMALL_PRIME_CODES);
    expect(steps100[steps100.length - 1].isResultPrime).toBe(false);
  });

  it('2. Miller-Rabin 大素数测试 (Large Prime)', () => {
    // 1000000007 为质数
    const stepsPrime = buildMillerRabinSteps(1000000007);
    verifyLineMap(stepsPrime, LARGE_PRIME_CODES);
    expect(stepsPrime[stepsPrime.length - 1].isResultPrime).toBe(true);

    // 1000000005 为合数
    const stepsComp = buildMillerRabinSteps(1000000005);
    verifyLineMap(stepsComp, LARGE_PRIME_CODES);
    expect(stepsComp[stepsComp.length - 1].isResultPrime).toBe(false);
  });

  it('3. 质因子分解 (Prime Factors)', () => {
    // 360 = 2^3 * 3^2 * 5^1
    const steps = buildPrimeFactorsSteps(360);
    verifyLineMap(steps, PRIME_FACTORS_CODES);
    const last = steps[steps.length - 1];
    expect(last.factors).toEqual([
      { prime: 2, power: 3 },
      { prime: 3, power: 2 },
      { prime: 5, power: 1 },
    ]);
  });

  it('4. 欧拉线性筛 (Euler Sieve)', () => {
    // 30 以内质数有 10 个
    const steps = buildEulerSieveSteps(30);
    verifyLineMap(steps, EHRLICH_EULER_CODES);
    const last = steps[steps.length - 1];
    expect(last.primesFound).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it('5. Class 097 质数与因数分解专题 注册中心与别名统合门禁', async () => {
    const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
    await import('../../../batch-6-index');

    const expectedMappings = [
      {
        id: 'small-prime-097',
        aliases: ['class097-code01', 'small-prime', 'trial-division-prime', 'is-prime'],
      },
      {
        id: 'large-prime-miller-rabin-097',
        aliases: ['class097-code02', 'large-prime', 'miller-rabin', 'miller-rabin-test'],
      },
      {
        id: 'prime-factors-097',
        aliases: ['class097-code03', 'prime-factors', 'prime-factorization'],
      },
      {
        id: 'ehrlich-euler-sieve-097',
        aliases: ['class097-code04', 'euler-sieve', 'ehrlich-euler-sieve', 'linear-sieve', 'luogu-p3383'],
      },
    ];

    for (const item of expectedMappings) {
      const manifest = algorithmRegistry.getManifest(item.id);
      expect(manifest, `Algorithm with id ${item.id} must be registered`).toBeDefined();
      for (const alias of item.aliases) {
        expect(manifest?.aliases).toContain(alias);
        const resolvedByAlias = algorithmRegistry.getManifest(alias);
        expect(resolvedByAlias?.id, `Alias ${alias} should resolve to ${item.id}`).toBe(item.id);
      }
    }
  });
});

