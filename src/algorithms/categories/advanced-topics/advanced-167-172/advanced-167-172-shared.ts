/**
 * 左神算法通关课 Class 167 ~ 172 共享沙盘与渲染助手
 * 提供：扩展卢卡斯质因数剥离沙盘、EXCRT 双方程合并沙盘、EXBSGS 降模消公因沙盘、多项式除法反转消余沙盘、多项式开方牛顿倍增沙盘、多项式 ln/exp 微积分沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced167Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 扩展卢卡斯定理 (EXLucas) 沙盘
// ----------------------------------------------------
export interface EXLucasFactorItem {
  p: number;
  pk: number;
  ai: number;
}

export function renderEXLucasBoard(
  n: number,
  m: number,
  p: number,
  factors: EXLucasFactorItem[],
  ans?: number,
  stage: string = '质因数分解'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>👑 扩展卢卡斯定理 (EXLucas) 任意模数沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fee2e2; color: #991b1b; font-weight: 700;">
          模合数 P = ${p} | ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">目标大组合数:</span>
          <span style="font-size: 13px; font-weight: 800; color: #1e293b; margin-left: 6px;">C(${n}, ${m}) mod ${p}</span>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
          <span style="font-size: 11px; color: #64748b;">模数分解项数:</span>
          <span style="font-size: 13px; font-weight: 800; color: #b91c1c; margin-left: 6px;">${factors.length} 个互质素数幂</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${factors.map((f, i) => `
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 10px; color: #9f1239; font-weight: 700;">分量 #${i + 1} (p<sup>k</sup> = ${f.pk})</div>
            <div style="font-size: 12px; font-weight: 700; color: #881337; margin-top: 4px;">
              C(${n}, ${m}) &equiv; ${f.ai}
            </div>
            <div style="font-size: 11px; color: #be123c; margin-top: 2px;">
              (mod ${f.pk})
            </div>
          </div>
        `).join('')}
      </div>

      ${ans !== undefined ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">CRT 中国剩余定理合并总解:</span>
          <span style="font-size: 16px; font-weight: 800; color: #b91c1c; padding: 2px 12px; background: #fff1f2; border-radius: 6px;">
            C(${n}, ${m}) &equiv; ${ans} (mod ${p})
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 2. 扩展中国剩余定理 (EXCRT) 沙盘
// ----------------------------------------------------
export interface EXCRTEquation {
  m: number;
  r: number;
}

export function renderEXCRTBoard(
  equations: EXCRTEquation[],
  mergedCount: number,
  currM: number,
  currR: number,
  stage: string = '合并中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🧩 扩展中国剩余定理 (EXCRT) 不互质同余合并沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前合并总模数 LCM</div>
          <div style="font-size: 15px; font-weight: 800; color: #b45309; margin-top: 4px;">M = ${currM}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">当前统一通解: x &equiv; ${currR} (mod ${currM})</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">合并进度</div>
          <div style="font-size: 15px; font-weight: 800; color: #0284c7; margin-top: 4px;">${mergedCount} / ${equations.length} 个方程</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">利用 exgcd 每次合并 2 个同余式</div>
        </div>
      </div>

      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${equations.map((eq, i) => {
          const isMerged = i < mergedCount;
          return `
            <span style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; ${
              isMerged
                ? 'background: #f0fdf4; border: 1px solid #86efac; color: #166534;'
                : 'background: #f8fafc; border: 1px solid #cbd5e1; color: #64748b;'
            }">
              #${i + 1}: x &equiv; ${eq.r} (mod ${eq.m}) ${isMerged ? '✓' : ''}
            </span>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 扩展 BSGS 沙盘
// ----------------------------------------------------
export function renderEXBSGSBoard(
  a: number,
  b: number,
  p: number,
  reducedA: number,
  reducedB: number,
  reducedP: number,
  d: number,
  cnt: number,
  ans?: number,
  stage: string = '降模消除'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔍 扩展 BSGS (EXBSGS) 离散对数公因数消去沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0369a1; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">原始方程</div>
          <div style="font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 4px;">${a}<sup>x</sup> &equiv; ${b} (mod ${p})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">提取公因子次数: cnt = ${cnt}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">互质化新方程</div>
          <div style="font-size: 14px; font-weight: 800; color: #0284c7; margin-top: 4px;">${d} &middot; ${reducedA}<sup>x-${cnt}</sup> &equiv; ${reducedB} (mod ${reducedP})</div>
          <div style="font-size: 11px; color: #15803d; margin-top: 2px;">满足 gcd(${reducedA}, ${reducedP}) = 1</div>
        </div>
      </div>

      ${ans !== undefined ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">最小非负整数解 x:</span>
          <span style="font-size: 16px; font-weight: 800; color: ${ans === -1 ? '#dc2626' : '#059669'}; padding: 2px 12px; background: ${ans === -1 ? '#fef2f2' : '#ecfdf5'}; border-radius: 6px;">
            ${ans === -1 ? '无解 (No Solution)' : `x = ${ans}`}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 4. 多项式除法与取模沙盘
// ----------------------------------------------------
export function renderPolyDivBoard(
  polyA: number[],
  polyB: number[],
  polyQ?: number[],
  polyR?: number[],
  stage: string = '系数翻转'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>➗ 多项式除法与取模 (Polynomial Division) 翻转沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #f3e8ff; color: #7e22ce; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">被除式 A(x) [deg=${polyA.length - 1}]</div>
          <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-top: 4px;">[${polyA.join(', ')}]</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">除式 B(x) [deg=${polyB.length - 1}]</div>
          <div style="font-size: 12px; font-weight: 700; color: #7c3aed; margin-top: 4px;">[${polyB.join(', ')}]</div>
        </div>
      </div>

      ${polyQ ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 4px;">商式 Q(x) [deg=${polyQ.length - 1}]:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${polyQ.map((v, i) => `
              <span style="padding: 3px 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; font-size: 11px; font-weight: 700; color: #047857;">
                q[${i}] = ${v}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${polyR ? `
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 4px;">余式 R(x) = A - Q*B [deg=${polyR.length - 1}]:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${polyR.map((v, i) => `
              <span style="padding: 3px 8px; background: #fefce8; border: 1px solid #fde047; border-radius: 6px; font-size: 11px; font-weight: 700; color: #a16207;">
                r[${i}] = ${v}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 5. 多项式开方沙盘
// ----------------------------------------------------
export function renderPolySqrtBoard(
  polyA: number[],
  polyB: number[],
  targetDeg: number,
  currDeg: number,
  stage: string = '倍增开方'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>√ 多项式开方 (Polynomial Sqrt) 牛顿倍增沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前开方模项</div>
          <div style="font-size: 14px; font-weight: 800; color: #059669; margin-top: 4px;">mod x<sup>${currDeg}</sup> (目标 deg = ${targetDeg})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">牛顿迭代: B &equiv; B<sub>0</sub>/2 + A/(2B<sub>0</sub>)</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">二次收敛进度</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 4px;">${Math.min(100, Math.round((currDeg / targetDeg) * 100))}%</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">时间复杂度 T(n) = O(n log n)</div>
        </div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: 700; color: #047857; margin-bottom: 4px;">当前开方多项式 B(x) 系数:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${polyB.slice(0, currDeg).map((v, i) => `
            <span style="padding: 4px 10px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; font-size: 12px; font-weight: 800; color: #065f46;">
              b[${i}] = ${v}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 多项式 ln 与 exp 沙盘
// ----------------------------------------------------
export function renderPolyLnExpBoard(
  polyA: number[],
  polyLn?: number[],
  polyExp?: number[],
  stage: string = '微积分求导与积分'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📈 多项式对数与指数 (Ln & Exp) 微积分沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">原多项式 A(x) (a<sub>0</sub>=1):</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
        ${polyA.map((v, i) => `
          <span style="padding: 3px 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 700; color: #334155;">
            a[${i}] = ${v}
          </span>
        `).join('')}
      </div>

      ${polyLn ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">ln A(x) = &int; (A'(x) / A(x)) dx 系数:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${polyLn.map((v, i) => `
              <span style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11px; font-weight: 800; color: #1d4ed8;">
                ln[${i}] = ${v}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${polyExp ? `
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">exp A(x) = &sum; A(x)<sup>k</sup>/k! 系数:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${polyExp.map((v, i) => `
              <span style="padding: 3px 8px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; font-size: 11px; font-weight: 800; color: #6d28d9;">
                exp[${i}] = ${v}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
