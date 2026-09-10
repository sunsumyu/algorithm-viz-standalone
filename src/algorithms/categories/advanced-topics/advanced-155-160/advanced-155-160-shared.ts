/**
 * 左神算法通关课 Class 155 ~ 160 共享沙盘与渲染助手
 * 提供：LCT 实虚链剖分图、主席树版本共享图、可持久化 Treap COW 历史图、DSU on Tree 重儿子调度图、莫队分块移动双指针图、FFT 蝶形运算信号流图
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced155Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. LCT 辅助树与实虚链渲染
// ----------------------------------------------------
export interface LCTEdgeView {
  u: number;
  v: number;
  isPreferred: boolean; // 是否为实边
}

export function renderLCTBoard(
  nodes: number[],
  edges: LCTEdgeView[],
  activeNode: number = -1,
  accessPath: number[] = [],
  actionName: string = 'Normal'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 Link-Cut Tree (LCT) 实虚链剖分拓扑沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0e7ff; color: #3730a3; font-weight: 700;">
          ${actionName}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${nodes.map(u => {
          const isAct = u === activeNode;
          const inPath = accessPath.includes(u);
          return `
            <div style="border: 2px solid ${isAct ? '#6366f1' : (inPath ? '#3b82f6' : '#cbd5e1')}; background: ${isAct ? '#eef2ff' : (inPath ? '#eff6ff' : '#f8fafc')}; border-radius: 9999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              ${u}
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px;">原树拓扑边集合 (实线为实链 Preferred Edge，虚线为轻边 Light Edge):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${edges.map(e => `
            <span style="font-size: 11px; padding: 3px 8px; border-radius: 6px; border: 1px ${e.isPreferred ? 'solid #4338ca' : 'dashed #94a3b8'}; background: ${e.isPreferred ? '#e0e7ff' : '#f8fafc'}; color: ${e.isPreferred ? '#312e81' : '#64748b'}; font-weight: ${e.isPreferred ? '700' : 'normal'};">
              (${e.u} <-> ${e.v}) ${e.isPreferred ? '【实边】' : '【虚边】'}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569; margin-top: 10px;">
        💡 <b>Access(x) 核心精义</b>：沿 <code>x</code> 向上跳至根，将沿途所有父子连接强制替换为实边，旁支自动变为虚边，使根到 <code>x</code> 聚合进同一棵 Splay 辅助树中！
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 主席树 / 可持久化线段树渲染
// ----------------------------------------------------
export interface PersistSegVersionView {
  version: number;
  rootIndex: number;
  valInserted: number;
}

export function renderPersistentSegTreeBoard(
  versions: PersistSegVersionView[],
  activeVersion: number = -1,
  kthResult?: { l: number; r: number; k: number; ans: number }
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📚 主席树 (可持久化线段树) 历史版本链与节点复用沙盘</span>
        <span style="font-size: 11px; color: #64748b;">累计版本数: ${versions.length}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${versions.map(v => {
          const isAct = v.version === activeVersion;
          return `
            <div style="border: 2px solid ${isAct ? '#6366f1' : '#e2e8f0'}; background: ${isAct ? '#eef2ff' : '#f8fafc'}; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b;">Version ${v.version}</div>
              <div style="font-size: 11px; color: #4338ca; margin-top: 2px;">插入值: <b>${v.valInserted}</b></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">根节点编号: node#${v.rootIndex}</div>
            </div>
          `;
        }).join('')}
      </div>

      ${kthResult ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px; font-size: 12px; color: #166534;">
          🎯 <b>静态区间第 K 小查询成功</b>：查询区间 [${kthResult.l}, ${kthResult.r}] 中第 ${kthResult.k} 小元素为 <b>${kthResult.ans}</b>。<br/>
          计算方式：版本 root[${kthResult.r}] 与版本 root[${kthResult.l - 1}] 前缀和差分在值域线段树上二分检索。
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 3. 可持久化 Treap 渲染
// ----------------------------------------------------
export function renderPersistentTreapBoard(
  versionCount: number,
  curVersion: number,
  clonedNodes: number[],
  actionName: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎋 可持久化平衡树 (Persistent Treap) COW 写时复制沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${actionName}
        </span>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
        ${Array.from({ length: versionCount }).map((_, i) => `
          <div style="border: 2px solid ${i === curVersion ? '#6366f1' : '#cbd5e1'}; background: ${i === curVersion ? '#eef2ff' : '#f8fafc'}; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #334155;">
            版本 Ver ${i} ${i === curVersion ? ' (当前)' : ''}
          </div>
        `).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>写时复制机制 (Copy-on-Write)</b>：每次 <code>split</code> 与 <code>merge</code> 沿途仅复制途经的 ${clonedNodes.length} 个节点（克隆新 ID: ${clonedNodes.join(', ')}），历史版本指针完全冻结，绝不发生回写污染。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. DSU on Tree 渲染
// ----------------------------------------------------
export interface DSUColorBucketView {
  color: number;
  count: number;
}

export function renderDSUOnTreeBoard(
  curNode: number,
  heavySon: number,
  buckets: DSUColorBucketView[],
  ansMap: Record<number, number>
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 树上启发式合并 (DSU on Tree) 调度与全局颜色桶沙盘</span>
        <span style="font-size: 12px; font-weight: 700; color: #4338ca;">当前递归节点: ${curNode} (重儿子: ${heavySon > 0 ? heavySon : '无'})</span>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">当前全局颜色计数桶:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${buckets.map(b => `
            <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 6px; padding: 4px 8px; font-size: 11px;">
              颜色 ${b.color}: <b style="color: #4338ca;">${b.count}</b> 次
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>启发式保留精髓</b>：先处理轻儿子并清空；最后处理重儿子并<b>直接保留其子树全部颜色计数</b>，随后仅需暴力并入轻儿子子树，均摊复杂度达严格 $O(N \log N)$。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 莫队算法渲染
// ----------------------------------------------------
export function renderMoBoard(
  arr: number[],
  blockSize: number,
  curL: number,
  curR: number,
  targetL: number,
  targetR: number,
  curAns: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔍 莫队算法离线分块双指针移动沙盘 (块长 B = ${blockSize})</span>
        <span style="font-size: 12px; font-weight: 700; color: #059669;">当前区间维护答案: ${curAns}</span>
      </div>

      <div style="overflow-x: auto; margin-bottom: 12px;">
        <div style="display: flex; gap: 4px; min-width: 450px;">
          ${arr.map((val, idx) => {
            const inCur = idx >= curL && idx <= curR;
            const inTarget = idx >= targetL && idx <= targetR;
            const blockIdx = Math.floor(idx / blockSize);
            return `
              <div style="flex: 1; border: 2px solid ${inCur ? '#6366f1' : '#cbd5e1'}; background: ${inCur ? '#eef2ff' : (inTarget ? '#fef3c7' : '#ffffff')}; border-radius: 6px; padding: 6px 2px; text-align: center;">
                <div style="font-size: 9px; color: #94a3b8;">块${blockIdx}</div>
                <div style="font-size: 14px; font-weight: 800; color: ${inCur ? '#4338ca' : '#1e293b'};">${val}</div>
                <div style="font-size: 9px; color: #64748b;">[${idx}]</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display: flex; gap: 12px; font-size: 11px; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px;">
        <span>当前双指针: <b>L=${curL}, R=${curR}</b></span>
        <span>目标询问区间: <b>[${targetL}, ${targetR}]</b></span>
        <span>移动策略: 奇偶排序平滑折返，全局移动步数 $O(N \\sqrt{Q})$</span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. FFT 快速傅里叶变换渲染
// ----------------------------------------------------
export function renderFFTBoard(
  polyA: number[],
  polyB: number[],
  convResult?: number[],
  stage: string = 'Ready'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚡ 快速傅里叶变换 (FFT) 多项式卷积点值流沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f0fdf4; color: #166534; font-weight: 700;">
          阶段: ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; background: #f8fafc;">
          <div style="font-size: 11px; font-weight: 700; color: #4338ca;">多项式 A(x) 系数向量:</div>
          <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">
            [${polyA.join(', ')}]
          </div>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; background: #f8fafc;">
          <div style="font-size: 11px; font-weight: 700; color: #059669;">多项式 B(x) 系数向量:</div>
          <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">
            [${polyB.join(', ')}]
          </div>
        </div>
      </div>

      ${convResult && convResult.length > 0 ? `
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #3730a3;">🎉 FFT 卷积相乘结果 C(x) = A(x) * B(x):</div>
          <div style="font-family: monospace; font-size: 15px; font-weight: 800; color: #1e1b4b; margin-top: 4px;">
            [${convResult.join(', ')}]
          </div>
          <div style="font-size: 11px; color: #6366f1; margin-top: 4px;">
            DFT 点值相乘 + IDFT 逆变换插值在 $O(N \\log N)$ 内达成，彻底击碎 $O(N^2)$ 暴力瓶颈！
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
