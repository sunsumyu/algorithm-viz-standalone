/**
 * 自由之路环形 DP (LeetCode 514 / 大厂高频 Hard)
 * Step Compiler: 环形转盘双向旋转步数最短路径 min(|i - j|, n - |i - j|) 推演编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface FreedomTrailStep extends StepBase {
  stepIndex?: number;
  ring: string;
  key: string;
  keyIdx: number;
  ringPos: number;
  chosenTargetPos?: number;
  rotateCost?: number;
  accumulatedSteps: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const FREEDOM_TRAIL_CODES = {
  java: `public class FreedomTrail {
    public static int findRotateSteps(String ring, String key) {
        int n = ring.length(), m = key.length();
        // 预处理每个字符在 ring 中的所有出现位置
        List<Integer>[] pos = new List[26];
        for (int i = 0; i < 26; i++) pos[i] = new ArrayList<>();
        for (int i = 0; i < n; i++) pos[ring.charAt(i) - 'a'].add(i);

        int[][] dp = new int[m + 1][n];
        for (int i = m - 1; i >= 0; i--) {
            int targetChar = key.charAt(i) - 'a';
            for (int j = 0; j < n; j++) {
                int minSteps = Integer.MAX_VALUE;
                for (int nextPos : pos[targetChar]) {
                    int diff = Math.abs(j - nextPos);
                    int step = Math.min(diff, n - diff);
                    minSteps = Math.min(minSteps, step + 1 + dp[i + 1][nextPos]);
                }
                dp[i][j] = minSteps;
            }
        }
        return dp[0][0];
    }
}`,
  cpp: `class FreedomTrail {
public:
    static int findRotateSteps(const string& ring, const string& key) {
        int n = ring.size(), m = key.size();
        vector<vector<int>> pos(26);
        for (int i = 0; i < n; ++i) pos[ring[i] - 'a'].push_back(i);

        vector<vector<int>> dp(m + 1, vector<int>(n, 0));
        for (int i = m - 1; i >= 0; --i) {
            int target = key[i] - 'a';
            for (int j = 0; j < n; ++j) {
                int minSteps = 1e9;
                for (int nextPos : pos[target]) {
                    int diff = abs(j - nextPos);
                    int step = min(diff, n - diff);
                    minSteps = min(minSteps, step + 1 + dp[i + 1][nextPos]);
                }
                dp[i][j] = minSteps;
            }
        }
        return dp[0][0];
    }
};`,
  python: `class FreedomTrail:
    @staticmethod
    def find_rotate_steps(ring: str, key: str) -> int:
        n, m = len(ring), len(key)
        import collections
        pos = collections.defaultdict(list)
        for i, ch in enumerate(ring):
            pos[ch].append(i)

        dp = [[0] * n for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            target = key[i]
            for j in range(n):
                min_steps = float('inf')
                for next_pos in pos[target]:
                    diff = abs(j - next_pos)
                    step = min(diff, n - diff)
                    min_steps = min(min_steps, step + 1 + dp[i + 1][next_pos])
                dp[i][j] = min_steps
        return dp[0][0]`,
  typescript: `export class FreedomTrail {
  static findRotateSteps(ring: string, key: string): number {
    const n = ring.length, m = key.length;
    const pos: Map<string, number[]> = new Map();
    for (let i = 0; i < n; i++) {
      const ch = ring[i];
      if (!pos.has(ch)) pos.set(ch, []);
      pos.get(ch)!.push(i);
    }

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      const target = key[i];
      const targets = pos.get(target) || [];
      for (let j = 0; j < n; j++) {
        let minSteps = Infinity;
        for (const nextPos of targets) {
          const diff = Math.abs(j - nextPos);
          const step = Math.min(diff, n - diff);
          minSteps = Math.min(minSteps, step + 1 + dp[i + 1][nextPos]);
        }
        dp[i][j] = minSteps;
      }
    }
    return dp[0][0];
  }
}`
};

export const FREEDOM_TRAIL_CODE_LINES = {
  init: { java: 4, cpp: 4, python: 4, typescript: 3 },
  step: { java: 17, cpp: 16, python: 15, typescript: 17 },
  finish: { java: 22, cpp: 21, python: 20, typescript: 25 },
};

export function generateFreedomTrailSteps(ring: string, key: string): FreedomTrailStep[] {
  const steps: FreedomTrailStep[] = [];
  const n = ring.length;
  const m = key.length;
  let currentRingPos = 0;
  let accumulatedSteps = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    ring,
    key,
    keyIdx: 0,
    ringPos: 0,
    accumulatedSteps: 0,
    decision: `初始化自由之路转盘：ring="${ring}", key="${key}"。转盘初始对准下标 0 ('${ring[0]}')`,
    message: '转盘初始化',
    log: '初始化 FreedomTrail',
    codeLine: FREEDOM_TRAIL_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      targetChar: key[0] ? `'${key[0]}' (1/${m})` : '就绪',
      ringPos: `0 ('${ring[0]}')`,
      rotateCost: '0 步',
      accumulatedSteps: '0 步',
    },
    ans: '0 步',
  });

  for (let k = 0; k < m; k++) {
    const targetChar = key[k];
    const candidateIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (ring[i] === targetChar) candidateIndices.push(i);
    }

    let bestNext = candidateIndices[0];
    let bestDist = Infinity;

    for (const cand of candidateIndices) {
      const diff = Math.abs(currentRingPos - cand);
      const dist = Math.min(diff, n - diff);
      if (dist < bestDist) {
        bestDist = dist;
        bestNext = cand;
      }
    }

    const pressStep = bestDist + 1; // 旋转 + 拼写按键 1 步
    accumulatedSteps += pressStep;

    steps.push({
      stepIndex: stepIdx++,
      ring,
      key,
      keyIdx: k,
      ringPos: currentRingPos,
      chosenTargetPos: bestNext,
      rotateCost: bestDist,
      accumulatedSteps,
      decision: `拼写 key[${k}]='${targetChar}'：从当前转盘下标 ${currentRingPos} ('${ring[currentRingPos]}') 旋转至下标 ${bestNext} ('${ring[bestNext]}')。最小旋转距离 = min(|${currentRingPos}-${bestNext}|, ${n}-|${currentRingPos}-${bestNext}|) = ${bestDist} 步，加上按下中心按钮 1 步，共耗费 ${pressStep} 步。当前累计总步数 = ${accumulatedSteps}`,
      message: `拼写 '${targetChar}': 耗费 ${pressStep} 步`,
      log: `Key[${k}]='${targetChar}' -> 旋转至 ${bestNext}, 消耗 ${pressStep}`,
      codeLine: FREEDOM_TRAIL_CODE_LINES.step,
      statusBadge: { text: `拼写 '${targetChar}' (+${pressStep})`, type: 'success' },
      metrics: {
        targetChar: `'${targetChar}' (${k + 1}/${m})`,
        ringPos: `${currentRingPos} ➔ ${bestNext}`,
        rotateCost: `${bestDist} 步 (转) + 1 (按)`,
        accumulatedSteps: `${accumulatedSteps} 步`,
      },
      ans: `${accumulatedSteps} 步`,
    });

    currentRingPos = bestNext;
  }

  steps.push({
    stepIndex: stepIdx++,
    ring,
    key,
    keyIdx: m,
    ringPos: currentRingPos,
    accumulatedSteps,
    decision: `目标关键词 "${key}" 全部字符拼写完毕！解锁自由之路最少总旋转与按下步数 = ${accumulatedSteps}`,
    message: `全部拼写完成，总步数: ${accumulatedSteps}`,
    log: `拼写完成，总步数 ${accumulatedSteps}`,
    codeLine: FREEDOM_TRAIL_CODE_LINES.finish,
    statusBadge: { text: `最少步数: ${accumulatedSteps}`, type: 'success' },
    metrics: {
      targetChar: '全部完成',
      ringPos: `${currentRingPos} ('${ring[currentRingPos]}')`,
      rotateCost: '结算完成',
      accumulatedSteps: `${accumulatedSteps} 步`,
    },
    ans: `${accumulatedSteps} 步`,
  });

  return steps;
}
