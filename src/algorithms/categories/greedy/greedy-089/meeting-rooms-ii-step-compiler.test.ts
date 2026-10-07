import { describe, it, expect } from 'vitest';
import {
  buildMeetingRoomsStage1Steps,
  buildMeetingRoomsStage2Steps,
  buildMeetingRoomsStage3Steps,
  parseMeetingRoomsInput,
} from './meeting-rooms-ii-step-compiler';

describe('Meeting Rooms II Step Compiler', () => {
  const sampleIntervals = [[0, 30], [5, 10], [15, 20]];

  it('Stage 1 generates brute force overlap steps', () => {
    const steps = buildMeetingRoomsStage1Steps(sampleIntervals);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].maxRooms).toBe(2);
  });

  it('Stage 2 generates greedy sorting and min heap steps with line linkage', () => {
    const steps = buildMeetingRoomsStage2Steps(sampleIntervals);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.maxRooms).toBe(2);

    // Empty interval test
    const emptySteps = buildMeetingRoomsStage2Steps([]);
    expect(emptySteps.length).toBe(2);
    expect(emptySteps[1].maxRooms).toBe(0);
  });

  it('Stage 3 generates peak overlap verification steps', () => {
    const steps = buildMeetingRoomsStage3Steps(sampleIntervals);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseMeetingRoomsInput parses inputs across stages', () => {
    const s1 = parseMeetingRoomsInput({ 'input-intervals': '7,10; 2,4' }, 1);
    const s2 = parseMeetingRoomsInput({ 'input-intervals': '7,10; 2,4' }, 2);
    const s3 = parseMeetingRoomsInput({ 'input-intervals': '7,10; 2,4' }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
