import { describe, it, expect } from 'vitest';
import { getStringDpAnchor, registerStringDpTemplates } from './string-dp-stage-codes';
import { codeStepIndexer } from '../code-step-indexer';

describe('StringDp Stage Code Templates (@step:anchor compilation)', () => {
  const kinds = ['regex', 'wildcard'] as const;
  const stages = [1, 2, 3];

  for (const kind of kinds) {
    for (const stage of stages) {
      it(`should compile valid anchors for ${kind} stage ${stage}`, () => {
        const key = `string-dp:${kind}:s${stage}`;
        const hasAny = codeStepIndexer.hasAnchor(key, 'callRoot', 'java')
          || codeStepIndexer.hasAnchor(key, 'fnEnter', 'java')
          || codeStepIndexer.hasAnchor(key, 'initDp', 'java');
        expect(hasAny).toBe(true);

        // All resolved anchors must be positive
        for (const anchor of ['callRoot', 'fnEnter', 'baseCheck', 'starCheck', 'charBranch', 'returnResult']) {
          const resolved = getStringDpAnchor(stage, kind, anchor);
          expect(resolved.java).toBeGreaterThanOrEqual(1);
          expect(resolved.java).toBeLessThanOrEqual(50);
        }
      });
    }
  }

  it('should resolve regex stage 1 anchors to expected positions', () => {
    const fn = getStringDpAnchor(1, 'regex', 'fnEnter');
    expect(fn.java).toBe(5);
    expect(fn.cpp).toBe(5);
    expect(fn.python).toBe(5);
    expect(fn.javascript).toBe(5);
  });

  it('should resolve regex stage 3 returnAns correctly', () => {
    const ans = getStringDpAnchor(3, 'regex', 'returnAns');
    expect(ans.java).toBe(23);
    expect(ans.cpp).toBe(22);
    expect(ans.python).toBe(14);
    expect(ans.javascript).toBe(18);
  });

  it('should resolve wildcard stage 1 starCheck to p[j]==\'*\' line', () => {
    const sc = getStringDpAnchor(1, 'wildcard', 'starCheck');
    expect(sc.java).toBe(7);
    expect(sc.cpp).toBe(7);
    expect(sc.python).toBe(7);
    expect(sc.javascript).toBe(7);
  });

  it('should resolve wildcard stage 3 baseStarLoop at valid positions', () => {
    const bsl = getStringDpAnchor(3, 'wildcard', 'baseStarLoop');
    // Positions are computed from actual template structure, not legacy constants
    expect(bsl.java).toBeGreaterThanOrEqual(10);
    expect(bsl.java).toBeLessThanOrEqual(12);
    expect(bsl.cpp).toBeGreaterThanOrEqual(9);
    expect(bsl.cpp).toBeLessThanOrEqual(11);
    expect(bsl.python).toBeGreaterThanOrEqual(6);
    expect(bsl.python).toBeLessThanOrEqual(8);
    expect(bsl.javascript).toBeGreaterThanOrEqual(6);
    expect(bsl.javascript).toBeLessThanOrEqual(8);
  });

  it('should return distinct anchor lines for regex stage 1', () => {
    const anchors = ['callRoot', 'fnEnter', 'baseCheck', 'firstMatch', 'starCheck', 'starBranch0', 'charBranch'];
    const lines = new Set(anchors.map((a) => getStringDpAnchor(1, 'regex', a).java));
    expect(lines.size).toBeGreaterThanOrEqual(6);
  });

  it('should have registered all templates in CodeStepIndexer', () => {
    for (const kind of ['regex', 'wildcard']) {
      for (const stage of [1, 2, 3]) {
        const key = `string-dp:${kind}:s${stage}`;
        expect(codeStepIndexer.hasAnchor(key, 'callRoot', 'java')
          || codeStepIndexer.hasAnchor(key, 'fnEnter', 'java')
          || codeStepIndexer.hasAnchor(key, 'initDp', 'java')).toBe(true);
      }
    }
  });
});
