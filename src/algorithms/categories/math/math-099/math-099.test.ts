import { describe, it, expect } from 'vitest';
import { buildInverseSingleSteps } from './inverse-single-renderer';
import { buildInverseSerialSteps } from './inverse-serial-renderer';
import { buildFactorialSteps } from './inverse-factorial-renderer';
import { buildSubsetGcdSteps } from './subset-gcd-k-renderer';
import { buildCoinBuySteps } from './coin-buy-ways-renderer';
import { buildMusicPlaylistsSteps } from './music-playlists-renderer';
import {
  INVERSE_SINGLE_CODES,
  INVERSE_SERIAL_CODES,
  INVERSE_FACTORIAL_CODES,
  SUBSET_GCD_K_CODES,
  COIN_BUY_WAYS_CODES,
  MUSIC_PLAYLISTS_CODES,
} from './math-099-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|计算|准备|求解)/);

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

describe('左神逆元与组合数学专题三 (math-099) 自动化测试套件', () => {
  it('1. 乘法逆元单点求法 (Modular Inverse Single)', () => {
    // 3 * 333333336 = 1000000008 = 1 (mod 1000000007)
    const steps = buildInverseSingleSteps(3, 1000000007);
    verifyLineMap(steps, INVERSE_SINGLE_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(333333336);
  });

  it('2. 线性递推求逆元 (Linear Inverses)', () => {
    const steps = buildInverseSerialSteps(5, 1000000007);
    verifyLineMap(steps, INVERSE_SERIAL_CODES);
    const table = steps[steps.length - 1].inversesTable!;
    expect(table[0].inv).toBe(1);
    expect(table[2].inv).toBe(333333336); // 3^-1
  });

  it('3. 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr)', () => {
    // C(10, 3) = 120
    const steps = buildFactorialSteps(10, 3, 1000000007);
    verifyLineMap(steps, INVERSE_FACTORIAL_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(120);
  });

  it('4. 子集 GCD 为 K 方案数 (Subset GCD K)', () => {
    const nums = [2, 4, 6, 8, 10];
    const steps = buildSubsetGcdSteps(nums, 2);
    verifyLineMap(steps, SUBSET_GCD_K_CODES);
    expect(steps[steps.length - 1].finalValue).toBeGreaterThan(0);
  });

  it('5. 硬币购物方案数 (Coin Buy Ways)', () => {
    const c = [1, 2, 5, 10];
    const d = [3, 2, 3, 1];
    const s = 10;
    const steps = buildCoinBuySteps(c, d, s);
    verifyLineMap(steps, COIN_BUY_WAYS_CODES);
    expect(steps[steps.length - 1].finalValue).toBeGreaterThan(0);
  });

  it('6. 音乐播放列表 (Music Playlists)', () => {
    // n=3, goal=3, k=1 -> 3 * 2 * 1 = 6
    const steps = buildMusicPlaylistsSteps(3, 3, 1);
    verifyLineMap(steps, MUSIC_PLAYLISTS_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(6);
  });

  it('7. Class 099 逆元与同余方程专题 注册中心与别名统合门禁', async () => {
    const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
    await import('../../../batch-6-index');

    const expectedMappings = [
      {
        id: 'inverse-single-099',
        aliases: ['class099-code01', 'inverse-single', 'modular-inverse-single', 'fermat-inverse'],
      },
      {
        id: 'inverse-serial-099',
        aliases: ['class099-code02', 'inverse-serial', 'linear-inverses', 'luogu-p3811'],
      },
      {
        id: 'inverse-factorial-099',
        aliases: ['class099-code03', 'inverse-factorial', 'combination-ncr', 'factorial-inverses'],
      },
      {
        id: 'subset-gcd-k-099',
        aliases: ['class099-code04', 'subset-gcd-k', 'subset-gcd-inclusion-exclusion'],
      },
      {
        id: 'coin-buy-ways-099',
        aliases: ['class099-code05', 'coin-buy-ways', 'haoi-2008-coins', 'luogu-p1450'],
      },
      {
        id: 'music-playlists-099',
        aliases: ['class099-code06', 'music-playlists', 'number-of-music-playlists-920', 'leetcode-920'],
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

