/**
 * Class 102: AC 自动机多模式串匹配 (Aho-Corasick)
 * 洛谷 P3808 / P3796
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { AC_AUTOMATON_CODES, AC_AUTOMATON_LINES } from './string-100-105-stage-codes';
import {
  String100Step,
  renderCharSequence,
  renderFormulaCard,
} from './string-100-105-shared';

export interface ACTrieNode {
  id: number;
  char: string;
  next: Map<string, ACTrieNode>;
  fail: ACTrieNode | null;
  count: number;
  pattern?: string;
}

export interface ACAutomatonStep extends String100Step {
  text: string;
  patterns: string[];
  curTextIdx: number;
  activeNodeId: number;
  activeNodeLabel: string;
  matchedCount: number;
  matchedList: string[];
}

export function buildACTrie(patterns: string[]): { root: ACTrieNode; allNodes: ACTrieNode[] } {
  let nextId = 0;
  const root: ACTrieNode = {
    id: nextId++,
    char: 'root',
    next: new Map(),
    fail: null,
    count: 0,
  };
  const allNodes: ACTrieNode[] = [root];

  for (const pat of patterns) {
    let cur = root;
    for (const ch of pat) {
      if (!cur.next.has(ch)) {
        const newNode: ACTrieNode = {
          id: nextId++,
          char: ch,
          next: new Map(),
          fail: null,
          count: 0,
        };
        cur.next.set(ch, newNode);
        allNodes.push(newNode);
      }
      cur = cur.next.get(ch)!;
    }
    cur.count++;
    cur.pattern = pat;
  }

  // BFS 构建 fail 指针
  const queue: ACTrieNode[] = [];
  for (const [, child] of root.next) {
    child.fail = root;
    queue.push(child);
  }

  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const [ch, child] of parent.next) {
      let failNode = parent.fail;
      while (failNode !== null && !failNode.next.has(ch)) {
        failNode = failNode.fail;
      }
      child.fail = failNode ? failNode.next.get(ch)! : root;
      queue.push(child);
    }
  }

  return { root, allNodes };
}

export function buildACAutomatonSteps(text: string, patterns: string[]): ACAutomatonStep[] {
  const steps: ACAutomatonStep[] = [];
  const lines = AC_AUTOMATON_LINES;

  const { root } = buildACTrie(patterns);

  // Step 0: 入口
  steps.push({
    text,
    patterns,
    curTextIdx: 0,
    activeNodeId: root.id,
    activeNodeLabel: 'root',
    matchedCount: 0,
    matchedList: [],
    decision: `主函数入口：接收主文本串 text="${text}" (长 ${text.length}) 与 ${patterns.length} 个目标模式串 [${patterns.map(p => `"${p}"`).join(', ')}]`,
    message: '准备通过 AC 自动机单次扫描并发匹配所有目标串',
    log: `enter searchAC(text="${text}", patterns=${patterns.length})`,
    codeLine: lines.entry,
    metrics: { '文本长度': text.length, '模式串数': patterns.length, '命中总数': 0 },
  });

  // Step 1: 树结构构建完成
  steps.push({
    text,
    patterns,
    curTextIdx: 0,
    activeNodeId: root.id,
    activeNodeLabel: 'root',
    matchedCount: 0,
    matchedList: [],
    decision: `Trie 与 Fail 拓扑指针构建完成：所有分支的失配路径已建立完成`,
    message: '根节点的子节点 fail 指向 root，其余节点顺着父节点 fail 回溯匹配',
    log: 'build Trie and Fail pointers complete',
    codeLine: lines.buildFail,
    metrics: { '当前节点': 'root', '命中总数': 0 },
  });

  let cur = root;
  let matches = 0;
  const matchedList: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    // Fail 回跳
    let jumped = false;
    while (cur !== root && !cur.next.has(ch)) {
      const oldId = cur.id;
      cur = cur.fail || root;
      jumped = true;
      steps.push({
        text,
        patterns,
        curTextIdx: i,
        activeNodeId: cur.id,
        activeNodeLabel: cur.char,
        matchedCount: matches,
        matchedList: [...matchedList],
        mismatchIndex: i,
        decision: `⚡ Fail 失败指针跳转：当前节点 #${oldId} 无字符 '${ch}' 的转移边，顺 fail 跳跃至节点 #${cur.id} ('${cur.char}')`,
        message: '利用已知最长后缀状态，无需回退主串字符',
        log: `fail jump: #${oldId} -> #${cur.id}`,
        codeLine: lines.failJump,
        metrics: { '考察字符': `'${ch}'`, '当前节点': `#${cur.id}`, '已命中数': matches },
        statusBadge: { text: `Fail 跳转`, type: 'info' },
      });
    }

    if (cur.next.has(ch)) {
      cur = cur.next.get(ch)!;
    } else {
      cur = root;
    }

    steps.push({
      text,
      patterns,
      curTextIdx: i,
      activeNodeId: cur.id,
      activeNodeLabel: cur.char,
      matchedCount: matches,
      matchedList: [...matchedList],
      matchIndices: [i],
      decision: `状态推进：主串字符 text[${i}]='${ch}' 转移至节点 #${cur.id} ('${cur.char}')`,
      message: `在自动机中向前迈进一步`,
      log: `advance to node #${cur.id} with char '${ch}'`,
      codeLine: lines.matchNode,
      metrics: { '主串下标 i': i, '当前节点': `#${cur.id}`, '已命中数': matches },
    });

    // 沿 fail 链收集所有匹配词
    let t: ACTrieNode | null = cur;
    while (t !== null && t !== root) {
      if (t.count > 0 && t.pattern) {
        matches += t.count;
        matchedList.push(t.pattern);
        t.count = -1; // 标记防止重复计数

        steps.push({
          text,
          patterns,
          curTextIdx: i,
          activeNodeId: t.id,
          activeNodeLabel: t.pattern,
          matchedCount: matches,
          matchedList: [...matchedList],
          matchIndices: [i],
          decision: `🎉 模式串命中！发现模式串 "${t.pattern}" 出现！总命中数增至 ${matches}`,
          message: `节点 #${t.id} 为模式串结束节点，成功捕获目标词`,
          log: `hit pattern "${t.pattern}", total=${matches}`,
          codeLine: lines.collect,
          metrics: { '命中模式串': t.pattern, '已命中数': matches },
          statusBadge: { text: `命中 "${t.pattern}"`, type: 'success' },
        });
      }
      t = t.fail;
    }
  }

  // Step End: 终局
  steps.push({
    text,
    patterns,
    curTextIdx: text.length - 1,
    activeNodeId: root.id,
    activeNodeLabel: 'done',
    matchedCount: matches,
    matchedList: [...matchedList],
    decision: `🏆 检索结束：主文本串单次线性扫描完成，共成功匹配 ${matches} 个模式串目标！返回 ${matches}`,
    message: matchedList.length > 0 ? `匹配列表: [${matchedList.join(', ')}]` : '未命中任何模式串',
    log: `return matches=${matches}`,
    codeLine: lines.returnAns,
    metrics: { '总命中数': matches, '命中模式串': matchedList.join(', ') || '无' },
    statusBadge: { text: `共命中 ${matches} 个`, type: 'success' },
  });

  return steps;
}

export const acAutomatonVisualizer = registerDeclarativeAlgorithm<ACAutomatonStep>({
  id: 'ac-automaton',
  name: 'AC 自动机多模式串匹配 (Class 102)',
  category: 'string',
  icon: '🤖',
  difficulty: 3,
  levelOrder: 102,
  learningGoal: '深入理解 Trie 前缀树与 KMP fail 失败指针的融合，掌握单次线性扫描并发匹配多个模式串的高效原理',
  problemHtml: STRING_100_105_PROBLEMS.acAutomaton.html,
  analysisHtml: STRING_100_105_PROBLEMS.acAutomaton.html,
  inputs: [
    {
      id: 'text',
      label: '主文本串 (text)',
      type: 'text',
      defaultValue: 'abcefabcd',
      placeholder: '请输入文本串',
    },
    {
      id: 'patterns',
      label: '模式串集合 (逗号分隔)',
      type: 'text',
      defaultValue: 'ab,bc,abcd,ef',
      placeholder: '请输入逗号分隔的模式串',
    },
  ],
  codeLanguages: AC_AUTOMATON_CODES,
  generateSteps: (input) => {
    const text = String(input.text || 'abcefabcd');
    const patStr = String(input.patterns || 'ab,bc,abcd,ef');
    const patterns = patStr.split(',').map(s => s.trim()).filter(Boolean);
    return buildACAutomatonSteps(text, patterns);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCharSequence(
          '主文本串 (Text)',
          step.text,
          step.curTextIdx,
          [],
          step.matchIndices || [],
          step.mismatchIndex !== undefined ? step.mismatchIndex : -1,
          '文本游标'
        )}

        <div style="margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🎯 目标模式串监控 (共 ${step.patterns.length} 个)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${step.patterns.map((pat) => {
              const isHit = step.matchedList.includes(pat);
              return `
                <div style="padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: monospace; border: 1px solid ${isHit ? '#22c55e' : '#cbd5e1'}; background: ${isHit ? '#dcfce7' : '#ffffff'}; color: ${isHit ? '#15803d' : '#64748b'}; box-shadow: ${isHit ? '0 2px 8px rgba(34, 197, 94, 0.25)' : 'none'};">
                  ${isHit ? '✓ ' : ''}${pat}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        ${renderFormulaCard(
          'AC 自动机状态机拓扑',
          `当前节点: #${step.activeNodeId} ('${step.activeNodeLabel}') | 主串考察字符: text[${step.curTextIdx}]='${step.text[step.curTextIdx] ?? ''}' | 已命中总数: ${step.matchedCount}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
