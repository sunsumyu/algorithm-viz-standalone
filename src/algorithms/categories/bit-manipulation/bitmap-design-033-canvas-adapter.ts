/**
 * Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design) - 视觉适配器
 * 左程云算法通关课入门篇 Class 033
 */

import { BitMapStep } from './bitmap-design-033-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderBitMapCanvas(container: HTMLElement, step: BitMapStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前操作目标</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.operation.toUpperCase()}( ${step.targetNum} )
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">定位参数 (Bucket & Offset)</div>
          <div style="font-size: 18px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            桶索引: [${step.bucketIndex}] · 偏移位: [${step.bitOffset}]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">位运算解析方程</div>
          <div style="font-size: 13px; font-family: monospace; color: #34d399; margin-top: 6px;">
            ${
              step.operation === 'add'
                ? `bits[${step.bucketIndex}] |= (1 << ${step.bitOffset})`
                : step.operation === 'remove'
                ? `bits[${step.bucketIndex}] &= ~(1 << ${step.bitOffset})`
                : step.operation === 'contains'
                ? `((bits[${step.bucketIndex}] >> ${step.bitOffset}) & 1) == ${step.queryResult ? '1 (存在)' : '0 (无)'}`
                : '初始化待命'
            }
          </div>
        </div>
      </div>

      <!-- 32位整型桶像素化展示沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          BitMap 内存状态 (每个色块代表 1 个 bit，绿色代表被置为 1)
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${step.buckets.map((bVal, bIdx) => {
            const isCurrentBucket = bIdx === step.bucketIndex;
            return `
              <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 6px; border: ${isCurrentBucket ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)'};">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                  <span style="color: ${isCurrentBucket ? '#38bdf8' : '#94a3b8'}; font-weight: 600;">
                    int 桶 [${bIdx}] (存储范围: ${bIdx * 32} ~ ${bIdx * 32 + 31})
                  </span>
                  <span style="font-family: monospace; color: #64748b;">十进制数值: ${bVal}</span>
                </div>

                <!-- 32 个 bit 排列 -->
                <div style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px;">
                  ${Array.from({ length: 32 }, (_, bit) => {
                    const isSet = ((bVal >> bit) & 1) === 1;
                    const isTargetBit = isCurrentBucket && bit === step.bitOffset;
                    const numRepresented = bIdx * 32 + bit;
                    return `
                      <div title="数字: ${numRepresented} (第 ${bit} 位)" style="
                        height: 28px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: ${isSet ? '#059669' : '#1e293b'};
                        color: ${isSet ? '#fff' : '#64748b'};
                        border-radius: 4px;
                        font-size: 10px;
                        font-family: monospace;
                        border: ${isTargetBit ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)'};
                        box-shadow: ${isTargetBit ? '0 0 8px #fbbf24' : 'none'};
                      ">
                        <span>${isSet ? '1' : '0'}</span>
                        <span style="font-size: 8px; opacity: 0.7;">#${bit}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '位图 (BitMap) 极限定理',
        '任何一个非负整数 num：num / 32 即 num >> 5 可唯一定位所属的整型桶；num % 32 即 num & 31 可唯一定位桶内的 bit 偏移。存储 40 亿个数字只需要 500MB 内存，常用于海量日志去重与布隆过滤器底层实现！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
