import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import { knowledgeTags } from '@/features/dashboard/lib/content';

type KnowledgePageProps = Pick<
  DashboardController,
  | 'appState'
  | 'fileInputRef'
  | 'importLocalFiles'
  | 'importSampleKnowledge'
  | 'knowledgeImportNotice'
  | 'removeProfileDocument'
>;

export function KnowledgePage({
  appState,
  fileInputRef,
  importLocalFiles,
  importSampleKnowledge,
  knowledgeImportNotice,
  removeProfileDocument,
}: KnowledgePageProps) {
  return (
    <div className="page-layout">
      <div className="toolbar-row">
        <div className="toolbar-actions">
          <button className="primary-button" type="button">
            ＋ 新しい項目
          </button>
          <input className="search-input" placeholder="検索" type="text" />
          <div className="icon-pair">
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="split-grid knowledge-grid">
        <article className="soft-card">
          <div className="table-head table-four">
            <span>項目</span>
            <span>タグ</span>
            <span>更新</span>
            <span />
          </div>

          {[
            ['自己分析まとめ', '自己分析', '2024/05/10'],
            ['USJでの改善経験', '経験・エピソード', '2024/05/08'],
            ['研究での仮説検証経験', '経験・エピソード', '2024/05/06'],
            ['チーム開発での役割', '経験・エピソード', '2024/05/07'],
            ['強み・弱み', 'スキル・強み', '2024/05/05'],
            ['ポートフォリオURL', '制作物', '2024/05/04'],
          ].map((item) => (
            <div className="table-row table-four" key={item[0]}>
              <strong>{item[0]}</strong>
              <span className="tag-bubble">{item[1]}</span>
              <span>{item[2]}</span>
              <button className="text-link" type="button">
                編集
              </button>
            </div>
          ))}

          <input
            accept=".md,.txt,text/plain,text/markdown"
            data-testid="profile-file-input"
            multiple
            onChange={importLocalFiles}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
          />

          <div className="knowledge-actions">
            <button onClick={() => fileInputRef.current?.click()} type="button">
              ナレッジを追加
            </button>
            <button
              className="secondary-button"
              onClick={importSampleKnowledge}
              type="button"
            >
              サンプル個人ナレッジを追加
            </button>
          </div>

          <p className="helper-text">
            {knowledgeImportNotice ||
              'ローカルの .md / .txt を追加すると会話中の想起支援に使われます。'}
          </p>
          <p className="helper-text">
            追加済みファイル数: {appState.importedDocuments.length}
          </p>
          <ul className="document-list">
            {appState.importedDocuments.length === 0 ? (
              <li>まだ追加された個人ナレッジはありません。</li>
            ) : (
              appState.importedDocuments.map((document) => (
                <li key={document.id}>
                  <span>
                    {document.title} ({document.sourceType})
                  </span>
                  <button
                    className="text-link"
                    onClick={() => removeProfileDocument(document.id)}
                    type="button"
                  >
                    削除
                  </button>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="soft-card">
          <div className="detail-header">
            <h3>USJでの改善経験</h3>
            <p>概要</p>
          </div>
          <div className="detail-block">
            <ul className="bullet-text">
              <li>アルバイトリーダーとして、待ち時間の見える化を提案</li>
              <li>課題設定と仮説検証を繰り返し、満足度向上を実現</li>
              <li>面談では再現性・数値・周囲との連携まで話せるよう整理</li>
            </ul>
          </div>
          <div className="knowledge-tags">
            {knowledgeTags.map((tag) => (
              <span className="knowledge-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
