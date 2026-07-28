# Security Policy

## 脆弱性の報告

脆弱性、秘密情報の露出、署名不一致を発見した場合は、公開Issueへ詳細を書かないで
ください。GitHubのPrivate vulnerability reportingが利用可能な場合は、リポジトリの
Securityタブから非公開で報告してください。

Private vulnerability reportingが表示されない場合は、再現手順や機密情報を公開せず、
「非公開の連絡経路が必要」とだけ記載したIssueを作成してください。

## 配布物の確認

- Releaseがdraftまたはprereleaseではないことを確認してください
- OSが表示する署名元を確認してください
- CLI archiveは添付されたSHA-256 checksumと照合してください
- 署名確認に失敗した配布物を実行しないでください

安全機能を回避する手順は案内しません。
