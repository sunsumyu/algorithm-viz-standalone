/**
 * 位图结构设计与实现 (Bitset Array) - 步进编译器
 * 核心原理：
 * 利用 int 数组的每一位存储集合状态，1 个 int 可存 32 个数字的布尔值。
 * 极高内存压缩（相比 boolean 节省 32 倍内存，CPU 缓存命中极高）。
 * 核心公式：
 * bucket = num >> 5 (相当于 num / 32)
 * bit = num & 31    (相当于 num % 32)
 * add: bits[bucket] |= (1 << bit)
 * contains: (bits[bucket] & (1 << bit)) != 0
 */

import { BITSET_ARRAY_LINES } from './bit-stage-codes';
import { BitStep } from './bit-shared';

export interface BitsetArrayStep extends BitStep {
  insertNums: number[];
  queryNum: number;
}

export function buildBitsetArraySteps(insertNums: number[], queryNum: number): BitsetArrayStep[] {
  const steps: BitsetArrayStep[] = [];
  const lines = BITSET_ARRAY_LINES;

  // 初始化 4 个桶 (可容纳 0 ~ 127)
  const maxNum = Math.max(...insertNums, queryNum, 31);
  const bucketCount = Math.max(4, Math.ceil((maxNum + 1) / 32));
  const bits: number[] = new Array(bucketCount).fill(0);

  // Step 0: 入口
  steps.push({
    insertNums,
    queryNum,
    decision: `主函数入口：初始化包含 ${bucketCount} 个桶的位图结构 (覆盖范围 0 ~ ${bucketCount * 32 - 1})`,
    message: '每个 int 包含 32 个独立的二进制位，相比常规布尔数组节约 32 倍内存空间',
    log: `init Bitset(buckets=${bucketCount})`,
    codeLine: lines.entry,
    metrics: { '桶数量': `${bucketCount}`, '可表示范围': `0 ~ ${bucketCount * 32 - 1}`, '待插入数': `[${insertNums.join(', ')}]` },
    bitsetView: { bits: [...bits], operation: 'init' },
  });

  // 逐个执行 add 操作
  for (let i = 0; i < insertNums.length; i++) {
    const num = insertNums[i];
    const bucket = num >> 5;
    const bit = num & 31;

    // 定位步骤
    steps.push({
      insertNums,
      queryNum,
      decision: `准备添加数字 ${num}：计算位图坐标 bucket = ${num} >> 5 = ${bucket}, bit = ${num} & 31 = ${bit}`,
      message: `数字 ${num} 映射在第 ${bucket} 号桶的第 ${bit} 个二进制位上`,
      log: `locate num ${num} -> bucket=${bucket}, bit=${bit}`,
      codeLine: lines.calcLoc,
      metrics: { '当前操作': `add(${num})`, '定位桶': `Bucket[${bucket}]`, '桶内偏移位': `${bit}` },
      bitsetView: { bits: [...bits], targetNum: num, activeBucket: bucket, activeBit: bit, operation: 'add' },
    });

    // 写入步骤
    bits[bucket] |= (1 << bit);
    steps.push({
      insertNums,
      queryNum,
      decision: `执行添加：bits[${bucket}] |= (1 << ${bit})，成功将该位置为 1`,
      message: `位或运算使得其余位不受影响，仅将第 ${bit} 位置 1`,
      log: `bits[${bucket}] |= (1 << ${bit}) -> 0x${(bits[bucket] >>> 0).toString(16)}`,
      codeLine: lines.addBit,
      metrics: { '添加成功': `${num}`, '新桶值': `0x${(bits[bucket] >>> 0).toString(16)}` },
      bitsetView: { bits: [...bits], targetNum: num, activeBucket: bucket, activeBit: bit, operation: 'add' },
    });
  }

  // 执行查询 contains 步骤
  const qBucket = queryNum >> 5;
  const qBit = queryNum & 31;

  steps.push({
    insertNums,
    queryNum,
    decision: `查询数字 ${queryNum}：计算坐标 bucket = ${queryNum} >> 5 = ${qBucket}, bit = ${queryNum} & 31 = ${qBit}`,
    message: `准备利用与运算校验 bits[${qBucket}] 的第 ${qBit} 位是否为 1`,
    log: `query locate num ${queryNum} -> bucket=${qBucket}, bit=${qBit}`,
    codeLine: lines.calcLoc,
    metrics: { '查询数字': `${queryNum}`, '目标桶': `Bucket[${qBucket}]`, '目标位': `${qBit}` },
    bitsetView: { bits: [...bits], targetNum: queryNum, activeBucket: qBucket, activeBit: qBit, operation: 'contains' },
  });

  const containsResult = qBucket < bits.length ? (bits[qBucket] & (1 << qBit)) !== 0 : false;
  steps.push({
    insertNums,
    queryNum,
    decision: `查询结果：contains(${queryNum}) = ${containsResult ? 'TRUE (已存在)' : 'FALSE (不存在)'}`,
    message: `bits[${qBucket}] & (1 << ${qBit}) ${containsResult ? '!= 0，表示存在' : '== 0，表示不存在'}`,
    log: `contains(${queryNum}) -> ${containsResult}`,
    codeLine: lines.checkBit,
    metrics: { '查询数字': `${queryNum}`, '判定结果': `${containsResult}`, '状态': '已完成' },
    bitsetView: { bits: [...bits], targetNum: queryNum, activeBucket: qBucket, activeBit: qBit, operation: 'contains', result: containsResult },
  });

  return steps;
}
