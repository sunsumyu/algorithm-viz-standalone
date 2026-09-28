/**
 * Class 055: Code03 你可以安排的最多任务数目 (Maximum Number of Tasks You Can Assign)
 * 二分答案 + 贪心排序匹配 + 双端队列调度 (头取最易 / 尾取最难) / LeetCode 2071
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言精准 1-based 行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE03_TASKS_ASSIGN_CODES, CODE03_TASKS_ASSIGN_LINES } from './queue-055-stage-codes';
import { Step055, renderMaxTasksAssignBoard } from './queue-055-shared';

export function buildMaxTasksAssignSteps(
  rawTasks?: number[],
  rawWorkers?: number[],
  rawPills?: number,
  rawStrength?: number
): Step055[] {
  const steps: Step055[] = [];
  const lines = CODE03_TASKS_ASSIGN_LINES;

  const defaultTasks = [3, 2, 1];
  const defaultWorkers = [0, 3, 3];
  const tasks = (rawTasks && rawTasks.length > 0 ? [...rawTasks] : defaultTasks).sort((a, b) => a - b);
  const workers = (rawWorkers && rawWorkers.length > 0 ? [...rawWorkers] : defaultWorkers).sort((a, b) => a - b);
  const pills = rawPills !== undefined && rawPills >= 0 ? rawPills : 1;
  const strength = rawStrength !== undefined && rawStrength > 0 ? rawStrength : 1;

  const tsize = tasks.length;
  const wsize = workers.length;

  // 0. 入口
  steps.push({
    title: '算法初始化与排序',
    description: `共有 ${tsize} 个任务 [${tasks.join(', ')}]，${wsize} 名工人 [${workers.join(', ')}]，药丸 ${pills} 粒 (每粒增加 ${strength} 力量)。`,
    decision: '双数组升序排序完毕。任务完成数具有单调性（若能完成 m 个，则必能完成任意 <m 个），启动二分答案！',
    message: '二分范围：[0 .. ' + Math.min(tsize, wsize) + ']。',
    log: `init maxTaskAssign: tasks=[${tasks}], workers=[${workers}], pills=${pills}, s=${strength}`,
    codeLine: lines.sortBoth,
    tasks,
    workers,
    pillsLeft: pills,
    strength,
    midM: 0,
    workerIdx: -1,
    taskDeque: [],
    usedPills: 0,
    actionType: 'init',
    metrics: { '任务总数': tsize, '工人数': wsize, '可用药丸': pills, '单粒药力': strength },
  });

  // 二分查找
  let l = 0;
  let r = Math.min(tsize, wsize);
  let ans = 0;

  while (l <= r) {
    const m = Math.floor((l + r) / 2);

    steps.push({
      title: `二分探测中点 m = ${m}`,
      description: `当前二分区间 [${l} .. ${r}]，尝试检验是否能安排完成 ${m} 个任务。`,
      decision: `黄金贪心法则：必须选力量要求最小的 ${m} 个任务 tasks[0..${m - 1}]，与力量最大的 ${m} 名工人 workers[${wsize - m}..${wsize - 1}] 进行对决！`,
      message: '双端队列将辅助我们进行贪心调度匹配。',
      log: `binarySearch: l=${l}, r=${r} -> probe m=${m}`,
      codeLine: lines.binaryLoop,
      tasks,
      workers,
      pillsLeft: pills,
      strength,
      midM: m,
      workerIdx: -1,
      taskDeque: [],
      usedPills: 0,
      actionType: 'check_mid',
      metrics: { '探测任务数 m': m, '二分左界': l, '二分右界': r },
    });

    if (m === 0) {
      l = m + 1;
      continue;
    }

    // 运行 check 模拟
    const dq: number[] = [];
    let cnt = 0;
    let j = 0;
    const wStart = wsize - m;
    let possible = true;

    for (let i = wStart; i < wsize; i++) {
      const wPower = workers[i];
      const wRank = i - wStart;

      // 1. 不吃药解锁任务进队尾
      const newlyUnlockedFree: number[] = [];
      while (j < m && tasks[j] <= wPower) {
        dq.push(j);
        newlyUnlockedFree.push(j);
        j++;
      }

      if (newlyUnlockedFree.length > 0) {
        steps.push({
          title: `工人 #${wRank} (力值 ${wPower}): 不吃药解锁任务`,
          description: `该工人凭借自身力量 ${wPower}，解锁任务 [${newlyUnlockedFree.map(t => `#${t}(${tasks[t]})`).join(', ')}] 入队尾。`,
          decision: `队列当前共有 ${dq.length} 个无需吃药即可挑战的任务。`,
          message: '优先排查无需消耗宝贵药丸的自然胜任任务。',
          log: `unlockFree: worker w[${i}]=${wPower} unlocked tasks [${newlyUnlockedFree.join(', ')}]`,
          codeLine: lines.unlockFree,
          tasks,
          workers,
          pillsLeft: pills - cnt,
          strength,
          midM: m,
          workerIdx: i,
          taskDeque: [...dq],
          usedPills: cnt,
          actionType: 'unlock',
          metrics: { '当前工人力值': wPower, '候选任务数': dq.length },
        });
      }

      // 2. 尝试不吃药完成队头最简单的任务
      if (dq.length > 0 && tasks[dq[0]] <= wPower) {
        const solvedTask = dq.shift()!;
        steps.push({
          title: `工人 #${wRank} (力值 ${wPower}): 队头轻松取胜`,
          description: `队头任务 #${solvedTask} (需 ${tasks[solvedTask]}) 力量要求最低，工人不吃药即可完成！`,
          decision: `贪心调度：让合格的较弱工人完成最轻松的任务（队头出队），将难任务留给更强工人。`,
          message: '节约药丸，最弱工人做最易任务。',
          log: `pickFree: worker ${wPower} completed task #${solvedTask}`,
          codeLine: lines.pickFree,
          statusBadge: { text: '不吃药完成', type: 'info' },
          tasks,
          workers,
          pillsLeft: pills - cnt,
          strength,
          midM: m,
          workerIdx: i,
          taskDeque: [...dq],
          usedPills: cnt,
          actionType: 'take_free',
          metrics: { '完成任务': `#${solvedTask}`, '已消耗药丸': cnt },
        });
      } else {
        // 3. 必须吃药
        const newlyUnlockedPill: number[] = [];
        while (j < m && tasks[j] <= wPower + strength) {
          dq.push(j);
          newlyUnlockedPill.push(j);
          j++;
        }

        if (dq.length > 0) {
          // 吃药，啃下当前能胜任的最难任务（队尾出队）
          const solvedHardTask = dq.pop()!;
          cnt++;

          steps.push({
            title: `工人 #${wRank} (力值 ${wPower} + 药力 ${strength}): 队尾硬核攻坚`,
            description: `工人吃下药丸后力量提升至 ${wPower + strength}，啃下队列中最艰巨的任务 #${solvedHardTask} (需 ${tasks[solvedHardTask]})！`,
            decision: `既然吃了药，就要把当前最大的困难解决（队尾出队），将简单的任务留给后面更弱的工人！消耗第 ${cnt} 粒药。`,
            message: '吃药取队尾，物尽其用，攻坚克难。',
            log: `pickPill: worker ${wPower}+${strength} completed hardest task #${solvedHardTask}, pills used=${cnt}`,
            codeLine: lines.pickPill,
            statusBadge: { text: `服药攻坚: 剩${pills - cnt}粒`, type: 'warning' },
            tasks,
            workers,
            pillsLeft: pills - cnt,
            strength,
            midM: m,
            workerIdx: i,
            taskDeque: [...dq],
            usedPills: cnt,
            actionType: 'take_pill',
            metrics: { '攻坚任务': `#${solvedHardTask}`, '消耗药丸总数': cnt, '剩余药丸': pills - cnt },
          });
        } else {
          possible = false;
          steps.push({
            title: `工人 #${wRank} (力值 ${wPower}): 服药后依然无法完成任何任务！`,
            description: `工人即便利力量增加至 ${wPower + strength}，也无法完成剩余的任何任务，任务匹配中断！`,
            decision: `检验失败：无法完成 ${m} 个任务。`,
            message: '二分上限过高，需要向左缩减 m。',
            log: `checkFail: worker ${wPower} cannot solve any remaining tasks`,
            codeLine: lines.pickPill,
            statusBadge: { text: '匹配断裂', type: 'error' },
            tasks,
            workers,
            pillsLeft: pills - cnt,
            strength,
            midM: m,
            workerIdx: i,
            taskDeque: [],
            usedPills: cnt,
            actionType: 'fail',
            metrics: { '断裂工人': `w[${i}]`, '失败判定': '不可行' },
          });
          break;
        }
      }
    }

    if (possible && cnt <= pills) {
      ans = m;
      steps.push({
        title: `二分检验成功: m = ${m} 个任务全部达成！`,
        description: `所有 ${m} 个任务均被成功安排，消耗药丸 ${cnt} 粒 ≤ 可用药丸 ${pills}。`,
        decision: `记录当前答案 ans = ${m}，尝试向右二分寻找能否完成更多任务！`,
        message: '二分区间左界推进至 m + 1。',
        log: `checkSuccess: m=${m} works with ${cnt} pills, ans=${ans}`,
        codeLine: lines.binaryLoop,
        statusBadge: { text: `达成 ${m} 个任务`, type: 'success' },
        tasks,
        workers,
        pillsLeft: pills - cnt,
        strength,
        midM: m,
        workerIdx: -1,
        taskDeque: [],
        usedPills: cnt,
        actionType: 'check_mid',
        metrics: { '当前最大可行解': ans, '消耗药丸': cnt },
      });
      l = m + 1;
    } else {
      r = m - 1;
    }
  }

  // 结算
  steps.push({
    title: '算法执行完毕',
    description: `二分查找结束，最多可以安排完成的任务数目为 ${ans}。`,
    decision: `最终返回 answer = ${ans}。`,
    message: '全流程排序 O(N log N + M log M)，二分配合双端队列 O(min(N, M) log(min(N, M)))。',
    log: `done maxTaskAssign: ans=${ans}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `最大任务数: ${ans}`, type: 'success' },
    tasks,
    workers,
    pillsLeft: pills,
    strength,
    midM: ans,
    workerIdx: -1,
    taskDeque: [],
    usedPills: 0,
    actionType: 'done',
    metrics: { '最多可完成任务数': ans },
  });

  return steps;
}

export const maxTasksAssign055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'max-tasks-assign-055',
  aliases: [
    'class055-code03',
    'max-tasks-assign',
    'max-task-assign',
    'leetcode-2071',
  ],
  name: '安排最多任务数目 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '二分+双端队列', complexity: 'O(N log N)' },
  description: '二分答案 + 贪心排序匹配 + 双端队列调度：不吃药取队头轻松过关，服药攻坚队尾最难任务 (LeetCode 2071)',
  learningGoal: '深入领会二分答案思想与双端队列在复杂贪心约束下的绝妙协同，掌握头出最易、尾出最难的双向调度哲理。',
  icon: '🛠️',

  inputs: [
    {
      id: 'tasks',
      label: '任务力量要求 (逗号隔开)',
      type: 'text',
      defaultValue: '3, 2, 1',
      placeholder: '例如: 3, 2, 1',
    },
    {
      id: 'workers',
      label: '工人自身力量 (逗号隔开)',
      type: 'text',
      defaultValue: '0, 3, 3',
      placeholder: '例如: 0, 3, 3',
    },
    {
      id: 'pills',
      label: '药丸总数',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 20,
    },
    {
      id: 'strength',
      label: '单粒药丸力量增幅',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: 'LeetCode 样例 1: tasks=[3,2,1], workers=[0,3,3], pills=1, s=1 (答案: 3)',
      values: { tasks: '3, 2, 1', workers: '0, 3, 3', pills: 1, strength: 1 },
    },
    {
      label: 'LeetCode 样例 2: tasks=[5,4], workers=[0,0,0], pills=1, s=5 (答案: 1)',
      values: { tasks: '5, 4', workers: '0, 0, 0', pills: 1, strength: 5 },
    },
    {
      label: '无需药丸全解: tasks=[2,3,4], workers=[2,3,5], pills=0, s=2 (答案: 3)',
      values: { tasks: '2, 3, 4', workers: '2, 3, 5', pills: 0, strength: 2 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.maxTasksAssign055,
  codeLanguages: CODE03_TASKS_ASSIGN_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let tasks = [3, 2, 1];
    let workers = [0, 3, 3];
    let pills = 1;
    let strength = 1;

    if (params && params.tasks) {
      const parsed = String(params.tasks)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) tasks = parsed;
    }

    if (params && params.workers) {
      const parsed = String(params.workers)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) workers = parsed;
    }

    if (params && params.pills !== undefined) {
      const parsedPills = parseInt(params.pills, 10);
      if (!isNaN(parsedPills) && parsedPills >= 0) pills = parsedPills;
    }

    if (params && params.strength !== undefined) {
      const parsedS = parseInt(params.strength, 10);
      if (!isNaN(parsedS) && parsedS > 0) strength = parsedS;
    }

    return buildMaxTasksAssignSteps(tasks, workers, pills, strength);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderMaxTasksAssignBoard(step);
  },
});
