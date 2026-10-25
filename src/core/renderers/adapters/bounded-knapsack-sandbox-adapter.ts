/**
 * 多重背包与二进制拆分拟物沙盘适配器 (BoundedKnapsackSandboxAdapter)
 * 遵循单一职责与深模块原则：
 *
 * 核心设计契约：
 * 1. 宝物货架与品类陈列 (Treasure Shelves · 7 列):
 *    - 朴素模式：陈列宝物规格 (重量 W, 价值 V, 数量限制 C), 实时高亮当前考察品类与当前尝试件数 k
 *    - 二进制拆分模式：陈列 1, 2, 4... 位权衍生包货架，展示拆分过程与当前考察衍生包
 * 2. 宝物载荷舱 (Treasure Knapsack Container · 5 列):
 *    - 载重负荷水位计 (已用载重 / 背包最大容量 W)
 *    - 累计总价值仪表 (当前达成价值)
 *    - 精准回溯 (Backtracking)：当前状态下装入的宝物件数清单 (如 📦 宝物 #1 × 2 件)
 *    - 转移决策看板 (朴素多分支枚举 vs 01 衍生包二叉决策)
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface BoundedKnapsackItem {
  id: number;
  weight: number;
  value: number;
  count: number;
  name: string;
}

export interface DerivedBinaryPackage {
  id: number;
  origId: number;
  multiplier: number;
  weight: number;
  value: number;
}

export interface BoundedInventoryItem {
  id: number;
  name: string;
  unitWeight: number;
  unitValue: number;
  count: number;
  totalWeight: number;
  totalValue: number;
}

export class BoundedKnapsackSandboxAdapter {
  /**
   * 解析多重背包的基础数据与二进制衍生包
   */
  public static parseData(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): {
    items: BoundedKnapsackItem[];
    derivedPackages: DerivedBinaryPackage[];
    capacity: number;
    isBinary: boolean;
  } {
    let rawWeights: number[] = [];
    let rawValues: number[] = [];
    let rawNums: number[] = [];
    let capacity = 10;

    const mId = options.modelId || '';
    const isBinary =
      mId === 'bounded-knapsack-binary' ||
      mId === 'bounded-knapsack-binary-075' ||
      mId === 'class075-code02' ||
      mId === 'multiple-knapsack-binary' ||
      mId === 'luogu-p1776-binary';

    if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = (model.defaultParams as any) || {};
      rawWeights = params.weights || [2, 3, 5];
      rawValues = params.values || [3, 4, 7];
      rawNums = params.nums || [2, 3, 2];
      capacity = Number(params.bagWeight ?? params.t ?? 10);
    } else {
      rawWeights = [2, 3, 5];
      rawValues = [3, 4, 7];
      rawNums = [2, 3, 2];
    }

    if ((step as any).totalCapacity !== undefined) {
      capacity = Number((step as any).totalCapacity);
    }

    const items: BoundedKnapsackItem[] = rawWeights.map((w, idx) => ({
      id: idx + 1,
      weight: Number(w),
      value: Number(rawValues[idx] ?? w),
      count: Number(rawNums[idx] ?? 1),
      name: `宝物 #${idx + 1}`,
    }));

    // 构建二进制衍生包
    const derivedPackages: DerivedBinaryPackage[] = [];
    let derivedId = 1;
    for (let i = 0; i < items.length; i++) {
      let cnt = items[i].count;
      const w = items[i].weight;
      const v = items[i].value;
      for (let k = 1; k <= cnt; k <<= 1) {
        derivedPackages.push({
          id: derivedId++,
          origId: items[i].id,
          multiplier: k,
          weight: k * w,
          value: k * v,
        });
        cnt -= k;
      }
      if (cnt > 0) {
        derivedPackages.push({
          id: derivedId++,
          origId: items[i].id,
          multiplier: cnt,
          weight: cnt * w,
          value: cnt * v,
        });
      }
    }

    return { items, derivedPackages, capacity, isBinary };
  }

  /**
   * 回溯当前容量状态下的装入清单
   */
  public static backtrack(
    curI: number,
    curJ: number,
    items: BoundedKnapsackItem[],
    derivedPackages: DerivedBinaryPackage[],
    isBinary: boolean,
    grid?: (number | null)[][],
    dp1d?: (number | null)[],
    step?: UniversalStep
  ): BoundedInventoryItem[] {
    const counts = new Map<number, number>();

    if (grid && Array.isArray(grid) && grid.length > 0) {
      let remJ = curJ;
      if (isBinary) {
        let pIdx = Math.min(curI, grid.length - 1, derivedPackages.length - 1);
        while (pIdx >= 0 && remJ > 0) {
          const pkg = derivedPackages[pIdx];
          const curCell = grid[pIdx]?.[remJ] ?? 0;
          const prevCell = pIdx > 0 ? (grid[pIdx - 1]?.[remJ] ?? 0) : 0;
          if (curCell !== prevCell && remJ >= pkg.weight) {
            counts.set(pkg.origId, (counts.get(pkg.origId) || 0) + pkg.multiplier);
            remJ -= pkg.weight;
          }
          pIdx--;
        }
      } else {
        // 朴素枚举回溯：如果当前步是试选步 (trialK)，扣除正在尝试的 k 件
        if (typeof (step as any)?.k === 'number' && (step as any).k > 0) {
          const currentItem = items[curI];
          if (currentItem) {
            const trialCount = (step as any).k;
            const trialWeight = currentItem.weight * trialCount;
            if (remJ >= trialWeight) {
              counts.set(currentItem.id, trialCount);
              remJ -= trialWeight;
            }
          }
        }

        // 从上一行往前倒推装入情况
        let i = Math.min(curI - 1, grid.length - 1, items.length - 1);
        while (i >= 0 && remJ > 0) {
          const item = items[i];
          const curCell = grid[i]?.[remJ] ?? 0;
          const prevCell = i > 0 ? (grid[i - 1]?.[remJ] ?? 0) : 0;

          if (curCell !== prevCell) {
            for (let k = item.count; k >= 1; k--) {
              const kw = k * item.weight;
              const kv = k * item.value;
              if (remJ >= kw) {
                const subCell = i > 0 ? (grid[i - 1]?.[remJ - kw] ?? 0) : 0;
                if (curCell === subCell + kv) {
                  counts.set(item.id, (counts.get(item.id) || 0) + k);
                  remJ -= kw;
                  break;
                }
              }
            }
          }
          i--;
        }
      }
    }

    const inventory: BoundedInventoryItem[] = [];
    for (const item of items) {
      const count = counts.get(item.id) || 0;
      if (count > 0) {
        inventory.push({
          id: item.id,
          name: item.name,
          unitWeight: item.weight,
          unitValue: item.value,
          count,
          totalWeight: item.weight * count,
          totalValue: item.value * count,
        });
      }
    }

    return inventory;
  }

  /**
   * 渲染完整多重背包拟物沙盘
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.innerHTML = '';
    container.className = 'bounded-knapsack-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; background: transparent; overflow-y: auto; box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif;';

    const { items, derivedPackages, capacity, isBinary } = this.parseData(step, options);

    const curI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : capacity;

    const inventory = this.backtrack(curI, curJ, items, derivedPackages, isBinary, step.grid, step.dp1d, step);
    const usedWeight = inventory.reduce((acc, it) => acc + it.totalWeight, 0);
    const totalVal = inventory.reduce((acc, it) => acc + it.totalValue, 0);
    const progressPercent = Math.min(100, Math.round((usedWeight / Math.max(1, capacity)) * 100));

    const html = `
      <div class="bounded-knapsack-sandbox" style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box; user-select: none; color: #f1f5f9;">
        <!-- 顶部提示横条 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; ${
          isBinary
            ? 'background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3);'
            : 'background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3);'
        } font-size: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${isBinary ? '✂️' : '📦'}</span>
            <span style="font-weight: bold; color: ${isBinary ? '#c084fc' : '#fbbf24'};">
              ${isBinary ? '多重背包二进制拆分沙盘' : '多重背包朴素枚举沙盘'}
            </span>
            <span style="color: #64748b;">|</span>
            <span style="color: #cbd5e1;">
              ${
                isBinary
                  ? '将每种数量为 c[i] 的宝物按 <strong style="color: #c084fc;">1, 2, 4, ...</strong> 二进制拆分转化为 01 背包，时间复杂度 O(W · Σlog c)'
                  : '每种宝物拥有<strong style="color: #fbbf24;">数量上限 c[i]</strong>，状态转移时枚举放入 k 件 (0 <= k <= c[i])'
              }
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 11px;">
            <span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; ${
              isBinary ? 'background: rgba(168, 85, 247, 0.2); color: #d8b4fe;' : 'background: rgba(245, 158, 11, 0.2); color: #fde68a;'
            }">
              ${isBinary ? `衍生包 #${curI + 1}` : `宝物 #${curI + 1}`}
            </span>
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-weight: bold;">
              容量: j = ${curJ} / ${capacity}
            </span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 货架，右 5 列: 载荷舱) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: start; box-sizing: border-box;">
          
          <!-- 左侧：宝物陈列货架 (7 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: ${isBinary ? '#c084fc' : '#fbbf24'};">📦</span>
                ${isBinary ? '二进制拆分衍生 01 物品货架' : '宝物库品类与件数限制货架'}
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">
                ${isBinary ? `原 ${items.length} 种宝物 → 拆分为 ${derivedPackages.length} 件衍生包` : `共 ${items.length} 种宝物`}
              </span>
            </div>

            <!-- 卡片网格 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              ${
                isBinary
                  ? derivedPackages
                      .map((pkg, idx) => {
                        const isCur = idx === curI;
                        let borderCls = isCur
                          ? 'border: 2px solid #a855f7; background: rgba(59, 7, 100, 0.4); box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.2);'
                          : 'border: 1px solid #334155; background: rgba(15, 23, 42, 0.6);';

                        return `
                          <div style="position: relative; padding: 10px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; box-sizing: border-box; ${borderCls}">
                            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(100, 116, 139, 0.4); padding-bottom: 4px;">
                              <span style="font-weight: 800; font-size: 12px; color: #f1f5f9;">衍生包 #${pkg.id}</span>
                              <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; ${
                                isCur ? 'background: #a855f7; color: #ffffff;' : 'background: rgba(51, 65, 85, 0.6); color: #94a3b8;'
                              }">
                                源宝物 #${pkg.origId} × ${pkg.multiplier}
                              </span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; text-align: center; font-size: 12px; font-family: monospace;">
                              <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.8);">
                                <div style="font-size: 9px; color: #94a3b8;">重量</div>
                                <div style="font-weight: bold; color: #38bdf8;">${pkg.weight}</div>
                              </div>
                              <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.8);">
                                <div style="font-size: 9px; color: #94a3b8;">价值</div>
                                <div style="font-weight: bold; color: #fbbf24;">+${pkg.value}</div>
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
                  : items
                      .map((it, idx) => {
                        const isCur = idx === curI;
                        const takenInfo = inventory.find((inv) => inv.id === it.id);
                        const takenCount = takenInfo ? takenInfo.count : 0;

                        let borderCls = isCur
                          ? 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.4); box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);'
                          : 'border: 1px solid #334155; background: rgba(15, 23, 42, 0.6);';

                        return `
                          <div style="position: relative; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; box-sizing: border-box; ${borderCls}">
                            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(100, 116, 139, 0.4); padding-bottom: 6px;">
                              <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 14px;">💎</span>
                                <span style="font-weight: 800; font-size: 12px; color: #f1f5f9;">${escapeHtml(it.name)}</span>
                              </div>
                              <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; ${
                                isCur
                                  ? 'background: #f59e0b; color: #ffffff;'
                                  : takenCount > 0
                                  ? 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7;'
                                  : 'background: rgba(51, 65, 85, 0.6); color: #94a3b8;'
                              }">
                                ${
                                  isCur && typeof (step as any)?.k === 'number'
                                    ? ((step as any).k > 0 ? `正在尝试 ×${(step as any).k} 件` : '尝试不选 (0件)')
                                    : takenCount > 0
                                    ? `已装 ×${takenCount} 件`
                                    : `限 ${it.count} 件`
                                }
                              </span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center; font-size: 12px; font-family: monospace;">
                              <div style="padding: 6px; border-radius: 4px; background: rgba(30, 41, 59, 0.8);">
                                <div style="font-size: 9px; color: #94a3b8;">单件重量</div>
                                <div style="font-weight: bold; color: #38bdf8;">${it.weight}</div>
                              </div>
                              <div style="padding: 6px; border-radius: 4px; background: rgba(30, 41, 59, 0.8);">
                                <div style="font-size: 9px; color: #94a3b8;">单件价值</div>
                                <div style="font-weight: bold; color: #fbbf24;">${it.value}</div>
                              </div>
                              <div style="padding: 6px; border-radius: 4px; background: rgba(30, 41, 59, 0.8);">
                                <div style="font-size: 9px; color: #94a3b8;">可用上限</div>
                                <div style="font-weight: bold; color: #c084fc;">${it.count} 件</div>
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- 右侧：宝物载荷舱 (5 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #10b981;">💰</span> 背包载荷舱 (Knapsack Container)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">剩余容量: ${Math.max(0, capacity - usedWeight)}</span>
            </div>

            <div style="padding: 14px; border-radius: 12px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.8); display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;">
              
              <!-- 重量载荷条 -->
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <span style="color: #94a3b8;">载重使用率</span>
                  <span style="font-family: monospace; font-weight: bold; color: #38bdf8;">
                    ${usedWeight} / ${capacity} (${progressPercent}%)
                  </span>
                </div>
                
                <div style="width: 100%; height: 12px; border-radius: 9999px; background: #334155; overflow: hidden; border: 1px solid #475569; padding: 2px; box-sizing: border-box;">
                  <div
                    style="height: 100%; border-radius: 9999px; transition: width 0.3s; background: linear-gradient(to right, #38bdf8, #6366f1); width: ${progressPercent}%;"
                  ></div>
                </div>
              </div>

              <!-- 价值与状态 -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: center; font-size: 12px; font-family: monospace;">
                <div style="padding: 8px; border-radius: 8px; background: rgba(30, 41, 59, 0.8);">
                  <div style="font-size: 10px; color: #94a3b8;">累计宝物价值</div>
                  <div style="font-size: 14px; font-weight: 800; color: #fbbf24;">
                    ${totalVal} 价值
                  </div>
                </div>
                <div style="padding: 8px; border-radius: 8px; background: rgba(30, 41, 59, 0.8);">
                  <div style="font-size: 10px; color: #94a3b8;">算法求解模式</div>
                  <div style="font-size: 12px; font-weight: bold; color: ${isBinary ? '#c084fc' : '#fbbf24'};">
                    ${isBinary ? '二进制拆分 01 转化' : '朴素三重循环枚举'}
                  </div>
                </div>
              </div>

              <!-- 装入清单 -->
              <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px dashed rgba(100, 116, 139, 0.4);">
                <div style="font-size: 11px; font-weight: bold; color: #cbd5e1; display: flex; align-items: center; justify-content: space-between;">
                  <span>💎 包内宝物清单</span>
                  <span style="font-size: 10px; font-weight: normal; color: #94a3b8;">回溯统计</span>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 38px; align-items: center;">
                  ${
                    inventory.length === 0
                      ? `<span style="font-size: 11px; color: #64748b; font-style: italic;">背包空空如也 (价值 0)</span>`
                      : inventory
                          .map(
                            (it) => `
                              <div style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-family: monospace;">
                                <span style="font-weight: bold; color: #fde68a;">${escapeHtml(it.name)}</span>
                                <span style="color: #64748b;">×</span>
                                <span style="font-weight: 800; color: #34d399;">${it.count} 件</span>
                                <span style="font-size: 10px; color: #94a3b8;">(重${it.totalWeight}, 价${it.totalValue})</span>
                              </div>
                            `
                          )
                          .join('')
                  }
                </div>
              </div>

              <!-- 决策看板 -->
              <div style="padding: 8px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; font-size: 11px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold; color: #f1f5f9;">
                  <span>⚖️ 状态转移决策</span>
                  <span style="font-family: monospace; font-size: 10px;">dp[${curI}][${curJ}]</span>
                </div>
                <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.5; font-family: monospace;">
                  ${escapeHtml(step.msg || step.log || '正在推导多重背包状态转移...')}
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
