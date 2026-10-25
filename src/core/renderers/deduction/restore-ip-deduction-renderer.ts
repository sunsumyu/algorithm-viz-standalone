/**
 * 复原 IP 地址 (Restore IP Addresses · LeetCode 93)
 * 全景推演树渲染策略 (RestoreIPDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RestoreIPDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'restore-ip';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'restore-ip' ||
      modelId === '93' ||
      modelId === 'leetcode-93' ||
      modelId === 'restore-ip-addresses'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 93. 复原 IP 地址 (Restore IP Addresses) · 全景推演树',
      badge: '四段切割固定深度 · 点号计数器 pointNum · 0~255 无前导零校验 · O(3^4)',
      descriptionHtml: `
        核心目标：给定一个只包含数字的字符串 <code>s</code>，用以表示一个 IP 地址，返回所有可能的有效 IP 地址。<br/>
        <strong>《代码随想录》核心教研范式——四段分割与段落合法性校验公理：</strong><br/>
        1. <strong>深度锚定点号数量（Point Count Anchor）</strong>：<br/>
        IPv4 地址恰好由 3 个点号分隔出 4 个数字段。维护 <code>pointNum</code>（已放入的小数点个数）。当 <code>pointNum == 3</code> 时，已切出前三段，直接校验最后第四段 <code>[startIndex, s.length() - 1]</code> 是否合法；合法即收割，随后无条件 <code>return</code>；<br/>
        2. <strong>段落合法性三大铁律（Segment Legitimacy Triad）</strong>：<br/>
        • <strong>长度限制</strong>：单段长度只能在 $1 \sim 3$ 位之间；<br/>
        • <strong>前导零禁忌</strong>：若长度大于 1，首字符不能为 <code>'0'</code>（如 <code>"01"</code>、<code>"001"</code> 非法）；<br/>
        • <strong>数值范围约束</strong>：转换为整数后数值必须在 <code>0 <= val <= 255</code> 之间；<br/>
        3. <strong>原地插入点号与回溯撤销</strong>：在 <code>i</code> 之后插入 <code>'.'</code>，递归后将其删除。
      `,
      initialStateText: `复原入口：restoreIpAddresses(s) ➔ backtracking(s, startIndex=0, pointNum=0)，res = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '三点定位第四段校验 (3 Points Terminal Check)',
        valuesStr: 'pointNum == 3 ➔ 校验最后一段 [startIndex, len-1]，若合法则加入结果集，执行 return',
      },
      {
        prefix: '└───',
        label: '字符串尺寸硬防线 (Length Guard)',
        valuesStr: 's.length() < 4 || s.length() > 12 ➔ 无法构成合法 IPv4，直接返回空列表 []',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 试探切分当前段并执行铁律校验 (Probe Segment & Validate)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">isValid Segment</span>',
      detailLines: [
        'for (int i = startIndex; i < s.length(); i++) {',
        '  if (!isValid(s, startIndex, i)) break; // 单段不合法（如>255或前导0），后续更长数字更不合法',
        '  s.insert(i + 1, "."); // 插入点号分隔',
      ],
      fillLine: '立规设限：切出 1~3 位数字并校验合法性，一旦越界 255 则直接 break 截断',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推进入下一段落 (Recurse with pointNum + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">pointNum + 1</span>',
      detailLines: [
        '  backtracking(s, i + 2, pointNum + 1); // 跨过刚插入的点号，下一段从 i + 2 开始',
      ],
      fillLine: '接力推进：点号计数加 1，跳跃点号所在物理槽位，进入下一个分段的求解',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退拔除点号 (Remove Point & Backtrack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">deleteCharAt()</span>',
      detailLines: [
        '  s.deleteCharAt(i + 1); // 拔除刚插入的点号',
        '}',
      ],
      fillLine: '抹除痕迹：拔掉刚刚插入的点号，还原字符串物理结构，尝试切分更长的单段',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '复原 IP 地址四段推演流 (Validate Segment ➔ Insert Point ➔ Recurse ➔ Delete Point)',
      subtitle: 'LeetCode 93 Restore IP Addresses Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有格式合法的完整 IPv4 地址列表',
      complexityStr: '时间复杂度: O(3^4) 常数级别固定 4 段决策 · 空间复杂度: O(1) 仅用栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
