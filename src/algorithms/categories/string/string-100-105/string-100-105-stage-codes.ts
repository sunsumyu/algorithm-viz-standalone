/**
 * 左神算法通关课 100 ~ 105 高阶字符串专题多语言标准源码库与行号基准映射字典
 * 涵盖：
 * 1. Class 100: KMP 算法核心原理与 Next 数组生成
 * 2. Class 101: KMP 循环节与最小周期覆盖
 * 3. Class 102: AC 自动机多模式串匹配与 fail 指针
 * 4. Class 103: Manacher 最长回文子串线性算法
 * 5. Class 104: 扩展 KMP (Z 算法 / Z-Algorithm)
 * 6. Class 105: 字符串哈希 (Rolling Hash & 双哈希)
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 100: KMP 算法 (Knuth-Morris-Pratt)
// ==========================================
export const KMP_CODES: Record<string, string[]> = {
  java: [
    'public int kmp(String s1, String s2) {', // 1
    '    if (s1 == null || s2 == null || s2.length() < 1 || s1.length() < s2.length()) return -1;', // 2
    '    char[] str1 = s1.toCharArray();', // 3
    '    char[] str2 = s2.toCharArray();', // 4
    '    int[] next = getNextArray(str2);', // 5
    '    int i1 = 0, i2 = 0;', // 6
    '    while (i1 < str1.length && i2 < str2.length) {', // 7
    '        if (str1[i1] == str2[i2]) {', // 8
    '            i1++; i2++;', // 9
    '        } else if (next[i2] == -1) {', // 10
    '            i1++;', // 11
    '        } else {', // 12
    '            i2 = next[i2]; // 核心：利用 next 数组加速跳转', // 13
    '        }', // 14
    '    }', // 15
    '    return i2 == str2.length ? i1 - i2 : -1;', // 16
    '}', // 17
  ],
  cpp: [
    'int kmp(const string& s1, const string& s2) {', // 1
    '    if (s2.empty() || s1.size() < s2.size()) return -1;', // 2
    '    vector<int> next = getNextArray(s2);', // 3
    '    int i1 = 0, i2 = 0;', // 4
    '    int n = s1.size(), m = s2.size();', // 5
    '    while (i1 < n && i2 < m) {', // 6
    '        if (s1[i1] == s2[i2]) {', // 7
    '            i1++; i2++;', // 8
    '        } else if (next[i2] == -1) {', // 9
    '            i1++;', // 10
    '        } else {', // 11
    '            i2 = next[i2]; // 指针跳跃', // 12
    '        }', // 13
    '    }', // 14
    '    return i2 == m ? i1 - i2 : -1;', // 15
    '}', // 16
  ],
  python: [
    'def kmp(s1: str, s2: str) -> int:', // 1
    '    if not s1 or not s2 or len(s1) < len(s2): return -1', // 2
    '    nxt = get_next_array(s2)', // 3
    '    i1, i2 = 0, 0', // 4
    '    while i1 < len(s1) and i2 < len(s2):', // 5
    '        if s1[i1] == s2[i2]:', // 6
    '            i1 += 1; i2 += 1', // 7
    '        elif nxt[i2] == -1:', // 8
    '            i1 += 1', // 9
    '        else:', // 10
    '            i2 = nxt[i2]  # 利用 next 数组跳转', // 11
    '    return i1 - i2 if i2 == len(s2) else -1', // 12
  ],
  javascript: [
    'function kmp(s1, s2) {', // 1
    '    if (!s1 || !s2 || s1.length < s2.length) return -1;', // 2
    '    const next = getNextArray(s2);', // 3
    '    let i1 = 0, i2 = 0;', // 4
    '    while (i1 < s1.length && i2 < s2.length) {', // 5
    '        if (s1[i1] === s2[i2]) {', // 6
    '            i1++; i2++;', // 7
    '        } else if (next[i2] === -1) {', // 8
    '            i1++;', // 9
    '        } else {', // 10
    '            i2 = next[i2]; // 利用 next 数组跳转', // 11
    '        }', // 12
    '    }', // 13
    '    return i2 === s2.length ? i1 - i2 : -1;', // 14
    '}', // 15
  ],
};

export const KMP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  guard:     { java: 2, cpp: 2, python: 2, javascript: 2 },
  initNext:  { java: 5, cpp: 3, python: 3, javascript: 3 },
  loopHead:  { java: 7, cpp: 6, python: 5, javascript: 5 },
  matchChar: { java: 9, cpp: 8, python: 7, javascript: 7 },
  nextJump:  { java: 13, cpp: 12, python: 11, javascript: 11 },
  shiftI1:   { java: 11, cpp: 10, python: 9, javascript: 9 },
  returnAns: { java: 16, cpp: 15, python: 12, javascript: 14 },
};

// ==========================================
// 2. Class 101: KMP 循环节 (KMP Period)
// ==========================================
export const KMP_PERIOD_CODES: Record<string, string[]> = {
  java: [
    'public int getMinPeriod(String s) {', // 1
    '    int n = s.length();', // 2
    '    if (n <= 1) return n;', // 3
    '    int[] next = getNextArray(s.toCharArray());', // 4
    '    int maxPrefixSuffix = next[n];', // 5
    '    int periodLen = n - maxPrefixSuffix;', // 6
    '    if (n % periodLen == 0) {', // 7
    '        return periodLen; // 完美整除，最小正周期', // 8
    '    }', // 9
    '    return n; // 无法整除，无真周期', // 10
    '}', // 11
  ],
  cpp: [
    'int getMinPeriod(const string& s) {', // 1
    '    int n = s.size();', // 2
    '    if (n <= 1) return n;', // 3
    '    vector<int> next = getNextArray(s);', // 4
    '    int maxPrefixSuffix = next[n];', // 5
    '    int periodLen = n - maxPrefixSuffix;', // 6
    '    if (n % periodLen == 0) {', // 7
    '        return periodLen;', // 8
    '    }', // 9
    '    return n;', // 10
    '}', // 11
  ],
  python: [
    'def get_min_period(s: str) -> int:', // 1
    '    n = len(s)', // 2
    '    if n <= 1: return n', // 3
    '    nxt = get_next_array(s)', // 4
    '    max_len = nxt[n]', // 5
    '    period_len = n - max_len', // 6
    '    if n % period_len == 0:', // 7
    '        return period_len  # 完美整除', // 8
    '    return n', // 9
  ],
  javascript: [
    'function getMinPeriod(s) {', // 1
    '    const n = s.length;', // 2
    '    if (n <= 1) return n;', // 3
    '    const next = getNextArray(s);', // 4
    '    const maxPrefixSuffix = next[n];', // 5
    '    const periodLen = n - maxPrefixSuffix;', // 6
    '    if (n % periodLen === 0) {', // 7
    '        return periodLen; // 完美整除', // 8
    '    }', // 9
    '    return n;', // 10
    '}', // 11
  ],
};

export const KMP_PERIOD_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  guard:     { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcNext:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  calcPeriod:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  checkDiv:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  returnAns: { java: 8, cpp: 8, python: 8, javascript: 8 },
};

// ==========================================
// 3. Class 102: AC 自动机 (Aho-Corasick)
// ==========================================
export const AC_AUTOMATON_CODES: Record<string, string[]> = {
  java: [
    'public int searchAC(String text, String[] patterns) {', // 1
    '    TrieNode root = buildTrie(patterns);', // 2
    '    buildFailPointers(root); // BFS 层序构建 fail 指针', // 3
    '    TrieNode cur = root;', // 4
    '    int matches = 0;', // 5
    '    for (int i = 0; i < text.length(); i++) {', // 6
    '        int ch = text.charAt(i) - \'a\';', // 7
    '        while (cur != root && cur.next[ch] == null) {', // 8
    '            cur = cur.fail; // fail 指针失配跳转', // 9
    '        }', // 10
    '        cur = cur.next[ch] != null ? cur.next[ch] : root;', // 11
    '        for (TrieNode t = cur; t != root && t.count != -1; t = t.fail) {', // 12
    '            matches += t.count; t.count = -1; // 统计并去重', // 13
    '        }', // 14
    '    }', // 15
    '    return matches;', // 16
    '}', // 17
  ],
  cpp: [
    'int searchAC(const string& text, const vector<string>& patterns) {', // 1
    '    Node* root = buildTrie(patterns);', // 2
    '    buildFailPointers(root);', // 3
    '    Node* cur = root;', // 4
    '    int matches = 0;', // 5
    '    for (char c : text) {', // 6
    '        int ch = c - \'a\';', // 7
    '        while (cur != root && !cur->next[ch]) cur = cur->fail;', // 8
    '        cur = cur->next[ch] ? cur->next[ch] : root;', // 9
    '        for (Node* t = cur; t != root && t->count != -1; t = t->fail) {', // 10
    '            matches += t->count; t->count = -1;', // 11
    '        }', // 12
    '    }', // 13
    '    return matches;', // 14
    '}', // 15
  ],
  python: [
    'def search_ac(text: str, patterns: list[str]) -> int:', // 1
    '    root = build_trie(patterns)', // 2
    '    build_fail_pointers(root)', // 3
    '    cur, matches = root, 0', // 4
    '    for ch in text:', // 5
    '        while cur != root and ch not in cur.next:', // 6
    '            cur = cur.fail  # fail 跳转', // 7
    '        cur = cur.next.get(ch, root)', // 8
    '        t = cur', // 9
    '        while t != root and t.count != -1:', // 10
    '            matches += t.count; t.count = -1', // 11
    '            t = t.fail', // 12
    '    return matches', // 13
  ],
  javascript: [
    'function searchAC(text, patterns) {', // 1
    '    const root = buildTrie(patterns);', // 2
    '    buildFailPointers(root); // 构建 fail 指针', // 3
    '    let cur = root, matches = 0;', // 4
    '    for (let i = 0; i < text.length; i++) {', // 5
    '        const ch = text.charCodeAt(i) - 97;', // 6
    '        while (cur !== root && !cur.next[ch]) {', // 7
    '            cur = cur.fail; // fail 失配跳转', // 8
    '        }', // 9
    '        cur = cur.next[ch] || root;', // 10
    '        for (let t = cur; t !== root && t.count !== -1; t = t.fail) {', // 11
    '            matches += t.count; t.count = -1;', // 12
    '        }', // 13
    '    }', // 14
    '    return matches;', // 15
    '}', // 16
  ],
};

export const AC_AUTOMATON_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  buildTrie: { java: 2, cpp: 2, python: 2, javascript: 2 },
  buildFail: { java: 3, cpp: 3, python: 3, javascript: 3 },
  loopHead:  { java: 6, cpp: 6, python: 5, javascript: 5 },
  failJump:  { java: 9, cpp: 8, python: 7, javascript: 8 },
  matchNode: { java: 11, cpp: 9, python: 8, javascript: 10 },
  collect:   { java: 13, cpp: 11, python: 11, javascript: 12 },
  returnAns: { java: 16, cpp: 14, python: 13, javascript: 15 },
};

// ==========================================
// 4. Class 103: Manacher 最长回文子串
// ==========================================
export const MANACHER_CODES: Record<string, string[]> = {
  java: [
    'public int manacher(String s) {', // 1
    '    char[] str = manacherString(s); // #a#b#c# 预处理', // 2
    '    int[] p = new int[str.length]; // 回文半径数组', // 3
    '    int C = -1, R = -1, maxLen = 0;', // 4
    '    for (int i = 0; i < str.length; i++) {', // 5
    '        p[i] = R > i ? Math.min(p[2 * C - i], R - i) : 1; // 镜像加速', // 6
    '        while (i + p[i] < str.length && i - p[i] >= 0) {', // 7
    '            if (str[i + p[i]] == str[i - p[i]]) p[i]++; // 暴力外扩', // 8
    '            else break;', // 9
    '        }', // 10
    '        if (i + p[i] > R) {', // 11
    '            C = i; R = i + p[i]; // 更新回文中心与右边界', // 12
    '        }', // 13
    '        maxLen = Math.max(maxLen, p[i]);', // 14
    '    }', // 15
    '    return maxLen - 1;', // 16
    '}', // 17
  ],
  cpp: [
    'int manacher(const string& s) {', // 1
    '    string str = manacherString(s);', // 2
    '    int n = str.size(), C = -1, R = -1, maxLen = 0;', // 3
    '    vector<int> p(n, 0);', // 4
    '    for (int i = 0; i < n; i++) {', // 5
    '        p[i] = R > i ? min(p[2 * C - i], R - i) : 1;', // 6
    '        while (i + p[i] < n && i - p[i] >= 0 && str[i + p[i]] == str[i - p[i]]) {', // 7
    '            p[i]++;', // 8
    '        }', // 9
    '        if (i + p[i] > R) { C = i; R = i + p[i]; }', // 10
    '        maxLen = max(maxLen, p[i]);', // 11
    '    }', // 12
    '    return maxLen - 1;', // 13
    '}', // 14
  ],
  python: [
    'def manacher(s: str) -> int:', // 1
    '    t = "#" + "#".join(s) + "#"', // 2
    '    p = [0] * len(t)', // 3
    '    C, R, max_len = -1, -1, 0', // 4
    '    for i in range(len(t)):', // 5
    '        p[i] = min(p[2 * C - i], R - i) if R > i else 1', // 6
    '        while i + p[i] < len(t) and i - p[i] >= 0 and t[i + p[i]] == t[i - p[i]]:', // 7
    '            p[i] += 1', // 8
    '        if i + p[i] > R:', // 9
    '            C, R = i, i + p[i]', // 10
    '        max_len = max(max_len, p[i])', // 11
    '    return max_len - 1', // 12
  ],
  javascript: [
    'function manacher(s) {', // 1
    '    const str = manacherString(s); // #a#b#c#', // 2
    '    const p = new Array(str.length).fill(0);', // 3
    '    let C = -1, R = -1, maxLen = 0;', // 4
    '    for (let i = 0; i < str.length; i++) {', // 5
    '        p[i] = R > i ? Math.min(p[2 * C - i], R - i) : 1;', // 6
    '        while (i + p[i] < str.length && i - p[i] >= 0 && str[i + p[i]] === str[i - p[i]]) {', // 7
    '            p[i]++;', // 8
    '        }', // 9
    '        if (i + p[i] > R) {', // 10
    '            C = i; R = i + p[i]; // 更新中心与右边界', // 11
    '        }', // 12
    '        maxLen = Math.max(maxLen, p[i]);', // 13
    '    }', // 14
    '    return maxLen - 1;', // 15
    '}', // 16
  ],
};

export const MANACHER_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initStr:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  loopHead:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  mirrorOpt: { java: 6, cpp: 6, python: 6, javascript: 6 },
  expand:    { java: 8, cpp: 8, python: 8, javascript: 8 },
  updateCR:  { java: 12, cpp: 10, python: 10, javascript: 11 },
  returnAns: { java: 16, cpp: 13, python: 12, javascript: 15 },
};

// ==========================================
// 5. Class 104: 扩展 KMP (Z 算法 / Z-Algorithm)
// ==========================================
export const Z_ALGORITHM_CODES: Record<string, string[]> = {
  java: [
    'public int[] zAlgorithm(String s) {', // 1
    '    char[] str = s.toCharArray();', // 2
    '    int n = str.length;', // 3
    '    int[] z = new int[n];', // 4
    '    z[0] = n;', // 5
    '    for (int i = 1, c = 1, r = 1; i < n; i++) {', // 6
    '        int len = r > i ? Math.min(r - i, z[i - c]) : 0; // Z盒加速', // 7
    '        while (i + len < n && str[i + len] == str[len]) {', // 8
    '            len++; // 暴力外扩', // 9
    '        }', // 10
    '        if (i + len > r) {', // 11
    '            c = i; r = i + len; // 更新 Z 盒', // 12
    '        }', // 13
    '        z[i] = len;', // 14
    '    }', // 15
    '    return z;', // 16
    '}', // 17
  ],
  cpp: [
    'vector<int> zAlgorithm(const string& s) {', // 1
    '    int n = s.size();', // 2
    '    vector<int> z(n, 0);', // 3
    '    z[0] = n;', // 4
    '    for (int i = 1, c = 1, r = 1; i < n; i++) {', // 5
    '        int len = r > i ? min(r - i, z[i - c]) : 0;', // 6
    '        while (i + len < n && s[i + len] == s[len]) len++;', // 7
    '        if (i + len > r) { c = i; r = i + len; }', // 8
    '        z[i] = len;', // 9
    '    }', // 10
    '    return z;', // 11
    '}', // 12
  ],
  python: [
    'def z_algorithm(s: str) -> list[int]:', // 1
    '    n = len(s)', // 2
    '    z = [0] * n', // 3
    '    z[0] = n', // 4
    '    c, r = 1, 1', // 5
    '    for i in range(1, n):', // 6
    '        l = min(r - i, z[i - c]) if r > i else 0', // 7
    '        while i + l < n and s[i + l] == s[l]:', // 8
    '            l += 1', // 9
    '        if i + l > r:', // 10
    '            c, r = i, i + l', // 11
    '        z[i] = l', // 12
    '    return z', // 13
  ],
  javascript: [
    'function zAlgorithm(s) {', // 1
    '    const n = s.length;', // 2
    '    const z = new Array(n).fill(0);', // 3
    '    z[0] = n;', // 4
    '    for (let i = 1, c = 1, r = 1; i < n; i++) {', // 5
    '        let len = r > i ? Math.min(r - i, z[i - c]) : 0; // Z盒加速', // 6
    '        while (i + len < n && s[i + len] === s[len]) {', // 7
    '            len++;', // 8
    '        }', // 9
    '        if (i + len > r) {', // 10
    '            c = i; r = i + len;', // 11
    '        }', // 12
    '        z[i] = len;', // 13
    '    }', // 14
    '    return z;', // 15
    '}', // 16
  ],
};

export const Z_ALGORITHM_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initArr:   { java: 4, cpp: 3, python: 3, javascript: 3 },
  loopHead:  { java: 6, cpp: 5, python: 6, javascript: 5 },
  zBoxOpt:   { java: 7, cpp: 6, python: 7, javascript: 6 },
  expand:    { java: 9, cpp: 7, python: 9, javascript: 8 },
  updateBox: { java: 12, cpp: 8, python: 11, javascript: 11 },
  returnAns: { java: 16, cpp: 11, python: 13, javascript: 15 },
};

// ==========================================
// 6. Class 105: 字符串哈希 (Rolling Hash)
// ==========================================
export const STRING_HASH_CODES: Record<string, string[]> = {
  java: [
    'public long getSubHash(int l, int r) {', // 1
    '    // H[i] = (H[i-1] * P + s[i]) % MOD', // 2
    '    // Hash(l..r) = (H[r] - H[l-1] * P^(r-l+1)) % MOD', // 3
    '    long ans = (h[r] - h[l - 1] * power[r - l + 1]) % MOD;', // 4
    '    return ans < 0 ? ans + MOD : ans;', // 5
    '}', // 6
  ],
  cpp: [
    'long long getSubHash(int l, int r) {', // 1
    '    // H[i] = (H[i-1] * P + s[i]) % MOD', // 2
    '    long long ans = (h[r] - h[l - 1] * power[r - l + 1]) % MOD;', // 3
    '    return ans < 0 ? ans + MOD : ans;', // 4
    '}', // 5
  ],
  python: [
    'def get_sub_hash(l: int, r: int) -> int:', // 1
    '    # H[i] = (H[i-1] * P + s[i]) % MOD', // 2
    '    ans = (h[r] - h[l - 1] * power[r - l + 1]) % MOD', // 3
    '    return ans if ans >= 0 else ans + MOD', // 4
  ],
  javascript: [
    'function getSubHash(l, r) {', // 1
    '    // H[i] = (H[i-1] * P + s[i]) % MOD', // 2
    '    let ans = (h[r] - h[l - 1] * power[r - l + 1]) % MOD;', // 3
    '    return ans < 0n ? ans + MOD : ans;', // 4
    '}', // 5
  ],
};

export const STRING_HASH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcHash:  { java: 4, cpp: 3, python: 3, javascript: 3 },
  returnAns: { java: 5, cpp: 4, python: 4, javascript: 4 },
};
