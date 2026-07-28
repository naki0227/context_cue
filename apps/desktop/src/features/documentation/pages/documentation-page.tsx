import { useDeferredValue, useState } from 'react';
import '@/features/documentation/styles/documentation.css';
import { SpecSectionContent } from '@/features/documentation/components/spec-section-content';
import {
  SPEC_MARKDOWN,
  SPEC_METADATA,
} from '@/features/documentation/generated/spec.generated';
import {
  parseSpecMarkdown,
  searchSpecSections,
} from '@/features/documentation/lib/spec-reader';

const spec = parseSpecMarkdown(SPEC_MARKDOWN);

export function DocumentationPage() {
  const [query, setQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(
    spec.sections[0]?.id ?? '',
  );
  const deferredQuery = useDeferredValue(query);
  const matchingSections = searchSpecSections(spec.sections, deferredQuery);
  const activeSection =
    matchingSections.find((section) => section.id === activeSectionId) ??
    matchingSections[0];

  return (
    <section className="page-layout documentation-page">
      <header className="documentation-header">
        <div>
          <p className="eyebrow">PRODUCT DOCUMENTATION</p>
          <h1>製品仕様・ガイド</h1>
          <p>
            アプリの挙動、安全設計、データの扱いをオフラインで確認できます。
          </p>
        </div>
        <label className="search-shell documentation-search">
          <span className="search-shell-icon" />
          <input
            aria-label="仕様書を検索"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="仕様書を検索"
            type="search"
            value={query}
          />
        </label>
      </header>

      <div className="spec-meta-row">
        <span>Version {SPEC_METADATA.仕様バージョン}</span>
        <span>更新 {SPEC_METADATA.更新日}</span>
        <span>{SPEC_METADATA.ステータス}</span>
      </div>

      <div className="documentation-grid">
        <aside className="soft-card spec-toc">
          <strong>目次</strong>
          <nav aria-label="仕様書の目次">
            {matchingSections.map((section) => (
              <button
                className={activeSection?.id === section.id ? 'active' : ''}
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                type="button"
              >
                {section.title}
              </button>
            ))}
          </nav>
          {matchingSections.length === 0 ? (
            <p className="spec-empty">一致する章がありません。</p>
          ) : null}
        </aside>

        <article className="soft-card spec-reader">
          {activeSection ? (
            <>
              <div className="spec-reader-heading">
                <span>SPECIFICATION</span>
                <h2>{activeSection.title}</h2>
              </div>
              <SpecSectionContent body={activeSection.body} />
            </>
          ) : (
            <div className="spec-empty-state">
              <strong>検索条件を見直してください</strong>
              <p>章名または本文に含まれる言葉で検索できます。</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
