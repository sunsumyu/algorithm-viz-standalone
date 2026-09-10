/**
 * 会议独占时间段的最大会议数量 (LeetCode 435 / 洛谷 P1803) - 声明式教学级沙盘渲染器
 * 核心贪心：按结束时间升序排序，优先安排结束最早的会议；包含洛谷桶优化推演
 * 三阶段：
 *   阶段 1: 暴力独立子集穷举对比 (Brute-Force DFS)
 *   阶段 2: 结束时间排序贪心 + 洛谷桶优化推演 (Greedy & Bucket)
 *   阶段 3: 区间调度数学归纳反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MEETING_MONOPOLY_STAGE1_CODES,
  MEETING_MONOPOLY_STAGE1_LINES,
  MEETING_MONOPOLY_STAGE2_CODES,
  MEETING_MONOPOLY_STAGE2_LINES,
  MEETING_MONOPOLY_STAGE3_CODES,
  MEETING_MONOPOLY_STAGE3_LINES,
} from './greedy-090-stage-codes';
import {
  Greedy090Step,
  renderGanttTimeline,
  GanttIntervalItem,
} from './greedy-090-shared';

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

// ==========================================
// 辅助解析与步进生成器
// ==========================================

function parseIntervalsInput(raw: string): [number, number][] {
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

  // Step 0: 入口帧
  steps.push({
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
    codeLine: {
      java: stage === 1 ? MEETING_MONOPOLY_STAGE1_LINES.java.init : stage === 2 ? MEETING_MONOPOLY_STAGE2_LINES.java.sort : MEETING_MONOPOLY_STAGE3_LINES.java.intro,
      cpp: stage === 1 ? MEETING_MONOPOLY_STAGE1_LINES.cpp.init : stage === 2 ? MEETING_MONOPOLY_STAGE2_LINES.cpp.sort : MEETING_MONOPOLY_STAGE3_LINES.cpp.intro,
      python: stage === 1 ? MEETING_MONOPOLY_STAGE1_LINES.python.init : stage === 2 ? MEETING_MONOPOLY_STAGE2_LINES.python.sort : MEETING_MONOPOLY_STAGE3_LINES.python.intro,
      javascript: stage === 1 ? MEETING_MONOPOLY_STAGE1_LINES.javascript.init : stage === 2 ? MEETING_MONOPOLY_STAGE2_LINES.javascript.sort : MEETING_MONOPOLY_STAGE3_LINES.javascript.intro,
    },
  });

  if (stage === 1) {
    // 阶段1: 暴力选择演示
    let selected = 0;
    let lastE = -Infinity;
    const items = baseItems.map((item) => ({ ...item }));

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.status = 'active';

      steps.push({
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
        codeLine: {
          java: MEETING_MONOPOLY_STAGE1_LINES.java.check,
          cpp: MEETING_MONOPOLY_STAGE1_LINES.cpp.check,
          python: MEETING_MONOPOLY_STAGE1_LINES.python.check,
          javascript: MEETING_MONOPOLY_STAGE1_LINES.javascript.check,
        },
      });

      if (it.start >= lastE) {
        it.status = 'selected';
        selected++;
        lastE = it.end;
        steps.push({
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
          codeLine: {
            java: MEETING_MONOPOLY_STAGE1_LINES.java.pick,
            cpp: MEETING_MONOPOLY_STAGE1_LINES.cpp.pick,
            python: MEETING_MONOPOLY_STAGE1_LINES.python.pick,
            javascript: MEETING_MONOPOLY_STAGE1_LINES.javascript.pick,
          },
        });
      } else {
        it.status = 'discarded';
        steps.push({
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
          codeLine: {
            java: MEETING_MONOPOLY_STAGE1_LINES.java.skip,
            cpp: MEETING_MONOPOLY_STAGE1_LINES.cpp.skip,
            python: MEETING_MONOPOLY_STAGE1_LINES.python.skip,
            javascript: MEETING_MONOPOLY_STAGE1_LINES.javascript.skip,
          },
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

    steps.push({
      stepIndex: steps.length,
      intervals: items.map((x) => ({ ...x })),
      minTime: minT,
      maxTime: maxT,
      tracksCount: 3,
      selectedCount: 0,
      discardedCount: 0,
      curEnd: -Infinity,
      decision: '按结束时间升序重排',
      message: `核心贪心预处理：将所有会议按结束时间 end 从小到大重排完毕！`,
      log: '[Sort] 会议按结束时间排序完成。',
      codeLine: {
        java: MEETING_MONOPOLY_STAGE2_LINES.java.sort,
        cpp: MEETING_MONOPOLY_STAGE2_LINES.cpp.sort,
        python: MEETING_MONOPOLY_STAGE2_LINES.python.sort,
        javascript: MEETING_MONOPOLY_STAGE2_LINES.javascript.sort,
      },
    });

    let selected = 0;
    let curEnd = -Infinity;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.status = 'active';

      steps.push({
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
        codeLine: {
          java: MEETING_MONOPOLY_STAGE2_LINES.java.check,
          cpp: MEETING_MONOPOLY_STAGE2_LINES.cpp.check,
          python: MEETING_MONOPOLY_STAGE2_LINES.python.check,
          javascript: MEETING_MONOPOLY_STAGE2_LINES.javascript.check,
        },
      });

      if (it.start >= curEnd) {
        it.status = 'selected';
        selected++;
        curEnd = it.end;

        steps.push({
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
          codeLine: {
            java: MEETING_MONOPOLY_STAGE2_LINES.java.update,
            cpp: MEETING_MONOPOLY_STAGE2_LINES.cpp.update,
            python: MEETING_MONOPOLY_STAGE2_LINES.python.update,
            javascript: MEETING_MONOPOLY_STAGE2_LINES.javascript.update,
          },
        });
      } else {
        it.status = 'discarded';
        steps.push({
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
          codeLine: {
            java: MEETING_MONOPOLY_STAGE2_LINES.java.loop,
            cpp: MEETING_MONOPOLY_STAGE2_LINES.cpp.loop,
            python: MEETING_MONOPOLY_STAGE2_LINES.python.loop,
            javascript: MEETING_MONOPOLY_STAGE2_LINES.javascript.loop,
          },
        });
      }
    }

    steps.push({
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
      codeLine: {
        java: MEETING_MONOPOLY_STAGE2_LINES.java.ret,
        cpp: MEETING_MONOPOLY_STAGE2_LINES.cpp.ret,
        python: MEETING_MONOPOLY_STAGE2_LINES.python.ret,
        javascript: MEETING_MONOPOLY_STAGE2_LINES.javascript.ret,
      },
    });

    return steps;
  }

  // 阶段3: 反证证明
  steps.push({
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
    codeLine: {
      java: MEETING_MONOPOLY_STAGE3_LINES.java.base,
      cpp: MEETING_MONOPOLY_STAGE3_LINES.cpp.base,
      python: MEETING_MONOPOLY_STAGE3_LINES.python.base,
      javascript: MEETING_MONOPOLY_STAGE3_LINES.javascript.base,
    },
  });

  steps.push({
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
    codeLine: {
      java: MEETING_MONOPOLY_STAGE3_LINES.java.step,
      cpp: MEETING_MONOPOLY_STAGE3_LINES.cpp.step,
      python: MEETING_MONOPOLY_STAGE3_LINES.python.step,
      javascript: MEETING_MONOPOLY_STAGE3_LINES.javascript.step,
    },
  });

  steps.push({
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
    codeLine: {
      java: MEETING_MONOPOLY_STAGE3_LINES.java.conclusion,
      cpp: MEETING_MONOPOLY_STAGE3_LINES.cpp.conclusion,
      python: MEETING_MONOPOLY_STAGE3_LINES.python.conclusion,
      javascript: MEETING_MONOPOLY_STAGE3_LINES.javascript.conclusion,
    },
  });

  return steps;
}

// ==========================================
// 声明式沙盘装配
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<MeetingMonopolyStep>({
  id: 'meeting-monopoly',
  name: '会议独占最大数量',
  category: 'greedy',
  icon: '📅',
  badge: {
    mode: '结束时间排序与桶优化',
    complexity: 'O(n log n) · O(1)',
  },
  card1Title: '📅 多轨道甘特时间调度沙盘',
  card2Title: '⏱️ 独占时间游标与区间状态看板',
  card2Desc: '展示会议起止区间、冲突舍弃排查与相容留白推演',
  legend: [
    { label: '已选入会议 (不冲突)', color: '#10b981' },
    { label: '当前考察中会议', color: '#f59e0b' },
    { label: '冲突淘汰会议', color: '#ef4444' },
    { label: '等待考察会议', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-intervals',
      label: '会议区间 [start, end]',
      type: 'text',
      defaultValue: '1,2; 2,3; 3,4; 1,3',
      width: '200px',
    },
  ],
  presets: [
    { label: '标准重叠用例 (1,2; 2,3; 3,4; 1,3)', values: { 'input-intervals': '1,2; 2,3; 3,4; 1,3' } },
    { label: '全重叠区间 (1,5; 2,6; 3,7; 4,8)', values: { 'input-intervals': '1,5; 2,6; 3,7; 4,8' } },
    { label: '包含区间 (1,10; 2,3; 4,5; 6,7)', values: { 'input-intervals': '1,10; 2,3; 4,5; 6,7' } },
  ],
  metrics: [
    { id: 'selected-count', label: '最多可参会数', color: '#10b981' },
    { id: 'discarded-count', label: '最少需移除数', color: '#ef4444' },
    { id: 'cur-end', label: '当前空闲推进时刻', color: '#38bdf8' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力独立子集穷举对比',
      shortName: '暴力穷举',
      card2Desc: '枚举所有可能的分支，展示指数级时间复杂度',
      codeLanguages: MEETING_MONOPOLY_STAGE1_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3';
        return buildMeetingMonopolySteps(raw, 1);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 结束时间排序贪心推演',
      shortName: '结束时间贪心',
      card2Desc: '按结束时间升序排序，每次挑选最早结束的相容会议，留出最大空余',
      codeLanguages: MEETING_MONOPOLY_STAGE2_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3';
        return buildMeetingMonopolySteps(raw, 2);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 区间调度数学归纳证明',
      shortName: '贪心证明',
      card2Desc: '归纳证明贪心解永远不比任意合法解更晚结束，相容空间严格最大',
      codeLanguages: MEETING_MONOPOLY_STAGE3_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3';
        return buildMeetingMonopolySteps(raw, 3);
      },
    },
  ],
  codeLanguages: MEETING_MONOPOLY_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.meetingMonopoly.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么按结束时间升序排序一定最优？</h3>
      <p><b>直观洞察：</b></p>
      <p>一个会议占用时间越早结束，就越早把会议室空出来，给后续会议留下的可用时间段 <code>[end, +∞)</code> 就越充裕！</p>
      <p><b>为什么不能按开始时间排序？反例：</b></p>
      <p>会议 A <code>[0, 100]</code>，会议 B <code>[1, 2]</code>，会议 C <code>[3, 4]</code>。若按开始时间排序会错误地首先选择 A，导致后续全部冲突，只能参加 1 场；而最优解显然是参加 B 和 C（共 2 场）。</p>
      
      <p><b>洛谷 P1803 数组桶优化 ($O(N)$)：</b></p>
      <p>当时间范围最大为 $10^6$ 时，若排序耗时过高，可以开辟数组 <code>latest[end]</code>，记录以 <code>end</code> 结束的会议中最晚的开始时间。直接从 0 到 $10^6$ 遍历时间刻度，跳过排序达到严格 $O(N)$！</p>
    </div>
  `,
  buildSteps: (inputs) => {
    const raw = inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3';
    return buildMeetingMonopolySteps(raw, 2);
  },
  renderCanvas: (container, step) => {
    renderGanttTimeline(container, {
      intervals: step.intervals,
      currentTime: step.currentTime,
      minTime: step.minTime,
      maxTime: step.maxTime,
      tracksCount: step.tracksCount,
      cursorLabel: '时间指针',
    });

    const root = container.closest('.dsp-view-root') || document;
    const selEl = root.querySelector('#metric-selected-count');
    const dropEl = root.querySelector('#metric-discarded-count');
    const curEndEl = root.querySelector('#metric-cur-end');

    if (selEl) selEl.textContent = `${step.selectedCount} 场`;
    if (dropEl) dropEl.textContent = `${step.discardedCount} 场`;
    if (curEndEl) curEndEl.textContent = step.curEnd === -Infinity ? '尚未开始' : `T = ${step.curEnd}`;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">当前推演决策:</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
        </div>
        <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
          ${step.message}
        </div>
      </div>
    `;
  },
});

export const meetingMonopolyRenderer = Visualizer;
registerAlgorithm({
  id: 'meeting-monopoly',
  name: '会议独占最大数量 (LeetCode 435 / 洛谷 P1803)',
  viewId: 'algo-meeting-monopoly-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code03：结束时间排序贪心与洛谷最晚开始桶 O(N) 优化',
  icon: '📅',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 903,
  learningGoal: '理解结束时间贪心如何为后续留出最大可用时间裕度',
});
