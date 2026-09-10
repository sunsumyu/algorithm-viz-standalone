/**
 * 左神算法通关课 034 ~ 038 经典链表高频与递归专题 共享沙盘与渲染助手
 * 提供：单双链表翻转沙盘、复杂链表插桩复制沙盘、有环无环相交判定沙盘、K个一组局部逆序沙盘、有序链表哨兵合并沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface LinkedList034Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 单链表翻转沙盘 (Class 034)
// ----------------------------------------------------
export function renderReverseListBoard(
  nodes: { val: number; next: number | null }[],
  pre: number | null,
  cur: number | null,
  nxt: number | null,
  stage: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔁 单链表三指针滑动反转沙盘 (pre / cur / next)</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; justify-content: center; overflow-x: auto; padding: 12px 0;">
        <div style="padding: 6px 10px; border-radius: 6px; border: 2px dashed ${pre === null ? '#3b82f6' : '#cbd5e1'}; background: ${pre === null ? '#eff6ff' : '#f8fafc'}; font-size: 11px; font-weight: 700; color: #64748b;">
          null ${pre === null ? '<br><span style="color:#2563eb;font-size:10px;">[pre]</span>' : ''}
        </div>
        ${nodes.map((n) => {
          const isCur = cur === n.val;
          const isPre = pre === n.val;
          const isNxt = nxt === n.val;
          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="position: relative; padding: 10px 14px; border-radius: 10px; border: 2px solid ${isCur ? '#ef4444' : isPre ? '#3b82f6' : isNxt ? '#10b981' : '#cbd5e1'}; background: ${isCur ? '#fef2f2' : isPre ? '#eff6ff' : '#ffffff'}; text-align: center; min-width: 50px;">
                <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${n.val}</div>
                <div style="position: absolute; bottom: -20px; left: 0; right: 0; font-size: 10px; font-weight: 700; color: ${isCur ? '#dc2626' : isPre ? '#2563eb' : isNxt ? '#059669' : '#94a3b8'};">
                  ${isPre ? '[pre]' : ''} ${isCur ? '[cur]' : ''} ${isNxt ? '[nxt]' : ''}
                </div>
              </div>
              <span style="font-size: 16px; font-weight: 800; color: ${n.next !== null ? '#475569' : '#94a3b8'};">➔</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 复杂链表深拷贝沙盘 (Class 035)
// ----------------------------------------------------
export function renderCopyRandomBoard(
  nodes: { val: number; isClone: boolean; randomVal: number | null }[],
  stage: string,
  desc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🧬 原地插桩 $O(1)$ 空间复杂链表深拷贝沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; justify-content: center; overflow-x: auto; padding: 14px 0;">
        ${nodes.map((n) => `
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="padding: 8px 12px; border-radius: 8px; border: 2px solid ${n.isClone ? '#a855f7' : '#3b82f6'}; background: ${n.isClone ? '#f3e8ff' : '#eff6ff'}; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: ${n.isClone ? '#7e22ce' : '#1d4ed8'};">
                ${n.val}${n.isClone ? "'" : ''}
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                rnd: ${n.randomVal !== null ? `${n.randomVal}${n.isClone ? "'" : ''}` : 'null'}
              </div>
            </div>
            <span style="color: #94a3b8; font-size: 14px;">➔</span>
          </div>
        `).join('')}
        <div style="font-size: 11px; color: #94a3b8;">null</div>
      </div>

      <div style="font-size: 11px; color: #64748b; background: #f8fafc; padding: 6px 10px; border-radius: 6px;">
        💡 <strong>操作要点</strong>: ${desc}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 链表相交终极判定沙盘 (Class 036)
// ----------------------------------------------------
export function renderIntersectionBoard(
  listA: number[],
  listB: number[],
  loopA: number | null,
  loopB: number | null,
  intersectNode: number | null,
  statusDesc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 单链表有环/无环与相交判定沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          ${intersectNode !== null ? `相交于节点 [${intersectNode}]` : '暂未相交 / 无相交点'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">链表 A (环入口: ${loopA !== null ? `Node ${loopA}` : '无环'}):</div>
          <div style="font-size: 12px; color: #334155;">[ ${listA.join(' ➔ ')} ]</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-bottom: 4px;">链表 B (环入口: ${loopB !== null ? `Node ${loopB}` : '无环'}):</div>
          <div style="font-size: 12px; color: #334155;">[ ${listB.join(' ➔ ')} ]</div>
        </div>
      </div>

      <div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 6px 10px; border-radius: 6px;">
        🔍 <strong>判定结论</strong>: ${statusDesc}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. K 个一组翻转链表沙盘 (Class 037)
// ----------------------------------------------------
export function renderReverseKGroupBoard(
  groups: { id: number; nodes: number[]; isReversed: boolean; isCurrent: boolean }[],
  k: number,
  phase: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔄 K 个一组局部逆序翻转沙盘 (K=${k})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${phase}
        </span>
      </div>

      <div style="display: flex; gap: 10px; align-items: center; justify-content: center; overflow-x: auto; padding: 10px 0;">
        ${groups.map((g) => `
          <div style="padding: 8px 12px; border-radius: 10px; border: 2px dashed ${g.isCurrent ? '#f59e0b' : g.isReversed ? '#10b981' : '#cbd5e1'}; background: ${g.isCurrent ? '#fef3c7' : g.isReversed ? '#ecfdf5' : '#f8fafc'}; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: ${g.isCurrent ? '#b45309' : g.isReversed ? '#047857' : '#64748b'}; margin-bottom: 4px;">
              组 ${g.id} ${g.isReversed ? '(已翻转)' : g.isCurrent ? '(翻转中)' : '(待处理)'}
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
              ${g.nodes.map((val) => `
                <div style="padding: 4px 8px; border-radius: 4px; background: #ffffff; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #1e293b;">
                  ${val}
                </div>
              `).join(' ➔ ')}
            </div>
          </div>
        `).join('<span style="color:#94a3b8;font-weight:800;">➔</span>')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 有序链表哨兵合并沙盘 (Class 038)
// ----------------------------------------------------
export function renderMergeSortedBoard(
  l1: number[],
  l2: number[],
  merged: number[],
  curL1: number | null,
  curL2: number | null,
  phase: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔀 虚拟哨兵 Dummy 双指针贪心有序链表合并沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${phase}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">链表 1 待合并项:</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${l1.map((v) => `
              <div style="padding: 3px 6px; border-radius: 4px; font-size: 11px; border: 1px solid ${v === curL1 ? '#2563eb' : '#cbd5e1'}; background: ${v === curL1 ? '#dbeafe' : '#ffffff'}; font-weight: ${v === curL1 ? '800' : '500'};">
                ${v}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-bottom: 4px;">链表 2 待合并项:</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${l2.map((v) => `
              <div style="padding: 3px 6px; border-radius: 4px; font-size: 11px; border: 1px solid ${v === curL2 ? '#d97706' : '#cbd5e1'}; background: ${v === curL2 ? '#fef3c7' : '#ffffff'}; font-weight: ${v === curL2 ? '800' : '500'};">
                ${v}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 8px 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #065f46; margin-bottom: 4px;">
          🎯 哨兵 Dummy 引导的已合并升序链表:
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #047857;">
          Dummy ➔ ${merged.join(' ➔ ') || 'null'}
        </div>
      </div>
    </div>
  `;
}
