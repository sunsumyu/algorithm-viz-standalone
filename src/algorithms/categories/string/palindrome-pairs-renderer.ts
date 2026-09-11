import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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

const CODE_LINES = {
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

function isPalin(s: string): boolean {
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

export function renderPalindromePairsCanvas(container: HTMLElement, step: PalindromePairsStep): void {
  const { words, currentWordIndex, splitPos, leftSub, rightSub, isLeftPalin, isRightPalin, foundPairs, currentCandidate } = step;

  const wordsHtml = words.map((w, idx) => {
    const isCurrent = idx === currentWordIndex;
    return `
      <div style="
        padding: 8px 14px;
        background: ${isCurrent ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.5)'};
        border: 1px solid ${isCurrent ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: ${isCurrent ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'};
      ">
        <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">[${idx}]</span>
        <span style="font-weight: 700; color: ${isCurrent ? '#38bdf8' : '#f8fafc'}; font-size: 1.05rem;">"${w}"</span>
      </div>
    `;
  }).join('');

  const pairsHtml = foundPairs.map(([a, b]) => {
    const isLatest = currentCandidate && currentCandidate[0] === a && currentCandidate[1] === b;
    return `
      <div style="
        padding: 8px 12px;
        background: ${isLatest ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.12)'};
        border: 1px solid ${isLatest ? '#34d399' : 'rgba(16, 185, 129, 0.3)'};
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
      ">
        <span style="color: #34d399; font-weight: 700;">[${a}, ${b}]</span>
        <span style="color: #cbd5e1; font-size: 0.85rem;">"${words[a] + words[b]}"</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 上半区：单词集看板 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      ">
        <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">📚 待检索单词集 (Word Set)</span>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${wordsHtml}
        </div>
      </div>

      <!-- 中间区：前后缀拆解与回文检测卡片 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 20px;
      ">
        <!-- 左侧：前后缀拆解模拟 -->
        <div style="flex: 3; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; justify-content: space-between;">
            <span>✂️ 单词前后缀切分探针</span>
            ${currentWordIndex >= 0 ? `<span style="font-size: 0.82rem; color: #38bdf8;">当前: "${words[currentWordIndex]}" (位置 j = ${splitPos})</span>` : ''}
          </div>

          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 24px;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 10px;
          ">
            <div style="
              padding: 12px 20px;
              background: ${isLeftPalin ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.15)'};
              border: 1px solid ${isLeftPalin ? '#34d399' : '#38bdf8'};
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 0.75rem; color: #94a3b8;">左前缀 (left)</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: ${isLeftPalin ? '#34d399' : '#38bdf8'};">"${leftSub}"</div>
              <div style="font-size: 0.72rem; color: ${isLeftPalin ? '#34d399' : '#64748b'}; margin-top: 4px;">${isLeftPalin ? '✓ 自身回文' : '非回文'}</div>
            </div>

            <div style="font-size: 1.5rem; color: #64748b;">+</div>

            <div style="
              padding: 12px 20px;
              background: ${isRightPalin ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 114, 182, 0.15)'};
              border: 1px solid ${isRightPalin ? '#34d399' : '#f472b6'};
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 0.75rem; color: #94a3b8;">右后缀 (right)</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: ${isRightPalin ? '#34d399' : '#f472b6'};">"${rightSub}"</div>
              <div style="font-size: 0.72rem; color: ${isRightPalin ? '#34d399' : '#64748b'}; margin-top: 4px;">${isRightPalin ? '✓ 自身回文' : '非回文'}</div>
            </div>
          </div>

          <div style="
            padding: 10px 14px;
            background: rgba(30, 41, 59, 0.4);
            border-left: 3px solid #f472b6;
            border-radius: 0 6px 6px 0;
            font-size: 0.82rem;
            color: #94a3b8;
            line-height: 1.5;
          ">
            💡 <b>回文对核心定理</b>：若单词拆为 $left + right$，$left$ 是回文，则寻找 $reverse(right) + left + right$；若 $right$ 是回文，则寻找 $left + right + reverse(left)$。
          </div>
        </div>

        <!-- 右侧：已收集回文对池 -->
        <div style="flex: 2; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; justify-content: space-between;">
            <span>🎯 成功匹配回文对</span>
            <span style="font-size: 0.82rem; color: #34d399;">共 ${foundPairs.length} 组</span>
          </div>

          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.4);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            overflow-y: auto;
            max-height: 180px;
          ">
            ${pairsHtml.length ? pairsHtml : '<div style="color:#64748b; font-size:0.82rem; margin:auto;">暂未匹配到回文对</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'palindrome-pairs',
  name: '大厂高频真题: 回文对 (Palindrome Pairs)',
  category: 'string',
  learningGoal: '掌握前缀后缀回文分解与哈希对偶检索技巧，将 O(N² * L) 暴力判定优化至 O(N * L²)',
  inputs: [
    {
      id: 'words',
      label: '单词数组',
      type: 'text',
      defaultValue: 'abcd, dcba, lls, s, sssll',
      placeholder: '逗号分隔单词，如 abcd, dcba, lls, s, sssll'
    }
  ],
  codeLanguages: PALINDROME_PAIRS_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.words || 'abcd, dcba, lls, s, sssll');
    const words = raw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    return buildPalindromePairsSteps(words.length ? words : ['abcd', 'dcba', 'lls', 's', 'sssll']);
  },
  renderCanvas: (container, step) => {
    renderPalindromePairsCanvas(container, step as PalindromePairsStep);
  }
});
