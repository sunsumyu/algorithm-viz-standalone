import { RandomGenStep } from './random-generator-035-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderRandomGenCanvas(container: HTMLElement, step: RandomGenStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">双掷试验 (Trial A & B)</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            step.pairStatus === 'reject' ? '#f43f5e' : '#34d399'
          }; margin-top: 4px;">
            投掷 A: [ ${step.trialA} ] · 投掷 B: [ ${step.trialB} ]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">二进制位装配流水线 (3 Bits)</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            [ ${step.assembledBits.map((b) => `<span style="color: #fbbf24;">${b}</span>`).join(' , ') || '等待装配'} ]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">最终生成 [1, 7] 目标数值</div>
          <div style="font-size: 20px; font-weight: bold; color: #a855f7; margin-top: 4px;">
            ${step.finalResult !== null ? `🎉 输出值: ${step.finalResult}` : '生成中...'}
          </div>
        </div>
      </div>

      <!-- 核心沙盘：对称概率消除天平与直方图 -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 16px;">
        <!-- 对称概率天平沙盘 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
            冯·诺依曼偏置对称消除天平 (Von Neumann Bias Correction)
          </div>

          <div style="display: flex; justify-content: space-around; align-items: center; padding: 16px 0;">
            <!-- 左盘: (0, 1) 对应 0 -->
            <div style="text-align: center; background: rgba(52, 211, 153, 0.1); border: 1px solid ${step.pairStatus === 'accept_0' ? '#34d399' : 'rgba(52, 211, 153, 0.3)'}; border-radius: 8px; padding: 12px 18px;">
              <div style="font-size: 12px; color: #34d399; font-weight: 600;">事件组合 (0, 1)</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff; margin: 6px 0;">产出 0</div>
              <div style="font-size: 11px; color: #94a3b8;">概率: p · (1-p)</div>
            </div>

            <!-- 天平支点 -->
            <div style="font-size: 24px; color: #fbbf24;">⚖️</div>

            <!-- 右盘: (1, 0) 对应 1 -->
            <div style="text-align: center; background: rgba(56, 189, 248, 0.1); border: 1px solid ${step.pairStatus === 'accept_1' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}; border-radius: 8px; padding: 12px 18px;">
              <div style="font-size: 12px; color: #38bdf8; font-weight: 600;">事件组合 (1, 0)</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff; margin: 6px 0;">产出 1</div>
              <div style="font-size: 11px; color: #94a3b8;">概率: (1-p) · p</div>
            </div>
          </div>

          <div style="font-size: 11px; text-align: center; color: #94a3b8;">
            数学定理：无论 $p$ 为多少，$p(1-p)$ 恒等于 $(1-p)p$！两事件发生概率严格相等！
          </div>
        </div>

        <!-- 频次直方图 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
            目标值 [1, 7] 生成分布看板
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 100px; padding: 0 10px; border-bottom: 1px solid #475569;">
            ${[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const count = step.frequencyDistribution[num] || 0;
              const height = count > 0 ? Math.min(80, count * 30 + 20) : 4;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <div style="font-size: 9px; color: #cbd5e1;">${count}次</div>
                  <div style="width: 22px; height: ${height}px; background: #0284c7; border-radius: 3px 3px 0 0;"></div>
                  <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">${num}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '冯·诺依曼随机转化公理',
        '任何具有独立同分布性质但概率偏置的随机源，通过做两次独立试验并比对：(0,1) 与 (1,0) 出现概率必定严格恒等。以此构建等概率 01 发生器，并通过二进制按位拼装即可等概率生成任意区间的整数！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
