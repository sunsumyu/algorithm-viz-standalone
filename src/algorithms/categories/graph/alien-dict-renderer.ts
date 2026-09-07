/**
 * 火星词典拓扑排序 (Alien Dictionary - LeetCode 269 / 剑指 Offer II 114) 声明式可视化器
 * 核心：字典序首个不同字符提取有向偏序关系、入度统计与拓扑排序、非法前缀与环检测
 * 深度架构重构：严格解释器级全流程逐行高亮执行（相邻单词比较、前缀合法性校验、偏序有向边建立、0入度字符搜集、拓扑队列展开与削减入度均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  ALIEN_DICT_CODE_LANGUAGES,
  ALIEN_DICT_PROBLEM_HTML,
  ALIEN_DICT_ANALYSIS_HTML,
} from './alien-dict-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface AlienStep {
  wordList: string[];
  edges: Array<[string, string]>;
  inDegrees: Record<string, number>;
  topoOrder: string[];
  queue?: string[];
  activeChar?: string;
  activeEdge?: [string, string];
  charList: string[];
  inDegreeArray: number[];
  activeArray?: 'inDegree' | 'queue';
  activeSlot?: number;
  status: 'extract' | 'topo' | 'error' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildAlienDictSteps(preset: string = 'valid'): AlienStep[] {
  const steps: AlienStep[] = [];

  const wordList =
    preset === 'prefix_error'
      ? ['abc', 'ab']
      : preset === 'cycle'
        ? ['z', 'x', 'z']
        : ['wrt', 'wrf', 'er', 'ett', 'rftt'];

  const inDegreeMap: Record<string, number> = {};
  for (const w of wordList) {
    for (let i = 0; i < w.length; i++) {
      inDegreeMap[w[i]] = 0;
    }
  }

  const charList = Object.keys(inDegreeMap).sort();
  const edges: Array<[string, string]> = [];
  const adj: Record<string, string[]> = {};
  for (const c of charList) adj[c] = [];

  const topoOrder: string[] = [];
  let queue: string[] = [];
  let activeChar: string | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;

  // 精准 22 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 12, java: 7, python: 3, javascript: 2 },
    initInDegree: { cpp: 17, java: 12, python: 5, javascript: 7 },
    initGraph: { cpp: 14, java: 17, python: 6, javascript: 8 },
    countKinds: { cpp: 21, java: 20, python: 5, javascript: 7 },
    loopWords: { cpp: 23, java: 22, python: 9, javascript: 12 },
    fetchPair: { cpp: 24, java: 23, python: 10, javascript: 13 },
    whileSame: { cpp: 27, java: 26, python: 13, javascript: 16 },
    checkDiffChar: { cpp: 29, java: 28, python: 16, javascript: 18 },
    addEdge: { cpp: 32, java: 30, python: 19, javascript: 21 },
    incrementInDegree: { cpp: 33, java: 31, python: 20, javascript: 22 },
    checkPrefixError: { cpp: 35, java: 32, python: 21, javascript: 23 },
    returnPrefixError: { cpp: 36, java: 33, python: 22, javascript: 24 },
    initQueue: { cpp: 42, java: 37, python: 24, javascript: 27 },
    checkZeroInDegree: { cpp: 42, java: 40, python: 24, javascript: 29 },
    pushZeroInDegree: { cpp: 42, java: 40, python: 24, javascript: 29 },
    whileQueue: { cpp: 46, java: 44, python: 27, javascript: 33 },
    pollQueue: { cpp: 47, java: 45, python: 28, javascript: 34 },
    appendAns: { cpp: 49, java: 46, python: 29, javascript: 35 },
    loopAdj: { cpp: 51, java: 47, python: 30, javascript: 36 },
    decrementInDegree: { cpp: 52, java: 48, python: 31, javascript: 38 },
    pushNewZero: { cpp: 52, java: 48, python: 33, javascript: 38 },
    returnAns: { cpp: 56, java: 51, python: 35, javascript: 43 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'extract' | 'topo' | 'error' | 'done',
    actArray?: 'inDegree' | 'queue',
    actSlot?: number
  ): void {
    const qStr = queue.length > 0 ? `[${queue.join(', ')}]` : '[]';
    const ordStr = topoOrder.length > 0 ? topoOrder.join(' ➔ ') : '无';
    const phaseStr =
      status === 'done'
        ? '排序完成'
        : status === 'error'
          ? '检测到逻辑冲突'
          : status === 'topo'
            ? '拓扑消元'
            : '提取偏序关系';

    const inDegArr = charList.map((c) => inDegreeMap[c] ?? 0);

    steps.push({
      wordList,
      edges: edges.map((e) => [...e] as [string, string]),
      inDegrees: { ...inDegreeMap },
      topoOrder: [...topoOrder],
      queue: [...queue],
      activeChar,
      activeEdge,
      charList,
      inDegreeArray: inDegArr,
      activeArray: actArray,
      activeSlot: actSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-alien-chars': `${charList.length} 个字符 (${charList.join(', ')})`,
        'metric-alien-order': ordStr,
        'metric-alien-queue': qStr,
        'metric-alien-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, '🚀 [火星词典启动] alienOrder(words)：分析火星语言字典序。', '入口', 'extract');
  makeStep(lines.initInDegree, `🔤 [扫描全部字符] 统计出现字符种类: [${charList.join(', ')}]，初始化入度为 0。`, '初始化入度', 'extract', 'inDegree');
  makeStep(lines.initGraph, '📦 [构建邻接表] 初始化偏序有向图邻接表 graph。', '初始化邻接表', 'extract');
  makeStep(lines.countKinds, `🏷️ [统计字符总数] 共有 kinds = ${charList.length} 个独立字符。`, `kinds = ${charList.length}`, 'extract');

  // 2. 扫描相邻单词提取偏序关系
  let prefixError = false;

  for (let i = 0; i < wordList.length - 1; i++) {
    const cur = wordList[i];
    const nxt = wordList[i + 1];
    makeStep(lines.loopWords, `🔍 [比较相邻单词] 第 ${i + 1} 组: "${cur}" 与 "${nxt}"。`, `比较 "${cur}" & "${nxt}"`, 'extract');
    makeStep(lines.fetchPair, `  ↳ [计算前缀边界] minLen = min(${cur.length}, ${nxt.length})。`, 'minLen', 'extract');

    let j = 0;
    while (j < cur.length && j < nxt.length && cur[j] === nxt[j]) {
      makeStep(lines.whileSame, `  ⏩ [跳过公共前缀] 位置 ${j}: '${cur[j]}' == '${nxt[j]}' 字符一致，继续比对下一位。`, `prefix match: cur[${j}]==nxt[${j}]`, 'extract');
      j++;
    }
    makeStep(lines.whileSame, `  ⏩ [公共前缀扫描完毕] 公共前缀长度为 ${j}。`, `前缀长度: ${j}`, 'extract');

    if (j < cur.length && j < nxt.length) {
      const u = cur[j];
      const v = nxt[j];
      activeEdge = [u, v];
      makeStep(lines.checkDiffChar, `  💡 [发现首个不同字符] '${u}' 必在 '${v}' 前面！`, `diff: '${u}' -> '${v}'`, 'extract');

      if (!adj[u].includes(v)) {
        adj[u].push(v);
        edges.push([u, v]);
        makeStep(lines.addEdge, `  ➕ [添加偏序有向边] 建立有向依赖: '${u}' ➔ '${v}'。`, `add edge ${u}->${v}`, 'extract');

        inDegreeMap[v] = (inDegreeMap[v] || 0) + 1;
        const vIdx = charList.indexOf(v);
        makeStep(lines.incrementInDegree, `  📈 [入度自增] inDegree['${v}'] 增加为 ${inDegreeMap[v]}。`, `inDegree['${v}']++`, 'extract', 'inDegree', vIdx);
      }
    } else if (cur.length > nxt.length) {
      makeStep(lines.checkPrefixError, `  🚨 [前缀合法性检查] if (cur.length(${cur.length}) > nxt.length(${nxt.length})) -> (true)！`, '前缀反转判断', 'error');
      makeStep(lines.returnPrefixError, `❌ [非法前缀陷阱] 较长单词 "${cur}" 排在较短前缀 "${nxt}" 前面，违反字典序公理！return ""！`, '前缀错误: 无解', 'error');
      prefixError = true;
      break;
    }
  }

  activeEdge = undefined;

  if (prefixError) {
    return steps;
  }

  // 3. 拓扑排序：初始化零入度队列
  makeStep(lines.initQueue, '📦 [初始化拓扑队列] int[] queue = new int[26]，准备入队 0 入度字符。', '初始化队列', 'topo', 'queue');

  queue = [];
  for (const c of charList) {
    makeStep(lines.checkZeroInDegree, `  🔎 [检查入度] '${c}' 的入度为 ${inDegreeMap[c]}。`, `inDegree['${c}']==0?`, 'topo');
    if (inDegreeMap[c] === 0) {
      queue.push(c);
      makeStep(lines.pushZeroInDegree, `  📥 [0入度入队] 将字符 '${c}' 加入拓扑队列！`, `push '${c}'`, 'topo', 'queue');
    }
  }

  // 4. 拓扑排序消元
  while (queue.length > 0) {
    makeStep(lines.whileQueue, `🔁 [拓扑消元循环] while (queue.length > 0) -> 队列: [${queue.join(', ')}]。`, 'while(q)', 'topo');

    const u = queue.shift()!;
    activeChar = u;
    makeStep(lines.pollQueue, `📤 [出队字符] 弹出最高优先级字符 '${u}'。`, `poll '${u}'`, 'topo');

    topoOrder.push(u);
    makeStep(lines.appendAns, `📝 [加入拓扑序列] 确定字符 '${u}' 的顺序，当前序列: "${topoOrder.join('')}"。`, `ans.append('${u}')`, 'topo');

    for (const v of adj[u] || []) {
      makeStep(lines.loopAdj, `  ↳ [消除偏序边] 消除出边 '${u}' ➔ '${v}'。`, `edge ${u}->${v}`, 'topo');

      inDegreeMap[v]--;
      const vIdx = charList.indexOf(v);
      makeStep(lines.decrementInDegree, `  📉 [扣减入度] inDegree['${v}'] 减至 ${inDegreeMap[v]}。`, `inDegree['${v}']--`, 'topo', 'inDegree', vIdx);

      if (inDegreeMap[v] === 0) {
        queue.push(v);
        makeStep(lines.pushNewZero, `  ✨ [产生新0入度] 字符 '${v}' 前置约束解除，入队！`, `push '${v}'`, 'topo', 'queue');
      }
    }
  }

  activeChar = undefined;

  // 5. 判环与收尾
  if (topoOrder.length === charList.length) {
    makeStep(lines.returnAns, `🎉 [火星词典拓扑达成] return "${topoOrder.join('')}"！成功解析出无冲突的火星字母表顺序！`, '完成: 存在有效字典序', 'done');
  } else {
    makeStep(lines.returnAns, `❌ [存在环状逻辑矛盾] 拓扑序列长度 ${topoOrder.length} < 字符种类 ${charList.length}，图中存在环状冲突，return ""！`, '存在有向环: 无解', 'error');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<AlienStep>({
  id: 'alien-dict',
  name: '火星词典拓扑排序 (Alien Dictionary)',
  viewId: 'algo-alien-dict-view',
  category: 'graph',
  icon: '🛸',
  badge: {
    mode: '偏序提取 · 前缀非法校验 · 拓扑排序判环',
    complexity: 'O(C) · O(U + min(U, 26²))',
  },
  card1Title: '🛸 火星字符偏序字典与拓扑沙盘',
  card2Title: '📊 字符入度与拓扑序列监视器',
  card2Desc: '展示相邻单词偏序提取、入度表、拓扑队列以及前缀/环冲突检测全过程',
  legend: [
    { label: '🔤 火星字符节点', color: '#0369a1' },
    { label: '🟢 已确定顺序字符', color: '#10b981' },
    { label: '⚡ 当前提取/考察边', color: '#f59e0b' },
    { label: '🚨 异常冲突字符', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设单词列表',
      type: 'select',
      defaultValue: 'valid',
      options: [
        { label: '合法字典序 (wrt, wrf, er, ett, rftt -> wertf)', value: 'valid' },
        { label: '非法前缀异常 (abc, ab -> 较长单词排在前面)', value: 'prefix_error' },
        { label: '环状逻辑冲突 (z, x, z -> 存在依赖回环)', value: 'cycle' },
      ],
    },
  ],
  presets: [
    { label: '合法字典序', values: { 'input-preset': 'valid' } },
    { label: '非法前缀陷阱', values: { 'input-preset': 'prefix_error' } },
    { label: '环冲突无解', values: { 'input-preset': 'cycle' } },
  ],
  metrics: [
    { id: 'metric-alien-chars', label: '涉及字符总数', color: '#38bdf8' },
    { id: 'metric-alien-order', label: '当前拓扑序列', color: '#10b981' },
    { id: 'metric-alien-queue', label: '0入度队列', color: '#f59e0b' },
    { id: 'metric-alien-phase', label: '当前分析阶段', color: '#a855f7' },
  ],
  codeLanguages: ALIEN_DICT_CODE_LANGUAGES,
  problemHtml: ALIEN_DICT_PROBLEM_HTML,
  analysisHtml: ALIEN_DICT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'valid') as string;
    return buildAlienDictSteps(preset);
  },
  renderCanvas: (container, step) => {
    const numChars = step.charList.length;
    const centerX = 150;
    const centerY = 75;
    const radius = 55;

    const coords: Record<string, { x: number; y: number }> = {};
    step.charList.forEach((ch, idx) => {
      const angle = (2 * Math.PI * idx) / numChars - Math.PI / 2;
      coords[ch] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const svgEdges = step.edges
      .map(([u, v]) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const isActive = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isActive ? '#f59e0b' : '#334155';
        const width = isActive ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const svgNodes = step.charList
      .map((ch) => {
        const p = coords[ch];
        if (!p) return '';

        const isOrdered = step.topoOrder.includes(ch);
        const inQ = step.queue?.includes(ch);
        const isAct = step.activeChar === ch;
        const isErr = step.status === 'error';

        let bg = '#0f172a';
        let border = '#334155';

        if (isOrdered) {
          bg = '#064e3b';
          border = '#10b981';
        } else if (inQ) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        } else if (isAct) {
          border = '#f59e0b';
        }

        if (isErr) {
          bg = '#7f1d1d';
          border = '#ef4444';
        }

        const deg = step.inDegrees[ch] ?? 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${ch}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">in:${deg}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">🛸 火星词典偏序依赖图</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            词表: [${step.wordList.join(', ')}]
          </span>
        </div>

        <div style="width: 100%; min-height: 160px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 160px;" viewBox="0 0 300 160">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部火星偏序沙盘舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">🛸 火星偏序提取与判环舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              拓扑顺序: <b>${step.topoOrder.length > 0 ? step.topoOrder.join(' ➔ ') : '提取中...'}</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>偏序法则:</b> 找到相邻单词首个不同字符 u 与 v，连有向边 u ➔ v
            </div>
            <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 4px; padding: 4px 8px; color: #fca5a5;">
              <b>前缀陷阱:</b> 较长单词排在较短前缀前面必不合法 (如 "abc" 在 "ab" 前)
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const degItems = step.charList.map((c) => {
      const d = step.inDegrees[c] ?? 0;
      return `<span style="background: #eff6ff; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #38bdf8; font-family: monospace;">'${c}': ${d}</span>`;
    }).join(' ');

    const orderStr = step.status === 'error'
      ? '<span style="color: #ef4444; font-weight: 700;">非法逻辑 (无有效拓扑序)</span>'
      : step.topoOrder.length > 0
        ? step.topoOrder.join(' ➔ ')
        : '排序中...';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f59e0b;">字符入度表 (inDegree):</span>
            <div style="display: flex; gap: 4px;">${degItems}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">拓扑排序结果:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${orderStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'alien-dict',
  name: '火星词典拓扑排序 (Alien Dictionary)',
  viewId: 'algo-alien-dict-view',
  icon: '👽',
  category: 'graph',
  description: '左程云算法通关课 Class 059：相邻单词首个不同字符提取偏序、非法前缀陷阱与拓扑排序判环 (LeetCode 269)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 89,
  learningGoal: '掌握字符偏序依赖建图、非法前缀陷阱的检测机制以及拓扑排序判环',
});

export { Visualizer as AlienDictVisualizer };
