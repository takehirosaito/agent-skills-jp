# GitHub Actions テンプレート

ここに置いてあるワークフローは Personal Access Token の `workflow` スコープが必要なため、自動 push できないものを退避してあります。利用する場合は手動で `.github/workflows/` 配下に移動してください。

## publish-find-skills.yml

`alsel-find-skills` npm パッケージを `skills-index.json` の変更時に自動 publish します。

### 有効化手順

1. **NPM_TOKEN secret を設定**
   - npmjs.com にログイン → Account Settings → Access Tokens → "Generate New Token (Classic, Automation)"
   - GitHub の repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`, Value: コピーしたトークン

2. **PAT に `workflow` スコープを追加**
   - GitHub → Settings (個人) → Developer settings → Personal access tokens → 現在使ってる PAT
   - `workflow` scope にチェックを入れて Update

3. **ワークフローを所定位置に移動**
   ```bash
   mkdir -p .github/workflows
   mv docs/github-actions-templates/publish-find-skills.yml .github/workflows/
   git add .github/workflows/publish-find-skills.yml
   git commit -m "ci: add publish-find-skills workflow"
   git push origin main
   ```

これ以降、`skills-index.json` か `packages/find-skills-cli/**` の変更が main に
push されると、自動的に patch バージョンが bump され `npm publish` が走ります。

手動トリガーは GitHub Actions UI の "Run workflow" から (bump: patch/minor/major 選択可)。
