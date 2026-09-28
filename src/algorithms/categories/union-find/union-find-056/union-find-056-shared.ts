/**
 * Class 056: 并查集·上 (Union-Find Part 1) 共享沙盘与渲染器
 * 1. 并查集核心模版与路径压缩 (Union-Find Template / 洛谷 P3367 / 牛客)
 * 2. 情侣牵手与置换环定理 (Couples Holding Hands / LeetCode 765)
 * 3. 相似字符串组 (Similar String Groups / LeetCode 839)
 * 4. 岛屿数量并查集二维合并 (Number of Islands / LeetCode 200)
 *
 * 遵循 DOM 契约：
 * - 纯净沙盘，零 h1~h6
 * - 语义化包裹，杜绝误触指标药丸面板
 * - 响应式多栏支持
 */

import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface Step056 {
  title?: string;
  description?: string;
  decision?: string;
  message?: string;
  log?: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  metrics?: Record<string, string | number>;

  // Code01/02 并查集模版
  n?: number;
  father?: number[];
  findPath?: number[]; // 经历路径压缩的节点序列
  opType?: 'find' | 'union' | 'same' | 'init' | 'done';
  opArgs?: { x: number; y: number; rootX?: number; rootY?: number; isSame?: boolean };
  setsCount?: number;

  // Code03 情侣牵手
  row?: number[];
  couchIdx?: number;
  couples?: [number, number];
  parentCouples?: number[];
  curSwaps?: number;

  // Code04 相似字符串组
  strs?: string[];
  comparePair?: { i: number; j: number; diffCount: number; isSimilar: boolean };
  similarSets?: number;
  strFather?: number[];

  // Code05 岛屿数量并查集
  grid?: string[][];
  flatFather?: number[];
  curR?: number;
  curC?: number;
  islandCount?: number;
}

/**
 * 沙盘 1: 并查集模版沙盘 (Code01/02)
 * 展示 father 数组、当前操作、路径压缩动画、集合代表元
 */
