import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const WordBreakSpec: AlgorithmSpec = {
  id: 'word-break',
  name: '单词拆分 (Word Break)',
  category: '背包 DP',
  description: '给你一个字符串 s 和一个字符串字典 wordDict 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 s 则返回 true。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 139,
    leetcodeUrl: 'https://leetcode.cn/problems/word-break/',
    difficulty: 'medium',
    tags: ['字典树', '记忆化搜索', '数组', '哈希表', '字符串', '动态规划', '完全背包'],
    description: '给你一个字符串 <code>s</code> 和一个字符串字典 <code>wordDict</code> 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 <code>s</code> 则返回 <code>true</code>。<br/><br/><strong>注意</strong>：不要求字典中出现的单词全部都使用，并且字典中的单词可以 <strong>重复使用</strong>。<br/><br/><strong>完全背包排列模型</strong>：字符串 <code>s</code> 为背包总容量，<code>wordDict</code> 中的单词为物品（可无限次选取）。由于单词拼接强调先后排列顺序，因此属于 <strong>完全背包排列问题：先遍历容量（前缀长度 i），再遍历物品（前缀分割点 j）</strong>！',
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet", "code"]',
        output: 'true',
        explanation: '返回 true 因为 "leetcode" 可以由 "leet" 和 "code" 拼接成。',
      },
      {
        input: 's = "applepenapple", wordDict = ["apple", "pen"]',
        output: 'true',
        explanation: '返回 true 因为 "applepenapple" 可以由 "apple" + "pen" + "apple" 拼接成。注意你可以重复使用字典中的单词。',
      },
    ],
    constraints: [
      '1 <= s.length <= 300',
      '1 <= wordDict.length <= 1000',
      '1 <= wordDict[i].length <= 20',
      's 和 wordDict[i] 仅由小写英文字母组成',
      'wordDict 中的所有字符串 互不相同',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 4 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: 9, context: [7, 8] },
      cpp: { primary: 9, context: [7, 8] },
      python: { primary: 8, context: [6, 7] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 4 },
    returnResult: { java: 14, cpp: 14, python: 10, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function wordBreak(s, wordDict) {',
        '    const wordSet = new Set(wordDict);',
        '    const dp = new Array(s.length + 1).fill(false);',
        '    dp[0] = true; // 空字符串可以被拆分',
        '    for (let i = 1; i <= s.length; i++) { // 排列完全背包：先遍历背包容量 (前缀长度)',
        '        for (let j = 0; j < i; j++) {     // 再遍历物品 (分割点)',
        '            if (dp[j] && wordSet.has(s.substring(j, i))) {',
        '                dp[i] = true;',
        '                break;',
        '            }',
        '        }',
        '    }',
        '    return dp[s.length];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean wordBreak(String s, List<String> wordDict) {',
        '        Set<String> wordSet = new HashSet<>(wordDict);',
        '        boolean[] dp = new boolean[s.length() + 1];',
        '        dp[0] = true;',
        '        for (int i = 1; i <= s.length(); i++) {',
        '            for (int j = 0; j < i; j++) {',
        '                if (dp[j] && wordSet.contains(s.substring(j, i))) {',
        '                    dp[i] = true;',
        '                    break;',
        '                }',
        '            }',
        '        }',
        '        return dp[s.length()];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    boolean wordBreak(string s, vector<string>& wordDict) {',
        '        unordered_set<string> wordSet(wordDict.begin(), wordDict.end());',
        '        vector<bool> dp(s.size() + 1, false);',
        '        dp[0] = true;',
        '        for (int i = 1; i <= s.size(); i++) {',
        '            for (int j = 0; j < i; j++) {',
        '                if (dp[j] && wordSet.count(s.substr(j, i - j))) {',
        '                    dp[i] = true;',
        '                    break;',
        '                }',
        '            }',
        '        }',
        '        return dp[s.size()];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def wordBreak(self, s: str, wordDict: List[str]) -> bool:',
        '        word_set = set(wordDict)',
        '        dp = [False] * (len(s) + 1)',
        '        dp[0] = True',
        '        for i in range(1, len(s) + 1):',
        '            for j in range(i):',
        '                if dp[j] and s[j:i] in word_set:',
        '                    dp[i] = True',
        '                    break',
        '        return dp[len(s)]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：单词拆分。',
        2: '将字典转为 HashSet，提供 O(1) 单词查询能力。',
        3: '开辟布尔数组 dp[s.length + 1]，初始化为 false。',
        4: '初始化 dp[0] = true（空串作为递推基底）。',
        5: '外层遍历背包容量：前缀长度 i 从 1 到 s.length。',
        6: '内层遍历分割点 j：考察前缀 s[0..j] 是否可拆分，以及后缀 s[j..i] 是否在字典中。',
        7: '转移条件：若 dp[j] 为 true 且 s[j..i] 在字典中，则 dp[i] = true。',
        8: '一旦找到一种有效分割即可提前 break 剪枝。',
        13: '返回 dp[s.length]。',
      },
      java: {
        2: '函数入口。',
        3: 'HashSet 字典。',
        4: '定义 dp 布尔数组。',
        6: '外层容量遍历。',
        7: '内层分割点遍历。',
        8: '有效分割匹配。',
        13: '返回 dp[n]。',
      },
      cpp: {
        3: '函数入口。',
        4: '无序集合哈希表。',
        5: '定义 dp 向量。',
        7: '双层循环遍历。',
        9: '子串在字典中命中。',
        14: '返回结果。',
      },
      python: {
        2: '函数入口。',
        3: '字典集合转换。',
        4: '初始化 dp 列表。',
        6: '双层递推。',
        8: '切片匹配。',
        10: '返回 dp[-1]。',
      },
    },
    keyPoints: {
      title: '🎯 单词拆分 (完全背包排列) 5 步法系统精讲',
      summary: 'LeetCode 139。字符串拆分问题本质是「排列型完全背包」。单词顺序极其重要，因此必须先遍历容量（前缀长度 i），再遍历物品（切分点 j）！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：长度为 <code>i</code> 的前缀子串 <code>s[0..i-1]</code> 是否可以由字典单词拼接而成。', icon: '🎯', badge: '前缀可拆性' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = true</code> 当且仅当存在 <code>j < i</code> 使得 <code>dp[j] === true && wordSet.has(s.substring(j, i))</code>。', icon: '⚡', badge: '子串切分匹配' },
        { label: '三、排列遍历顺序', desc: '强调单词先后顺序：<strong>先遍历背包容量 i</strong>（从 1 到 n），<strong>再遍历物品分割点 j</strong>（从 0 到 i）。', icon: '🎬', badge: '先容量后物品' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(n² + m)</code>（n 为字符串长度）。<br>• 空间复杂度：<code>O(n + k)</code>（k 为字典空间）。', icon: '⏱️', badge: 'O(n²)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let s = 'leetcode';
    let wordDict = ['leet', 'code'];

    if (typeof input === 'object' && input) {
      if (typeof input.s === 'string') s = input.s;
      if (Array.isArray(input.wordDict)) wordDict = input.wordDict;
      else if (typeof input.wordDict === 'string') wordDict = input.wordDict.split(/[,，\s]+/).filter(Boolean);
      else if (typeof input.t === 'string') wordDict = input.t.split(/[,，\s]+/).filter(Boolean);
    }

    const n = s.length;
    const wordSet = new Set(wordDict);
    const dp: DpCell[] = Array(n + 1).fill('false');
    dp[0] = 'true';

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      sub?: string;
      inDict?: boolean;
      curDp?: string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const subStr = opts.sub ?? '-';
      const inD = opts.inDict != null ? (opts.inDict ? '是 ✓' : '否 ✗') : '-';
      const cur = opts.curDp ?? (dp[n] as string);
      const chSet = new Set(opts.changed || []);

      return [
        { name: 's (目标字符串)', value: s, type: 'string' as const, changed: chSet.has('s') },
        { name: 'wordDict (字典)', value: `[${wordDict.join(', ')}]`, type: 'string' as const, changed: chSet.has('dict') },
        { name: 'i (当前前缀长度)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (分割点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: '考察子串 s[j..i]', value: subStr, type: 'string' as const, changed: chSet.has('sub') },
        { name: '子串是否存在于字典', value: inD, type: 'string' as const, changed: chSet.has('inD') },
        { name: 'dp[i] (前缀可拆分性)', value: cur, type: 'string' as const, changed: chSet.has('dp') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: s.split(''),
      message: `🎯 函数入口：单词拆分。目标串 "${s}"，字典 [${wordDict.join(', ')}]。`,
      log: `entry: s="${s}", dict=[${wordDict.join(',')}]`,
      vars: makeVars({ changed: ['s', 'dict'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        const sub = s.substring(j, i);
        const hasSub = wordSet.has(sub);
        const dpJ = dp[j] === 'true';

        if (dpJ && hasSub) {
          dp[i] = 'true';
          push({
            dp1d: clone1d(dp),
            source: s.split(''),
            current: { index: i },
            dependencies: [{ index: j }],
            formula: `dp[${j}] === true && wordSet.has("${sub}") => dp[${i}] = true`,
            message: `✨ 匹配成功！前缀 s[0..${j}] 可拆分 (dp[${j}]=true)，且后缀 "${sub}" 存在于字典 $\rightarrow$ dp[${i}] = true。`,
            log: `match: dp[${i}]=true via s[${j}..${i}]="${sub}"`,
            vars: makeVars({ i, j, sub, inDict: true, curDp: 'true', changed: ['i', 'j', 'sub', 'inD', 'dp'] }),
            codeLine: {
              java: { primary: 9, context: [7, 8] },
              cpp: { primary: 9, context: [7, 8] },
              python: { primary: 8, context: [6, 7] },
              javascript: { primary: 7, context: [5, 6] },
            },
          });
          break;
        }
      }
    }

    const finalAns = dp[n] === 'true';
    push({
      dp1d: clone1d(dp),
      source: s.split(''),
      current: { index: n },
      message: `🏁 算法结束：字符串 "${s}" 能否由字典拆分拼接：${finalAns ? 'true (可以 ✓)' : 'false (不能 ✗)'}。`,
      log: `return: dp[${n}] = ${finalAns}`,
      vars: makeVars({ curDp: String(finalAns), changed: ['dp'] }),
      codeLine: { java: 14, cpp: 14, python: 10, javascript: 13 },
    });

    return steps;
  },
};
