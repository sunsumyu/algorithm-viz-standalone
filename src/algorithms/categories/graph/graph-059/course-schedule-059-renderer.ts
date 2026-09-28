/**
 * Class 059: Code01 课程表与拓扑排序判环 (Course Schedule / LeetCode 207)
 * 经典 Kahn 算法模版 / 有向环检测
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_059_PROBLEMS } from './graph-059-problem-content';
import { CODE01_COURSE_SCHEDULE_CODES, CODE01_COURSE_SCHEDULE_LINES } from './graph-059-stage-codes';
import { Step059, renderCourseScheduleBoard } from './graph-059-shared';

export function buildCourseScheduleSteps(
  rawN?: number,
  rawPrereqs?: Array<[number, number]>
): Step059[] {
  const steps: Step059[] = [];
  const lines = CODE01_COURSE_SCHEDULE_LINES;

  const n = rawN !== undefined && rawN >= 2 ? Math.min(rawN, 8) : 4;
  const prereqs: Array<[number, number]> = rawPrereqs && rawPrereqs.length > 0
    ? rawPrereqs
    : [
        [1, 0],
        [2, 0],
        [3, 1],
        [3, 2],
      ];

  // 1. 初始化入度表与邻接表
  const inDegree = new Array(n).fill(0);
  const graph: number[][] = Array.from({ length: n }, () => []);

  for (const [a, b] of prereqs) {
    if (a < n && b < n) {
      graph[b].push(a); // b -> a
      inDegree[a]++;
    }
  }

  // Step 0: 主入口与建图
  steps.push({
    title: '算法初始化: 构建有向图与入度统计',
    description: `总课程数 N=${n}，先修依赖对数=${prereqs.length}。建立邻接表并统计每个课程的入度。`,
    decision: '入度表示修读该课程前必须完成的前置先修课数量。入度为 0 代表可以无门槛立即开修。',
    message: 'Kahn 算法第一阶段：统计所有节点的初始入度。',
    log: `enter canFinish: numCourses=${n}, prerequisites count=${prereqs.length}`,
    codeLine: lines.buildGraph,
    numCourses: n,
    inDegree: [...inDegree],
    queue: [],
    topoOrder: [],
    adjacency: graph.map(list => [...list]),
    metrics: { '总课程数 N': n, '先修依赖数': prereqs.length, '已修课程数': 0 },
  });

  // 2. 收集所有入度为 0 的节点进入队列
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  steps.push({
    title: '初始化就绪队列: 收集零入度课程',
    description: `扫描发现零入度课程: [${queue.map(q => `课程${q}`).join(', ')}]，推入就绪队列。`,
    decision: `这些课程无需任何先修课，可以作为拓扑序列的初始启动节点。`,
    message: '如果一开始就没有入度为 0 的课程，说明全图存在死锁，课程完全无法开启！',
    log: `initial zero in-degree queue: [${queue.join(', ')}]`,
    codeLine: lines.initQueue,
    numCourses: n,
    inDegree: [...inDegree],
    queue: [...queue],
    topoOrder: [],
    adjacency: graph.map(list => [...list]),
    metrics: { '初始可修课程数': queue.length, '就绪队列容量': queue.length },
  });

  // 3. 循环出队并链式削减后继入度
  const topoOrder: number[] = [];
  let stepIdx = 1;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    topoOrder.push(cur);

    steps.push({
      title: `步进 #${stepIdx++}: 出队修读课程 ${cur}`,
      description: `课程 ${cur} 入度已清零，正式完成修读！已完成课程数累加为 ${topoOrder.length}。`,
      decision: `准备将课程 ${cur} 指向的所有后继依赖课程 [${graph[cur].join(', ')}] 的入度各减 1。`,
      message: '修完前置课，后置课程的负担减少。',
      log: `poll course ${cur} from queue, learned=${topoOrder.length}`,
      codeLine: lines.pollQueue,
      numCourses: n,
      inDegree: [...inDegree],
      queue: [...queue],
      curNode: cur,
      topoOrder: [...topoOrder],
      adjacency: graph.map(list => [...list]),
      metrics: { '当前修读课程': cur, '已完成课程数': topoOrder.length, '剩余在队数': queue.length },
    });

    for (const next of graph[cur]) {
      inDegree[next]--;
      const isReady = inDegree[next] === 0;
      if (isReady) {
        queue.push(next);
      }

      steps.push({
        title: `后继消解: 课程 ${cur} ➔ 课程 ${next} (入度减至 ${inDegree[next]})`,
        description: `课程 ${cur} 已经修完，后置课程 ${next} 的入度削减 1 (当前 inDegree[${next}]=${inDegree[next]})。`,
        decision: isReady
          ? `课程 ${next} 的所有先修课均已修完 (入度降至 0)，正式推入就绪队列！`
          : `课程 ${next} 仍有 ${inDegree[next]} 门先修课未完成，继续等待。`,
        message: isReady ? '后继课程成功解锁，加入拓扑队列！' : '尚未完全解锁。',
        log: `reduce inDegree of course ${next} to ${inDegree[next]}${isReady ? ' -> enqueue' : ''}`,
        codeLine: lines.reduceDegree,
        numCourses: n,
        inDegree: [...inDegree],
        queue: [...queue],
        curNode: cur,
        topoOrder: [...topoOrder],
        adjacency: graph.map(list => [...list]),
        metrics: { '更新课程': next, '当前入度': inDegree[next], '是否解锁入队': isReady ? '是' : '否' },
      });
    }
  }

  // 4. 终局判环
  const canFinish = topoOrder.length === n;
  steps.push({
    title: canFinish ? '拓扑排序成功: 可以完成全部课程！' : '环路死锁检测: 无法完成所有课程！',
    description: canFinish
      ? `全图共 ${n} 门课程已全部完成修读 (拓扑序列: [${topoOrder.join(' ➔ ')}])。`
      : `仅完成了 ${topoOrder.length} 门课程，剩余课程相互依赖形成了有向环，无法完成修读！`,
    decision: canFinish
      ? '【判定结论】图为 DAG (有向无环图)，返回 true。'
      : '【判定结论】图存在有向环，发生循环依赖，返回 false。',
    message: canFinish ? '所有先修依赖完美满足。' : '循环引用死锁，无法消除。',
    log: `canFinish result: ${canFinish} (learned ${topoOrder.length} / ${n})`,
    codeLine: lines.returnAns,
    numCourses: n,
    inDegree: [...inDegree],
    queue: [],
    curNode: undefined,
    topoOrder: [...topoOrder],
    adjacency: graph.map(list => [...list]),
    isCycle: !canFinish,
    statusBadge: {
      text: canFinish ? '成功: 可完成全部课程' : '失败: 存在有向环',
      type: canFinish ? 'success' : 'error',
    },
    metrics: { '最终判定': canFinish ? 'True (无环)' : 'False (成环)', '已完成数': topoOrder.length, '总课程数': n },
  });

  return steps;
}

export const courseSchedule059Renderer = registerDeclarativeAlgorithm<Step059>({
  id: 'course-schedule-059',
  aliases: ['class059-code01', 'course-schedule-207', 'can-finish-courses'],
  name: '课程表与拓扑排序判环 (Class 059)',
  category: 'graph',
  difficulty: 'medium',
  badge: { mode: 'Kahn拓扑排序', complexity: 'O(V+E)' },
  description: '左程云算法通关课【必备篇】Class 059：入度统计、零入度队列进出、链式消解与有向环检测 (LeetCode 207)',
  learningGoal: '透彻掌握 Kahn 算法入度削减机理，深刻领悟拓扑排序判定有向图是否存在循环依赖死锁的核心定理。',
  icon: '🎓',

  inputs: [
    {
      id: 'numCourses',
      label: '课程总数 N',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 8,
    },
    {
      id: 'prereqs',
      label: '先修关系 (格式: a b 代表先修b再修a; 分号或换行分隔)',
      type: 'text',
      defaultValue: '1 0; 2 0; 3 1; 3 2',
      placeholder: '例如: 1 0; 2 0; 3 1; 3 2',
    },
  ],

  presets: [
    {
      label: '经典菱形 DAG: 4门课程顺利学完',
      values: { numCourses: 4, prereqs: '1 0; 2 0; 3 1; 3 2' },
    },
    {
      label: '三方循环死锁: 0->1->2->0 (成环无法学完)',
      values: { numCourses: 3, prereqs: '1 0; 2 1; 0 2' },
    },
    {
      label: '线性链式依赖: 0->1->2->3',
      values: { numCourses: 4, prereqs: '1 0; 2 1; 3 2' },
    },
  ],

  problemContent: GRAPH_059_PROBLEMS.courseSchedule059,
  codeLanguages: CODE01_COURSE_SCHEDULE_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let n = 4;
    let prereqs: Array<[number, number]> = [
      [1, 0],
      [2, 0],
      [3, 1],
      [3, 2],
    ];

    if (params && params.numCourses !== undefined) {
      const parsedN = parseInt(params.numCourses, 10);
      if (!isNaN(parsedN) && parsedN >= 2) n = Math.min(parsedN, 8);
    }

    if (params && params.prereqs) {
      const raw = String(params.prereqs);
      const items = raw.split(/[;\n\r]+/).map(s => s.trim()).filter(Boolean);
      const parsedPrereqs: Array<[number, number]> = [];
      for (const item of items) {
        const parts = item.split(/[\s,，]+/).map(p => parseInt(p, 10)).filter(num => !isNaN(num));
        if (parts.length >= 2) {
          parsedPrereqs.push([parts[0], parts[1]]);
        }
      }
      if (parsedPrereqs.length > 0) prereqs = parsedPrereqs;
    }

    return buildCourseScheduleSteps(n, prereqs);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderCourseScheduleBoard(step);
  },
});
