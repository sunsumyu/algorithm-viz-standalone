//! 跨语言格式契约测试 (Cross-Language Contract Test)
//!
//! 锁定 TS 构建端（`scripts/build-content-pack.ts`）与 Rust 解密端
//! （`stream_decrypt.rs` StreamDecryptEngine）的 ALGP v1 字节格式永不错位：
//! fixture 由 TS 打包器以固定测试密钥 + 确定性 nonce 生成（字节级可复现），
//! 本测试用 `content_pack_key::derive_content_pack_key` 派生包密钥后逐条解密，
//! 校验 SHA-256 与 fixture 清单完全一致。
//!
//! 若两端任一格式字段变更，本测试立即红灯。
//! 重新生成 fixture：`npm run content:pack -- --selftest src-tauri/tests/fixtures`

use sha2::{Digest, Sha256};

const FIXTURE_PACK_PATH: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/fixtures/content_pack_fixture.apack"
);
const FIXTURE_JSON_PATH: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/fixtures/content_pack_fixture.json"
);

#[derive(serde::Deserialize)]
struct FixtureEntry {
    id: String,
    sha256: String,
    bytes: usize,
}

#[derive(serde::Deserialize)]
struct Fixture {
    #[allow(dead_code)]
    key_hex: String,
    pack_sha256: String,
    entries: Vec<FixtureEntry>,
}

#[test]
fn test_ts_built_pack_decrypts_with_rust_engine() {
    let fixture_json = std::fs::read_to_string(FIXTURE_JSON_PATH)
        .expect("fixture 清单缺失，请先运行: npm run content:pack -- --selftest src-tauri/tests/fixtures");
    let fixture: Fixture = serde_json::from_str(&fixture_json).expect("fixture 清单解析失败");

    let pack_bytes = std::fs::read(FIXTURE_PACK_PATH).expect("fixture 资产包缺失");

    // 包整体字节完整性（fixture 可复现性自检）
    let pack_hash = hex(&Sha256::digest(&pack_bytes));
    assert_eq!(pack_hash, fixture.pack_sha256, "fixture 资产包与清单哈希不一致");

    // TS 侧密钥 → Rust 共享包模型派生
    let master_key = algorithm_viz_lib::security::parse_master_key_hex(&fixture.key_hex)
        .expect("fixture 主密钥解析失败");
    let pack_key = algorithm_viz_lib::security::derive_content_pack_key(&master_key);

    let engine = algorithm_viz_lib::security::StreamDecryptEngine::from_bytes(pack_bytes)
        .expect("Rust 引擎无法解析 TS 构建的资产包（格式契约破裂）");

    assert_eq!(
        engine.get_available_algorithms().len(),
        fixture.entries.len(),
        "索引条目数与清单不一致"
    );

    for entry in &fixture.entries {
        assert!(
            engine.contains_algorithm(&entry.id),
            "索引缺少条目: {}",
            entry.id
        );
        let plaintext = engine
            .decrypt_chunk(&entry.id, &pack_key)
            .unwrap_or_else(|e| panic!("条目 {} 解密失败: {:?}", entry.id, e));
        assert_eq!(
            plaintext.len(),
            entry.bytes,
            "条目 {} 明文长度不一致",
            entry.id
        );
        assert_eq!(
            hex(&Sha256::digest(&*plaintext)),
            entry.sha256,
            "条目 {} 明文 SHA-256 不一致",
            entry.id
        );
    }

    // 篡改最后一个分片的 Tag 字节：该分片必须解密失败，且分片间相互隔离
    // （AES-GCM 逐分片校验，其余分片不受影响）
    let mut tampered = std::fs::read(FIXTURE_PACK_PATH).unwrap();
    let last = tampered.len() - 1;
    tampered[last] ^= 0x01;
    let engine = algorithm_viz_lib::security::StreamDecryptEngine::from_bytes(tampered).unwrap();
    let last_id = &fixture.entries[fixture.entries.len() - 1].id;
    assert!(
        engine.decrypt_chunk(last_id, &pack_key).is_err(),
        "被篡改分片的 Tag 校验必须失败"
    );
    assert!(
        engine
            .decrypt_chunk(&fixture.entries[0].id, &pack_key)
            .is_ok(),
        "未篡改分片必须不受影响（分片级隔离）"
    );
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}
