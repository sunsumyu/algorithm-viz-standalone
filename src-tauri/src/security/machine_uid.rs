use sha2::{Digest, Sha256};
use std::process::Command;

/// 跨硬件机器指纹解析深模块 (MachineUidResolver)
///
/// 职责：
/// 1. 采集 Windows 多源硬件特征（注册表 MachineGuid、主板 UUID、CPU 标识）；
/// 2. 具备容错降级能力（剔除全零/全F等虚假 Dummy 值，单项缺失不中断）；
/// 3. 输出确定性、不可逆、标准格式的 16 位大写短码：`XXXX-XXXX-XXXX-XXXX`。
pub struct MachineUidResolver;

impl MachineUidResolver {
    /// 获取当前机器的标准机器码短串（格式：XXXX-XXXX-XXXX-XXXX）
    pub fn get_machine_code() -> String {
        let features = Self::collect_hardware_features();
        let feature_refs: Vec<&str> = features.iter().map(|s| s.as_str()).collect();
        Self::compute_code_from_features(&feature_refs)
    }

    /// 根据特征列表纯函数计算机器码（便于无头单元测试与模拟）
    pub fn compute_code_from_features(features: &[&str]) -> String {
        let valid_features: Vec<&str> = features
            .iter()
            .copied()
            .filter(|f| !f.trim().is_empty() && !Self::is_dummy_value(f))
            .collect();

        let raw_material = if valid_features.is_empty() {
            // 极限容错保底（极端沙箱或受限权限）
            "ALGO-VIZ-FALLBACK-STANDALONE-NODE-TOKEN".to_string()
        } else {
            valid_features.join("|")
        };

        let mut hasher = Sha256::new();
        hasher.update(raw_material.as_bytes());
        let hash_bytes = hasher.finalize();
        let hex_str = format!("{:X}", hash_bytes);

        // 截取前 16 位十六进制字符并格式化为 4x4: XXXX-XXXX-XXXX-XXXX
        let prefix = &hex_str[..16];
        format!(
            "{}-{}-{}-{}",
            &prefix[0..4],
            &prefix[4..8],
            &prefix[8..12],
            &prefix[12..16]
        )
    }

    /// 校验机器码字符串是否符合标准 XXXX-XXXX-XXXX-XXXX 格式
    pub fn is_valid_machine_code_format(code: &str) -> bool {
        if code.len() != 19 {
            return false;
        }

        let parts: Vec<&str> = code.split('-').collect();
        if parts.len() != 4 {
            return false;
        }

        parts.iter().all(|p| {
            p.len() == 4 && p.chars().all(|c| c.is_ascii_digit() || ('A'..='F').contains(&c))
        })
    }

    /// 过滤虚假/无效的硬件占位符
    fn is_dummy_value(val: &str) -> bool {
        let trimmed = val.trim();
        let upper = trimmed.to_uppercase();
        upper.is_empty()
            || upper == "NONE"
            || upper == "DEFAULT STRING"
            || upper == "TO BE FILLED BY O.E.M."
            || upper == "00000000-0000-0000-0000-000000000000"
            || upper == "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"
    }

