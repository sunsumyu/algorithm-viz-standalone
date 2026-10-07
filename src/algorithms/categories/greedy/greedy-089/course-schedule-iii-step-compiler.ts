import {
  COURSE_SCHEDULE_STAGE1_LINES,
  COURSE_SCHEDULE_STAGE2_LINES,
  COURSE_SCHEDULE_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
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

export function buildCourseScheduleStage1Steps(rawCourses: number[][]): CourseScheduleStep[] {
  const steps: CourseScheduleStep[] = [];
  const lines = COURSE_SCHEDULE_STAGE1_LINES;

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
    decision: `主函数入口：共 ${courses.length} 门课程待修读`,
    message: '阶段 1 暴力搜索：DFS 尝试每门课程“选”或“不选”，时间复杂度达 O(2^N)',
    log: `enter scheduleCourseBrute(n=${courses.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
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
    line: lines.callDfs?.java ?? 2,
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
        line: lines.dfsBase?.java ?? 4,
      });
      return;
    }

    const cur = courses[idx];

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
      line: lines.branchNotTake?.java ?? 5,
    });
    dfs(idx + 1, time, count, path);

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
        line: lines.branchTake?.java ?? 6,
      });
      path.push(cur);
      dfs(idx + 1, time + cur.duration, count + 1, path);
      path.pop();
    }
  }

  dfs(0, 0, 0, []);

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: maxCount,
    decision: `🎉 暴力回溯完成！最多可修读 ${maxCount} 门课程`,
    message: 'N 较大时指数爆炸不可行，必须采用大根堆反悔贪心！',
    log: `done maxCount=${maxCount}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 8,
  });

  return steps;
}

export function buildCourseScheduleStage2Steps(rawCourses: number[][]): CourseScheduleStep[] {
  const steps: CourseScheduleStep[] = [];
  const lines = COURSE_SCHEDULE_STAGE2_LINES;

  const courses: CourseItem[] = rawCourses.map((c, idx) => ({
    id: idx + 1,
    duration: c[0],
    lastDay: c[1],
    status: 'pending',
  }));

  steps.push({
    courses: [...courses],
    heap: [],
    currentTime: 0,
    selectedCount: 0,
    decision: `主函数入口：共有 ${courses.length} 门课程，准备执行反悔贪心调度`,
    message: '核心策略：按截止时间升序排序 + 大根堆维护已选课程耗时，超时则剔除耗时最长的课！',
    log: `enter scheduleCourse(n=${courses.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

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
    line: lines.sort?.java ?? 2,
  });

  const heap = new SimpleHeap<number>('max');
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
    line: lines.initHeap?.java ?? 3,
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
      line: lines.loopCourse?.java ?? 4,
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
        line: lines.takeDirect?.java ?? 5,
      });
    } else {
      const topDuration = heap.peek()?.val;
      const canRegret = topDuration !== undefined && topDuration > cur.duration;

      if (canRegret) {
        const popped = heap.pop()!;
        const savedTime = popped.val - cur.duration;
        time += cur.duration - popped.val;
        heap.push(cur.duration, cur.id);

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
          line: lines.regretSwap?.java ?? 6,
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
          line: lines.loopCourse?.java ?? 7,
        });
      }
    }
  }

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
    line: lines.done?.java ?? 8,
  });

  return steps;
}

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
    line: lines.entry?.java ?? 1,
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
    line: lines.assertGain?.java ?? 2,
  });

  return steps;
}

export function parseCourseScheduleInput(inputs: Record<string, any>, stage: number): CourseScheduleStep[] {
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
