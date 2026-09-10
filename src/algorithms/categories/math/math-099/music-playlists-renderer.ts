/**
 * 音乐播放列表 (Number of Music Playlists) - 声明式教学级沙盘渲染器
 * 核心原理：dp[i][j] 长度为 i 包含 j 种不同歌曲，新歌与相隔 k 步重播旧歌双转移
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { MUSIC_PLAYLISTS_CODES, MUSIC_PLAYLISTS_LINES } from './math-099-stage-codes';
import { Math099Step } from './math-099-shared';

export interface MusicPlaylistsStep extends Math099Step {
  n: number;
  goal: number;
  k: number;
}

export function buildMusicPlaylistsSteps(
  n: number,
  goal: number,
  k: number
): MusicPlaylistsStep[] {
  const steps: MusicPlaylistsStep[] = [];
  const lines = MUSIC_PLAYLISTS_LINES;
  const MOD = 1000000007n;

  const dp: bigint[][] = Array.from({ length: goal + 1 }, () => new Array(n + 1).fill(0n));

  // Step 0: 入口
  steps.push({
    n,
    goal,
    k,
    decision: `主函数入口：歌单目标长度 goal=${goal}，曲库共 n=${n} 首不同歌曲，重播安全间距 k=${k}`,
    message: '每首歌至少播放 1 次，两首相同歌曲之间必须至少间隔 k 首歌',
    log: `enter numMusicPlaylists(n=${n}, goal=${goal}, k=${k})`,
    codeLine: lines.entry,
    metrics: { '歌单目标长': `${goal}`, '曲库数 n': `${n}`, '间距限制 k': `${k}` },
  });

  // Step 1: 初始化 dp
  dp[0][0] = 1n;
  steps.push({
    n,
    goal,
    k,
    decision: '初始化动态规划状态矩阵：dp[0][0] = 1 (长度为 0 且包含 0 首不同歌的基底方案为 1)',
    message: '分配 (goal + 1) × (n + 1) 的二维状态转移表',
    log: 'init dp[0][0] = 1',
    codeLine: lines.initDp,
    metrics: { 'dp[0][0]': '1' },
  });

  // Step 2: 递推填表
  for (let i = 1; i <= goal; i++) {
    for (let j = 1; j <= n; j++) {
      // 1. 新选一首尚未播放过的歌曲
      const newSongWays = (dp[i - 1][j - 1] * BigInt(n - (j - 1))) % MOD;
      dp[i][j] = newSongWays;

      steps.push({
        n,
        goal,
        k,
        decision: `推导 dp[${i}][${j}] (分支一：播放全新歌曲)：前序状态 dp[${i - 1}][${j - 1}] × 未播歌曲数 (${n} - ${j - 1}) ➔ 新增方案 ${newSongWays}`,
        message: `当前累计 dp[${i}][${j}] = ${dp[i][j]}`,
        log: `dp[${i}][${j}] newSong = ${newSongWays}`,
        codeLine: lines.newSong,
        metrics: { '当前长度 i': `${i}`, '包含歌曲数 j': `${j}`, '全新歌方案': `${newSongWays}` },
      });

      // 2. 重播一首旧歌曲
      if (j > k) {
        const oldSongWays = (dp[i - 1][j] * BigInt(j - k)) % MOD;
        dp[i][j] = (dp[i][j] + oldSongWays) % MOD;

        steps.push({
          n,
          goal,
          k,
          decision: `推导 dp[${i}][${j}] (分支二：重播旧歌，满足 j=${j} > k=${k})：前序状态 dp[${i - 1}][${j}] × 可选旧歌数 (${j} - ${k}) ➔ 新增方案 ${oldSongWays}，总方案数 = ${dp[i][j]}`,
          message: `重播旧歌需满足与最近相同歌曲间隔至少 k 首，因而只有 ${j - k} 种合法旧歌`,
          log: `dp[${i}][${j}] oldSong = ${oldSongWays}`,
          codeLine: lines.oldSong,
          metrics: { '合法重播旧歌数': `${j - k}`, '合成后 dp': `${dp[i][j]}` },
        });
      }
    }
  }

  // Step 3: 收敛返回
  const ans = Number(dp[goal][n]);
  steps.push({
    n,
    goal,
    k,
    finalValue: ans,
    decision: `🎉 状态收敛！长度为 ${goal} 且恰好覆盖所有 ${n} 种歌曲的播放列表共有 dp[${goal}][${n}] = ${ans} 种！`,
    message: '收敛返回',
    log: `return dp[${goal}][${n}] = ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`最终方案数`]: `${ans}` },
  });

  return steps;
}

export const musicPlaylistsVisualizer = registerDeclarativeAlgorithm<MusicPlaylistsStep>({
  id: 'music-playlists-099',
  name: '音乐播放列表 (Music Playlists)',
  category: 'math',
  icon: '🎵',
  difficulty: 3,
  levelOrder: 996,
  learningGoal: '领会斯特林数思想在动态规划状态定义中的具象应用（新歌扩展 vs 安全间距旧歌重播）',
  problemHtml: MATH_099_PROBLEMS.musicPlaylists.html,
  analysisHtml: MATH_099_PROBLEMS.musicPlaylists.html,
  inputs: [
    {
      id: 'input-n',
      label: '曲库歌数 n',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-goal',
      label: '歌单长度 goal',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-k',
      label: '间隔限制 k',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
      step: 1,
      placeholder: '例如 1',
    },
  ],
  codeLanguages: MUSIC_PLAYLISTS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '3'), 10) || 3);
    const goal = Math.max(1, parseInt(String(inputs?.['input-goal'] ?? '3'), 10) || 3);
    const k = Math.max(0, parseInt(String(inputs?.['input-k'] ?? '1'), 10) || 1);
    return buildMusicPlaylistsSteps(n, goal, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MusicPlaylistsStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'padding: 10px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;';
    statusBox.innerHTML = `
      <div style="font-weight: 700; color: #1e293b; font-size: 13px;">
        🎵 播放列表参数: goal=<span style="color: #2563eb;">${step.goal}</span>, n=<span style="color: #059669;">${step.n}</span>, 间隔k=<span style="color: #d97706;">${step.k}</span>
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        最终方案 = ${step.finalValue ?? '计算中...'}
      </div>
    `;
    root.appendChild(statusBox);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
