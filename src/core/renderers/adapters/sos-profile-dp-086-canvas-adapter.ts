/**
 * Class 086: 高阶状压 DP 与 SOS DP / 子集和高维前缀和 (Sum Over Subsets) CanvasAdapter
 * 职责：挂载与更新 SOS 高维前缀和超立方体看板及数学公式卡
 */

import { SosDp086Step } from './sos-profile-dp-086-step-compiler';
import { renderSosDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export class SosDp086CanvasAdapter {
  render(container: HTMLElement, step: SosDp086Step): void {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderSosDpBoard(
          step.dim,
          step.curBit,
          step.dp,
          step.focusMask
        )}
        ${renderFormulaCard(
          'SOS DP 高维前缀和递推方程',
          'dp[mask] \\mathrel{+}= dp[mask \\oplus 2^i] \\quad (\\text{当 } mask \\text{ 的第 } i \\text{ 位为 } 1)',
          '将掩码状态空间视作 $N$ 维布尔超立方体。外层循环枚举超立方体的每一个维度 $i \\in [0, N-1]$，内层循环对该维度做一次标准的一维前缀和，从而将全部 $2^N$ 个状态的子集和计算复杂度从 $O(3^N)$ 优化至 $O(N \\cdot 2^N)$。'
        )}
      </div>
    `;
  }
}

export const sosDp086CanvasAdapter = new SosDp086CanvasAdapter();
