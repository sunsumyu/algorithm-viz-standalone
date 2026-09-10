/**
 * Class 017: 前缀树 (Trie) 基础结构设计与频次统计
 * 洛谷 P2580 / LeetCode 208 / 牛客经典
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface TrieNodeSnapshot {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: { [char: string]: number };
}

export interface Trie017Step extends StepBase {
  nodes: TrieNodeSnapshot[];
  activeNodeId: number;
  curWord: string;
  curCharIndex: number;
  operation: 'insert' | 'search' | 'prefixNumber';
  resultCount?: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const TRIE_017_CODES = {
  java: `public class TrieTree {
    static class Node {
        int pass = 0, end = 0;
        Node[] nexts = new Node[26];
    }
    private Node root = new Node();

    public void insert(String word) {
        Node cur = root;
        cur.pass++;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) cur.nexts[path] = new Node();
            cur = cur.nexts[path];
            cur.pass++;
        }
        cur.end++;
    }

    public int search(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) return 0;
            cur = cur.nexts[path];
        }
        return cur.end;
    }

    public int prefixNumber(String pre) {
        Node cur = root;
        for (char c : pre.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) return 0;
            cur = cur.nexts[path];
        }
        return cur.pass;
    }
}`,
  cpp: `class TrieTree {
    struct Node {
        int pass = 0, end = 0;
        Node* nexts[26] = {nullptr};
    };
    Node* root = new Node();
public:
    void insert(const string& word) {
        Node* cur = root; cur->pass++;
        for (char c : word) {
            int path = c - 'a';
            if (!cur->nexts[path]) cur->nexts[path] = new Node();
            cur = cur->nexts[path]; cur->pass++;
        }
        cur->end++;
    }
    int search(const string& word) {
        Node* cur = root;
        for (char c : word) {
            int path = c - 'a';
            if (!cur->nexts[path]) return 0;
            cur = cur->nexts[path];
        }
        return cur->end;
    }
    int prefixNumber(const string& pre) {
        Node* cur = root;
        for (char c : pre) {
            int path = c - 'a';
            if (!cur->nexts[path]) return 0;
            cur = cur->nexts[path];
        }
        return cur->pass;
    }
};`,
  python: `class TrieNode:
    def __init__(self):
        self.pass_cnt = 0
        self.end_cnt = 0
        self.nexts = {}

class TrieTree:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        cur = self.root
        cur.pass_cnt += 1
        for c in word:
            if c not in cur.nexts: cur.nexts[c] = TrieNode()
            cur = cur.nexts[c]
            cur.pass_cnt += 1
        cur.end_cnt += 1

    def search(self, word: str) -> int:
        cur = self.root
        for c in word:
            if c not in cur.nexts: return 0
            cur = cur.nexts[c]
        return cur.end_cnt

    def prefix_number(self, pre: str) -> int:
        cur = self.root
        for c in pre:
            if c not in cur.nexts: return 0
            cur = cur.nexts[c]
        return cur.pass_cnt`,
  typescript: `export class TrieNode {
    pass = 0;
    end = 0;
    nexts: { [c: string]: TrieNode } = {};
}
export class TrieTree {
    root = new TrieNode();
    insert(word: string): void {
        let cur = this.root;
        cur.pass++;
        for (const c of word) {
            if (!cur.nexts[c]) cur.nexts[c] = new TrieNode();
            cur = cur.nexts[c];
            cur.pass++;
        }
        cur.end++;
    }
    search(word: string): number {
        let cur = this.root;
        for (const c of word) {
            if (!cur.nexts[c]) return 0;
            cur = cur.nexts[c];
        }
        return cur.end;
    }
    prefixNumber(pre: string): number {
        let cur = this.root;
        for (const c of word) {
            if (!cur.nexts[c]) return 0;
            cur = cur.nexts[c];
        }
        return cur.pass;
    }
}`
};

interface InternalNode {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: Map<string, InternalNode>;
}

export function buildTrie017Steps(
  words: string[],
  queryWord: string,
  isPrefixQuery: boolean = false
): Trie017Step[] {
  const steps: Trie017Step[] = [];
  let nextId = 1;
  const root: InternalNode = { id: nextId++, char: 'ROOT', pass: 0, end: 0, children: new Map() };
  const allNodes: InternalNode[] = [root];

  const getSnapshot = (): TrieNodeSnapshot[] => {
    return allNodes.map(n => {
      const childObj: { [char: string]: number } = {};
      n.children.forEach((cNode, ch) => {
        childObj[ch] = cNode.id;
      });
      return {
        id: n.id,
        char: n.char,
        pass: n.pass,
        end: n.end,
        children: childObj,
      };
    });
  };

  // 1. 入口
  steps.push({
    nodes: getSnapshot(),
    activeNodeId: 1,
    curWord: '',
    curCharIndex: -1,
    operation: 'insert',
    decision: `主函数入口：初始化前缀树 Trie，准备插入词库 [${words.join(', ')}]`,
    message: '核心原理：公用公共前缀节点，节点 pass 记录经过该节点的单词数，end 记录以此字符结尾的单词数',
    log: 'init TrieTree',
    codeLine: 1,
    statusBadge: { text: '前缀树初始化', type: 'info' },
  });

  // 2. 插入所有单词
  for (const word of words) {
    let cur = root;
    cur.pass++;
    steps.push({
      nodes: getSnapshot(),
      activeNodeId: cur.id,
      curWord: word,
      curCharIndex: -1,
      operation: 'insert',
      decision: `开始插入单词 "${word}"：根节点 pass 自增为 ${cur.pass}`,
      message: '准备沿字符边逐位下潜推进',
      log: `insert("${word}") pass=${cur.pass}`,
      codeLine: 9,
      statusBadge: { text: `插入 "${word}"`, type: 'warning' },
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      let child = cur.children.get(ch);
      if (!child) {
        child = { id: nextId++, char: ch, pass: 0, end: 0, children: new Map() };
        cur.children.set(ch, child);
        allNodes.push(child);
      }
      child.pass++;
      cur = child;

      steps.push({
        nodes: getSnapshot(),
        activeNodeId: cur.id,
        curWord: word,
        curCharIndex: i,
        operation: 'insert',
        decision: `字符 '${ch}' 匹配推进至节点 #${cur.id}：当前节点 pass=${cur.pass}`,
        message: i === word.length - 1 ? '已抵达单词末尾字符' : '下潜下一字符分支',
        log: `node #${cur.id} ('${ch}'): pass=${cur.pass}`,
        codeLine: 14,
        statusBadge: { text: `字符 '${ch}' pass++`, type: 'info' },
      });
    }

    cur.end++;
    steps.push({
      nodes: getSnapshot(),
      activeNodeId: cur.id,
      curWord: word,
      curCharIndex: word.length - 1,
      operation: 'insert',
      decision: `🎉 单词 "${word}" 插入完毕！末尾节点 #${cur.id} 的 end 计数递增为 ${cur.end}`,
      message: `该单词共计出现 ${cur.end} 次`,
      log: `word "${word}" end=${cur.end}`,
      codeLine: 16,
      statusBadge: { text: `单词插入完成`, type: 'success' },
    });
  }

  // 3. 执行查询
  let cur: InternalNode = root;
  const opType = isPrefixQuery ? 'prefixNumber' : 'search';

  steps.push({
    nodes: getSnapshot(),
    activeNodeId: 1,
    curWord: queryWord,
    curCharIndex: -1,
    operation: opType,
    decision: `开始执行查询：${isPrefixQuery ? '统计以 "' + queryWord + '" 为前缀的词数' : '查找完整单词 "' + queryWord + '" 的频次'}`,
    message: '从根节点开始顺次校验字符路径',
    log: `query("${queryWord}", type=${opType})`,
    codeLine: isPrefixQuery ? 27 : 19,
    statusBadge: { text: `开始查询`, type: 'info' },
  });

  let notFound = false;
  for (let i = 0; i < queryWord.length; i++) {
    const ch = queryWord[i];
    const child: InternalNode | undefined = cur.children.get(ch);
    if (!child) {
      notFound = true;
      steps.push({
        nodes: getSnapshot(),
        activeNodeId: cur.id,
        curWord: queryWord,
        curCharIndex: i,
        operation: opType,
        resultCount: 0,
        decision: `❌ 字符分支 '${ch}' 缺失！节点 #${cur.id} 下无此分支，查询目标不存在`,
        message: '路径断裂，提前返回 0',
        log: `path missing at char '${ch}'`,
        codeLine: isPrefixQuery ? 30 : 22,
        statusBadge: { text: '路径断裂 (0)', type: 'danger' },
      });
      break;
    }
    cur = child;
    steps.push({
      nodes: getSnapshot(),
      activeNodeId: cur.id,
      curWord: queryWord,
      curCharIndex: i,
      operation: opType,
      decision: `成功匹配字符 '${ch}' 走向节点 #${cur.id} (经过数 pass=${cur.pass}, 结尾数 end=${cur.end})`,
      message: '继续向深层节点扫描',
      log: `matched '${ch}' node #${cur.id}`,
      codeLine: isPrefixQuery ? 31 : 23,
      statusBadge: { text: `匹配 '${ch}'`, type: 'info' },
    });
  }

  if (!notFound) {
    const ans = isPrefixQuery ? cur.pass : cur.end;
    steps.push({
      nodes: getSnapshot(),
      activeNodeId: cur.id,
      curWord: queryWord,
      curCharIndex: queryWord.length - 1,
      operation: opType,
      resultCount: ans,
      decision: `🎉 查询成功！${isPrefixQuery ? '前缀 "' + queryWord + '" 匹配词数 pass = ' + ans : '完整单词 "' + queryWord + '" 出现次数 end = ' + ans}`,
      message: `查询结果为: ${ans}`,
      log: `return ans=${ans}`,
      codeLine: isPrefixQuery ? 33 : 25,
      statusBadge: { text: `结果: ${ans}`, type: 'success' },
    });
  }

  return steps;
}

export const trieTree017Visualizer = registerDeclarativeAlgorithm<Trie017Step>({
  id: 'trie-tree-017',
  name: '前缀树基础结构与频次统计 (Class 017)',
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '深入掌握前缀树节点 pass / end 核心设计，理解多模式串共享公共前缀的快速前缀统计机制',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>设计前缀树 Trie 结构，支持：</p>
      <ul>
        <li><code>insert(word)</code>：向词库插入一个单词。</li>
        <li><code>search(word)</code>：查询单词在此前一共插入过几次。</li>
        <li><code>prefixNumber(pre)</code>：查询有多少个已插入单词以 <code>pre</code> 作为前缀。</li>
      </ul>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例：</strong>依次插入 ["apple", "app", "apply", "banana"]，查询前缀 "app" 的结果为 3。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'words',
      label: '插入单词库 (逗号分隔)',
      type: 'text',
      defaultValue: 'apple, app, apply, banana',
      placeholder: '请输入单词列表',
    },
    {
      id: 'query',
      label: '查询字符串',
      type: 'text',
      defaultValue: 'app',
    },
    {
      id: 'isPrefix',
      label: '查询类型',
      type: 'select',
      defaultValue: 'prefix',
      options: [
        { label: '前缀词频统计 (prefixNumber)', value: 'prefix' },
        { label: '完整单词查找 (search)', value: 'exact' },
      ],
    },
  ],
  codeLanguages: TRIE_017_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.words || 'apple, app, apply, banana');
    const words = raw.split(',').map((s) => s.trim().toLowerCase()).filter((w) => w.length > 0);
    const query = String(inputs.query || 'app').trim().toLowerCase();
    const isPrefix = inputs.isPrefix !== 'exact';
    return buildTrie017Steps(words.length > 0 ? words : ['apple', 'app'], query, isPrefix);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前操作</div>
            <div style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 4px;">
              ${step.operation === 'insert' ? '插入单词' : step.operation === 'prefixNumber' ? '前缀查询' : '完整单词查询'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前操作目标</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">"${step.curWord}"</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">聚焦节点编号</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">节点 #${step.activeNodeId}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">当前结果计数</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.resultCount !== undefined ? step.resultCount : '-'}</div>
          </div>
        </div>

        <!-- 节点列表与结构展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🌳 前缀树节点拓扑表 (pass 经过数 / end 结尾数)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${step.nodes.map((n) => {
              const isActive = n.id === step.activeNodeId;
              return `
                <div style="background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 2px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; border-radius: 8px; padding: 8px 12px; min-width: 90px; text-align: center;">
                  <div style="font-size: 11px; color: #64748b;">#${n.id} [${n.char}]</div>
                  <div style="display: flex; justify-content: space-around; font-size: 12px; margin-top: 4px; font-weight: 700;">
                    <span style="color: #0284c7;" title="经过此节点的单词数">pass:${n.pass}</span>
                    <span style="color: #e11d48;" title="以此节点结尾的单词数">end:${n.end}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '前缀树状态推导',
          `当前节点 #${step.activeNodeId} | 匹配字符索引 [${step.curCharIndex >= 0 ? step.curCharIndex : '-'}]`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
