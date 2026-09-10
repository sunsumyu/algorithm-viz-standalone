/**
 * 左神算法通关课 043 ~ 046 经典归并与快速排序专题 共享沙盘与渲染助手
 * 提供：归并排序分治合并沙盘、小和问题跨区批量累加沙盘、荷兰国旗三向切分沙盘、快速选择单侧剪枝沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Sort043Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 归并排序双指针合并沙盘 (Class 043)
// ----------------------------------------------------
export function renderMergeSortBoard(
  arr: number[],
  l: number,
  r: number,
  mid: number,
  help: number[],
  p1: number | null,
  p2: number | null,
  stage: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔀 归并排序分治区间 [$l=${l}, r=${r}$] (分治中点 mid=${mid}) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- 左半区 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">
            ◀ 左半区 [$l \\dots mid$]:
          </div>
          <div style="display: flex; gap: 6px;">
            ${arr.slice(l, mid + 1).map((val, idx) => {
              const actualIdx = l + idx;
              const isP1 = actualIdx === p1;
              return `
                <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${isP1 ? '#2563eb' : '#cbd5e1'}; background: ${isP1 ? '#dbeafe' : '#ffffff'}; font-size: 13px; font-weight: 800; color: #1e293b;">
                  ${val} ${isP1 ? '<span style="color:#2563eb;font-size:9px;">(p1)</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 右半区 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-bottom: 6px;">
            ▶ 右半区 [$mid+1 \\dots r$]:
          </div>
          <div style="display: flex; gap: 6px;">
            ${arr.slice(mid + 1, r + 1).map((val, idx) => {
              const actualIdx = mid + 1 + idx;
              const isP2 = actualIdx === p2;
              return `
                <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${isP2 ? '#d97706' : '#cbd5e1'}; background: ${isP2 ? '#fef3c7' : '#ffffff'}; font-size: 13px; font-weight: 800; color: #1e293b;">
                  ${val} ${isP2 ? '<span style="color:#d97706;font-size:9px;">(p2)</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 辅助合并数组 -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 4px;">
          📥 双指针有序合并输出 (help 辅助数组):
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #15803d;">
          [ ${help.join(', ') || '等待合并填入...'} ]
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 小和问题跨区累加沙盘 (Class 044)
// ----------------------------------------------------
export function renderSmallSumBoard(
  arr: number[],
  p1Val: number | null,
  p2Val: number | null,
  batchContribution: number,
  totalSmallSum: number,
  desc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>💎 归并求小和：思维逆转与跨区间批量贡献沙盘</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          当前累计小和 = ${totalSmallSum}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${arr.map(v => `
          <div style="padding: 8px 12px; border-radius: 6px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 14px; font-weight: 800; color: #1e293b;">
            ${v}
          </div>
        `).join('')}
      </div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
          ⚡ 跨区间贡献计算:
        </div>
        <div style="font-size: 12px; color: #1d4ed8;">
          ${desc}
        </div>
        ${batchContribution > 0 ? `
          <div style="font-size: 13px; font-weight: 800; color: #059669; margin-top: 4px;">
            + 本次批量产生小和贡献: ${batchContribution}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 荷兰国旗三向切分沙盘 (Class 045)
// ----------------------------------------------------
export function renderDutchFlagBoard(
  arr: number[],
  less: number,
  more: number,
  curIdx: number,
  pivot: number,
  phase: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🇳🇱 荷兰国旗三向切分 (小于区 / 等于区 / 大于区) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          基准值 pivot = ${pivot}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${arr.map((val, idx) => {
          let areaColor = '#cbd5e1';
          let bgColor = '#ffffff';
          let label = '';
          if (idx <= less) {
            areaColor = '#3b82f6';
            bgColor = '#eff6ff';
            label = '<';
          } else if (idx >= more) {
            areaColor = '#a855f7';
            bgColor = '#f3e8ff';
            label = '>';
          } else if (idx < curIdx) {
            areaColor = '#f59e0b';
            bgColor = '#fef3c7';
            label = '==';
          }

          const isCurrent = idx === curIdx;
          return `
            <div style="position: relative; padding: 10px 14px; border-radius: 8px; border: 2px solid ${isCurrent ? '#ef4444' : areaColor}; background: ${isCurrent ? '#fef2f2' : bgColor}; text-align: center; min-width: 48px;">
              <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${val}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${label}</div>
              ${isCurrent ? '<div style="position:absolute; bottom:-18px; left:0; right:0; font-size:10px; font-weight:800; color:#dc2626;">[i]</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; justify-content: space-around; font-size: 11px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 8px;">
        <span>🔵 小于区右界 less: <strong>${less}</strong></span>
        <span>🟡 等于区: <strong>[${less + 1}, ${more - 1}]</strong></span>
        <span>🟣 大于区左界 more: <strong>${more}</strong></span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 快速选择单侧剪枝沙盘 (Class 046)
// ----------------------------------------------------
export function renderQuickSelectBoard(
  arr: number[],
  targetK: number,
  equalRange: [number, number],
  hit: boolean,
  desc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 快速选择算法寻找第 K 小元素 (目标索引 index = ${targetK})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${hit ? '#ecfdf5' : '#fef3c7'}; color: ${hit ? '#047857' : '#b45309'}; font-weight: 700;">
          ${hit ? '✅ 命中等于区' : '✂️ 单侧剪枝递归'}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${arr.map((val, idx) => {
          const inEqual = idx >= equalRange[0] && idx <= equalRange[1];
          const isTarget = idx === targetK;
          return `
            <div style="padding: 8px 12px; border-radius: 8px; border: 2px solid ${isTarget ? '#ef4444' : inEqual ? '#f59e0b' : '#cbd5e1'}; background: ${isTarget ? '#fef2f2' : inEqual ? '#fef3c7' : '#ffffff'}; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${val}</div>
              <div style="font-size: 9px; color: ${isTarget ? '#dc2626' : inEqual ? '#b45309' : '#64748b'};">
                [${idx}] ${isTarget ? '🎯' : inEqual ? '==' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 6px 10px; border-radius: 6px;">
        💡 <strong>判定流程</strong>: ${desc}
      </div>
    </div>
  `;
}
