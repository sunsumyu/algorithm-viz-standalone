/**
 * 代码语法高亮模块
 * 负责将单行代码文本转换为带 token class 的 HTML 字符串
 * 支持 Java / C++ / Python / JS/TS 关键字高亮，以及字符串、注释、数字、注解
 */

/** Java 关键字 */
const JAVA_KEYWORDS = [
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'volatile', 'transient',
  'class', 'interface', 'enum', 'extends', 'implements', 'package', 'import',
  'void', 'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String', 'var',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return',
  'new', 'this', 'super', 'null', 'true', 'false', 'throws', 'throw', 'try', 'catch', 'finally',
  'instanceof', 'default', 'native', 'strictfp', 'assert', 'goto', 'const',
];

/** C++ 关键字 */
const CPP_KEYWORDS = [
  'int', 'long', 'double', 'float', 'bool', 'char', 'short', 'void', 'auto', 'decltype',
  'class', 'struct', 'enum', 'union', 'namespace', 'template', 'typename',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return',
  'new', 'delete', 'this', 'virtual', 'override', 'final', 'const', 'static', 'public', 'private', 'protected',
  'true', 'false', 'nullptr', 'throw', 'try', 'catch', 'constexpr', 'noexcept',
  'include', 'define', 'using', 'typedef', 'operator', 'explicit', 'friend', 'inline',
];

/** 通用 JS/TS 关键字（兜底） */
const GENERAL_KEYWORDS = [
  'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'let', 'const', 'var', 'class', 'interface', 'type', 'enum', 'import', 'export', 'from', 'default',
  'true', 'false', 'null', 'undefined', 'void', 'new', 'this', 'super', 'extends', 'implements',
  'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'static', 'public', 'private', 'protected',
  'and', 'or', 'not', 'in', 'is', 'package', 'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short',
  'None', 'True', 'False', 'def', 'elif', 'lambda', 'pass', 'raise', 'print', 'range', 'len', 'list', 'dict', 'set',
];

function getKeywordsForLang(lang: string): string[] {
  const l = (lang || '').toLowerCase();
  if (l.startsWith('java')) return JAVA_KEYWORDS;
  if (l.startsWith('cpp') || l.startsWith('c++')) return CPP_KEYWORDS;
  return GENERAL_KEYWORDS;
}

/** 将文本转义为安全的 HTML 字符串 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 包裹为高亮 span（内容会被 HTML 转义）
 */
function wrap(cls: string, text: string): string {
  return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

/**
 * 对单行纯文本代码应用单趟词法扫描与 Token 语法高亮
 * 支持 keyword / type / string / comment / number / annotation / 任意行内局部聚焦 (focusTarget)
 *
 * 架构优势：
 * 1. 单向数据流：纯代码文本 -> 结构化 Token 分流 -> 一次性输出标准 HTML
 * 2. 连续胶囊聚焦：整段子表达式 (如 dp[i - 1][j]) 高亮为一个统一平滑的发光外框，杜绝碎块化
 * 3. 绝对免疫 HTML 属性破坏：在进入 HTML 生成前已在源码字符偏移量层判定聚焦，绝不二次字符串替换已生成的 HTML
 */
export function highlightTokens(
  line: string,
  lang: string = 'java',
  focusTarget?: string
): string {
  const keywords = new Set(getKeywordsForLang(lang));
  let out = '';
  let i = 0;
  const n = line.length;

  // 计算聚焦子串在源码中的绝对字符区间 [focusStart, focusEnd)
  let focusStart = -1;
  let focusEnd = -1;
  if (focusTarget && focusTarget.trim().length > 0) {
    const target = focusTarget.trim();
    // 优先匹配靠近末尾或者精确匹配的目标（如 : 0）
    focusStart = line.lastIndexOf(target);
    if (focusStart === -1) {
      focusStart = line.indexOf(target);
    }
    if (focusStart !== -1) {
      focusEnd = focusStart + target.length;
    }
  }

  let isInsideFocusContainer = false;

  const ensureFocusOpen = (currIdx: number) => {
    if (focusStart !== -1 && currIdx >= focusStart && currIdx < focusEnd && !isInsideFocusContainer) {
      out += '<span class="inline-token-focus">';
      isInsideFocusContainer = true;
    }
  };

  const ensureFocusClose = (currIdx: number) => {
    if (isInsideFocusContainer && currIdx >= focusEnd) {
      out += '</span>';
      isInsideFocusContainer = false;
    }
  };

  while (i < n) {
    ensureFocusClose(i);
    ensureFocusOpen(i);

    const ch = line[i];
    const rest = line.slice(i);

    // 行注释：// 或 #（Python）直到行尾
    if (rest.startsWith('//') || (lang !== 'java' && lang !== 'cpp' && ch === '#')) {
      out += wrap('algo-code-token-comment text-slate-500', rest);
      i = n;
      break;
    }

    // 字符串字面量 " ' `
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < n) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === ch) { j++; break; }
        j++;
      }
      out += wrap('algo-code-token-string text-green-400', line.slice(i, j));
      i = j;
      continue;
    }

    // Java 注解 @Override
    if (ch === '@' && lang === 'java' && /[A-Za-z]/.test(line[i + 1] || '')) {
      let j = i + 1;
      while (j < n && /\w/.test(line[j])) j++;
      out += wrap('algo-code-token-annotation text-amber-400', line.slice(i, j));
      i = j;
      continue;
    }

    // 数字字面量
    if (/[0-9]/.test(ch)) {
      const numMatch = rest.match(/^\d+(?:\.\d+)?[lLfFdD]?/);
      if (numMatch) {
        const tokenStr = numMatch[0];
        out += wrap('algo-code-token-number text-amber-300 font-bold', tokenStr);
        i += tokenStr.length;
        continue;
      }
    }

    // 标识符：关键字 / 类型名 / 普通标识符
    if (/[A-Za-z_$]/.test(ch)) {
      const idMatch = rest.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
      const word = idMatch![0];
      const j = i + word.length;

      if (keywords.has(word)) {
        out += wrap('algo-code-token-keyword text-purple-400 font-semibold', word);
      } else if (/^[A-Z]/.test(word)) {
        const after = line[j];
        if (after !== '(') {
          out += wrap('algo-code-token-type text-yellow-300', word);
        } else {
          out += escapeHtml(word);
        }
      } else {
        out += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 其它字符（运算符 / 标点 / 空白）
    out += escapeHtml(ch);
    i++;
  }

  ensureFocusClose(n);

  return out;
}
