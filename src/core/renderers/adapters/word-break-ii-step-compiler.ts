import { StepBase, HighlightTarget } from '../../step-visualizer';

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
  codeLine?: number | HighlightTarget;
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
}`,
};

export function generateWordBreakSteps(
  s: string = 'catsanddog',
  dict: string[] = ['cat', 'cats', 'and', 'sand', 'dog']
): WordBreakStep[] {
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
    message: `全部拆分方案: [${finalResults.map((sen) => `"${sen}"`).join(', ')}]`,
    log: `Word break complete: ${finalResults.length} sentences`,
    codeLine: lines.entry,
    statusBadge: { text: `找到 ${finalResults.length} 组解`, type: 'success' },
  });

  return steps;
}
