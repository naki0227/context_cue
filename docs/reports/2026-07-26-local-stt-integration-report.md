# 作業報告書

## 作業日時

2026年07月26日 18時12分28秒

## 作業対象

マイク入力、デバイス選択、VAD、Whisperモデル管理、日本語文字起こし、設定UI。

## 作業目的

外部送信なしで実音声を文字起こしし、セッション中のtranscript・summary・cue更新へ接続する。

## 変更内容

- `cpal`による入力デバイス一覧とマイク録音。
- 16kHz mono変換、4秒区間、RMS・peakによるVAD。
- `whisper-rs`による日本語STTとモデルコンテキスト再利用。
- 約59MBの公式量子化モデル取得、進捗、中止、SHA-1検証、`0600`保存。
- 設定画面のモデル状態、入力デバイス選択、取得操作。
- セッション開始時だけ録音し、停止時にマイクを解放。
- macOSマイク利用目的、Linux CIビルド依存を追加。

## 変更したファイル

- `apps/desktop/src-tauri/src/domain/stt.rs`
- `apps/desktop/src-tauri/src/repository/stt_repository.rs`
- `apps/desktop/src-tauri/src/infrastructure/audio_capture.rs`
- `apps/desktop/src-tauri/src/infrastructure/whisper_engine.rs`
- `apps/desktop/src-tauri/src/stt_runtime.rs`
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/features/dashboard/hooks/use-stt-runtime.ts`
- `apps/desktop/src/features/dashboard/components/settings/settings-stt-card.tsx`
- `apps/desktop/src/lib/tauri/runtime-commands.ts`
- `.github/workflows/ci.yml`
- `apps/desktop/src-tauri/Info.plist`
- `.cargo/config.toml`
- `docs/adr/0002-embedded-whisper-stt.md`

## 変更意図

非エンジニアへ別STTサーバーの導入を要求せず、個人情報を含む音声を端末内だけで処理するため。

## 設計上の意図

domain、repository、infrastructure、runtime、command、React hook、表示を分離した。モデル未取得やマイク拒否はセッション全体を止めず、ルールベース支援へ安全に劣化する。生音声は保存しない。

## 影響範囲

Tauriネイティブ依存、OSマイク権限、設定画面、セッション開始・停止、transcript event、CI Linux依存。

## 追加・更新したテスト

- 無音を除外するVAD。
- 48kHzから16kHzへのresample。
- モデル取得進捗の境界。
- 公式モデルの手動ロード・推論スモーク。
- 設定画面の音声認識カード。

## 実行した確認コマンド

- frontend lint、typecheck、test 23件: 成功。
- Rust fmt、clippy、test 28件: 成功。
- 公式モデルSHA-1照合: 成功。
- 公式モデルロード・Whisper推論: 成功。
- `pnpm audit`: 既知脆弱性0件。
- `cargo audit`: 脆弱性0件、許容warning 18件。
- クリーンなrelease targetで`.app`とDMG生成: 成功。
- 生成した`Info.plist`のマイク用途説明とmacOS 10.15最小版: 確認済み。

## CIで確認される内容

frontend format・lint・typecheck・test・build、Rust fmt・clippy・check・test・build、pnpm audit、cargo audit。大容量モデルの実推論スモークは手動確認とする。

## 未解決の課題

- 実際の日本語会話と複数マイクで精度・遅延を計測する必要がある。
- speaker diarizationとシステム音声入力は未実装。
- Windows/Linux実機のマイク権限確認は未実施。
- RustSecの許容warning 18件はTauriのGTK3系と間接依存を中心に継続監視する。

## 次にやること

セッション保存ポリシーを確定し、終了時summaryとReview生成を保存層へ接続する。

## 次回最初に見るべきファイル

- `docs/adr/0002-embedded-whisper-stt.md`
- `apps/desktop/src-tauri/src/stt_runtime.rs`
- `apps/desktop/src-tauri/src/infrastructure/whisper_engine.rs`
- `docs/TODO.md`

## 引き継ぎ事項

生音声を保存しない方針を維持する。モデルURLやchecksumを変更する場合は、公式配布物の確認とADR更新を必須にする。
