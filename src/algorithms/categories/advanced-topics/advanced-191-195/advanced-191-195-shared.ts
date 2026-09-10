/**
 * 左神算法通关课 Class 191 ~ 195 共享沙盘与渲染助手
 * 提供：边双缩点加边树沙盘、虚点优化降维沙盘、前缀优化传递链沙盘、2-SAT 对称蕴含图沙盘、2-SAT 高阶前缀约束沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced191Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 边双缩点与加边构造沙盘
// ----------------------------------------------------
export function renderEBCCConstructionBoard(
  bccs: number[],
  bccDegrees: Record<number, number>,
  leafBCCs: number[],
  addedEdges: { u: number; v: number }[],
  minAdded: number,
  stage: string = '叶子统计'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 边双缩点成树与叶子加边消除割边沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${bccs.map(b => {
          const isLeaf = leafBCCs.includes(b);
          const deg = bccDegrees[b] || 0;
          return `
            <div style="padding: 8px 12px; border-radius: 8px; border: 2px solid ${isLeaf ? '#ef4444' : '#3b82f6'}; background: ${isLeaf ? '#fef2f2' : '#f0fdf4'}; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: ${isLeaf ? '#b91c1c' : '#166534'};">
                BCC_${b} ${isLeaf ? '(叶子)' : ''}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                树上度数: ${deg}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">缩点树叶子节点数:</div>
          <div style="font-size: 14px; font-weight: 800; color: #b91c1c; margin-top: 2px;">
            ${leafBCCs.length} 个 (最少加边 = ceil(${leafBCCs.length} / 2) = ${minAdded})
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">贪心交叉添边方案:</div>
          <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 2px;">
            ${addedEdges.length > 0 ? addedEdges.map(e => `BCC_${e.u} &harr; BCC_${e.v}`).join(', ') : '等待计算...'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 虚点优化建图沙盘
// ----------------------------------------------------
export function renderVirtualNodesBoard(
  setA: number[],
  setB: number[],
  vMid: number,
  edgeCountOld: number,
  edgeCountNew: number,
  stage: string = '虚点中转'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 虚拟节点 (Virtual Node) 降维中转沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fdf2f8; color: #be185d; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; margin-bottom: 12px;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">源集合 Set A (${setA.length} 点):</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${setA.map(u => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 4px; font-size: 11px; font-weight: 700; color: #1d4ed8;">A${u}</span>`).join('')}
          </div>
        </div>

        <div style="text-align: center; background: #fef2f2; border: 2px dashed #ef4444; border-radius: 9999px; width: 56px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="font-size: 9px; color: #b91c1c; font-weight: 700;">虚点</span>
          <span style="font-size: 13px; font-weight: 900; color: #dc2626;">V_${vMid}</span>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 6px;">目标集合 Set B (${setB.length} 点):</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${setB.map(v => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #86efac; border-radius: 4px; font-size: 11px; font-weight: 700; color: #15803d;">B${v}</span>`).join('')}
          </div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: #64748b;">朴素建图边数: <strong style="color: #b91c1c;">${edgeCountOld} 条</strong></span>
        <span style="font-size: 11px; color: #64748b;">虚点优化后边数: <strong style="color: #059669;">${edgeCountNew} 条 (节省 ${Math.round((1 - edgeCountNew / edgeCountOld) * 100)}%)</strong></span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 前缀与后缀优化建图沙盘
// ----------------------------------------------------
export function renderPrefixSuffixBoard(
  originNodes: number[],
  prefixNodes: number[],
  stage: string = '前缀链传递'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⛓️ 前缀虚点链 (Prefix Chain) 传递推导沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        原节点连入对应前缀虚点，前缀虚点沿链自动向右单向传递蕴含关系：
      </div>

      <div style="display: flex; gap: 8px; align-items: center; overflow-x: auto; padding-bottom: 8px;">
        ${originNodes.map((u, i) => `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <div style="padding: 4px 10px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; font-size: 11px; font-weight: 800; color: #1e40af;">
              原点 X${u}
            </div>
            <div style="font-size: 12px; color: #64748b;">&darr;</div>
            <div style="padding: 4px 10px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 11px; font-weight: 800; color: #b91c1c;">
              前缀 Pre_${prefixNodes[i]}
            </div>
          </div>
          ${i < originNodes.length - 1 ? '<span style="font-size: 16px; color: #94a3b8; font-weight: 900;">&rarr;</span>' : ''}
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 2-SAT 算法基础沙盘
// ----------------------------------------------------
export interface TwoSatClauseView {
  u: number;
  uVal: boolean;
  v: number;
  vVal: boolean;
}

export function renderTwoSatBoard(
  vars: number[],
  clauses: TwoSatClauseView[],
  sccId: Record<number, number>,
  assignment: Record<number, boolean>,
  isSatisfiable: boolean,
  stage: string = 'SCC 求解'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚖️ 2-SAT 对称蕴含图与强连通判定沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${vars.map(i => {
          const sccTrue = sccId[2 * i];
          const sccFalse = sccId[2 * i + 1];
          const hasConflict = sccTrue && sccFalse && sccTrue === sccFalse;
          const val = assignment[i];
          return `
            <div style="background: ${hasConflict ? '#fef2f2' : '#f8fafc'}; border: 1px solid ${hasConflict ? '#ef4444' : '#cbd5e1'}; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: ${hasConflict ? '#b91c1c' : '#0f172a'};">
                变量 X${i}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                SCC[X]=${sccTrue ?? '?'}, SCC[~X]=${sccFalse ?? '?'}
              </div>
              <div style="font-size: 11px; font-weight: 800; color: ${val ? '#059669' : '#dc2626'}; margin-top: 4px;">
                ${hasConflict ? '⚠️ 真假矛盾' : (val !== undefined ? `赋值: ${val ? 'TRUE' : 'FALSE'}` : '待决')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">2-SAT 全局可满足性判定:</span>
        <span style="font-size: 13px; font-weight: 800; color: ${isSatisfiable ? '#059669' : '#dc2626'}; padding: 2px 10px; background: ${isSatisfiable ? '#ecfdf5' : '#fef2f2'}; border-radius: 6px;">
          ${isSatisfiable ? 'POSSIBLE (满足所有析取条件)' : 'IMPOSSIBLE (存在矛盾同分量)'}
        </span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 2-SAT 进阶高阶前缀约束沙盘
// ----------------------------------------------------
export function renderTwoSatAdvancedBoard(
  vars: number[],
  atMostOneSet: number[],
  assignment: Record<number, boolean>,
  stage: string = '进阶方案构造'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>👑 2-SAT 前缀优化“至多选一个”高阶方案沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f5f3ff; color: #7c3aed; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        集合 {${atMostOneSet.map(v => `X${v}`).join(', ')}} 受到“至多选一个”的二次排他约束：
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${vars.map(i => {
          const inSet = atMostOneSet.includes(i);
          const val = assignment[i];
          return `
            <div style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${inSet ? '#c4b5fd' : '#cbd5e1'}; background: ${inSet ? '#f5f3ff' : '#f8fafc'};">
              <span style="font-size: 11px; font-weight: 700; color: #475569;">X${i}:</span>
              <span style="font-size: 12px; font-weight: 800; color: ${val ? '#059669' : '#94a3b8'}; margin-left: 4px;">
                ${val ? 'TRUE' : 'FALSE'}
              </span>
              ${inSet ? '<span style="font-size: 9px; padding: 1px 4px; background: #ede9fe; color: #6d28d9; border-radius: 4px; margin-left: 4px;">排他组</span>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
