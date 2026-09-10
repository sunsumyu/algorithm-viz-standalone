/**
 * 最多可以参加的会议数目 (LeetCode 1353) - 声明式教学级沙盘渲染器
 * 核心贪心：时间指针 day 逐日推进，小根堆维护当前所有可用会议的截止日，贪心优先参加最早截止者
 * 三阶段：
 *   阶段 1: 暴力匹配枚举搜索 (Brute-Force DFS)
 *   阶段 2: 日期推进与小根堆早截止推演 (Greedy Min-Heap)
 *   阶段 3: 早截止失效不可逆反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MEETING_ONE_DAY_STAGE1_CODES,
  MEETING_ONE_DAY_STAGE1_LINES,
  MEETING_ONE_DAY_STAGE2_CODES,
  MEETING_ONE_DAY_STAGE2_LINES,
  MEETING_ONE_DAY_STAGE3_CODES,
  MEETING_ONE_DAY_STAGE3_LINES,
} from './greedy-090-stage-codes';
import {
  Greedy090Step,
  renderGanttTimeline,
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

// ==========================================
// 辅助解析与步进生成器
// ==========================================

function parseEventsInput(raw: string): [number, number][] {
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

  // Step 0: 入口帧
  steps.push({
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
    codeLine: {
      java: stage === 1 ? MEETING_ONE_DAY_STAGE1_LINES.java.init : stage === 2 ? MEETING_ONE_DAY_STAGE2_LINES.java.sort : MEETING_ONE_DAY_STAGE3_LINES.java.intro,
      cpp: stage === 1 ? MEETING_ONE_DAY_STAGE1_LINES.cpp.init : stage === 2 ? MEETING_ONE_DAY_STAGE2_LINES.cpp.sort : MEETING_ONE_DAY_STAGE3_LINES.cpp.intro,
      python: stage === 1 ? MEETING_ONE_DAY_STAGE1_LINES.python.init : stage === 2 ? MEETING_ONE_DAY_STAGE2_LINES.python.sort : MEETING_ONE_DAY_STAGE3_LINES.python.intro,
      javascript: stage === 1 ? MEETING_ONE_DAY_STAGE1_LINES.javascript.init : stage === 2 ? MEETING_ONE_DAY_STAGE2_LINES.javascript.sort : MEETING_ONE_DAY_STAGE3_LINES.javascript.intro,
    },
  });

  if (stage === 1) {
    // 阶段1: 暴力枚举匹配
    let attended = 0;
    const attendedList: string[] = [];
    const items = baseItems.map((x) => ({ ...x }));

    for (let day = minD; day <= Math.min(maxD, minD + 4); day++) {
      steps.push({
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
        codeLine: {
          java: MEETING_ONE_DAY_STAGE1_LINES.java.loop,
          cpp: MEETING_ONE_DAY_STAGE1_LINES.cpp.loop,
          python: MEETING_ONE_DAY_STAGE1_LINES.python.loop,
          javascript: MEETING_ONE_DAY_STAGE1_LINES.javascript.loop,
        },
      });

      // 选一个尚未参加且合法的
      const candidate = items.find((it) => it.status === 'pending' && it.start <= day && day <= it.end);
      if (candidate) {
        candidate.status = 'selected';
        attended++;
        attendedList.push(`${candidate.name} (Day ${day})`);

        steps.push({
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
          codeLine: {
            java: MEETING_ONE_DAY_STAGE1_LINES.java.pick,
            cpp: MEETING_ONE_DAY_STAGE1_LINES.cpp.pick,
            python: MEETING_ONE_DAY_STAGE1_LINES.python.pick,
            javascript: MEETING_ONE_DAY_STAGE1_LINES.javascript.pick,
          },
        });
      }
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: 贪心小根堆
    // 1. 按开始时间排序
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

    steps.push({
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
      codeLine: {
        java: MEETING_ONE_DAY_STAGE2_LINES.java.sort,
        cpp: MEETING_ONE_DAY_STAGE2_LINES.cpp.sort,
        python: MEETING_ONE_DAY_STAGE2_LINES.python.sort,
        javascript: MEETING_ONE_DAY_STAGE2_LINES.javascript.sort,
      },
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
        steps.push({
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
          codeLine: {
            java: MEETING_ONE_DAY_STAGE2_LINES.java.addToday,
            cpp: MEETING_ONE_DAY_STAGE2_LINES.cpp.addToday,
            python: MEETING_ONE_DAY_STAGE2_LINES.python.addToday,
            javascript: MEETING_ONE_DAY_STAGE2_LINES.javascript.addToday,
          },
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
        steps.push({
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
          codeLine: {
            java: MEETING_ONE_DAY_STAGE2_LINES.java.removeExpired,
            cpp: MEETING_ONE_DAY_STAGE2_LINES.cpp.removeExpired,
            python: MEETING_ONE_DAY_STAGE2_LINES.python.removeExpired,
            javascript: MEETING_ONE_DAY_STAGE2_LINES.javascript.removeExpired,
          },
        });
      }

      // 3. 贪心挑选堆顶（最早截止）的会议参加
      if (heap.size() > 0) {
        const best = heap.pop()!;
        best.item.status = 'selected';
        attendedCount++;
        attendedList.push(`${best.item.name} (Day ${day})`);

        steps.push({
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
          codeLine: {
            java: MEETING_ONE_DAY_STAGE2_LINES.java.attend,
            cpp: MEETING_ONE_DAY_STAGE2_LINES.cpp.attend,
            python: MEETING_ONE_DAY_STAGE2_LINES.python.attend,
            javascript: MEETING_ONE_DAY_STAGE2_LINES.javascript.attend,
          },
        });
      }
    }

    steps.push({
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
      codeLine: {
        java: MEETING_ONE_DAY_STAGE2_LINES.java.ret,
        cpp: MEETING_ONE_DAY_STAGE2_LINES.cpp.ret,
        python: MEETING_ONE_DAY_STAGE2_LINES.python.ret,
        javascript: MEETING_ONE_DAY_STAGE2_LINES.javascript.ret,
      },
    });

    return steps;
  }

  // 阶段3: 证明
  steps.push({
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
    codeLine: {
      java: MEETING_ONE_DAY_STAGE3_LINES.java.intro,
      cpp: MEETING_ONE_DAY_STAGE3_LINES.cpp.intro,
      python: MEETING_ONE_DAY_STAGE3_LINES.python.intro,
      javascript: MEETING_ONE_DAY_STAGE3_LINES.javascript.intro,
    },
  });

  steps.push({
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
    codeLine: {
      java: MEETING_ONE_DAY_STAGE3_LINES.java.compare,
      cpp: MEETING_ONE_DAY_STAGE3_LINES.cpp.compare,
      python: MEETING_ONE_DAY_STAGE3_LINES.python.compare,
      javascript: MEETING_ONE_DAY_STAGE3_LINES.javascript.compare,
    },
  });

  return steps;
}

// ==========================================
// 声明式沙盘装配
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<MeetingOneDayStep>({
  id: 'meeting-one-day',
  name: '最多参加会议数目',
  category: 'greedy',
  icon: '🗓️',
  badge: {
    mode: '时间轴扫描与小根堆',
    complexity: 'O(n log n) · O(n)',
  },
  card1Title: '🗓️ 逐日推进甘特调度沙盘',
  card2Title: '⏱️ 小根堆截止时间监视器',
  card2Desc: '展示每日开启入堆、过期剔除与堆顶早截止贪心打卡过程',
  legend: [
    { label: '已选定参会 (成功打卡)', color: '#10b981' },
    { label: '小根堆中候选会议', color: '#f59e0b' },
    { label: '已过期失效会议', color: '#ef4444' },
    { label: '尚未开启会议', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-events',
      label: '会议区间 [startDay, endDay]',
      type: 'text',
      defaultValue: '1,2; 2,3; 3,4; 1,2',
      width: '200px',
    },
  ],
  presets: [
    { label: '经典重叠 (1,2; 2,3; 3,4; 1,2)', values: { 'input-events': '1,2; 2,3; 3,4; 1,2' } },
    { label: '紧凑全冲突 (1,2; 1,2; 1,2)', values: { 'input-events': '1,2; 1,2; 1,2' } },
    { label: '宽限期分散 (1,4; 2,3; 3,4; 1,1)', values: { 'input-events': '1,4; 2,3; 3,4; 1,1' } },
  ],
  metrics: [
    { id: 'current-day', label: '当前推进天数', color: '#38bdf8' },
    { id: 'heap-size', label: '堆内有效候选数', color: '#f59e0b' },
    { id: 'total-attended', label: '累计参会成功数', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力匹配枚举搜索',
      shortName: '暴力匹配',
      card2Desc: '按天尝试每一种会议分配方案，展示指数级回溯复杂度',
      codeLanguages: MEETING_ONE_DAY_STAGE1_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2';
        return buildMeetingOneDaySteps(raw, 1);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 日期推进与小根堆早截止推演',
      shortName: '小根堆贪心',
      card2Desc: '按天推进时间指针，小根堆动态维护所有可用会议的截止日，贪心打卡堆顶',
      codeLanguages: MEETING_ONE_DAY_STAGE2_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2';
        return buildMeetingOneDaySteps(raw, 2);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 早截止失效不可逆反证',
      shortName: '贪心证明',
      card2Desc: '反证证明优先消费早截止会议不劣于保留到未来，相容性单调占优',
      codeLanguages: MEETING_ONE_DAY_STAGE3_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2';
        return buildMeetingOneDaySteps(raw, 3);
      },
    },
  ],
  codeLanguages: MEETING_ONE_DAY_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.meetingOneDay.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么只占一天时必须按“截止日小根堆”贪心？</h3>
      <p><b>反向思考：紧迫度原则</b></p>
      <p>在某一天 <code>day</code>，如果有多场会议都可以今天去打卡：</p>
      <ul>
        <li>会议 A 截止日是明天（即将过期）；</li>
        <li>会议 B 截止日是下周（时间充裕）。</li>
      </ul>
      <p>如果今天不去 A，明天 A 就永久作废了，产生净损失；而如果今天去 A，把 B 留给后天去参加，完全不影响最终总数！</p>
      <p>因此，<b>早截止日代表更高的紧迫性与更短的容忍度</b>，小根堆贪心正是紧迫度排队的完美实现。</p>
    </div>
  `,
  buildSteps: (inputs) => {
    const raw = inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2';
    return buildMeetingOneDaySteps(raw, 2);
  },
  renderCanvas: (container, step) => {
    renderGanttTimeline(container, {
      intervals: step.intervals,
      currentTime: step.currentDay,
      minTime: step.minDay,
      maxTime: step.maxDay,
      tracksCount: step.tracksCount,
      cursorLabel: '今日指针',
    });

    const root = container.closest('.dsp-view-root') || document;
    const dayEl = root.querySelector('#metric-current-day');
    const heapEl = root.querySelector('#metric-heap-size');
    const attendEl = root.querySelector('#metric-total-attended');

    if (dayEl) dayEl.textContent = `Day ${step.currentDay}`;
    if (heapEl) heapEl.textContent = `${step.heapContents.length} 场`;
    if (attendEl) attendEl.textContent = `${step.totalAttended} 场`;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">小根堆当前截止日:</span>
          <span style="font-size: 11px; color: #10b981; font-weight: 700; font-family: monospace;">[${step.heapContents.join(', ') || '空'}]</span>
        </div>
        <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
          ${step.message}
        </div>
      </div>
    `;
  },
});

export const meetingOneDayRenderer = Visualizer;
registerAlgorithm({
  id: 'meeting-one-day',
  name: '最多参加会议数目 (LeetCode 1353)',
  viewId: 'algo-meeting-one-day-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code04：时间逐日推进与小根堆最早截止优先贪心',
  icon: '🗓️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 904,
  learningGoal: '掌握紧迫度排序思想与早截止失效不可逆性反证',
});
