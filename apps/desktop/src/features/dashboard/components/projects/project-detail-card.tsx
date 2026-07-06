import {
  linesToText,
  parseNumber,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type {
  ProjectAction,
  ProjectLinkedSession,
  ProjectRecord,
} from '@/features/dashboard/lib/workspace-types';

type ProjectDetailCardProps = {
  linkedSessions: ProjectLinkedSession[];
  project: ProjectRecord;
  tabs: readonly string[];
  onDelete: () => void;
  onPatch: <Key extends keyof ProjectRecord>(
    key: Key,
    value: ProjectRecord[Key],
  ) => void;
  onUpdateActions: (actions: ProjectAction[]) => void;
};

function actionsToText(actions: ProjectAction[]) {
  return actions
    .map((item) => `${item.title} | ${item.dueDate} | ${item.priority}`)
    .join('\n');
}

function textToActions(value: string): ProjectAction[] {
  return value
    .split('\n')
    .map((line, index) => {
      const [title = '', dueDate = '', priority = '低'] = line
        .split('|')
        .map((item) => item.trim());
      if (!title) {
        return null;
      }

      return {
        id: `project-action-${index}-${title}`,
        title,
        dueDate,
        priority: priority === '高' || priority === '中' ? priority : '低',
      } satisfies ProjectAction;
    })
    .filter((item): item is ProjectAction => Boolean(item));
}

export function ProjectDetailCard({
  linkedSessions,
  project,
  tabs,
  onDelete,
  onPatch,
  onUpdateActions,
}: ProjectDetailCardProps) {
  return (
    <article className="projects-detail-stack">
      <section className="soft-card projects-profile-card">
        <div className="projects-profile-top">
          <div className={`project-avatar icon-${project.icon} large`} />
          <div className="projects-profile-copy">
            <div className="project-title-row">
              <h2>{project.title}</h2>
              <span className={`session-pill tone-${project.tone}`}>
                {project.category}
              </span>
            </div>
            <p className="projects-role-text">{project.subtitle}</p>
            <div className="project-meta-pills">
              <span>最終更新: {project.updatedAt}</span>
              <span>関連セッション {linkedSessions.length}</span>
              <span>課題 {project.issues}</span>
            </div>
          </div>
          <button className="outline-button" onClick={onDelete} type="button">
            削除
          </button>
        </div>
      </section>

      <div className="projects-detail-grid">
        <section className="soft-card detail-editor-card">
          <h3>基本情報</h3>
          <div className="detail-editor-grid">
            <label>
              <span>タイトル</span>
              <input
                value={project.title}
                onChange={(event) => onPatch('title', event.target.value)}
              />
            </label>
            <label>
              <span>カテゴリ</span>
              <select
                value={project.category}
                onChange={(event) =>
                  onPatch(
                    'category',
                    event.target.value as ProjectRecord['category'],
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
              <span>サブタイトル</span>
              <input
                value={project.subtitle}
                onChange={(event) => onPatch('subtitle', event.target.value)}
              />
            </label>
            <label>
              <span>進捗</span>
              <input
                type="number"
                value={project.progress}
                onChange={(event) =>
                  onPatch('progress', parseNumber(event.target.value))
                }
              />
            </label>
            <label>
              <span>課題数</span>
              <input
                type="number"
                value={project.issues}
                onChange={(event) =>
                  onPatch('issues', parseNumber(event.target.value))
                }
              />
            </label>
          </div>
        </section>

        <section className="soft-card detail-editor-card">
          <h3>概要</h3>
          <textarea
            rows={6}
            value={project.overview}
            onChange={(event) => onPatch('overview', event.target.value)}
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>重要なポイント</h3>
          <textarea
            rows={7}
            value={linesToText(project.points)}
            onChange={(event) =>
              onPatch('points', textToLines(event.target.value))
            }
          />
        </section>

        <section className="soft-card projects-sessions-card">
          <div className="section-head">
            <h3>関連セッション</h3>
            <span>{linkedSessions.length}件</span>
          </div>
          <div className="projects-linked-list">
            {linkedSessions.length === 0 ? (
              <p className="helper-text">
                まだ関連セッションはありません。Sessions
                側で紐付けるとここに反映されます。
              </p>
            ) : (
              linkedSessions.map((session) => (
                <div className="projects-linked-row" key={session.id}>
                  <strong>{session.title}</strong>
                  <span className="session-pill tone-violet subtle-pill">
                    {session.type}
                  </span>
                  <span>{session.date}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="soft-card detail-editor-card">
          <h3>今後のアクション</h3>
          <textarea
            rows={7}
            value={actionsToText(project.actions)}
            onChange={(event) =>
              onUpdateActions(textToActions(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>あなたとのつながり</h3>
          <textarea
            rows={6}
            value={linesToText(project.connections)}
            onChange={(event) =>
              onPatch('connections', textToLines(event.target.value))
            }
          />
        </section>
      </div>
    </article>
  );
}
