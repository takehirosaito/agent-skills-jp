# CTR最適化 対象記事リスト（2026-06-06）

## 抽出条件と結果

- データ源: Google Search Console「検索パフォーマンス」直近28日（CSVエクスポート / sc-domain:agent-skills.jp）
- 全体: 合計クリック453 / 表示約1.1万 / 平均CTR 4.1% / 平均掲載順位 10.9
- 抽出条件（指示通り）: **表示回数100以上 / CTR<3% / 平均掲載順位<20位**
- 条件を厳密に満たす `/skill/` ページは **9件のみ**（サイトが新しく高表示ページが少ないため）
- 20本確保のため、表示閾値を段階的に下げ **CTR<3% & 順位<20 の /skill/ ページを表示回数降順で上位20本** を採用（最小表示51）
- 重要な所見: 上位20本は **ほぼ全てCTR 0〜1.3%・掲載順位3〜13位**＝「順位は良いのにSERPでクリックされていない」典型。タイトル/メタ改善の効果が最も出やすい層。

## 設計上の注意（重要）

- 対象20本は **すべてクロール由来スキル（is_original=false/未設定）**。git の `skills/<slug>/SKILL.md` は存在しない（ALSEL独自132本のみ）。
- そのため title/meta は **本番Meili の `name` / `description_ja` を partial update で直接編集**して反映する（ページは本番Meili駆動・ISR revalidate=86400）。
- title = Meili `name`（layout が ` | Agent Skills by ALSEL` を付与）。meta = vendor別prefix（例「Claude 対応のAgent Skill。」）+ `description_ja` を160字に切詰め。
- 既存のcanonical / JSON-LD / OG等のSEO設計は不変更。
- ⚠️ パイプライン再クロール（01〜09）を全実行するとこの20本の name/description_ja が上書きされる可能性あり。次回フル再生成時は除外または再適用が必要。

## 対象20本（表示回数降順）

| # | slug | 表示 | CTR | 順位 | 新title(name) |
|---|------|-----:|----:|-----:|----------------|
| 1 | `numpy-best-practices` | 490 | 0.0% | 6.7 | NumPy高速化｜ベクトル演算とメモリ最適化の実践ガイド |
| 2 | `agents-9394a4` | 184 | 0.0% | 6.5 | ElevenLabsで音声AIエージェント構築｜会話Bot実装 |
| 3 | `harmonyos-app` | 164 | 0.6% | 12.8 | HarmonyOSアプリ開発｜ArkTS/ArkUI実装ガイド |
| 4 | `finviz-screener` | 153 | 0.0% | 4.6 | Finvizスクリーナー自動生成｜銘柄を自然言語で抽出 |
| 5 | `notebooklm-research` | 131 | 0.0% | 8.7 | NotebookLM全自動リサーチ｜音声・動画・スライド生成 |
| 6 | `ruby-mcp-server-generator` | 121 | 0.0% | 3.5 | Ruby製MCPサーバー自動生成｜公式SDKで即動く雛形 |
| 7 | `learn` | 120 | 0.8% | 7.9 | 未知の分野を体系リサーチ｜6フェーズ調査ワークフロー |
| 8 | `migrate-nullable-references` | 118 | 0.0% | 11.8 | C# Nullable参照型移行｜CS8602等の警告を一括解消 |
| 9 | `vercel-react-view-transitions` | 104 | 1.0% | 6.0 | React View Transitions実装｜画面遷移アニメ |
| 10 | `owasp-cheatsheets` | 83 | 1.2% | 9.2 | OWASPチートシート全集｜Web脆弱性対策の実装ガイド |
| 11 | `lck-analytics` | 78 | 1.3% | 6.0 | LCK戦績・順位分析｜LoL公式データでメタ攻略 |
| 12 | `grill-with-docs` | 75 | 1.3% | 5.2 | 計画の壁打ち＆ADR自動更新｜設計を問い質すセッション |
| 13 | `nix-best-practices` | 74 | 0.0% | 9.7 | Nix Flakes実践ベストプラクティス｜環境を再現可能に |
| 14 | `gmgn-portfolio` | 68 | 0.0% | 4.6 | 暗号資産ウォレット分析｜損益・勝率をGMGN APIで取得 |
| 15 | `salesforce-development-671587` | 68 | 0.0% | 7.1 | Salesforce開発実践｜LWC・Apex・DXパターン集 |
| 16 | `deep-research-4f1b0a` | 62 | 0.0% | 6.1 | ディープリサーチ自動化｜引用付き調査レポート生成 |
| 17 | `dependabot` | 62 | 0.0% | 10.1 | Dependabot設定ガイド｜依存更新を安全に自動化 |
| 18 | `speech-to-text` | 55 | 0.0% | 7.3 | 音声文字起こし自動化｜ElevenLabs Scribeで字幕生成 |
| 19 | `uniwind` | 55 | 0.0% | 9.9 | React NativeでTailwind v4｜Uniwind入門 |
| 20 | `gmgn-market` | 51 | 0.0% | 5.6 | ミームコイン相場分析｜価格チャート・新規上場をGMGNで |

## 実施結果（2026-06-06）

- 本番Meili（Railway）の20本へ新 `name`(title) / `description_ja`(meta) を反映。
- ライブ20本すべて **HTTP 200**・新title/新meta description 反映を確認。
- `skills-index.json` を本番Meiliから再生成（10,290件、新名称反映済み）。
- ログ: `logs/ctr-optimization-2026-06-06.log`（before/after CSV）。
- Slack通知: `.env` にwebhook未設定のためスキップ。

### ⚠️ 復旧インシデント記録（重要）
- 当初 `POST /indexes/skills/documents` で `{id,name,description_ja}` のみ送信し partial merge を期待したが、**この本番Meiliでは全置換**となり、20本の他フィールド（slug/content_full/category 等）が一時消失、20ページが一時的に404化。
- 即時復旧: GitHub raw（content_full・frontmatter）＋ `skills-index.json`（category/vendor/license/quality/repo/raw_url）＋ ローカル `data/translated_body_skills.jsonl`（3本は content_full_ja まで完全復活）を突き合わせ、全フィールドを再構築して **PUT（完全置換）** で復元。20/20 で slug フィルタ・全必須フィールド・新title/desc を検証済み。
- **残課題**: 上記3本以外の17本は `content_full_ja`（本文の日本語訳）がprod Meiliのみの保持だったため復元不可（null）。本文は英語原文で表示され機能はするが、日本語本文の再翻訳が望ましい（翻訳パイプライン step の再実行で復旧可能）。github_stars/last_updated も17本は欠落（軽微）。
- **教訓**: 今後この本番Meiliでフィールド単位編集を行う場合は、必ず read→modify→PUT(完全ドキュメント) で行う（POSTのpartial mergeに依存しない）。
