import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const DecodeWaysSpec: AlgorithmSpec = {
  id: 'decode-ways',
  name: '解码方法 (Decode Ways)',
  category: '线性 DP',
  description: '一条包含字母 A-Z 的消息通过数字 1-26 编码，求给定数字字符串的不同解码方案总数。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 91,
    leetcodeUrl: 'https://leetcode.cn/problems/decode-ways/',
    difficulty: 'medium',
    tags: ['字符串', '动态规划'],
    description: '一条包含字母 <code>A-Z</code> 的消息通过以下映射进行了 <strong>编码</strong> ：<br/>\'A\' -> "1"<br/>\'B\' -> "2"<br/>...<br/>\'Z\' -> "26"<br/><br/>要 <strong>解码</strong> 已编码的消息，所有数字必须按映射转换回字母。给你一个只含数字的 <strong>非空</strong> 字符串 <code>s</code> ，请计算并返回 <strong>解码</strong> 方法的 <strong>总数</strong> 。',
    examples: [
      {
        input: 's = "12"',
        output: '2',
        explanation: '它可以解码为 "AB"（1 2）或者 "L"（12）。',
      },
      {
        input: 's = "226"',
        output: '3',
        explanation: '它可以解码为 "BZ" (2 26), "VF" (22 6), 或者 "BBF" (2 2 6) 。',
      },
      {
        input: 's = "06"',
        output: '0',
        explanation: '"06" 无法映射到 "F" ，因为存在前导零（"6" 和 "06" 并不等价）。',
      },
    ],
    constraints: [
      '1 <= s.length <= 100',
      's 只包含数字，并且可能包含前导零。',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 3, python: 3, javascript: 2 },
    init: { java: [6, 7], cpp: [7, 8], python: 7, javascript: [4, 5] },
    loopCheck: { java: 8, cpp: 9, python: 8, javascript: 6 },
    stateTransfer: { java: [11, 12], cpp: [12, 13], python: [10, 11], javascript: [7, 8] },
    loopExit: { java: 8, cpp: 9, python: 8, javascript: 6 },
    returnResult: { java: 14, cpp: 15, python: 13, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function numDecodings(s) {',
        '    if (!s || s[0] === "0") return 0;',
        '    const n = s.length;',
        '    const dp = new Array(n + 1).fill(0);',
        '    dp[0] = 1;',
        '    dp[1] = 1;',
        '    for (let i = 2; i <= n; i++) {',
        '        const one = Number(s[i - 1]);',
        '        const two = Number(s.slice(i - 2, i));',
        '        if (one >= 1 && one <= 9) dp[i] += dp[i - 1];',
        '        if (two >= 10 && two <= 26) dp[i] += dp[i - 2];',
        '    }',
        '    return dp[n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numDecodings(String s) {',
        '        if (s == null || s.length() == 0 || s.charAt(0) == \'0\') return 0;',
        '        int n = s.length();',
        '        int[] dp = new int[n + 1];',
        '        dp[0] = 1; // 虚拟前置空串',
        '        dp[1] = 1; // 单首字符方案数',
        '        for (int i = 2; i <= n; i++) {',
        '            int one = s.charAt(i - 1) - \'0\';',
        '            int two = (s.charAt(i - 2) - \'0\') * 10 + one;',
        '            if (one >= 1 && one <= 9) dp[i] += dp[i - 1]; // 取1位解码',
        '            if (two >= 10 && two <= 26) dp[i] += dp[i - 2]; // 取2位解码',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numDecodings(string s) {',
        '        if (s.empty() || s[0] == \'0\') return 0;',
        '        int n = s.length();',
        '        vector<int> dp(n + 1, 0);',
        '        dp[0] = 1;',
        '        dp[1] = 1;',
        '        for (int i = 2; i <= n; i++) {',
        '            int one = s[i - 1] - \'0\';',
        '            int two = (s[i - 2] - \'0\') * 10 + one;',
        '            if (one >= 1 && one <= 9) dp[i] += dp[i - 1];',
        '            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numDecodings(self, s: str) -> int:',
        '        if not s or s[0] == "0":',
        '            return 0',
        '        n = len(s)',
        '        dp = [0] * (n + 1)',
        '        dp[0], dp[1] = 1, 1',
        '        for i in range(2, n + 1):',
        '            one = int(s[i - 1])',
        '            two = int(s[i - 2:i])',
        '            if 1 <= one <= 9:',
        '                dp[i] += dp[i - 1]',
        '            if 10 <= two <= 26:',
        '                dp[i] += dp[i - 2]',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收数字字符串 s，计算其所有可能的有效字母解码总方案数。',
        3: '🎬 <strong>边界特判守卫</strong>：若字符串为空或首字符为 "0"，因 0 无对应字母，直接返回 0。',
        4: '规模提取：获取字符串长度 n。',
        5: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示长度为 i 的前缀子串 s[0..i-1] 的解码方案总数。',
        6: '🎬 <strong>边界初始化 (dp[0]=1)</strong>：空串基础方案数设为 1，便于两位数组合解码时正确累加。',
        7: '🎬 <strong>边界初始化 (dp[1]=1)</strong>：首个非零字符独立解码方案数确立为 1。',
        8: '🔄 <strong>循环状态推进</strong>：从前缀长度 i=2 递推计算至整个字符串长度 n。',
        9: '🔍 <strong>提取末尾 1 位数字</strong>：one = s.charAt(i-1) - \'0\'。',
        10: '🔍 <strong>提取末尾 2 位数字</strong>：two = (s.charAt(i-2) - \'0\') * 10 + one。',
        11: '⚡ <strong>取 1 位转移</strong>：若 1 <= one <= 9，当前字符可独立解码为一个字母，继承 dp[i-1] 方案数。',
        12: '⚡ <strong>取 2 位转移</strong>：若 10 <= two <= 26，末尾两位可组合为一个合法字母（如 10->J, 26->Z），继承 dp[i-2] 方案数。',
        13: '循环作用域闭合。',
        14: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为整个字符串 s 的全部有效解码方案总数。',
        15: '函数体结束。',
        16: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收数字字符串 s，计算其全部合法解码方案总数。',
        4: '🎬 <strong>边界特判守卫</strong>：若字符串为空或首字符为 "0"，直接返回 0。',
        5: '规模提取：int n = s.length()。',
        6: '🗺️ <strong>开辟状态数组</strong>：vector<int> dp(n + 1, 0)。',
        7: '🎬 <strong>边界初始化 (dp[0]=1)</strong>：空前缀基础基底设为 1。',
        8: '🎬 <strong>边界初始化 (dp[1]=1)</strong>：首个非零字符方案数设为 1。',
        9: '🔄 <strong>循环状态推进</strong>：for (int i = 2; i <= n; i++)。',
        10: '🔍 <strong>提取末尾 1 位数字</strong>：one = s[i-1] - \'0\'。',
        11: '🔍 <strong>提取末尾 2 位数字</strong>：two = (s[i-2] - \'0\') * 10 + one。',
        12: '⚡ <strong>取 1 位独立解码</strong>：if (one >= 1 && one <= 9) dp[i] += dp[i-1]。',
        13: '⚡ <strong>取 2 位组合解码</strong>：if (two >= 10 && two <= 26) dp[i] += dp[i-2]。',
        14: '循环作用域闭合。',
        15: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
        16: '函数体结束。',
        17: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：numDecodings(s) 计算数字字符串 s 的全部合法解码方案总数。',
        3: '🎬 <strong>边界特判守卫</strong>：if not s or s[0] == "0":',
        4: '🎬 <strong>边界特判返回</strong>：return 0。',
        5: '规模提取：n = len(s)。',
        6: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        7: '🎬 <strong>边界初始化</strong>：dp[0], dp[1] = 1, 1。',
        8: '🔄 <strong>循环状态推进</strong>：for i in range(2, n + 1):',
        9: '🔍 <strong>提取末尾 1 位与 2 位</strong>：one = int(s[i-1]), two = int(s[i-2:i])。',
        10: '⚡ <strong>取 1 位独立解码</strong>：if 1 <= one <= 9: dp[i] += dp[i - 1]。',
        11: '⚡ <strong>取 2 位组合解码</strong>：if 10 <= two <= 26: dp[i] += dp[i - 2]。',
        12: '循环推进结束。',
        13: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收数字字符串 s，返回其可能的字母解码总方案数。',
        2: '🎬 <strong>边界特判守卫</strong>：若字符串为空或首字符为 "0"，由于 0 无对应字母，直接返回 0。',
        3: '规模提取：获取字符串长度 n = s.length。',
        4: '🗺️ <strong>开辟状态数组</strong>：const dp = new Array(n + 1).fill(0)。',
        5: '🎬 <strong>边界初始化 (dp[0]=1)</strong>：空前缀基础方案数设为 1，便于两位组合转移计算。',
        6: '🎬 <strong>边界初始化 (dp[1]=1)</strong>：首字符非零时解码方案数为 1。',
        7: '🔄 <strong>循环状态推进</strong>：从长度 i = 2 递推到 n。',
        8: '⚡ <strong>1 位与 2 位分支转移</strong>：1位有效则加 dp[i-1]，2位有效则加 dp[i-2]。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为全部有效解码方案总数。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 解码方法 (Decode Ways) 5步动规核心要点',
      summary: 'LeetCode 91。带约束条件的跳步 DP 问题，核心在于识别 0 的非法前导与 10..26 两位有效区间。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：前缀子串 <code>s[0..i-1]</code>（长度为 i）的有效解码方法总数。', icon: '🎯', badge: '前缀解码' },
        { label: '二、状态转移方程', desc: '• 1位有效 (1..9): <code>dp[i] += dp[i-1]</code><br>• 2位有效 (10..26): <code>dp[i] += dp[i-2]</code>', icon: '⚡', badge: '双分支' },
        { label: '三、初始化与边界条件', desc: '<code>dp[0] = 1, dp[1] = 1</code>（若 <code>s[0] == "0"</code> 直接返回 0）。', icon: '🎬', badge: '空串基底' },
        { label: '四、遍历推进顺序', desc: '从 <code>i = 2</code> 到 <code>n</code> 自左向右顺序推演。', icon: '🧭', badge: '正向推导' },
        { label: '五、复杂度与优化', desc: '• 时间 <code>O(n)</code>，空间 <code>O(n)</code>。<br>• 可用滚动变量 <code>p, q, r</code> 压缩空间至 <code>O(1)</code>。', icon: '⏱️', badge: '滚动优化' },
      ],
    },
  },
  generateSteps: (input: { str?: string; s?: string } | string): DpTraceStep[] => {
    const rawStr = typeof input === 'string' ? input : (input?.s || input?.str || '226');
    const s = rawStr || '226';
    const n = s.length;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep({ source: s.split(''), ...step }));
    const numDp: number[] = Array(n + 1).fill(0);
    const dp: import('../../engine/types').DpCell[] = Array(n + 1).fill('-');

    const makeVars = (opts: {
      i?: number | string;
      one?: number | string;
      two?: number | string;
      currentDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const oVal = opts.one ?? '-';
      const tVal = opts.two ?? '-';
      const curDp = opts.currentDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 's (输入字符串)', value: `"${s}"`, type: 'string' as const, changed: chSet.has('s') },
        { name: 'n (字符串长度)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'dp (前缀方案数组)', value: `[${dp.join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'i (当前前缀长度)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'one (末尾1位数)', value: String(oVal), type: (typeof oVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('one') },
        { name: 'two (末尾2位数)', value: String(tVal), type: (typeof tVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('two') },
        { name: 'dp[i] (当前前缀方案数)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      message: `🎯 【函数主入口】进入 numDecodings(s = "${s}")，准备计算数字串的所有合法字母翻译方案数。`,
      log: `进入 numDecodings(s = "${s}")`,
      formula: `numDecodings("${s}")`,
      metrics: { i: '-', one: '-', two: '-', answer: '-' },
      vars: makeVars({ changed: ['s', 'n'] }),
      codeLine: { java: 2, cpp: 3, python: 2, javascript: 1 },
    });

    if (s.length === 0 || s[0] === '0') {
      push({
        dp1d: clone1d(dp),
        current: { index: 0 },
        message: '🎬 【边界特判】首字符为 "0" 或串为空，0 无法对应任何英文字母，直接返回 0。',
        log: '首字符为 0，非法返回 0',
        formula: 'return 0',
        metrics: { i: 0, one: '0', two: '-', answer: 0 },
        vars: makeVars({ currentDp: 0, changed: ['dpi'] }),
        codeLine: { java: 3, cpp: 4, python: 4, javascript: 2 },
      });
      return steps;
    }

    // Step 1: dp[0] = 1
    numDp[0] = 1;
    dp[0] = 1;
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      message: '🎬 【初始化边界 dp[0]】执行 dp[0] = 1;，空前缀的基础方案数设为 1。',
      log: '初始化: dp[0] = 1',
      formula: 'dp[0] = 1',
      metrics: { i: 0, one: '-', two: '-', answer: 1 },
      vars: makeVars({ currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: { java: 6, cpp: 7, python: 7, javascript: 5 },
    });

    // Step 2: dp[1] = 1
    numDp[1] = 1;
    dp[1] = 1;
    push({
      dp1d: clone1d(dp),
      current: { index: 1 },
      message: `🎬 【初始化边界 dp[1]】执行 dp[1] = 1;，首字符 '${s[0]}' 对应字母 ${String.fromCharCode(64 + Number(s[0]))}，方案数为 1。`,
      log: '初始化: dp[1] = 1',
      formula: 'dp[1] = 1',
      metrics: { i: 1, one: s[0], two: '-', answer: 1 },
      vars: makeVars({ one: s[0], currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: { java: 7, cpp: 8, python: 7, javascript: 6 },
    });

    for (let i = 2; i <= n; i++) {
      const one = Number(s[i - 1]);
      const two = Number(s.slice(i - 2, i));

      // Loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        message: `🔄 【循环条件判断】当前前缀长度 i = ${i} <= ${n} 为 true，准备解析当前子串 "${s.slice(0, i)}"。`,
        log: `for i = ${i} <= ${n}`,
        formula: `for (int i = 2; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, one: String(one), two: String(two), answer: '待计算' },
        vars: makeVars({ i, one, two, changed: ['i', 'one', 'two'] }),
        codeLine: { java: 8, cpp: 9, python: 8, javascript: 6 },
      });

      if (one >= 1 && one <= 9) {
        numDp[i] += numDp[i - 1];
      }
      if (two >= 10 && two <= 26) {
        numDp[i] += numDp[i - 2];
      }
      dp[i] = numDp[i];

      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [
          ...(one >= 1 && one <= 9 ? [{ index: i - 1 }] : []),
          ...(two >= 10 && two <= 26 ? [{ index: i - 2 }] : []),
        ],
        message: `⚡ 【状态转移计算】末尾 1 位 (${one} $\\rightarrow$ ${one >= 1 && one <= 9 ? `+dp[${i - 1}](${dp[i - 1]})` : '无效'}) 与 末尾 2 位 (${two} $\\rightarrow$ ${two >= 10 && two <= 26 ? `+dp[${i - 2}](${dp[i - 2]})` : '无效'})，dp[${i}] 更新为 ${dp[i]}。`,
        log: `dp[${i}] = ${dp[i]}`,
        formula: `dp[${i}] = ${one >= 1 && one <= 9 ? `dp[${i - 1}]` : '0'} + ${two >= 10 && two <= 26 ? `dp[${i - 2}]` : '0'} = ${dp[i]}`,
        metrics: { i, one: String(one), two: String(two), answer: numDp[i] },
        vars: makeVars({ i, one, two, currentDp: numDp[i], changed: ['dp', 'dpi'] }),
        codeLine: { java: [11, 12], cpp: [12, 13], python: [10, 11], javascript: [7, 8] },
      });
    }

    // Return
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      message: `🎉 【函数返回】执行 return dp[${n}];，数字字符串 "${s}" 共有 ${dp[n]} 种合法解码翻译方案！`,
      log: `计算完成: return dp[${n}] = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, one: '-', two: '-', answer: numDp[n] },
      vars: makeVars({ i: n, currentDp: numDp[n], changed: ['dpi'] }),
      codeLine: { java: 14, cpp: 15, python: 13, javascript: 9 },
    });

    return steps;
  },
};
