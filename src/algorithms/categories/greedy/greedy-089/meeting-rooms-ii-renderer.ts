/**
 * 会议室 II (LeetCode 253 / LintCode 919) - 声明式教学级沙盘渲染器
 * 核心贪心：按开始时间排序 + 小根堆动态维护最早结束时间以复用会议室
 * 三阶段：
 *   阶段 1: 暴力重叠度检查对比 (Brute-Force)
 *   阶段 2: 排序 + 小根堆贪心推演 (Greedy)
 *   阶段 3: 最大并发区间点反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  MEETING_ROOMS_STAGE1_CODES,
  MEETING_ROOMS_STAGE1_LINES,
  MEETING_ROOMS_STAGE2_CODES,
  MEETING_ROOMS_STAGE2_LINES,
  MEETING_ROOMS_STAGE3_CODES,
  MEETING_ROOMS_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  renderDualHeapVisual,
  renderGanttTimeline,
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

// ==========================================
// 1. 阶段 1：暴力时间点重叠扫描步进
// ==========================================
export function buildMeetingRoomsStage1Steps(rawIntervals: number[][]): MeetingRoomsStep[] {
  const steps: MeetingRoomsStep[] = [];
  const lines = MEETING_ROOMS_STAGE1_LINES;

  const intervals: MeetingInterval[] = rawIntervals.map((iv, idx) => ({
    id: idx + 1,
    start: iv[0],
    end: iv[1],
  }));

  // Step 0: 入口
  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: `主函数入口：共有 ${intervals.length} 场会议需要安排`,
    message: '阶段 1 暴力算法：遍历每个会议的开始时间点，统计与其它所有会议的并发重叠数量',
    log: `enter minMeetingRoomsBrute(n=${intervals.length})`,
    codeLine: lines.entry,
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
    });
  }

  // 收敛
  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms,
    decision: `🎉 暴力扫描完成！最少需要 ${maxRooms} 间会议室`,
    message: `双重循环时间复杂度为 O(N^2)`,
    log: `done maxRooms=${maxRooms}`,
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：排序 + 小根堆贪心推演步进
// ==========================================
export function buildMeetingRoomsStage2Steps(rawIntervals: number[][]): MeetingRoomsStep[] {
  const steps: MeetingRoomsStep[] = [];
  const lines = MEETING_ROOMS_STAGE2_LINES;

  const intervals: MeetingInterval[] = rawIntervals.map((iv, idx) => ({
    id: idx + 1,
    start: iv[0],
    end: iv[1],
  }));

  // Step 0: 入口
  steps.push({
    intervals: [...intervals],
    heap: [],
    rooms: [],
    maxRooms: 0,
    decision: `主函数入口：共有 ${intervals.length} 场会议待安排`,
    message: '核心贪心：按开始时间排序，小根堆动态维护正在使用的会议室的最早结束时间',
    log: `enter minMeetingRooms(n=${intervals.length})`,
    codeLine: lines.entry,
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
    });
    return steps;
  }

  // 排序
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
  });

  // 初始化小根堆
  const heap = new SimpleHeap<number>('min'); // 存 end time, extra 记录 roomId
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
      });
    }

    // 压入当前会议
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
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：最大重叠峰值反证证明步进
// ==========================================
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
  });

  // 寻找真实峰值
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
  });

  return steps;
}

// ==========================================
// 4. 声明式可视化器配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<MeetingRoomsStep>({
  id: 'meeting-rooms-ii',
  name: '会议室 II (Meeting Rooms II)',
  category: 'greedy',
  icon: '🏢',
  badge: {
    mode: '排序+小根堆贪心',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '📊 甘特图多轨道时间轴沙盘',
  card2Title: '🌲 小根堆双形态呈现 (二叉树 + 物理数组)',
  card2Desc: '堆顶时刻保存最早结束的会议室时间，支持新会议无缝复用',
  legend: [
    { label: '正在占用', color: '#3b82f6' },
    { label: '当前考察', color: '#ef4444' },
    { label: '空闲轨道', color: '#f1f5f9' },
  ],
  inputs: [
    {
      id: 'input-intervals',
      label: '会议时间区间',
      type: 'text',
      defaultValue: '0,30; 5,10; 15,20',
      width: '200px',
      placeholder: 'start,end; 如 0,30; 5,10',
    },
  ],
  presets: [
    { label: '示例 1: 0,30; 5,10; 15,20', values: { 'input-intervals': '0,30; 5,10; 15,20' } },
    { label: '示例 2: 7,10; 2,4', values: { 'input-intervals': '7,10; 2,4' } },
    { label: '复杂重叠 (5场)', values: { 'input-intervals': '1,10; 2,7; 3,19; 8,12; 10,20; 11,30' } },
  ],
  metrics: [
    { id: 'total-rooms', label: '所需会议室数', color: '#10b981' },
    { id: 'heap-size', label: '活跃房间堆容量', color: '#3b82f6' },
    { id: 'current-time', label: '当前推进时间 t', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力重叠对比',
      shortName: '暴力对比',
      card2Desc: '枚举各个会议开始时刻，统计同时活跃会议数',
      codeLanguages: MEETING_ROOMS_STAGE1_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 小根堆贪心',
      shortName: '堆贪心',
      card2Desc: '按开始时间排序，堆顶最早结束会议室动态复用',
      codeLanguages: MEETING_ROOMS_STAGE2_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 最大重叠反证',
      shortName: '贪心证明',
      card2Desc: '证明小根堆贪心解严格等于时间线峰值并发数，无任何浪费',
      codeLanguages: MEETING_ROOMS_STAGE3_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 3),
    },
  ],
  codeLanguages: MEETING_ROOMS_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.meetingRoomsII.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 小根堆贪心复用为什么一定最优？</h3>
      <p><b>反证法：</b></p>
      <p>假设在考察会议 <code>[start, end]</code> 时，堆顶最早结束时间为 <code>earliestEnd</code>。</p>
      <ul>
        <li>若 <code>start &gt;= earliestEnd</code>：堆顶会议室已空出，直接给该会议使用，不会对任何后续会议造成更劣的影响；</li>
        <li>若 <code>start &lt; earliestEnd</code>：这意味着当前堆内所有活跃会议室的结束时间都晚于 <code>start</code>，即在 <code>start</code> 这一瞬间，所有这些会议都处于进行中！任何调度算法在此刻都必须同时提供至少 <code>heap.size() + 1</code> 间会议室，因此增开新会议室是不可避免的必要开销。</li>
      </ul>
      <p>故小根堆贪心分配必然取得最少会议室数量，且时间复杂度为最优的 $O(N \\log N)$。</p>
    </div>
  `,
  buildSteps: (inputs) => parseAndBuild(inputs, 2),
  renderCanvas: (container, step) => {
    const rooms = step.rooms || [];
    const numTracks = Math.max(1, step.maxRooms || 1);
    let maxTime = 30;
    step.intervals.forEach((iv) => {
      if (iv.end > maxTime) maxTime = iv.end;
    });

    renderGanttTimeline(container, rooms, numTracks, step.currentTime, maxTime + 2);
  },
  renderCustomMetrics: (container, step) => {
    const heapItems = step.heap || [];
    renderDualHeapVisual(container, heapItems, 'min', '小根堆 (维护正在进行的会议室结束时间)');
  },
});

function parseAndBuild(inputs: Record<string, any>, stage: number): MeetingRoomsStep[] {
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

export const MeetingRoomsVisualizer = Visualizer;

registerAlgorithm({
  id: 'meeting-rooms-ii',
  name: '会议室 II (Meeting Rooms II)',
  viewId: 'algo-meeting-rooms-ii-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code04：LeetCode 253 会议室 II，小根堆动态维护最早结束时间与多轨道甘特图',
  icon: '🏢',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 894,
  learningGoal: '掌握小根堆在区间调度与重叠问题中的核心应用，理解最早空闲复用的贪心策略',
});
