import { peopleList } from '@/features/dashboard/lib/content';

export function PeoplePage() {
  return (
    <div className="page-layout">
      <div className="toolbar-row">
        <div className="tab-row">
          {[
            'すべて',
            '面談官・採用担当',
            '社員・先輩',
            'メンバー・同僚',
            'その他',
          ].map((tab, index) => (
            <button
              className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <input className="search-input" placeholder="検索" type="text" />
      </div>

      <div className="split-grid">
        <article className="soft-card">
          <ul className="people-list">
            {peopleList.map(([name, role], index) => (
              <li className={index === 0 ? 'active' : ''} key={name}>
                <div className="person-avatar" />
                <div>
                  <strong>{name}</strong>
                  <p>{role}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card">
          <div className="detail-header">
            <h3>田中 一郎</h3>
            <p>株式会社A 人事部 採用担当</p>
          </div>
          <div className="detail-block">
            <h4>メモ</h4>
            <ul className="bullet-text">
              <li>自己紹介の入りを丁寧に聞く</li>
              <li>学生時代の成果の再現性を重視</li>
              <li>チームでの役割や学びを重視</li>
            </ul>
          </div>
          <div className="detail-block">
            <h4>過去のセッション</h4>
            <div className="mini-history-card">
              <span>株式会社A カジュアル面談</span>
              <strong>2024/05/12</strong>
            </div>
            <div className="mini-history-card">
              <span>会社説明会</span>
              <strong>2024/04/20</strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
