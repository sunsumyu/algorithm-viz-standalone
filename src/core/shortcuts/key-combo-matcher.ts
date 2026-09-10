/**
 * 组合键解析、规范化与匹配引擎 (KeyComboMatcher)
 * 职责：
 * 1. 将任意格式的按键字符串转换为系统标准规范化格式 (e.g. "ctrl + k" -> "Ctrl+K")
 * 2. 将原生的 DOM KeyboardEvent 准确转换为规范化的组合键字符串
 * 3. 将组合键拆解为供 UI 渲染的物理键帽标签列表 (e.g. "Ctrl+K" -> ["Ctrl", "K"])
 */

const MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta'] as const;

/**
 * 规范化单个键名
 */
export function normalizeSingleKey(key: string): string {
  if (key === ' ' || key.toLowerCase() === 'space' || key.toLowerCase() === 'spacebar') {
    return 'Space';
  }

  const trimmed = key.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // 特殊键映射
  switch (lower) {
    case 'esc':
    case 'escape':
      return 'Escape';
    case 'return':
    case 'enter':
      return 'Enter';
    case 'arrowright':
    case 'right':
      return 'ArrowRight';
    case 'arrowleft':
    case 'left':
      return 'ArrowLeft';
    case 'arrowup':
    case 'up':
      return 'ArrowUp';
    case 'arrowdown':
    case 'down':
      return 'ArrowDown';
    case 'pageup':
      return 'PageUp';
    case 'pagedown':
      return 'PageDown';
    case 'bracketleft':
    case '[':
      return '[';
    case 'bracketright':
    case ']':
      return ']';
    case 'equal':
    case '=':
      return '=';
    case 'minus':
    case '-':
      return '-';
    case 'plus':
    case '+':
      return '+';
    case 'slash':
    case '/':
      return '/';
    case 'questionmark':
    case '?':
      return '?';
    case 'backspace':
      return 'Backspace';
    case 'tab':
      return 'Tab';
    case 'home':
      return 'Home';
    case 'end':
      return 'End';
    case 'ctrl':
    case 'control':
      return 'Ctrl';
    case 'alt':
    case 'option':
      return 'Alt';
    case 'shift':
      return 'Shift';
    case 'cmd':
    case 'command':
    case 'meta':
    case 'win':
      return 'Meta';
    default:
      // 单字母或单数字大写规范化
      if (trimmed.length === 1) {
        return trimmed.toUpperCase();
      }
      // 保持首字母大写
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
}

/**
 * 将任意组合键字符串规范化为标准格式 (e.g. "alt+shift+arrowleft" -> "Alt+Shift+ArrowLeft")
 */
export function normalizeKeyCombo(combo: string): string {
  if (!combo || typeof combo !== 'string') return '';

  const parts = combo
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return '';

  const modifiers: Set<string> = new Set();
  let mainKey = '';

  for (const part of parts) {
    const norm = normalizeSingleKey(part);
    if (norm === 'Ctrl' || norm === 'Alt' || norm === 'Shift' || norm === 'Meta') {
      modifiers.add(norm);
    } else {
      mainKey = norm;
    }
  }

  // 排序修饰键
  const orderedMods = MODIFIER_ORDER.filter((m) => modifiers.has(m));

  if (mainKey) {
    // 特殊情况：Shift + / 等价于 ?
    if (mainKey === '/' && modifiers.has('Shift')) {
      modifiers.delete('Shift');
      return normalizeKeyCombo([...modifiers, '?'].join('+'));
    }
    return [...orderedMods, mainKey].join('+');
  }

  return orderedMods.join('+');
}

/**
 * 将原生或模拟的 KeyboardEvent 转换为规范化组合键字符串
 */
export function eventToKeyCombo(e: {
  key?: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}): string {
  const rawKey = e.key || '';
  const modifiers: string[] = [];

  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.altKey) modifiers.push('Alt');
  if (e.shiftKey) modifiers.push('Shift');
  if (e.metaKey) modifiers.push('Meta');

  // 如果按下的是纯修饰键本身
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(rawKey)) {
    return normalizeKeyCombo(modifiers.join('+'));
  }

  let keyStr = rawKey;
  if (rawKey === ' ') {
    keyStr = 'Space';
  } else if (rawKey === '?') {
    keyStr = '?';
    // 当 key 本身就是 ? 时，移除多余的 Shift 以免生成 "Shift+?"
    const shiftIdx = modifiers.indexOf('Shift');
    if (shiftIdx !== -1) {
      modifiers.splice(shiftIdx, 1);
    }
  } else if (rawKey === '+') {
    keyStr = '+';
  } else if (rawKey === '_') {
    keyStr = '-';
  }

  const normKey = normalizeSingleKey(keyStr);
  return normalizeKeyCombo([...modifiers, normKey].join('+'));
}

/**
 * 将组合键拆解为供 UI 渲染的标签项
 * e.g. "Ctrl+K" -> ["Ctrl", "K"]
 * e.g. "Alt+ArrowLeft" -> ["Alt", "←"]
 */
export function formatKeyComboDisplay(combo: string): string[] {
  const normalized = normalizeKeyCombo(combo);
  if (!normalized) return [];

  return normalized.split('+').map((part) => {
    switch (part) {
      case 'ArrowRight':
        return '→';
      case 'ArrowLeft':
        return '←';
      case 'ArrowUp':
        return '↑';
      case 'ArrowDown':
        return '↓';
      case 'Space':
        return 'Space';
      case 'Escape':
        return 'Esc';
      case 'Meta':
        return '⌘ Cmd';
      default:
        return part;
    }
  });
}
