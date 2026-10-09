import { describe, it, expect } from 'vitest';
import {
  encodeToZeroWidth,
  decodeFromZeroWidth,
  injectWatermarkIntoText,
  stripZeroWidthWatermark,
  ZW_ZERO,
  ZW_ONE,
  ZW_START,
  ZW_END,
} from './zero-width-watermark';

describe('ZeroWidthWatermark (Ticket 14)', () => {
  it('编码与解码纯 ASCII 用户 ID 能够 100% 精确还原', () => {
    const userId = 'VIP_USER_8899_TAOBAO_ORDER_123456';
    const watermark = encodeToZeroWidth(userId);

    // 验证生成的字符串完全由零宽字符与哨兵构成
    expect(watermark.startsWith(ZW_START)).toBe(true);
    expect(watermark.endsWith(ZW_END)).toBe(true);

    const decoded = decodeFromZeroWidth(watermark);
    expect(decoded).toBe(userId);
  });

  it('编码与解码复杂 UTF-8 中文字符串', () => {
    const complexSecret = '买家:张三(UID:9527) - 授权期至2030年';
    const watermark = encodeToZeroWidth(complexSecret);
    const decoded = decodeFromZeroWidth(watermark);
    expect(decoded).toBe(complexSecret);
  });

  it('将水印织入中文讲义文本后，解码依然能精确还原', () => {
    const originalLecture = '单源最短路径算法的核心思想是贪心策略。每次选择未访问节点中距离最小者进行松弛。';
    const buyerId = 'CUSTOMER_9901';

    const injectedText = injectWatermarkIntoText(originalLecture, buyerId);

    // 视觉长度与语义保持完整
    expect(injectedText).toContain('单源最短路径算法的核心思想是贪心策略。');
    expect(injectedText).toContain('每次选择未访问节点中距离最小者进行松弛。');

    // 解码还原
    const decoded = decodeFromZeroWidth(injectedText);
    expect(decoded).toBe(buyerId);
  });

  it('空文本或无水印普通文本返回 null', () => {
    expect(decodeFromZeroWidth('')).toBeNull();
    expect(decodeFromZeroWidth('普通没有水印的算法讲义文本内容')).toBeNull();
    expect(decodeFromZeroWidth('Hello world without watermark')).toBeNull();
  });

  it('损坏或被篡改的水印能安全防御并返回 null，不发生崩溃', () => {
    const watermark = encodeToZeroWidth('SECRET');
    // 破坏中间的 1 个比特字符
    const broken = watermark.slice(0, 10) + 'X' + watermark.slice(11);
    expect(decodeFromZeroWidth(broken)).toBeNull();

    // 截断末尾哨兵
    const truncated = watermark.slice(0, -3);
    expect(decodeFromZeroWidth(truncated)).toBeNull();
  });

  it('stripZeroWidthWatermark 能彻底清除零宽字符', () => {
    const lecture = 'Dijkstra 最短路算法。';
    const injected = injectWatermarkIntoText(lecture, 'USER_SECRET');
    expect(injected.length).toBeGreaterThan(lecture.length);

    const stripped = stripZeroWidthWatermark(injected);
    expect(stripped).toBe(lecture);
    expect(decodeFromZeroWidth(stripped)).toBeNull();
  });
});
