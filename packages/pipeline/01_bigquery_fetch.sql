-- ============================================================
-- agent-skills.jp データ収集SQL
-- ============================================================
-- GitHub Archive (bigquery-public-data.github_repos) から
-- SKILL.md 形式のAgent Skills を網羅収集する。
--
-- 対応ベンダー:
--  - Anthropic Claude (.claude/skills/, /skills/ 配下)
--  - OpenAI Codex (.agents/skills/ 配下)
--  - OpenCode (~/.config/opencode/skills/ 配下)
--  - その他汎用 (パス問わず SKILL.md 全般)
--
-- 想定処理時間: 30-90秒
-- 想定コスト: 500GB前後スキャン = $2.50程度
-- ============================================================

-- ステップ1: ファイル一覧から SKILL.md ファイルを抽出
WITH skill_files AS (
  SELECT
    f.repo_name,
    f.path,
    f.id AS file_id,
    -- パスからベンダー推定
    CASE
      WHEN LOWER(f.path) LIKE '%.claude/skills/%' THEN 'claude'
      WHEN LOWER(f.path) LIKE '%.agents/skills/%' THEN 'openai'
      WHEN LOWER(f.path) LIKE '%opencode/skills/%' THEN 'opencode'
      WHEN LOWER(f.path) LIKE '%.gemini/skills/%' THEN 'gemini'
      WHEN LOWER(f.path) LIKE '%/skills/%/skill.md' THEN 'generic'
      ELSE 'unknown'
    END AS vendor_guess
  FROM `bigquery-public-data.github_repos.files` f
  WHERE
    -- SKILL.md ファイル名(大文字小文字区別なし)
    LOWER(f.path) LIKE '%skill.md'
    -- ノイズ除外: node_modules, vendor, dist, build
    AND LOWER(f.path) NOT LIKE '%node_modules%'
    AND LOWER(f.path) NOT LIKE '%vendor/%'
    AND LOWER(f.path) NOT LIKE '%/dist/%'
    AND LOWER(f.path) NOT LIKE '%/build/%'
    AND LOWER(f.path) NOT LIKE '%/.git/%'
),

-- ステップ2: ファイル内容を取得し、YAMLフロントマターがあるものに絞る
skill_contents AS (
  SELECT
    sf.repo_name,
    sf.path,
    sf.vendor_guess,
    c.content,
    LENGTH(c.content) AS content_length
  FROM skill_files sf
  JOIN `bigquery-public-data.github_repos.contents` c
    ON sf.file_id = c.id
  WHERE
    -- YAMLフロントマターを持つもの(SKILL.md 標準形式)
    c.content LIKE '---%'
    -- name と description が含まれているもの(SKILL.md仕様準拠)
    AND c.content LIKE '%name:%'
    AND c.content LIKE '%description:%'
    -- 極端に短い・長いものを除外
    AND LENGTH(c.content) BETWEEN 100 AND 100000
    -- バイナリ・サンプル・テンプレートを除外
    AND c.binary = FALSE
),

-- ステップ3: リポジトリのスター数を結合
enriched AS (
  SELECT
    sc.repo_name,
    sc.path,
    sc.vendor_guess,
    sc.content,
    sc.content_length,
    r.watch_count AS stars,
    -- リポジトリ名からauthor抽出
    SPLIT(sc.repo_name, '/')[OFFSET(0)] AS author,
    SPLIT(sc.repo_name, '/')[OFFSET(1)] AS repo_short
  FROM skill_contents sc
  LEFT JOIN `bigquery-public-data.github_repos.sample_repos` r
    ON sc.repo_name = r.repo_name
)

-- 最終出力
SELECT
  repo_name,
  path,
  vendor_guess,
  content,
  content_length,
  COALESCE(stars, 0) AS stars,
  author,
  repo_short,
  -- リポジトリURL構築
  CONCAT('https://github.com/', repo_name) AS repo_url,
  -- raw URL構築(main branch想定、実際はAPIで確認必要)
  CONCAT('https://raw.githubusercontent.com/', repo_name, '/main/', path) AS raw_url
FROM enriched
WHERE
  -- 信頼性フィルタ: スター1以上、または公式org
  (
    COALESCE(stars, 0) >= 1
    OR LOWER(author) IN (
      'anthropics', 'openai', 'google', 'googleapis', 'microsoft',
      'meta', 'meta-llama', 'huggingface', 'vercel', 'vercel-labs',
      'opencode', 'opencodeco', 'replit', 'cursor-so'
    )
  )
ORDER BY stars DESC, content_length DESC
LIMIT 100000;

-- ============================================================
-- 実行手順
-- ============================================================
-- 1. GCPコンソール → BigQuery を開く
-- 2. 新しいクエリで上記SQLを貼る
-- 3. 「実行」ボタン
-- 4. 結果が出たら「結果を保存」→「CSV」または「JSON」でGCS/ローカルにエクスポート
-- 5. ファイルを /home/claude/data/raw_skills.json として保存
--
-- もしくは bq CLI で:
-- bq query --use_legacy_sql=false --format=json --max_rows=100000 < this.sql > raw_skills.json
-- ============================================================

-- ============================================================
-- 補足: GitHub Archive最新化されてないリポジトリ対策
-- ============================================================
-- bigquery-public-data.github_repos は2017年スナップショット中心で、
-- 最新のSKILL.mdが含まれていない可能性が高い。
--
-- 補完策として、別途以下も実行する想定:
--
-- 1. GitHub Search API で直近1ヶ月の SKILL.md 検索
--    https://api.github.com/search/code?q=filename:SKILL.md+extension:md
--    (1,000件上限、要認証)
--
-- 2. 公式skillsリポジトリを直接クローン:
--    - github.com/anthropics/skills
--    - github.com/openai/skills
--    - github.com/vercel-labs/agent-skills
--    - github.com/addyosmani/agent-skills
--
-- 3. GHArchive (gharchive.org) のWatchEventストリームで
--    SKILL.md commitを含むPRを日次収集
--
-- 詳細は packages/pipeline/01b_github_api_supplement.py 参照
-- ============================================================
