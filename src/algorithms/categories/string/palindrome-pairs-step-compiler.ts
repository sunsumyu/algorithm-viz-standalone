/**
 * 回文对 (Palindrome Pairs)
 * Step Compiler
 */

import { StepBase } from '../../../core/step-visualizer';

export interface PalindromePairsStep extends StepBase {
  words: string[];
  currentWordIndex: number;
  splitPos: number;
  leftSub: string;
  rightSub: string;
  isLeftPalin: boolean;
  isRightPalin: boolean;
  foundPairs: [number, number][];
  currentCandidate?: [number, number];
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const PALINDROME_PAIRS_CODES = {
  java: `public class Solution {
    public List<List<Integer>> palindromePairs(String[] words) {
        Map<String, Integer> wordMap = new HashMap<>();
        for (int i = 0; i < words.length; i++) wordMap.put(words[i], i);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < words.length; i++) {
            String w = words[i];
            for (int j = 0; j <= w.length(); j++) {
                String left = w.substring(0, j), right = w.substring(j);
                if (isPalindrome(left)) {
                    String revRight = new StringBuilder(right).reverse().toString();
                    if (wordMap.containsKey(revRight) && wordMap.get(revRight) != i) {
                        res.add(Arrays.asList(wordMap.get(revRight), i));
                    }
                }
                if (j != w.length() && isPalindrome(right)) {
                    String revLeft = new StringBuilder(left).reverse().toString();
                    if (wordMap.containsKey(revLeft) && wordMap.get(revLeft) != i) {
                        res.add(Arrays.asList(i, wordMap.get(revLeft)));
                    }
                }
            }
        }
        return res;
    }
}`,
  cpp: `class Solution {
public:
    vector<vector<int>> palindromePairs(vector<string>& words) {
        unordered_map<string, int> wordMap;
        for (int i = 0; i < words.size(); ++i) wordMap[words[i]] = i;
        vector<vector<int>> res;
        for (int i = 0; i < words.size(); ++i) {
            string w = words[i];
            for (int j = 0; j <= w.size(); ++j) {
                string left = w.substr(0, j), right = w.substr(j);
                if (isPalindrome(left)) {
                    string revR = right; reverse(revR.begin(), revR.end());
                    if (wordMap.count(revR) && wordMap[revR] != i)
                        res.push_back({wordMap[revR], i});
                }
                if (j != w.size() && isPalindrome(right)) {
                    string revL = left; reverse(revL.begin(), revL.end());
                    if (wordMap.count(revL) && wordMap[revL] != i)
                        res.push_back({i, wordMap[revL]});
                }
            }
        }
        return res;
    }
};`,
  python: `class Solution:
    def palindromePairs(self, words: List[str]) -> List[List[int]]:
        word_map = {w: i for i, w in enumerate(words)}
        res = []
        for i, w in enumerate(words):
            for j in range(len(w) + 1):
                left, right = w[:j], w[j:]
                if left == left[::-1]:
                    rev_r = right[::-1]
                    if rev_r in word_map and word_map[rev_r] != i:
                        res.append([word_map[rev_r], i])
                if j != len(w) and right == right[::-1]:
                    rev_l = left[::-1]
                    if rev_l in word_map and word_map[rev_l] != i:
                        res.append([i, word_map[rev_l]])
        return res`,
  javascript: `function palindromePairs(words) {
    const wordMap = new Map();
    words.forEach((w, i) => wordMap.set(w, i));
    const res = [];
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        for (let j = 0; j <= w.length; j++) {
            const left = w.slice(0, j), right = w.slice(j);
            if (isPalindrome(left)) {
                const revR = right.split('').reverse().join('');
                if (wordMap.has(revR) && wordMap.get(revR) !== i)
                    res.push([wordMap.get(revR), i]);
            }
            if (j !== w.length && isPalindrome(right)) {
                const revL = left.split('').reverse().join('');
                if (wordMap.has(revL) && wordMap.get(revL) !== i)
                    res.push([i, wordMap.get(revL)]);
            }
        }
    }
    return res;
}`
};

export const CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  initMap: { java: 4, cpp: 6, python: 3, javascript: 3 },
  outerLoop: { java: 6, cpp: 8, python: 5, javascript: 5 },
  split: { java: 9, cpp: 11, python: 7, javascript: 8 },
  checkLeft: { java: 10, cpp: 12, python: 8, javascript: 9 },
  addLeftMatch: { java: 13, cpp: 15, python: 11, javascript: 12 },
  checkRight: { java: 16, cpp: 17, python: 12, javascript: 14 },
  addRightMatch: { java: 19, cpp: 20, python: 15, javascript: 17 },
  returnAns: { java: 24, cpp: 25, python: 16, javascript: 21 }
};

