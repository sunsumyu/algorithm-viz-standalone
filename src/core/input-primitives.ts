/**
 * InputPrimitives (声明式输入解析原语深模块)
 *
 * 收敛全库渲染器 generateSteps 里复制的 split / parseInt / filter 解析样板
 * （曾扩散至 90 个文件，且空值回退语义各自漂移）。
 *
 * 统一契约：
 * - 100% 零 DOM 依赖（纯函数），可无头表驱动测试；
 * - 分隔符统一容忍半角逗号 / 全角逗号 / 任意空白；
 * - 「列表类」解析结果为空时回退 fallback（与历史 parseArray 语义一致）；
 * - 「树层序」解析区分「解析成功但为空树」与「解析失败」——空树 [] 是合法输入；
 * - fallback 同时接受字面量字符串（原样按分隔符解析）或已解析的值。
 */

const SEPARATOR = /[,，\s]+/;

function coerceRaw(raw: unknown): string {
  return raw == null ? '' : String(raw);
}

/** 解析数字列表；解析结果为空时回退 fallback（字符串 fallback 会按同一分隔符解析） */
export function parseNumberList(raw: unknown, fallback: string | number[]): number[] {
  const nums = coerceRaw(raw)
    .split(SEPARATOR)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
  if (nums.length > 0) return nums;
  if (typeof fallback === 'string') return parseNumberList(fallback, []);
  return fallback;
}

/** 解析单个整数；非法时回退 fallback */
export function parseNumber(raw: unknown, fallback: number): number {
  const n = parseInt(coerceRaw(raw).trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** 解析文本；空白时回退 fallback */
export function parseText(raw: unknown, fallback: string): string {
  const text = coerceRaw(raw).trim();
  return text.length > 0 ? text : fallback;
}

/**
 * 解析树层序数组（数字或 null）。
 * 注意：`[]` 是合法的空树，不触发回退；仅解析失败（非数组）时回退。
 */
export function parseTreeArray(raw: unknown, fallback: (number | null)[]): (number | null)[] {
  const text = coerceRaw(raw).trim();
  if (text.length === 0) return fallback;
  try {
    const parsed: unknown = JSON.parse(text);
    // JSON 合法但不是数组：视为非法输入，直接回退（不做词法兜底）
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((v) => (v === null ? null : Number.isFinite(Number(v)) ? Number(v) : null));
  } catch {
    // JSON 非法：按逗号/空白 + 'null' 词法兜底
    const tokens = text.split(SEPARATOR);
    return tokens.map((t) => (t === 'null' || t === '' ? null : Number.isFinite(Number(t)) ? Number(t) : null));
  }
}

/** 解析 [start, end] 区间对列表；JSON 失败或结构非法时回退 fallback */
export function parseIntervals(raw: unknown, fallback: [number, number][]): [number, number][] {
  const text = coerceRaw(raw).trim();
  if (text.length === 0) return fallback;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    const intervals: [number, number][] = [];
    for (const item of parsed) {
      if (Array.isArray(item) && item.length >= 2 && Number.isFinite(Number(item[0])) && Number.isFinite(Number(item[1]))) {
        intervals.push([Number(item[0]), Number(item[1])]);
      }
    }
    return intervals.length > 0 ? intervals : fallback;
  } catch {
    return fallback;
  }
}

/** 解析指令序列（如栈/队列操作串），按逗号/空白/换行切分并去空 */
export function parseCommandList(raw: unknown): string[] {
  return coerceRaw(raw)
    .split(/[,，\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
