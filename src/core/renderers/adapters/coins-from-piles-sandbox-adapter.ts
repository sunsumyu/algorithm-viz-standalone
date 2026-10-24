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
        const fromPrev = prevRow >= 0 ? (grid[prevRow]?.[remJ - c] ?? 0) : 0;
        if (curCell === fromPrev + cumSum) {
          matchedTake = c;
          matchedSum = cumSum;
          break;
        }
      }

      if (matchedTake > 0) {
        plans.unshift({
          pileIdx: p,
          takeCount: matchedTake,
          sumVal: matchedSum,
          coins: pile.slice(0, matchedTake),
        });
        remJ -= matchedTake;
      } else if (!isOneBasedGrid && p === 0 && curCell > 0) {
        let s = 0;
        for (let c = 1; c <= maxC; c++) {
          s += pile[c - 1];
          if (s === curCell) {
            plans.unshift({
              pileIdx: 0,
              takeCount: c,
              sumVal: s,
              coins: pile.slice(0, c),
            });
            remJ -= c;
            break;
          }
        }
      }
    }

    return plans;
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

    container.className = 'w-full h-full flex flex-col relative z-0 bg-transparent border-0 shadow-none p-0 overflow-y-auto';
    container.style.display = 'flex';
    container.style.width = '100%';

    const { piles, kTarget } = this.parsePilesAndK(step, options);

    const rawI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : kTarget;
    const curC = typeof (step as any).c === 'number' ? (step as any).c : (typeof (step as any).k === 'number' ? (step as any).k : 0);

    // 智能识别当前考察的硬币栈物理下标 pileIdx (0..piles.length - 1)
    const isOneBased = (step.stage === 3 || step.grid?.length === piles.length + 1) && rawI >= 1 && rawI <= piles.length;
    const pileIdx = isOneBased ? rawI - 1 : Math.min(Math.max(0, rawI), piles.length - 1);

    // 计算当前栈的前缀和
    const curPile = piles[pileIdx] || [];
    const preSums = [0];
    for (let c = 1; c <= curPile.length; c++) {
      preSums.push(preSums[c - 1] + curPile[c - 1]);
    }

    const isTrialStep = (step.type === 'loop-coins' || step.type === 'transition' || step.type === 'loop-step' || step.type === 'branch-not-take' || (step as any).decision?.includes('try') || (step as any).decision?.includes('尝试') || (step as any).decision?.includes('拿'));

    let currentTakes: PileTakePlan[] = [];
    let trialPlan: PileTakePlan | null = null;

    if (isTrialStep && pileIdx > 0) {
      // 真实物理映射：当前栈尝试提取 curC 枚，留给前置栈的有效容量为 curJ - curC
      const remCapForPrev = Math.max(0, curJ - curC);
      currentTakes = this.backtrackTakes(pileIdx - 1, remCapForPrev, piles, step.grid);
      if (curC > 0) {
        trialPlan = {
          pileIdx,
          takeCount: curC,
          sumVal: preSums[curC] || 0,
          coins: curPile.slice(0, curC),
        };
      }
    } else if (isTrialStep && pileIdx === 0) {
      currentTakes = [];
      if (curC > 0) {
        trialPlan = {
          pileIdx: 0,
          takeCount: curC,
          sumVal: preSums[curC] || 0,
          coins: curPile.slice(0, curC),
        };
      }
    } else {
      currentTakes = this.backtrackTakes(pileIdx, curJ, piles, step.grid);
    }

    const prevCollectedVal = currentTakes.reduce((acc, t) => acc + t.sumVal, 0);
    const totalCollectedVal = prevCollectedVal + (trialPlan ? trialPlan.sumVal : 0);
    const usedK = currentTakes.reduce((acc, t) => acc + t.takeCount, 0) + (trialPlan ? trialPlan.takeCount : 0);
    const remK = Math.max(0, kTarget - usedK);
    const progressPercent = Math.min(100, Math.round((usedK / Math.max(1, kTarget)) * 100));

    // 组装 HTML
    const html = `
      <div class="coins-from-piles-sandbox w-full flex flex-col gap-3 p-3 font-sans select-none text-slate-800 dark:text-slate-100">
        <!-- 顶部提示横条 -->
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-500/20 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">🪙</span>
            <span class="font-bold text-amber-700 dark:text-amber-300">硬币栈连续提取与钱包收集沙盘</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600 dark:text-slate-300">物理法则：<strong class="text-amber-600 dark:text-amber-400">每次只能从栈顶向下连续取硬币</strong>，转化为互斥物品组进行分组背包选择！</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">当前栈: 栈 #${pileIdx} (第 ${pileIdx + 1} 栈)</span>
            <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-200 font-bold">容量上限: j = ${curJ} / ${kTarget}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 硬币栈柱与互斥组转化，右 5 列: 真实钱包舱体) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          <!-- 左侧：多栈硬币立柱陈列 (7 列) -->
          <div class="lg:col-span-7 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group text-amber-600"></i> 物理硬币栈 (Piles · 栈顶连续抽取候选池)
              </span>
              <span class="text-[11px] font-mono text-slate-500">共 ${piles.length} 个独立硬币栈</span>
            </div>

            <!-- 硬币栈柱容器列表 -->
            <div class="grid grid-cols-1 sm:grid-cols-${Math.min(3, piles.length)} gap-3">
              ${piles
                .map((pile, pIdx) => {
                  const isCurrent = pIdx === pileIdx;
                  const borderCls = isCurrent
                    ? 'border-amber-500/90 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40';

                  // 检查当前栈是否有已选中的方案
                  const plan = currentTakes.find((t) => t.pileIdx === pIdx);
                  const planCount = plan ? plan.takeCount : 0;

                  return `
                    <div class="relative p-3 rounded-xl border flex flex-col gap-2 transition-all ${borderCls}">
                      <!-- 栈顶标牌 -->
                      <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm">🪙</span>
                          <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">栈 #${pIdx} <span class="text-[10px] text-slate-400 font-normal">(第 ${pIdx + 1} 栈)</span></span>
                        </div>
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-amber-500 text-white font-bold animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }">
                          ${isCurrent ? (curC > 0 ? `试选 ${curC} 枚` : '当前考察(0枚)') : planCount > 0 ? `已取 ${planCount} 枚` : '未拿取'}
                        </span>
                      </div>

                      <!-- 栈顶标识 -->
                      <div class="text-[10px] font-mono text-slate-400 text-center flex items-center justify-center gap-1">
                        <span>↓ 栈顶 (Top)</span>
                      </div>

                      <!-- 硬币栈柱身体：从栈顶到栈底陈列 -->
                      <div class="flex flex-col gap-1.5 p-1.5 rounded-lg bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
                        ${pile
                          .map((val, cIdx) => {
                            // 判断硬币当前状态：
                            // 1. 若当前栈正在试选拿 c 枚 (isCurrent && curC > 0 && cIdx < curC) -> 正在试选提取中
                            // 2. 若属于前置已回溯方案中 (!isCurrent && planCount > 0 && cIdx < planCount) -> 已装入钱包
                            // 3. 其它 -> 尚未抽取
                            const isTrialTaking = isCurrent && curC > 0 && cIdx < curC;
                            const isAlreadyTaken = !isCurrent && planCount > 0 && cIdx < planCount;

                            let coinCardCls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200';
                            let statusBadge = `<span class="text-[9px] font-mono text-slate-400">第 ${cIdx + 1} 枚</span>`;

                            if (isTrialTaking) {
                              coinCardCls = 'border-amber-500 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 text-amber-900 dark:text-amber-100 ring-1 ring-amber-400 shadow-sm animate-pulse';
                              statusBadge = '<span class="text-[9px] font-bold px-1 rounded bg-amber-500 text-white">试提取中</span>';
                            } else if (isAlreadyTaken) {
                              coinCardCls = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-400';
                              statusBadge = '<span class="text-[9px] font-bold px-1 rounded bg-emerald-600 text-white">已入钱包</span>';
                            } else if (isCurrent && curC > 0 && cIdx >= curC) {
                              coinCardCls = 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 opacity-50';
                              statusBadge = '<span class="text-[9px] font-mono text-slate-400">🔒 组内互斥锁</span>';
                            }

                            return `
                              <div class="p-1.5 rounded border flex items-center justify-between text-xs font-mono transition-all ${coinCardCls}">
                                <div class="flex items-center gap-1.5">
                                  <span class="text-xs">🪙</span>
                                  <span class="font-extrabold text-amber-600 dark:text-amber-400">+${val}</span>
                                </div>
                                ${statusBadge}
                              </div>
                            `;
                          })
                          .join('')}
                      </div>

                      <!-- 栈底标识 -->
                      <div class="text-[10px] font-mono text-slate-400 text-center flex items-center justify-center gap-1">
                        <span>↑ 栈底 (Bottom)</span>
                      </div>

                      <!-- 互斥前缀和组桶选项池展示 -->
                      <div class="p-1.5 rounded-lg bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col gap-1 text-[10px]">
                        <div class="font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                          <span>📦 连续抽取前缀和选项:</span>
                          <span class="font-mono text-slate-400">至多选 1 项</span>
                        </div>
                        <div class="grid grid-cols-2 gap-1 text-[9px] font-mono">
                          <div class="p-1 rounded border text-center ${
                            isCurrent && curC === 0
                              ? 'border-blue-500 bg-blue-500/20 text-blue-800 dark:text-blue-200 font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500'
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
                                ? 'border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold'
                                : 'border-slate-200 dark:border-slate-800 text-slate-500';

                              return `
                                <div class="p-1 rounded border text-center ${activeCls}">
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
          <div class="lg:col-span-5 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-wallet text-amber-600"></i> 实体钱包收集舱 (Wallet Container)
              </span>
              <span class="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-extrabold">容量限制: ${curJ} / ${kTarget} 次</span>
            </div>

            <!-- 钱包舱体卡片 -->
            <div class="relative p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg flex flex-col gap-3">
              <!-- 钱包拉链/搭扣拟物造型 -->
              <div class="w-16 h-2 mx-auto rounded-full bg-amber-400 dark:bg-amber-600 shadow-inner"></div>

              <!-- 水位指示仪表 -->
              <div class="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 shadow-2xs">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-600 dark:text-slate-300">硬币抽取次数配额</span>
                  <span class="font-mono font-extrabold text-amber-600 dark:text-amber-400">${progressPercent}% (${usedK} / ${kTarget})</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
                  <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300" style="width: ${progressPercent}%;"></div>
                </div>

                <div class="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">已取硬币数</div>
                    <div class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${usedK} 枚</div>
                  </div>
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">剩余操作配额</div>
                    <div class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">${remK} 次</div>
                  </div>
                  <div class="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                    <div class="text-[9px] text-amber-600 dark:text-amber-400 font-bold">累计总面值</div>
                    <div class="text-sm font-mono font-black text-amber-600 dark:text-amber-300">${totalCollectedVal}</div>
                  </div>
                </div>
              </div>

              <!-- 钱包内部装入清单 -->
              <div class="flex flex-col gap-1.5">
                <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>👛 钱包内当前硬币方案陈列:</span>
                  <span class="text-[10px] font-mono text-slate-500">${currentTakes.length + (trialPlan ? 1 : 0)} 个硬币栈已参与贡献</span>
                </div>

                <div class="min-h-[90px] p-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col gap-1.5">
                  ${
                    currentTakes.length === 0 && !trialPlan
                      ? '<div class="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 py-6">钱包当前为空 (尚未抽取任何硬币)</div>'
                      : currentTakes
                          .map((t) => {
                            return `
                              <div class="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-emerald-500/30 text-xs shadow-2xs">
                                <div class="flex items-center gap-2">
                                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">栈 #${t.pileIdx}</span>
                                  <span class="font-bold text-slate-800 dark:text-slate-100">第 ${t.pileIdx + 1} 栈 · 抽取 ${t.takeCount} 枚硬币</span>
                                </div>
                                <div class="flex items-center gap-2 font-mono">
                                  <span class="text-slate-500 text-[11px]">[${t.coins.join(', ')}]</span>
                                  <span class="text-amber-600 dark:text-amber-400 font-extrabold">+${t.sumVal}</span>
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
                    <div class="flex items-center justify-between p-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-500/10 text-xs animate-pulse">
                      <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
                        <span>⚡ 正在试选: 栈 #${trialPlan.pileIdx} (第 ${trialPlan.pileIdx + 1} 栈) · 连续提取 ${trialPlan.takeCount} 枚</span>
                      </div>
                      <div class="font-mono text-[11px] flex items-center gap-2">
                        <span class="text-slate-500">[${trialPlan.coins.join(', ')}]</span>
                        <span class="text-amber-600 dark:text-amber-400 font-bold">面值: +${trialPlan.sumVal}</span>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- 决策比较看板 -->
              <div class="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs flex flex-col gap-1">
                <div class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <i class="fa-solid fa-scale-balanced text-amber-600"></i>
                  <span>转移决策比较看板</span>
                </div>
                <div class="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
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
