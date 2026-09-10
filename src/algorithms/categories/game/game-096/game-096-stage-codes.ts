/**
 * 左神算法通关课 第 096 课 - SG 函数与综合博弈多语言代码与相对行号映射
 */

// 1. 巴什博弈 SG 函数打表
export const BASH_SG_CODES: Record<string, string[]> = {
  java: [
    'public class BashGameSG {',
    '    public static int[] getBashSG(int n, int m) {',
    '        int[] sg = new int[n + 1];',
    '        boolean[] appear = new boolean[m + 2];',
    '        for (int i = 1; i <= n; i++) {',
    '            Arrays.fill(appear, false);',
    '            for (int j = 1; j <= m && i - j >= 0; j++) {',
    '                appear[sg[i - j]] = true;',
    '            }',
    '            for (int s = 0; s < appear.length; s++) {',
    '                if (!appear[s]) { sg[i] = s; break; }',
    '            }',
    '        }',
    '        return sg;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> getBashSG(int n, int m) {',
    '    vector<int> sg(n + 1, 0);',
    '    vector<bool> appear(m + 2, false);',
    '    for (int i = 1; i <= n; i++) {',
    '        fill(appear.begin(), appear.end(), false);',
    '        for (int j = 1; j <= m && i - j >= 0; j++) {',
    '            appear[sg[i - j]] = true;',
    '        }',
    '        for (int s = 0; s < appear.size(); s++) {',
    '            if (!appear[s]) { sg[i] = s; break; }',
    '        }',
    '    }',
    '    return sg;',
    '}',
  ],
  python: [
    'def get_bash_sg(n: int, m: int) -> list[int]:',
    '    sg = [0] * (n + 1)',
    '    for i in range(1, n + 1):',
    '        appear = set()',
    '        for j in range(1, m + 1):',
    '            if i - j >= 0:',
    '                appear.add(sg[i - j])',
    '        s = 0',
    '        while s in appear:',
    '            s += 1',
    '        sg[i] = s',
    '    return sg',
  ],
  javascript: [
    'function getBashSG(n, m) {',
    '    const sg = new Array(n + 1).fill(0);',
    '    for (let i = 1; i <= n; i++) {',
    '        const appear = new Set();',
    '        for (let j = 1; j <= m && i - j >= 0; j++) {',
    '            appear.add(sg[i - j]);',
    '        }',
    '        let s = 0;',
    '        while (appear.has(s)) s++;',
    '        sg[i] = s;',
    '    }',
    '    return sg;',
    '}',
  ],
};

export const BASH_SG_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  init: { java: 3, cpp: 2, python: 2, javascript: 2 },
  outerLoop: { java: 5, cpp: 4, python: 3, javascript: 3 },
  innerLoop: { java: 7, cpp: 6, python: 5, javascript: 5 },
  computeMex: { java: 11, cpp: 10, python: 11, javascript: 10 },
  returnAns: { java: 14, cpp: 13, python: 12, javascript: 12 },
};

// 2. 尼姆博弈 SG 函数
export const NIM_SG_CODES: Record<string, string[]> = {
  java: [
    'public class NimGameSG {',
    '    public static int[] getNimSG(int n) {',
    '        int[] sg = new int[n + 1];',
    '        for (int i = 1; i <= n; i++) {',
    '            sg[i] = i;',
    '        }',
    '        return sg;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> getNimSG(int n) {',
    '    vector<int> sg(n + 1, 0);',
    '    for (int i = 1; i <= n; i++) {',
    '        sg[i] = i;',
    '    }',
    '    return sg;',
    '}',
  ],
  python: [
    'def get_nim_sg(n: int) -> list[int]:',
    '    sg = [0] * (n + 1)',
    '    for i in range(1, n + 1):',
    '        sg[i] = i',
    '    return sg',
  ],
  javascript: [
    'function getNimSG(n) {',
    '    const sg = new Array(n + 1).fill(0);',
    '    for (let i = 1; i <= n; i++) {',
    '        sg[i] = i;',
    '    }',
    '    return sg;',
    '}',
  ],
};

