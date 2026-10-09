import { describe, it, expect, vi } from 'vitest';
import { isValidMachineCodeFormat, getMachineCode } from './machine-uid';

describe('MachineUid Client Adapter (Ticket 04)', () => {
  it('isValidMachineCodeFormat should correctly validate format', () => {
    expect(isValidMachineCodeFormat('ABCD-0123-4567-89EF')).toBe(true);
    expect(isValidMachineCodeFormat('E804-62DB-86BA-555E')).toBe(true);

    // 小写不合法
    expect(isValidMachineCodeFormat('abcd-0123-4567-89ef')).toBe(false);
    // 字符超出十六进制
    expect(isValidMachineCodeFormat('GHIJ-0123-4567-89EF')).toBe(false);
    // 缺少短横线
    expect(isValidMachineCodeFormat('ABCD0123456789EF')).toBe(false);
    // 长度错误
    expect(isValidMachineCodeFormat('ABCD-0123-4567')).toBe(false);
    expect(isValidMachineCodeFormat('ABCD-0123-4567-89EFA')).toBe(false);
  });

  it('getMachineCode should fallback gracefully in non-Tauri headless environments', async () => {
    const code = await getMachineCode();
    expect(isValidMachineCodeFormat(code)).toBe(true);
    expect(code).toBe('0000-0000-0000-0000');
  });
});
