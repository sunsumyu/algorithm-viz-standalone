import { describe, it, expect } from 'vitest';
import { ALL_ALGORITHM_METADATA } from './algorithm-catalog.generated';

describe('左程云《算法通关课》Class 001 ~ 184 全课程覆盖率门禁测试', () => {
  it('全库算法目录必须 100% 覆盖必备篇 (001~099) 与进阶篇已交付的全部 176 门课程别名', () => {
    const coveredClasses = new Set<string>();

    for (const item of ALL_ALGORITHM_METADATA) {
      if (item.aliases) {
        for (const alias of item.aliases) {
          const match = alias.match(/^class(\d{3})/i);
          if (match) {
            coveredClasses.add(`class${match[1]}`);
          }
        }
      }
    }

    // 1. Class 001 ~ 105 连续 105 门无间断覆盖
    const missingContinuous: string[] = [];
    for (let i = 1; i <= 105; i++) {
      const cls = `class${String(i).padStart(3, '0')}`;
      if (!coveredClasses.has(cls)) {
        missingContinuous.push(cls);
      }
    }
    expect(
      missingContinuous,
      `发现 001~105 未覆盖课程号 (${missingContinuous.length}): ${missingContinuous.join(', ')}`
    ).toEqual([]);

    // 2. Class 107 ~ 184 已交付高阶区间、树上倍增、高阶DP、网络流、高阶图论与分治全家桶专题
    const deliveredAdvancedClasses = [
      'class107',
      'class108',
      'class109',
      'class110',
      'class111',
      'class112',
      'class113',
      'class115',
      'class117',
      'class118',
      'class120',
      'class121',
      'class122',
      'class123',
      'class124',
      'class125',
      'class126',
      'class129',
      'class130',
      'class132',
      'class133',
      'class134',
      'class136',
      'class137',
      'class138',
      'class139',
      'class140',
      'class141',
      'class142',
      'class143',
      'class144',
      'class145',
      'class146',
      'class147',
      'class148',
      'class149',
      'class150',
      'class151',
      'class152',
      'class153',
      'class154',
      'class155',
      'class156',
      'class157',
      'class158',
      'class159',
      'class160',
      'class161',
      'class162',
      'class163',
      'class164',
      'class165',
      'class166',
      'class167',
      'class168',
      'class169',
      'class170',
      'class171',
      'class172',
      'class173',
      'class174',
      'class175',
      'class176',
      'class177',
      'class178',
      'class179',
      'class180',
      'class181',
      'class182',
      'class183',
      'class184',
    ];

    const missingAdvanced: string[] = [];
    for (const cls of deliveredAdvancedClasses) {
      if (!coveredClasses.has(cls)) {
        missingAdvanced.push(cls);
      }
    }
    expect(
      missingAdvanced,
      `发现 107~184 高阶已交付课程未覆盖 (${missingAdvanced.length}): ${missingAdvanced.join(', ')}`
    ).toEqual([]);

    expect(coveredClasses.size).toBeGreaterThanOrEqual(176);
  });
});


