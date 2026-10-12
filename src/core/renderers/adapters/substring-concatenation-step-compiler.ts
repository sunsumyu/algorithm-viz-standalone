import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface SubstringStep extends StepBase {
  stepIndex?: number;
  s: string;
  words: string[];
  wordLen: number;
  wordsCount: number;
  offset: number;
  left: number;
  right: number;
  currentWord: string;
  windowMap: Record<string, number>;
  targetMap: Record<string, number>;
  matchCount: number;
  matchedIndices: number[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const SUBSTRING_CONCATENATION_CODES = {
  java: `public class SubstringConcatenation {
    public static List<Integer> findSubstring(String s, String[] words) {
        List<Integer> res = new ArrayList<>();
        if (s == null || words == null || words.length == 0) return res;

        int wordLen = words[0].length(), numWords = words.length;
        int totalLen = wordLen * numWords;
        Map<String, Integer> target = new HashMap<>();
        for (String w : words) target.put(w, target.getOrDefault(w, 0) + 1);

        // 仅需遍历 wordLen 种起点偏移量
        for (int i = 0; i < wordLen; i++) {
            int left = i, right = i, count = 0;
            Map<String, Integer> window = new HashMap<>();

            while (right + wordLen <= s.length()) {
                String sub = s.substring(right, right + wordLen);
                right += wordLen;

                if (target.containsKey(sub)) {
                    window.put(sub, window.getOrDefault(sub, 0) + 1);
                    count++;
                    while (window.get(sub) > target.get(sub)) {
                        String leftSub = s.substring(left, left + wordLen);
                        window.put(leftSub, window.get(leftSub) - 1);
                        count--;
                        left += wordLen;
                    }
                    if (count == numWords) res.add(left);
                } else {
                    window.clear();
                    count = 0;
                    left = right;
                }
            }
        }
        return res;
    }
}`,
  cpp: `class SubstringConcatenation {
public:
    static vector<int> findSubstring(string s, vector<string>& words) {
        vector<int> res;
        if (words.empty()) return res;
        int wordLen = words[0].size(), numWords = words.size();
        unordered_map<string, int> target;
        for (const auto& w : words) target[w]++;

        for (int i = 0; i < wordLen; ++i) {
            int left = i, right = i, count = 0;
            unordered_map<string, int> window;
            while (right + wordLen <= (int)s.size()) {
                string sub = s.substr(right, wordLen);
                right += wordLen;
                if (target.count(sub)) {
                    window[sub]++;
                    count++;
                    while (window[sub] > target[sub]) {
                        string leftSub = s.substr(left, wordLen);
                        window[leftSub]--;
                        count--;
                        left += wordLen;
                    }
                    if (count == numWords) res.push_back(left);
                } else {
                    window.clear(); count = 0; left = right;
                }
            }
        }
        return res;
    }
};`,
  python: `class SubstringConcatenation:
    @staticmethod
    def find_substring(s: str, words: list[str]) -> list[int]:
        if not s or not words: return []
        word_len, num_words = len(words[0]), len(words)
        import collections
        target = collections.Counter(words)
        res = []

        for i in range(word_len):
            left, right, count = i, i, 0
            window = collections.defaultdict(int)
            while right + word_len <= len(s):
                sub = s[right:right + word_len]
                right += word_len
                if sub in target:
                    window[sub] += 1
                    count += 1
                    while window[sub] > target[sub]:
                        left_sub = s[left:left + word_len]
                        window[left_sub] -= 1
                        count -= 1
                        left += word_len
                    if count == num_words:
                        res.append(left)
                else:
                    window.clear()
                    count = 0
                    left = right
        return res`,
  typescript: `export class SubstringConcatenation {
  static findSubstring(s: string, words: string[]): number[] {
    const res: number[] = [];
    if (!s || words.length === 0) return res;
    const wordLen = words[0].length, numWords = words.length;
    const target: Map<string, number> = new Map();
    for (const w of words) target.set(w, (target.get(w) || 0) + 1);

    for (let i = 0; i < wordLen; i++) {
      let left = i, right = i, count = 0;
      const window: Map<string, number> = new Map();

      while (right + wordLen <= s.length) {
        const sub = s.slice(right, right + wordLen);
        right += wordLen;
        if (target.has(sub)) {
          window.set(sub, (window.get(sub) || 0) + 1);
          count++;
          while (window.get(sub)! > target.get(sub)!) {
            const leftSub = s.slice(left, left + wordLen);
            window.set(leftSub, window.get(leftSub)! - 1);
            count--;
            left += wordLen;
          }
          if (count === numWords) res.push(left);
        } else {
          window.clear();
          count = 0;
          left = right;
        }
      }
    }
    return res;
  }
}`
};

export function generateSubstringSteps(s: string, words: string[]): SubstringStep[] {
  const steps: SubstringStep[] = [];
  const wordLen = words[0]?.length || 3;
  const numWords = words.length;

  const targetMap: Record<string, number> = {};
  for (const w of words) targetMap[w] = (targetMap[w] || 0) + 1;

  const matchedIndices: number[] = [];
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    s,
    words,
    wordLen,
    wordsCount: numWords,
    offset: 0,
    left: 0,
    right: 0,
    currentWord: '',
    windowMap: {},
    targetMap,
    matchCount: 0,
    matchedIndices: [],
    decision: `初始化分组滑动窗口：单词长度 = ${wordLen}，单词总数 = ${numWords}，目标字典: ${JSON.stringify(targetMap)}`,
    message: '算法初始化完成，准备从偏移量 0 开始滑动窗口推导',
    log: '初始化 SubstringConcatenation',
    codeLine: 5,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      currentWord: '未开始',
      matchCount: `0 / ${numWords}`,
      windowRange: '[0, 0]',
      matchedIndices: '[]',
    },
    ans: '[]',
  });

  for (let offset = 0; offset < wordLen; offset++) {
    let left = offset;
    let right = offset;
    let count = 0;
    const windowMap: Record<string, number> = {};

    while (right + wordLen <= s.length) {
      const sub = s.slice(right, right + wordLen);
      right += wordLen;

      if (targetMap[sub]) {
        windowMap[sub] = (windowMap[sub] || 0) + 1;
        count++;

        while (windowMap[sub] > targetMap[sub]) {
          const leftSub = s.slice(left, left + wordLen);
          windowMap[leftSub] = (windowMap[leftSub] || 1) - 1;
          count--;
          left += wordLen;
        }

        const isFullMatch = count === numWords;
        if (isFullMatch) {
          matchedIndices.push(left);
        }

        steps.push({
          stepIndex: stepIdx++,
          s,
          words,
          wordLen,
          wordsCount: numWords,
          offset,
          left,
          right,
          currentWord: sub,
          windowMap: { ...windowMap },
          targetMap,
          matchCount: count,
          matchedIndices: [...matchedIndices],
          decision: `截取单词 "${sub}" (区间 [${right - wordLen}..${right}])：命中目标词表！窗口内有效单词数 count = ${count}/${numWords}。${isFullMatch ? `【全匹配成功！】捕获串联起始下标 ${left}！` : ''}`,
          message: `截取 "${sub}" 命中，当前有效词数 ${count}/${numWords}`,
          log: `Offset ${offset}: 词 "${sub}" -> count=${count}`,
          codeLine: 18,
          statusBadge: isFullMatch ? { text: `命中下标 ${left}`, type: 'success' } : { text: `单词 "${sub}"`, type: 'info' },
          metrics: {
            currentWord: `"${sub}"`,
            matchCount: `${count} / ${numWords}`,
            windowRange: `[${left}, ${right}]`,
            matchedIndices: `[${matchedIndices.join(', ')}]`,
          },
          ans: `[${matchedIndices.join(', ')}]`,
        });
      } else {
        for (const k in windowMap) delete windowMap[k];
        count = 0;
        left = right;

        steps.push({
          stepIndex: stepIdx++,
          s,
          words,
          wordLen,
          wordsCount: numWords,
          offset,
          left,
          right,
          currentWord: sub,
          windowMap: {},
          targetMap,
          matchCount: 0,
          matchedIndices: [...matchedIndices],
          decision: `截取单词 "${sub}"：不在目标词表中，重置当前窗口，左界直接跃迁至 ${right}`,
          message: `截取 "${sub}" 非目标词，窗口快速重置并跳跃`,
          log: `Offset ${offset}: 词 "${sub}" 无效，窗口重置`,
          codeLine: 24,
          statusBadge: { text: '重置窗口', type: 'warning' },
          metrics: {
            currentWord: `"${sub}" (无效)`,
            matchCount: `0 / ${numWords}`,
            windowRange: `[${left}, ${right}]`,
            matchedIndices: `[${matchedIndices.join(', ')}]`,
          },
          ans: `[${matchedIndices.join(', ')}]`,
        });
      }
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    s,
    words,
    wordLen,
    wordsCount: numWords,
    offset: wordLen - 1,
    left: s.length,
    right: s.length,
    currentWord: '',
    windowMap: {},
    targetMap,
    matchCount: 0,
    matchedIndices: [...matchedIndices],
    decision: `全量步长窗口扫描完毕！所有完全串联的子串起始下标为：[${matchedIndices.join(', ')}]`,
    message: `扫描结束，累计找到 ${matchedIndices.length} 处完全串联子串`,
    log: `检索完毕: ${JSON.stringify(matchedIndices)}`,
    codeLine: 30,
    statusBadge: { text: `完成: ${matchedIndices.length} 处`, type: 'success' },
    metrics: {
      currentWord: '扫描完毕',
      matchCount: `${numWords} / ${numWords}`,
      windowRange: `[${s.length}, ${s.length}]`,
      matchedIndices: `[${matchedIndices.join(', ')}]`,
    },
    ans: `[${matchedIndices.join(', ')}]`,
  });

  return steps;
}
