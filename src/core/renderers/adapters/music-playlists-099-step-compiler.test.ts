import { describe, it, expect } from 'vitest';
import { buildMusicPlaylistsSteps } from './music-playlists-099-step-compiler';
import { MUSIC_PLAYLISTS_CODES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';

describe('MusicPlaylists099StepCompiler', () => {
  it('should compile valid steps with 1-based codeLine mappings for all languages', () => {
    const steps = buildMusicPlaylistsSteps(3, 3, 1);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = MUSIC_PLAYLISTS_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.finalValue).toBe(6);
  });

  it('handles edge case when goal is larger than n and j <= k branch', () => {
    const steps = buildMusicPlaylistsSteps(2, 3, 0);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    // n=2, goal=3, k=0: 2^3 - 2 = 6 ways
    expect(lastStep.finalValue).toBe(6);
  });
});
