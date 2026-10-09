#!/usr/bin/env vite-node
/**
 * 泄露证据提取与买家身份反查 CLI 工具 (Leak Investigator CLI)
 *
 * 开发者专用取证排查工具：
 * 接收被泄露盗版的题解文本或算法讲义样本，
 * 扫描并反解析深埋在其中的零宽字符隐形数字盲水印，
 * 输出确凿的泄露买家身份溯源报告。
 */

import * as fs from 'fs';
import * as path from 'path';
import { decodeWatermark } from '../src/core/security/watermark';
import { decodeFromZeroWidth } from '../src/core/security/zero-width-watermark';

export interface InvestigationContentReport {
  hasWatermark: boolean;
  buyerId: string | null;
  detectedAt: string;
  sourceType: string;
}

export function investigateContent(content: string, type: string = 'text'): InvestigationContentReport {
  const buyerId = decodeWatermark(content) || decodeFromZeroWidth(content);
  return {
    hasWatermark: buyerId !== null,
    buyerId,
    detectedAt: new Date().toISOString(),
    sourceType: type,
  };
}

export interface InvestigationReport {
  success: boolean;
  buyerIdentity: string | null;
  detectedAt: string;
  scannedLength: number;
  message: string;
}

export function investigateText(rawText: string): InvestigationReport {
  const timestamp = new Date().toISOString();
  const scannedLength = rawText.length;

  const buyerId = decodeWatermark(rawText) || decodeFromZeroWidth(rawText);
  if (buyerId) {
    return {
      success: true,
      buyerIdentity: buyerId,
      detectedAt: timestamp,
      scannedLength,
      message: `✅ 成功定位泄露源头买家身份: [${buyerId}]`,
    };
  }

  return {
    success: false,
    buyerIdentity: null,
    detectedAt: timestamp,
    scannedLength,
    message: '⚠️ 未在输入文本中检测到有效零宽盲水印（可能为无水印文本或水印遭严重篡改破坏）',
  };
}

export function runCli() {
  const scriptIdx = process.argv.findIndex(a => a.includes('leak-investigator'));
  const rawArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
  const args = rawArgs.filter(a => a !== '--');

  let filePath = '';
  let directText = '';
  let outReportPath = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' && args[i + 1]) {
      filePath = args[++i];
    } else if (arg === '--text' && args[i + 1]) {
      directText = args[++i];
    } else if (arg === '--out' && args[i + 1]) {
      outReportPath = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
版权泄露排查与取证工具 (Leak Investigator CLI)
用法:
  npm run leak:investigate -- [options]

选项:
  --file <path>    要排查的泄露文件路径 (UTF-8 文本或 JSON)
  --text <content> 直接传入待排查文本内容
  --out <path>     将取证审计报告保存为 JSON 文件 (可选)
      `);
      return;
    }
  }

  let textToInspect = directText;
  if (filePath) {
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ 文件不存在: ${resolved}`);
      process.exit(1);
    }
    textToInspect = fs.readFileSync(resolved, 'utf8');
  }

  if (!textToInspect) {
    console.error('❌ 请通过 --file 或 --text 指定待排查的样本内容。使用 --help 查看帮助。');
    process.exit(1);
  }

  const report = investigateText(textToInspect);

  console.log('\n======================================================');
  console.log('🕵️ [Algorithm Viz] 泄露版权取证排查报告');
  console.log('======================================================');
  console.log(`⏱️ 取证时间:     ${report.detectedAt}`);
  console.log(`📄 扫描字符数:   ${report.scannedLength}`);
  console.log(`📊 取证结果:     ${report.success ? '🚨 确凿发现水印' : '⚪ 未检出'}`);
  if (report.success) {
    console.log(`👤 泄露买家 ID:  \x1b[32m\x1b[1m${report.buyerIdentity}\x1b[0m`);
  }
  console.log(`💬 诊断详情:     ${report.message}`);
  console.log('======================================================\n');

  if (outReportPath) {
    const resolvedOut = path.resolve(process.cwd(), outReportPath);
    fs.writeFileSync(resolvedOut, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 取证审计报告已导出至: ${resolvedOut}\n`);
  }
}

// 直接执行触发 CLI
if (process.argv.some(a => a.includes('leak-investigator'))) {
  runCli();
}
