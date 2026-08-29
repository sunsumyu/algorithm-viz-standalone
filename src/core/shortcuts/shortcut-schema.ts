/**
 * 快捷键动作元数据与架构定义 (Shortcut Schema)
 * 遵循声明式配置与单一事实来源 (Single Source of Truth)
 */

export type ShortcutCategory = 'playback' | 'navigation' | 'terminal' | 'general';

export interface ShortcutCategoryInfo {
  id: ShortcutCategory;
  name: string;
  icon: string;
  description: string;
}

export const SHORTCUT_CATEGORIES: Record<ShortcutCategory, ShortcutCategoryInfo> = {
  playback: {
    id: 'playback',
    name: '播放控制',
    icon: '⏯️',
    description: '控制算法单步演练、自动播放、重置与倍速调节'
  },
  navigation: {
    id: 'navigation',
    name: '算法导航',
    icon: '🧭',
    description: '在大纲关卡链中前进/后退、呼出目录抽屉与快速搜索'
  },
  terminal: {
    id: 'terminal',
    name: '代码与终端',
    icon: '💻',
    description: '切换代码调试、题目描述、深度精讲看板、字号与语言'
  },
  general: {
    id: 'general',
    name: '全局辅助',
    icon: '⚙️',
    description: '呼出快捷键帮助指南、关闭弹窗与返回主页'
  }
};

export interface ShortcutActionDefinition {
  id: string;
  name: string;
  category: ShortcutCategory;
  defaultCombo: string;
  aliases?: string[];
  description: string;
  allowInInput?: boolean;
  icon?: string;
}

/**
 * 系统默认内置的 18 项核心快捷键动作注册表
 */
export const DEFAULT_SHORTCUT_DEFINITIONS: ShortcutActionDefinition[] = [
  // 1. 播放控制 (Playback)
  {
    id: 'playback.toggle',
    name: '播放 / 暂停',
    category: 'playback',
    defaultCombo: 'Space',
    aliases: ['k'],
    description: '切换当前算法演练的自动步进播放或暂停',
    icon: '⏯️'
  },
  {
    id: 'playback.stepForward',
    name: '单步前进',
    category: 'playback',
    defaultCombo: 'ArrowRight',
    aliases: ['n'],
    description: '向前执行一步算法演练状态转移',
    icon: '▶️'
  },
  {
    id: 'playback.stepBackward',
    name: '单步后退',
    category: 'playback',
    defaultCombo: 'ArrowLeft',
    aliases: ['p'],
    description: '向后回溯一步算法演练历史状态',
    icon: '◀️'
  },
  {
    id: 'playback.reset',
    name: '重置演练',
    category: 'playback',
    defaultCombo: 'r',
    description: '将当前算法演练重置到第 0 步初始状态',
    icon: '🔄'
  },
  {
    id: 'playback.speedCycle',
    name: '切换演练速度',
    category: 'playback',
    defaultCombo: 's',
    description: '循环切换演练播放倍速 (0.5x → 1.0x → 1.5x → 2.0x)',
    icon: '⚡'
  },

  // 2. 算法导航 (Navigation) - 强化上一题/下一题
  {
    id: 'navigation.prevAlgo',
    name: '上一道算法 (Previous)',
    category: 'navigation',
    defaultCombo: '[',
    aliases: ['Alt+ArrowLeft', 'PageUp', 'Alt+p'],
    description: '立即切换至算法大纲关卡链中的上一道算法题目',
    icon: '⏮️'
  },
  {
    id: 'navigation.nextAlgo',
    name: '下一道算法 (Next)',
    category: 'navigation',
    defaultCombo: ']',
    aliases: ['Alt+ArrowRight', 'PageDown', 'Alt+n'],
    description: '立即切换至算法大纲关卡链中的下一道算法题目',
    icon: '⏭️'
  },
  {
    id: 'navigation.toggleDrawer',
    name: '展开 / 收起算法大纲目录',
    category: 'navigation',
    defaultCombo: 'm',
    description: '快速展开或收起左侧 219+ 关卡大纲全景目录抽屉',
    icon: '📑'
  },
  {
    id: 'navigation.search',
    name: '全局算法搜索',
    category: 'navigation',
    defaultCombo: 'Ctrl+K',
    aliases: ['Cmd+K'],
    description: '快速唤起全局算法搜索框并自动聚焦输入',
    allowInInput: true,
    icon: '🔍'
  },
  {
    id: 'navigation.backHome',
    name: '返回算法大厅',
    category: 'navigation',
    defaultCombo: 'Alt+H',
    aliases: ['Home'],
    description: '退出当前题目演练，返回算法全部分类选择器主页',
    icon: '🏠'
  },

  // 3. 代码与终端 (Terminal)
  {
    id: 'terminal.tabCode',
    name: '代码调试看板',
    category: 'terminal',
    defaultCombo: '1',
    aliases: ['c'],
    description: '将右侧终端切换至「代码调试」与单步源码高亮视图',
    icon: '💻'
  },
  {
    id: 'terminal.tabProblem',
    name: '题目描述看板',
    category: 'terminal',
    defaultCombo: '2',
    aliases: ['d'],
    description: '将右侧终端切换至「题目描述」与约束说明视图',
    icon: '📋'
  },
  {
    id: 'terminal.tabAnalysis',
    name: '思维导图 / 精讲看板',
    category: 'terminal',
    defaultCombo: '3',
    aliases: ['a'],
    description: '将右侧终端切换至「思维导图 / 算法深度精讲」视图',
    icon: '💡'
  },
  {
    id: 'terminal.fontIncrease',
    name: '放大代码字号',
    category: 'terminal',
    defaultCombo: '=',
    aliases: ['+'],
    description: '放大右侧暗色终端代码字体字号 (+1px)',
    icon: '🔍+'
  },
  {
    id: 'terminal.fontDecrease',
    name: '缩小代码字号',
    category: 'terminal',
    defaultCombo: '-',
    aliases: ['_'],
    description: '缩小右侧暗色终端代码字体字号 (-1px)',
    icon: '🔍-'
  },
  {
    id: 'terminal.switchLang',
    name: '切换编程语言',
    category: 'terminal',
    defaultCombo: 'l',
    description: '循环切换当前代码实现语言 (Java → C++ → Python → JavaScript)',
    icon: '🌐'
  },

  // 4. 全局辅助 (General)
  {
    id: 'general.openShortcuts',
    name: '快捷键配置与速查手册',
    category: 'general',
    defaultCombo: '?',
    aliases: ['F1', 'Shift+/'],
    description: '打开可视化快捷键速查指南与在线自定义改键面板',
    icon: '⌨️'
  },
  {
    id: 'general.closeModal',
    name: '关闭弹窗 / 收起抽屉',
    category: 'general',
    defaultCombo: 'Escape',
    description: '关闭当前激活的弹窗、目录抽屉或使搜索框失焦',
    allowInInput: true,
    icon: '✖️'
  }
];
