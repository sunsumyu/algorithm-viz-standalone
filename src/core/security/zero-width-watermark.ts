/**
/**
 * 零宽字符 (Zero-Width) 隐形盲水印双向编解码器 (ZeroWidthWatermark)
 *
 * 职责：
 * 1. 将买家身份标识（如 user_id、订单号）编码为 Unicode 不可见零宽字符；
 * 2. 隐蔽织入正常文本（讲义、代码注释、题解），视觉渲染零感知、零乱码；
 * 3. 从任何泄露或复制出的文本中 100% 精确提取并还原买家身份。
 */

export const ZW_ZERO = '\u200B'; // 零宽空格 (0)
export const ZW_ONE = '\u200C';  // 零宽非连接符 (1)
export const ZW_START = '\u200D\uFEFF'; // 起始特征哨兵
export const ZW_END = '\uFEFF\u200D';   // 结束特征哨兵

/**
 * 将明文标识编码为不可见的零宽字符序列
 */
export function encodeToZeroWidth(secret: string): string {
  if (!secret) return '';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(secret);

  let bitString = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    for (let b = 7; b >= 0; b--) {
      bitString += (byte & (1 << b)) ? ZW_ONE : ZW_ZERO;
    }
  }

  return `${ZW_START}${bitString}${ZW_END}`;
}

/**
 * 从文本中提取并还原隐形零宽盲水印
 * 若未检测到有效水印或水印受损，安全返回 null
 */
export function decodeFromZeroWidth(text: string): string | null {
  if (!text) return null;

  const startIdx = text.indexOf(ZW_START);
  if (startIdx === -1) return null;

  const contentStart = startIdx + ZW_START.length;
  const endIdx = text.indexOf(ZW_END, contentStart);
  if (endIdx === -1) return null;

  const rawBits = text.slice(contentStart, endIdx);
  if (rawBits.length === 0 || rawBits.length % 8 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(rawBits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      const char = rawBits[i * 8 + b];
      if (char === ZW_ONE) {
        byteVal |= (1 << (7 - b));
      } else if (char !== ZW_ZERO) {
        // 含有非法非零宽字符，水印受损
        return null;
      }
    }
    bytes[i] = byteVal;
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    return null;
  }
}

/**
 * 将买家水印隐秘嵌入到目标正文（优先插入至首个中英文标点之后，若无标点则插入到正文末尾）
 */
export function injectWatermarkIntoText(targetText: string, secret: string): string {
  const watermark = encodeToZeroWidth(secret);
  if (!watermark) return targetText;

  // 匹配常见中英文标点（。，！？,.!?）
  const punctuationMatch = targetText.search(/[。，！？,.!?]/);
  if (punctuationMatch !== -1) {
    const insertPos = punctuationMatch + 1;
    return targetText.slice(0, insertPos) + watermark + targetText.slice(insertPos);
  }

  // 兜底插入至末尾
  return targetText + watermark;
}

/**
 * 剥除文本中包含的所有零宽字符与哨兵，返回干净的纯文本
 */
export function stripZeroWidthWatermark(text: string): string {
  return text
    .replace(new RegExp(ZW_START, 'g'), '')
    .replace(new RegExp(ZW_END, 'g'), '')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
}
