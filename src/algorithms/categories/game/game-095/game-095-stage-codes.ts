/**
 * 左神算法通关课 第 095 课 - 经典博弈论代码与 1-based 相对行号映射
 */

// 1. 巴什博弈
export const BASH_GAME_CODES: Record<string, string[]> = {
  java: [
    'public class BashGame {',
    '    public static boolean bash(int n, int m) {',
    '        if (m <= 0 || n <= 0) return false;',
    '        int r = n % (m + 1);',
    '        return r != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool bashGame(int n, int m) {',
    '    if (m <= 0 || n <= 0) return false;',
    '    int r = n % (m + 1);',
    '    return r != 0;',
    '}',
  ],
  python: [
    'def bash_game(n: int, m: int) -> bool:',
    '    if m <= 0 or n <= 0:',
    '        return False',
    '    r = n % (m + 1)',
    '    return r != 0',
  ],
  javascript: [
    'function bashGame(n, m) {',
    '    if (m <= 0 || n <= 0) return false;',
    '    const r = n % (m + 1);',
    '    return r !== 0;',
    '}',
  ],
};

export const BASH_GAME_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  computeMod: { java: 4, cpp: 3, python: 4, javascript: 3 },
  returnAns: { java: 5, cpp: 4, python: 5, javascript: 4 },
};

// 2. 素数幂石子博弈
export const PRIME_POWER_CODES: Record<string, string[]> = {
  java: [
    'public class PrimePowerStones {',
    '    public static boolean canWin(int n) {',
    '        if (n <= 0) return false;',
    '        int mod = n % 6;',
    '        return mod != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool primePowerGame(int n) {',
    '    if (n <= 0) return false;',
    '    int mod = n % 6;',
    '    return mod != 0;',
    '}',
  ],
  python: [
    'def prime_power_game(n: int) -> bool:',
    '    if n <= 0:',
    '        return False',
    '    mod = n % 6',
    '    return mod != 0',
  ],
  javascript: [
    'function primePowerGame(n) {',
    '    if (n <= 0) return false;',
    '    const mod = n % 6;',
    '    return mod !== 0;',
    '}',
  ],
};

export const PRIME_POWER_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  computeMod: { java: 4, cpp: 3, python: 4, javascript: 3 },
  returnAns: { java: 5, cpp: 4, python: 5, javascript: 4 },
};

// 3. 经典尼姆博弈
export const NIM_GAME_CODES: Record<string, string[]> = {
  java: [
    'public class NimGame {',
    '    public static boolean canWinNim(int[] piles) {',
    '        if (piles == null || piles.length == 0) return false;',
    '        int xorSum = 0;',
    '        for (int stones : piles) {',
    '            xorSum ^= stones;',
    '        }',
    '        return xorSum != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool canWinNim(vector<int>& piles) {',
    '    if (piles.empty()) return false;',
    '    int xorSum = 0;',
    '    for (int stones : piles) {',
    '        xorSum ^= stones;',
    '    }',
    '    return xorSum != 0;',
    '}',
  ],
  python: [
    'def can_win_nim(piles: list[int]) -> bool:',
    '    if not piles:',
    '        return False',
    '    xor_sum = 0',
    '    for stones in piles:',
    '        xor_sum ^= stones',
    '    return xor_sum != 0',
  ],
  javascript: [
    'function canWinNim(piles) {',
    '    if (!piles || piles.length === 0) return false;',
    '    let xorSum = 0;',
    '    for (const stones of piles) {',
    '        xorSum ^= stones;',
    '    }',
    '    return xorSum !== 0;',
    '}',
  ],
};

export const NIM_GAME_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initXor: { java: 4, cpp: 3, python: 4, javascript: 3 },
  loopHeader: { java: 5, cpp: 4, python: 5, javascript: 4 },
  xorCompute: { java: 6, cpp: 5, python: 6, javascript: 5 },
  returnAns: { java: 8, cpp: 7, python: 7, javascript: 7 },
};

// 4. 反尼姆博弈 / SJ 定理
export const ANTI_NIM_CODES: Record<string, string[]> = {
  java: [
    'public class AntiNimGame {',
    '    public static boolean antiNim(int[] piles) {',
    '        int xorSum = 0;',
    '        int maxPile = 0;',
    '        for (int stones : piles) {',
    '            xorSum ^= stones;',
    '            maxPile = Math.max(maxPile, stones);',
    '        }',
    '        if (maxPile <= 1) {',
    '            return (piles.length % 2) == 0;',
    '        }',
    '        return xorSum != 0;',
    '    }',
    '}',
  ],
  cpp: [
    'bool antiNimGame(vector<int>& piles) {',
    '    int xorSum = 0;',
    '    int maxPile = 0;',
    '    for (int stones : piles) {',
    '        xorSum ^= stones;',
    '        maxPile = max(maxPile, stones);',
    '    }',
    '    if (maxPile <= 1) {',
    '        return (piles.size() % 2) == 0;',
    '    }',
    '    return xorSum != 0;',
    '}',
  ],
  python: [
    'def anti_nim_game(piles: list[int]) -> bool:',
    '    xor_sum = 0',
    '    max_pile = 0',
    '    for stones in piles:',
    '        xor_sum ^= stones',
    '        max_pile = max(max_pile, stones)',
    '    if max_pile <= 1:',
    '        return (len(piles) % 2) == 0',
    '    return xor_sum != 0',
  ],
  javascript: [
    'function antiNimGame(piles) {',
    '    let xorSum = 0;',
    '    let maxPile = 0;',
    '    for (const stones of piles) {',
    '        xorSum ^= stones;',
    '        maxPile = Math.max(maxPile, stones);',
    '    }',
    '    if (maxPile <= 1) {',
    '        return (piles.length % 2) === 0;',
    '    }',
    '    return xorSum !== 0;',
    '}',
  ],
};

