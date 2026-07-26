type OverlayPrivacyShieldProps = {
  kind: 'side' | 'top';
};

export function OverlayPrivacyShield({ kind }: OverlayPrivacyShieldProps) {
  return (
    <main
      className={`overlay-privacy-shell ${kind}`}
      data-testid="overlay-privacy-shield"
    >
      <section className="overlay-privacy-card" data-tauri-drag-region>
        <span className="overlay-privacy-icon" aria-hidden="true">
          ●
        </span>
        <div>
          <strong>画面共有保護中</strong>
          <p>会話内容と個人ナレッジを非表示にしています。</p>
        </div>
      </section>
    </main>
  );
}
