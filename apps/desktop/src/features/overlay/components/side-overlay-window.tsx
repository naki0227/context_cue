import type { CSSProperties } from 'react';
import type { OverlayPreferences } from '@/lib/state/app-store';

type TranscriptPreviewItem = {
  id: string;
  text: string;
};

type SideOverlayWindowProps = {
  listeningBarIds: string[];
  memoItems: string[];
  overlayPreferences: OverlayPreferences;
  transcriptPreview: TranscriptPreviewItem[];
};

function buildSideOverlayStyle(
  overlayPreferences: OverlayPreferences,
): CSSProperties {
  const isLightTheme = overlayPreferences.theme === 'light';

  return {
    background: isLightTheme
      ? `rgba(255,255,255,${overlayPreferences.opacity / 100})`
      : `rgba(16,24,37,${Math.max(0.62, overlayPreferences.opacity / 105)})`,
    borderRadius: `${overlayPreferences.cornerRadius + 14}px 0 0 ${
      overlayPreferences.cornerRadius + 14
    }px`,
    boxShadow: `0 24px ${overlayPreferences.shadow}px rgba(0, 0, 0, ${
      isLightTheme ? 0.14 : 0.24
    })`,
    color: isLightTheme ? '#152038' : 'rgba(255,255,255,0.96)',
    fontSize: `${overlayPreferences.fontSize}px`,
    minHeight: `${Math.max(overlayPreferences.height, 420)}px`,
  };
}

export function SideOverlayWindow({
  listeningBarIds,
  memoItems,
  overlayPreferences,
  transcriptPreview,
}: SideOverlayWindowProps) {
  const latestTranscript = transcriptPreview.at(-1);
  const showTranscript = overlayPreferences.sections.transcript;
  const showSummary = overlayPreferences.sections.summary;

  return (
    <main className="side-overlay-shell">
      <section
        className={`side-overlay-card ${
          overlayPreferences.theme === 'light' ? 'light' : 'dark'
        }`}
        data-tauri-drag-region
        style={buildSideOverlayStyle(overlayPreferences)}
      >
        <div className="dock-tabs">
          <button className="dock-tab active" type="button">
            文字起こし
          </button>
          <button className="dock-tab" type="button">
            要約
          </button>
        </div>

        <div className="dock-feed">
          {!showTranscript || transcriptPreview.length === 0 ? (
            <>
              <p className="speaker-line">
                <span className="speaker-name other">相手</span>
                学生時代に力を入れたことについて教えてください。
              </p>
              <p className="speaker-line">
                <span className="speaker-name you">あなた</span>
                はい、大学時代にUSJでのアルバイトに力を入れました。
              </p>
              <p className="speaker-line">
                <span className="speaker-name other">相手</span>
                なるほど、具体的にどのような課題があったのですか？
              </p>
            </>
          ) : (
            transcriptPreview.map((chunk, index) => (
              <p className="speaker-line" key={chunk.id}>
                <span
                  className={`speaker-name ${index % 2 === 0 ? 'other' : 'you'}`}
                >
                  {index % 2 === 0 ? '相手' : 'あなた'}
                </span>
                {chunk.text}
              </p>
            ))
          )}
        </div>

        {showSummary ? (
          <div className="side-overlay-summary">
            <p className="side-overlay-note-label">要約メモ</p>
            <ul>
              {memoItems.slice(0, 2).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="dock-footer">
          <span>
            {latestTranscript?.text
              ? 'AIが聞いています...'
              : 'AIが静かに支援しています...'}
          </span>
          <div className="listening-bars" aria-hidden="true">
            {listeningBarIds.map((barId) => (
              <span
                key={barId}
                style={{ backgroundColor: overlayPreferences.accentColor }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
