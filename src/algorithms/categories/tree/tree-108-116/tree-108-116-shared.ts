/**
 * 左神算法通关课 Class 108 ~ 116 高阶区间数据结构专题共享沙盘组件
 * 包含树状数组二叉索引可视化、线段树分治区间展开展板与扫描线平面投影
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Tree108Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  activeNode?: number;
  highlightRange?: [number, number];
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

/**
 * 渲染树状数组 (Fenwick Tree / BIT) 树形层级与覆盖区间
 */
export function renderFenwickTreeVisual(
  nums: number[],
  tree: number[],
  activeIdx: number = -1,
  jumpPath: number[] = [],
  operationType: 'add' | 'query' | 'idle' = 'idle'
): string {
  const n = nums.length;
  return `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 树状数组二叉索引结构 (1-based 下标 1 ~ ${n})</span>
        <span style="font-size: 11px; color: #64748b;">lowbit(x) = x & (-x)</span>
      </div>

      <!-- 原始数据数组 -->
      <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">原始数组 A[1..${n}]</div>
        <div style="display: flex; gap: 6px; overflow-x: auto;">
          ${nums.map((val, idx) => {
            const oneBased = idx + 1;
            const isActive = oneBased === activeIdx;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 38px;">
                <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">A[${oneBased}]</span>
                <div style="width: 38px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: ${isActive ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isActive ? '#f59e0b' : '#cbd5e1'}; border-radius: 6px; color: #1e293b;">
                  ${val}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 树状数组节点与覆盖范围 -->
      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px;">
        <div style="font-size: 11px; color: #475569; margin-bottom: 8px; font-weight: 600;">
          树状数组节点 Tree[i] (管理区间 [i - lowbit(i) + 1 .. i])
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
          ${Array.from({ length: n }).map((_, idx) => {
            const i = idx + 1;
            const lowbit = i & (-i);
            const coverStart = i - lowbit + 1;
            const coverEnd = i;
            const isCur = i === activeIdx;
            const isPath = jumpPath.includes(i);

            let bg = '#ffffff';
            let border = '#cbd5e1';
            let color = '#334155';
            let transform = 'none';
            let shadow = 'none';

            if (isCur) {
              bg = operationType === 'add' ? '#dcfce7' : '#e0e7ff';
              border = operationType === 'add' ? '#22c55e' : '#6366f1';
              color = operationType === 'add' ? '#15803d' : '#3730a3';
              transform = 'scale(1.08)';
              shadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            } else if (isPath) {
              bg = '#fef3c7';
              border = '#f59e0b';
              color = '#b45309';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 58px;">
                <span style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 2px;">Tree[${i}]</span>
                <div style="width: 58px; height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; color: ${color}; border-radius: 8px; font-family: monospace; font-size: 13px; font-weight: 700; transform: ${transform}; box-shadow: ${shadow}; transition: all 0.2s;">
                  <span>${tree[i] ?? 0}</span>
                </div>
                <span style="font-size: 9px; color: #94a3b8; margin-top: 4px;">[${coverStart}..${coverEnd}]</span>
                <span style="font-size: 9px; color: #6366f1; font-family: monospace;">lb=${lowbit}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染线段树分治节点区间块
 */
export function renderSegmentTreeVisual(
  nodes: { id: number; l: number; r: number; val: number; lazy?: number }[],
  activeId: number = -1,
  queryL: number = -1,
  queryR: number = -1
): string {
  return `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 线段树完全二叉树节点层级 (共 ${nodes.length} 个活跃节点)</span>
        ${queryL >= 0 ? `<span style="background: #e0e7ff; color: #4338ca; font-size: 11px; padding: 2px 8px; border-radius: 999px;">查询/修改目标区间 [${queryL}..${queryR}]</span>` : ''}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;">
        ${nodes.map((node) => {
          const isCur = node.id === activeId;
          const inQuery = queryL >= 0 && node.l >= queryL && node.r <= queryR;

          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#1e293b';
          let shadow = 'none';

          if (isCur) {
            bg = '#e0e7ff';
            border = '#6366f1';
            color = '#3730a3';
            shadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
          } else if (inQuery) {
            bg = '#dcfce7';
            border = '#22c55e';
            color = '#15803d';
          }

          return `
            <div style="background: ${bg}; border: 2px solid ${border}; border-radius: 10px; padding: 8px 10px; box-shadow: ${shadow}; transition: all 0.2s;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">
                <span>#${node.id}</span>
                <span style="color: ${color};">[${node.l}..${node.r}]</span>
              </div>
              <div style="font-size: 16px; font-weight: 700; color: ${color}; text-align: center; font-family: monospace;">
                ${node.val}
              </div>
              ${node.lazy !== undefined && node.lazy !== 0 ? `
                <div style="font-size: 10px; color: #b45309; background: #fef3c7; border-radius: 4px; padding: 2px 4px; margin-top: 4px; text-align: center;">
                  lazy: +${node.lazy}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
