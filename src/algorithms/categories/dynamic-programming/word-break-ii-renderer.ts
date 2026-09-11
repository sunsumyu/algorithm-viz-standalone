/**
 * Hard 23: 单词拆分 II (Word Break II)
 * LeetCode 140 (Hard) / 大厂面试压轴高频记忆化回溯题
 * 核心原语：前缀字典检索 + 后缀子问题记忆化搜索 (Memoized DFS)，全组合拓扑重构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface WordBreakStep extends StepBase {
  stepIndex?: number;
  s: string;
  currentPrefix: string;
  remainingSuffix: string;
  matchedWord: string | null;
  cachedSuffixes: Record<string, string[]>;
  allSentences: string[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const WORD_BREAK_CODES = {
  java: `public class WordBreakII {
    public List<String> wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        Map<String, List<String>> memo = new HashMap<>();
        return dfs(s, dict, memo);
    }

    private List<String> dfs(String s, Set<String> dict, Map<String, List<String>> memo) {
        if (memo.containsKey(s)) return memo.get(s); // 记忆化剪枝
        List<String> res = new ArrayList<>();
        if (s.isEmpty()) {
            res.add("");
            return res;
        }

        // 枚举切分前缀
        for (int i = 1; i <= s.length(); i++) {
            String prefix = s.substring(0, i);
            if (dict.contains(prefix)) {
                List<String> subList = dfs(s.substring(i), dict, memo);
                for (String sub : subList) {
                    res.add(prefix + (sub.isEmpty() ? "" : " ") + sub);
                }
            }
        }
        memo.put(s, res);
        return res;
    }
}`,
  cpp: `class Solution {
    unordered_map<string, vector<string>> memo;
public:
    vector<string> wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        return dfs(s, dict);
    }
    vector<string> dfs(string s, unordered_set<string>& dict) {
        if (memo.count(s)) return memo[s];
        if (s.empty()) return {""};
        vector<string> res;
        for (int i = 1; i <= s.size(); ++i) {
            string prefix = s.substr(0, i);
            if (dict.count(prefix)) {
                auto subs = dfs(s.substr(i), dict);
                for (auto& sub : subs) {
                    res.push_back(prefix + (sub.empty() ? "" : " ") + sub);
                }
            }
        }
        return memo[s] = res;
    }
};`,
  python: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> list[str]:
        words = set(wordDict)
        memo = {}

        def dfs(s):
            if s in memo:
                return memo[s]
            if not s:
                return [""]
            res = []
            for i in range(1, len(s) + 1):
                prefix = s[:i]
                if prefix in words:
                    for sub in dfs(s[i:]):
                        res.append(prefix + (" " + sub if sub else ""))
            memo[s] = res
            return res

        return dfs(s)`,
  typescript: `function wordBreak(s: string, wordDict: string[]): string[] {
    const dict = new Set(wordDict);
    const memo = new Map<string, string[]>();

    function dfs(str: string): string[] {
        if (memo.has(str)) return memo.get(str)!;
        if (str.length === 0) return [''];
        const res: string[] = [];
        for (let i = 1; i <= str.length; i++) {
            const prefix = str.substring(0, i);
            if (dict.has(prefix)) {
                const subs = dfs(str.substring(i));
                for (const sub of subs) {
                    res.push(prefix + (sub.length > 0 ? ' ' : '') + sub);
                }
            }
        }
        memo.set(str, res);
        return res;
    }
    return dfs(s);
}`
};

export function generateWordBreakSteps(s: string = 'catsanddog', dict: string[] = ['cat', 'cats', 'and', 'sand', 'dog']): WordBreakStep[] {
  const steps: WordBreakStep[] = [];
  const wordSet = new Set(dict);
  const memo: Record<string, string[]> = {};

  const lines = {
    entry: 3,
    checkMemo: 9,
    baseEmpty: 11,
    loopPrefix: 17,
    checkPrefix: 19,
    recurseSuffix: 20,
    stitchWords: 22,
    saveMemo: 26,
  };

  steps.push({
    s,
    currentPrefix: '',
    remainingSuffix: s,
    matchedWord: null,
    cachedSuffixes: {},
    allSentences: [],
    decision: `启动单词拆分 II：目标字符串 "${s}"，字典包含 ${dict.length} 个单词`,
    message: '记忆化回溯核心：自顶向下枚举有效前缀，递归求解剩余后缀的所有拆分组合',
    log: `Init word break for "${s}" with dict=[${dict.join(', ')}]`,
    codeLine: lines.entry,
    statusBadge: { text: '算法就绪', type: 'info' },
  });

  function dfs(str: string): string[] {
    if (memo[str] !== undefined) {
      steps.push({
        s,
        currentPrefix: '',
        remainingSuffix: str,
        matchedWord: null,
        cachedSuffixes: { ...memo },
        allSentences: [],
        decision: `🎉 命中后缀记忆化缓存：memo["${str}"] 包含 ${memo[str].length} 组解`,
        message: '避免重复拆解相同的后缀子问题',
        log: `Cache hit for "${str}"`,
        codeLine: lines.checkMemo,
        statusBadge: { text: '缓存命中', type: 'success' },
      });
      return memo[str];
    }

    if (str.length === 0) {
      return [''];
    }

    const res: string[] = [];

    for (let i = 1; i <= str.length; i++) {
      const prefix = str.substring(0, i);
      const suffix = str.substring(i);

      if (wordSet.has(prefix)) {
        steps.push({
          s,
          currentPrefix: prefix,
          remainingSuffix: suffix,
          matchedWord: prefix,
          cachedSuffixes: { ...memo },
          allSentences: [],
          decision: `前缀匹配成功：在词典中找到单词 "${prefix}"，深入后缀 "${suffix}"`,
          message: `切分点定位：前缀 "${prefix}" 合法，递归探查剩余子串的所有拆分方案`,
          log: `Prefix matched: "${prefix}", dfs suffix: "${suffix}"`,
          codeLine: lines.checkPrefix,
          statusBadge: { text: `匹配 "${prefix}"`, type: 'info' },
        });

        const subList = dfs(suffix);
        for (const sub of subList) {
          const sentence = prefix + (sub.length > 0 ? ' ' : '') + sub;
          res.push(sentence);
          steps.push({
            s,
            currentPrefix: prefix,
            remainingSuffix: suffix,
            matchedWord: prefix,
            cachedSuffixes: { ...memo },
            allSentences: [...res],
            decision: `拼接组合成有效句子："${sentence}"`,
            message: `前缀 "${prefix}" 与后缀子解 "${sub}" 成功缝合`,
            log: `Sentence formed: "${sentence}"`,
            codeLine: lines.stitchWords,
            statusBadge: { text: '生成句子', type: 'success' },
          });
        }
      }
    }

    memo[str] = res;
    return res;
  }

  const finalResults = dfs(s);

  steps.push({
    s,
    currentPrefix: '',
    remainingSuffix: '',
    matchedWord: null,
    cachedSuffixes: { ...memo },
    allSentences: finalResults,
    decision: `🎉 单词拆分 II 搜索完毕！共生成 ${finalResults.length} 个完全合法的句子`,
    message: `全部拆分方案: [${finalResults.map(sen => `"${sen}"`).join(', ')}]`,
    log: `Word break complete: ${finalResults.length} sentences`,
    codeLine: lines.entry,
    statusBadge: { text: `找到 ${finalResults.length} 组解`, type: 'success' },
  });

  return steps;
}

export function renderWordBreakCanvas(container: HTMLElement, step: WordBreakStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前匹配前缀 (Prefix)</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.matchedWord ? `"${step.matchedWord}"` : '探查中...'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">剩余待处理后缀 (Suffix)</div>
          <div style="font-size: 18px; font-family: monospace; color: #fbbf24; margin-top: 4px;">
            "${step.remainingSuffix}"
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">已生成合法句子总数</div>
          <div style="font-size: 22px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.allSentences.length} 组完整句子
          </div>
        </div>
      </div>

      <!-- 句子重构展示看板 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          已生成的完整句子解集 (Sentences Generated)
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${
            step.allSentences.length === 0
              ? '<span style="color: #64748b; font-size: 12px;">正在递归构建与记忆化搜索...</span>'
              : step.allSentences.map(sen => `
                <div style="
                  padding: 8px 14px;
                  background: rgba(52, 211, 153, 0.1);
                  border: 1px solid rgba(52, 211, 153, 0.3);
                  border-radius: 6px;
                  font-family: monospace;
                  color: #34d399;
                  font-size: 13px;
                  font-weight: bold;
                ">
                  ✓ "${sen}"
                </div>
              `).join('')
          }
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '前缀切分与记忆化回溯公理',
        '针对任意后缀串，若其包含在 memo 缓存字典中则直接复用；否则从左至右枚举切分点：只要前缀在词典中合法，便深入后缀子问题求解。记忆化将原本指数级的重叠子分支彻底剪枝，优雅实现高效率的全量拓扑路径重构！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const wordBreakIIVisualizer = registerDeclarativeAlgorithm<WordBreakStep>({
  id: 'word-break-ii',
  name: 'Hard 23: 单词拆分 II (Word Break II)',
  category: 'dynamic-programming',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 140,
  learningGoal: '掌握记忆化回溯 (Memoized DFS) 解决全量组合路径重构的思想，理解前缀切分与后缀子问题缓存机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 140 - Hard)</h3>
      <p>给定一个字符串 <code>s</code> 和一个字符串字典 <code>wordDict</code> ，在 <code>s</code> 中增加空格来构建一个句子，使得句子中所有的单词都在词典中。以任意顺序返回所有这些可能的句子：</p>
      <ul>
        <li><strong>核心挑战</strong>：不仅需要判定能否拆分，更需要完整重构出所有合法的空格拆分句子。</li>
        <li><strong>记忆化优化</strong>：利用 <code>memo: Map&lt;String, List&lt;String&gt;&gt;</code> 缓存每个后缀字符串的所有合法拆解方案，避免重复展开庞大的后缀子树。</li>
      </ul>
    </div>
  `,
  codeLanguages: WORD_BREAK_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设拆分用例',
      type: 'select',
      defaultValue: 'catsanddog',
      options: [
        { label: '双解经典用例: "catsanddog" ➔ ["cats and dog", "cat sand dog"]', value: 'catsanddog' },
        { label: '多重组合用例: "pineapplepenapple"', value: 'pineapple' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'catsanddog';
    if (sc === 'pineapple') {
      return generateWordBreakSteps('pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']);
    }
    return generateWordBreakSteps('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']);
  },
  renderCanvas: (container, step) => {
    renderWordBreakCanvas(container, step);
  },
});
