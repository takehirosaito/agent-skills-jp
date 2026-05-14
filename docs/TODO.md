# TODO

長期的に持ち越すタスクの一覧。短期セッション内のタスクは TaskCreate で扱う。

## 期日付き

### 2026-08 中: GitHub Actions のアクション v5 化

- 対象ファイル: `.github/workflows/publish-find-skills.yml`
- 変更内容:
  - `actions/checkout@v4` → `@v5`
  - `actions/setup-node@v4` → `@v5`
- 理由: GitHub Actions ランナーが 2026-09-16 から Node.js 20 アクションを実行不可にする予定。
- 余裕を持って 2026-08 中に対応する。
- 検証手順: ワークフローを手動 (Actions UI → Run workflow) で実行して成功確認。

### 2026-08-12 まで: NPM_TOKEN 再発行

- `.github/workflows/npm-token-reminder.yml` が毎月 1 日に確認し、残 30 日を切ったら自動で Issue を立てる。
- Issue の手順に従って npmjs.com で再発行 → GitHub Secret 更新 → リマインダーワークフローの `EXPIRY_DATE` を書き換え。

## 期日なし (要検討)

特になし。
