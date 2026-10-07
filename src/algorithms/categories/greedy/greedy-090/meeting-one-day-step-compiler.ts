import { getGreedy090Anchor } from './greedy-090-stage-codes';
import {
  Greedy090Step,
  GanttIntervalItem,
  SimpleHeap,
} from './greedy-090-shared';

export interface MeetingOneDayStep extends Greedy090Step {
  intervals: GanttIntervalItem[];
  currentDay: number;
  minDay: number;
  maxDay: number;
  heapContents: number[]; // 小根堆中的截止时间
  attendedEvents: string[];
  totalAttended: number;
  tracksCount: number;
}

export function parseEventsInput(raw: string): [number, number][] {
  const pairs = raw.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
  const res: [number, number][] = [];
  for (const p of pairs) {
    const parts = p.split(/[,，\s]+/).map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n));
    if (parts.length >= 2) {
      res.push([Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])]);
    }
  }
  return res.length > 0 ? res : [[1, 2], [2, 3], [3, 4], [1, 2]];
}

export function buildMeetingOneDaySteps(rawInput: string, stage: number): MeetingOneDayStep[] {
  const events = parseEventsInput(rawInput);
  const steps: MeetingOneDayStep[] = [];

  const minD = Math.min(...events.map((e) => e[0]), 1);
  const maxD = Math.max(...events.map((e) => e[1]), 5);

  const baseItems: GanttIntervalItem[] = events.map((e, idx) => ({
    id: `ev-${idx}`,
    name: `会议 ${idx + 1}`,
    start: e[0],
    end: e[1],
    track: idx % 4,
    status: 'pending',
  }));

  const initAnchor = getGreedy090Anchor(
    'meeting-one-day',
    stage === 1 ? 1 : stage === 2 ? 2 : 3,
    stage === 1 ? 'init' : stage === 2 ? 'sort' : 'intro'
  );

  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    intervals: baseItems.map((x) => ({ ...x })),
    currentDay: minD,
    minDay: minD,
    maxDay: maxD,
    heapContents: [],
    attendedEvents: [],
    totalAttended: 0,
    tracksCount: 4,
    decision: '初始化参会日程',
    message: `载入 ${events.length} 场候选会议，时间范围 [Day ${minD}, Day ${maxD}]`,
    log: `[Init] 载入 ${events.length} 场会议。`,
    codeLine: initAnchor,
  });

  if (stage === 1) {
    // 阶段1: 暴力枚举匹配
    let attended = 0;
    const attendedList: string[] = [];
    const items = baseItems.map((x) => ({ ...x }));

    for (let day = minD; day <= Math.min(maxD, minD + 4); day++) {
      const loopAnchor = getGreedy090Anchor('meeting-one-day', 1, 'loop');
      steps.push({
        line: loopAnchor.java,
        stepIndex: steps.length,
        intervals: items.map((x) => ({ ...x })),
        currentDay: day,
        minDay: minD,
        maxDay: maxD,
        heapContents: [],
        attendedEvents: [...attendedList],
        totalAttended: attended,
        tracksCount: 4,
        decision: `探索 Day ${day} 的参会选择`,
        message: `在 Day ${day}，暴力搜索所有包含该天的会议进行试探性分配`,
        log: `[DFS Try] Day=${day}`,
        codeLine: loopAnchor,
      });

      // 选一个尚未参加且合法的
      const candidate = items.find((it) => it.status === 'pending' && it.start <= day && day <= it.end);
      if (candidate) {
        candidate.status = 'selected';
        attended++;
        attendedList.push(`${candidate.name} (Day ${day})`);

        const pickAnchor = getGreedy090Anchor('meeting-one-day', 1, 'pick');
        steps.push({
          line: pickAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentDay: day,
          minDay: minD,
          maxDay: maxD,
          heapContents: [],
          attendedEvents: [...attendedList],
          totalAttended: attended,
          tracksCount: 4,
          decision: `选派参加 ${candidate.name}`,
          message: `Day ${day} 安排参加 ${candidate.name}，累计已参加 ${attended} 场会议`,
          log: `[DFS Pick] Day ${day} -> ${candidate.name}`,
          codeLine: pickAnchor,
        });
      }
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: 贪心小根堆
    const sortedEvents = [...events].map((e, idx) => ({
      id: `ev-${idx}`,
      name: `会议 ${idx + 1}`,
      start: e[0],
      end: e[1],
      track: idx % 4,
    })).sort((a, b) => a.start - b.start);

    const items: GanttIntervalItem[] = sortedEvents.map((e) => ({
      id: e.id,
      name: e.name,
      start: e.start,
      end: e.end,
      track: e.track,
      status: 'pending',
    }));

    const sortAnchor = getGreedy090Anchor('meeting-one-day', 2, 'sort');
    steps.push({
      line: sortAnchor.java,
      stepIndex: steps.length,
      intervals: items.map((x) => ({ ...x })),
      currentDay: minD,
      minDay: minD,
      maxDay: maxD,
      heapContents: [],
      attendedEvents: [],
      totalAttended: 0,
      tracksCount: 4,
      decision: '按开始时间排序预处理',
      message: '所有会议按开始日 startDay 升序排列完毕，便于时间指针推进时顺次入堆',
      log: '[Sort] 会议按开始日排序完毕。',
      codeLine: sortAnchor,
    });

    const heap = new SimpleHeap<{ end: number; item: GanttIntervalItem }>((a, b) => a.end - b.end);
    let eventIdx = 0;
    let attendedCount = 0;
    const attendedList: string[] = [];

    for (let day = minD; day <= maxD; day++) {
      // 1. 将今天开始的所有会议加入小根堆
      let addedToday = false;
      while (eventIdx < items.length && items[eventIdx].start === day) {
        heap.push({ end: items[eventIdx].end, item: items[eventIdx] });
        items[eventIdx].status = 'active';
        eventIdx++;
        addedToday = true;
      }

      if (addedToday) {
        const addAnchor = getGreedy090Anchor('meeting-one-day', 2, 'addToday');
        steps.push({
          line: addAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentDay: day,
          minDay: minD,
          maxDay: maxD,
          heapContents: heap.toArray().map((x) => x.end),
          attendedEvents: [...attendedList],
          totalAttended: attendedCount,
          tracksCount: 4,
          decision: `Day ${day}: 激活今日开启的会议`,
          message: `时间推进到 Day ${day}，将所有在今天开启的会议截止日压入小根堆，堆内候选数: ${heap.size()}`,
          log: `[Heap Add] Day ${day}, 堆内元素: ${heap.toArray().map((x) => x.end).join(',')}`,
          codeLine: addAnchor,
        });
      }

      // 2. 清理已经过期的会议
      let expiredCount = 0;
      while (heap.size() > 0 && heap.peek()!.end < day) {
        const expired = heap.pop()!;
        expired.item.status = 'discarded';
        expiredCount++;
      }

      if (expiredCount > 0) {
        const removeAnchor = getGreedy090Anchor('meeting-one-day', 2, 'removeExpired');
        steps.push({
          line: removeAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentDay: day,
          minDay: minD,
          maxDay: maxD,
          heapContents: heap.toArray().map((x) => x.end),
          attendedEvents: [...attendedList],
          totalAttended: attendedCount,
          tracksCount: 4,
          decision: `Day ${day}: 淘汰已过期失效的会议`,
          message: `移除了 ${expiredCount} 场截止日已早于 Day ${day} 的过期会议`,
          log: `[Heap Expired] 淘汰 ${expiredCount} 场过期会议。`,
          codeLine: removeAnchor,
        });
      }

      // 3. 贪心挑选堆顶（最早截止）的会议参加
      if (heap.size() > 0) {
        const best = heap.pop()!;
        best.item.status = 'selected';
        attendedCount++;
        attendedList.push(`${best.item.name} (Day ${day})`);

        const attendAnchor = getGreedy090Anchor('meeting-one-day', 2, 'attend');
        steps.push({
          line: attendAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentDay: day,
          minDay: minD,
          maxDay: maxD,
          heapContents: heap.toArray().map((x) => x.end),
          attendedEvents: [...attendedList],
          totalAttended: attendedCount,
          tracksCount: 4,
          decision: `Day ${day}: 贪心参加堆顶会议 ${best.item.name}`,
          message: `弹出小根堆堆顶最早截止的 ${best.item.name} (截止日: Day ${best.end})，在今天打卡参会！累计参会: ${attendedCount}`,
          log: `[Attend] Day ${day} 参加 ${best.item.name}`,
          codeLine: attendAnchor,
        });
      }
    }

    const retAnchor = getGreedy090Anchor('meeting-one-day', 2, 'ret');
    steps.push({
      line: retAnchor.java,
      stepIndex: steps.length,
      intervals: items.map((x) => ({ ...x })),
      currentDay: maxD,
      minDay: minD,
      maxDay: maxD,
      heapContents: [],
      attendedEvents: [...attendedList],
      totalAttended: attendedCount,
      tracksCount: 4,
      decision: '小根堆贪心推演完成',
      message: `推演结束：在 [Day ${minD}, Day ${maxD}] 期间，最多可成功参加 ${attendedCount} 场会议！`,
      log: `[Done] 贪心完成，最终总参会数=${attendedCount}`,
      codeLine: retAnchor,
    });

    return steps;
  }

  // 阶段3: 证明
  const introAnchor = getGreedy090Anchor('meeting-one-day', 3, 'intro');
  steps.push({
    line: introAnchor.java,
    stepIndex: steps.length,
    intervals: [
      { id: 'ea', name: '会议 A (早截止)', start: 1, end: 2, track: 0, status: 'selected' },
      { id: 'eb', name: '会议 B (晚截止)', start: 1, end: 4, track: 1, status: 'active' },
    ],
    currentDay: 1,
    minDay: 1,
    maxDay: 4,
    heapContents: [2, 4],
    attendedEvents: ['会议 A (Day 1)'],
    totalAttended: 1,
    tracksCount: 2,
    decision: '早截止失效不可逆反证假设',
    message: '反证设问：Day 1 可选会议 A (end=2) 与 B (end=4)。贪心选择优先打卡 A，将 B 留给后续',
    log: '[Proof Start] 比较早截止 A 与晚截止 B',
    codeLine: introAnchor,
  });

  const compareAnchor = getGreedy090Anchor('meeting-one-day', 3, 'compare');
  steps.push({
    line: compareAnchor.java,
    stepIndex: steps.length,
    intervals: [
      { id: 'ea', name: '会议 A (已在Day1参加)', start: 1, end: 2, track: 0, status: 'selected' },
      { id: 'eb', name: '会议 B (在Day2参加)', start: 1, end: 4, track: 1, status: 'selected' },
    ],
    currentDay: 2,
    minDay: 1,
    maxDay: 4,
    heapContents: [4],
    attendedEvents: ['会议 A (Day 1)', '会议 B (Day 2)'],
    totalAttended: 2,
    tracksCount: 2,
    decision: '时间裕度单调优势',
    message: '若逆序在 Day 1 参加 B：留到 Day 2 以后，A 很快在 Day 2 之后永久过期失效；而 B 宽容至 Day 4。将宽容度高的任务留给未来，必然严格不劣！',
    log: '[Proof Invariant] B 的生存期严格包含 A 的剩余生存期。',
    codeLine: compareAnchor,
  });

  return steps;
}
