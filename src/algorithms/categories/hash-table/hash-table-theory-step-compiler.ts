/**
 * 哈希表理论基础 — 步进推演编译器
 * 哈希函数映射、哈希碰撞与拉链法
 */

export interface HTTStep {
  buckets: number[][];
  currentKey: number | null;
  targetSlot: number | null;
  isCollision: boolean;
  loadFactor: number;
  status: 'init' | 'hash-calc' | 'insert' | 'collision-chain' | 'done';
  message: string;
  log: string;
  codeLine?: number | number[] | Record<string, number | number[]>;
}

export const HASH_TABLE_THEORY_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 4, cpp: 4, python: 5, javascript: 5 },
  hashCalc: { java: 7, cpp: 8, python: 9, javascript: 8 },
  insert: { java: [8, 12], cpp: [9, 12], python: [10, 13], javascript: [9, 12] },
  collision: { java: 12, cpp: 12, python: 13, javascript: 12 },
  done: { java: 13, cpp: 13, python: 13, javascript: 13 },
};

export function parseKeysList(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [12, 18, 24, 7, 13];
}

export function buildTheorySteps(keys: number[], bucketSize: number = 6): HTTStep[] {
  const steps: HTTStep[] = [];
  const buckets: number[][] = Array.from({ length: bucketSize }, () => []);
  let totalInserted = 0;

  steps.push({
    buckets: buckets.map((b) => [...b]),
    currentKey: null,
    targetSlot: null,
    isCollision: false,
    loadFactor: 0,
    status: 'init',
    message: `初始化容量为 ${bucketSize} 的哈希表，哈希函数为 hash(key) = key % ${bucketSize}。准备依次插入 Key 列表: [${keys.join(', ')}]。`,
    log: `初始化哈希表 (Size=${bucketSize})`,
    codeLine: HASH_TABLE_THEORY_CODE_LINES.init,
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const slot = key % bucketSize;
    const isColl = buckets[slot].length > 0;

    steps.push({
      buckets: buckets.map((b) => [...b]),
      currentKey: key,
      targetSlot: slot,
      isCollision: isColl,
      loadFactor: Number((totalInserted / bucketSize).toFixed(2)),
      status: 'hash-calc',
      message: `计算哈希值：key = ${key}，hash(${key}) = ${key} % ${bucketSize} = ${slot}。定位到桶 [${slot}]。`,
      log: `计算 hash(${key}) = ${slot}`,
      codeLine: HASH_TABLE_THEORY_CODE_LINES.hashCalc,
    });

    buckets[slot].push(key);
    totalInserted++;
    const loadFactor = Number((totalInserted / bucketSize).toFixed(2));

    steps.push({
      buckets: buckets.map((b) => [...b]),
      currentKey: key,
      targetSlot: slot,
      isCollision: isColl,
      loadFactor,
      status: isColl ? 'collision-chain' : 'insert',
      message: isColl
        ? `⚠️ 发生哈希碰撞！桶 [${slot}] 中已有元素 [${buckets[slot].slice(0, -1).join(', ')}]。使用拉链法将新节点 ${key} 挂载到链表末尾。`
        : `槽位 [${slot}] 当前为空，直接将 key = ${key} 存入桶 [${slot}]。`,
      log: isColl ? `⚠️ 碰撞挂载: 桶 [${slot}] -> ${key}` : `直接插入: 桶 [${slot}] -> ${key}`,
      codeLine: isColl ? HASH_TABLE_THEORY_CODE_LINES.collision : HASH_TABLE_THEORY_CODE_LINES.insert,
    });
  }

  steps.push({
    buckets: buckets.map((b) => [...b]),
    currentKey: null,
    targetSlot: null,
    isCollision: false,
    loadFactor: Number((totalInserted / bucketSize).toFixed(2)),
    status: 'done',
    message: `🎉 所有 Key 已全部完成插入！哈希表当前元素总数 ${totalInserted}，最终装载因子 α = ${(totalInserted / bucketSize).toFixed(2)}。`,
    log: `演示完毕: 共插入 ${totalInserted} 个键`,
    codeLine: HASH_TABLE_THEORY_CODE_LINES.done,
  });

  return steps;
}
