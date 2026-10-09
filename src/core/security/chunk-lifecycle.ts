/**
 * 安全算法数据切片生命周期客户端适配器 (Algorithm Chunk Lifecycle Adapter)
 *
 * 职责：
 * 1. 挂接 Tauri IPC 指令，按需向原生后端索取单道算法解密切片；
 * 2. 算法切走/卸载时，通知原生后端对堆内存明文执行 Zeroize 彻底覆写清零；
 * 3. 在非桌面运行期或纯 Web 环境提供健壮的透明降级保障。
 */

import { getStoredLicense } from './license-verifier';

/**
 * 按需向后端安全请求解密单道算法切片
 */
export async function fetchAlgorithmChunk(algorithmId: string): Promise<string> {
  const trimmedId = algorithmId.trim();
  if (!trimmedId) {
    throw new Error('算法 ID 不能为空');
  }

  const licenseKey = getStoredLicense();
  if (!licenseKey) {
    throw new Error('软件尚未激活，无法加载加密算法资产');
  }

  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { invoke } = await import('@tauri-apps/api/core');
    try {
      return await invoke<string>('fetch_algorithm_chunk', {
        algorithmId: trimmedId,
        licenseKey,
      });
    } catch (err: unknown) {
      throw new Error(`加载算法资产 [${trimmedId}] 失败: ${String(err)}`);
    }
  }

  // 独立 Web 或测试环境模拟返回
  return JSON.stringify({ id: trimmedId, status: 'mock_decrypted' });
}

/**
 * 通知后端卸载并覆写清零特定算法切片的明文内存
 */
export async function releaseAlgorithmChunk(algorithmId: string): Promise<boolean> {
  const trimmedId = algorithmId.trim();
  if (!trimmedId) {
    return false;
  }

  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { invoke } = await import('@tauri-apps/api/core');
    try {
      return await invoke<boolean>('release_algorithm_chunk', {
        algorithmId: trimmedId,
      });
    } catch (err: unknown) {
      console.warn(`[Security] 释放算法切片 [${trimmedId}] 失败:`, err);
      return false;
    }
  }

  return true;
}
