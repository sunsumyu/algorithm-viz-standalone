import { invoke } from '@tauri-apps/api/core';

/**
 * 跨硬件机器指纹解析客户端适配器 (MachineUid Client Adapter)
 *
 * 职责：
 * 1. 通过 Tauri IPC 调用原生后端的 get_machine_code 指令；
 * 2. 格式校验与规范化；
 * 3. 在非桌面宿主或测试环境中提供健壮容错。
 */

/**
 * 校验机器码格式是否为标准的 16 位大写十六进制短码 (XXXX-XXXX-XXXX-XXXX)
 */
export function isValidMachineCodeFormat(code: string): boolean {
  if (typeof code !== 'string') {
    return false;
  }
  return /^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(code);
}

/**
 * 获取当前设备的机器码
 * @returns 格式为 XXXX-XXXX-XXXX-XXXX 的大写机器码
 */
export async function getMachineCode(): Promise<string> {
  try {
    const code = await invoke<string>('get_machine_code');
    if (isValidMachineCodeFormat(code)) {
      return code;
    }
    return code.toUpperCase();
  } catch (_error) {
    // 非 Tauri 运行期（如独立浏览器预览或无头测试环境）返回标准格式兜底值
    return '0000-0000-0000-0000';
  }
}
