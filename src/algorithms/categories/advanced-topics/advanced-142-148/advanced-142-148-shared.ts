/**
 * 左神算法通关课 Class 142 ~ 148 共享沙盘组件与渲染助手
 * 提供：差分约束松弛图、同余类最短路网、错排反演表格、康托展开阶乘分解沙盘、卡特兰格路步进图、AVL 树平衡因子图
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced142Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

/**
 * 1. 渲染差分约束图状态与 SPFA 距离表
 */
export function renderDiffConstraintsBoard(
  n: number,
  dist: number[],
  count: number[],
  inQueue: boolean[],
  activeNode: number = -1,
  edges?: { u: number; v: number; w: number; active?: boolean }[],
  hasNegativeCycle?: boolean
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌐 差分约束 SPFA 松弛状态表 (${n} 个变量: x1 ~ x${n})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${hasNegativeCycle ? '#fee2e2' : '#f0fdf4'}; color: ${hasNegativeCycle ? '#b91c1c' : '#15803d'}; font-weight: 700;">
          ${hasNegativeCycle ? '⚠️ 发现负权环 (无解 / 矛盾)' : '✅ 状态正常'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 12px;">
        ${Array.from({ length: n }).map((_, idx) => {
          const u = idx + 1;
          const isActive = u === activeNode;
          const dVal = dist[u] >= 1e8 ? 'INF' : dist[u];
          const inQ = inQueue[u];
          const cnt = count[u] || 0;
          return `
            <div style="border: 2px solid ${isActive ? '#6366f1' : '#e2e8f0'}; background: ${isActive ? '#eef2ff' : '#f8fafc'}; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-weight: 700; color: #1e293b; font-size: 13px;">变量 x${u}</div>
              <div style="font-size: 12px; color: #4338ca; margin-top: 4px; font-weight: 700;">dist = ${dVal}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">松弛次数: <span style="font-weight: 700; color: ${cnt >= n ? '#dc2626' : '#334155'}">${cnt}</span> / ${n}</div>
              <div style="margin-top: 4px; font-size: 10px; display: inline-block; padding: 1px 6px; border-radius: 4px; background: ${inQ ? '#fef3c7' : '#f1f5f9'}; color: ${inQ ? '#b45309' : '#94a3b8'};">
                ${inQ ? '队列中' : '空闲'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${edges && edges.length > 0 ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">约束条件有向边 (u -> v 权值 w 表示: x_v - x_u <= w):</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${edges.map(e => `
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: ${e.active ? '#6366f1' : '#f1f5f9'}; color: ${e.active ? '#ffffff' : '#334155'}; font-weight: ${e.active ? '700' : 'normal'};">
                x${e.v} - x${e.u} &le; ${e.w}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 2. 渲染同余最短路 (跳楼机模型)
 */
export function renderCongruenceBoard(
  x: number,
  y: number,
  z: number,
  h: number,
  dist: number[],
  curU: number = -1,
  ansSoFar: number = 0
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🏢 同余最短路 (模数基准: mod ${x}, 跨步: +${y}, +${z}, 楼高上限: ${h})</span>
        <span style="font-size: 12px; font-weight: 700; color: #4338ca;">已达不同楼层总数: ${ansSoFar}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${Array.from({ length: x }).map((_, r) => {
          const d = dist[r] >= 1e14 ? 'INF' : dist[r];
          const isAct = r === curU;
          const reachable = dist[r] <= h;
          const countR = reachable ? Math.floor((h - dist[r]) / x) + 1 : 0;
          return `
            <div style="border: 2px solid ${isAct ? '#6366f1' : (reachable ? '#86efac' : '#e2e8f0')}; background: ${isAct ? '#eef2ff' : (reachable ? '#f0fdf4' : '#f8fafc')}; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">余数 ${r} (mod ${x})</div>
              <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">minH = ${d}</div>
              <div style="font-size: 10px; color: ${reachable ? '#15803d' : '#94a3b8'}; margin-top: 2px;">
                ${reachable ? `贡献: ${countR} 层` : '不可达'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>核心原理</b>：设基准步长为 x。若能到达的模 x 余数为 r 的最小高度为 dist[r]，则所有 dist[r] + k*x &le; h 的楼层均可达！单个余数类的贡献公式为 <code>floor((h - dist[r]) / x) + 1</code>。
      </div>
    </div>
  `;
}

/**
 * 3. 渲染二项式反演 / 错排递推
 */
export function renderDerangementBoard(
  n: number,
  d: number[],
  curI: number = -1
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🧮 错排问题 (二项式反演典型应用) D[i] 递推沙盘</span>
        <span style="font-size: 11px; color: #64748b;">目标元素规模 n = ${n}</span>
      </div>

      <div style="overflow-x: auto; margin-bottom: 12px;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; color: #64748b;">i (规模)</th>
              ${Array.from({ length: n + 1 }).map((_, i) => `
                <th style="padding: 6px; color: ${i === curI ? '#6366f1' : '#334155'}; font-weight: 700;">${i}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; font-weight: 700; color: #64748b;">错排数 D[i]</td>
              ${Array.from({ length: n + 1 }).map((_, i) => {
                const val = d[i] !== undefined ? d[i] : '-';
                const isCur = i === curI;
                return `
                  <td style="padding: 6px; font-weight: 700; color: ${isCur ? '#4338ca' : '#1e293b'}; background: ${isCur ? '#eef2ff' : 'transparent'};">
                    ${val}
                  </td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px; font-size: 12px; color: #166534;">
        📐 <b>递推公式</b>：D[i] = (i - 1) * (D[i - 1] + D[i - 2])。基底条件为 D[0] = 1, D[1] = 0。<br/>
        由二项式反演推导：若全排列数 n! = &sum; C(n, k) * D[k]，反演可得 D[n] = n! &sum; ((-1)^k / k!)。
      </div>
    </div>
  `;
}

/**
 * 4. 渲染康托展开分解沙盘
 */
export function renderCantorBoard(
  perm: number[],
  curIndex: number = -1,
  smallerCounts?: number[],
  factorialWeights?: number[],
  currentRank?: number
): string {
  const n = perm.length;
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔢 康托展开排列字典序排名沙盘</span>
        <span style="font-size: 12px; font-weight: 700; color: #4338ca;">当前累加排名 Rank = ${currentRank ?? 1}</span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${perm.map((val, idx) => {
          const isAct = idx === curIndex;
          const sCount = smallerCounts && smallerCounts[idx] !== undefined ? smallerCounts[idx] : '-';
          const weight = factorialWeights && factorialWeights[n - 1 - idx] !== undefined ? `${n - 1 - idx}! (${factorialWeights[n - 1 - idx]})` : `${n - 1 - idx}!`;
          return `
            <div style="border: 2px solid ${isAct ? '#6366f1' : '#cbd5e1'}; background: ${isAct ? '#eef2ff' : '#f8fafc'}; border-radius: 8px; padding: 8px; min-width: 90px; text-align: center;">
              <div style="font-size: 11px; color: #64748b;">位置 [${idx}]</div>
              <div style="font-size: 18px; font-weight: 800; color: ${isAct ? '#4338ca' : '#1e293b'}; margin: 2px 0;">${val}</div>
              <div style="font-size: 11px; color: #0284c7;">右侧更小: <b>${sCount}</b></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">位权: ${weight}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        💡 <b>计算公式</b>：Rank = 1 + &sum;_{i=0}^{n-1} (右侧比 perm[i] 小的未出现数字个数 &times; (n - 1 - i)!)。
      </div>
    </div>
  `;
}

/**
 * 5. 渲染卡特兰数网格图与递推表
 */
export function renderCatalanBoard(
  n: number,
  catalanList: number[],
  curI: number = -1
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📈 卡特兰数 (Catalan Number) 递推与格路折线沙盘</span>
        <span style="font-size: 12px; font-weight: 700; color: #4338ca;">C(${n}) = ${catalanList[n] ?? '-'}</span>
      </div>

      <div style="overflow-x: auto; margin-bottom: 12px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${Array.from({ length: n + 1 }).map((_, i) => {
            const isCur = i === curI;
            const val = catalanList[i] !== undefined ? catalanList[i] : '-';
            return `
              <div style="border: 2px solid ${isCur ? '#6366f1' : '#e2e8f0'}; background: ${isCur ? '#eef2ff' : '#f8fafc'}; border-radius: 8px; padding: 6px 12px; text-align: center; min-width: 65px;">
                <div style="font-size: 10px; color: #64748b;">C(${i})</div>
                <div style="font-size: 14px; font-weight: 700; color: ${isCur ? '#4338ca' : '#1e293b'};">${val}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 12px; color: #475569;">
        📐 <b>递推公式</b>：C(n) = C(n - 1) * (4n - 2) / (n + 1)，基底 C(0) = 1。<br/>
        <b>组合公式</b>：C(n) = C(2n, n) / (n + 1) = C(2n, n) - C(2n, n - 1)（格路折线法，穿过对角线的非法路径一一映射到翻折路径）。
      </div>
    </div>
  `;
}

/**
 * 6. 渲染 AVL 树节点平衡因子与旋转指示
 */
export interface AVLNodeView {
  key: number;
  height: number;
  balance: number;
  left?: AVLNodeView;
  right?: AVLNodeView;
}

export function renderAVLTreeBoard(
  root: AVLNodeView | null,
  activeKey: number = -1,
  rotationType: string = 'None'
): string {
  // 简易层序遍历排版
  const renderSubtree = (node?: AVLNodeView): string => {
    if (!node) return '<span style="color: #cbd5e1; font-size: 11px;">null</span>';
    const isAct = node.key === activeKey;
    const isImbalanced = Math.abs(node.balance) > 1;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px 6px;">
        <div style="border: 2px solid ${isImbalanced ? '#dc2626' : (isAct ? '#6366f1' : '#94a3b8')}; background: ${isImbalanced ? '#fee2e2' : (isAct ? '#eef2ff' : '#ffffff')}; border-radius: 9999px; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <span>${node.key}</span>
          <span style="font-size: 9px; color: ${isImbalanced ? '#b91c1c' : '#64748b'};">b=${node.balance}</span>
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
        <span>🌲 AVL 自平衡二叉搜索树沙盘 (节点格式: 值 / 平衡因子 b = hL - hR)</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${rotationType !== 'None' ? '#fef3c7' : '#f0fdf4'}; color: ${rotationType !== 'None' ? '#b45309' : '#15803d'}; font-weight: 700;">
          ${rotationType !== 'None' ? `🔄 触发自平衡旋转: ${rotationType}` : '✅ 树严格平衡'}
        </span>
      </div>

      <div style="display: flex; justify-content: center; overflow-x: auto; padding: 12px 0;">
        ${root ? renderSubtree(root) : '<span style="color: #94a3b8; font-size: 13px;">空树</span>'}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px; margin-top: 8px;">
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center;">
          <b>LL 型失衡</b><br/>右单旋 (rotateRight)
        </div>
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center;">
          <b>RR 型失衡</b><br/>左单旋 (rotateLeft)
        </div>
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center;">
          <b>LR 型失衡</b><br/>左孩子左旋 + 根右旋
        </div>
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center;">
          <b>RL 型失衡</b><br/>右孩子右旋 + 根左旋
        </div>
      </div>
    </div>
  `;
}