export const NIM_SG_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  init: { java: 3, cpp: 2, python: 2, javascript: 2 },
  loop: { java: 4, cpp: 3, python: 3, javascript: 3 },
  assign: { java: 5, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 7, cpp: 6, python: 5, javascript: 6 },
};

// 3. 双堆巴什博弈
export const TWO_STONES_BASH_CODES: Record<string, string[]> = {
  java: [
    'public class TwoStonesBash {',
    '    public static boolean canWin(int n1, int n2, int m) {',
    '        int sg1 = n1 % (m + 1);',
    '        int sg2 = n2 % (m + 1);',
    '        return (sg1 ^ sg2) != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool twoStonesBash(int n1, int n2, int m) {',
    '    int sg1 = n1 % (m + 1);',
    '    int sg2 = n2 % (m + 1);',
    '    return (sg1 ^ sg2) != 0;',
    '}',
  ],
  python: [
    'def two_stones_bash(n1: int, n2: int, m: int) -> bool:',
    '    sg1 = n1 % (m + 1)',
    '    sg2 = n2 % (m + 1)',
    '    return (sg1 ^ sg2) != 0',
  ],
  javascript: [
    'function twoStonesBash(n1, n2, m) {',
    '    const sg1 = n1 % (m + 1);',
    '    const sg2 = n2 % (m + 1);',
    '    return (sg1 ^ sg2) !== 0;',
    '}',
  ],
};

export const TWO_STONES_BASH_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  computeSg1: { java: 3, cpp: 2, python: 2, javascript: 2 },
  computeSg2: { java: 4, cpp: 3, python: 3, javascript: 3 },
  returnAns: { java: 5, cpp: 4, python: 4, javascript: 4 },
};

// 4. 三堆石子取斐波那契数 SG
export const THREE_STONES_FIB_CODES: Record<string, string[]> = {
  java: [
    'public class ThreeStonesFibonacci {',
    '    public static boolean canWin(int n1, int n2, int n3, int[] fibs) {',
    '        int maxN = Math.max(n1, Math.max(n2, n3));',
    '        int[] sg = buildSG(maxN, fibs);',
    '        int xorSum = sg[n1] ^ sg[n2] ^ sg[n3];',
    '        return xorSum != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool threeStonesFib(int n1, int n2, int n3, vector<int>& fibs) {',
    '    int maxN = max({n1, n2, n3});',
    '    vector<int> sg = buildSG(maxN, fibs);',
    '    int xorSum = sg[n1] ^ sg[n2] ^ sg[n3];',
    '    return xorSum != 0;',
    '}',
  ],
  python: [
    'def three_stones_fib(n1: int, n2: int, n3: int, fibs: list[int]) -> bool:',
    '    max_n = max(n1, n2, n3)',
    '    sg = build_sg(max_n, fibs)',
    '    xor_sum = sg[n1] ^ sg[n2] ^ sg[n3]',
    '    return xor_sum != 0',
  ],
  javascript: [
    'function threeStonesFib(n1, n2, n3, fibs) {',
    '    const maxN = Math.max(n1, n2, n3);',
    '    const sg = buildSG(maxN, fibs);',
    '    const xorSum = sg[n1] ^ sg[n2] ^ sg[n3];',
    '    return xorSum !== 0;',
    '}',
  ],
};

export const THREE_STONES_FIB_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  findMaxN: { java: 3, cpp: 2, python: 2, javascript: 2 },
  buildSg: { java: 4, cpp: 3, python: 3, javascript: 3 },
  computeXor: { java: 5, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 6, cpp: 5, python: 5, javascript: 5 },
};

