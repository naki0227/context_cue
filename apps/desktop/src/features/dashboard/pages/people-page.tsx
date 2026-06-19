import { useState } from 'react';
import { peopleList } from '@/features/dashboard/lib/content';

export function PeoplePage() {
  const tabs = [
    'すべて',
    '面談官・採用担当',
    '社員・先輩',
    'メンバー・同僚',
    'その他',
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState(peopleList[0]?.name ?? '');

  const filteredPeople = peopleList.filter((person) => {
    const matchesTab = activeTab === 'すべて' || person.shortRole === activeTab;
    const normalizedQuery = query.trim().toLowerCase();
    const haystack =
      `${person.name} ${person.role} ${person.mail}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesTab && matchesQuery;
  });

  const featuredPerson =
    filteredPeople.find((person) => person.name === selectedName) ??
    filteredPeople[0] ??
    peopleList[0];

  return (
    <div className="page-layout people-page-v2">
      <div className="sessions-hero">
        <h1>People</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="tab-row people-tab-row">
            {tabs.map((tab) => (
              <button
                className={`toolbar-tab sessions-tab ${activeTab === tab ? 'active' : ''}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-shell people-search-shell">
            <span className="search-shell-icon" />
            <input
              className="search-input search-input-v2"
              placeholder="検索（名前・役職・会社・メモ）"
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              value={query}
            />
          </div>
          <button className="primary-button primary-button-v2" type="button">
            ＋ 新しい人物を追加
          </button>
        </div>
      </div>

      <div className="split-grid people-grid-v2">
        <article className="soft-card people-list-card-v2">
          <ul className="people-list people-list-v2">
            {filteredPeople.map((person) => (
              <li
                className={person.name === featuredPerson.name ? 'active' : ''}
                key={person.name}
              >
                <button
                  onClick={() => setSelectedName(person.name)}
                  type="button"
                >
                  <div className="person-avatar person-avatar-v2" />
                  <div>
                    <strong>{person.name}</strong>
                    <p>{person.role}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <button className="text-link people-more-link" type="button">
            すべての人物を見る
          </button>
        </article>

        <article className="people-detail-stack">
          <section className="soft-card people-profile-card">
            <div className="people-profile-top">
              <div className="people-profile-main">
                <div className="person-avatar person-avatar-v2 person-avatar-large" />
                <div>
                  <div className="people-name-row">
                    <h2>{featuredPerson.name}</h2>
                    <span className="session-pill tone-blue">
                      {featuredPerson.shortRole}
                    </span>
                    <span className="people-favorite-star">☆</span>
                  </div>
                  <p className="people-role-text">{featuredPerson.role}</p>
                  <p className="people-contact-line">✉ {featuredPerson.mail}</p>
                  <p className="people-contact-line">
                    ◷ 最終接触: {featuredPerson.updatedAt}（面談）
                  </p>
                </div>
              </div>
              <button className="outline-button" type="button">
                編集
              </button>
            </div>
          </section>

          <div className="people-detail-grid">
            <section className="soft-card people-info-card">
              <h3>プロフィールサマリー</h3>
              <p className="people-summary-text">
                株式会社Aの新卒採用を担当。理系採用の一次面談・最終面談を担当している。
              </p>
              <p className="people-summary-text">
                学生の価値観や志向性を重視したカルチャーフィットを大切にしており、研究内容やチームでの工夫、
                再現性のある取り組みを評価する傾向。
              </p>
              <ul className="people-bullet-list">
                <li>担当: 一次面談 / 最終面談</li>
                <li>採用領域: エンジニア職（新卒）</li>
                <li>拠点: 東京本社</li>
                <li>特徴: 論理的な会話を好む / 学生の深掘りに強い</li>
              </ul>
            </section>

            <section className="soft-card people-check-card">
              <h3>次回に向けた質問・確認したいこと</h3>
              <ul className="people-check-list">
                <li>チーム配属後のオンボーディングの進め方は？</li>
                <li>評価で特に重視する行動やアウトプットは？</li>
                <li>入社後に活躍している人の共通点は？</li>
                <li className="muted">御社でのキャリアパスの具体例について</li>
              </ul>
              <button className="text-link people-add-link" type="button">
                ＋ 項目を追加
              </button>
            </section>

            <section className="soft-card people-note-card">
              <h3>メモ</h3>
              <ul className="bullet-text">
                <li>研究テーマに興味を持ってくれた。特に〇〇の部分を評価。</li>
                <li>「チームでの成果の再現性」を繰り返し確認された。</li>
                <li>逆質問で「若手の裁量」について聞くと良い反応。</li>
              </ul>
              <p className="people-note-updated">最終更新: 2024/05/12 14:30</p>
            </section>

            <section className="soft-card people-history-card">
              <div className="section-head">
                <h3>最近のセッション</h3>
                <button className="text-link" type="button">
                  すべて見る
                </button>
              </div>
              <div className="people-history-list">
                {[
                  ['一次面談', '面談', '2024/05/12 14:00', '30分'],
                  ['ES提出前相談', '面談', '2024/04/28 15:30', '30分'],
                  ['インターン面談', '面談', '2024/03/15 16:00', '30分'],
                ].map(([title, type, date, duration]) => (
                  <div className="people-history-row" key={`${title}-${date}`}>
                    <strong>{title}</strong>
                    <span className="session-pill tone-violet subtle-pill">
                      {type}
                    </span>
                    <span>{date}</span>
                    <span>{duration}</span>
                  </div>
                ))}
              </div>
              <button className="text-link people-more-link" type="button">
                すべてのセッションを見る
              </button>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
