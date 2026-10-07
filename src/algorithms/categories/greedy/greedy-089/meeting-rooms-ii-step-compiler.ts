import {
  MEETING_ROOMS_STAGE1_LINES,
  MEETING_ROOMS_STAGE2_LINES,
  MEETING_ROOMS_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  HeapVisualItem,
  GanttInterval,
  SimpleHeap,
} from './greedy-089-shared';

export interface MeetingInterval {
  id: number;
  start: number;
  end: number;
  roomId?: number;
}

export interface MeetingRoomsStep extends Greedy089Step {
  intervals: MeetingInterval[];
  currentMeeting?: MeetingInterval;
  heap: HeapVisualItem[];
  rooms: GanttInterval[];
  currentTime?: number;
  maxRooms: number;
}

export function buildMeetingRoomsStage1Steps(rawIntervals: number[][]): MeetingRoomsStep[] {
  const steps: MeetingRoomsStep[] = [];
  const lines = MEETING_ROOMS_STAGE1_LINES;

  const intervals: MeetingInterval[] = rawIntervals.map((iv, idx) => ({
    id: idx + 1,
    start: iv[0],
    end: iv[1],
  }));

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: `主函数入口：共有 ${intervals.length} 场会议需要安排`,
    message: '阶段 1 暴力算法：遍历每个会议的开始时间点，统计与其它所有会议的并发重叠数量',
    log: `enter minMeetingRoomsBrute(n=${intervals.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: '初始化最大房间数 maxRooms = 0',
    message: '准备遍历所有时间戳',
    log: 'init maxRooms = 0',
    codeLine: lines.init,
    line: lines.init?.java ?? 2,
  });

  let maxRooms = 0;
  for (let i = 0; i < intervals.length; i++) {
    const cur = intervals[i];
    steps.push({
      intervals: [...intervals],
      currentMeeting: cur,
      heap: [],
      rooms: [],
      currentTime: cur.start,
      maxRooms,
      decision: `考察会议 #${cur.id} [${cur.start}, ${cur.end}) 的开始时间点 t=${cur.start}`,
      message: `扫描此时有多少会议处于重叠进行中`,
      log: `check meeting #${cur.id} start=${cur.start}`,
      codeLine: lines.outerLoop,
      line: lines.outerLoop?.java ?? 3,
    });

    let count = 0;
    const activeRooms: GanttInterval[] = [];
    for (let j = 0; j < intervals.length; j++) {
      const other = intervals[j];
      if (other.start <= cur.start && other.end > cur.start) {
        count++;
        activeRooms.push({
          id: other.id,
          label: `M${other.id}`,
          start: other.start,
          end: other.end,
          trackIndex: activeRooms.length,
          color: other.id === cur.id ? '#ef4444' : '#3b82f6',
          active: other.id === cur.id,
        });
      }
    }

    const updated = count > maxRooms;
    if (updated) maxRooms = count;

    steps.push({
      intervals: [...intervals],
      currentMeeting: cur,
      heap: [],
      rooms: activeRooms,
      currentTime: cur.start,
      maxRooms,
      decision: `时间点 t=${cur.start} 处检测到 ${count} 场会议正在并发进行 ➔ ${updated ? `刷新最大会议室需求为 ${maxRooms}` : '未超历史峰值'}`,
      message: `同时活跃会议数: ${count}`,
      log: `overlap at t=${cur.start} is ${count}`,
      codeLine: lines.updateMax,
      line: lines.updateMax?.java ?? 4,
    });
  }

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms,
    decision: `🎉 暴力扫描完成！最少需要 ${maxRooms} 间会议室`,
    message: `双重循环时间复杂度为 O(N^2)`,
    log: `done maxRooms=${maxRooms}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 5,
  });

  return steps;
}

export function buildMeetingRoomsStage2Steps(rawIntervals: number[][]): MeetingRoomsStep[] {
  const steps: MeetingRoomsStep[] = [];
  const lines = MEETING_ROOMS_STAGE2_LINES;

  const intervals: MeetingInterval[] = rawIntervals.map((iv, idx) => ({
    id: idx + 1,
    start: iv[0],
    end: iv[1],
  }));

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: `主函数入口：共有 ${intervals.length} 场会议待安排`,
    message: '核心贪心：按开始时间排序，小根堆动态维护正在使用的会议室的最早结束时间',
    log: `enter minMeetingRooms(n=${intervals.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  if (intervals.length === 0) {
    steps.push({
      intervals: [],
      heap: [],
      rooms: [],
      maxRooms: 0,
      decision: '特判：无会议安排，返回 0',
      message: '空输入特判',
      log: 'empty intervals -> 0',
      codeLine: lines.guard,
      line: lines.guard?.java ?? 2,
    });
    return steps;
  }

  intervals.sort((a, b) => a.start - b.start);
  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: `按会议开始时间升序排序完成：[${intervals.map((iv) => `M${iv.id}[${iv.start},${iv.end}]`).join(', ')}]`,
    message: '保证时间线推进时会议依次入场',
    log: 'sorted intervals by start time',
    codeLine: lines.sort,
    line: lines.sort?.java ?? 3,
  });

  const heap = new SimpleHeap<number>('min');
  const ganttIntervals: GanttInterval[] = [];
  let nextRoomId = 1;

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: '初始化小根堆 heap = new PriorityQueue()',
    message: '堆顶时刻展示最早腾出空闲的会议室结束时间',
    log: 'init min heap',
    codeLine: lines.initHeap,
    line: lines.initHeap?.java ?? 4,
  });

  for (let i = 0; i < intervals.length; i++) {
    const cur = intervals[i];
    const earliestEnd = heap.peek()?.val;
    const canReuse = earliestEnd !== undefined && cur.start >= earliestEnd;

    steps.push({
      intervals: [...intervals],
      currentMeeting: cur,
      heap: heap.toVisualItems(),
      rooms: [...ganttIntervals],
      currentTime: cur.start,
      maxRooms: Math.max(nextRoomId - 1, heap.size()),
      decision: `考察会议 M${cur.id} [${cur.start}, ${cur.end}]：当前堆顶最早结束时间为 ${earliestEnd !== undefined ? earliestEnd : '无(堆空)'}`,
      message: canReuse
        ? `开始时间 ${cur.start} >= 最早结束时间 ${earliestEnd}，可以复用会议室！`
        : `开始时间 ${cur.start} < 最早结束时间 ${earliestEnd !== undefined ? earliestEnd : '空'}，必须新开会议室！`,
      log: `inspect M${cur.id} [${cur.start},${cur.end}], earliestEnd=${earliestEnd}`,
      codeLine: lines.loopMeeting,
      line: lines.loopMeeting?.java ?? 5,
    });

    let assignedTrack = 0;
    if (canReuse) {
      const popped = heap.pop()!;
      assignedTrack = popped.extra || 0;
      steps.push({
        intervals: [...intervals],
        currentMeeting: cur,
        heap: heap.toVisualItems(),
        rooms: [...ganttIntervals],
        currentTime: cur.start,
        maxRooms: Math.max(nextRoomId - 1, heap.size()),
        decision: `♻️ 复用会议室：弹出已结束会议 (原结束时间 ${popped.val})，房间轨道 ${assignedTrack + 1} 已空出`,
        message: '复用旧会议室，无需增加房间',
        log: `reused room track ${assignedTrack + 1}`,
        codeLine: lines.reuseRoom,
        line: lines.reuseRoom?.java ?? 6,
      });
    } else {
      assignedTrack = nextRoomId - 1;
      nextRoomId++;
      steps.push({
        intervals: [...intervals],
        currentMeeting: cur,
        heap: heap.toVisualItems(),
        rooms: [...ganttIntervals],
        currentTime: cur.start,
        maxRooms: nextRoomId - 1,
        decision: `➕ 增开会议室：增设第 ${nextRoomId - 1} 间会议室`,
        message: '所有已有会议室当前均被占用',
        log: `opened new room ${nextRoomId - 1}`,
        codeLine: lines.pushMeeting,
        line: lines.pushMeeting?.java ?? 7,
      });
    }

    heap.push(cur.end, assignedTrack);
    ganttIntervals.push({
      id: cur.id,
      label: `M${cur.id}`,
      start: cur.start,
      end: cur.end,
      trackIndex: assignedTrack,
      color: '#3b82f6',
      active: true,
    });

    steps.push({
      intervals: [...intervals],
      currentMeeting: cur,
      heap: heap.toVisualItems(),
      rooms: [...ganttIntervals],
      currentTime: cur.start,
      maxRooms: Math.max(nextRoomId - 1, heap.size()),
      decision: `将会议 M${cur.id} 的结束时间 ${cur.end} 压入小根堆，分配至轨道 ${assignedTrack + 1}`,
      message: `当前小根堆占用量 = ${heap.size()}`,
      log: `pushed ${cur.end} to heap`,
      codeLine: lines.pushMeeting,
      line: lines.pushMeeting?.java ?? 7,
    });
  }

  const finalRooms = nextRoomId - 1;
  steps.push({
    intervals: [...intervals],
    heap: heap.toVisualItems(),
    rooms: [...ganttIntervals],
    maxRooms: finalRooms,
    decision: `🎉 贪心推演完毕！最少需要 ${finalRooms} 间会议室`,
    message: `小根堆维护将时间复杂度降至 O(N log N)`,
    log: `done minMeetingRooms=${finalRooms}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 8,
  });

  return steps;
}

export function buildMeetingRoomsStage3Steps(rawIntervals: number[][]): MeetingRoomsStep[] {
  const steps: MeetingRoomsStep[] = [];
  const lines = MEETING_ROOMS_STAGE3_LINES;

  const intervals: MeetingInterval[] = rawIntervals.map((iv, idx) => ({
    id: idx + 1,
    start: iv[0],
    end: iv[1],
  }));

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: '阶段 3：最大重叠峰值下界定理与贪心策略最优性反证',
    message: '数学定理：若时间线上存在某个瞬间有 K 场会议同时进行，则任何合法调度至少需要 K 间会议室！',
    log: 'enter verifyPeakInvariant',
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  let peakCount = 0;
  intervals.forEach((cur) => {
    let c = 0;
    intervals.forEach((other) => {
      if (other.start <= cur.start && other.end > cur.start) c++;
    });
    if (c > peakCount) peakCount = c;
  });

  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: peakCount,
    decision: `时间轴最大瞬时重叠点验证：峰值并发会议数 = ${peakCount}`,
    message: `小根堆始终让最早结束的会议室优先承接新会议，绝不额外无谓开辟新房间，因此贪心解恰好等于理论下界 ${peakCount}！`,
    log: `peak overlap verified = ${peakCount}`,
    codeLine: lines.assertInvariant,
    line: lines.assertInvariant?.java ?? 2,
  });

  return steps;
}

export function parseMeetingRoomsInput(inputs: Record<string, any>, stage: number): MeetingRoomsStep[] {
  const raw = String(inputs?.['input-intervals'] || '0,30; 5,10; 15,20');
  const pairs = raw
    .split(/[;；]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const intervals: number[][] = [];
  pairs.forEach((p) => {
    const nums = p
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));
    if (nums.length >= 2) {
      intervals.push([nums[0], nums[1]]);
    }
  });

  if (intervals.length === 0) {
    intervals.push([0, 30], [5, 10], [15, 20]);
  }

  if (stage === 1) return buildMeetingRoomsStage1Steps(intervals);
  if (stage === 2) return buildMeetingRoomsStage2Steps(intervals);
  return buildMeetingRoomsStage3Steps(intervals);
}