export function isPalin(s: string): boolean {
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l++] !== s[r--]) return false;
  }
  return true;
}

export function buildPalindromePairsSteps(words: string[]): PalindromePairsStep[] {
  const steps: PalindromePairsStep[] = [];
  const foundPairs: [number, number][] = [];
  const wordMap = new Map<string, number>();

  // Step 0: 入口
  steps.push({
    words: [...words],
    currentWordIndex: -1,
    splitPos: -1,
    leftSub: '',
    rightSub: '',
    isLeftPalin: false,
    isRightPalin: false,
    foundPairs: [],
    decision: `主函数入口：输入单词集 [${words.map(w => `"${w}"`).join(', ')}]`,
    message: '准备将所有单词建立哈希映射，并通过前后缀拆分与回文判定在 O(N * L²) 寻找回文对',
    log: `enter palindromePairs(words=[${words.join(',')}])`,
    codeLine: CODE_LINES.entry,
    metrics: { '单词总数': `${words.length}`, '当前状态': '准备构建字典' }
  });

  // Step 1: 字典构建
  words.forEach((w, i) => wordMap.set(w, i));
  steps.push({
    words: [...words],
    currentWordIndex: -1,
    splitPos: -1,
    leftSub: '',
    rightSub: '',
    isLeftPalin: false,
    isRightPalin: false,
    foundPairs: [],
    decision: '完成哈希表构建：已将所有单词与其下标建立 O(1) 检索映射',
    message: '哈希映射表允许我们常数时间检索任意子串的反转是否存在于输入集中',
    log: `built wordMap with ${wordMap.size} entries`,
    codeLine: CODE_LINES.initMap,
    metrics: { '字典大小': `${wordMap.size}`, '检索效率': 'O(1)' }
  });

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // 外层循环单词步
    steps.push({
      words: [...words],
      currentWordIndex: i,
      splitPos: -1,
      leftSub: '',
      rightSub: '',
      isLeftPalin: false,
      isRightPalin: false,
      foundPairs: [...foundPairs],
      decision: `考察第 ${i} 个单词: "${w}" (长度 ${w.length})`,
      message: `枚举分割点 j 从 0 到 ${w.length}，分别切分成前缀与后缀进行双向匹配`,
      log: `processing word index ${i}: "${w}"`,
      codeLine: CODE_LINES.outerLoop,
      metrics: { '当前单词': `words[${i}] = "${w}"`, '已找到对数': `${foundPairs.length}` }
    });

    for (let j = 0; j <= w.length; j++) {
      const left = w.slice(0, j);
      const right = w.slice(j);
      const leftPalin = isPalin(left);
      const rightPalin = isPalin(right);

      // 分割步
      steps.push({
        words: [...words],
        currentWordIndex: i,
        splitPos: j,
        leftSub: left,
        rightSub: right,
        isLeftPalin: leftPalin,
        isRightPalin: rightPalin,
        foundPairs: [...foundPairs],
        decision: `在位置 j=${j} 分割: left="${left}" (回文:${leftPalin ? '是' : '否'}), right="${right}" (回文:${rightPalin ? '是' : '否'})`,
        message: '若 left 为回文，则寻找 reverse(right) 拼在最前；若 right 为回文，寻找 reverse(left) 拼在最后',
        log: `split word "${w}" at j=${j} -> left="${left}", right="${right}"`,
        codeLine: CODE_LINES.split,
        metrics: { '左前缀': `"${left}"`, '右后缀': `"${right}"`, '分割点 j': `${j}` }
      });

      // 情况 1: left 是回文
      if (leftPalin) {
        const revRight = right.split('').reverse().join('');
        const matchedIdx = wordMap.get(revRight);
        const isValidMatch = matchedIdx !== undefined && matchedIdx !== i;

        steps.push({
          words: [...words],
          currentWordIndex: i,
          splitPos: j,
          leftSub: left,
          rightSub: right,
          isLeftPalin: true,
          isRightPalin: rightPalin,
          foundPairs: [...foundPairs],
          decision: `前缀 "${left}" 是回文！查询字典中是否存在反转后缀 "${revRight}"`,
          message: isValidMatch
            ? `🎯 命中！找到单词 words[${matchedIdx}] = "${words[matchedIdx]}"，可拼接成回文 [${matchedIdx}, ${i}]`
            : `字典中未找到不等于自身的 "${revRight}"`,
          log: `left is palindrome. revRight="${revRight}", found=${isValidMatch}`,
          codeLine: CODE_LINES.checkLeft,
          metrics: { '反转右后缀': `"${revRight}"`, '匹配结果': isValidMatch ? `words[${matchedIdx}]` : '无' }
        });

        if (isValidMatch) {
          foundPairs.push([matchedIdx!, i]);
          steps.push({
            words: [...words],
            currentWordIndex: i,
            splitPos: j,
            leftSub: left,
            rightSub: right,
            isLeftPalin: true,
            isRightPalin: rightPalin,
            foundPairs: [...foundPairs],
            currentCandidate: [matchedIdx!, i],
            decision: `🎉 收集回文对: [${matchedIdx}, ${i}] ➔ 拼接串 "${words[matchedIdx!]}${w}" 构成完美回文！`,
            message: `验证: "${words[matchedIdx!]}${w}" = "${words[matchedIdx!] + w}"`,
            log: `added pair [${matchedIdx}, ${i}]: "${words[matchedIdx!] + w}"`,
            codeLine: CODE_LINES.addLeftMatch,
            metrics: { '新增回文对': `[${matchedIdx}, ${i}]`, '回文串': `"${words[matchedIdx!] + w}"` }
          });
        }
      }

      // 情况 2: right 是回文 (且避免 j == w.length 时与情况 1 重复)
      if (j !== w.length && rightPalin) {
        const revLeft = left.split('').reverse().join('');
        const matchedIdx = wordMap.get(revLeft);
        const isValidMatch = matchedIdx !== undefined && matchedIdx !== i;

        steps.push({
          words: [...words],
          currentWordIndex: i,
          splitPos: j,
          leftSub: left,
          rightSub: right,
          isLeftPalin: leftPalin,
          isRightPalin: true,
          foundPairs: [...foundPairs],
          decision: `后缀 "${right}" 是回文！查询字典中是否存在反转前缀 "${revLeft}"`,
          message: isValidMatch
            ? `🎯 命中！找到单词 words[${matchedIdx}] = "${words[matchedIdx]}"，可拼接成回文 [${i}, ${matchedIdx}]`
            : `字典中未找到不等于自身的 "${revLeft}"`,
          log: `right is palindrome. revLeft="${revLeft}", found=${isValidMatch}`,
          codeLine: CODE_LINES.checkRight,
          metrics: { '反转左前缀': `"${revLeft}"`, '匹配结果': isValidMatch ? `words[${matchedIdx}]` : '无' }
        });

        if (isValidMatch) {
          foundPairs.push([i, matchedIdx!]);
          steps.push({
            words: [...words],
            currentWordIndex: i,
            splitPos: j,
            leftSub: left,
            rightSub: right,
            isLeftPalin: leftPalin,
            isRightPalin: true,
            foundPairs: [...foundPairs],
            currentCandidate: [i, matchedIdx!],
            decision: `🎉 收集回文对: [${i}, ${matchedIdx}] ➔ 拼接串 "${w}${words[matchedIdx!]}" 构成完美回文！`,
            message: `验证: "${w}${words[matchedIdx!]}" = "${w + words[matchedIdx!]}"`,
            log: `added pair [${i}, ${matchedIdx}]: "${w + words[matchedIdx!]}"`,
            codeLine: CODE_LINES.addRightMatch,
            metrics: { '新增回文对': `[${i}, ${matchedIdx}]`, '回文串': `"${w + words[matchedIdx!]}"` }
          });
        }
      }
    }
  }

  // 终态
  steps.push({
    words: [...words],
    currentWordIndex: -1,
    splitPos: -1,
    leftSub: '',
    rightSub: '',
    isLeftPalin: false,
    isRightPalin: false,
    foundPairs: [...foundPairs],
    decision: `🎉 搜索完成！共找到 ${foundPairs.length} 组有效回文对: [${foundPairs.map(p => `[${p[0]}, ${p[1]}]`).join(', ')}]`,
    message: '算法成功以 O(N * L²) 线性对偶耗时战胜暴力 O(N² * L) 复杂度',
    log: `finished palindromePairs, found ${foundPairs.length} pairs`,
    codeLine: CODE_LINES.returnAns,
    metrics: { '有效回文对数': `${foundPairs.length}`, '状态': '已收官' }
  });

  return steps;
}
