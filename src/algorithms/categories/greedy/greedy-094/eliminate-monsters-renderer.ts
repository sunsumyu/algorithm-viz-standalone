/**
 * 消灭怪物的最大数量 (LeetCode 1921) - 声明式教学级沙盘渲染器
 * 核心贪心：到达时间贪心排序与武器CD判定
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  ELIMINATE_MONSTERS_CODES,
  ELIMINATE_MONSTERS_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

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

export const eliminateMonstersVisualizer = registerDeclarativeAlgorithm<EliminateMonstersStep>({
  id: 'eliminate-monsters',
  name: '消灭怪物的最大数量 (Eliminate Monsters)',
  category: 'greedy',
  icon: '👾',
  difficulty: 2,
  levelOrder: 941,
  learningGoal: '掌握到达时间升序排序的贪心本质与防守时机判定',
  problemHtml: GREEDY_094_PROBLEMS.eliminateMonsters.html,
  analysisHtml: GREEDY_094_PROBLEMS.eliminateMonsters.html,
  inputs: [
    {
      id: 'input-dist',
      label: '距离列表 dist',
      type: 'text',
      defaultValue: '1, 3, 4',
      placeholder: '1, 3, 4',
    },
    {
      id: 'input-speed',
      label: '速度列表 speed',
      type: 'text',
      defaultValue: '1, 1, 1',
      placeholder: '1, 1, 1',
    },
  ],
  codeLanguages: ELIMINATE_MONSTERS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawDist = String(inputs?.['input-dist'] || '1, 3, 4');
    const rawSpeed = String(inputs?.['input-speed'] || '1, 1, 1');
    const dist = rawDist.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const speed = rawSpeed.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildEliminateMonstersSteps(dist, speed);
  },
  renderCanvas: (stageContainer: HTMLElement, step: EliminateMonstersStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">武器就绪时刻:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 700;">第 ${step.curMinute} 分钟</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计消灭怪物:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.eliminatedCount} 只</span>
        </div>
      </div>
    `;

    // 怪物队列展示
    const queueBox = document.createElement('div');
    queueBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569; display: flex; justify-content: space-between;';
    title.innerHTML = '<span>👾 怪物威胁队列 (按到达时间升序)</span><span>状态标示: 绿色=已消灭, 红色=攻破, 灰色=待应对</span>';
    queueBox.appendChild(title);

    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; align-items: center;';

    step.monsters.forEach((m, idx) => {
      const isDefeated = idx < step.eliminatedCount && (step.failedIdx === undefined || idx < step.failedIdx);
      const isBreach = idx === step.failedIdx;

      let border = '#e2e8f0';
      let bg = '#f8fafc';
      let badge = '<span style="color: #94a3b8; font-size: 10px;">待应对</span>';

      if (isBreach) {
        border = '#ef4444';
        bg = '#fee2e2';
        badge = '<span style="color: #b91c1c; font-size: 10px; font-weight: 700;">💥 攻破基地!</span>';
      } else if (isDefeated) {
        border = '#10b981';
        bg = '#ecfdf5';
        badge = '<span style="color: #047857; font-size: 10px; font-weight: 700;">✓ 已消灭</span>';
      }

      const card = document.createElement('div');
      card.style.cssText = `min-width: 130px; padding: 8px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; display: flex; flex-direction: column; gap: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px;`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #334155;">#${m.id} 号怪物</span>
          ${badge}
        </div>
        <div style="color: #64748b; font-size: 10px;">距离: ${m.dist} | 速度: ${m.speed}</div>
        <div style="font-weight: 700; color: #1e293b;">预计到达: <span style="color: #d97706;">${m.arriveTime} 分钟</span></div>
      `;
      listContainer.appendChild(card);
    });

    queueBox.appendChild(listContainer);
    mainCard.appendChild(queueBox);

    // 决策天平
    if (step.monsters.length > 0) {
      const balanceBox = document.createElement('div');
      const target = step.failedIdx !== undefined ? step.monsters[step.failedIdx] : step.monsters[Math.min(step.curMinute, step.monsters.length - 1)];
      renderDecisionBalance(balanceBox, {
        leftTitle: `击杀时刻 ${step.curMinute}`,
        leftVal: `时刻 T=${step.curMinute}`,
        rightTitle: `怪物到达时刻`,
        rightVal: target ? `${target.arriveTime} 分钟` : 'N/A',
        winner: target && target.arriveTime > step.curMinute ? 'left' : 'right',
        reason: target && target.arriveTime > step.curMinute ? '武器充能就绪早于怪物到达时间，可安全消灭' : '怪物在充能完成前或同时触达基地，防守失败',
      });
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  },
});
