/**
 * 从栈中取出K个硬币的最大面值和 (CoinsFromPilesSandboxAdapter) — 拟物化硬币栈与收集舱沙盘
 *
 * 核心设计契约：
 * 1. 真实实体硬币栈 (Physical Coin Piles Columns · 7 列):
 *    - 呈现每个硬币栈柱的拟物立柱结构，栈顶 Top 标牌，金币金光质感圆角块
 *    - 严格体现“必须从栈顶自上而下连续提取”的物理规则
 *    - 试选 c 枚硬币时，栈顶前 c 枚硬币呈现黄金上浮高亮并动态计算前缀和
 *    - 栈底呈现由栈顶连续抽取衍生出的“互斥物品选择组” (选项 0, 选项 1, ...)
 * 2. 真实钱包收集舱与抽取操作表 (Wallet Container & Capacity Gauge · 5 列):
 *    - 拟物钱包舱体，k 步操作配额仪表盘 (已用次数、剩余配额、累计总面值)
 *    - DP 状态精准回溯 (Backtracking): 实时展示包内由各栈已抽取的硬币清单
 *    - 试选比较看板: 不拿当前栈 (继承) vs 连续拿 c 枚 (转移计算)
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface PileTakePlan {
  pileIdx: number;
  takeCount: number;
  sumVal: number;
  coins: number[];
}

export class CoinsFromPilesSandboxAdapter {
  /**
   * 解析硬币栈 piles 与抽取上限 k
   */
  public static parsePilesAndK(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): { piles: number[][]; kTarget: number } {
    let rawPiles: any = (step as any).piles;
    let kTarget = Number(options.params?.k || (step as any).kTarget || (step.variables as any)?.k || 2);

    if (!Array.isArray(rawPiles) || rawPiles.length === 0) {
      if (options.params?.piles && Array.isArray(options.params.piles)) {
        rawPiles = options.params.piles;
      } else if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
        const model = AlgorithmModelRepository.getModel(options.modelId);
        const params = (model.defaultParams as any) || {};
        rawPiles = params.piles;
        kTarget = Number(params.k || kTarget);
      }
    }

    const piles: number[][] = [];
    if (Array.isArray(rawPiles)) {
      for (const p of rawPiles) {
        if (Array.isArray(p)) {
          piles.push(p.map(Number));
        }
      }
    }

    if (piles.length === 0) {
      piles.push([1, 100, 3], [7, 8, 9]);
    }

    return { piles, kTarget };
  }

  /**
   * 从当前二维 DP 状态表精确回溯当前已抽取的硬币方案
   */
  public static backtrackTakes(
    curI: number,
    curJ: number,
    piles: number[][],
    grid?: (number | null)[][]
  ): PileTakePlan[] {
    const plans: PileTakePlan[] = [];
    if (!grid || !Array.isArray(grid) || grid.length === 0) return plans;

    let remJ = curJ;
    const isOneBasedGrid = grid.length === piles.length + 1;
    const safePileIdx = curI >= piles.length
      ? Math.min(curI - 1, piles.length - 1)
      : Math.max(0, Math.min(curI, piles.length - 1));

    for (let p = safePileIdx; p >= 0; p--) {
      const pile = piles[p];
      const curRow = isOneBasedGrid ? p + 1 : p;
      const prevRow = isOneBasedGrid ? p : p - 1;
      const curCell = grid[curRow]?.[remJ] ?? 0;
      const prevRowVal = prevRow >= 0 ? (grid[prevRow]?.[remJ] ?? 0) : 0;

      // 如果当前行值与上一行在 remJ 处相等，说明该栈选了 0 枚
      if (prevRow >= 0 && curCell === prevRowVal) {
        continue;
      }

      // 在当前栈中搜寻是抽取了多少枚硬币
      let matchedTake = -1;
      let matchedSum = 0;
      let cumSum = 0;
      const maxC = Math.min(pile.length, remJ);

      for (let c = 1; c <= maxC; c++) {
        cumSum += pile[c - 1];
        const subCell = prevRow >= 0 ? (grid[prevRow]?.[remJ - c] ?? 0) : 0;
        if (curCell === subCell + cumSum) {
          matchedTake = c;
          matchedSum = cumSum;
        }
      }

      if (matchedTake > 0) {
        plans.push({
          pileIdx: p,
          takeCount: matchedTake,
          sumVal: matchedSum,
          coins: pile.slice(0, matchedTake),
        });
        remJ -= matchedTake;
      }
    }

    // 倒序恢复为按 pileIdx 正序排列
    return plans.reverse();
  }

  /**
   * 渲染硬币栈拟物沙盘
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.innerHTML = '';
    container.className = 'coins-from-piles-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; background: transparent; overflow-y: auto; box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif;';

    const { piles, kTarget } = this.parsePilesAndK(step, options);

    const isOneBasedGrid = step.grid ? step.grid.length === piles.length + 1 : false;
    let pileIdx = 0;
    if (typeof step.i === 'number') {
      pileIdx = isOneBasedGrid ? Math.max(0, step.i - 1) : step.i;
    }
    const curJ = typeof step.j === 'number' ? step.j : kTarget;
    const curC = typeof (step as any).c === 'number' ? (step as any).c : 0;

    let currentTakes: PileTakePlan[] = [];
    let trialPlan: PileTakePlan | null = null;

    if (curC > 0 && pileIdx < piles.length) {
      const activePile = piles[pileIdx];
      const validTake = Math.min(curC, activePile.length, curJ);
      let trialSum = 0;
      for (let k = 0; k < validTake; k++) trialSum += activePile[k];

      trialPlan = {
        pileIdx,
        takeCount: validTake,
        sumVal: trialSum,
        coins: activePile.slice(0, validTake),
      };

      const remCapacityBeforeTrial = Math.max(0, curJ - validTake);
      currentTakes = this.backtrackTakes(pileIdx - 1, remCapacityBeforeTrial, piles, step.grid);
    } else {
      currentTakes = this.backtrackTakes(pileIdx, curJ, piles, step.grid);
    }

    const takenCoinsCount = currentTakes.reduce((acc, t) => acc + t.takeCount, 0);
    const takenCoinsVal = currentTakes.reduce((acc, t) => acc + t.sumVal, 0);

    const totalCollectedVal = takenCoinsVal + (trialPlan ? trialPlan.sumVal : 0);
    const usedK = takenCoinsCount + (trialPlan ? trialPlan.takeCount : 0);
    const remK = Math.max(0, kTarget - usedK);
    const progressPercent = Math.min(100, Math.round((usedK / Math.max(1, kTarget)) * 100));

    const html = `
      <div class="coins-from-piles-sandbox" style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box; user-select: none; color: #f1f5f9;">
        <!-- 顶部提示横条 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🪙</span>
            <span style="font-weight: bold; color: #fbbf24;">从栈中取出K个硬币的最大面值和沙盘</span>
            <span style="color: #64748b;">|</span>
            <span style="color: #cbd5e1;">核心规则：<strong style="color: #fbbf24;">必须从栈顶自上而下连续提取</strong>，每个栈提取 c 枚等价于选择“前缀和为 S_c、重量为 c”的单项互斥宝物！</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 11px;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.2); color: #fde68a; font-weight: bold;">正在考察: 栈 #${pileIdx}</span>
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-weight: bold;">硬币配额: j = ${curJ} / ${kTarget}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 硬币栈，右 5 列: 实体钱包) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: start; box-sizing: border-box;">
          
          <!-- 左侧：硬币栈陈列 (7 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #fbbf24;">🪙</span> 物理硬币栈 (Piles · 栈顶连续抽取候选池)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">共 ${piles.length} 个独立硬币栈</span>
            </div>

            <!-- 硬币栈柱容器列表 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              ${piles
                .map((pile, pIdx) => {
                  const isCurrent = pIdx === pileIdx;
                  const borderCls = isCurrent
                    ? 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.4); box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);'
                    : 'border: 1px solid #334155; background: rgba(15, 23, 42, 0.6);';

                  // 检查当前栈是否有已选中的方案
                  const plan = currentTakes.find((t) => t.pileIdx === pIdx);
                  const planCount = plan ? plan.takeCount : 0;

                  return `
                    <div style="position: relative; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; box-sizing: border-box; ${borderCls}">
                      <!-- 栈顶标牌 -->
                      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(100, 116, 139, 0.4); padding-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 14px;">🪙</span>
                          <span style="font-weight: 800; font-size: 12px; color: #f1f5f9;">栈 #${pIdx} <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(第 ${pIdx + 1} 栈)</span></span>
                        </div>
                        <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; ${
                          isCurrent
                            ? 'background: #f59e0b; color: #ffffff; font-weight: bold;'
                            : 'background: rgba(51, 65, 85, 0.6); color: #94a3b8;'
                        }">
                          ${isCurrent ? (curC > 0 ? `试选 ${curC} 枚` : '当前考察(0枚)') : planCount > 0 ? `已取 ${planCount} 枚` : '未拿取'}
                        </span>
                      </div>

                      <!-- 栈顶标识 -->
                      <div style="font-size: 10px; font-family: monospace; color: #94a3b8; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>↓ 栈顶 (Top)</span>
                      </div>

                      <!-- 硬币栈柱身体：从栈顶到栈底陈列 -->
                      <div style="display: flex; flex-direction: column; gap: 6px; padding: 6px; border-radius: 8px; background: rgba(2, 6, 23, 0.5); border: 1px solid #1e293b;">
                        ${pile
                          .map((val, cIdx) => {
                            const isTrialTaking = isCurrent && curC > 0 && cIdx < curC;
                            const isAlreadyTaken = !isCurrent && planCount > 0 && cIdx < planCount;

                            let coinCardCls = 'border: 1px solid #334155; background: #1e293b; color: #e2e8f0;';
                            let statusBadge = `<span style="font-size: 9px; font-family: monospace; color: #94a3b8;">第 ${cIdx + 1} 枚</span>`;

                            if (isTrialTaking) {
                              coinCardCls = 'border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.25); color: #fde68a; box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);';
                              statusBadge = '<span style="font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 4px; background: #f59e0b; color: #ffffff;">试提取中</span>';
                            } else if (isAlreadyTaken) {
                              coinCardCls = 'border: 1px solid #10b981; background: rgba(16, 185, 129, 0.2); color: #a7f3d0;';
                              statusBadge = '<span style="font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 4px; background: #059669; color: #ffffff;">已入钱包</span>';
                            } else if (isCurrent && curC > 0 && cIdx >= curC) {
                              coinCardCls = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.4); opacity: 0.5;';
                              statusBadge = '<span style="font-size: 9px; font-family: monospace; color: #64748b;">🔒 组内互斥锁</span>';
                            }

                            return `
                              <div style="padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; transition: all 0.2s; ${coinCardCls}">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                  <span style="font-size: 12px;">🪙</span>
                                  <span style="font-weight: 800; color: #fbbf24;">+${val}</span>
                                </div>
                                ${statusBadge}
                              </div>
                            `;
                          })
                          .join('')}
                      </div>

                      <!-- 栈底标识 -->
                      <div style="font-size: 10px; font-family: monospace; color: #94a3b8; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>↑ 栈底 (Bottom)</span>
                      </div>

                      <!-- 互斥前缀和组桶选项池展示 -->
                      <div style="padding: 6px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
                        <div style="font-weight: bold; color: #fbbf24; display: flex; align-items: center; justify-content: space-between;">
                          <span>📦 连续抽取前缀和选项:</span>
                          <span style="font-family: monospace; color: #94a3b8;">至多选 1 项</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 9px; font-family: monospace;">
                          <div style="padding: 4px; border-radius: 4px; border: 1px solid #334155; text-align: center; ${
                            isCurrent && curC === 0
                              ? 'border-color: #3b82f6; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-weight: bold;'
                              : 'color: #94a3b8;'
                          }">
                            拿 0 枚 (+0)
                          </div>
                          ${pile
                            .slice(0, Math.min(3, pile.length))
                            .map((_, idx) => {
                              const count = idx + 1;
                              let pSum = 0;
                              for (let k = 0; k < count; k++) pSum += pile[k];
                              const isOptionActive = isCurrent && curC === count;
                              const activeCls = isOptionActive
                                ? 'border-color: #f59e0b; background: rgba(245, 158, 11, 0.25); color: #fde68a; font-weight: bold;'
                                : 'color: #94a3b8; border-color: #334155;';

                              return `
                                <div style="padding: 4px; border-radius: 4px; border: 1px solid; text-align: center; ${activeCls}">
                                  拿 ${count} 枚 (+${pSum})
                                </div>
                              `;
                            })
                            .join('')}
                        </div>
                      </div>

                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- 右侧：真实钱包收集舱与抽取操作表 (5 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #fbbf24;">👛</span> 实体钱包收集舱 (Wallet Container)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #fbbf24; font-weight: 800;">容量限制: ${curJ} / ${kTarget} 次</span>
            </div>

            <!-- 钱包舱体卡片 -->
            <div style="position: relative; padding: 14px; border-radius: 16px; border: 2px solid #334155; background: linear-gradient(to bottom, #1e293b, #0f172a); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;">
              <!-- 钱包拉链/搭扣拟物造型 -->
              <div style="width: 64px; height: 8px; margin: 0 auto; border-radius: 9999px; background: #d97706; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);"></div>

              <!-- 水位指示仪表 -->
              <div style="padding: 10px; border-radius: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <span style="font-weight: bold; color: #cbd5e1;">硬币抽取次数配额</span>
                  <span style="font-family: monospace; font-weight: 800; color: #fbbf24;">${progressPercent}% (${usedK} / ${kTarget})</span>
                </div>
                <div style="width: 100%; background: #334155; height: 12px; border-radius: 9999px; overflow: hidden; padding: 2px; box-sizing: border-box;">
                  <div style="height: 100%; border-radius: 9999px; background: linear-gradient(to right, #f59e0b, #eab308); width: ${progressPercent}%; transition: width 0.3s;"></div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 4px; text-align: center;">
                  <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.6);">
                    <div style="font-size: 9px; color: #94a3b8;">已取硬币数</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: bold; color: #f1f5f9;">${usedK} 枚</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.6);">
                    <div style="font-size: 9px; color: #94a3b8;">剩余操作配额</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: bold; color: #34d399;">${remK} 次</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                    <div style="font-size: 9px; color: #fbbf24; font-weight: bold;">累计总面值</div>
                    <div style="font-size: 14px; font-family: monospace; font-weight: 900; color: #fde68a;">${totalCollectedVal}</div>
                  </div>
                </div>
              </div>

              <!-- 钱包内部装入清单 -->
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 12px; font-weight: bold; color: #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                  <span>👛 钱包内当前硬币方案陈列:</span>
                  <span style="font-size: 10px; font-family: monospace; color: #94a3b8;">${currentTakes.length + (trialPlan ? 1 : 0)} 个硬币栈已参与贡献</span>
                </div>

                <div style="min-height: 90px; padding: 8px; border-radius: 12px; background: rgba(2, 6, 23, 0.6); border: 1px dashed #334155; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
                  ${
                    currentTakes.length === 0 && !trialPlan
                      ? '<div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b; padding: 24px 0;">钱包当前为空 (尚未抽取任何硬币)</div>'
                      : currentTakes
                          .map((t) => {
                            return `
                              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; background: #1e293b; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                  <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; font-family: monospace; font-weight: bold;">栈 #${t.pileIdx}</span>
                                  <span style="font-weight: bold; color: #f1f5f9;">第 ${t.pileIdx + 1} 栈 · 抽取 ${t.takeCount} 枚硬币</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; font-family: monospace;">
                                  <span style="color: #94a3b8; font-size: 11px;">[${t.coins.join(', ')}]</span>
                                  <span style="color: #fbbf24; font-weight: 800;">+${t.sumVal}</span>
                                </div>
                              </div>
                            `;
                          })
                          .join('')
                  }

                  <!-- 若当前有试选，显示试装入虚线预览卡 -->
                  ${
                    trialPlan
                      ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; border: 2px dashed #fbbf24; background: rgba(245, 158, 11, 0.15); font-size: 12px;">
                      <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #fde68a;">
                        <span>⚡ 正在试选: 栈 #${trialPlan.pileIdx} (第 ${trialPlan.pileIdx + 1} 栈) · 连续提取 ${trialPlan.takeCount} 枚</span>
                      </div>
                      <div style="font-family: monospace; font-size: 11px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #94a3b8;">[${trialPlan.coins.join(', ')}]</span>
                        <span style="color: #fbbf24; font-weight: bold;">面值: +${trialPlan.sumVal}</span>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- 决策比较看板 -->
              <div style="padding: 10px; border-radius: 12px; background: rgba(69, 26, 3, 0.25); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div style="font-weight: bold; color: #fde68a; display: flex; align-items: center; gap: 4px;">
                  <span style="color: #f59e0b;">⚖️</span>
                  <span>转移决策比较看板</span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">
                  ${escapeHtml(step.decision || step.msg || '动态规划状态推导中')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
