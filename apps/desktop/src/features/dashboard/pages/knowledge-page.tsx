import { useMemo, useState } from 'react';
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

type KnowledgeEntry = {
  content: string[];
  id: string;
  tag: string;
  title: string;
  updatedAt: string;
};

const baseKnowledgeItems: KnowledgeEntry[] = [
  {
    id: 'knowledge-self-summary',
    title: '自己分析まとめ',
    tag: '自己分析',
    updatedAt: '2024/05/10',
    content: [
      '価値観として「相手理解」「改善の積み重ね」「再現性」を重視している。',
      '話すときは成果だけでなく、意思決定の理由と学びまで整理して伝える。',
      '面談や会議では、相手の意図を汲み取って補助線を引く役回りが強み。',
    ],
  },
  {
    id: 'knowledge-usj',
    title: 'USJでの改善経験',
    tag: '経験・エピソード',
    updatedAt: '2024/05/08',
    content: [
      'アルバイトリーダーとして、待ち時間の見える化を提案した。',
      '課題設定と仮説検証を繰り返し、満足度向上を実現した。',
      '面談では再現性・数値・周囲との連携まで話せるよう整理している。',
    ],
  },
  {
    id: 'knowledge-research',
    title: '研究での仮説検証経験',
    tag: '経験・エピソード',
    updatedAt: '2024/05/06',
    content: [
      '仮説の精度よりも、検証サイクルを短く回す設計を重視していた。',
      '定量だけでなく、現場観察のメモを意思決定に組み込んだ。',
      '不確実性が高い場面でも、次に試す打ち手を切らさない進め方を意識した。',
    ],
  },
  {
    id: 'knowledge-team-role',
    title: 'チーム開発での役割',
    tag: '経験・エピソード',
    updatedAt: '2024/05/07',
    content: [
      '議論が拡散したときに論点整理と役割分担を引き受けることが多い。',
      '仕様の抜け漏れを埋めるために、要件の前提を言語化して共有した。',
      '実装だけでなく、他メンバーが動きやすい資料化も担っていた。',
    ],
  },
  {
    id: 'knowledge-strengths',
    title: '強み・弱み',
    tag: 'スキル・強み',
    updatedAt: '2024/05/05',
    content: [
      '強みは相手の発言から論点を構造化し、次の一手に落とせること。',
      '弱みは細部に入り込みすぎることがあるため、時間配分を先に決めている。',
      '説明時は抽象と具体を往復しながら伝えると評価が安定しやすい。',
    ],
  },
  {
    id: 'knowledge-portfolio',
    title: 'ポートフォリオURL',
    tag: '制作物',
    updatedAt: '2024/05/04',
    content: [
      '代表制作物の背景、目的、担当範囲、結果を一緒に説明できる状態にしている。',
      'デザイン判断や技術選定の理由まで掘られても答えられるよう補足メモがある。',
      '相手の関心に応じて作品の見せ順を変えられるよう整理済み。',
    ],
  },
];

const importedDocumentFallbackContent: Record<string, string[]> = {
  values: [
    '大事にしている価値観を短く伝えられるように整理したメモです。',
    '面談では判断基準や動機の軸として引用できるようにしてあります。',
    '相手の質問に合わせて、具体例と一緒に話す前提でまとめています。',
  ],
  projects: [
    '関わったプロジェクトと担当範囲を一覧で振り返れるように整理しています。',
    '成果だけでなく、難しさや工夫した点まで追記できる形を想定しています。',
    '会話では相手の関心に応じて、詳細を深掘りできる補助メモとして使います。',
  ],
  meetings: [
    '過去の面談や会議から学んだポイントを再利用しやすい形で保存しています。',
    '次回に活かせる観点や、相手ごとの傾向を引き出すためのメモです。',
    '振り返りと準備の橋渡しになる情報を優先して残しています。',
  ],
  todos: [
    '次回までに確認したいことや準備したいことをまとめたタスクメモです。',
    '会話の前後で抜け漏れが起きないよう、行動レベルの粒度で管理します。',
    '直近の予定や相手情報と一緒に参照される前提です。',
  ],
  experiences: [
    '話せる経験をエピソード単位で整理した下地データです。',
    '課題・行動・結果・学びの流れで会話に載せやすい形にしています。',
    '面接だけでなく、会議や1on1でも使える再現可能な経験を優先しています。',
  ],
};

