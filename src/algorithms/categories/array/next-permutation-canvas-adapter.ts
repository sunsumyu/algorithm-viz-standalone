/**
 * 下一个排列 — 画布适配器
 * 负责排列元素卡片、拐点与交换项高亮、字典序三步准则展示
 */

import { NextPermutationStep } from './next-permutation-step-compiler';

export function getNextPermutationCanvasHtml(step: NextPermutationStep): string {
  const { nums, i, j, phase } = step;

  const cards = nums
    .map((val, idx) => {
      const isI = idx === i && phase !== 'finish';
      const isJ = idx === j && phase !== 'finish';
      const inSuffix = i >= 0 && idx > i && phase !== 'finish';

      let bg = '#ffffff';
      let border = '2px solid #cbd5e1';
      let color = '#1e293b';
      let shadow = '0 1px 3px rgba(0,0,0,0.05)';

      if (isI) {
        bg = '#fef3c7';
        border = '2px solid #f59e0b';
        color = '#b45309';
        shadow = '0 4px 12px rgba(245, 158, 11, 0.25)';
      } else if (isJ) {
        bg = '#fce7f3';
        border = '2px solid #ec4899';
        color = '#be185d';
        shadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
      } else if (inSuffix) {
        bg = '#f0f9ff';
        border = '2px dashed #38bdf8';
        color = '#0369a1';
      }

      let tag = '&nbsp;';
      if (isI) tag = '<span style="color:#b45309;font-weight:700;font-size:11px;">拐点 i</span>';
      else if (isJ) tag = '<span style="color:#be185d;font-weight:700;font-size:11px;">目标 j</span>';
      else if (inSuffix) tag = '<span style="color:#0284c7;font-size:10px;font-weight:600;">降序后缀</span>';

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 56px; margin: 0 6px;">
        <div style="font-size: 11px; height: 18px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">${tag}</div>
        <div style="
          width: 100%;
          height: 56px;
          background: ${bg};
          border: ${border};
          border-radius: 12px;
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 800;
          font-size: 22px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 600;">[ ${idx} ]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
          <div style="font-size: 13px; color: #334155; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>🔢 全排列序列与字典序三步定位</span>
          </div>
          <div style="display: flex; gap: 14px; font-size: 11px; font-weight: 600;">
            <span style="color: #b45309; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> 降序拐点 i</span>
            <span style="color: #be185d; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span> 交换项 j</span>
            <span style="color: #0284c7; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span> 待反转降序后缀</span>
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 100px;">
          ${cards}
        </div>
      </div>
    </div>
  `;
}

export function renderNextPermutationCanvas(container: HTMLElement, step: NextPermutationStep): void {
  container.innerHTML = getNextPermutationCanvasHtml(step);
}

export function renderNextPermutationAuxiliary(container: HTMLElement, step: NextPermutationStep): void {
  const { i, j, phase, nums } = step;
  const isFinish = phase === 'finish';

  let ruleState = '';
  if (phase === 'init') {
    ruleState = '准备从右向左扫描相邻元素，寻找首个满足 nums[i] < nums[i+1] 的升序突变点。';
  } else if (phase === 'find-i') {
    ruleState = i >= 0
      ? `已锁定拐点 i = ${i}（值为 ${nums[i]}），其右侧 [${i + 1} .. ${nums.length - 1}] 严格单调递减。`
      : '全数组严格降序排列（已是最大字典序），无需交换，直接反转全数组即可获得最小升序排列。';
  } else if (phase === 'find-j') {
    ruleState = `在降序后缀中从右向左找到首个大于 nums[${i}] (${nums[i]}) 的数：j = ${j} (值为 ${nums[j]})。`;
  } else if (phase === 'swap') {
    ruleState = `已交换 nums[${i}] 与 nums[${j}]。此时后缀区间仍保持严格降序！`;
  } else if (phase === 'reverse') {
    ruleState = `将降序后缀 [${i + 1} .. ${nums.length - 1}] 原地翻转为升序，使得字典序增幅达到最小。`;
  } else if (isFinish) {
    ruleState = `✅ 构造完成！当前排列 [${nums.join(', ')}] 是严格意义上的下一个最小更大字典序。`;
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: #1e293b;">💡 字典序三步法则与当前决策</span>
          <span style="font-size: 10px; font-weight: 700; color: ${isFinish ? '#059669' : '#0284c7'}; background: ${isFinish ? '#ecfdf5' : '#f0f9ff'}; padding: 2px 8px; border-radius: 999px; border: 1px solid ${isFinish ? '#a7f3d0' : '#bae6fd'};">
            ${isFinish ? '已就绪' : `阶段: ${phase}`}
          </span>
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.6; font-weight: 500;">
          ${ruleState}
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #64748b; line-height: 1.6;">
        <span style="font-weight: 700; color: #475569;">📌 核心公理：</span>
        降序后缀已无增大可能。交换最小更大元素后，反转后缀使其由降序变升序，即保证在比原排列大的前提下字典序最小。
      </div>
    </div>
  `;
}
