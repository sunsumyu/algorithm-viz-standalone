/**
 * 左神算法通关课 Class 149 ~ 154 有序表全家桶共享沙盘与渲染助手
 * 提供：SB 树 Size 状态图、红黑树着色图、跳表多层链表图、Splay 伸展双旋图、替罪羊树重构沙盘、FHQ-Treap 分裂合并沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced149Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. SB 树渲染
// ----------------------------------------------------
export interface SBNodeView {
  key: number;
  size: number;
  left?: SBNodeView;
  right?: SBNodeView;
}

export function renderSBTreeBoard(
  root: SBNodeView | null,
  activeKey: number = -1,
  maintainType: string = 'None'
): string {
  const renderSubtree = (node?: SBNodeView): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">null</span>';
    const isAct = node.key === activeKey;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 2px solid ${isAct ? '#6366f1' : '#3b82f6'}; background: ${isAct ? '#eef2ff' : '#ffffff'}; border-radius: 9999px; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <span>${node.key}</span>
          <span style="font-size: 9px; color: #64748b;">sz=${node.size}</span>
        </div>
        ${(node.left || node.right) ? `
          <div style="display: flex; gap: 12px; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 6px;">
            ${renderSubtree(node.left)}
            ${renderSubtree(node.right)}
          </div>
        ` : ''}
      </div>
    `;
  };

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 Size Balanced Tree (SB 树) 沙盘 (节点格式: 键值 / 子树大小 size)</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${maintainType !== 'None' ? '#fef3c7' : '#f0fdf4'}; color: ${maintainType !== 'None' ? '#b45309' : '#15803d'}; font-weight: 700;">
          ${maintainType !== 'None' ? `⚖️ 触发 Maintain 维护: ${maintainType}` : '✅ Size 严格平衡'}
        </span>
      </div>

      <div style="display: flex; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${root ? renderSubtree(root) : '<span style="color: #94a3b8; font-size: 13px;">空树</span>'}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>SB 树平衡准则</b>：<code>size(t.left) &ge; max(size(t.right.left), size(t.right.right))</code>，仅在插入时 maintain，删除无需旋转调整！
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 红黑树渲染
// ----------------------------------------------------
export interface RBNodeView {
  key: number;
  color: 'RED' | 'BLACK';
  left?: RBNodeView;
  right?: RBNodeView;
}

export function renderRBTreeBoard(
  root: RBNodeView | null,
  activeKey: number = -1,
  actionType: string = 'Normal'
): string {
  const renderSubtree = (node?: RBNodeView): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">NIL</span>';
    const isRed = node.color === 'RED';
    const isAct = node.key === activeKey;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 3px solid ${isAct ? '#6366f1' : (isRed ? '#dc2626' : '#1e293b')}; background: ${isRed ? '#fee2e2' : '#1e293b'}; color: ${isRed ? '#b91c1c' : '#ffffff'}; border-radius: 9999px; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <span>${node.key}</span>
        </div>
        ${(node.left || node.right) ? `
          <div style="display: flex; gap: 12px; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 6px;">
            ${renderSubtree(node.left)}
            ${renderSubtree(node.right)}
          </div>
        ` : ''}
      </div>
    `;
  };

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔴⚫ 红黑树 (Red-Black Tree) 着色与自平衡沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f1f5f9; color: #334155; font-weight: 700;">
          ${actionType}
        </span>
      </div>

      <div style="display: flex; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${root ? renderSubtree(root) : '<span style="color: #94a3b8; font-size: 13px;">空树</span>'}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>平衡机制</b>：新插入点默认置红。若父节点为红违反公理4，根据叔叔节点颜色区分：叔叔为红则变色上推；叔叔为黑则通过左旋/右旋完成结构调整。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 跳表渲染
// ----------------------------------------------------
export interface SkipListNodeView {
  val: number;
  levels: number;
}

export function renderSkipListBoard(
  nodes: SkipListNodeView[],
  maxLevel: number = 4,
  activeVal: number = -1
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📑 跳表 (SkipList) 多层链表索引沙盘 (最高支持 ${maxLevel} 层)</span>
        <span style="font-size: 11px; color: #64748b;">节点数: ${nodes.length}</span>
      </div>

      <div style="overflow-x: auto; padding-bottom: 8px;">
        <div style="display: flex; flex-direction: column; gap: 6px; min-width: 500px;">
          ${Array.from({ length: maxLevel }).map((_, lIdx) => {
            const level = maxLevel - 1 - lIdx;
            return `
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 55px; font-size: 11px; font-weight: 700; color: #6366f1;">Level ${level}:</div>
                <div style="display: flex; align-items: center; flex: 1;">
                  <span style="padding: 2px 6px; background: #e2e8f0; border-radius: 4px; font-size: 11px; font-weight: 700;">HEAD</span>
                  ${nodes.map(n => {
                    const hasLevel = n.levels > level;
                    const isAct = n.val === activeVal;
                    return `
                      <span style="color: ${hasLevel ? '#3b82f6' : '#e2e8f0'}; font-weight: 700; margin: 0 6px;">---&gt;</span>
                      <div style="padding: 2px 8px; border-radius: 4px; border: 1px solid ${hasLevel ? (isAct ? '#6366f1' : '#cbd5e1') : '#f1f5f9'}; background: ${hasLevel ? (isAct ? '#eef2ff' : '#ffffff') : '#f8fafc'}; color: ${hasLevel ? (isAct ? '#4338ca' : '#1e293b') : '#cbd5e1'}; font-size: 11px; font-weight: ${hasLevel ? '700' : 'normal'};">
                        ${n.val}
                      </div>
                    `;
                  }).join('')}
                  <span style="color: #94a3b8; font-size: 11px; margin-left: 6px;">---&gt; NIL</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569; margin-top: 8px;">
        💡 <b>多层跳跃优势</b>：从最高层向下推进，若右侧值小于目标则向右跃迁，否则下降一层。期望查找复杂度严格 O(log N)。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. Splay 树渲染
// ----------------------------------------------------
export interface SplayNodeView {
  val: number;
  left?: SplayNodeView;
  right?: SplayNodeView;
}

export function renderSplayBoard(
  root: SplayNodeView | null,
  splayedVal: number = -1,
  rotationName: string = 'None'
): string {
  const renderSubtree = (node?: SplayNodeView): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">null</span>';
    const isSplayed = node.val === splayedVal;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 2px solid ${isSplayed ? '#8b5cf6' : '#94a3b8'}; background: ${isSplayed ? '#f5f3ff' : '#ffffff'}; border-radius: 9999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${isSplayed ? '#6d28d9' : '#1e293b'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          ${node.val}
        </div>
        ${(node.left || node.right) ? `
          <div style="display: flex; gap: 12px; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 6px;">
            ${renderSubtree(node.left)}
            ${renderSubtree(node.right)}
          </div>
        ` : ''}
      </div>
    `;
  };

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 伸展树 (Splay Tree) 双旋至根沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${rotationName !== 'None' ? '#f5f3ff' : '#f0fdf4'}; color: ${rotationName !== 'None' ? '#6d28d9' : '#15803d'}; font-weight: 700;">
          ${rotationName !== 'None' ? `🔄 ${rotationName}` : '✅ 处于目标状态'}
        </span>
      </div>

      <div style="display: flex; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${root ? renderSubtree(root) : '<span style="color: #94a3b8; font-size: 13px;">空树</span>'}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>双旋精髓</b>：Zig-Zig 一字型双旋时<b>必须先旋父节点再旋自身</b>，可将单链长路径折半压缩，均摊势能单次操作严格 O(log N)。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 替罪羊树渲染
// ----------------------------------------------------
export interface ScapegoatNodeView {
  val: number;
  size: number;
  left?: ScapegoatNodeView;
  right?: ScapegoatNodeView;
}

export function renderScapegoatBoard(
  root: ScapegoatNodeView | null,
  flattenBuffer?: number[],
  isRebuilding: boolean = false
): string {
  const renderSubtree = (node?: ScapegoatNodeView): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">null</span>';
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 2px solid ${isRebuilding ? '#f97316' : '#10b981'}; background: ${isRebuilding ? '#fff7ed' : '#ffffff'}; border-radius: 9999px; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #1e293b;">
          <span>${node.val}</span>
          <span style="font-size: 9px; color: #64748b;">sz=${node.size}</span>
        </div>
        ${(node.left || node.right) ? `
          <div style="display: flex; gap: 12px; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 6px;">
            ${renderSubtree(node.left)}
            ${renderSubtree(node.right)}
          </div>
        ` : ''}
      </div>
    `;
  };

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🐐 替罪羊树 (Scapegoat Tree) 暴力重构沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${isRebuilding ? '#ffedd5' : '#ecfdf5'}; color: ${isRebuilding ? '#c2410c' : '#047857'}; font-weight: 700;">
          ${isRebuilding ? '💥 触发拍扁重建 (Rebuilding)' : '✅ 平衡因子正常'}
        </span>
      </div>

      <div style="display: flex; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${root ? renderSubtree(root) : '<span style="color: #94a3b8; font-size: 13px;">空树</span>'}
      </div>

      ${flattenBuffer && flattenBuffer.length > 0 ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px;">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">拍扁中序序列 (Flatten Buffer):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${flattenBuffer.map(v => `<span style="padding: 2px 8px; background: #fef3c7; border-radius: 4px; font-size: 12px; font-weight: 700; color: #b45309;">${v}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 6. FHQ-Treap 渲染
// ----------------------------------------------------
export interface FHQNodeView {
  val: number;
  pri: number;
  left?: FHQNodeView;
  right?: FHQNodeView;
}

export function renderFHQTreapBoard(
  rootL: FHQNodeView | null,
  rootR: FHQNodeView | null,
  mergedRoot?: FHQNodeView | null,
  splitKey?: number
): string {
  const renderSubtree = (node?: FHQNodeView | null, color: string = '#6366f1'): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">null</span>';
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 2px solid ${color}; background: #ffffff; border-radius: 8px; width: 48px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #1e293b;">
          <span>v=${node.val}</span>
          <span style="font-size: 9px; color: #64748b;">p=${node.pri}</span>
        </div>
        ${(node.left || node.right) ? `
          <div style="display: flex; gap: 8px; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            ${renderSubtree(node.left, color)}
            ${renderSubtree(node.right, color)}
          </div>
        ` : ''}
      </div>
    `;
  };

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎋 非旋 Treap (FHQ-Treap) 分裂与合并沙盘</span>
        <span style="font-size: 11px; color: #64748b;">${splitKey !== undefined ? `按值 key=${splitKey} 分裂` : '堆序合并'}</span>
      </div>

      ${mergedRoot !== undefined ? `
        <div style="text-align: center; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #4338ca; margin-bottom: 4px;">合并后整体 Treap:</div>
          <div style="display: flex; justify-content: center; overflow-x: auto;">
            ${renderSubtree(mergedRoot, '#4338ca')}
          </div>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          <div style="border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px; background: #eff6ff;">
            <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">左树 L (值 &le; ${splitKey ?? '-'})</div>
            <div style="display: flex; justify-content: center; overflow-x: auto;">
              ${renderSubtree(rootL, '#2563eb')}
            </div>
          </div>
          <div style="border: 1px solid #fed7aa; border-radius: 8px; padding: 8px; background: #fff7ed;">
            <div style="font-size: 11px; font-weight: 700; color: #c2410c; margin-bottom: 4px;">右树 R (值 &gt; ${splitKey ?? '-'})</div>
            <div style="display: flex; justify-content: center; overflow-x: auto;">
              ${renderSubtree(rootR, '#ea580c')}
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}
