# 作業報告書

## 作業日時

2026年07月26日 16時25分38秒

## 作業対象

本番リリース準備状況、ローカルLLM/STT導入、My Knowledge onboarding、
個人データ保存、Consent、Share Safe Mode、配布、CI、テスト、OSS文書。

## 作業目的

現状を製品版として公開するために不足している項目をコード根拠付きで洗い出し、
優先順位、受け入れ条件、実装順を確定する。My Knowledgeへ入力する内容と、
AIで安全に整理するpromptを用意する。

## 変更内容

- 本番準備状況をP0 / P1 / P2へ分類した監査文書を追加した。
- My Knowledgeの入力例、禁止情報、項目構造、AI整理promptを追加した。
- 非エンジニア向けOllama導入フローを具体化した。
- TODOを本番ブロッカー優先へ更新した。
- READMEから新しい文書へ到達できるようにした。

## 変更したファイル

- `README.md`
- `docs/TODO.md`
- `docs/production-readiness-audit.md`
- `docs/my-knowledge-guide.md`
- `docs/reports/2026-07-26-production-readiness-audit-report.md`

## 変更意図

画面完成度と製品完成度を混同せず、中核機能、安全性、配布・運用を含めた
Definition of Doneを明確にするため。

## 設計上の意図

Ollamaとモデルの同梱はMVPで採用せず、検出、公式導入案内、API pull進捗、
自己診断をアプリ内wizardで一体化する。My Knowledgeは原文を正本として残し、
AI整理結果を差分承認してから保存する。事実、出典、確度、機密度を持たせる。

## 影響範囲

今回はドキュメントとTODOのみ。アプリ挙動、保存データ、API、DBに変更はない。
今後のConsent、保存、LLM、STT、配布、テストの実装順に影響する。

## 追加・更新したテスト

コード変更がないため自動テスト追加なし。既存CI相当の検証を再実行し、
Frontend 19件、Rust 13件が成功した。

## 実行した確認コマンド

- `git status --short`
- `rg --files`
- `rg`によるmock、未接続設定、panic、握り潰しの検索
- `gh release list`
- `gh run list --workflow Release`
- `ollama --version`
- `ollama list`
- `ollama ps`
- `stat`による保存ファイル権限確認
- `corepack pnpm audit --audit-level moderate`
- `cargo audit --version`
- `corepack pnpm tauri:build`
- `codesign -dv --verbose=4`
- `spctl --assess`
- `corepack pnpm --filter desktop lint`
- `corepack pnpm --filter desktop typecheck`
- `corepack pnpm --filter desktop test`
- `corepack pnpm --filter desktop build`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace`
- `cargo test --workspace`
- `cargo build --workspace`

`tauri:build`はsandbox内ではDMG処理に失敗したが、権限付き再実行では
`.app`と`.dmg`を生成できた。`pnpm audit`は応答のdecodeエラーで失敗し、
`cargo audit`は未導入だったため、依存脆弱性は未確認としてP1へ記録した。
それ以外の上記Frontend / Rust検証はすべて成功した。

## CIで確認される内容

- Frontend lint
- TypeScript typecheck
- Frontend unit / component test
- Frontend build
- Rust fmt
- Rust clippy
- Rust check
- Rust test
- Rust build

現行CIにはPlaywright、Tauri bundle、dependency audit、coverage、SBOM、
3 OS install smoke testは含まれない。

## 未解決の課題

- 実音声、STT、Ollama、LLM生成が未実装
- ConsentとShare Safe Modeが安全要件未達
- 個人データが平文`0644`、非原子的保存
- 保存ポリシーと終了後summaryが未実装
- 署名、公証、正式アイコン、Updater、Release実績がない
- 依存脆弱性監査を完了できていない

## 次にやること

1. Consent、Share Safe Mode、空overlayを安全要件どおりに直す
2. 保存を`0600`、原子的書込み、型検証、エラー伝播へ変更する
3. Ollama setup wizardとLLM clientのADR・interface・testを実装する
4. User基本情報とMy Knowledge onboardingを実装する
5. マイク、VAD、whisper.cppを実装する

## 次回最初に見るべきファイル

- `docs/production-readiness-audit.md`
- `docs/my-knowledge-guide.md`
- `docs/TODO.md`
- `apps/desktop/src/lib/state/app-store.ts`
- `apps/desktop/src/features/dashboard/hooks/use-dashboard-controller.ts`
- `apps/desktop/src-tauri/src/infrastructure/persistence.rs`
- `apps/desktop/src-tauri/src/infrastructure/mock_event_runner.rs`

## 引き継ぎ事項

現時点を「製品版」と表現しない。ダッシュボードは実データCRUDだが、
会話pipelineはモックである。ユーザー文中で欠けていた2つ目の導入対象は、
文脈からローカルSTTと仮定して監査した。別対象を意図していた場合も、
本監査のP0/P1分類を維持し、追加対象を追記する。

Ollama公式APIはmodel pullのstream進捗を返せる。`gemma4:e2b`はこの端末で
7.2GB。モデル同梱は配布容量、OS/GPU差、更新、利用条件の負担が大きいため、
まずguided setupを採る。
