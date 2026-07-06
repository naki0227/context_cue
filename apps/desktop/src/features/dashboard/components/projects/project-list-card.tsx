import { buildProjectLinkedSessions } from '@/features/dashboard/lib/workspace-relations';
import type {
  ProjectRecord,
  SessionRecord,
} from '@/features/dashboard/lib/workspace-types';

type ProjectListCardProps = {
  projects: ProjectRecord[];
  selectedId: string;
  sessions: SessionRecord[];
  onSelect: (id: string) => void;
};

export function ProjectListCard({
  projects,
  selectedId,
  sessions,
  onSelect,
}: ProjectListCardProps) {
  return (
    <article className="soft-card projects-list-card">
      {projects.map((project) => (
        <button
          className={`project-line project-line-v2 ${project.id === selectedId ? 'active' : ''}`}
          key={project.id}
          onClick={() => onSelect(project.id)}
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
              <span>
                関連セッション{' '}
                {buildProjectLinkedSessions(sessions, project.id).length}
              </span>
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
  );
}
