/**
 * 左神算法通关课 Class 161 ~ 166 共享沙盘与渲染助手
 * 提供：NTT 模 998244353 蝴蝶流图、多项式求逆牛顿迭代倍增图、FWT 位运算卷积矩阵图、杜教筛亚线性分块沙盘、莫比乌斯反演数论分块图、卢卡斯定理 p 进制拆分图
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced161Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. NTT 快速数论变换渲染沙盘
// ----------------------------------------------------
export function renderNTTBoard(
  a: number[],
  b: number[],
  convResult?: number[],
  stage: string = '初始化',
  limit: number = 4,
  p: number = 998244353,
  g: number = 3
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚡ 快速数论变换 (NTT) 模域蝶形网络沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0e7ff; color: #3730a3; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">模数与原根配置</div>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 4px;">P = ${p}, g = ${g}</div>
          <div style="font-size: 11px; color: #0284c7; margin-top: 2px;">逆元 g<sup>-1</sup> &equiv; 332748118 (mod P)</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">变换补齐规模</div>
          <div style="font-size: 13px; font-weight: 700; color: #4338ca; margin-top: 4px;">N = 2<sup>${Math.round(Math.log2(limit))}</sup> = ${limit}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">位逆序置换 (Bit-Reversal) 原地迭代</div>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">输入多项式 A(x) 系数:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${a.map((v, i) => `
            <span style="padding: 4px 8px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; font-size: 12px; font-weight: 700; color: #1d4ed8;">
              a[${i}] = ${v}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">输入多项式 B(x) 系数:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${b.map((v, i) => `
            <span style="padding: 4px 8px; background: #fdf2f8; border: 1px solid #f472b6; border-radius: 6px; font-size: 12px; font-weight: 700; color: #be185d;">
              b[${i}] = ${v}
            </span>
          `).join('')}
        </div>
      </div>

      ${convResult ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 4px;">NTT 卷积还原多项式 C(x) = A(x) * B(x) mod P:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${convResult.map((v, i) => `
              <span style="padding: 4px 10px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; font-size: 12px; font-weight: 800; color: #047857;">
                c[${i}] = ${v}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 2. 多项式求逆沙盘 (Newton Iteration)
// ----------------------------------------------------
export function renderPolyInvBoard(
  a: number[],
  b: number[],
  targetDeg: number,
  currDeg: number,
  stage: string = '初始化'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔄 多项式求逆 (Polynomial Inverse) 牛顿迭代倍增沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前倍增模项</div>
          <div style="font-size: 14px; font-weight: 800; color: #d97706; margin-top: 4px;">mod x<sup>${currDeg}</sup> (目标 deg = ${targetDeg})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">迭代公式: B &equiv; B<sub>0</sub>(2 - A B<sub>0</sub>)</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">收敛进度</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 4px;">${Math.min(100, Math.round((currDeg / targetDeg) * 100))}%</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">时间复杂度 T(n) = T(n/2) + O(n log n)</div>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">原多项式 A(x) 前 ${targetDeg} 项系数:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${a.slice(0, targetDeg).map((v, i) => `
            <span style="padding: 4px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 700; color: #334155;">
              a[${i}] = ${v}
            </span>
          `).join('')}
        </div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 4px;">当前倍增逆元多项式 B(x) 系数:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${b.slice(0, currDeg).map((v, i) => `
            <span style="padding: 4px 10px; background: #fefce8; border: 1px solid #fde047; border-radius: 6px; font-size: 12px; font-weight: 800; color: #a16207;">
              b[${i}] = ${v}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 快速沃尔什变换 FWT 沙盘
// ----------------------------------------------------
export function renderFWTBoard(
  arrA: number[],
  arrB: number[],
  res: number[] | undefined,
  opType: 'XOR' | 'OR' | 'AND' = 'XOR',
  stage: string = '初始化'
): string {
  const n = arrA.length;
  const bitLen = Math.round(Math.log2(n));

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🧬 快速沃尔什变换 (FWT) 位运算卷积沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #dcfce7; color: #15803d; font-weight: 700;">
          ${opType} 卷积模式 | ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
        二进制位空间维数: <strong>${bitLen} 维 (规模 2<sup>${bitLen}</sup> = ${n})</strong>。蝶形矩阵实现分治线性映射。
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${arrA.map((va, idx) => {
          const binStr = idx.toString(2).padStart(bitLen, '0');
          const vb = arrB[idx];
          const vr = res ? res[idx] : undefined;
          return `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center;">
              <div style="font-size: 10px; font-family: monospace; color: #94a3b8;">[${binStr}] (idx=${idx})</div>
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-top: 2px;">
                A=${va}, B=${vb}
              </div>
              ${vr !== undefined ? `
                <div style="font-size: 12px; font-weight: 800; color: #059669; margin-top: 2px; border-top: 1px dashed #cbd5e1; padding-top: 2px;">
                  C=${vr}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 10px; color: #166534;">
        <strong>${opType} 变换矩阵:</strong> ${
          opType === 'XOR' ? '正 [1, 1; 1, -1] / 逆 [1/2, 1/2; 1/2, -1/2]' :
          (opType === 'OR' ? '正 [1, 0; 1, 1] / 逆 [1, 0; -1, 1]' : '正 [1, 1; 0, 1] / 逆 [1, -1; 0, 1]')
        }
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 杜教筛沙盘 (Dujiao Sieve)
// ----------------------------------------------------
export interface DujiaoBlockInfo {
  l: number;
  r: number;
  nDiv: number;
  subSum: number;
  contribution: number;
}

export function renderDujiaoBoard(
  n: number,
  preLimit: number,
  blocks: DujiaoBlockInfo[],
  memoCount: number,
  finalAns?: number,
  stage: string = '数论分块'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 杜教筛 (Dujiao Sieve) 亚线性狄利克雷卷积沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f3e8ff; color: #7e22ce; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">目标询问规模</div>
          <div style="font-size: 16px; font-weight: 800; color: #7c3aed; margin-top: 4px;">N = ${n}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">线性筛预处理边界: ${preLimit}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">哈希记忆化表</div>
          <div style="font-size: 16px; font-weight: 800; color: #059669; margin-top: 4px;">已缓存 ${memoCount} 个大值状态</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">复杂度从 O(N) 降至 O(N<sup>2/3</sup>)</div>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">数论分块项 &sum; (r - l + 1) * S(&lfloor;N / d&rfloor;):</div>
      <div style="max-height: 140px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; color: #475569; text-align: left;">
              <th style="padding: 4px 6px;">区间 [l, r]</th>
              <th style="padding: 4px 6px;">区间长度</th>
              <th style="padding: 4px 6px;">&lfloor;N/l&rfloor;</th>
              <th style="padding: 4px 6px;">子问题 S(&lfloor;N/l&rfloor;)</th>
              <th style="padding: 4px 6px;">抵消贡献</th>
            </tr>
          </thead>
          <tbody>
            ${blocks.map(b => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px 6px; font-weight: 700; color: #1e293b;">[${b.l}, ${b.r}]</td>
                <td style="padding: 4px 6px;">${b.r - b.l + 1}</td>
                <td style="padding: 4px 6px; color: #7c3aed; font-weight: 700;">${b.nDiv}</td>
                <td style="padding: 4px 6px;">${b.subSum}</td>
                <td style="padding: 4px 6px; font-weight: 700; color: #b91c1c;">-${b.contribution}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${finalAns !== undefined ? `
        <div style="margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">最终积性函数前缀和 S(${n}):</span>
          <span style="font-size: 15px; font-weight: 800; color: #059669; padding: 2px 10px; background: #ecfdf5; border-radius: 6px;">
            ${finalAns}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 5. 莫比乌斯反演沙盘 (Möbius Inversion)
// ----------------------------------------------------
export interface MobiusBlockView {
  l: number;
  r: number;
  nDiv: number;
  mDiv: number;
  deltaMu: number;
  termAns: number;
}

export function renderMobiusBoard(
  n: number,
  m: number,
  blocks: MobiusBlockView[],
  currentSum: number,
  stage: string = '分块加速'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔍 莫比乌斯反演互质数对 &sum; &mu;(d)&lfloor;n/d&rfloor;&lfloor;m/d&rfloor; 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0369a1; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">询问区间规模:</span>
          <span style="font-size: 13px; font-weight: 800; color: #1e293b; margin-left: 6px;">N = ${n}, M = ${m}</span>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">累计互质数对:</span>
          <span style="font-size: 13px; font-weight: 800; color: #0284c7; margin-left: 6px;">${currentSum}</span>
        </div>
      </div>

      <div style="max-height: 140px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; color: #475569; text-align: left;">
              <th style="padding: 4px 6px;">整除区间 [l, r]</th>
              <th style="padding: 4px 6px;">&lfloor;N/l&rfloor;</th>
              <th style="padding: 4px 6px;">&lfloor;M/l&rfloor;</th>
              <th style="padding: 4px 6px;">&sum;&mu;(r) - &sum;&mu;(l-1)</th>
              <th style="padding: 4px 6px;">区间贡献增量</th>
            </tr>
          </thead>
          <tbody>
            ${blocks.map(b => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px 6px; font-weight: 700; color: #1e293b;">[${b.l}, ${b.r}]</td>
                <td style="padding: 4px 6px; color: #0369a1; font-weight: 700;">${b.nDiv}</td>
                <td style="padding: 4px 6px; color: #0369a1; font-weight: 700;">${b.mDiv}</td>
                <td style="padding: 4px 6px; font-weight: 700; color: ${b.deltaMu < 0 ? '#dc2626' : (b.deltaMu > 0 ? '#16a34a' : '#64748b')};">
                  ${b.deltaMu}
                </td>
                <td style="padding: 4px 6px; font-weight: 800; color: #0284c7;">+${b.termAns}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 卢卡斯定理沙盘 (Lucas Theorem)
// ----------------------------------------------------
export interface LucasDigitView {
  power: number;
  ni: number;
  mi: number;
  combVal: number;
}

export function renderLucasBoard(
  n: number,
  m: number,
  p: number,
  digits: LucasDigitView[],
  ans?: number,
  stage: string = '进制拆分'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>👑 卢卡斯定理 (Lucas Theorem) p 进制拆解沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef2f2; color: #b91c1c; font-weight: 700;">
          模素数 P = ${p} | ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">目标大组合数:</span>
          <span style="font-size: 13px; font-weight: 800; color: #1e293b; margin-left: 6px;">C(${n}, ${m}) mod ${p}</span>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">拆解项数:</span>
          <span style="font-size: 13px; font-weight: 800; color: #b91c1c; margin-left: 6px;">${digits.length} 位 p 进制数</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${digits.map((d, i) => `
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 10px; color: #9f1239; font-weight: 700;">第 ${i} 位 (p<sup>${d.power}</sup>)</div>
            <div style="font-size: 12px; font-weight: 800; color: #881337; margin-top: 4px;">
              C(${d.ni}, ${d.mi})
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #be123c; margin-top: 2px;">
              = ${d.combVal} (mod ${p})
            </div>
          </div>
        `).join('')}
      </div>

      ${ans !== undefined ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">卢卡斯连乘最终积 &prod; C(n<sub>i</sub>, m<sub>i</sub>) mod ${p}:</span>
          <span style="font-size: 16px; font-weight: 800; color: #b91c1c; padding: 2px 12px; background: #fff1f2; border-radius: 6px;">
            ${ans}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}
