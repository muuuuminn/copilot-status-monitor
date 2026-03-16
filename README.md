# copilot-status-monitor

GitHub Copilot と VS Code 上の Copilot 機能について、GitHub 公式ドキュメントを根拠に **GA / Public Preview / Unknown** を判定し、週次でスナップショットと差分レポートを生成する仕組みです。

## 何が変わったか

この版では、`https://docs.github.com/en/copilot` 配下のページを**全件クロール対象**に変更しました。

- `/en/copilot` 配下の全ページを収集
- ページを `feature_catalog / feature_detail / reference / howto / tutorial / admin / other` に分類
- feature ごとに alias 一致で関連ページを束ねる
- 証拠をページカテゴリと優先 URL で重み付け
- feature 差分に加えて、**ページ差分**も出力

## 何をするか

- GitHub Docs の **Copilot feature matrix** から、VS Code 最新版での対応状況を抽出
- `/en/copilot` 配下をクロールして feature ごとの証拠を収集
- 個別ドキュメントから `public preview` / `generally available` などの証拠を抽出
- 各機能について以下を出力
  - VS Code support
  - Release status: `GA` / `Public Preview` / `Unknown`
  - Confidence
  - Conflict flag
  - Evidence URL
- 前回スナップショットとの差分を JSON / Markdown で出力
- GitHub Actions で週1回自動実行

## 判定ルール

### 優先順位

1. matrix の VS Code 列が `P`
   - `Public Preview`
2. 個別ページや機能一覧ページに `public preview` がある
   - `Public Preview`
3. 個別ページや reference に `generally available` / `GA` がある
   - `GA`
4. 根拠不足
   - `Unknown`

### 補足

- matrix の `✓` は **VS Code で使える** ことを示すだけで、必ずしも GA を意味しません。
- 全ページを収集しますが、証拠は**同列に扱いません**。
- `feature_detail`, `feature_catalog`, `reference` を強い証拠として優先します。
- 根拠が衝突した場合は `conflictFlag: true` にします。
- 判定はルールベースです。GitHub Docs 側の表現変更があると、alias やキーワードの追加が必要です。

## ディレクトリ構成

```text
.
├─ .github/workflows/weekly-copilot-status.yml
├─ config/evidence-rules.json
├─ data/
│  ├─ diffs/
│  └─ snapshots/
├─ reports/latest.md
├─ src/
│  ├─ crawl.js
│  ├─ diff.js
│  ├─ evidence.js
│  ├─ fetch.js
│  ├─ index.js
│  ├─ matrix.js
│  ├─ report.js
│  ├─ resolve.js
│  └─ utils.js
└─ package.json
```

## 使い方

### 1. ローカル実行

```bash
npm run start
```

### 2. 出力物

- `data/snapshots/snapshot_YYYY-MM-DD.json`
- `data/diffs/diff_YYYY-MM-DD.json`
- `reports/latest.md`

### 3. snapshot に含まれるもの

- `records`: feature ごとの判定結果
- `crawledPages`: 収集したページの URL / title / category / headings / text 先頭
- `pageInventory`: カテゴリ別の件数

## GitHub Actions

`.github/workflows/weekly-copilot-status.yml` が毎週 1 回実行します。

```yaml
schedule:
  - cron: '17 3 * * 1'
```

これは **毎週月曜 03:17 UTC** です。

## evidence-rules.json の更新方法

新しい feature を追加したい場合は `config/evidence-rules.json` の `features` にルールを追加します。

```json
{
  "featureKey": "prompt_files",
  "featureName": "Prompt files",
  "aliases": ["prompt files", "prompt file"],
  "preferredCategories": ["feature_detail", "tutorial", "reference"],
  "specificUrls": [
    "https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files",
    "https://docs.github.com/en/copilot/concepts/prompting/response-customization"
  ]
}
```

## 出力イメージ

| Feature | VS Code support | Release status | Confidence | Conflict |
|---|---|---|---|---|
| Prompt files | supported (✓) | Public Preview | medium | no |
| Next edit suggestions | supported (✓) | Public Preview | medium | yes |
| Agent mode | supported (✓) | GA | low〜medium | no |

## 想定している限界

- GitHub Docs に GA/Public Preview の明示がない機能は `Unknown` になります。
- 同じ機能でも docs 間で記述が揺れる場合があります。
- 現時点では **VS Code surface** のみを対象にしています。
- クロール対象は `/en/copilot` 配下のみです。`/enterprise-cloud@latest/` などは明示的に含めていません。
