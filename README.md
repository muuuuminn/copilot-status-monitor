# copilot-status-monitor

GitHub Copilot と VS Code 上の Copilot 機能について、GitHub 公式ドキュメントを根拠に **GA / Public Preview / Unknown** を判定し、週次でスナップショットと差分レポートを生成する仕組みです。

## 何をするか

- GitHub Docs の **Copilot feature matrix** から、VS Code 最新版での対応状況を抽出
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
2. 個別ページに `public preview` がある
   - `Public Preview`
3. 個別ページや補助ページに `generally available` や `GA` を示す根拠がある
   - `GA`
4. 根拠不足
   - `Unknown`

### 注意

- matrix の `✓` は **VS Code で使える** ことを示すだけで、必ずしも GA を意味しません。
- 根拠が衝突した場合は `conflictFlag: true` にします。
- 判定はルールベースです。GitHub Docs 側の表現変更があると、ルール追加が必要です。

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

## GitHub Actions

`.github/workflows/weekly-copilot-status.yml` が毎週 1 回実行します。

```yaml
schedule:
  - cron: '17 3 * * 1'
```

これは **毎週月曜 03:17 UTC** です。

## evidence-rules.json の更新方法

新しい機能や判定根拠を追加したい場合は `config/evidence-rules.json` にルールを追加します。

```json
{
  "featureKey": "prompt_files",
  "featureName": "Prompt files",
  "aliases": ["prompt files"],
  "pages": [
    {
      "url": "https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files",
      "matchAny": ["prompt files"],
      "publicPreviewHints": ["public preview"]
    }
  ]
}
```

## 出力イメージ

| Feature | VS Code support | Release status | Confidence | Conflict |
|---|---|---|---|---|
| Prompt files | supported (✓) | Public Preview | medium | no |
| Next edit suggestions | supported (✓) | Public Preview | medium | yes |
| Agent mode | supported (✓) | GA | medium | no |

## 想定している限界

- GitHub Docs に GA/Public Preview の明示がない機能は `Unknown` になります。
- 同じ機能でも docs 間で記述が揺れる場合があります。
- 現時点では **VS Code surface** のみを対象にしています。
