/**
 * Class 125: 轮廓线 DP (Profile Dynamic Programming / 骨牌铺砖)
 * POJ 2411 蒙德里安的梦想 / 骨牌铺满棋盘
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { PROFILE_DP_CODES } from './advanced-124-134-stage-codes';
import {
  ProfileDpStep,
  buildProfileDpSteps,
} from '../../../../core/renderers/adapters/profile-dp-step-compiler';
import { renderProfileDpCanvas } from '../../../../core/renderers/adapters/profile-dp-canvas-adapter';

export type { ProfileDpStep };
export { buildProfileDpSteps, renderProfileDpCanvas };

export const profileDpVisualizer = registerDeclarativeAlgorithm<ProfileDpStep>({
  id: 'profile-dp-125',
  name: '轮廓线 DP (Class 125)',
  aliases: ['class125-code01', 'profile-dp', 'profile-dp-125', 'domino-tiling'],
  category: 'dynamic-programming',
  icon: '🏁',
  difficulty: 3,
  levelOrder: 125,
  learningGoal: '掌握逐格状态压缩与插头合并的轮廓线动态规划机制，理解利用 M 位状态替代 2M 位行状压的降维思想',
  problemHtml: ADVANCED_124_134_PROBLEMS.profileDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.profileDp.html,
  inputs: [
    {
      id: 'n',
      label: '棋盘行数 N',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 4,
    },
    {
      id: 'm',
      label: '棋盘列数 M',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 4,
    },
  ],
  codeLanguages: PROFILE_DP_CODES,
  generateSteps: (input) => {
    const n = Math.min(4, Math.max(1, Number(input.n) || 2));
    const m = Math.min(4, Math.max(1, Number(input.m) || 3));
    return buildProfileDpSteps(n, m);
  },
  renderCanvas: (container, step) => {
    renderProfileDpCanvas(container, step);
  },
});
