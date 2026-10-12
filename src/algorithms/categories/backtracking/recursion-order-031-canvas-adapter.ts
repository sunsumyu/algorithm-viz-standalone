/**
 * Class 031: 经典递归过程与递归序画布适配器
 * 负责渲染二叉树拓扑沙盘、调用栈与三序收集箱
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { RecursionOrderStep } from './recursion-order-031-step-compiler';

export function renderRecursionOrderCanvas(container: HTMLElement, step: RecursionOrderStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 顶部核心指示看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前活跃节点 & 访问轮次</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            step.pass === 1 ? '#34d399' : step.pass === 2 ? '#f59e0b' : step.pass === 3 ? '#ec4899' : '#94a3b8'
          }; margin-top: 4px;">
            ${step.currentNode !== null ? `节点 [ ${step.currentNode} ] · 第 ${step.pass} 次到达` : 'null (空指针基底)'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">递归调用栈深度 (Call Stack)</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            深度 ${step.callStack.length} : [${step.callStack.join(' ➔ ') || '栈空'}]
          </div>
        </div>
      </div>

      <!-- 主视图：左侧二叉树拓扑与调用，右侧调用栈容器与三序序列 -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 16px;">
        <!-- 树结构图画板 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">二叉树拓扑沙盘 (节点访问状态点亮)</div>
          <svg viewBox="0 0 320 180" style="max-width: 100%; height: 160px;">
            <!-- 树连线 -->
            <line x1="160" y1="35" x2="80" y2="95" stroke="#475569" stroke-width="2" />
            <line x1="160" y1="35" x2="240" y2="95" stroke="#475569" stroke-width="2" />
            <line x1="80" y1="95" x2="40" y2="155" stroke="#475569" stroke-width="2" />
            <line x1="80" y1="95" x2="120" y2="155" stroke="#475569" stroke-width="2" />

            <!-- 节点 1 (Root) -->
            <circle cx="160" cy="35" r="18" fill="${step.currentNode === 1 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 1 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="160" y="41" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">1</text>

            <!-- 节点 2 (Left) -->
            <circle cx="80" cy="95" r="18" fill="${step.currentNode === 2 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 2 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="80" y="101" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">2</text>

            <!-- 节点 3 (Right) -->
            <circle cx="240" cy="95" r="18" fill="${step.currentNode === 3 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 3 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="240" y="101" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">3</text>

            <!-- 节点 4 (2.Left) -->
            <circle cx="40" cy="155" r="14" fill="${step.currentNode === 4 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 4 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="40" y="160" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">4</text>

            <!-- 节点 5 (2.Right) -->
            <circle cx="120" cy="155" r="14" fill="${step.currentNode === 5 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 5 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="120" y="160" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">5</text>
          </svg>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
            绿色: 1st 到达(先序) · 橙色: 2nd 到达(中序) · 粉色: 3rd 到达(后序)
          </div>
        </div>

        <!-- 递归调用栈与三序收集箱 -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- 栈槽 -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #38bdf8; margin-bottom: 6px;">系统执行栈 (Call Stack)</div>
            <div style="display: flex; gap: 6px; align-items: center; min-height: 36px; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
              ${step.callStack.length === 0 ? '<span style="color: #64748b; font-size: 11px;">栈空</span>' : ''}
              ${step.callStack.map(val => `
                <div style="padding: 4px 10px; background: #0284c7; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  f(${val})
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 先中后序三清单 -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #34d399; font-weight: 600;">先序 (1st pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(52, 211, 153, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.preorder.join(', ') || 'Ø'}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #fbbf24; font-weight: 600;">中序 (2nd pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(251, 191, 36, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.inorder.join(', ') || 'Ø'}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #f472b6; font-weight: 600;">后序 (3rd pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(244, 114, 182, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.postorder.join(', ') || 'Ø'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 公式原理卡片 -->
      ${renderFormulaCard(
        '递归序第一性原理',
        '任何二叉树递归遍历本质都是先压入栈、探索完左子树回到本节点、探索完右子树再次回到本节点并弹栈。三顾茅庐是递归不变规律，先/中/后序遍历只是在此过程中选择不同时间点打印！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
