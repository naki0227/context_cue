import { useEffect, useMemo, useState } from 'react';
import { ProjectDetailCard } from '@/features/dashboard/components/projects/project-detail-card';
import { ProjectListCard } from '@/features/dashboard/components/projects/project-list-card';
import { buildProjectLinkedSessions } from '@/features/dashboard/lib/workspace-relations';
import type {
  ProjectAction,
  ProjectRecord,
} from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = ['すべて', '企業', 'プロジェクト', '課題'] as const;

export function ProjectsPage() {
  const projects = useWorkspaceStore((state) => state.projects);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const addProject = useWorkspaceStore((state) => state.addProject);
  const updateProject = useWorkspaceStore((state) => state.updateProject);
  const updateProjectActions = useWorkspaceStore(
    (state) => state.updateProjectActions,
  );
  const updateSession = useWorkspaceStore((state) => state.updateSession);
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
  const linkedSessions = featuredProject
    ? buildProjectLinkedSessions(sessions, featuredProject.id)
    : [];

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

  function updateLinkedSessionIds(nextIds: string[]) {
    if (!featuredProject) {
      return;
    }

    for (const session of sessions) {
      const shouldLink = nextIds.includes(session.id);
      const isLinked = session.projectIds.includes(featuredProject.id);
      if (shouldLink === isLinked) {
        continue;
      }

      updateSession(session.id, {
        projectIds: shouldLink
          ? [...session.projectIds, featuredProject.id]
          : session.projectIds.filter((id) => id !== featuredProject.id),
      });
    }
  }

  return (
    <div className="page-layout projects-page-v2">
      <div className="sessions-hero">
        <h1>Projects / Companies</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
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

      <div className="toolbar-row sessions-tabs-row">
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
      </div>

      <div className="split-grid projects-grid-v2">
        <ProjectListCard
          projects={filteredProjects}
          selectedId={selectedId}
          sessions={sessions}
          onSelect={setSelectedId}
        />

        {featuredProject ? (
          <ProjectDetailCard
            linkedSessions={linkedSessions}
            project={featuredProject}
            sessions={sessions}
            tabs={tabs}
            onDelete={deleteProject}
            onChangeLinkedSessionIds={updateLinkedSessionIds}
            onPatch={patchProject}
            onUpdateActions={(actions: ProjectAction[]) =>
              updateProjectActions(featuredProject.id, actions)
            }
          />
        ) : null}
      </div>
    </div>
  );
}