function buildImportedKnowledgeItems(
  importedDocuments: KnowledgePageProps['appState']['importedDocuments'],
) {
  return importedDocuments.map((document, index) => ({
    id: document.id,
    title: document.title,
    tag: document.sourceType === 'サンプル' ? 'サンプル' : 'ローカルファイル',
    updatedAt: `追加済み ${index + 1}`,
    content: importedDocumentFallbackContent[document.id] ??
      importedDocumentFallbackContent[document.title] ?? [
        `${document.title} の内容を会話で使える形に整理するための読み込み項目です。`,
        '要点、数字、背景、次に話したいことを追記していく前提のプレースホルダーです。',
        'ローカルで保持しながら、必要なときだけ参照できるようにしています。',
      ],
  }));
}

export function KnowledgePage({
  appState,
  fileInputRef,
  importLocalFiles,
  importSampleKnowledge,
  knowledgeImportNotice,
  removeProfileDocument,
}: KnowledgePageProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(baseKnowledgeItems[0]?.id ?? '');
  const [draftItems, setDraftItems] = useState<KnowledgeEntry[]>([]);

  const knowledgeItems = useMemo(
    () => [
      ...draftItems,
      ...buildImportedKnowledgeItems(appState.importedDocuments),
      ...baseKnowledgeItems,
    ],
    [appState.importedDocuments, draftItems],
  );

  const filteredItems = knowledgeItems.filter((item) =>
    `${item.title} ${item.tag} ${item.content.join(' ')}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ??
    knowledgeItems.find((item) => item.id === selectedId) ??
    filteredItems[0] ??
    knowledgeItems[0];
  const selectedTags = Array.from(
    new Set([selectedItem?.tag, ...knowledgeTags].filter(Boolean)),
  ).slice(0, 6);

  function addDraftItem() {
    const nextItem: KnowledgeEntry = {
      id: `draft-${draftItems.length + 1}`,
      title: `新しいナレッジ ${draftItems.length + 1}`,
      tag: '下書き',
      updatedAt: '今',
      content: [
        'この項目は後で面談・会議向けの要点に育てるための下書きです。',
        '話せる事実、数字、背景、再現性の順で追記していく想定です。',
        '必要ならローカルのメモや文章を読み込んで整理できます。',
      ],
    };

    setDraftItems((current) => [nextItem, ...current]);
    setSelectedId(nextItem.id);
  }

  return (
    <div className="page-layout">
      <div className="toolbar-row">
        <div className="toolbar-actions">
          <button
            className="primary-button"
            onClick={addDraftItem}
            type="button"
          >
            ＋ 新しい項目
          </button>
          <input
            className="search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索"
            type="text"
            value={query}
          />
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

          {filteredItems.map((item) => (
            <button
              className={`table-row table-four knowledge-row-button ${
                selectedItem?.id === item.id ? 'active' : ''
              }`}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              type="button"
            >
              <strong>{item.title}</strong>
              <span className="tag-bubble">{item.tag}</span>
              <span>{item.updatedAt}</span>
              <span className="text-link">詳細</span>
            </button>
          ))}

          {filteredItems.length === 0 ? (
            <p className="helper-text">一致するナレッジ項目がありません。</p>
          ) : null}

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
            <h3>{selectedItem?.title ?? 'ナレッジを選択してください'}</h3>
            <p>{selectedItem?.tag ?? '概要'}</p>
          </div>
          <div className="detail-block">
            <ul className="bullet-text">
              {(selectedItem?.content ?? []).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="knowledge-tags">
            {selectedTags.map((tag) => (
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
