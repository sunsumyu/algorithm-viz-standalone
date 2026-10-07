import { describe, it, expect } from 'vitest';
import { buildMeetingOneDaySteps } from './meeting-one-day-step-compiler';
import {
  MEETING_ONE_DAY_STAGE1_CODES,
  MEETING_ONE_DAY_STAGE2_CODES,
  MEETING_ONE_DAY_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('MeetingOneDayStepCompiler', () => {
  it('should compile valid steps with 1-based code lines across all 3 stages', () => {
    const input = '1,2; 2,3; 3,4; 1,2';
    const s1 = buildMeetingOneDaySteps(input, 1);
    const s2 = buildMeetingOneDaySteps(input, 2);
    const s3 = buildMeetingOneDaySteps(input, 3);

    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);

    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      expect(step.codeLine.java).toBeLessThanOrEqual(MEETING_ONE_DAY_STAGE2_CODES.java.length);
      expect(step.codeLine.cpp).toBeLessThanOrEqual(MEETING_ONE_DAY_STAGE2_CODES.cpp.length);
      expect(step.codeLine.python).toBeLessThanOrEqual(MEETING_ONE_DAY_STAGE2_CODES.python.length);
      expect(step.codeLine.javascript).toBeLessThanOrEqual(MEETING_ONE_DAY_STAGE2_CODES.javascript.length);
    }

    expect(s2[s2.length - 1].totalAttended).toBe(4);
  });
});
