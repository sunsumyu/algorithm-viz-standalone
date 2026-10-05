/**
 * 通用 26-Trie 字典树统一状态推演编译器 (GeneralTrieStepCompiler)
 * 深度模块 (Deep Module): 封装前缀树动态指针构建、字符逐位下潜、静态二维连续内存数组映射与断裂剪枝推演
 * 遵循 Matt Pocock 深模块架构规范，为所有 Trie 算法提供单一推演事实源
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  GeneralTrieNodeSnapshot,
  GeneralTrieStepDef,
} from './general-trie-canvas-adapter';

export interface GeneralTrieStep extends GeneralTrieStepDef {
  stepIndex?: number;
  codeLine?: HighlightTarget;
}

interface InternalNode {
  id: number;
  char: string;
  pass: number;
  end: number;
  children: Map<string, InternalNode>;
}

export class GeneralTrieStepCompiler {
  private static getSnapshot(allNodes: InternalNode[]): GeneralTrieNodeSnapshot[] {
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

  /**
   * Stage 1 & 通用步进生成器: 动态指针实现 (Object Pointer Trie)
   */
  public static compileDynamicPointerSteps(
    words: string[],
    queryWord: string,
    isPrefixQuery: boolean = false,
    codeLines?: Record<string, HighlightTarget>
  ): GeneralTrieStep[] {
    const lines = codeLines || {
      init: { java: 3, cpp: 3, python: 2, javascript: 2, typescript: 2 },
      insertStart: { java: 12, cpp: 12, python: 11, javascript: 10, typescript: 10 },
      insertAdvance: { java: 17, cpp: 17, python: 15, javascript: 14, typescript: 14 },
      insertDone: { java: 21, cpp: 21, python: 18, javascript: 17, typescript: 17 },
      searchStart: { java: 25, cpp: 25, python: 21, javascript: 20, typescript: 20 },
      searchAdvance: { java: 28, cpp: 28, python: 24, javascript: 23, typescript: 23 },
      searchMiss: { java: 27, cpp: 27, python: 23, javascript: 22, typescript: 22 },
      searchDone: { java: 31, cpp: 31, python: 26, javascript: 25, typescript: 25 },
      prefixStart: { java: 35, cpp: 35, python: 29, javascript: 28, typescript: 28 },
      prefixAdvance: { java: 38, cpp: 38, python: 32, javascript: 31, typescript: 31 },
      prefixMiss: { java: 37, cpp: 37, python: 31, javascript: 30, typescript: 30 },
      prefixDone: { java: 41, cpp: 41, python: 34, javascript: 33, typescript: 33 },
    };

    const steps: GeneralTrieStep[] = [];
    let nextId = 1;
    const root: InternalNode = { id: nextId++, char: 'ROOT', pass: 0, end: 0, children: new Map() };
    const allNodes: InternalNode[] = [root];
    const trace = new RecursiveCallTraceBuilder();

    // 1. 初始化入口
    trace.addHeader(`TrieTree() 初始化`, 0, '← 建立前缀树根节点 ROOT');
    steps.push({
      nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
      activeNodeId: 1,
      curWord: '',
      curCharIndex: -1,
      operation: 'insert',
      decision: `主函数入口：初始化前缀树 Trie，准备插入词库 [${words.join(', ')}]`,
      message: '核心原理：公用公共前缀节点，节点 pass 记录经过该节点的单词数，end 记录以此字符结尾的单词数',
      log: 'init TrieTree',
      codeLine: lines.init,
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
        nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: word,
        curCharIndex: -1,
        operation: 'insert',
        decision: `开始插入单词 "${word}"：根节点 pass 自增为 ${cur.pass}`,
        message: '准备沿字符边逐位下潜推进',
        log: `insert("${word}") pass=${cur.pass}`,
        codeLine: lines.insertStart,
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
          nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
          activeNodeId: cur.id,
          curWord: word,
          curCharIndex: i,
          operation: 'insert',
          decision: `字符 '${ch}' 匹配推进至节点 #${cur.id}：当前节点 pass=${cur.pass}${isNewNode ? '（新建节点）' : '（复用前缀）'}`,
          message: i === word.length - 1 ? '已抵达单词末尾字符' : '下潜下一字符分支',
          log: `node #${cur.id} ('${ch}'): pass=${cur.pass}`,
          codeLine: lines.insertAdvance,
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
        nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: word,
        curCharIndex: word.length - 1,
        operation: 'insert',
        decision: `🎉 单词 "${word}" 插入完毕！末尾节点 #${cur.id} 的 end 计数递增为 ${cur.end}`,
        message: `该单词共计出现 ${cur.end} 次`,
        log: `word "${word}" end=${cur.end}`,
        codeLine: lines.insertDone,
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
      nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
      activeNodeId: 1,
      curWord: queryWord,
      curCharIndex: -1,
      operation: opType,
      decision: `开始执行查询：${isPrefixQuery ? '统计以 "' + queryWord + '" 为前缀的词数' : '查找完整单词 "' + queryWord + '" 的频次'}`,
      message: '从根节点开始顺次校验字符路径',
      log: `query("${queryWord}", type=${opType})`,
      codeLine: isPrefixQuery ? lines.prefixStart : lines.searchStart,
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
          nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
          activeNodeId: cur.id,
          curWord: queryWord,
          curCharIndex: i,
          operation: opType,
          resultCount: 0,
          decision: `❌ 字符分支 '${ch}' 缺失！节点 #${cur.id} 下无此分支，查询目标不存在`,
          message: '路径断裂，提前返回 0',
          log: `path missing at char '${ch}'`,
          codeLine: isPrefixQuery ? lines.prefixMiss : lines.searchMiss,
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
        nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: queryWord,
        curCharIndex: i,
        operation: opType,
        decision: `成功匹配字符 '${ch}' 走向节点 #${cur.id} (经过数 pass=${cur.pass}, 结尾数 end=${cur.end})`,
        message: '继续向深层节点扫描',
        log: `matched '${ch}' node #${cur.id}`,
        codeLine: isPrefixQuery ? lines.prefixAdvance : lines.searchAdvance,
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
        nodes: GeneralTrieStepCompiler.getSnapshot(allNodes),
        activeNodeId: cur.id,
        curWord: queryWord,
        curCharIndex: queryWord.length - 1,
        operation: opType,
        resultCount: ans,
        decision: `🎉 查询成功！${isPrefixQuery ? '前缀 "' + queryWord + '" 匹配词数 pass = ' + ans : '完整单词 "' + queryWord + '" 出现次数 end = ' + ans}`,
        message: `查询结果为: ${ans}`,
        log: `return ans=${ans}`,
        codeLine: isPrefixQuery ? lines.prefixDone : lines.searchDone,
        statusBadge: { text: `结果: ${ans}`, type: 'success' },
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        activePath: [...queryPath],
        metrics: { '最终结果': ans, '查询状态': '成功' },
      });
    }

    return steps;
  }

  /**
   * Stage 2: 静态连续数组竞赛卡常版 (Static Array Trie)
   */
  public static compileStaticArraySteps(
    words: string[] = ['code', 'coder', 'coding', 'codec'],
    queryWord: string = 'code',
    codeLines?: Record<string, HighlightTarget>
  ): GeneralTrieStep[] {
    const lines = codeLines || {
      init: { java: 4, cpp: 4, python: 3, javascript: 2, typescript: 2 },
      insertStart: { java: 12, cpp: 12, python: 10, javascript: 9, typescript: 9 },
      insertAdvance: { java: 16, cpp: 16, python: 14, javascript: 13, typescript: 13 },
      insertDone: { java: 20, cpp: 20, python: 17, javascript: 16, typescript: 16 },
      searchStart: { java: 24, cpp: 24, python: 20, javascript: 19, typescript: 19 },
      searchAdvance: { java: 27, cpp: 27, python: 23, javascript: 22, typescript: 22 },
      searchMiss: { java: 26, cpp: 26, python: 22, javascript: 21, typescript: 21 },
      searchDone: { java: 30, cpp: 30, python: 25, javascript: 24, typescript: 24 },
    };

    const steps: GeneralTrieStep[] = [];
    let cnt = 1;
    const treeMap = new Map<number, { char: string; pass: number; end: number; nexts: Map<string, number> }>();
    treeMap.set(1, { char: 'ROOT', pass: 0, end: 0, nexts: new Map() });

    const getStaticSnapshot = (): GeneralTrieNodeSnapshot[] => {
      const res: GeneralTrieNodeSnapshot[] = [];
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
      codeLine: lines.init,
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
        codeLine: lines.insertStart,
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
          codeLine: lines.insertAdvance,
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
        codeLine: lines.insertDone,
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
      codeLine: lines.searchStart,
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
          codeLine: lines.searchMiss,
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
        codeLine: lines.searchAdvance,
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
      codeLine: lines.searchDone,
      statusBadge: { text: `词频 ${ans}`, type: 'success' },
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      activePath: [...qPath],
      staticTable: getTableData(),
      metrics: { '最终词频': ans },
    });

    return steps;
  }

  /**
   * Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing)
   */
  public static compileMultiQuerySteps(
    codeLines?: Record<string, HighlightTarget>
  ): GeneralTrieStep[] {
    return GeneralTrieStepCompiler.compileDynamicPointerSteps(
      ['apple', 'app', 'apply', 'banana'],
      'app',
      true,
      codeLines
    );
  }
}
