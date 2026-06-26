import { useEffect, useMemo, useState } from 'react';
import {
  linesToText,
  parseNumber,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type {
  ProjectAction,
  ProjectRecord,
} from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = ['すべて', '企業', 'プロジェクト', '課題'] as const;

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

export function ProjectsPage() {
  const projects = useWorkspaceStore((state) => state.projects);
  const addProject = useWorkspaceStore((state) => state.addProject);
  const updateProject = useWorkspaceStore((state) => state.updateProject);
  const updateProjectActions = useWorkspaceStore(
    (state) => state.updateProjectActions,
  );
  const removeProject = useWorkspaceStore((state) => state.removeProject);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesTab =
        activeTab === 'すべて' ||
        project.category === activeTab ||
        (activeTab === '課題' && project.issues > 0);
      const normalizedQuery = query.trim().toLowerCase();
      const haystack =
        `${project.title} ${project.subtitle} ${project.overview}`.toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, projects, query]);

  useEffect(() => {
    const fallbackId = filteredProjects[0]?.id ?? projects[0]?.id ?? '';
    if (!projects.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredProjects, projects, selectedId]);

  const featuredProject =
    projects.find((project) => project.id === selectedId) ??
    projects[0] ??
    null;

  function addProjectRecord() {
    const id = addProject();
    setSelectedId(id);
  }

  function patchProject<Key extends keyof ProjectRecord>(
    key: Key,
    value: ProjectRecord[Key],
  ) {
    if (!featuredProject) {
      return;
    }

    updateProject(featuredProject.id, { [key]: value });
  }

  function deleteProject() {
    if (
      !featuredProject ||
      !window.confirm('この企業 / プロジェクトを削除しますか？')
    ) {
      return;
    }

    removeProject(featuredProject.id);
  }

  return (
    <div className="page-layout projects-page-v2">
      <div className="sessions-hero">
        <h1>Projects / Companies</h1>
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
          <div className="search-shell projects-search-shell">
            <span className="search-shell-icon" />
            <input
              className="search-input search-input-v2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="検索"
              type="text"
              value={query}
            />
          </div>
          <div className="view-switch">
            <button
              className={`view-switch-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              ▦
            </button>
            <button
              className={`view-switch-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              ☰
            </button>
          </div>
          <button
            className="primary-button primary-button-v2"
            onClick={addProjectRecord}
            type="button"
          >
            ＋ 新しい企業 / プロジェクト
          </button>
        </div>
      </div>

      <div className="split-grid projects-grid-v2">
        <article className="soft-card projects-list-card">
          {filteredProjects.map((project) => (
            <button
              className={`project-line project-line-v2 ${project.id === selectedId ? 'active' : ''}`}
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              type="button"
            >
              <div className={`project-avatar icon-${project.icon}`} />
              <div className="project-main-copy">
                <div className="project-title-row">
                  <strong>{project.title}</strong>
                  <span className={`session-pill tone-${project.tone}`}>
                    {project.category}
                  </span>
                </div>
                <p>{project.subtitle}</p>
                <div className="project-meta-chips">
                  <span>関連セッション {project.sessions}</span>
                  <span>課題 {project.issues}</span>
                </div>
              </div>
              <div className="progress-box progress-box-v2">
                <span>{project.progress}%</span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p>最終更新: {project.updatedAt}</p>
              </div>
            </button>
          ))}
        </article>

        {featuredProject ? (
          <article className="projects-detail-stack">
            <section className="soft-card projects-profile-card">
              <div className="projects-profile-top">
                <div
                  className={`project-avatar icon-${featuredProject.icon} large`}
                />
                <div className="projects-profile-copy">
                  <div className="project-title-row">
                    <h2>{featuredProject.title}</h2>
                    <span
                      className={`session-pill tone-${featuredProject.tone}`}
                    >
                      {featuredProject.category}
                    </span>
                  </div>
                  <p className="projects-role-text">
                    {featuredProject.subtitle}
                  </p>
                  <div className="project-meta-pills">
                    <span>最終更新: {featuredProject.updatedAt}</span>
                    <span>関連セッション {featuredProject.sessions}</span>
                    <span>課題 {featuredProject.issues}</span>
                  </div>
                </div>
                <button
                  className="outline-button"
                  onClick={deleteProject}
                  type="button"
                >
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
                      value={featuredProject.title}
                      onChange={(event) =>
                        patchProject('title', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>カテゴリ</span>
                    <select
                      value={featuredProject.category}
                      onChange={(event) =>
                        patchProject(
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
                      value={featuredProject.subtitle}
                      onChange={(event) =>
                        patchProject('subtitle', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>進捗</span>
                    <input
                      type="number"
                      value={featuredProject.progress}
                      onChange={(event) =>
                        patchProject(
                          'progress',
                          parseNumber(event.target.value),
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>課題数</span>
                    <input
                      type="number"
                      value={featuredProject.issues}
                      onChange={(event) =>
                        patchProject('issues', parseNumber(event.target.value))
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="soft-card detail-editor-card">
                <h3>概要</h3>
                <textarea
                  rows={6}
                  value={featuredProject.overview}
                  onChange={(event) =>
                    patchProject('overview', event.target.value)
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>重要なポイント</h3>
                <textarea
                  rows={7}
                  value={linesToText(featuredProject.points)}
                  onChange={(event) =>
                    patchProject('points', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>今後のアクション</h3>
                <textarea
                  rows={7}
                  value={actionsToText(featuredProject.actions)}
                  onChange={(event) =>
                    updateProjectActions(
                      featuredProject.id,
                      textToActions(event.target.value),
                    )
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>あなたとのつながり</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredProject.connections)}
                  onChange={(event) =>
                    patchProject('connections', textToLines(event.target.value))
                  }
                />
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
