#!/usr/bin/env vite-node
/**
 * 开发者专用离线算号 CLI 工具 (License Generator CLI)
 *
 * 功能：
 * 1. 使用 Ed25519 开发者私钥对买家机器码、授权期限、订单标识进行非对称数字签名；
 * 2. 生成紧凑型 Base64 格式的离线激活码；
 * 3. 命令行支持 --hwid, --days, --user, --tier 等参数。
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface LicenseOptions {
  hwid: string;
  days?: number; // 0 表示永久授权
  user?: string;
  tier?: number; // 1 | 2 | 3
}

export interface LicenseGenerateResult {
  licenseKey: string;
  payload: {
    v: number;
    uid: string;
    exp: number;
    user_id: string;
    tier: number;
  };
  expiresFormatted: string;
}

const SEC_DIR = path.join(process.cwd(), '.security');
const PRIV_KEY_PATH = path.join(secDir(), 'developer_ed25519_private.pem');
const PUB_KEY_PATH = path.join(secDir(), 'developer_ed25519_public.pem');

function secDir(): string {
  if (!fs.existsSync(SEC_DIR)) {
    fs.mkdirSync(SEC_DIR, { recursive: true });
  }
  return SEC_DIR;
}

/**
 * 获取或初始化 Ed25519 开发者密钥对
 */
export function getOrInitDeveloperKeys(): { privateKeyPem: string; publicKeyPem: string } {
  if (fs.existsSync(PRIV_KEY_PATH) && fs.existsSync(PUB_KEY_PATH)) {
    return {
      privateKeyPem: fs.readFileSync(PRIV_KEY_PATH, 'utf8'),
      publicKeyPem: fs.readFileSync(PUB_KEY_PATH, 'utf8'),
    };
  }

  // 首次生成密钥对并写入 .security/
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

  fs.writeFileSync(PRIV_KEY_PATH, privPem);
  fs.writeFileSync(PUB_KEY_PATH, pubPem);

  return {
    privateKeyPem: privPem,
    publicKeyPem: pubPem,
  };
}

/**
 * 核心激活码生成函数
 */
export function generateLicenseToken(
  options: LicenseOptions,
  privateKeyPemOverride?: string
): LicenseGenerateResult {
  const { hwid, days = 0, user = 'VIP_CUSTOMER', tier = 3 } = options;
  if (!hwid || !hwid.trim()) {
    throw new Error('必须指定买家硬件机器码 (--hwid)');
  }

  const normalizedHwid = hwid.trim().toUpperCase();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = days > 0 ? nowSec + days * 86400 : 0;

  const payload = {
    v: 1,
    uid: normalizedHwid,
    exp: expSec,
    user_id: user.trim(),
    tier: Math.max(1, Math.min(3, tier)),
  };

  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');

  // 获取私钥
  const privPem = privateKeyPemOverride || getOrInitDeveloperKeys().privateKeyPem;
  const privKeyObj = crypto.createPrivateKey(privPem);

  // Ed25519 数字签名 (64 字节)
  const signature = crypto.sign(null, payloadBytes, privKeyObj);

  // URL-safe Base64 编码 (与 Rust 验签器完全对齐)
  const payloadB64 = payloadBytes.toString('base64url');
  const sigB64 = signature.toString('base64url');

  const licenseKey = `${payloadB64}.${sigB64}`;
  const expiresFormatted = expSec === 0 ? '永久授权 (Lifetime)' : new Date(expSec * 1000).toLocaleString();

  return {
    licenseKey,
    payload,
    expiresFormatted,
  };
}

// 命令行运行入口
export function runCli() {
  const scriptIdx = process.argv.findIndex(a => a.includes('generate-license'));
  const rawArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
  const args = rawArgs.filter(a => a !== '--');
  let hwid = '';
  let days = 365; // 默认 1 年
  let user = 'VIP_USER_' + Date.now().toString().slice(-6);
  let tier = 3;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--hwid' || arg === '--machine') && args[i + 1]) {
      hwid = args[++i];
    } else if (arg === '--days' && args[i + 1]) {
      days = parseInt(args[++i], 10);
    } else if ((arg === '--user' || arg === '--buyer') && args[i + 1]) {
      user = args[++i];
    } else if (arg === '--tier' && args[i + 1]) {
      tier = parseInt(args[++i], 10);
    } else if (arg === '--lifetime') {
      days = 0;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
离线激活码生成器 (Ed25519 Offline License Generator)
用法:
  npm run license:gen -- --hwid <MACHINE_CODE> [options]

选项:
  --hwid / --machine <code >   目标设备机器码 (必填, 如: E804-62DB-86BA-555E)
  --days <num>                 授权有效天数 (默认: 365; 0 为永久授权)
  --lifetime                   等同于 --days 0 (永久授权)
  --user / --buyer <name>      购买者 ID / 订单号
  --tier <1|2|3>               授权级别 (1: 基础, 2: 进阶, 3: 全量题库, 默认: 3)
      `);
      return;
    }
  }

  if (!hwid) {
    console.error('❌ 错误: 未指定 --hwid 机器码。使用 --help 查看参数说明。');
    process.exit(1);
  }

  try {
    const result = generateLicenseToken({ hwid, days, user, tier });
    console.log('\n======================================================');
    console.log('🔑 [Algorithm Viz] 离线授权凭证已成功生成');
    console.log('======================================================');
    console.log(`👤 购买用户:   ${result.payload.user_id}`);
    console.log(`💻 绑机机器码: ${result.payload.uid}`);
    console.log(`🎖️ 授权等级:   Tier ${result.payload.tier}`);
    console.log(`⏳ 有效期限:   ${result.expiresFormatted}`);
    console.log('------------------------------------------------------');
    console.log('📋 激活码字符串 (请完整复制提供给客户):');
    console.log('\n' + result.licenseKey + '\n');
    console.log('======================================================\n');
  } catch (err: unknown) {
    console.error('❌ 生成失败:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// 执行 CLI 入口（在非 Vitest 自动化测试环境下自动执行）
if (!process.env.VITEST) {
  runCli();
}

