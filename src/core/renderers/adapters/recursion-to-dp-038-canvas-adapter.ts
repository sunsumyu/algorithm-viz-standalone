/**
 * Class 038 经典递归向记忆化搜索与动态规划初步转换 Canvas 适配器
 */

import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { type RecursionToDpStep } from './recursion-to-dp-038-step-compiler';

export function renderRecursionToDpCanvas(container: HTMLElement, step: RecursionToDpStep): void {
  const stageLabels = {
    brute: '阶段 1: 暴力递归',
    memo: '阶段 2: 记忆化搜索',
    tab: '阶段 3: 严格表依赖',
    rolling: '阶段 4: 空间压缩优化',
  };

  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 演化阶段指示器 -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        ${(['brute', 'memo', 'tab', 'rolling'] as const).map(s => `
          <div style="
            flex: 1;
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            background: ${step.stage === s ? '#0284c7' : 'rgba(30, 41, 59, 0.6)'};
            color: ${step.stage === s ? '#fff' : '#94a3b8'};
            border: ${step.stage === s ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)'};
          ">
            ${stageLabels[s]}
          </div>
        `).join('')}
      </div>

      <!-- 核心指标面板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前焦点子问题</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            f( ${step.currentN} )
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">${step.stage === 'memo' ? '缓存命中次数' : '调用/迭代开销'}</div>
          <div style="font-size: 20px; font-weight: bold; color: ${step.stage === 'memo' ? '#34d399' : '#fbbf24'}; margin-top: 4px;">
            ${step.stage === 'memo' ? `命中 ${step.cacheHits} 次` : `累计 ${step.callCount || step.currentN} 次`}
          </div>
        </div>
      </div>

      <!-- 主沙盘展示区 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        ${
          step.stage === 'tab'
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">严格 DP 状态网格 (自底向上从左至右)</div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0;">
              ${step.dpTable.map((val, idx) => `
                <div style="
                  min-width: 52px;
                  height: 60px;
                  background: ${idx === step.currentN ? '#0369a1' : val > 0 ? '#1e293b' : 'rgba(30,41,59,0.3)'};
                  border: ${idx === step.currentN ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: ${idx === step.currentN ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
                ">
                  <div style="font-size: 10px; color: #94a3b8;">dp[${idx}]</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fff; margin-top: 2px;">${val}</div>
                </div>
              `).join('')}
            </div>
          `
            : step.stage === 'rolling' && step.rollingVars
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">空间压缩双变量滚动寄存器 (空间严格 O(1))</div>
            <div style="display: flex; gap: 24px; align-items: center; justify-content: center; padding: 20px 0;">
              <div style="text-align: center; background: rgba(30, 41, 59, 0.7); border: 1px solid #475569; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #94a3b8;">寄存器 prev2</div>
                <div style="font-size: 24px; font-weight: bold; color: #fbbf24; margin-top: 4px;">${step.rollingVars.prev2}</div>
              </div>
              <div style="font-size: 20px; color: #94a3b8;">+</div>
              <div style="text-align: center; background: rgba(30, 41, 59, 0.7); border: 1px solid #475569; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #94a3b8;">寄存器 prev1</div>
                <div style="font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 4px;">${step.rollingVars.prev1}</div>
              </div>
              <div style="font-size: 20px; color: #94a3b8;">=</div>
              <div style="text-align: center; background: rgba(14, 165, 233, 0.2); border: 2px solid #0284c7; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #38bdf8;">当前值 cur</div>
                <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-top: 4px;">${step.rollingVars.cur}</div>
              </div>
            </div>
          `
            : `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
              ${step.stage === 'memo' ? '记忆化备忘录 (Memo Table) 状态' : '暴力递归树探索状态'}
            </div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0;">
              ${step.memoTable.map((val, idx) => `
                <div style="
                  min-width: 52px;
                  height: 60px;
                  background: ${idx === step.currentN ? '#0369a1' : val !== null ? '#065f46' : 'rgba(30,41,59,0.3)'};
                  border: ${idx === step.currentN ? '2px solid #38bdf8' : val !== null ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                ">
                  <div style="font-size: 10px; color: #94a3b8;">memo[${idx}]</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fff; margin-top: 2px;">
                    ${val !== null ? val : '空'}
                  </div>
                </div>
              `).join('')}
            </div>
          `
        }
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '动态规划四阶段演化哲学',
        '暴力递归找到重叠子问题 ➔ 备忘录缓存消除重复展开 ➔ 自底向上整理严格依赖顺序 ➔ 丢弃无用历史达成空间极限压缩。这就是动态规划设计的大一统标准演进路径！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
