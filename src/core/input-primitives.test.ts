import { describe, it, expect } from 'vitest';
import {
  parseNumberList,
  parseNumber,
  parseText,
  parseTreeArray,
  parseIntervals,
  parseCommandList,
  parseNumericGrid,
  parseBinaryGrid,
  parseGridInput,
} from './input-primitives';

describe('parseNumberList', () => {
  it('容忍半角/全角逗号与空白混合分隔', () => {
    expect(parseNumberList('1，2,  3', [])).toEqual([1, 2, 3]);
    expect(parseNumberList(' 5, 2，9 ', [])).toEqual([5, 2, 9]);
  });

  it('过滤非法片段而不是整串失败', () => {
    expect(parseNumberList('1, x, 3', [])).toEqual([1, 3]);
  });

  it('解析为空时回退（字符串 fallback 按同一分隔符解析）', () => {
    expect(parseNumberList('', '5, 2, 9')).toEqual([5, 2, 9]);
    expect(parseNumberList(',,,', [7])).toEqual([7]);
  });

  it('fallback 可直接为数组', () => {
    expect(parseNumberList(undefined, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('null/undefined 输入回退', () => {
    expect(parseNumberList(null, '3, 5')).toEqual([3, 5]);
  });
});

describe('parseNumber', () => {
  it('合法整数解析', () => {
    expect(parseNumber('8', 4)).toBe(8);
    expect(parseNumber(' 12 ', 4)).toBe(12);
  });

  it('非法输入回退', () => {
    expect(parseNumber('abc', 4)).toBe(4);
    expect(parseNumber('', 4)).toBe(4);
    expect(parseNumber(undefined, 4)).toBe(4);
  });
});

describe('parseText', () => {
  it('trim 后非空返回原文，空白回退', () => {
    expect(parseText('  abcde ', 'x')).toBe('abcde');
    expect(parseText('   ', 'x')).toBe('x');
    expect(parseText(null, 'y')).toBe('y');
  });
});

describe('parseTreeArray', () => {
  it('JSON 数组解析（含 null 空位）', () => {
    expect(parseTreeArray('[3,9,20,null,null,15,7]', [])).toEqual([3, 9, 20, null, null, 15, 7]);
  });

  it('空数组 [] 是合法空树，不触发回退', () => {
    expect(parseTreeArray('[]', [1])).toEqual([]);
  });

  it('JSON 失败时按词法兜底解析', () => {
    expect(parseTreeArray('2, 1, 3', [9])).toEqual([2, 1, 3]);
    expect(parseTreeArray('1, null, 2', [9])).toEqual([1, null, 2]);
  });

  it('空输入与非数组 JSON 回退', () => {
    expect(parseTreeArray('', [7])).toEqual([7]);
    expect(parseTreeArray('{"a":1}', [7])).toEqual([7]);
  });
});

describe('parseIntervals', () => {
  it('解析区间对列表', () => {
    expect(parseIntervals('[[1,2],[3,4]]', [])).toEqual([[1, 2], [3, 4]]);
  });

  it('空串 / 非法 JSON / 空数组 / 非法项回退', () => {
    const fb: [number, number][] = [[1, 3]];
    expect(parseIntervals('', fb)).toBe(fb);
    expect(parseIntervals('not json', fb)).toBe(fb);
    expect(parseIntervals('[]', fb)).toBe(fb);
    expect(parseIntervals('[[1]]', fb)).toBe(fb);
  });
});

describe('parseGridInput', () => {
  it('JSON 二维数组解析', () => {
    const fb = [[0]];
    expect(parseGridInput('[[1,3],[4,5]]', fb)).toEqual([[1, 3], [4, 5]]);
  });

  it('空输入回退', () => {
    expect(parseGridInput('', [[1]])).toEqual([[1]]);
    expect(parseGridInput(undefined, [[2]])).toEqual([[2]]);
  });

  it('JSON 失败时用 parseNumericGrid 词法兜底', () => {
    expect(parseGridInput('1,2;3,4', [])).toEqual([[1, 2], [3, 4]]);
  });
});

describe('parseCommandList', () => {
  it('按逗号/换行切分并去空', () => {
    expect(parseCommandList('push(1), pop(), top()')).toEqual(['push(1)', 'pop()', 'top()']);
    expect(parseCommandList('push(-2)\npop()')).toEqual(['push(-2)', 'pop()']);
    expect(parseCommandList('  ')).toEqual([]);
  });
});
