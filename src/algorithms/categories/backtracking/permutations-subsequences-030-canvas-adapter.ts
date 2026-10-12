/**
 * Class 030: 递归子序列与去重全排列画布适配器
 * 负责渲染沙盘与方案列表
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { PermStep } from './permutations-subsequences-030-step-compiler';

export function renderPermutationSandbox(step: PermStep): string {
  const pillsHtml = step.results.map((r, idx) => `
    <span style="display:inline-block; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:3px 8px; margin:2px; font-family:monospace; font-weight:700; font-size:12px; color:#0f172a;">
      <b style="color:#64748b;">${idx + 1}.</b> ${r}
    </span>
  `).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 递归当前状态看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前递归深度</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">第 ${step.depth} 层</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前累加 Path / 状态</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">"${step.currentPath}"</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">已收集结果数</div>
          <div style="font-size:16px; font-weight:800; color:#15803d;">${step.results.length} 种</div>
        </div>
      </div>

      <!-- 结果方案展示池 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:8px;">
          🎯 方案汇总列表 (${step.mode === 'subsequence' ? '全部子序列' : '去重全排列'})
        </div>
        <div style="max-height:160px; overflow-y:auto; padding:4px;">
          ${pillsHtml || '<span style="color:#94a3b8; font-style:italic;">等待生成...</span>'}
        </div>
      </div>

      ${renderFormulaCard(
        '子序列 vs 全排列递归哲学',
        '子序列：每个字符选/不选二叉决策树 (2^N)；全排列：每个位置与后续元素交换 (N!)，同层字符使用 visited 剪枝防重！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
