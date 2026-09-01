/**
 * 知道秘密的人数 (Number of People Aware of a Secret - LeetCode 2327 / 左程云 Class 067 题目3) 声明式可视化器
 * 核心：延时分享 delay、遗忘期 forget、滑动窗口状态转移 dp[i] = (dp[i] + dp[j]) % MOD
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PEOPLE_SECRET_CODE_LANGUAGES,
  PEOPLE_SECRET_PROBLEM_HTML,
  PEOPLE_SECRET_ANALYSIS_HTML,
} from './people-secret-problem-content';

export interface SecretStep {
  curDay: number;
  newKnowers: Record<number, number>;
  activeSharers: number;
  totalKnowers: number;
  status: 'init' | 'share' | 'forget' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildSecretSteps(): SecretStep[] {
  const steps: SecretStep[] = [];

  steps.push({
    curDay: 1,
    newKnowers: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    activeSharers: 0,
    totalKnowers: 1,
    status: 'init',
    message: '1. [第 1 天: 初始唯一知情者] 第 1 天 1 人获知秘密，需等待 delay=2 天后开始分享，并在 forget=4 天后遗忘。',
    log: 'Day 1: 新增 1 人，暂不可分享 (处于延迟期)',
    codeLine: [15, 22],
  });

  steps.push({
    curDay: 3,
    newKnowers: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0 },
    activeSharers: 1,
    totalKnowers: 2,
    status: 'share',
    message: '2. [第 3 天: 首次开始分享] 第 1 天的人进入可分享期，分享给 1 人，第 3 天新增 1 人，总知情人数 = 2！',
    log: 'Day 3: 1 人活跃分享 ➔ 新增 1 人，总知情 = 2',
    codeLine: [24, 32],
  });

  steps.push({
    curDay: 5,
    newKnowers: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 0 },
    activeSharers: 1,
    totalKnowers: 3,
    status: 'forget',
    message: '3. [第 5 天: 初始知情者遗忘] 第 1 天获知者在第 5 天 (1+4) 彻底遗忘！第 3/4 天获知者继续分享！总知情人数 = 3！',
    log: 'Day 5: 第 1 天的人遗忘秘密，剩余 3 人知情',
    codeLine: [34, 42],
  });

  steps.push({
    curDay: 6,
    newKnowers: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 2 },
    activeSharers: 2,
    totalKnowers: 5,
    status: 'done',
    message: '🎉 [第 6 天: 秘密扩散结算] 最终在第 6 天结束时，全网仍保留秘密的总人数为 5 人！',
    log: '✓ Day 6 结算完成：最终知情人数 = 5',
    codeLine: [44, 48],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SecretStep>({
  id: 'people-secret',
  name: '知道秘密的人数 (People Aware of Secret)',
  category: 'graph',
  icon: '🤫',
  badge: {
    mode: '滑动窗口延时 DP',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🤫 每日新增知情者与生命周期沙盘',
  card2Title: '🧭 活跃分享者与最终留存监视器',
  card2Desc: '延迟分享期 delay、遗忘期 forget 与每日滚动差分',
  legend: [
    { label: '延迟期 (未开始分享)', color: '#0284c7' },
    { label: '⭐ 活跃分享期', color: '#f59e0b' },
    { label: '🟢 最终留存知情者', color: '#10b981' },
    { label: '已遗忘 (退出网络)', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: 'n=6, delay=2, forget=4 经典用例', values: {} },
  ],
  metrics: [
    { id: 'metric-secret-day', label: '当前模拟天数', color: '#2563eb' },
    { id: 'metric-secret-total', label: '当前知情总人数', color: '#10b981' },
  ],
  codeLanguages: PEOPLE_SECRET_CODE_LANGUAGES,
  problemHtml: PEOPLE_SECRET_PROBLEM_HTML,
  analysisHtml: PEOPLE_SECRET_ANALYSIS_HTML,
  buildSteps: () => buildSecretSteps(),
  renderCanvas: (container, step) => {
    const days = [1, 2, 3, 4, 5, 6];
    const bars = days
      .map((d) => {
        const count = step.newKnowers[d] || 0;
        const height = count * 35;
        const isCur = step.curDay === d;
        const bg = count > 0 ? (isCur ? '#f59e0b' : '#0284c7') : '#1e293b';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8;">${count}人</span>
            <div style="width: 32px; height: ${Math.max(10, height)}px; background: ${bg}; border-radius: 4px; border: 1px solid ${isCur ? '#facc15' : '#38bdf8'}; transition: all 0.2s;"></div>
            <span style="font-size: 10.5px; font-weight: 800; font-family: monospace; color: #ffffff;">D${d}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; gap: 14px; align-items: flex-end; height: 160px; padding-bottom: 10px;">
          ${bars}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          柱状图显示第 $D_i$ 天新增获知人数 | 满足条件：$D_i - \\text{forget} < D_{\\text{now}} \\le D_i - \\text{delay}$ 时活跃分享
        </div>
      </div>
    `;

    const root = container.closest('#algo-people-secret-view');
    if (root) {
      const dEl = root.querySelector('#metric-secret-day');
      const tEl = root.querySelector('#metric-secret-total');

      if (dEl) dEl.textContent = `第 ${step.curDay} 天`;
      if (tEl) tEl.textContent = `${step.totalKnowers} 人`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 延迟传播滑动窗口转移:</span>
              <strong style="font-family: monospace; color: #2563eb;">sharers = (sharers + dp[i - delay] - dp[i - forget]) % MOD</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'people-secret',
  name: '知道秘密的人数 (People Aware of Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  description: '左程云算法通关课 Class 067 题目3：网络秘密传播模型、延迟分享与遗忘周期、滑动窗口差分 O(N) 动态规划 (LeetCode 2327)',
  icon: '🤫',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 30,
  learningGoal: '掌握延时与遗忘状态转移方程的滑动窗口优化技巧及 O(N) 滚动数组推导',
});

export { Visualizer as PeopleSecretVisualizer };