    /// 采集多源硬件特征
    fn collect_hardware_features() -> Vec<String> {
        let mut features = Vec::new();

        #[cfg(target_os = "windows")]
        {
            // 1. 注册表 MachineGuid (Windows 100% 存在，安装时生成)
            if let Some(guid) = Self::query_registry_value(
                r"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography",
                "MachineGuid",
            ) {
                features.push(guid);
            }

            // 2. 主板 BIOS / ComputerSystemProduct UUID
            if let Some(uuid) = Self::query_motherboard_uuid() {
                features.push(uuid);
            }

            // 3. CPU 标识或名称
            if let Some(cpu) = Self::query_registry_value(
                r"HKEY_LOCAL_MACHINE\HARDWARE\DESCRIPTION\System\CentralProcessor\0",
                "ProcessorNameString",
            ) {
                features.push(cpu);
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            // 非 Windows 环境（如类 Unix 或 CI 环境）采用平台降级方案
            if let Ok(hostname) = std::env::var("HOSTNAME") {
                features.push(hostname);
            }
            if let Ok(user) = std::env::var("USER") {
                features.push(user);
            }
        }

        features
    }

    #[cfg(target_os = "windows")]
    fn query_registry_value(key: &str, value_name: &str) -> Option<String> {
        let output = Command::new("reg")
            .args(["query", key, "/v", value_name])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            if line.contains(value_name) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 {
                    return Some(parts[2..].join(" "));
                }
            }
        }
        None
    }

    #[cfg(target_os = "windows")]
    fn query_motherboard_uuid() -> Option<String> {
        // 优先使用 powershell Get-CimInstance，避开部分新版 Windows 11 移除的 wmic
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-Command",
                "(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID",
            ])
            .output()
            .ok()?;

        if output.status.success() {
            let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !text.is_empty() && !Self::is_dummy_value(&text) {
                return Some(text);
            }
        }

        // 降级尝试 wmic
        let wmic_output = Command::new("wmic")
            .args(["csproduct", "get", "uuid"])
            .output()
            .ok()?;

        if wmic_output.status.success() {
            let text = String::from_utf8_lossy(&wmic_output.stdout);
            for line in text.lines() {
                let trimmed = line.trim();
                if !trimmed.is_empty()
                    && !trimmed.eq_ignore_ascii_case("uuid")
                    && !Self::is_dummy_value(trimmed)
                {
                    return Some(trimmed.to_string());
                }
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_validation() {
        assert!(MachineUidResolver::is_valid_machine_code_format("ABCD-0123-4567-89EF"));
        assert!(!MachineUidResolver::is_valid_machine_code_format("abcd-0123-4567-89ef")); // 必须大写
        assert!(!MachineUidResolver::is_valid_machine_code_format("ABCD-0123-4567-89E")); // 长度不足
        assert!(!MachineUidResolver::is_valid_machine_code_format("ABCD0123456789EF")); // 缺少短横线
        assert!(!MachineUidResolver::is_valid_machine_code_format("GHIJ-0123-4567-89EF")); // 非十六进制字符
    }

    #[test]
    fn test_compute_code_determinism() {
        let features_a = vec!["UUID-1234", "CPU-INTEL-I7", "MACHINE-GUID-ABC"];
        let code_1 = MachineUidResolver::compute_code_from_features(&features_a);
        let code_2 = MachineUidResolver::compute_code_from_features(&features_a);

        assert_eq!(code_1, code_2, "相同输入必须确定性输出完全一致的机器码");
        assert!(MachineUidResolver::is_valid_machine_code_format(&code_1));
    }

    #[test]
    fn test_compute_code_sensitivity() {
        let features_a = vec!["UUID-1234", "CPU-INTEL-I7"];
        let features_b = vec!["UUID-1235", "CPU-INTEL-I7"]; // 仅变动一位

        let code_a = MachineUidResolver::compute_code_from_features(&features_a);
        let code_b = MachineUidResolver::compute_code_from_features(&features_b);

        assert_ne!(code_a, code_b, "硬件微小变动必须产生雪崩差异机器码");
    }

    #[test]
    fn test_dummy_and_empty_filtering() {
        let features_with_dummy = vec![
            "00000000-0000-0000-0000-000000000000",
            "   ",
            "REAL-HARDWARE-ID",
            "None",
        ];
        let features_clean = vec!["REAL-HARDWARE-ID"];

        let code_with_dummy = MachineUidResolver::compute_code_from_features(&features_with_dummy);
        let code_clean = MachineUidResolver::compute_code_from_features(&features_clean);

        assert_eq!(
            code_with_dummy, code_clean,
            "虚假占位符和空白项必须被自动过滤，不影响有效特征计算"
        );
    }

    #[test]
    fn test_fallback_when_all_empty() {
        let empty_features: Vec<&str> = vec!["", "None", "00000000-0000-0000-0000-000000000000"];
        let code = MachineUidResolver::compute_code_from_features(&empty_features);

        assert!(MachineUidResolver::is_valid_machine_code_format(&code));
    }

    #[test]
    fn test_real_system_machine_code() {
        let code1 = MachineUidResolver::get_machine_code();
        let code2 = MachineUidResolver::get_machine_code();

        assert_eq!(code1, code2, "真实系统重复获取必须 100% 幂等一致");
        assert!(
            MachineUidResolver::is_valid_machine_code_format(&code1),
            "真实系统机器码必须符合规范格式，当前为: {}",
            code1
        );
    }
}
