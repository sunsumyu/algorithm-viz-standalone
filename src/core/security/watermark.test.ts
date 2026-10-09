import { describe, it, expect } from 'vitest';
import {
  encodeWatermark,
  decodeWatermark,
  injectWatermarkIntoText,
  ZW_ZERO,
  ZW_ONE,
  ZW_DELIM,
} from './watermark';

describe('ZeroWidthWatermark TS Symmetric Module (Ticket 14 & 15)', () => {
  it('应当能对不同格式买家 ID 执行确定性闭环编解码', () => {
    const testCases = [
      'VIP_USER_8899',
      'ORDER_20261009_12345',
      'ALICE_LEE',
      '中文买家_测试订单',
    ];

    for (const uid of testCases) {
      const encoded = encodeWatermark(uid);
      expect(encoded.startsWith(ZW_DELIM)).toBe(true);
      expect(encoded.endsWith(ZW_DELIM)).toBe(true);

      for (const char of encoded) {
        expect([ZW_ZERO, ZW_ONE, ZW_DELIM]).toContain(char);
      }

      const decoded = decodeWatermark(encoded);
      expect(decoded).toBe(uid);
    }
  });

  it('注入自然文本后，肉眼完全不可感知且能 100% 还原', () => {
    const original = '动态规划包含最优子结构与重叠子问题两个核心要素。状态转移方程是解题关键。';
    const buyer = 'ORDER_VIP_999';

    const injected = injectWatermarkIntoText(original, buyer);

    // 看起来包含原始文本
    expect(injected).toContain('动态规划包含最优子结构与重叠子问题两个核心要素。');

    // 提取水印还原买家
    const extracted = decodeWatermark(injected);
    expect(extracted).toBe(buyer);
  });

  it('Ticket 16: 版权泄露取证工具能正确溯源买家身份', async () => {
    const { investigateContent } = await import('../../../scripts/leak-investigator');
    const stolenText = injectWatermarkIntoText(
      '红黑树的五大性质确保了最长路径不超过最短路径的两倍。',
      'PIRATE_BUYER_9988'
    );

    const report = investigateContent(stolenText, 'text');
    expect(report.hasWatermark).toBe(true);
    expect(report.buyerId).toBe('PIRATE_BUYER_9988');

    const cleanReport = investigateContent('没有任何水印的普通文本', 'text');
    expect(cleanReport.hasWatermark).toBe(false);
    expect(cleanReport.buyerId).toBeNull();
  });

  it('干净文本或受损水印安全返回 null，不崩溃', () => {
    expect(decodeWatermark('没有任何水印的普通算法文本')).toBeNull();
    expect(decodeWatermark('')).toBeNull();
    // 只有起始符没有结束符
    expect(decodeWatermark(`${ZW_DELIM}${ZW_ZERO}${ZW_ONE}`)).toBeNull();
  });
});