export const ANTI_NIM_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  initVars: { java: 3, cpp: 2, python: 2, javascript: 2 },
  loopHeader: { java: 5, cpp: 4, python: 4, javascript: 4 },
  compute: { java: 6, cpp: 5, python: 5, javascript: 5 },
  checkAllOne: { java: 9, cpp: 8, python: 7, javascript: 8 },
  returnSpecial: { java: 10, cpp: 9, python: 8, javascript: 9 },
  returnGeneral: { java: 12, cpp: 11, python: 9, javascript: 11 },
};

// 5. 斐波那契博弈
export const FIBONACCI_GAME_CODES: Record<string, string[]> = {
  java: [
    'public class FibonacciGame {',
    '    public static boolean canWin(int n) {',
    '        if (n <= 1) return false;',
    '        int a = 1, b = 2;',
    '        while (b < n) {',
    '            int c = a + b;',
    '            a = b;',
    '            b = c;',
    '        }',
    '        return b != n;',
    '    }',
    '}',
  ],
  cpp: [
    'bool fibonacciGame(int n) {',
    '    if (n <= 1) return false;',
    '    int a = 1, b = 2;',
    '    while (b < n) {',
    '        int c = a + b;',
    '        a = b;',
    '        b = c;',
    '    }',
    '    return b != n;',
    '}',
  ],
  python: [
    'def fibonacci_game(n: int) -> bool:',
    '    if n <= 1:',
    '        return False',
    '    a, b = 1, 2',
    '    while b < n:',
    '        a, b = b, a + b',
    '    return b != n',
  ],
  javascript: [
    'function fibonacciGame(n) {',
    '    if (n <= 1) return false;',
    '    let a = 1, b = 2;',
    '    while (b < n) {',
    '        const c = a + b;',
    '        a = b;',
    '        b = c;',
    '    }',
    '    return b !== n;',
    '}',
  ],
};

export const FIBONACCI_GAME_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initFib: { java: 4, cpp: 3, python: 4, javascript: 3 },
  whileLoop: { java: 5, cpp: 4, python: 5, javascript: 4 },
  nextFib: { java: 6, cpp: 5, python: 6, javascript: 5 },
  returnAns: { java: 10, cpp: 9, python: 7, javascript: 9 },
};

// 6. 威佐夫博弈
export const WYTHOFF_GAME_CODES: Record<string, string[]> = {
  java: [
    'public class WythoffGame {',
    '    public static boolean wythoff(int a, int b) {',
    '        if (a > b) { int t = a; a = b; b = t; }',
    '        int k = b - a;',
    '        double phi = (Math.sqrt(5.0) + 1.0) / 2.0;',
    '        int ak = (int) Math.floor(k * phi);',
    '        return a != ak;',
    '    }',
    '}',
  ],
  cpp: [
    'bool wythoffGame(int a, int b) {',
    '    if (a > b) swap(a, b);',
    '    int k = b - a;',
    '    double phi = (sqrt(5.0) + 1.0) / 2.0;',
    '    int ak = floor(k * phi);',
    '    return a != ak;',
    '}',
  ],
  python: [
    'def wythoff_game(a: int, b: int) -> bool:',
    '    if a > b:',
    '        a, b = b, a',
    '    k = b - a',
    '    phi = (5**0.5 + 1) / 2',
    '    ak = int(k * phi)',
    '    return a != ak',
  ],
  javascript: [
    'function wythoffGame(a, b) {',
    '    if (a > b) [a, b] = [b, a];',
    '    const k = b - a;',
    '    const phi = (Math.sqrt(5) + 1) / 2;',
    '    const ak = Math.floor(k * phi);',
    '    return a !== ak;',
    '}',
  ],
};

export const WYTHOFF_GAME_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  swapMin: { java: 3, cpp: 2, python: 2, javascript: 2 },
  diffK: { java: 4, cpp: 3, python: 4, javascript: 3 },
  computeAk: { java: 6, cpp: 5, python: 6, javascript: 5 },
  returnAns: { java: 7, cpp: 6, python: 7, javascript: 6 },
};
