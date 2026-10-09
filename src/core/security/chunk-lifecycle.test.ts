// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchAlgorithmChunk, releaseAlgorithmChunk } from './chunk-lifecycle';
import * as licenseVerifier from './license-verifier';

describe('Algorithm Chunk Zeroize Lifecycle (Ticket 11)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('未提供 algorithmId 抛出参数错误', async () => {
    await expect(fetchAlgorithmChunk('')).rejects.toThrow('算法 ID 不能为空');
    await expect(fetchAlgorithmChunk('   ')).rejects.toThrow('算法 ID 不能为空');
  });

  it('本地未激活时索取切片抛出未激活错误', async () => {
    await expect(fetchAlgorithmChunk('dijkstra')).rejects.toThrow('软件尚未激活');
  });

  it('在 Web 模拟模式下持有合法激活码时正确返回降级数据', async () => {
    localStorage.setItem(licenseVerifier.LICENSE_STORAGE_KEY, 'MOCK_LICENSE.SIG');
    const result = await fetchAlgorithmChunk('dijkstra');
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('dijkstra');
    expect(parsed.status).toBe('mock_decrypted');
  });

  it('releaseAlgorithmChunk 在空参数或模拟环境下安全退出', async () => {
    expect(await releaseAlgorithmChunk('')).toBe(false);
    expect(await releaseAlgorithmChunk('dijkstra')).toBe(true);
  });
});
