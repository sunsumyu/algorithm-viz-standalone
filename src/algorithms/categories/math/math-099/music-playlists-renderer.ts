/**
 * 音乐播放列表 (Number of Music Playlists) - 声明式教学级沙盘渲染器
 * 核心原理：dp[i][j] 长度为 i 包含 j 种不同歌曲，新歌与相隔 k 步重播旧歌双转移
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { MUSIC_PLAYLISTS_CODES } from './math-099-stage-codes';
import {
  MusicPlaylistsStep,
  buildMusicPlaylistsSteps,
} from '../../../../core/renderers/adapters/music-playlists-099-step-compiler';
import { musicPlaylists099CanvasAdapter } from '../../../../core/renderers/adapters/music-playlists-099-canvas-adapter';

export type { MusicPlaylistsStep };
export { buildMusicPlaylistsSteps };

export const musicPlaylistsVisualizer = registerDeclarativeAlgorithm<MusicPlaylistsStep>({
  id: 'music-playlists-099',
  name: '音乐播放列表 (Music Playlists)',
  category: 'math',
  icon: '🎵',
  difficulty: 3,
  levelOrder: 996,
  aliases: ['class099-code06', 'music-playlists', 'number-of-music-playlists-920', 'leetcode-920'],
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
    musicPlaylists099CanvasAdapter.render(stageContainer, step);
  },
});