export function renderUnionFindTemplateBoard(step: Step056): string {
  const father = step.father || [];
  const findPath = step.findPath || [];
  const op = step.opArgs;

  const cellsHtml = father.map((f, idx) => {
    const isRoot = f === idx;
    const inPath = findPath.includes(idx);
    const isOpX = op && op.x === idx;
    const isOpY = op && op.y === idx;

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';
    let color = '#334155';

    if (isOpX || isOpY) {
      border = '2px solid #ec4899';
      bg = '#fdf2f8';
      color = '#be185d';
    } else if (inPath) {
      border = '2px solid #3b82f6';
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (isRoot) {
      border = '1.5px solid #10b981';
      bg = '#ecfdf5';
      color = '#047857';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 44px;">
        <span style="font-size: 9px; color: #64748b; font-family: monospace;">节点 ${idx}</span>
        <div style="width: 40px; height: 36px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="font-size: 13px; font-weight: 800; font-family: monospace;">${f}</span>
        </div>
        <span style="font-size: 8.5px; margin-top: 2px; font-weight: 700;">
          ${isRoot ? '<span style="color: #059669;">根代表</span>' : inPath ? '<span style="color: #2563eb;">压缩中</span>' : ''}
        </span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155;">🌲 并查集父指针数组 father[i] (数值即指向的父节点)</span>
          <span style="font-size: 11px; font-weight: 700; color: #0284c7;">当前独立连通分量: ${step.setsCount ?? '—'} 个</span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 4px 0;">
          ${cellsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      ${findPath.length > 0 ? `
        <div style="padding: 6px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">
            🚀 路径压缩执行序列: ${findPath.join(' ➔ ')} (沿途所有节点直接挂载到根代表元 ${findPath[findPath.length - 1]})
          </span>
        </div>
      ` : ''}

      ${op ? `
        <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">
            🕹️ 当前指令: 节点 ${op.x} (根 ${op.rootX ?? '?'}) 与 节点 ${op.y} (根 ${op.rootY ?? '?'}) ${step.opType === 'same' ? (op.isSame ? '属于同集合' : '不属于同集合') : '执行合并'}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 沙盘 2: 情侣牵手置换环沙盘 (Code03)
 * 展示双人沙发座位、相邻情侣编号、情侣缩点并查集、置换环计数
 */
export function renderCouplesHandsBoard(step: Step056): string {
  const row = step.row || [];
  const curCouch = step.couchIdx !== undefined ? step.couchIdx : -1;
  const parentCouples = step.parentCouples || [];
  const swaps = step.curSwaps || 0;

  // 双人沙发座位
  const couchesHtml: string[] = [];
  for (let c = 0; c < row.length / 2; c++) {
    const p1 = row[2 * c];
    const p2 = row[2 * c + 1];
    const c1 = Math.floor(p1 / 2);
    const c2 = Math.floor(p2 / 2);
    const isSameCouple = c1 === c2;
    const isCur = c === curCouch;

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';

    if (isCur) {
      border = '2px solid #8b5cf6';
      bg = '#f5f3ff';
    } else if (isSameCouple) {
      border = '1.5px solid #10b981';
      bg = '#ecfdf5';
    }

    couchesHtml.push(`
      <div style="padding: 6px 8px; border-radius: 8px; border: ${border}; background: ${bg};
                  display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 80px;">
        <span style="font-size: 9px; color: #64748b; font-weight: 700;">🛋️ 沙发 #${c}</span>
        <div style="display: flex; gap: 4px;">
          <span style="padding: 2px 4px; border-radius: 4px; background: #e2e8f0; font-family: monospace; font-size: 11px; font-weight: 700;">
            ${p1}(对${c1})
          </span>
          <span style="padding: 2px 4px; border-radius: 4px; background: #e2e8f0; font-family: monospace; font-size: 11px; font-weight: 700;">
            ${p2}(对${c2})
          </span>
        </div>
        <span style="font-size: 8.5px; font-weight: 700; color: ${isSameCouple ? '#059669' : '#d97706'};">
          ${isSameCouple ? '已牵手' : '跨对错位'}
        </span>
      </div>
    `);
  }

  // 情侣代表元并查集
  const cpSetHtml = parentCouples.map((p, idx) => `
    <div style="padding: 2px 6px; border-radius: 4px; background: #f8fafc; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px;">
      情侣对${idx} ➔ ${p}
    </div>
  `).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155;">🛋️ 沙发席位情侣排布 (相邻两位共享沙发, 人员编号 / 2 即为情侣组号)</span>
          <span style="font-size: 11px; font-weight: 700; color: #059669;">当前累计需交换: ${swaps} 次</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0;">
          ${couchesHtml.join('')}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #6b21a8;">🔗 情侣对缩点并查集 (同一环内情侣连通, k个情侣错位环需 k-1 次交换)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; padding: 6px 10px; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 6px;">
          ${cpSetHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * 沙盘 3: 相似字符串组沙盘 (Code04)
 * 展示字符串列表、两两字符差异比对、相似连通组
 */
export function renderSimilarStringsBoard(step: Step056): string {
  const strs = step.strs || [];
  const cmp = step.comparePair;
  const groups = step.similarSets !== undefined ? step.similarSets : strs.length;
  const father = step.strFather || [];

  const listHtml = strs.map((s, idx) => {
    const isA = cmp && cmp.i === idx;
    const isB = cmp && cmp.j === idx;
    const root = father.length > idx ? father[idx] : idx;

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';
    let color = '#334155';

    if (isA) {
      border = '2px solid #3b82f6';
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (isB) {
      border = '2px solid #ec4899';
      bg = '#fdf2f8';
      color = '#be185d';
    }

    return `
      <div style="padding: 4px 8px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                  display: flex; align-items: center; justify-content: space-between; font-family: monospace; font-size: 12px; font-weight: 700;">
        <span>#${idx}: "${s}"</span>
        <span style="font-size: 9px; color: #64748b; margin-left: 8px;">组代表 #${root}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11.5px; font-weight: 700; color: #334155;">🔤 字符串候选列表 (两字符串仅有 0 处或 2 处字符不同即判定为相似)</span>
        <span style="font-size: 11px; font-weight: 700; color: #059669;">当前相似字符串组数: ${groups}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
        ${listHtml}
      </div>

      ${cmp ? `
        <div style="padding: 8px 12px; background: ${cmp.isSimilar ? '#ecfdf5' : '#fff1f2'}; border: 1px solid ${cmp.isSimilar ? '#a7f3d0' : '#fecdd3'}; border-radius: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: ${cmp.isSimilar ? '#065f46' : '#be123c'};">
            🔍 比较 #${cmp.i} "${strs[cmp.i]}" 与 #${cmp.j} "${strs[cmp.j]}": 字符差异数 = ${cmp.diffCount} ➔ ${cmp.isSimilar ? '判定相似 (并查集合并)' : '不相似 (保持独立)'}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 沙盘 4: 岛屿数量并查集动态二维合并沙盘 (Code05)
 * 展示二维网格地图、向左向上连通加边、连通分量计数
 */
export function renderIslandsUnionFindBoard(step: Step056): string {
  const grid = step.grid || [];
  const curR = step.curR !== undefined ? step.curR : -1;
  const curC = step.curC !== undefined ? step.curC : -1;
  const count = step.islandCount !== undefined ? step.islandCount : 0;
  const father = step.flatFather || [];

  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  let tableRows = '';
  for (let r = 0; r < rows; r++) {
    let cells = '';
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      const isCur = r === curR && c === curC;
      const isLand = val === '1';
      const flatIdx = r * cols + c;
      const f = father[flatIdx];

      let bg = '#f8fafc';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';

      if (isLand) {
        bg = '#d1fae5';
        border = '1px solid #10b981';
        color = '#065f46';
      }

      if (isCur) {
        border = '2px solid #ef4444';
        bg = '#fee2e2';
        color = '#b91c1c';
      }

      cells += `
        <td style="width: 36px; height: 36px; text-align: center; border: ${border}; background: ${bg}; color: ${color};
                   font-family: monospace; font-size: 11px; font-weight: 700;">
          <div>${val}</div>
          ${isLand && f !== undefined ? `<div style="font-size: 8px; opacity: 0.8;">#${f}</div>` : ''}
        </td>
      `;
    }
    tableRows += `<tr>${cells}</tr>`;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11.5px; font-weight: 700; color: #334155;">🗺️ 二维网格动态行优先扫描 (绿格: 陆地 '1', 向左/向上合并)</span>
        <span style="font-size: 11px; font-weight: 700; color: #059669;">独立岛屿连通分量: ${count}</span>
      </div>

      <table style="border-collapse: collapse; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}
