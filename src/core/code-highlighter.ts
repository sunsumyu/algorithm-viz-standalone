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

/** 包裹为高亮 span（内容会被 HTML 转义） */
function wrap(cls: string, text: string): string {
  return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

/**
 * 对单行代码应用简单的 token 高亮
 * 支持 keyword / type / string / comment / number / annotation
 *
 * 采用单遍词法扫描（lexer）逐 token 分类后再输出 HTML，
 * 避免多次正则替换互相污染已注入的标签（例如 `class="..."` 中的 class 被当成关键字）。
 */
export function highlightTokens(line: string, lang: string): string {
  const keywords = new Set(getKeywordsForLang(lang));
  let out = '';
  let i = 0;
  const n = line.length;

  while (i < n) {
    const ch = line[i];
    const rest = line.slice(i);

    // 行注释：// 或 #（Python）直到行尾
    if (rest.startsWith('//') || (lang !== 'java' && lang !== 'cpp' && ch === '#')) {
      out += wrap('algo-code-token-comment', rest);
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
      out += wrap('algo-code-token-string', line.slice(i, j));
      i = j;
      continue;
    }

    // Java 注解 @Override
    if (ch === '@' && lang === 'java' && /[A-Za-z]/.test(line[i + 1] || '')) {
      let j = i + 1;
      while (j < n && /\w/.test(line[j])) j++;
      out += wrap('algo-code-token-annotation', line.slice(i, j));
      i = j;
      continue;
    }

    // 数字字面量
    if (/[0-9]/.test(ch)) {
      const numMatch = rest.match(/^\d+(?:\.\d+)?[lLfFdD]?/);
      if (numMatch) {
        out += wrap('algo-code-token-number', numMatch[0]);
        i += numMatch[0].length;
        continue;
      }
    }

    // 标识符：关键字 / 类型名 / 普通
    if (/[A-Za-z_$]/.test(ch)) {
      const idMatch = rest.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
      const word = idMatch![0];
      if (keywords.has(word)) {
        out += wrap('algo-code-token-keyword', word);
      } else if (/^[A-Z]/.test(word)) {
        // 大写开头且非紧跟 ( 的标识符视为类型名
        const after = line[i + word.length];
        if (after !== '(') out += wrap('algo-code-token-type', word);
        else out += escapeHtml(word);
      } else {
        out += escapeHtml(word);
      }
      i += word.length;
      continue;
    }

    // 其它字符（运算符 / 标点 / 空白）直接转义输出
    out += escapeHtml(ch);
    i++;
  }

  return out;
}
