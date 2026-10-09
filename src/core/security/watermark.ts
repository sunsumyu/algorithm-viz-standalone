/**
 * 零宽字符 (Zero-Width) 隐形盲水印双向编解码器与注入器 (TypeScript 对称实现)
 *
 * 职责：
 * 1. 将买家身份 (如订单号/用户ID) 编码为肉眼不可见 Unicode 零宽字符；
 * 2. 织入文本或代码段落，渲染完全透明无感；
 * 3. 从任何被复制、导出或外部泄露的文本中 100% 精确提取买家身份；
 * 4. 供前端渲染层及开发者 CLI 离线取证工具使用。
 */

export const ZW_ZERO = '\u200B';  // 零宽空格 (Zero-Width Space) -> 0
export const ZW_ONE = '\u200C';   // 零宽非连字符 (Zero-Width Non-Joiner) -> 1
export const ZW_DELIM = '\u200D'; // 零宽连字符 (Zero-Width Joiner) -> 起止定界符

/**
 * 将买家身份编码为不可见的零宽字符序列
 */
export function encodeWatermark(userId: string): string {
  if (!userId) return '';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(userId.trim());

  let out = ZW_DELIM;
  for (const b of bytes) {
    for (let shift = 7; shift >= 0; shift--) {
      const bit = (b >> shift) & 1;
      out += bit === 1 ? ZW_ONE : ZW_ZERO;
    }
  }
  out += ZW_DELIM;
  return out;
}

/**
 * 从文本中扫描并提取盲水印买家身份
 */
export function decodeWatermark(text: string): string | null {
  if (!text) return null;

  const chars = Array.from(text);
  let i = 0;

  while (i < chars.length) {
    if (chars[i] === ZW_DELIM) {
      const bits: number[] = [];
      let j = i + 1;
      let foundEnd = false;

      while (j < chars.length) {
        const c = chars[j];
        if (c === ZW_DELIM) {
          foundEnd = true;
          break;
        } else if (c === ZW_ZERO) {
          bits.push(0);
        } else if (c === ZW_ONE) {
          bits.push(1);
        }
        j++;
      }

      if (foundEnd && bits.length > 0 && bits.length % 8 === 0) {
        const bytes = new Uint8Array(bits.length / 8);
        for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
          let val = 0;
          for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
            val = (val << 1) | bits[byteIdx * 8 + bitIdx];
          }
          bytes[byteIdx] = val;
        }

        try {
          const decoder = new TextDecoder('utf-8', { fatal: true });
          return decoder.decode(bytes);
        } catch {
          // 不是合法 UTF-8 编码串，继续向后扫描
        }
      }

      i = j;
    }
    i++;
  }

  return null;
}

/**
 * 将水印隐形织入自然文本标点符号或句尾
 */
export function injectWatermarkIntoText(text: string, userId: string): string {
  const watermark = encodeWatermark(userId);
  if (!text) return watermark;

  const puncts = ['。', '！', '？', '.', '!', '?', '\n'];
  for (let i = 0; i < text.length; i++) {
    if (puncts.includes(text[i])) {
      return text.slice(0, i + 1) + watermark + text.slice(i + 1);
    }
  }

  return text + watermark;
}
