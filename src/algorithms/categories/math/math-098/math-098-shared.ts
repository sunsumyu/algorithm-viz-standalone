/**
 * 左神算法通关课 第 098 课 - 快速幂与矩阵快速幂公共数学引擎与渲染组件
 */

export const MOD_1E9_7 = 1000000007;

/**
 * 矩阵乘法 C = (A * B) % mod
 */
export function multiplyMatrix(
  A: number[][],
  B: number[][],
  mod: number = MOD_1E9_7
): number[][] {
  const n = A.length;
  const m = B[0].length;
  const k = B.length;
  const C: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let sum = 0n;
      for (let p = 0; p < k; p++) {
        sum = (sum + BigInt(A[i][p]) * BigInt(B[p][j])) % BigInt(mod);
      }
      C[i][j] = Number(sum);
    }
  }
  return C;
}

/**
 * 生成单位矩阵 I
 */
export function identityMatrix(n: number): number[][] {
  const I: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

/**
 * 矩阵快速幂 A^p % mod
 */
export function matrixPower(
  A: number[][],
  p: number,
  mod: number = MOD_1E9_7
): number[][] {
  const n = A.length;
  let res = identityMatrix(n);
  let base = A.map(row => [...row]);
  let exp = p;

  while (exp > 0) {
    if (exp % 2 === 1) {
      res = multiplyMatrix(res, base, mod);
    }
    base = multiplyMatrix(base, base, mod);
    exp = Math.floor(exp / 2);
  }
  return res;
}

export interface Math098Step {
  line?: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  curPowerMatrix?: number[][];
  curAnsMatrix?: number[][];
  expBits?: { bit: number; val: number; active: boolean }[];
  finalValue?: number;
}

/**
 * 渲染 2D 矩阵表格
 */
export function renderMatrix(
  container: HTMLElement,
  M: number[][],
  title: string = '矩阵'
) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
  `;

  const label = document.createElement('div');
  label.style.cssText = 'font-size: 11px; font-weight: 700; color: #38bdf8; font-family: \'JetBrains Mono\', monospace;';
  label.textContent = `${title} (${M.length}×${M[0]?.length || 0}):`;
  wrapper.appendChild(label);

  const table = document.createElement('div');
  table.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: #1e293b;
    border-radius: 6px;
    border-left: 3px solid #38bdf8;
    border-right: 3px solid #38bdf8;
  `;

  M.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
    row.forEach(val => {
      const cell = document.createElement('div');
      cell.style.cssText = `
        min-width: 40px;
        text-align: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        font-weight: 800;
        color: #f8fafc;
      `;
      cell.textContent = `${val}`;
      rowDiv.appendChild(cell);
    });
    table.appendChild(rowDiv);
  });

  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

/**
 * 渲染指数二进制拆分看板
 */
export function renderExpBits(
  container: HTMLElement,
  exp: number,
  curBitIdx?: number
) {
  const box = document.createElement('div');
  box.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
    color: #f8fafc;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  `;

  const binStr = exp.toString(2);
  const chipsHtml = binStr.split('').map((bit, idx) => {
    const isCur = curBitIdx !== undefined && idx === binStr.length - 1 - curBitIdx;
    return `
      <span style="display: inline-block; width: 24px; text-align: center; padding: 2px 0; border-radius: 4px; background: ${isCur ? '#38bdf8' : bit === '1' ? 'rgba(56, 189, 248, 0.15)' : '#1e293b'}; border: 1px solid ${isCur ? '#38bdf8' : bit === '1' ? '#38bdf8' : '#334155'}; font-weight: 800; color: ${isCur ? '#0f172a' : bit === '1' ? '#38bdf8' : '#64748b'};">
        ${bit}
      </span>
    `;
  }).join('');

  box.innerHTML = `
    <span style="color: #94a3b8; font-weight: 600;">指数二进制分解 (b=${exp}):</span>
    <div style="display: flex; gap: 4px;">${chipsHtml}</div>
  `;

  container.appendChild(box);
}
