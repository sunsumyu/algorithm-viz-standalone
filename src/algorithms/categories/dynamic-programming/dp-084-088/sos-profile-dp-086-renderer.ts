/**
 * Class 086: 高阶状压 DP 与 SOS DP / 子集和高维前缀和 (Sum Over Subsets)
 * N 维超立方体逐维前缀和与 O(N * 2^N) 复杂度飞跃 / CF165E
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { SOS_DP_086_CODES } from './dp-084-088-stage-codes';
import {
  SosDp086Step,
  buildSosDp086Steps,
} from '../../../../core/renderers/adapters/sos-profile-dp-086-step-compiler';
import { sosDp086CanvasAdapter } from '../../../../core/renderers/adapters/sos-profile-dp-086-canvas-adapter';

export type { SosDp086Step };
export { buildSosDp086Steps };

export const sosDp086Visualizer = registerDeclarativeAlgorithm<SosDp086Step>({
  id: 'sos-profile-dp-086',
  name: '高阶状压 DP 与 SOS 高维前缀和 (Class 086)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class086-sos-dp', 'sos-profile-dp', 'sum-over-subsets', 'codeforces-165e'],
  problemContent: DP_084_088_PROBLEMS.sosDp086,
  sourceCodes: SOS_DP_086_CODES,
  generateSteps: buildSosDp086Steps,
  renderCanvas: (container, step) => sosDp086CanvasAdapter.render(container, step),
});
