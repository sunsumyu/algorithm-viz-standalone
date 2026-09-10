/**
 * Class 030: 递归子序列与去重全排列 (Subsequences & Permutations)
 * 左程云算法通关课入门篇 Class 030
 * 递归分支设计与剪枝去重技巧
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface PermStep extends StepBase {
  chars: string[];
  depth: number;
  currentPath: string;
  results: string[];
  swappedPair?: [number, number];
  prunedBranch?: string;
  mode: 'subsequence' | 'permutation';
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const PERMUTATIONS_030_CODES = {
  java: `public class RecursionPractice {
    // 1. 打印字符串的全部子序列 (选/不选二分决策)
    public static List<String> generateSubsequences(String s) {
        List<String> ans = new ArrayList<>();
        subseq(s.toCharArray(), 0, new StringBuilder(), ans);
        return ans;
    }
    static void subseq(char[] str, int i, StringBuilder path, List<String> ans) {
        if (i == str.length) { ans.add(path.toString()); return; }
        // 决策 1: 不要当前字符
        subseq(str, i + 1, path, ans);
        // 决策 2: 要当前字符
        path.append(str[i]);
        subseq(str, i + 1, path, ans);
        path.deleteCharAt(path.length() - 1);
    }
    // 2. 打印字符串的全部排列 (带分支剪枝去重)
    public static List<String> generatePermutations(String s) {
        List<String> ans = new ArrayList<>();
        perm(s.toCharArray(), 0, ans);
        return ans;
    }
    static void perm(char[] str, int i, List<String> ans) {
        if (i == str.length) { ans.add(String.valueOf(str)); return; }
        boolean[] visited = new boolean[256];
        for (int j = i; j < str.length; j++) {
            if (!visited[str[j]]) {
                visited[str[j]] = true;
                swap(str, i, j);
                perm(str, i + 1, ans);
                swap(str, i, j); // 回溯恢复现场
            }
        }
    }
    static void swap(char[] str, int i, int j) { char t=str[i]; str[i]=str[j]; str[j]=t; }
}`,
  cpp: `void subseq(string& s, int i, string path, vector<string>& ans) {
    if (i == s.size()) { ans.push_back(path); return; }
    subseq(s, i + 1, path, ans);
    subseq(s, i + 1, path + s[i], ans);
}
void perm(string& s, int i, vector<string>& ans) {
    if (i == s.size()) { ans.push_back(s); return; }
    vector<bool> visited(256, false);
    for (int j = i; j < s.size(); j++) {
        if (!visited[(unsigned char)s[j]]) {
            visited[(unsigned char)s[j]] = true;
            swap(s[i], s[j]);
            perm(s, i + 1, ans);
            swap(s[i], s[j]);
        }
    }
}`,
  python: `def generate_subsequences(s):
    ans = []
    def subseq(i, path):
        if i == len(s):
            ans.append("".join(path))
            return
        subseq(i + 1, path)
        path.append(s[i])
        subseq(i + 1, path)
        path.pop()
    subseq(0, [])
    return ans

def generate_permutations(s):
    ans, arr = [], list(s)
    def perm(i):
        if i == len(arr):
            ans.append("".join(arr))
            return
        visited = set()
        for j in range(i, len(arr)):
            if arr[j] not in visited:
                visited.add(arr[j])
                arr[i], arr[j] = arr[j], arr[i]
                perm(i + 1)
                arr[i], arr[j] = arr[j], arr[i]
    perm(0)
    return ans`,
  typescript: `export function generateSubsequences(s: string): string[] {
  const ans: string[] = [];
  const dfs = (i: number, path: string) => {
    if (i === s.length) { ans.push(path); return; }
    dfs(i + 1, path);
    dfs(i + 1, path + s[i]);
  };
  dfs(0, '');
  return ans;
}

export function generatePermutations(s: string): string[] {
  const ans: string[] = [];
  const arr = s.split('');
  const dfs = (i: number) => {
    if (i === arr.length) { ans.push(arr.join('')); return; }
    const visited = new Set<string>();
    for (let j = i; j < arr.length; j++) {
      if (!visited.has(arr[j])) {
        visited.add(arr[j]);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        dfs(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  };
  dfs(0);
  return ans;
}`
};

export function buildPermutation030Steps(
  rawStr: string = 'abc',
  mode: 'subsequence' | 'permutation' = 'subsequence'
): PermStep[] {
  const steps: PermStep[] = [];
  const chars = rawStr.split('');
  const results: string[] = [];

  steps.push({
    chars: [...chars],
    depth: 0,
    currentPath: '',
    results: [],
    mode,
    decision: `主函数入口：开始生成 "${rawStr}" 的全部【${mode === 'subsequence' ? '子序列' : '去重全排列'}】`,
    message: mode === 'subsequence'
      ? '子序列每个字符有“要”或“不要”两种选择，共有 2^N 种组合。'
      : '全排列通过下标 swap 与 visited 集合进行回溯剪枝，消除相同字符重复分支。',
    log: `Init ${mode} for "${rawStr}"`,
    codeLine: 4,
    statusBadge: { text: '就绪', type: 'info' }
  });

  if (mode === 'subsequence') {
    const dfs = (i: number, path: string) => {
      if (i === chars.length) {
        results.push(path || '""(空)');
        steps.push({
          chars: [...chars],
          depth: i,
          currentPath: path,
          results: [...results],
          mode,
          decision: `到达叶子节点：收集一个有效子序列 "${path || '""'}"`,
          message: `路径收集成功，累计已有 ${results.length} 个子序列。`,
          log: `Collect subseq: "${path}"`,
          codeLine: 9,
          statusBadge: { text: `收集: "${path}"`, type: 'success' }
        });
        return;
      }

      // 决策 1: 不要当前字符
      steps.push({
        chars: [...chars],
        depth: i,
        currentPath: path,
        results: [...results],
        mode,
        decision: `考察字符 #${i} ('${chars[i]}')：分支【不要该字符】`,
        message: `不加入 '${chars[i]}'，path 保持 "${path}" 下潜至第 ${i + 1} 层。`,
        log: `depth=${i}, omit '${chars[i]}'`,
        codeLine: 11,
        statusBadge: { text: `不要 '${chars[i]}'`, type: 'info' }
      });
      dfs(i + 1, path);

      // 决策 2: 要当前字符
      steps.push({
        chars: [...chars],
        depth: i,
        currentPath: path + chars[i],
        results: [...results],
        mode,
        decision: `考察字符 #${i} ('${chars[i]}')：分支【要该字符】`,
        message: `加入 '${chars[i]}'，path 扩展为 "${path + chars[i]}" 下潜至第 ${i + 1} 层。`,
        log: `depth=${i}, pick '${chars[i]}'`,
        codeLine: 13,
        statusBadge: { text: `选择 '${chars[i]}'`, type: 'warning' }
      });
      dfs(i + 1, path + chars[i]);
    };
    dfs(0, '');
  } else {
    // 全排列
    const arr = [...chars];
    const permDfs = (i: number) => {
      if (i === arr.length) {
        const item = arr.join('');
        results.push(item);
        steps.push({
          chars: [...arr],
          depth: i,
          currentPath: item,
          results: [...results],
          mode,
          decision: `到达排列底层：收集排列方案 "${item}"`,
          message: `已就位所有字符，得到有效排列 "${item}"。`,
          log: `Collect perm: "${item}"`,
          codeLine: 24,
          statusBadge: { text: `收集: "${item}"`, type: 'success' }
        });
        return;
      }

      const visited = new Set<string>();
      for (let j = i; j < arr.length; j++) {
        if (!visited.has(arr[j])) {
          visited.add(arr[j]);
          // 交换
          const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;

          steps.push({
            chars: [...arr],
            depth: i,
            currentPath: arr.slice(0, i + 1).join(''),
            results: [...results],
            swappedPair: [i, j],
            mode,
            decision: `位置 #${i} 与位置 #${j} 交换：字符 '${arr[i]}' 确定为当前位候选`,
            message: `进入递归深层探索后续排列。`,
            log: `swap(arr[${i}], arr[${j}]) -> '${arr[i]}'`,
            codeLine: 28,
            statusBadge: { text: `固定 '${arr[i]}'`, type: 'info' }
          });

          permDfs(i + 1);

          // 回溯恢复
          const tmp2 = arr[i]; arr[i] = arr[j]; arr[j] = tmp2;
        } else {
          steps.push({
            chars: [...arr],
            depth: i,
            currentPath: arr.slice(0, i).join(''),
            results: [...results],
            prunedBranch: arr[j],
            mode,
            decision: `🚫 发现重复字符 '${arr[j]}'，触发剪枝！跳过该分支`,
            message: `同层位置 #${i} 已尝试过字符 '${arr[j]}'，避免产生重复全排列。`,
            log: `Prune duplicate char '${arr[j]}'`,
            codeLine: 26,
            statusBadge: { text: `剪枝 '${arr[j]}'`, type: 'danger' }
          });
        }
      }
    };
    permDfs(0);
  }

  steps.push({
    chars: [...chars],
    depth: chars.length,
    currentPath: 'COMPLETE',
    results: [...results],
    mode,
    decision: `全部生成完毕！共计产生 ${results.length} 种有效方案`,
    message: `递归所有路径探索结束，方案列表完整呈现在结果看板中。`,
    log: `Finished. total results = ${results.length}`,
    codeLine: mode === 'subsequence' ? 16 : 31,
    statusBadge: { text: '生成完毕', type: 'success' }
  });

  return steps;
}

export function renderPermutationSandbox(step: PermStep): string {
  const pillsHtml = step.results.map((r, idx) => `
    <span style="display:inline-block; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:3px 8px; margin:2px; font-family:monospace; font-weight:700; font-size:12px; color:#0f172a;">
      <b style="color:#64748b;">${idx + 1}.</b> ${r}
    </span>
  `).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 递归当前状态看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前递归深度</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">第 ${step.depth} 层</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前累加 Path / 状态</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">"${step.currentPath}"</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">已收集结果数</div>
          <div style="font-size:16px; font-weight:800; color:#15803d;">${step.results.length} 种</div>
        </div>
      </div>

      <!-- 结果方案展示池 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:8px;">
          🎯 方案汇总列表 (${step.mode === 'subsequence' ? '全部子序列' : '去重全排列'})
        </div>
        <div style="max-height:160px; overflow-y:auto; padding:4px;">
          ${pillsHtml || '<span style="color:#94a3b8; font-style:italic;">等待生成...</span>'}
        </div>
      </div>

      ${renderFormulaCard(
        '子序列 vs 全排列递归哲学',
        '子序列：每个字符选/不选二叉决策树 (2^N)；全排列：每个位置与后续元素交换 (N!)，同层字符使用 visited 剪枝防重！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const permutationsSubsequencesVisualizer = registerDeclarativeAlgorithm<PermStep>({
  id: 'permutations-subsequences-030',
  name: '递归子序列与去重全排列 (Class 030)',
  category: 'backtracking',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 30,
  learningGoal: '深刻掌握递归二分决策树生成子序列与 swap 回溯结合 visited 剪枝去重生成全排列',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 030)</h3>
      <p>递归与回溯是算法思维的核心分水岭。本节包含两个最经典高频问题：</p>
      <ul>
        <li><strong>打印一个字符串的全部子序列</strong>：从左向右扫描，每个字符面临“加入当前子序列”和“不加入当前子序列”两种互斥决策。</li>
        <li><strong>打印一个字符串的全部全排列（去重）</strong>：通过位置 swap 将未确定的字符逐个移至当前位；遇到相同字符时利用 visited 集合剪枝，防止产生重复排列。</li>
      </ul>
    </div>
  `,
  codeLanguages: PERMUTATIONS_030_CODES,
  inputs: [
    {
      id: 'mode',
      label: '递归题目类型',
      type: 'select',
      defaultValue: 'subsequence',
      options: [
        { label: '全部子序列 (Subsequences)', value: 'subsequence' },
        { label: '去重全排列 (Permutations)', value: 'permutation' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = input.mode === 'permutation' ? 'permutation' : 'subsequence';
    return buildPermutation030Steps('abc', mode);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPermutationSandbox(step)}
      </div>
    `;
  },
});
