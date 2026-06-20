import { useMemo, useState } from 'react';
import { peopleList } from '@/features/dashboard/lib/content';

const tabs = [
  'すべて',
  '面談官・採用担当',
  '社員・先輩',
  'メンバー・同僚',
  'その他',
] as const;

const peopleSummaries: Record<
  string,
  {
    checks: string[];
    history: Array<[string, string, string, string]>;
    memo: string[];
    profile: string[];
  }
> = {
  '田中 一郎': {
    profile: [
      '株式会社Aの新卒採用を担当。理系採用の一次面談・最終面談を担当している。',
      '学生の価値観や志向性を重視したカルチャーフィットを大切にしており、研究内容やチームでの工夫、再現性のある取り組みを評価する傾向。',
    ],
    checks: [
      'チーム配属後のオンボーディングの進め方は？',
      '評価で特に重視する行動やアウトプットは？',
      '入社後に活躍している人の共通点は？',
      '御社でのキャリアパスの具体例について',
    ],
    memo: [
      '研究テーマに興味を持ってくれた。特に〇〇の部分を評価。',
      '「チームでの成果の再現性」を繰り返し確認された。',
      '逆質問で「若手の裁量」について聞くと良い反応。',
    ],
    history: [
      ['一次面談', '面談', '2024/05/12 14:00', '30分'],
      ['ES提出前相談', '面談', '2024/04/28 15:30', '30分'],
      ['インターン面談', '面談', '2024/03/15 16:00', '30分'],
    ],
  },
};

function fallbackSummary(name: string, role: string) {
  return {
    profile: [
      `${name} さんとの会話で役立つ背景情報をまとめるためのプロフィール下書きです。`,
      `${role} としての視点や関心ごとを会話後に蓄積していく前提です。`,
    ],
    checks: [
      '次回はどの論点を優先して確認するべきか？',
      '相手が重視していた判断基準は何か？',
      '前回の会話から続きで聞くべきことは何か？',
    ],
    memo: [
      '会話の印象や反応の良かった話題をここに残します。',
      '次回は相手の関心に合わせてエピソードの出し分けをすると良さそうです。',
    ],
    history: [['最近の接点', 'その他', '未記録', '---']],
  };
}

export function PeoplePage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState(peopleList[0]?.name ?? '');
  const [draftPeople, setDraftPeople] = useState(peopleList.slice(0, 0));
  const [extraChecks, setExtraChecks] = useState<Record<string, string[]>>({});

  const people = useMemo(() => [...draftPeople, ...peopleList], [draftPeople]);

  const filteredPeople = people.filter((person) => {
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
    people[0];
  const baseSummary =
    peopleSummaries[featuredPerson.name] ??
    fallbackSummary(featuredPerson.name, featuredPerson.role);
  const checks = [
    ...baseSummary.checks,
    ...(extraChecks[featuredPerson.name] ?? []),
  ];

  function addPerson() {
    const nextPerson = {
      name: `新しい人物 ${draftPeople.length + 1}`,
      role: '役職未設定',
      shortRole: 'その他',
      mail: `person-${draftPeople.length + 1}@local.example`,
      updatedAt: '今日',
    } as (typeof peopleList)[number];

    setDraftPeople((current) => [nextPerson, ...current]);
    setSelectedName(nextPerson.name);
  }

  function addCheckItem() {
    setExtraChecks((current) => ({
      ...current,
      [featuredPerson.name]: [
        ...(current[featuredPerson.name] ?? []),
        `追加メモ ${((current[featuredPerson.name] ?? []).length || 0) + 1}`,
      ],
    }));
  }

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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="検索（名前・役職・会社・メモ）"
              type="text"
              value={query}
            />
          </div>
          <button
            className="primary-button primary-button-v2"
            onClick={addPerson}
            type="button"
          >
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
          <button
            className="text-link people-more-link"
            onClick={() => {
              setActiveTab('すべて');
              setQuery('');
            }}
            type="button"
          >
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
              {baseSummary.profile.map((paragraph) => (
                <p className="people-summary-text" key={paragraph}>
                  {paragraph}
                </p>
              ))}
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
                {checks.map((item, index) => (
                  <li
                    className={
                      index === checks.length - 1 && index > 2 ? 'muted' : ''
                    }
                    key={item}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="text-link people-add-link"
                onClick={addCheckItem}
                type="button"
              >
                ＋ 項目を追加
              </button>
            </section>

            <section className="soft-card people-note-card">
              <h3>メモ</h3>
              <ul className="bullet-text">
                {baseSummary.memo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="people-note-updated">
                最終更新: {featuredPerson.updatedAt} 14:30
              </p>
            </section>

            <section className="soft-card people-history-card">
              <div className="section-head">
                <h3>最近のセッション</h3>
                <button className="text-link" type="button">
                  すべて見る
                </button>
              </div>
              <div className="people-history-list">
                {baseSummary.history.map(([title, type, date, duration]) => (
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
