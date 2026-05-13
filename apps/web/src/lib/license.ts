// ライセンス判定ヘルパ
// 寛容ライセンス: 本文全文表示・ダウンロード可
// その他: プレビューのみ・原本リンクで誘導

export const PERMISSIVE_LICENSES = new Set([
  "MIT",
  "MIT-0",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "CC0-1.0",
  "Unlicense",
  "0BSD",
  "MPL-2.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "BlueOak-1.0.0",
  "WTFPL",
  "UPL-1.0",
]);

export type LicensePolicy = {
  /** 本文全文を表示してよいか */
  canShowFull: boolean;
  /** 「ライセンス未確認のため利用前に確認を」等の警告を出すか */
  needsCaution: boolean;
  /** 表示用ラベル */
  label: string;
};

export function classifyLicense(license: string | null | undefined): LicensePolicy {
  if (!license) {
    return {
      canShowFull: false,
      needsCaution: true,
      label: "ライセンス未確認",
    };
  }
  if (license === "NOASSERTION") {
    return {
      canShowFull: false,
      needsCaution: true,
      label: "NOASSERTION (未指定)",
    };
  }
  if (PERMISSIVE_LICENSES.has(license)) {
    return {
      canShowFull: true,
      needsCaution: false,
      label: license,
    };
  }
  // GPL / AGPL / LGPL 等は表示はできるがコピーレフトの注意
  return {
    canShowFull: false,
    needsCaution: true,
    label: license,
  };
}