// 5. 欧几里得翻硬币博弈
export const COIN_FLIP_CODES: Record<string, string[]> = {
  java: [
    'public class CoinFlipGame {',
    '    public static boolean canWin(int[] coins) {',
    '        int xorSum = 0;',
    '        for (int i = 0; i < coins.length; i++) {',
    '            if (coins[i] == 1) {',
    '                xorSum ^= getSingleSG(i);',
    '            }',
    '        }',
    '        return xorSum != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool coinFlipGame(vector<int>& coins) {',
    '    int xorSum = 0;',
    '    for (int i = 0; i < coins.size(); i++) {',
    '        if (coins[i] == 1) {',
    '            xorSum ^= getSingleSG(i);',
    '        }',
    '    }',
    '    return xorSum != 0;',
    '}',
  ],
  python: [
    'def coin_flip_game(coins: list[int]) -> bool:',
    '    xor_sum = 0',
    '    for i in range(len(coins)):',
    '        if coins[i] == 1:',
    '            xor_sum ^= get_single_sg(i)',
    '    return xor_sum != 0',
  ],
  javascript: [
    'function coinFlipGame(coins) {',
    '    let xorSum = 0;',
    '    for (let i = 0; i < coins.length; i++) {',
    '        if (coins[i] === 1) {',
    '            xorSum ^= getSingleSG(i);',
    '        }',
    '    }',
    '    return xorSum !== 0;',
    '}',
  ],
};

export const COIN_FLIP_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  initXor: { java: 3, cpp: 2, python: 2, javascript: 2 },
  loopHeader: { java: 4, cpp: 3, python: 3, javascript: 3 },
  accumulate: { java: 6, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 9, cpp: 8, python: 6, javascript: 8 },
};

// 6. 分裂石子游戏
export const SPLIT_GAME_CODES: Record<string, string[]> = {
  java: [
    'public class SplitGame {',
    '    public static int[] getSplitSG(int n) {',
    '        int[] sg = new int[n + 1];',
    '        for (int i = 2; i <= n; i++) {',
    '            Set<Integer> appear = new HashSet<>();',
    '            for (int y = 1; y <= i / 2; y++) {',
    '                int z = i - y;',
    '                appear.add(sg[y] ^ sg[z]);',
    '            }',
    '            int s = 0;',
    '            while (appear.contains(s)) s++;',
    '            sg[i] = s;',
    '        }',
    '        return sg;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> getSplitSG(int n) {',
    '    vector<int> sg(n + 1, 0);',
    '    for (int i = 2; i <= n; i++) {',
    '        unordered_set<int> appear;',
    '        for (int y = 1; y <= i / 2; y++) {',
    '            int z = i - y;',
    '            appear.insert(sg[y] ^ sg[z]);',
    '        }',
    '        int s = 0;',
    '        while (appear.count(s)) s++;',
    '        sg[i] = s;',
    '    }',
    '    return sg;',
    '}',
  ],
  python: [
    'def get_split_sg(n: int) -> list[int]:',
    '    sg = [0] * (n + 1)',
    '    for i in range(2, n + 1):',
    '        appear = set()',
    '        for y in range(1, i // 2 + 1):',
    '            z = i - y',
    '            appear.add(sg[y] ^ sg[z])',
    '        s = 0',
    '        while s in appear:',
    '            s += 1',
    '        sg[i] = s',
    '    return sg',
  ],
  javascript: [
    'function getSplitSG(n) {',
    '    const sg = new Array(n + 1).fill(0);',
    '    for (let i = 2; i <= n; i++) {',
    '        const appear = new Set();',
    '        for (let y = 1; y <= Math.floor(i / 2); y++) {',
    '            const z = i - y;',
    '            appear.add(sg[y] ^ sg[z]);',
    '        }',
    '        let s = 0;',
    '        while (appear.has(s)) s++;',
    '        sg[i] = s;',
    '    }',
    '    return sg;',
    '}',
  ],
};

export const SPLIT_GAME_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  init: { java: 3, cpp: 2, python: 2, javascript: 2 },
  outerLoop: { java: 4, cpp: 3, python: 3, javascript: 3 },
  innerSplit: { java: 8, cpp: 7, python: 7, javascript: 7 },
  computeMex: { java: 11, cpp: 10, python: 11, javascript: 10 },
  returnAns: { java: 14, cpp: 13, python: 12, javascript: 13 },
};
