import { describe, it, expect } from 'vitest';
import { injectBuyerWatermark, type AlgorithmChunkData } from './watermark-injector';
import { decodeFromZeroWidth } from './zero-width-watermark';

describe('WatermarkInjector (Ticket 15)', () => {
  it('注入买家水印后能从 problemHtml 中 100% 提取买家标识', () => {
    const chunk: AlgorithmChunkData = {
      id: 'dijkstra',
      problemHtml: '<p>给定一个带权有向图，计算从源点到其余各点的最短距离。</p>',
    };

    const injected = injectBuyerWatermark(chunk, 'VIP_BUYER_ALICE');
    expect(injected.problemHtml).toBeDefined();

    // 视觉文本依然可读
    expect(injected.problemHtml).toContain('给定一个带权有向图');

    // 隐形指纹提取
    const extracted = decodeFromZeroWidth(injected.problemHtml!);
    expect(extracted).toBe('VIP_BUYER_ALICE');
  });

  it('注入买家水印后能从 description 中提取', () => {
    const chunk: AlgorithmChunkData = {
      id: 'quick-sort',
      description: '快速排序使用分治法策略来把一个序列分为较小和较大的两个子序列。',
    };

    const injected = injectBuyerWatermark(chunk, 'VIP_BUYER_BOB');
    const extracted = decodeFromZeroWidth(injected.description!);
    expect(extracted).toBe('VIP_BUYER_BOB');
  });

  it('不同买家生成带有唯一指纹与坐标差异的切片', () => {
    const chunk: AlgorithmChunkData = {
      id: 'graph-topo',
      problemHtml: '拓扑排序。',
      nodes: [
        { x: 100, y: 150 },
        { x: 200, y: 250 },
      ],
    };

    const injectedA = injectBuyerWatermark(chunk, 'BUYER_AAA');
    const injectedB = injectBuyerWatermark(chunk, 'BUYER_BBB');

    // 提取的水印不同
    expect(decodeFromZeroWidth(injectedA.problemHtml!)).toBe('BUYER_AAA');
    expect(decodeFromZeroWidth(injectedB.problemHtml!)).toBe('BUYER_BBB');

    // 微扰坐标存在唯一差异
    expect(injectedA.nodes![0].x).not.toBe(injectedB.nodes![0].x);

    // 微扰幅度极小 (< 0.01px)，渲染肉眼无差别
    expect(Math.abs(injectedA.nodes![0].x - 100)).toBeLessThan(0.01);
  });
});
