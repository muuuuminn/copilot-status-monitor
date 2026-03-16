# GitHub Copilot for VS Code status report

Generated at: 2026-03-16T12:45:43.851Z
Matrix source: https://docs.github.com/en/copilot/reference/copilot-feature-matrix
Rules file: config/evidence-rules.json

## Current status

| Feature | VS Code support | Release status | Confidence | Conflict | Notes | Evidence |
|---|---|---|---|---|---|---|
| BYOK | preview (P) | Public Preview | high | no | Matrix shows P for VS Code. |  |
| Copilot code review | supported (✓) | Public Preview | medium | no | Documentation page contains a public preview indication. | [link](https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review) |
| Java Upgrade Agent | preview (P) | Public Preview | high | no | Matrix shows P for VS Code. |  |
| Next edit suggestions | supported (✓) | Public Preview | medium | yes | Documentation page contains a public preview indication. / Conflicting evidence: another page suggests GA coverage. | [link](https://docs.github.com/en/copilot/get-started/features)<br>[link](https://docs.github.com/en/copilot/concepts/completions/code-suggestions)<br>[link](https://docs.github.com/en/copilot/reference/metrics-data) |
| Prompt files | supported (✓) | Public Preview | medium | no | Documentation page contains a public preview indication. | [link](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files)<br>[link](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/prompting/response-customization) |
| Vision | preview (P) | Public Preview | high | no | Matrix shows P for VS Code. |  |
| Agent mode | supported (✓) | GA | medium | no | Supporting documentation indicates GA coverage. | [link](https://docs.github.com/en/copilot/reference/metrics-data) |
| Chat | supported (✓) | GA | medium | no | Supporting documentation indicates GA coverage. | [link](https://docs.github.com/en/copilot/reference/metrics-data) |
| Code completion | supported (✓) | GA | medium | no | Supporting documentation indicates GA coverage. | [link](https://docs.github.com/en/copilot/reference/metrics-data)<br>[link](https://docs.github.com/en/copilot/get-started/features) |
| Edit mode | supported (✓) | GA | medium | no | Supporting documentation indicates GA coverage. | [link](https://docs.github.com/en/copilot/reference/metrics-data) |
| .NET Upgrade Agent | unsupported (✗) | Unknown | low | no | Feature is not supported in VS Code latest release, so GA/Public Preview is not classified for this surface. |  |
| Agent skills | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| Checkpoints | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| Code referencing | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| Custom agents | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| Custom instructions | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| MCP | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |
| Workspace indexing | supported (✓) | Unknown | low | no | Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found. |  |

## Diff from previous snapshot

| Feature | Change type | Previous | Current |
|---|---|---|---|
| .NET Upgrade Agent | added | - | unsupported / Unknown |
| Agent mode | added | - | supported / GA |
| Agent skills | added | - | supported / Unknown |
| BYOK | added | - | preview / Public Preview |
| Chat | added | - | supported / GA |
| Checkpoints | added | - | supported / Unknown |
| Code completion | added | - | supported / GA |
| Code referencing | added | - | supported / Unknown |
| Copilot code review | added | - | supported / Public Preview |
| Custom agents | added | - | supported / Unknown |
| Custom instructions | added | - | supported / Unknown |
| Edit mode | added | - | supported / GA |
| Java Upgrade Agent | added | - | preview / Public Preview |
| MCP | added | - | supported / Unknown |
| Next edit suggestions | added | - | supported / Public Preview |
| Prompt files | added | - | supported / Public Preview |
| Vision | added | - | preview / Public Preview |
| Workspace indexing | added | - | supported / Unknown |

## Notes

- Matrix `P` is treated as Public Preview for the VS Code surface.
- Matrix `✓` only means supported in VS Code. Without explicit maturity evidence, release status remains Unknown.
- Conflicts are surfaced when one document suggests Public Preview and another suggests GA.
