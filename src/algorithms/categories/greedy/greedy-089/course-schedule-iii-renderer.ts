/**
 * 课程表 III (LeetCode 630) - 声明式教学级沙盘渲染器
 * 核心贪心：按截止时间升序排序 + 大根堆反悔机制 (Regret Greedy)
 * 三阶段：
 *   阶段 1: 暴力子集搜索对比 (Brute-Force DFS O(2^N))
 *   阶段 2: 大根堆反悔贪心推演 (Greedy O(N log N))
 *   阶段 3: 反悔替换不劣性反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  COURSE_SCHEDULE_STAGE1_CODES,
  COURSE_SCHEDULE_STAGE1_LINES,
  COURSE_SCHEDULE_STAGE2_CODES,
  COURSE_SCHEDULE_STAGE2_LINES,
  COURSE_SCHEDULE_STAGE3_CODES,
  COURSE_SCHEDULE_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  renderDualHeapVisual,
  HeapVisualItem,
  SimpleHeap,
} from './greedy-089-shared';

export interface CourseItem {
  id: number;
  duration: number;
  lastDay: number;
  status?: 'pending' | 'selected' | 'regretted' | 'rejected';
}

export interface CourseScheduleStep extends Greedy089Step {
  courses: CourseItem[];
  currentCourse?: CourseItem;
  heap: HeapVisualItem[];
  currentTime: number;
  selectedCount: number;
  regretEvent?: {
    replacedDuration: number;
    newDuration: number;
    savedTime: number;
  };
}

// ==========================================
// 1. 阶段 1：暴力搜索所有子集
// ==========================================
export function buildCourseScheduleStage1Steps(rawCourses: number[][]): CourseScheduleStep[] {
  const steps: CourseScheduleStep[] = [];
  const lines = COURSE_SCHEDULE_STAGE1_LINES;

  const courses: CourseItem[] = rawCourses.map((c, idx) => ({
    id: idx + 1,
    duration: c[0],
    lastDay: c[1],
  }));

  // Step 0: 入口
  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: `主函数入口：共 ${courses.length} 门课程待修读`,
    message: '阶段 1 暴力搜索：DFS 尝试每门课程“选”或“不选”，时间复杂度达 O(2^N)',
    log: `enter scheduleCourseBrute(n=${courses.length})`,
    codeLine: lines.entry,
  });

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: '启动搜索：dfs(idx=0, time=0, count=0)',
    message: '从第 1 门课开始枚举所有组合',
    log: 'call dfs(0, 0, 0)',
    codeLine: lines.callDfs,
  });

  let maxCount = 0;
  function dfs(idx: number, time: number, count: number, path: CourseItem[]) {
    if (steps.length > 200) return;
    if (idx === courses.length) {
      if (count > maxCount) maxCount = count;
      steps.push({
        courses: courses.map((c) => ({
          ...c,
          status: path.some((p) => p.id === c.id) ? 'selected' : 'rejected',
        })),
        heap: [],
        currentTime: time,
        selectedCount: count,
        decision: `到达叶子节点：修读课程数 = ${count}，累计耗时 = ${time} 天 ➔ ${count >= maxCount ? '保持/刷新最大门数' : '较劣解'}`,
        message: `当前最多修读门数: ${maxCount}`,
        log: `leaf: count=${count}, time=${time}`,
        codeLine: lines.dfsBase,
      });
      return;
    }

    const cur = courses[idx];

    // 分支 1: 不选当前课程
    steps.push({
      courses: [...courses],
      currentCourse: cur,
      heap: [],
      currentTime: time,
      selectedCount: count,
      decision: `分支 1：放弃修读课程 C${cur.id} (耗时 ${cur.duration}, 截止 ${cur.lastDay})`,
      message: '时间线不增加，继续考察下一门',
      log: `skip course C${cur.id}`,
      codeLine: lines.branchNotTake,
    });
    dfs(idx + 1, time, count, path);

    // 分支 2: 若时间允许，选当前课程
    if (time + cur.duration <= cur.lastDay) {
      steps.push({
        courses: [...courses],
        currentCourse: cur,
        heap: [],
        currentTime: time + cur.duration,
        selectedCount: count + 1,
        decision: `分支 2：选择修读课程 C${cur.id}，耗时由 ${time} 增至 ${time + cur.duration} <= 截止日 ${cur.lastDay}`,
        message: '合法修读，深入下一层',
        log: `take course C${cur.id}`,
        codeLine: lines.branchTake,
      });
      path.push(cur);
      dfs(idx + 1, time + cur.duration, count + 1, path);
      path.pop();
    }
  }

  dfs(0, 0, 0, []);

  // 结算
  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: maxCount,
    decision: `🎉 暴力回溯完成！最多可修读 ${maxCount} 门课程`,
    message: 'N 较大时指数爆炸不可行，必须采用大根堆反悔贪心！',
    log: `done maxCount=${maxCount}`,
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：大根堆反悔贪心推演
// ==========================================
export function buildCourseScheduleStage2Steps(rawCourses: number[][]): CourseScheduleStep[] {
  const steps: CourseScheduleStep[] = [];
  const lines = COURSE_SCHEDULE_STAGE2_LINES;

  const courses: CourseItem[] = rawCourses.map((c, idx) => ({
    id: idx + 1,
    duration: c[0],
    lastDay: c[1],
    status: 'pending',
  }));

  // Step 0: 入口
  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: `主函数入口：共有 ${courses.length} 门课程，准备执行反悔贪心调度`,
    message: '核心策略：按截止时间升序排序 + 大根堆维护已选课程耗时，超时则剔除耗时最长的课！',
    log: `enter scheduleCourse(n=${courses.length})`,
    codeLine: lines.entry,
  });

  // 1. 排序
  courses.sort((a, b) => a.lastDay - b.lastDay);
  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: `按截止时间 lastDay 升序排序完成：[${courses.map((c) => `C${c.id}(d:${c.duration},end:${c.lastDay})`).join(', ')}]`,
    message: '保证越早截止的课程越早被规划考察',
    log: 'sorted courses by lastDay',
    codeLine: lines.sort,
  });

  // 2. 初始化大根堆
  const heap = new SimpleHeap<number>('max'); // 存 duration, extra 存 courseId
  let time = 0;

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: '初始化大根堆 heap = new PriorityQueue((a, b) -> b - a)，当前时间 time = 0',
    message: '大根堆顶时刻保存已选课程中最耗时的课，以便超时时精准反悔',
    log: 'init max heap',
    codeLine: lines.initHeap,
  });

  for (let i = 0; i < courses.length; i++) {
    const cur = courses[i];
    const canTakeDirect = time + cur.duration <= cur.lastDay;

    steps.push({
      courses: [...courses],
      currentCourse: cur,
      heap: heap.toVisualItems(),
      currentTime: time,
      selectedCount: heap.size(),
      decision: `考察课程 C${cur.id} [时长 ${cur.duration} 天, 截止第 ${cur.lastDay} 天]：当前已用 time = ${time} 天`,
      message: canTakeDirect
        ? `time + duration (${time + cur.duration}) <= 截止日 ${cur.lastDay}，时间充裕，直接选修！`
        : `time + duration (${time + cur.duration}) > 截止日 ${cur.lastDay}，发生超时！检查是否能够反悔替换`,
      log: `inspect C${cur.id} dur=${cur.duration} end=${cur.lastDay}`,
      codeLine: lines.loopCourse,
    });

    if (canTakeDirect) {
      time += cur.duration;
      heap.push(cur.duration, cur.id);
      cur.status = 'selected';
      steps.push({
        courses: [...courses],
        currentCourse: cur,
        heap: heap.toVisualItems(),
        currentTime: time,
        selectedCount: heap.size(),
        decision: `✅ 正常选修：入选 C${cur.id}，时长 ${cur.duration} 天入大根堆，累计时间推进至 ${time} 天`,
        message: `当前已修课程门数: ${heap.size()}`,
        log: `take course C${cur.id}, time=${time}`,
        codeLine: lines.takeDirect,
      });
    } else {
      const topDuration = heap.peek()?.val;
      const canRegret = topDuration !== undefined && topDuration > cur.duration;

      if (canRegret) {
        const popped = heap.pop()!;
        const savedTime = popped.val - cur.duration;
        time += cur.duration - popped.val;
        heap.push(cur.duration, cur.id);

        // 更新状态
        const oldCourse = courses.find((c) => c.id === popped.extra);
        if (oldCourse) oldCourse.status = 'regretted';
        cur.status = 'selected';

        steps.push({
          courses: [...courses],
          currentCourse: cur,
          heap: heap.toVisualItems(),
          currentTime: time,
          selectedCount: heap.size(),
          regretEvent: {
            replacedDuration: popped.val,
            newDuration: cur.duration,
            savedTime,
          },
          decision: `🔄 触发反悔贪心！剔除耗时最长的课 C${popped.extra} (时长 ${popped.val} 天)，换入当前短课 C${cur.id} (时长 ${cur.duration} 天)`,
          message: `门数不变 (${heap.size()}门)，但总累计时间净减少 ${savedTime} 天 (回退至 ${time} 天)！大幅扩充后续余裕！`,
          log: `regret swap: replaced dur ${popped.val} with ${cur.duration}`,
          codeLine: lines.regretSwap,
        });
      } else {
        cur.status = 'rejected';
        steps.push({
          courses: [...courses],
          currentCourse: cur,
          heap: heap.toVisualItems(),
          currentTime: time,
          selectedCount: heap.size(),
          decision: `❌ 无法反悔：当前课程时长 ${cur.duration} 不小于堆顶时长 ${topDuration || 0}，替换无收益，果断放弃`,
          message: '放弃该超时课程',
          log: `reject course C${cur.id}`,
          codeLine: lines.loopCourse,
        });
      }
    }
  }

  // 收敛
  const finalAns = heap.size();
  steps.push({
    courses: [...courses],
    heap: heap.toVisualItems(),
    currentTime: time,
    selectedCount: finalAns,
    decision: `🎉 反悔贪心推演完毕！最多可成功修读 ${finalAns} 门课程（最终累计耗时 ${time} 天）`,
    message: `大根堆反悔贪心算法时间复杂度为 O(N log N)，空间复杂度 O(N)`,
    log: `done finalAns=${finalAns}`,
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：反悔替换不劣性证明步进
// ==========================================
export function buildCourseScheduleStage3Steps(rawCourses: number[][]): CourseScheduleStep[] {
  const steps: CourseScheduleStep[] = [];
  const lines = COURSE_SCHEDULE_STAGE3_LINES;

  const courses: CourseItem[] = rawCourses.map((c, idx) => ({
    id: idx + 1,
    duration: c[0],
    lastDay: c[1],
  }));

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: '阶段 3：反悔贪心“置换不劣性”数学反证证明',
    message: '定理：用当前时长更短的课程替换已选集合中最耗时的课程，所得到的新状态必然强优于或等于原状态！',
    log: 'enter verifyRegretReplacement',
    codeLine: lines.entry,
  });

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: '反证代数证明：设被替换长课时长为 d_old，新课时长为 d_new (d_new < d_old)',
    message: '1. 修读门数维持不变 (|S_new| = |S_old|)；2. 总耗时 time_new = time_old - (d_old - d_new) < time_old；3. 新集合对后续任何课程的截止时间容忍度更高！',
    log: 'algebraic proof verified',
    codeLine: lines.assertGain,
  });

  return steps;
}

// ==========================================
// 4. 声明式可视化器配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<CourseScheduleStep>({
  id: 'course-schedule-iii',
  name: '课程表 III (Course Schedule III)',
  category: 'greedy',
  icon: '📅',
  badge: {
    mode: '反悔贪心+大根堆',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '📈 课程排期耗时条与时间推进沙盘',
  card2Title: '🌲 大根堆双形态呈现 (维护已选课程耗时)',
  card2Desc: '展示堆顶耗时最长的课，超时时支持反悔剔除换入短课',
  legend: [
    { label: '已成功选修', color: '#10b981' },
    { label: '反悔剔除课程', color: '#f59e0b' },
    { label: '放弃课程', color: '#ef4444' },
    { label: '待处理课程', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-courses',
      label: '课程 [duration, lastDay]',
      type: 'text',
      defaultValue: '100,200; 200,1300; 1000,1250; 2000,3200',
      width: '230px',
      placeholder: '持续天数,截止天数; 如 100,200; 200,1300',
    },
  ],
  presets: [
    { label: '经典反悔用例', values: { 'input-courses': '100,200; 200,1300; 1000,1250; 2000,3200' } },
    { label: '连续反悔用例', values: { 'input-courses': '5,5; 4,6; 2,6' } },
    { label: '不可反悔用例', values: { 'input-courses': '1,2; 2,3; 3,4' } },
  ],
  metrics: [
    { id: 'selected-count', label: '已修读课程数', color: '#10b981' },
    { id: 'current-time', label: '累计总耗时 (天)', color: '#3b82f6' },
    { id: 'heap-top', label: '堆顶最大耗时', color: '#ef4444' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力子集对比',
      shortName: '暴力穷举',
      card2Desc: '搜索所有选与不选的组合，展示指数级状态树',
      codeLanguages: COURSE_SCHEDULE_STAGE1_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 反悔贪心推演',
      shortName: '反悔贪心',
      card2Desc: '按截止时间排序，超时时弹出堆顶最长课，置换短课赢得时间裕度',
      codeLanguages: COURSE_SCHEDULE_STAGE2_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 置换不劣证明',
      shortName: '贪心证明',
      card2Desc: '代数证明反悔置换后课程门数守恒且耗时更充裕',
      codeLanguages: COURSE_SCHEDULE_STAGE3_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 3),
    },
  ],
  codeLanguages: COURSE_SCHEDULE_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.courseScheduleIII.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 什么是“反悔贪心 (Regret Greedy)”？</h3>
      <p>常规贪心一旦做出局部选择就绝不修改；而<b>反悔贪心</b>允许在后续发现更优机会或面临危机时，<b>撤销过去的次优决策</b>。</p>
      <p>在《课程表 III》中：</p>
      <ol>
        <li>我们的目标是修读<b>最多门数</b>的课程，而不是单纯耗时最短；</li>
        <li>当新遇到一门短课但会超时时，如果已选课程中有一门极耗时的课，果断把那门耗时长课“退课”，换入当前短课；</li>
        <li>这次“退课换课”让总课程数保持不变，但累计总时间 $time$ 净减少了，为未来能选修更多的课创造了更大的可能性！</li>
      </ol>
    </div>
  `,
  buildSteps: (inputs) => parseAndBuild(inputs, 2),
  renderCanvas: (container, step) => {
    const courses = step.courses || [];
    const curCourse = step.currentCourse;

    const cardsHtml = courses
      .map((c) => {
        const isCur = curCourse && curCourse.id === c.id;
        let bg = '#ffffff';
        let border = '#cbd5e1';
        let statusBadge = '<span style="color: #64748b;">待处理</span>';

        if (c.status === 'selected') {
          bg = '#ecfdf5';
          border = '#10b981';
          statusBadge = '<span style="color: #059669; font-weight: 700;">✓ 已入选</span>';
        } else if (c.status === 'regretted') {
          bg = '#fffbeb';
          border = '#f59e0b';
          statusBadge = '<span style="color: #d97706; font-weight: 700;">↩ 反悔剔除</span>';
        } else if (c.status === 'rejected') {
          bg = '#fef2f2';
          border = '#ef4444';
          statusBadge = '<span style="color: #dc2626; font-weight: 700;">✗ 超时放弃</span>';
        }

        if (isCur) {
          border = '#3b82f6';
        }

        return `
          <div style="min-width: 110px; padding: 6px 10px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 12px; color: #1e293b;">课程 C${c.id}</span>
              <span style="font-size: 10px;">${statusBadge}</span>
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569;">时长: <b>${c.duration}</b> 天</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">截止: <b>${c.lastDay}</b> 天</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">📅 课程池与排期状态</span>
          <span style="font-size: 12px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">当前累计总耗时: ${step.currentTime} 天</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;">
          ${cardsHtml}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const heapItems = step.heap || [];
    renderDualHeapVisual(container, heapItems, 'max', '大根堆 (已修课程时长维护)');
  },
});

function parseAndBuild(inputs: Record<string, any>, stage: number): CourseScheduleStep[] {
  const raw = String(inputs?.['input-courses'] || '100,200; 200,1300; 1000,1250; 2000,3200');
  const pairs = raw
    .split(/[;；]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const courses: number[][] = [];
  pairs.forEach((p) => {
    const nums = p
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));
    if (nums.length >= 2) {
      courses.push([nums[0], nums[1]]);
    }
  });

  if (courses.length === 0) {
    courses.push([100, 200], [200, 1300], [1000, 1250], [2000, 3200]);
  }

  if (stage === 1) return buildCourseScheduleStage1Steps(courses);
  if (stage === 2) return buildCourseScheduleStage2Steps(courses);
  return buildCourseScheduleStage3Steps(courses);
}

export const CourseScheduleVisualizer = Visualizer;

registerAlgorithm({
  id: 'course-schedule-iii',
  name: '课程表 III (Course Schedule III)',
  viewId: 'algo-course-schedule-iii-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code05：LeetCode 630 课程表 III，经典反悔贪心大根堆与时间余裕置换',
  icon: '📅',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 895,
  learningGoal: '深入理解反悔贪心 (Regret Greedy) 思想，掌握大根堆在动态优化历史选择中的应用',
});
