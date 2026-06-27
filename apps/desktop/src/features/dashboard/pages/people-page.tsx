import { useEffect, useMemo, useState } from 'react';
import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import { buildPersonSessionHistory } from '@/features/dashboard/lib/workspace-relations';
import type { PersonRecord } from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = [
  'すべて',
  '面談官・採用担当',
  '社員・先輩',
  'メンバー・同僚',
  'その他',
] as const;

export function PeoplePage() {
  const people = useWorkspaceStore((state) => state.people);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const addPerson = useWorkspaceStore((state) => state.addPerson);
  const updatePerson = useWorkspaceStore((state) => state.updatePerson);
  const removePerson = useWorkspaceStore((state) => state.removePerson);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(people[0]?.id ?? '');

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesTab =
        activeTab === 'すべて' || person.shortRole === activeTab;
      const normalizedQuery = query.trim().toLowerCase();
      const haystack =
        `${person.name} ${person.role} ${person.mail} ${person.memo.join(' ')}`.toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, people, query]);

  useEffect(() => {
    const fallbackId = filteredPeople[0]?.id ?? people[0]?.id ?? '';
    if (!people.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredPeople, people, selectedId]);

  const featuredPerson =
    people.find((person) => person.id === selectedId) ?? people[0] ?? null;
  const derivedHistory = featuredPerson
    ? buildPersonSessionHistory(sessions, featuredPerson.id)
    : [];
  const visibleHistory =
    derivedHistory.length > 0
      ? derivedHistory
      : (featuredPerson?.history ?? []);
  const lastContactLabel =
    visibleHistory[0]?.date ?? featuredPerson?.lastContactLabel ?? '未接触';

  function addPersonRecord() {
    const id = addPerson();
    setSelectedId(id);
  }

  function patchPerson<Key extends keyof PersonRecord>(
    key: Key,
    value: PersonRecord[Key],
  ) {
    if (!featuredPerson) {
      return;
    }

    updatePerson(featuredPerson.id, {
      [key]: value,
      updatedAt: new Date().toLocaleDateString('ja-JP'),
    });
  }

  function deletePerson() {
    if (!featuredPerson || !window.confirm('この人物を削除しますか？')) {
      return;
    }

    removePerson(featuredPerson.id);
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
            onClick={addPersonRecord}
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
                className={person.id === selectedId ? 'active' : ''}
                key={person.id}
              >
                <button onClick={() => setSelectedId(person.id)} type="button">
                  <div className="person-avatar person-avatar-v2" />
                  <div>
                    <strong>{person.name}</strong>
                    <p>{person.role}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </article>

        {featuredPerson ? (
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
                    </div>
                    <p className="people-role-text">{featuredPerson.role}</p>
                    <p className="people-contact-line">
                      ✉ {featuredPerson.mail}
                    </p>
                    <p className="people-contact-line">
                      ◷ 最終接触: {lastContactLabel}
                    </p>
                  </div>
                </div>
                <button
                  className="outline-button"
                  onClick={deletePerson}
                  type="button"
                >
                  削除
                </button>
              </div>
            </section>

            <div className="people-detail-grid">
              <section className="soft-card detail-editor-card">
                <h3>基本情報</h3>
                <div className="detail-editor-grid">
                  <label>
                    <span>名前</span>
                    <input
                      value={featuredPerson.name}
                      onChange={(event) =>
                        patchPerson('name', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>役割タグ</span>
                    <select
                      value={featuredPerson.shortRole}
                      onChange={(event) =>
                        patchPerson(
                          'shortRole',
                          event.target.value as PersonRecord['shortRole'],
                        )
                      }
                    >
                      {tabs.slice(1).map((tab) => (
                        <option key={tab} value={tab}>
                          {tab}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="span-2">
                    <span>役職・所属</span>
                    <input
                      value={featuredPerson.role}
                      onChange={(event) =>
                        patchPerson('role', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>メール</span>
                    <input
                      value={featuredPerson.mail}
                      onChange={(event) =>
                        patchPerson('mail', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>最終接触</span>
                    <input
                      value={featuredPerson.lastContactLabel}
                      onChange={(event) =>
                        patchPerson('lastContactLabel', event.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="soft-card detail-editor-card">
                <h3>プロフィールサマリー</h3>
                <textarea
                  rows={7}
                  value={linesToText(featuredPerson.profile)}
                  onChange={(event) =>
                    patchPerson('profile', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>次回に向けた質問・確認したいこと</h3>
                <textarea
                  rows={7}
                  value={linesToText(featuredPerson.checks)}
                  onChange={(event) =>
                    patchPerson('checks', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>メモ</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredPerson.memo)}
                  onChange={(event) =>
                    patchPerson('memo', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card people-history-card">
                <div className="section-head">
                  <h3>最近のセッション</h3>
                </div>
                <div className="people-history-list">
                  {visibleHistory.map((item) => (
                    <div className="people-history-row" key={item.id}>
                      <strong>{item.title}</strong>
                      <span className="session-pill tone-violet subtle-pill">
                        {item.type}
                      </span>
                      <span>{item.date}</span>
                      <span>{item.duration}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
