/**
 * 消灭怪物的最大数量 (LeetCode 1921) - 声明式教学级沙盘渲染器
 * 核心贪心：到达时间贪心排序与武器CD判定
 */

import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  ELIMINATE_MONSTERS_CODES,
  ELIMINATE_MONSTERS_LINES,
} from './greedy-094-stage-codes';
import { Greedy094Step } from './greedy-094-shared';

export interface MonsterInfo {
  dist: number;
  speed: number;
  arriveTime: number;
  id: number;
}

export interface EliminateMonstersStep extends Greedy094Step {
  monsters: MonsterInfo[];
  times: number[];
  curMinute: number;
  eliminatedCount: number;
  failedIdx?: number;
  done?: boolean;
}

export function buildEliminateMonstersSteps(dist: number[], speed: number[]): EliminateMonstersStep[] {
  const steps: EliminateMonstersStep[] = [];
  const lines = ELIMINATE_MONSTERS_LINES;
  const n = Math.min(dist.length, speed.length);

  // Step 0: 入口
  const initialMonsters: MonsterInfo[] = [];
  for (let i = 0; i < n; i++) {
    initialMonsters.push({
      dist: dist[i],
      speed: speed[i],
      arriveTime: Math.ceil(dist[i] / speed[i]),
      id: i,
    });
  }

  steps.push({
    monsters: initialMonsters.map(m => ({ ...m })),
    times: [],
    curMinute: 0,
    eliminatedCount: 0,
    decision: `主函数入口：怪物数量 n=${n}，分别接收距离与速度列表`,
    message: '武器每分钟开始充能完毕可消灭一只怪物；若怪物到达时间 ≤ 当前充能时间，则基地被攻破',
    log: `enter eliminateMaximum(dist=[${dist.join(',')}], speed=[${speed.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 计算每只怪物的到达时间
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = Math.ceil(dist[i] / speed[i]);
    times.push(t);
  }

  steps.push({
    monsters: initialMonsters.map(m => ({ ...m })),
    times: [...times],
    curMinute: 0,
    eliminatedCount: 0,
    decision: `计算各怪物到达基地所需时间：times = [${times.join(', ')}]，公式：ceil(dist[i] / speed[i])`,
    message: '将多维距离与速度归一化为单一时间维度进行度量',
    log: `calculated arrival times: [${times.join(', ')}]`,
    codeLine: lines.calcTimes,
  });

  // Step 2: 升序排序到达时间
  const sortedIndices = times.map((_, i) => i).sort((a, b) => times[a] - times[b]);
  const sortedTimes = [...times].sort((a, b) => a - b);
  const sortedMonsters = sortedIndices.map(i => initialMonsters[i]);

  steps.push({
    monsters: sortedMonsters.map(m => ({ ...m })),
    times: [...sortedTimes],
    curMinute: 0,
    eliminatedCount: 0,
    decision: `贪心策略：优先击杀最早到达基地的怪物！升序排序后 times = [${sortedTimes.join(', ')}]`,
    message: '优先消灭迫在眉睫的怪物是唯一的安全策略',
    log: `sorted arrival times: [${sortedTimes.join(', ')}]`,
    codeLine: lines.sortTimes,
  });

  // Step 3: 按时间推进模拟充能与射击
  let ans = n;
  for (let i = 0; i < n; i++) {
    const t = sortedTimes[i];
    if (t <= i) {
      ans = i;
      steps.push({
        monsters: sortedMonsters.map(m => ({ ...m })),
        times: [...sortedTimes],
        curMinute: i,
        eliminatedCount: i,
        failedIdx: i,
        decision: `⚠️ 第 ${i} 分钟：怪物 #${sortedMonsters[i].id} 到达用时 ${t} 分钟 ≤ 当前武器射击时刻 ${i}！怪物已突破防线防守失败`,
        message: `在第 ${i} 分钟防线被突破，累计消灭怪物数量：${i}`,
        log: `monster arrive ${t} <= minute ${i}, game over at ${i}`,
        codeLine: lines.checkLoss,
      });
      break;
    } else {
      steps.push({
        monsters: sortedMonsters.map(m => ({ ...m })),
        times: [...sortedTimes],
        curMinute: i,
        eliminatedCount: i + 1,
        decision: `🎯 第 ${i} 分钟：武器就绪并开火！击杀用时 ${t} 分钟到达的怪物 #${sortedMonsters[i].id}（当前时刻 ${i} < 到达时刻 ${t}，安全）`,
        message: `成功消灭第 ${i + 1} 只怪物`,
        log: `minute ${i}: eliminated monster with arrive time ${t}`,
        codeLine: lines.checkLoss,
      });
    }
  }

  // Step 4: 完成
  steps.push({
    monsters: sortedMonsters.map(m => ({ ...m })),
    times: [...sortedTimes],
    curMinute: ans,
    eliminatedCount: ans,
    done: true,
    decision: `🎉 演练结束：最多可消灭怪物的数量为 ${ans} 只（共 ${n} 只）`,
    message: ans === n ? '太棒了！所有怪物在触及基地前被全数歼灭！' : `消灭了 ${ans} 只怪物后基地失守`,
    log: `done result=${ans}`,
    codeLine: lines.done,
  });

  return steps;
}

const template = `<div id="algo-eliminate-monsters-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const eliminateMonstersRenderer = UniversalStageVisualizer;
export const eliminateMonstersVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'eliminate-monsters',
  name: '消灭怪物的最大数量 (Eliminate Monsters)',
  viewId: 'algo-eliminate-monsters-view',
  category: 'greedy',
  description: 'LeetCode 1921：到达时间升序排序的贪心本质与防守时机判定 (EDF 调度与桶排序)',
  icon: '👾',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 941,
  learningGoal: '掌握到达时间升序排序的贪心本质与防守时机判定',
});

export function registerEliminateMonsters(): void {
  // 保持向前兼容导出
}
