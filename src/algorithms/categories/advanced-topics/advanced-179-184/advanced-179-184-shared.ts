/**
 * 左神算法通关课 Class 179 ~ 184 共享沙盘与渲染助手
 * 提供：点分治重心树沙盘、点分树树高倍增沙盘、线段树分治时间轴沙盘、可撤销并查集历史栈沙盘、CDQ 三维偏序归并沙盘、整体二分分流树沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced179Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 点分治 (Centroid Decomposition) 沙盘
// ----------------------------------------------------
export function renderCentroidBoard(
  nodes: number[],
  centroid: number,
  visitedCentroids: number[],
  validPaths: { u: number; v: number; dist: number }[],
  stage: string = '寻找重心'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 树上点分治 (Centroid Decomposition) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0e7ff; color: #3730a3; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${nodes.map(u => {
          const isCentroid = u === centroid;
          const isVisited = visitedCentroids.includes(u);
          return `
            <div style="border: 2px solid ${isCentroid ? '#ef4444' : (isVisited ? '#64748b' : '#3b82f6')}; background: ${isCentroid ? '#fef2f2' : (isVisited ? '#f1f5f9' : '#eff6ff')}; border-radius: 9999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${isCentroid ? '#b91c1c' : '#1e293b'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              ${u}
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">当前分治重心:</div>
          <div style="font-size: 13px; font-weight: 800; color: #b91c1c; margin-top: 2px;">
            ${centroid !== -1 ? `节点 ${centroid}` : '未指定'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">已分治完毕重心数:</div>
          <div style="font-size: 13px; font-weight: 800; color: #4338ca; margin-top: 2px;">
            ${visitedCentroids.length} 个
          </div>
        </div>
      </div>

      ${validPaths.length > 0 ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 4px;">当前已统计跨重心目标路径:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${validPaths.map(p => `
              <span style="padding: 3px 8px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; font-size: 11px; font-weight: 800; color: #047857;">
                (${p.u} &harr; ${p.v}, 距离=${p.dist})
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 2. 动态点分治 / 点分树沙盘
// ----------------------------------------------------
export function renderDynamicCentroidBoard(
  nodes: number[],
  ctParent: Record<number, number>,
  activeJumpPath: number[],
  stage: string = '点分树上跳'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 动态点分治 (点分树 / Centroid Tree) 拓扑沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #dcfce7; color: #15803d; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${nodes.map(u => {
          const p = ctParent[u];
          const inJump = activeJumpPath.includes(u);
          return `
            <div style="background: ${inJump ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${inJump ? '#86efac' : '#cbd5e1'}; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: ${inJump ? '#166534' : '#1e293b'};">
                点分树节点 ${u}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                父节点: ${p ? `CT_${p}` : '根节点 (Root)'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 10px; color: #166534;">
        <strong>当前上跳容斥路径:</strong> ${activeJumpPath.length > 0 ? activeJumpPath.map(u => `Node_${u}`).join(' &rarr; ') : '无'}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 线段树分治 (Segment Tree Divide) 沙盘
// ----------------------------------------------------
export interface TimeEdgeView {
  u: number;
  v: number;
  l: number;
  r: number;
}

export function renderSegmentTreeDivideBoard(
  totalTime: number,
  curTime: number,
  edges: TimeEdgeView[],
  activeEdges: { u: number; v: number }[],
  isBipartite: boolean,
  stage: string = '时间轴遍历'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⏱️ 线段树分治时间轴沙盘 (总时刻: 1..${totalTime})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          当前时刻: T = ${curTime} | ${stage}
        </span>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">各边存在生命周期区间:</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; margin-bottom: 12px;">
        ${edges.map(e => {
          const isAlive = curTime >= e.l && curTime <= e.r;
          return `
            <div style="padding: 4px 8px; border-radius: 6px; font-size: 11px; border: 1px solid ${isAlive ? '#86efac' : '#cbd5e1'}; background: ${isAlive ? '#f0fdf4' : '#f8fafc'}; color: ${isAlive ? '#166534' : '#64748b'}; font-weight: ${isAlive ? '700' : 'normal'};">
              (${e.u} &harr; ${e.v}) 活跃时间: [${e.l}, ${e.r}] ${isAlive ? '⚡活跃' : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前时刻二分图判定结果:</span>
        <span style="font-size: 14px; font-weight: 800; color: ${isBipartite ? '#059669' : '#dc2626'}; padding: 2px 10px; background: ${isBipartite ? '#ecfdf5' : '#fef2f2'}; border-radius: 6px;">
          ${isBipartite ? 'YES (无奇环，为二分图)' : 'NO (存在奇环，非二分图)'}
        </span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 可撤销并查集 (Rollback DSU) 沙盘
// ----------------------------------------------------
export interface RollbackHistoryRecord {
  u: number;
  v: number;
  addRank: number;
}

export function renderRollbackDSUBoard(
  nodes: number[],
  parent: number[],
  rank: number[],
  history: RollbackHistoryRecord[],
  stage: string = '操作中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⏪ 可撤销并查集 (Rollback DSU) 按秩合并与历史栈沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0284c7; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">当前各点父节点与秩 (Parent / Rank):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${nodes.map(u => `
              <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px;">
                <strong>V${u}</strong>: fa=${parent[u]}, rk=${rank[u]}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 6px;">历史操作栈 (History Stack, 深度 ${history.length}):</div>
          <div style="max-height: 80px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 4px;">
            ${history.map((h, i) => `
              <div style="font-size: 10px; padding: 2px 6px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; color: #92400e;">
                #${i + 1}: union(V${h.u} &rarr; V${h.v}), addRank=${h.addRank}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. CDQ 分治三维偏序沙盘
// ----------------------------------------------------
export interface CDQPointView {
  id: number;
  a: number;
  b: number;
  c: number;
  ans: number;
}

export function renderCDQDivideBoard(
  points: CDQPointView[],
  l: number,
  r: number,
  mid: number,
  stage: string = '归并计算贡献'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 CDQ 分治 (三维偏序 陌上花开) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f3e8ff; color: #7e22ce; font-weight: 700;">
          分治区间 [${l}, ${r}] (mid=${mid}) | ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        第一维 a 全局有序；左半区 [${l}, ${mid}] 与右半区 [${mid + 1}, ${r}] 归并统计：左区点插入树状数组维护维度 c，右区点查询偏序贡献。
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px;">
        ${points.map(p => {
          const isLeft = p.id >= l && p.id <= mid;
          const isRight = p.id > mid && p.id <= r;
          return `
            <div style="background: ${isLeft ? '#f5f3ff' : (isRight ? '#eff6ff' : '#f8fafc')}; border: 1px solid ${isLeft ? '#ddd6fe' : (isRight ? '#bfdbfe' : '#e2e8f0')}; border-radius: 6px; padding: 6px; text-align: center;">
              <div style="font-size: 10px; color: #64748b;">P${p.id} (${isLeft ? '左区' : (isRight ? '右区' : '外部')})</div>
              <div style="font-size: 11px; font-weight: 700; color: #1e293b; margin-top: 2px;">
                (${p.a}, ${p.b}, ${p.c})
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #7c3aed; margin-top: 2px;">
                偏序 ans: ${p.ans}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 整体二分 (Parallel Binary Search) 沙盘
// ----------------------------------------------------
export interface ParallelQueryView {
  id: number;
  target: number;
  currSum: number;
  status: 'pending' | 'left' | 'right' | 'done';
}

export function renderParallelBSBoard(
  l: number,
  r: number,
  mid: number,
  queries: ParallelQueryView[],
  stage: string = '分流判断'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚖️ 整体二分 (Parallel Binary Search) 分流沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef2f2; color: #b91c1c; font-weight: 700;">
          答案值域区间 [${l}, ${r}] (mid=${mid}) | ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        在中点 mid 处批量执行前 mid 个操作，检查所有当前待决询问是否达到目标阈值：
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px;">
        ${queries.map(q => `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #1e293b; display: flex; justify-content: space-between;">
              <span>询问 #${q.id}</span>
              <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; ${
                q.status === 'left' ? 'background: #ecfdf5; color: #047857;' : 'background: #fef3c7; color: #b45309;'
              }">
                ${q.status === 'left' ? '满足 &rarr; 归入左区' : '未达标 &rarr; 归入右区'}
              </span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              当前累积: <strong>${q.currSum}</strong> / 目标: ${q.target}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
