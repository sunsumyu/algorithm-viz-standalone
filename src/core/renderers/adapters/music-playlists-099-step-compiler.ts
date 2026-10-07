/**
 * 音乐播放列表 (Number of Music Playlists) StepCompiler
 * 核心原理：dp[i][j] 长度为 i 包含 j 种不同歌曲，新歌与相隔 k 步重播旧歌双转移
 */

import { MUSIC_PLAYLISTS_LINES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';
import { Math099Step } from '../../../algorithms/categories/math/math-099/math-099-shared';

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
    line: lines.entry.javascript,
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
    line: lines.initDp.javascript,
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
        line: lines.newSong.javascript,
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
          line: lines.oldSong.javascript,
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
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '最终方案数': `${ans}` },
  });

  return steps;
}
