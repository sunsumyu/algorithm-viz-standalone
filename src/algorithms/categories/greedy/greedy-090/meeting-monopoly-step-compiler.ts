import { getGreedy090Anchor } from './greedy-090-stage-codes';
import { Greedy090Step, GanttIntervalItem } from './greedy-090-shared';

export interface MeetingMonopolyStep extends Greedy090Step {
  intervals: GanttIntervalItem[];
  currentTime?: number;
  minTime: number;
  maxTime: number;
  tracksCount: number;
  selectedCount: number;
  discardedCount: number;
  curEnd: number;
}

export function parseIntervalsInput(raw: string): [number, number][] {
  const pairs = raw.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
  const res: [number, number][] = [];
  for (const p of pairs) {
    const parts = p.split(/[,，\s]+/).map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n));
    if (parts.length >= 2) {
      res.push([Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])]);
    }
  }
  return res.length > 0 ? res : [[1, 2], [2, 3], [3, 4], [1, 3]];
}

export function buildMeetingMonopolySteps(rawInput: string, stage: number): MeetingMonopolyStep[] {
  const meetings = parseIntervalsInput(rawInput);
  const steps: MeetingMonopolyStep[] = [];

  const minT = Math.min(...meetings.map((m) => m[0]), 0);
  const maxT = Math.max(...meetings.map((m) => m[1]), 10);

  // 初步分配轨道
  const baseItems: GanttIntervalItem[] = meetings.map((m, idx) => ({
    id: `m-${idx}`,
    name: `会议 M${idx + 1}`,
    start: m[0],
    end: m[1],
    track: idx % 3,
    status: 'pending',
  }));

  const initAnchor = getGreedy090Anchor(
    'meeting-monopoly',
    stage === 1 ? 1 : stage === 2 ? 2 : 3,
    stage === 1 ? 'init' : stage === 2 ? 'sort' : 'intro'
  );

  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    intervals: baseItems.map((item) => ({ ...item })),
    minTime: minT,
    maxTime: maxT,
    tracksCount: 3,
    selectedCount: 0,
    discardedCount: 0,
    curEnd: -Infinity,
    decision: '初始化会议时间轴',
    message: `载入 ${meetings.length} 场待调度会议，时间跨度 [${minT}, ${maxT}]`,
    log: `[Init] 载入 ${meetings.length} 场会议。`,
    codeLine: initAnchor,
  });

  if (stage === 1) {
    // 阶段1: 暴力选择演示
    let selected = 0;
    let lastE = -Infinity;
    const items = baseItems.map((item) => ({ ...item }));

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.status = 'active';

      const checkAnchor = getGreedy090Anchor('meeting-monopoly', 1, 'check');
      steps.push({
        line: checkAnchor.java,
        stepIndex: steps.length,
        intervals: items.map((x) => ({ ...x })),
        currentTime: it.start,
        minTime: minT,
        maxTime: maxT,
        tracksCount: 3,
        selectedCount: selected,
        discardedCount: i - selected,
        curEnd: lastE,
        decision: `考察会议 ${it.name}`,
        message: `枚举考察 ${it.name} [${it.start}, ${it.end}]，当前上一会议结束时间 = ${lastE === -Infinity ? '无' : lastE}`,
        log: `[DFS Probe] 评估 ${it.name}`,
        codeLine: checkAnchor,
      });

      if (it.start >= lastE) {
        it.status = 'selected';
        selected++;
        lastE = it.end;
        const pickAnchor = getGreedy090Anchor('meeting-monopoly', 1, 'pick');
        steps.push({
          line: pickAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentTime: it.end,
          minTime: minT,
          maxTime: maxT,
          tracksCount: 3,
          selectedCount: selected,
          discardedCount: i + 1 - selected,
          curEnd: lastE,
          decision: `选入会议 ${it.name}`,
          message: `时间不冲突 (start ${it.start} >= lastEnd ${lastE === it.end ? 'OK' : ''})，递归分支选入该会议！`,
          log: `[DFS Pick] 选入 ${it.name}`,
          codeLine: pickAnchor,
        });
      } else {
        it.status = 'discarded';
        const skipAnchor = getGreedy090Anchor('meeting-monopoly', 1, 'skip');
        steps.push({
          line: skipAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentTime: it.start,
          minTime: minT,
          maxTime: maxT,
          tracksCount: 3,
          selectedCount: selected,
          discardedCount: i + 1 - selected,
          curEnd: lastE,
          decision: `发生冲突，放弃 ${it.name}`,
          message: `该会议开始时刻 ${it.start} 早于当前占用结束时刻 ${lastE}，发生独占冲突，分支放弃`,
          log: `[DFS Skip] 放弃 ${it.name}`,
          codeLine: skipAnchor,
        });
      }
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: 贪心结束时间排序 + 顺序推演
    const sorted = [...meetings].sort((a, b) => a[1] - b[1]);
    const items: GanttIntervalItem[] = sorted.map((m, idx) => ({
      id: `sorted-m-${idx}`,
      name: `M${idx + 1}`,
      start: m[0],
      end: m[1],
      track: idx % 3,
      status: 'pending',
    }));

    const sortAnchor = getGreedy090Anchor('meeting-monopoly', 2, 'sort');
    steps.push({
      line: sortAnchor.java,
      stepIndex: steps.length,
      intervals: items.map((x) => ({ ...x })),
      minTime: minT,
      maxTime: maxT,
      tracksCount: 3,
      selectedCount: 0,
      discardedCount: 0,
      curEnd: -Infinity,
      decision: '按结束时间升序重排',
      message: '核心贪心预处理：将所有会议按结束时间 end 从小到大重排完毕！',
      log: '[Sort] 会议按结束时间排序完成。',
      codeLine: sortAnchor,
    });

    let selected = 0;
    let curEnd = -Infinity;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.status = 'active';

      const checkAnchor = getGreedy090Anchor('meeting-monopoly', 2, 'check');
      steps.push({
        line: checkAnchor.java,
        stepIndex: steps.length,
        intervals: items.map((x) => ({ ...x })),
        currentTime: it.start,
        minTime: minT,
        maxTime: maxT,
        tracksCount: 3,
        selectedCount: selected,
        discardedCount: i - selected,
        curEnd: curEnd,
        decision: `检查会议 ${it.name} [${it.start}, ${it.end}]`,
        message: `考察当前结束最早的待选会议 ${it.name}，开始时间=${it.start}，当前会议室空闲时刻=${curEnd === -Infinity ? '初始时刻' : curEnd}`,
        log: `[Greedy Check] 检查 ${it.name}`,
        codeLine: checkAnchor,
      });

      if (it.start >= curEnd) {
        it.status = 'selected';
        selected++;
        curEnd = it.end;

        const updateAnchor = getGreedy090Anchor('meeting-monopoly', 2, 'update');
        steps.push({
          line: updateAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentTime: curEnd,
          minTime: minT,
          maxTime: maxT,
          tracksCount: 3,
          selectedCount: selected,
          discardedCount: i + 1 - selected,
          curEnd: curEnd,
          decision: `贪心采纳会议 ${it.name}`,
          message: `由于 ${it.start} >= ${curEnd === it.end ? '前次结束' : curEnd}，相容入库！时间游标推进至 curEnd = ${curEnd}`,
          log: `[Greedy Pick] 采纳 ${it.name}, curEnd=${curEnd}`,
          codeLine: updateAnchor,
        });
      } else {
        it.status = 'discarded';
        const loopAnchor = getGreedy090Anchor('meeting-monopoly', 2, 'loop');
        steps.push({
          line: loopAnchor.java,
          stepIndex: steps.length,
          intervals: items.map((x) => ({ ...x })),
          currentTime: curEnd,
          minTime: minT,
          maxTime: maxT,
          tracksCount: 3,
          selectedCount: selected,
          discardedCount: i + 1 - selected,
          curEnd: curEnd,
          decision: `冲突淘汰 ${it.name}`,
          message: `会议 ${it.name} 开始时间 ${it.start} < 上一会议结束时间 ${curEnd}，发生独占冲突，果断舍弃！`,
          log: `[Greedy Drop] 冲突放弃 ${it.name}`,
          codeLine: loopAnchor,
        });
      }
    }

    const retAnchor = getGreedy090Anchor('meeting-monopoly', 2, 'ret');
    steps.push({
      line: retAnchor.java,
      stepIndex: steps.length,
      intervals: items.map((x) => ({ ...x })),
      minTime: minT,
      maxTime: maxT,
      tracksCount: 3,
      selectedCount: selected,
      discardedCount: items.length - selected,
      curEnd: curEnd,
      decision: '贪心推演完成',
      message: `推演结束：最多可参加 ${selected} 场互不冲突的独占会议（等价于最少删除 ${items.length - selected} 场冲突会议）`,
      log: `[Done] 贪心完成，最多参会=${selected}`,
      codeLine: retAnchor,
    });

    return steps;
  }

  // 阶段3: 反证证明
  const baseAnchor = getGreedy090Anchor('meeting-monopoly', 3, 'base');
  steps.push({
    line: baseAnchor.java,
    stepIndex: steps.length,
    intervals: [
      { id: 'g1', name: '贪心解 g1', start: 1, end: 3, track: 0, status: 'selected' },
      { id: 'opt1', name: '假定最优解 opt1', start: 1, end: 4, track: 1, status: 'active' },
      { id: 'g2', name: '后续可用空间 [3, +∞)', start: 3, end: 8, track: 0, status: 'pending' },
    ],
    minTime: 0,
    maxTime: 8,
    tracksCount: 2,
    selectedCount: 1,
    discardedCount: 0,
    curEnd: 3,
    decision: '贪心不劣性数学归纳反证',
    message: '数学归纳法：贪心解选取的第 r 个区间结束时刻 g_r.end 永远 <= 最优解 opt_r.end',
    log: '[Proof] 归纳证明 g_r.end <= opt_r.end',
    codeLine: baseAnchor,
  });

  const stepAnchor = getGreedy090Anchor('meeting-monopoly', 3, 'step');
  steps.push({
    line: stepAnchor.java,
    stepIndex: steps.length,
    intervals: [
      { id: 'g1', name: '贪心解 g1', start: 1, end: 3, track: 0, status: 'selected' },
      { id: 'g2', name: '贪心解 g2', start: 3, end: 6, track: 0, status: 'selected' },
      { id: 'opt1', name: '假定解 opt1 (更晚结束压缩空间)', start: 1, end: 5, track: 1, status: 'discarded' },
    ],
    minTime: 0,
    maxTime: 8,
    tracksCount: 2,
    selectedCount: 2,
    discardedCount: 1,
    curEnd: 6,
    decision: '相容时间区间严格包含',
    message: '由于 g_r 结束更早，给未来留下的可用时间段 [g_r.end, +∞) 严格包含了 [opt_r.end, +∞)。任何能与 opt_r 相容的后续区间，必能与 g_r 相容！',
    log: '[Proof Step] 贪心解留出更大后序相容区间。',
    codeLine: stepAnchor,
  });

  const conclAnchor = getGreedy090Anchor('meeting-monopoly', 3, 'conclusion');
  steps.push({
    line: conclAnchor.java,
    stepIndex: steps.length,
    intervals: [
      { id: 'g1', name: '贪心解 g1', start: 1, end: 3, track: 0, status: 'selected' },
      { id: 'g2', name: '贪心解 g2', start: 3, end: 6, track: 0, status: 'selected' },
      { id: 'g3', name: '贪心解 g3', start: 6, end: 8, track: 0, status: 'selected' },
    ],
    minTime: 0,
    maxTime: 8,
    tracksCount: 2,
    selectedCount: 3,
    discardedCount: 0,
    curEnd: 8,
    decision: '反证结论收敛：贪心即最优',
    message: '由归纳假设可知，贪心算法容纳的会议总数必满足 m >= k。因此不可能存在包含更多会议的合法排期，贪心解必是全局最优解！',
    log: '[Proof Verified] 贪心最优性证明成立。',
    codeLine: conclAnchor,
  });

  return steps;
}
