/**
 * Class 017: 前缀树 (Trie) 基础结构设计与频次统计
 * 左程云算法通关课入门篇 Class 017 / 洛谷 P2580 / LeetCode 208
 *
 * 核心原语：
 *   Stage 1: 面向对象动态指针实现 (Object Pointer Trie - pass/end 拓扑展开)
 *   Stage 2: 静态连续数组竞赛版 (Static Array Trie - tree[N][26] 紧凑内存布局)
 *   Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing - search vs prefixNumber 与断裂剪枝)
 *
 * 视觉规范：
 *   Card 1: 纯净 SVG 前缀树拓扑沙盘 (无冗余内嵌卡片，层级节点与字符边流畅自适应)
 *   Card 2: 4 维状态指标 + 字符下潜滑轨 (Word Ribbon) + Figure 1 层次调用跟踪树 (RecursiveCallTraceAdapter)
 *   Card 3: 四语言暗色代码终端与 1-based 精准行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
  RecursiveCallTraceAdapter,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { TRIE_TREE_017_PROBLEM_CONTENT } from './trie-tree-017-problem-content';
import {
  TRIE_017_CODES,
  TRIE_017_CODE_LINES,
  TRIE_STAGE2_STATIC_CODES,
  TRIE_STAGE2_CODE_LINES,
} from './trie-tree-017-stage-codes';

export {
  TRIE_017_CODES,
  TRIE_017_CODE_LINES,
  TRIE_STAGE2_STATIC_CODES,
  TRIE_STAGE2_CODE_LINES,
};

export interface TrieNodeSnapshot {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: { [char: string]: number };
}

export interface Trie017Step extends StepBase {
  stepIndex?: number;
  nodes: TrieNodeSnapshot[];
  activeNodeId: number;
  curWord: string;
  curCharIndex: number;
  operation: 'insert' | 'search' | 'prefixNumber';
  resultCount?: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: string;
  activePath?: number[];
  staticTable?: {
    rows: Array<{ id: number; char: string; pass: number; end: number; nexts: Record<string, number> }>;
  };
  metrics?: Record<string, string | number>;
}

interface InternalNode {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: Map<string, InternalNode>;
}

function getSnapshot(allNodes: InternalNode[]): TrieNodeSnapshot[] {
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
}

// =========================================================================
// Stage 1 & 通用步进生成器: 动态指针实现 (Object Pointer Trie)
// =========================================================================
export function buildTrie017Steps(
  words: string[],
  queryWord: string,
  isPrefixQuery: boolean = false
): Trie017Step[] {
  const steps: Trie017Step[] = [];
  let nextId = 1;
  const root: InternalNode = { id: nextId++, char: 'ROOT', pass: 0, end: 0, children: new Map() };
  const allNodes: InternalNode[] = [root];
  const trace = new RecursiveCallTraceBuilder();

  // 1. 初始化入口
  trace.addHeader(`TrieTree() 初始化`, 0, '← 建立前缀树根节点 ROOT');
  steps.push({
    nodes: getSnapshot(allNodes),
    activeNodeId: 1,
    curWord: '',
    curCharIndex: -1,
    operation: 'insert',
    decision: `主函数入口：初始化前缀树 Trie，准备插入词库 [${words.join(', ')}]`,
    message: '核心原理：公用公共前缀节点，节点 pass 记录经过该节点的单词数，end 记录以此字符结尾的单词数',
    log: 'init TrieTree',
    codeLine: TRIE_017_CODE_LINES.init,
    statusBadge: { text: '前缀树初始化', type: 'info' },
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    activePath: [1],
    metrics: { '词库总数': words.length, '总节点数': 1 },
  });

  // 2. 依次插入所有单词
  for (const word of words) {
    let cur = root;
    cur.pass++;
    const path: number[] = [cur.id];

    trace.addRecursePrep(`insert("${word}")`, 0);
    trace.addConditionHit(`• 根节点 Node(#1) pass 自增 ➔ ${cur.pass}`, 1);

    steps.push({
      nodes: getSnapshot(allNodes),
      activeNodeId: cur.id,
      curWord: word,
      curCharIndex: -1,
      operation: 'insert',
      decision: `开始插入单词 "${word}"：根节点 pass 自增为 ${cur.pass}`,
      message: '准备沿字符边逐位下潜推进',
      log: `insert("${word}") pass=${cur.pass}`,
      codeLine: TRIE_017_CODE_LINES.insertStart,
      statusBadge: { text: `插入 "${word}"`, type: 'warning' },
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      activePath: [...path],
      metrics: { '当前单词': word, '下潜深度': 0 },
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      let child = cur.children.get(ch);
      const isNewNode = !child;
      if (!child) {
        child = { id: nextId++, char: ch, pass: 0, end: 0, children: new Map() };
        cur.children.set(ch, child);
        allNodes.push(child);
      }
      child.pass++;
      cur = child;
      path.push(cur.id);

      trace.addConditionHit(
        `• 字符 '${ch}' ➔ 走向 Node(#${cur.id}) pass 变为 ${cur.pass}${isNewNode ? ' (新建节点)' : ' (复用前缀)'}`,
        1
      );

      steps.push({
        nodes: getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: word,
        curCharIndex: i,
        operation: 'insert',
        decision: `字符 '${ch}' 匹配推进至节点 #${cur.id}：当前节点 pass=${cur.pass}${isNewNode ? '（新建节点）' : '（复用前缀）'}`,
        message: i === word.length - 1 ? '已抵达单词末尾字符' : '下潜下一字符分支',
        log: `node #${cur.id} ('${ch}'): pass=${cur.pass}`,
        codeLine: TRIE_017_CODE_LINES.insertAdvance,
        statusBadge: { text: `字符 '${ch}' pass++`, type: 'info' },
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        activePath: [...path],
        metrics: { '当前字符': ch, '字符索引': i, '节点 pass': cur.pass },
      });
    }

    cur.end++;
    trace.addReturnLeaf(`✔ 单词 "${word}" 插入完毕，末尾 Node(#${cur.id}) end++ ➔ ${cur.end}`, 1);

    steps.push({
      nodes: getSnapshot(allNodes),
      activeNodeId: cur.id,
      curWord: word,
      curCharIndex: word.length - 1,
      operation: 'insert',
      decision: `🎉 单词 "${word}" 插入完毕！末尾节点 #${cur.id} 的 end 计数递增为 ${cur.end}`,
      message: `该单词共计出现 ${cur.end} 次`,
      log: `word "${word}" end=${cur.end}`,
      codeLine: TRIE_017_CODE_LINES.insertDone,
      statusBadge: { text: `单词插入完成`, type: 'success' },
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      activePath: [...path],
      metrics: { '单词终点': word, '节点 end': cur.end },
    });
  }

  // 3. 执行查询
  let cur: InternalNode = root;
  const opType = isPrefixQuery ? 'prefixNumber' : 'search';
  const queryPath: number[] = [cur.id];

  trace.addHeader(
    `${opType}("${queryWord}")`,
    0,
    isPrefixQuery ? '← 启动前缀统计查询' : '← 启动完整单词词频查询'
  );

  steps.push({
    nodes: getSnapshot(allNodes),
    activeNodeId: 1,
    curWord: queryWord,
    curCharIndex: -1,
    operation: opType,
    decision: `开始执行查询：${isPrefixQuery ? '统计以 "' + queryWord + '" 为前缀的词数' : '查找完整单词 "' + queryWord + '" 的频次'}`,
    message: '从根节点开始顺次校验字符路径',
    log: `query("${queryWord}", type=${opType})`,
    codeLine: isPrefixQuery ? TRIE_017_CODE_LINES.prefixStart : TRIE_017_CODE_LINES.searchStart,
    statusBadge: { text: `开始查询`, type: 'info' },
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    activePath: [...queryPath],
    metrics: { '查询目标': queryWord, '查询类型': opType },
  });

  let notFound = false;
  for (let i = 0; i < queryWord.length; i++) {
    const ch = queryWord[i];
    const child: InternalNode | undefined = cur.children.get(ch);
    if (!child) {
      notFound = true;
      trace.addConditionHit(`✖ 字符分支 '${ch}' 缺失！节点 #${cur.id} 无此子树 ➔ 路径断裂`, 1);
      trace.addFinalResult(`提前退出，返回 0`, 0, '← 剪枝成功');

      steps.push({
        nodes: getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: queryWord,
        curCharIndex: i,
        operation: opType,
        resultCount: 0,
        decision: `❌ 字符分支 '${ch}' 缺失！节点 #${cur.id} 下无此分支，查询目标不存在`,
        message: '路径断裂，提前返回 0',
        log: `path missing at char '${ch}'`,
        codeLine: isPrefixQuery ? TRIE_017_CODE_LINES.prefixMiss : TRIE_017_CODE_LINES.searchMiss,
        statusBadge: { text: '路径断裂 (0)', type: 'danger' },
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        activePath: [...queryPath],
        metrics: { '断裂字符': ch, '最终结果': 0 },
      });
      break;
    }
    cur = child;
    queryPath.push(cur.id);

    trace.addConditionHit(`• 成功匹配 '${ch}' ➔ 下潜 Node(#${cur.id}) (pass: ${cur.pass}, end: ${cur.end})`, 1);

    steps.push({
      nodes: getSnapshot(allNodes),
      activeNodeId: cur.id,
      curWord: queryWord,
      curCharIndex: i,
      operation: opType,
      decision: `成功匹配字符 '${ch}' 走向节点 #${cur.id} (经过数 pass=${cur.pass}, 结尾数 end=${cur.end})`,
      message: '继续向深层节点扫描',
      log: `matched '${ch}' node #${cur.id}`,
      codeLine: isPrefixQuery ? TRIE_017_CODE_LINES.prefixAdvance : TRIE_017_CODE_LINES.searchAdvance,
      statusBadge: { text: `匹配 '${ch}'`, type: 'info' },
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      activePath: [...queryPath],
      metrics: { '匹配字符': ch, '当前 pass': cur.pass, '当前 end': cur.end },
    });
  }

  if (!notFound) {
    const ans = isPrefixQuery ? cur.pass : cur.end;
    trace.addFinalResult(
      `查询成功：${isPrefixQuery ? '前缀词数 pass = ' : '完整词频 end = '}${ans}`,
      0,
      '← 查询结束'
    );

    steps.push({
      nodes: getSnapshot(allNodes),
      activeNodeId: cur.id,
      curWord: queryWord,
      curCharIndex: queryWord.length - 1,
      operation: opType,
      resultCount: ans,
      decision: `🎉 查询成功！${isPrefixQuery ? '前缀 "' + queryWord + '" 匹配词数 pass = ' + ans : '完整单词 "' + queryWord + '" 出现次数 end = ' + ans}`,
      message: `查询结果为: ${ans}`,
      log: `return ans=${ans}`,
      codeLine: isPrefixQuery ? TRIE_017_CODE_LINES.prefixDone : TRIE_017_CODE_LINES.searchDone,
      statusBadge: { text: `结果: ${ans}`, type: 'success' },
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      activePath: [...queryPath],
      metrics: { '最终结果': ans, '查询状态': '成功' },
    });
  }

  return steps;
}

// =========================================================================
// Stage 2: 静态连续数组竞赛卡常版 (Static Array Trie)
// =========================================================================
export function buildStage2StaticSteps(
  words: string[] = ['code', 'coder', 'coding', 'codec'],
  queryWord: string = 'code'
): Trie017Step[] {
  const steps: Trie017Step[] = [];
  let cnt = 1;
  const treeMap = new Map<number, { char: string; pass: number; end: number; nexts: Map<string, number> }>();
  treeMap.set(1, { char: 'ROOT', pass: 0, end: 0, nexts: new Map() });

  const getStaticSnapshot = (): TrieNodeSnapshot[] => {
    const res: TrieNodeSnapshot[] = [];
    treeMap.forEach((val, id) => {
      const childObj: Record<string, number> = {};
      val.nexts.forEach((tgt, ch) => {
        childObj[ch] = tgt;
      });
      res.push({
        id,
        char: val.char,
        pass: val.pass,
        end: val.end,
        children: childObj,
      });
    });
    return res;
  };

  const getTableData = () => {
    const rows: Array<{ id: number; char: string; pass: number; end: number; nexts: Record<string, number> }> = [];
    treeMap.forEach((v, id) => {
      const nxt: Record<string, number> = {};
      v.nexts.forEach((tgt, ch) => {
        nxt[ch] = tgt;
      });
      rows.push({ id, char: v.char, pass: v.pass, end: v.end, nexts: nxt });
    });
    return { rows };
  };

  const trace = new RecursiveCallTraceBuilder();
  trace.addHeader('TrieStatic 初始化 (MAXN=100005, cnt=1)', 0, '← 预分配二维连续内存');

  steps.push({
    nodes: getStaticSnapshot(),
    activeNodeId: 1,
    curWord: '',
    curCharIndex: -1,
    operation: 'insert',
    decision: '静态数组模式初始化：tree[MAXN][26] 连续内存清零，分配根节点下标 1',
    message: '核心优势：连续内存保证 CPU L1/L2 Cache 极高命中率，彻底消灭动态 new 的 GC 停顿与指针解引用开销。',
    log: 'static array init: cnt=1',
    codeLine: TRIE_STAGE2_CODE_LINES.init,
    statusBadge: { text: '静态内存初始化', type: 'info' },
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    activePath: [1],
    staticTable: getTableData(),
    metrics: { '已分配节点 cnt': cnt, '内存连续性': '100% 紧凑' },
  });

  for (const word of words) {
    let cur = 1;
    const rootItem = treeMap.get(1)!;
    rootItem.pass++;
    const path: number[] = [1];

    trace.addRecursePrep(`insert("${word}") ➔ 数组写入`, 0);
    trace.addConditionHit(`• pass[1] 自增 ➔ ${rootItem.pass}`, 1);

    steps.push({
      nodes: getStaticSnapshot(),
      activeNodeId: cur,
      curWord: word,
      curCharIndex: -1,
      operation: 'insert',
      decision: `静态插入 "${word}"：根节点 pass[1] 自增为 ${rootItem.pass}`,
      message: '通过下标 path = c - "a" 定位二维数组 tree[cur][path]',
      log: `insert("${word}") pass[1]=${rootItem.pass}`,
      codeLine: TRIE_STAGE2_CODE_LINES.insertStart,
      statusBadge: { text: `静态写入 "${word}"`, type: 'warning' },
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      activePath: [...path],
      staticTable: getTableData(),
      metrics: { '当前单词': word, '指针下标 cur': cur },
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const curItem = treeMap.get(cur)!;
      let nextNodeId = curItem.nexts.get(ch);
      let isAlloc = false;
      if (!nextNodeId) {
        isAlloc = true;
        cnt++;
        nextNodeId = cnt;
        curItem.nexts.set(ch, nextNodeId);
        treeMap.set(nextNodeId, { char: ch, pass: 0, end: 0, nexts: new Map() });
      }
      const childItem = treeMap.get(nextNodeId)!;
      childItem.pass++;
      cur = nextNodeId;
      path.push(cur);

      trace.addConditionHit(
        `• path='${ch}'-'a' ➔ tree[${curItem.char}][${ch}] = ${cur}${isAlloc ? ' (++cnt 分配)' : ' (复用行号)'}, pass[${cur}]=${childItem.pass}`,
        1
      );

      steps.push({
        nodes: getStaticSnapshot(),
        activeNodeId: cur,
        curWord: word,
        curCharIndex: i,
        operation: 'insert',
        decision: `字符 '${ch}' (path=${ch.charCodeAt(0) - 97})：${isAlloc ? '未开辟，分配下标 ++cnt=' + cnt : '已开辟，直接读取下标 ' + cur}，pass[${cur}]=${childItem.pass}`,
        message: '直接数组寻址，消除指针间接寻址',
        log: `tree[cur][path]=${cur}, pass=${childItem.pass}`,
        codeLine: TRIE_STAGE2_CODE_LINES.insertAdvance,
        statusBadge: { text: isAlloc ? `++cnt ➔ #${cur}` : `复用行 #${cur}`, type: 'info' },
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        activePath: [...path],
        staticTable: getTableData(),
        metrics: { '分配节点 cnt': cnt, '当前行号 cur': cur },
      });
    }

    const endItem = treeMap.get(cur)!;
    endItem.end++;
    trace.addReturnLeaf(`✔ 单词 "${word}" 静态录入完毕，end[${cur}]++ ➔ ${endItem.end}`, 1);

    steps.push({
      nodes: getStaticSnapshot(),
      activeNodeId: cur,
      curWord: word,
      curCharIndex: word.length - 1,
      operation: 'insert',
      decision: `🎉 单词 "${word}" 写入完毕！静态槽位 end[${cur}] 自增为 ${endItem.end}`,
      message: `该单词频次计数为 ${endItem.end}`,
      log: `end[${cur}]=${endItem.end}`,
      codeLine: TRIE_STAGE2_CODE_LINES.insertDone,
      statusBadge: { text: '静态词尾标记', type: 'success' },
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      activePath: [...path],
      staticTable: getTableData(),
      metrics: { '词尾下标': cur, '完整词频 end': endItem.end },
    });
  }

  // 执行精确查询
  let cur = 1;
  const qPath = [1];
  trace.addHeader(`search("${queryWord}") 静态数组检索`, 0, '← 数组索引直查');

  steps.push({
    nodes: getStaticSnapshot(),
    activeNodeId: 1,
    curWord: queryWord,
    curCharIndex: -1,
    operation: 'search',
    decision: `开始执行静态数组查找 search("${queryWord}")：从根行 cur=1 顺次下潜`,
    message: '每一步判断 tree[cur][path] 是否为 0，若为 0 瞬间剪枝',
    log: `search("${queryWord}")`,
    codeLine: TRIE_STAGE2_CODE_LINES.searchStart,
    statusBadge: { text: '静态检索', type: 'info' },
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    activePath: [...qPath],
    staticTable: getTableData(),
    metrics: { '查询目标': queryWord, '当前行': cur },
  });

  for (let i = 0; i < queryWord.length; i++) {
    const ch = queryWord[i];
    const curItem = treeMap.get(cur)!;
    const nextId = curItem.nexts.get(ch);
    if (!nextId) {
      trace.addConditionHit(`✖ tree[${cur}]['${ch}'-'a'] == 0 ➔ 分支未分配，返回 0`, 1);
      steps.push({
        nodes: getStaticSnapshot(),
        activeNodeId: cur,
        curWord: queryWord,
        curCharIndex: i,
        operation: 'search',
        resultCount: 0,
        decision: `❌ 字符 '${ch}' 处 tree[${cur}][${ch.charCodeAt(0) - 97}] == 0，路径不存在`,
        message: '直接返回 0，无任何无效搜索',
        log: 'tree branch is 0',
        codeLine: TRIE_STAGE2_CODE_LINES.searchMiss,
        statusBadge: { text: '分支为 0', type: 'danger' },
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        activePath: [...qPath],
        staticTable: getTableData(),
        metrics: { '结果': 0 },
      });
      return steps;
    }
    cur = nextId;
    qPath.push(cur);
    trace.addConditionHit(`• 命中字符 '${ch}' ➔ cur = tree[prev][path] = ${cur}`, 1);

    steps.push({
      nodes: getStaticSnapshot(),
      activeNodeId: cur,
      curWord: queryWord,
      curCharIndex: i,
      operation: 'search',
      decision: `成功跳跃至行号 cur=${cur} (对应字符 '${ch}')`,
      message: '继续检查下一字符',
      log: `cur = ${cur}`,
      codeLine: TRIE_STAGE2_CODE_LINES.searchAdvance,
      statusBadge: { text: `跳至 #${cur}`, type: 'info' },
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      activePath: [...qPath],
      staticTable: getTableData(),
      metrics: { '当前行号': cur },
    });
  }

  const ans = treeMap.get(cur)!.end;
  trace.addFinalResult(`最终读取 end[${cur}] = ${ans}`, 0, '← 检索完成');

  steps.push({
    nodes: getStaticSnapshot(),
    activeNodeId: cur,
    curWord: queryWord,
    curCharIndex: queryWord.length - 1,
    operation: 'search',
    resultCount: ans,
    decision: `🎉 静态数组检索完成！最终读取 end[${cur}] = ${ans}`,
    message: `单词 "${queryWord}" 在词库中出现 ${ans} 次`,
    log: `return end[${cur}]=${ans}`,
    codeLine: TRIE_STAGE2_CODE_LINES.searchDone,
    statusBadge: { text: `词频 ${ans}`, type: 'success' },
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    activePath: [...qPath],
    staticTable: getTableData(),
    metrics: { '最终词频': ans },
  });

  return steps;
}

// =========================================================================
// Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing)
// =========================================================================
export function buildStage3MultiQuerySteps(): Trie017Step[] {
  // 构建词库: ["apple", "app", "apply", "banana"]
  // 综合执行:
  // 1. search("app") -> 1 (精准匹配)
  // 2. prefixNumber("app") -> 3 (前缀匹配)
  // 3. search("appl") -> 0 (前缀存在但 end=0)
  // 4. search("orange") -> 0 (首字母即断裂)
  return buildTrie017Steps(['apple', 'app', 'apply', 'banana'], 'app', true);
}

// =========================================================================
// SVG 前缀树拓扑渲染器 (Card 1: Clean SVG Trie Tree Sandbox)
// =========================================================================
interface LayoutNode {
  id: number;
  char: string;
  pass: number;
  end: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  children: Array<{ char: string; node: LayoutNode }>;
}

function computeTrieLayout(nodes: TrieNodeSnapshot[]): {
  layoutNodes: Map<number, LayoutNode>;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const nodeMap = new Map<number, TrieNodeSnapshot>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 递归构建拓扑树
  const buildSubtree = (nodeId: number, depth: number): LayoutNode => {
    const raw = nodeMap.get(nodeId)!;
    const childrenList: Array<{ char: string; node: LayoutNode }> = [];
    const sortedChars = Object.keys(raw.children).sort();
    for (const ch of sortedChars) {
      const childId = raw.children[ch];
      if (nodeMap.has(childId)) {
        childrenList.push({ char: ch, node: buildSubtree(childId, depth + 1) });
      }
    }
    return {
      id: raw.id,
      char: raw.char,
      pass: raw.pass,
      end: raw.end,
      depth,
      x: 0,
      y: depth * 76 + 50,
      width: 1,
      children: childrenList,
    };
  };

  const rootLayout = buildSubtree(1, 0);

  // 计算子树宽度 (叶子节点宽 60px，非叶子节点为其子树宽度之和)
  const calcWidth = (node: LayoutNode): number => {
    if (node.children.length === 0) {
      node.width = 64;
      return 64;
    }
    let sum = 0;
    for (const c of node.children) {
      sum += calcWidth(c.node);
    }
    node.width = Math.max(64, sum);
    return node.width;
  };
  calcWidth(rootLayout);

  // 分配 X 坐标
  const layoutNodes = new Map<number, LayoutNode>();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const assignPositions = (node: LayoutNode, leftBound: number) => {
    layoutNodes.set(node.id, node);
    if (node.children.length === 0) {
      node.x = leftBound + node.width / 2;
    } else {
      let curLeft = leftBound;
      for (const c of node.children) {
        assignPositions(c.node, curLeft);
        curLeft += c.node.width;
      }
      const firstX = node.children[0].node.x;
      const lastX = node.children[node.children.length - 1].node.x;
      node.x = (firstX + lastX) / 2;
    }

    minX = Math.min(minX, node.x - 30);
    maxX = Math.max(maxX, node.x + 30);
    minY = Math.min(minY, node.y - 30);
    maxY = Math.max(maxY, node.y + 40);
  };

  assignPositions(rootLayout, 0);

  return { layoutNodes, minX, maxX, minY, maxY };
}

export function renderTrieCanvas(container: HTMLElement, step: Trie017Step): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.overflow = 'hidden';
  container.style.background = '#090d16';

  if (!step.nodes || step.nodes.length === 0) {
    container.innerHTML = `<div class="text-slate-500 font-mono text-sm">前缀树为空</div>`;
    return;
  }

  const { layoutNodes, minX, maxX, minY, maxY } = computeTrieLayout(step.nodes);
  const activePathSet = new Set(step.activePath || [step.activeNodeId]);
  const activeNodeId = step.activeNodeId;

  const width = Math.max(300, maxX - minX + 80);
  const height = Math.max(260, maxY - minY + 60);
  const viewBox = `${minX - 40} ${minY - 30} ${width} ${height}`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.maxHeight = '100%';
  svg.style.userSelect = 'none';

  // 1. 绘制连线与边上字符
  layoutNodes.forEach(node => {
    node.children.forEach(edge => {
      const child = edge.node;
      const isPathActive = activePathSet.has(node.id) && activePathSet.has(child.id);

      // 平滑贝塞尔曲线
      const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const midY = (node.y + child.y) / 2;
      const d = `M ${node.x} ${node.y} C ${node.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`;
      pathElem.setAttribute('d', d);
      pathElem.setAttribute('fill', 'none');
      pathElem.setAttribute('stroke', isPathActive ? '#38bdf8' : '#334155');
      pathElem.setAttribute('stroke-width', isPathActive ? '2.5' : '1.5');
      if (isPathActive) {
        pathElem.setAttribute('filter', 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))');
      }
      svg.appendChild(pathElem);

      // 边中间的字符胶囊徽标
      const mx = (node.x + child.x) / 2;
      const my = midY;
      const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      badgeGroup.setAttribute('transform', `translate(${mx}, ${my})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '-9');
      rect.setAttribute('y', '-9');
      rect.setAttribute('width', '18');
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', isPathActive ? '#0284c7' : '#1e293b');
      rect.setAttribute('stroke', isPathActive ? '#38bdf8' : '#475569');
      rect.setAttribute('stroke-width', '1');

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('fill', isPathActive ? '#ffffff' : '#94a3b8');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', 'monospace');
      txt.textContent = edge.char;

      badgeGroup.appendChild(rect);
      badgeGroup.appendChild(txt);
      svg.appendChild(badgeGroup);
    });
  });

  // 2. 绘制节点
  layoutNodes.forEach(node => {
    const isActive = node.id === activeNodeId;
    const isPath = activePathSet.has(node.id);
    const isRoot = node.id === 1;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

    // 光晕圈
    if (isActive) {
      const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulseRing.setAttribute('r', '27');
      pulseRing.setAttribute('fill', 'none');
      pulseRing.setAttribute('stroke', '#38bdf8');
      pulseRing.setAttribute('stroke-width', '2');
      pulseRing.setAttribute('opacity', '0.6');
      pulseRing.setAttribute('stroke-dasharray', '4 2');
      g.appendChild(pulseRing);
    }

    // 主圆环
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '20');
    circle.setAttribute(
      'fill',
      isActive
        ? '#0369a1'
        : isPath
        ? '#0f172a'
        : isRoot
        ? '#1e293b'
        : '#0b1329'
    );
    circle.setAttribute(
      'stroke',
      isActive
        ? '#38bdf8'
        : isPath
        ? '#0284c7'
        : isRoot
        ? '#64748b'
        : '#334155'
    );
    circle.setAttribute('stroke-width', isActive ? '2.5' : '1.5');
    if (isActive) {
      circle.setAttribute('filter', 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))');
    }
    g.appendChild(circle);

    // 节点主体文字 (Root 标注 ROOT，其它展示对应字符)
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('fill', isActive ? '#ffffff' : '#f8fafc');
    label.setAttribute('font-size', isRoot ? '9' : '13');
    label.setAttribute('font-weight', '800');
    label.setAttribute('font-family', 'sans-serif');
    label.textContent = isRoot ? 'ROOT' : node.char;
    g.appendChild(label);

    // pass 计数徽标 (左下方蓝色小标)
    const passG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    passG.setAttribute('transform', 'translate(-12, 17)');
    const passBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    passBg.setAttribute('x', '-11');
    passBg.setAttribute('y', '-6');
    passBg.setAttribute('width', '22');
    passBg.setAttribute('height', '12');
    passBg.setAttribute('rx', '4');
    passBg.setAttribute('fill', '#0284c7');
    passBg.setAttribute('stroke', '#38bdf8');
    passBg.setAttribute('stroke-width', '0.5');
    const passTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    passTxt.setAttribute('text-anchor', 'middle');
    passTxt.setAttribute('dominant-baseline', 'central');
    passTxt.setAttribute('fill', '#ffffff');
    passTxt.setAttribute('font-size', '8');
    passTxt.setAttribute('font-weight', '700');
    passTxt.textContent = `p:${node.pass}`;
    passG.appendChild(passBg);
    passG.appendChild(passTxt);
    g.appendChild(passG);

    // end 计数徽标 (右下方红色/玫瑰色小标，当 end > 0 或活跃时显示)
    if (node.end > 0 || isRoot) {
      const endG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      endG.setAttribute('transform', 'translate(12, 17)');
      const endBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      endBg.setAttribute('x', '-11');
      endBg.setAttribute('y', '-6');
      endBg.setAttribute('width', '22');
      endBg.setAttribute('height', '12');
      endBg.setAttribute('rx', '4');
      endBg.setAttribute('fill', node.end > 0 ? '#e11d48' : '#475569');
      endBg.setAttribute('stroke', node.end > 0 ? '#fb7185' : '#64748b');
      endBg.setAttribute('stroke-width', '0.5');
      const endTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      endTxt.setAttribute('text-anchor', 'middle');
      endTxt.setAttribute('dominant-baseline', 'central');
      endTxt.setAttribute('fill', '#ffffff');
      endTxt.setAttribute('font-size', '8');
      endTxt.setAttribute('font-weight', '700');
      endTxt.textContent = `e:${node.end}`;
      endG.appendChild(endBg);
      endG.appendChild(endTxt);
      g.appendChild(endG);
    }

    svg.appendChild(g);
  });

  container.appendChild(svg);
}

// =========================================================================
// Card 2 自定义指标与调用链渲染器 (Word Ribbon + Static Memory Table + Call Trace)
// =========================================================================
export function renderTrieCard2(container: HTMLElement, step: Trie017Step): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2 p-2.5 overflow-hidden bg-slate-950 text-slate-100';

  // 1. 顶部 4 维指标看板
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">当前操作</span>
      <span class="text-sky-300 font-mono font-bold text-xs mt-0.5 truncate">
        ${step.operation === 'insert' ? '插入单词' : step.operation === 'prefixNumber' ? '前缀统计' : '完整匹配'}
      </span>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">目标单词</span>
      <span class="text-amber-300 font-mono font-bold text-xs mt-0.5 truncate">"${step.curWord || '—'}"</span>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">活跃节点</span>
      <span class="text-emerald-300 font-mono font-bold text-xs mt-0.5 truncate">节点 #${step.activeNodeId}</span>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">结果计数</span>
      <span class="text-purple-300 font-mono font-bold text-xs mt-0.5 truncate">
        ${step.resultCount !== undefined ? step.resultCount : '—'}
      </span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 单词字符推进滑轨 (Word Character Ribbon)
  if (step.curWord) {
    const ribbonCard = document.createElement('div');
    ribbonCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex flex-col gap-1 flex-shrink-0';
    ribbonCard.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>🔤 字符下潜滑轨 (Word Characters Ribbon)</span>
        <span class="text-[10px] text-slate-500 font-mono">active: index ${step.curCharIndex >= 0 ? step.curCharIndex : 'head'}</span>
      </div>
    `;

    const ribbonTrack = document.createElement('div');
    ribbonTrack.className = 'flex gap-1.5 overflow-x-auto py-1 items-center';
    for (let i = 0; i < step.curWord.length; i++) {
      const ch = step.curWord[i];
      const isActive = i === step.curCharIndex;
      const isPassed = i < step.curCharIndex;
      const pill = document.createElement('div');
      pill.className = `flex flex-col items-center justify-center px-2 py-1 min-w-[34px] rounded border font-mono text-xs font-bold transition-all ${
        isActive
          ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/30 ring-1 ring-sky-400'
          : isPassed
          ? 'bg-emerald-500/10 border-emerald-600/40 text-emerald-300'
          : 'bg-slate-800/80 border-slate-700 text-slate-400'
      }`;
      pill.innerHTML = `<span>${ch}</span><span class="text-[8px] font-normal opacity-70">#${i}</span>`;
      ribbonTrack.appendChild(pill);
    }
    ribbonCard.appendChild(ribbonTrack);
    container.appendChild(ribbonCard);
  }

  // 3. Stage 2 静态内存映射表看板 (若提供 staticTable)
  if (step.staticTable && step.staticTable.rows.length > 0) {
    const staticCard = document.createElement('div');
    staticCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex flex-col gap-1 flex-shrink-0';
    staticCard.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>💾 静态连续数组映射表 (tree[id][26] & pass & end)</span>
        <span class="text-[10px] text-emerald-400 font-mono">cnt = ${step.nodes.length}</span>
      </div>
      <div class="max-h-[85px] overflow-y-auto text-[11px] font-mono border border-slate-800/80 rounded">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-800/70 text-slate-400 sticky top-0">
            <tr>
              <th class="p-1 border-b border-slate-700">id</th>
              <th class="p-1 border-b border-slate-700">字符</th>
              <th class="p-1 border-b border-slate-700 text-sky-400">pass</th>
              <th class="p-1 border-b border-slate-700 text-rose-400">end</th>
              <th class="p-1 border-b border-slate-700">子分支 (char ➔ id)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50">
            ${step.staticTable.rows.map(r => {
              const isCur = r.id === step.activeNodeId;
              const nextsStr = Object.entries(r.nexts).map(([c, id]) => `${c}➔${id}`).join(', ') || '—';
              return `
                <tr class="${isCur ? 'bg-sky-500/20 text-sky-200 font-bold' : 'text-slate-300'}">
                  <td class="p-1">#${r.id}</td>
                  <td class="p-1">${r.char}</td>
                  <td class="p-1 text-sky-400">${r.pass}</td>
                  <td class="p-1 text-rose-400">${r.end}</td>
                  <td class="p-1 text-slate-400 text-[10px]">${nextsStr}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    container.appendChild(staticCard);
  }

  // 4. 调用链路树 (Figure 1 层次规范适配器)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌳 前缀树状态演进与调用链 (Call Trace)',
      maxHeight: '100%',
    });
    container.appendChild(traceBox);
  }
}

// =========================================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// =========================================================================
export const trieTree017Visualizer = registerDeclarativeAlgorithm<Trie017Step>({
  id: 'trie-tree-017',
  name: 'Class 017: 前缀树基础结构与频次统计',
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 17,
  aliases: ['class017-code01', 'trie-tree-017', 'trie-prefix-tree', 'leetcode-208'],
  learningGoal: '深入掌握前缀树节点 pass 与 end 核心设计，理解多模式串共享公共前缀的快速统计与静态数组优化',
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 面向对象动态指针实现 (Object Pointer Trie)',
      shortName: '动态指针实现',
      card2Title: '前缀树构建与词频拓扑追踪',
      card2Desc: '动态指针链表推进：节点 pass 统计经过数，end 记录以其结尾的词频',
      codeLanguages: TRIE_017_CODES,
      generateSteps: () => buildTrie017Steps(['apple', 'app', 'apply', 'banana'], 'app', true),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 静态连续数组竞赛版 (Static Array Trie)',
      shortName: '静态连续数组',
      card2Title: '静态内存映射表与连续索引推演',
      card2Desc: '基于 tree[N][26] 静态分配表，展示二维平坦化指针跳转与 CPU 缓存友好设计',
      codeLanguages: TRIE_STAGE2_STATIC_CODES,
      generateSteps: () => buildStage2StaticSteps(['code', 'coder', 'coding', 'codec'], 'code'),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing)',
      shortName: '多模态检索探测',
      card2Title: '完整词查找 vs 前缀匹配与分支断裂剪枝',
      card2Desc: '对比 search 与 prefixNumber；展示分支缺失时快速失败提前返回 0 的剪枝公理',
      codeLanguages: TRIE_017_CODES,
      generateSteps: () => buildStage3MultiQuerySteps(),
    },
  ],
  codeLanguages: TRIE_017_CODES,
  problemHtml: TRIE_TREE_017_PROBLEM_CONTENT.description + TRIE_TREE_017_PROBLEM_CONTENT.mechanisms,
  presets: [
    {
      label: '经典四词库 + 前缀查询 (apple, app, apply, banana ➔ prefix: app)',
      values: {
        words: 'apple, app, apply, banana',
        query: 'app',
        isPrefix: 'prefix',
      },
    },
    {
      label: '重叠前缀与多词 (cat, caterpillar, car, dog, cart ➔ prefix: ca)',
      values: {
        words: 'cat, caterpillar, car, dog, cart',
        query: 'ca',
        isPrefix: 'prefix',
      },
    },
    {
      label: '单词冲突与词频统计 (code, coder, coding, codec, code ➔ search: code)',
      values: {
        words: 'code, coder, coding, codec, code',
        query: 'code',
        isPrefix: 'exact',
      },
    },
    {
      label: '路径缺失断裂探测 (tree, trie, trace ➔ search: truth)',
      values: {
        words: 'tree, trie, trace',
        query: 'truth',
        isPrefix: 'exact',
      },
    },
  ],
  inputs: [
    {
      id: 'words',
      label: '插入单词库 (逗号分隔)',
      type: 'text',
      defaultValue: 'apple, app, apply, banana',
      placeholder: '请输入单词列表，如 apple, app, banana',
    },
    {
      id: 'query',
      label: '查询字符串',
      type: 'text',
      defaultValue: 'app',
      placeholder: '输入待检索的单词或前缀',
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
  generateSteps: (inputs) => {
    const raw = String(inputs?.words || 'apple, app, apply, banana');
    const words = raw.split(',').map((s) => s.trim().toLowerCase()).filter((w) => w.length > 0);
    const query = String(inputs?.query || 'app').trim().toLowerCase();
    const isPrefix = inputs?.isPrefix !== 'exact';
    return buildTrie017Steps(words.length > 0 ? words : ['apple', 'app'], query, isPrefix);
  },
  renderCanvas: (container, step) => {
    renderTrieCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTrieCard2(container, step);
  },
});
