type TranscriptPreviewItem = {
  id: string;
  text: string;
};

type SideOverlayWindowProps = {
  listeningBarIds: string[];
  memoItems: string[];
  transcriptPreview: TranscriptPreviewItem[];
};

export function SideOverlayWindow({
  listeningBarIds,
  memoItems,
  transcriptPreview,
}: SideOverlayWindowProps) {
  const latestTranscript = transcriptPreview.at(-1);

  return (
    <main className="side-overlay-shell">
      <section className="side-overlay-card" data-tauri-drag-region>
        <div className="dock-tabs">
          <button className="dock-tab active" type="button">
            文字起こし
          </button>
          <button className="dock-tab" type="button">
            要約
          </button>
        </div>

        <div className="dock-feed">
          {transcriptPreview.length === 0 ? (
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

        <div className="side-overlay-summary">
          <p className="side-overlay-note-label">要約メモ</p>
          <ul>
            {memoItems.slice(0, 2).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="dock-footer">
          <span>
            {latestTranscript?.text
              ? 'AIが聞いています...'
              : 'AIが静かに支援しています...'}
          </span>
          <div className="listening-bars" aria-hidden="true">
            {listeningBarIds.map((barId) => (
              <span key={barId} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
