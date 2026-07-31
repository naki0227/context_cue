# 作業報告書

## 作業日時

2026年07月31日 14時12分10秒

## 作業対象

STTモデル管理、設定画面、Release workflow、公開配布README・導入ページ。

## 作業目的

端末に安定したWhisperモデルを自動推奨し、READMEの単一導線から新規導入と更新の
どちらも迷わず開始できるようにする。

## 変更内容

- Apple Siliconは8GB以上、その他CPUは16GB以上で`large-v3-turbo-q5_0`を推奨し、
  それ以外は`base-q5_1`を推奨するモデルカタログを追加した。
- モデル名、取得容量、検出メモリ、選定理由を設定画面へ追加した。
- 公式URL、正確なサイズ、SHA-256が一致したモデルだけを保存するようにした。
- Release成果物へOS別の安定名とSHA-256を追加し、公開前ゲートで存在を検証した。
- 解析Cookieを使わないOS判定ページとGitHub Pages workflowを追加した。
- Release時に公開用ディレクトリだけを固定名義で公開リポジトリへ同期するようにした。

## 変更したファイル

- STT: `stt_model_catalog.rs`、`stt_runtime.rs`、`whisper_engine.rs`、`config.rs`、
  `domain/stt.rs`、`Cargo.toml`、`Cargo.lock`
- UI: `stt.ts`、`runtime-commands.ts`、`use-stt-runtime.ts`、
  `settings-stt-card.tsx`、`app.test.tsx`
- 配布: `release.yml`、`publish-beta-release.yml`、公開README、`install/index.html`、
  `pages.yml`
- 文書・テスト: `SPEC.md`、生成SPEC、ADR 0007、ルートREADME、Release関連テスト

## 変更意図

全端末へ大型モデルを配布せず、M5など十分なApple Siliconでは精度を優先し、
低メモリ・低速端末では既存軽量モデルを維持する。独自の特権ブートストラップは
作らず、OS標準インストーラの更新判定と同一アプリ識別子を再利用する。

## 設計上の意図

モデル定義と推奨ルールをUI・ダウンロード処理から分離し、境界値を単体テスト可能に
した。公開側へは専用ディレクトリだけを同期し、開発元履歴・URL・author metadataを
含めない。重要判断はADR 0007へ記録した。

## 影響範囲

初回STTモデル取得、設定画面、Release成果物名、ベータ公開ゲート、公開README、
GitHub Pages。ワークスペース、既存ユーザーデータ、音声保存方針は変更しない。

## 追加・更新したテスト

- Apple Silicon 8GB、非Apple 8GB、非Apple 16GBのモデル推奨境界値
- SHA-256 hasherと公式モデルサイズ
- 公開導入ページの安定名、プライバシー、Pages最小権限
- Release安定名生成、公開同期範囲、固定author、公開前ゲート
- 設定画面の高精度モデル容量と選定案内

## 実行した確認コマンド

- `corepack pnpm lint`、`typecheck`、`test`、`build`: 成功
- `cargo fmt --all -- --check`、`clippy`、`check`、`test`、`build`: 成功
- `corepack pnpm audit --audit-level high`: 既知脆弱性0件
- `cargo audit`: 既知脆弱性0件、許可済み警告17件
- privacy audit、release repository audit、release preflight、spec check: 成功
- Chrome headlessでデスクトップ・モバイル相当表示を確認: 成功

## CIで確認される内容

format、lint、typecheck、JS/Rustテスト、frontend/Rust build、依存監査、
プライバシー監査、公開リポジトリ監査、Release metadataとSPEC整合性。

## 未解決の課題

- 公開リポジトリでGitHub PagesのSourceをGitHub Actionsへ設定する必要がある。
- 安定名成果物は次のReleaseで初めて生成されるため、公開URLの実地確認が必要。
- 現在の推奨は実測benchmarkではなくCPU種別と総メモリによるヒューリスティック。
- macOS/Windowsの正式コード署名とTauri Updaterは未実装。

## 次にやること

`v0.1.5`候補を作り、公開同期、Pages deploy、安定名4成果物、新規導入・上書き更新、
M5での高精度モデル取得と文字起こしをsmoke testする。

## 次回最初に見るべきファイル

- `.github/workflows/release.yml`
- `apps/desktop/src-tauri/src/stt_model_catalog.rs`
- `distribution/release-repository/install/index.html`
- `docs/adr/0007-device-aware-install-and-stt-model-selection.md`

## 引き継ぎ事項

次回最初に`corepack pnpm release:check`を実行する。公開側へ開発リポジトリ全体を
clone・mirrorせず、`distribution/release-repository/`以外を同期しない。
モデルchecksum変更時は公式配布metadataと実ファイルを再照合する。

## Release実行結果

### 実行日時

2026年07月31日 17時51分06秒

### 結果

- `v0.1.5`タグをrelease commit `22ba5e6`へ作成した。
- 公開同期のGit credential設定をhotfix commit `f1b81aa`で追加した。
- Release Actions run `30616654014`は全job成功した。
- quality gate、監査済み公開ファイル同期、Tauri 4環境、stable installer 4件と
  SHA-256、CLI 4環境の隔離CRUD smoke testとuploadが成功した。
- 公開Pages run `30617059573`が成功し、installページのHTTP 200を確認した。
- Releaseは意図どおりdraftかつPre-release候補であり、実機smoke test前には公開しない。

### Release後の残作業

M5でApple Silicon用stable installerを使った上書き更新、高精度モデルの自動選択・
取得・再利用、リアルタイム文字起こしを確認する。成功後に`Publish Beta Release`
workflowへ`v0.1.5`、smoke test済み、`publish v0.1.5`を入力して公開する。
