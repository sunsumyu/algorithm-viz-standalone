import { describe, it, expect } from 'vitest';
import { investigateText } from '../../../scripts/leak-investigator';
import { injectWatermarkIntoText } from './zero-width-watermark';

describe('LeakInvestigator CLI (Ticket 16)', () => {
  it('对含有买家水印的文本排查能够 100% 提取买家身份并给出成功报告', () => {
    const text = '动态规划包含最优子结构和重叠子问题两个核心要素。状态转移方程是解题关键。';
    const buyerId = 'VIP_BUYER_LEAKER_9988';
    const leakedSample = injectWatermarkIntoText(text, buyerId);

    const report = investigateText(leakedSample);
    expect(report.success).toBe(true);
    expect(report.buyerIdentity).toBe('VIP_BUYER_LEAKER_9988');
    expect(report.message).toContain('成功定位泄露源头');
    expect(report.scannedLength).toBe(leakedSample.length);
  });

  it('对无水印文本排查返回明确未检出诊断，不崩溃', () => {
    const cleanText = '这是一段完全干净的开源算法讲义。';
    const report = investigateText(cleanText);

    expect(report.success).toBe(false);
    expect(report.buyerIdentity).toBeNull();
    expect(report.message).toContain('未在输入文本中检测到有效零宽盲水印');
  });

  it('对空文本排查安全处理', () => {
    const report = investigateText('');
    expect(report.success).toBe(false);
    expect(report.buyerIdentity).toBeNull();
  });
});
