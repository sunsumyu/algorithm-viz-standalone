#!/usr/bin/env vite-node
/**
 * 开发者专用权益凭证签发 CLI (Entitlement Voucher Generator CLI)
 *
 * 功能：
 * 1. 使用与离线激活码同源的 Ed25519 开发者私钥，为「手机号注册账号」签发权益凭证；
 * 2. 三类凭证：延长试用天数 (--days) / 充值按量次数 (--credits) / 开通永久会员 (--lifetime)；
 * 3. 凭证为一次性兑换（nonce 防重放），可绑定指定手机号或以 --any 签发通用凭证；
 * 4. 用户在客户端「账号登录与权益中心」弹窗内粘贴凭证字符串即可即时生效，
 *    无需服务端即可完成「给用户增加和调整试用天数 / 按量付费」的运营操作。
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export type VoucherType = 'trial' | 'credits' | 'lifetime';

export interface VoucherOptions {
  type: VoucherType;
  /** 目标手机号；'*' 表示任意账号可兑换 */
  target: string;
  /** trial: 延长天数 */
  days?: number;
  /** credits: 充值次数 */
  credits?: number;
  /** 凭证本身可兑换截止天数（从签发时起算，0/undefined = 长期有效） */
  redeemableDays?: number;
  nonce?: string;
}

export interface VoucherGenerateResult {
  voucherKey: string;
  payload: {
    v: number;
    typ: string;
    target: string;
    days: number;
    credits: number;
    exp: number;
    nonce: string;
  };
}

const SEC_DIR = path.join(process.cwd(), '.security');
const PRIV_KEY_PATH = path.join(SEC_DIR, 'developer_ed25519_private.pem');
const PUB_KEY_PATH = path.join(SEC_DIR, 'developer_ed25519_public.pem');

function ensureSecDir(): string {
  if (!fs.existsSync(SEC_DIR)) {
    fs.mkdirSync(SEC_DIR, { recursive: true });
  }
  return SEC_DIR;
}

/**
 * 获取开发者私钥（与 generate-license.ts 共用同一 .security 密钥对；
 * 若尚未初始化则原地生成，保证两把「钥匙串」永远同源）
 */
export function getDeveloperPrivateKey(): string {
  ensureSecDir();
  if (fs.existsSync(PRIV_KEY_PATH)) {
    return fs.readFileSync(PRIV_KEY_PATH, 'utf8');
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
  fs.writeFileSync(PRIV_KEY_PATH, privPem);
  fs.writeFileSync(PUB_KEY_PATH, pubPem);
  return privPem;
}

/**
 * 核心权益凭证签发函数
 */
export function generateVoucher(options: VoucherOptions, privateKeyPemOverride?: string): VoucherGenerateResult {
  const { type, target, days = 0, credits = 0, redeemableDays = 0 } = options;
  if (!target || !target.trim()) {
    throw new Error('必须指定目标手机号 (--phone) 或使用 --any 签发通用凭证');
  }
  if (type === 'trial' && days <= 0) {
    throw new Error('试用延长凭证必须指定 --days > 0');
  }
  if (type === 'credits' && credits <= 0) {
    throw new Error('次数充值凭证必须指定 --credits > 0');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const nonce = options.nonce?.trim() || `V-${type}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

  const payload = {
    v: 2,
    typ: type,
    target: target.trim(),
    days: type === 'trial' ? days : 0,
    credits: type === 'credits' ? credits : 0,
    exp: redeemableDays > 0 ? nowSec + redeemableDays * 86400 : 0,
    nonce,
  };

  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
  const privKeyObj = crypto.createPrivateKey(privateKeyPemOverride || getDeveloperPrivateKey());
  const signature = crypto.sign(null, payloadBytes, privKeyObj);

  return {
    voucherKey: `${payloadBytes.toString('base64url')}.${signature.toString('base64url')}`,
    payload,
  };
}

// 命令行运行入口
export function runCli(): void {
  const scriptIdx = process.argv.findIndex(a => a.includes('generate-voucher'));
  const rawArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
  const args = rawArgs.filter(a => a !== '--');

  let type: VoucherType = 'trial';
  let phone = '';
  let useAny = false;
  let days = 30;
  let credits = 100;
  let redeemableDays = 0;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--type' && args[i + 1]) {
      const t = args[++i];
      if (t !== 'trial' && t !== 'credits' && t !== 'lifetime') {
        console.error('❌ 错误: --type 仅支持 trial | credits | lifetime');
        process.exit(1);
      }
      type = t;
    } else if ((arg === '--phone' || arg === '--target') && args[i + 1]) {
      phone = args[++i];
    } else if (arg === '--any') {
      useAny = true;
    } else if (arg === '--days' && args[i + 1]) {
      days = parseInt(args[++i], 10);
    } else if (arg === '--credits' && args[i + 1]) {
      credits = parseInt(args[++i], 10);
    } else if (arg === '--redeemable-days' && args[i + 1]) {
      redeemableDays = parseInt(args[++i], 10);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
账号权益凭证签发器 (Ed25519 Entitlement Voucher Generator)
用法:
  npm run voucher:gen -- --type trial   --phone 13800138000 --days 30
  npm run voucher:gen -- --type credits --phone 13800138000 --credits 100
  npm run voucher:gen -- --type lifetime --phone 13800138000

选项:
  --type <trial|credits|lifetime>  凭证类型 (默认: trial)
  --phone / --target <手机号>       目标账号手机号 (与 --any 二选一)
  --any                            签发任意账号可兑换的通用凭证
  --days <num>                     trial: 延长试用天数 (默认: 30)
  --credits <num>                  credits: 充值按量次数 (默认: 100)
  --redeemable-days <num>          凭证可兑换期限天数 (默认: 0 = 长期有效)
      `);
      return;
    }
  }

  if (!useAny && !phone) {
    console.error('❌ 错误: 未指定 --phone 目标手机号（或使用 --any 签发通用凭证）。使用 --help 查看说明。');
    process.exit(1);
  }

  try {
    const result = generateVoucher({
      type,
      target: useAny ? '*' : phone,
      days,
      credits,
      redeemableDays,
    });
    const typeLabel = type === 'trial' ? `延长试用 ${result.payload.days} 天` : type === 'credits' ? `充值 ${result.payload.credits} 次` : '开通永久会员';
    console.log('\n======================================================');
    console.log('🎁 [Algorithm Viz] 账号权益凭证已成功签发');
    console.log('======================================================');
    console.log(`📦 凭证类型:   ${type} (${typeLabel})`);
    console.log(`👤 目标账号:   ${result.payload.target === '*' ? '任意账号 (通用凭证)' : result.payload.target}`);
    console.log(`⏳ 兑换期限:   ${result.payload.exp === 0 ? '长期有效' : new Date(result.payload.exp * 1000).toLocaleString()}`);
    console.log(`🔐 防重放 nonce: ${result.payload.nonce}`);
    console.log('------------------------------------------------------');
    console.log('📋 权益凭证字符串 (请完整复制提供给用户，在客户端「账号权益中心」内兑换):');
    console.log('\n' + result.voucherKey + '\n');
    console.log('======================================================\n');
  } catch (err: unknown) {
    console.error('❌ 签发失败:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// 执行 CLI 入口（在 Vitest 自动化测试环境下不自动执行）
if (!process.env.VITEST) {
  runCli();
}
