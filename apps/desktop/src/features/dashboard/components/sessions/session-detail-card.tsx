import { SessionRelationSelector } from '@/features/dashboard/components/sessions/session-relation-selector';
import type {
  PersonRecord,
  ProjectRecord,
  ReviewRecord,
  SessionRecord,
} from '@/features/dashboard/lib/workspace-types';

type SessionDetailCardProps = {
  people: PersonRecord[];
  projects: ProjectRecord[];
  reviews: ReviewRecord[];
  session: SessionRecord;
  tabs: readonly string[];
  onDelete: () => void;
  onPatch: <Key extends keyof SessionRecord>(
    key: Key,
    value: SessionRecord[Key],
  ) => void;
};

export function SessionDetailCard({
  people,
  projects,
  reviews,
  session,
  tabs,
  onDelete,
  onPatch,
}: SessionDetailCardProps) {
  return (
    <section className="soft-card detail-editor-card">
      <div className="detail-editor-head">
        <div>
          <h3>セッション詳細</h3>
          <p>一覧と同じデータを直接編集できます。</p>
        </div>
        <button className="outline-button" onClick={onDelete} type="button">
          削除
        </button>
      </div>

      <div className="detail-editor-grid">
        <label>
          <span>タイトル</span>
          <input
            value={session.title}
            onChange={(event) => onPatch('title', event.target.value)}
          />
        </label>
        <label>
          <span>日時表示</span>
          <input
            value={session.dateLabel}
            onChange={(event) => onPatch('dateLabel', event.target.value)}
          />
        </label>
        <label>
          <span>タイプ</span>
          <select
            value={session.type}
            onChange={(event) =>
              onPatch('type', event.target.value as SessionRecord['type'])
            }
          >
            {tabs.slice(1).map((tab) => (
              <option key={tab} value={tab}>
                {tab}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>ステータス</span>
          <select
            value={session.status}
            onChange={(event) =>
              onPatch('status', event.target.value as SessionRecord['status'])
            }
          >
            <option value="予定">予定</option>
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
          </select>
        </label>
        <label>
          <span>相手</span>
          <input
            value={session.partner}
            onChange={(event) => onPatch('partner', event.target.value)}
          />
        </label>
        <label>
          <span>場所</span>
          <input
            value={session.location}
            onChange={(event) => onPatch('location', event.target.value)}
          />
        </label>
        <label>
          <span>プラットフォーム</span>
          <input
            value={session.platform}
            onChange={(event) => onPatch('platform', event.target.value)}
          />
        </label>
        <label>
          <span>録画表示</span>
          <input
            value={session.recording}
            onChange={(event) => onPatch('recording', event.target.value)}
          />
        </label>
        <label>
          <span>関連レビュー</span>
          <select
            value={session.reviewId ?? ''}
            onChange={(event) =>
              onPatch(
                'reviewId',
                event.target.value.length > 0 ? event.target.value : undefined,
              )
            }
          >
            <option value="">未設定</option>
            {reviews.map((review) => (
              <option key={review.id} value={review.id}>
                {review.title}
              </option>
            ))}
          </select>
        </label>
        <div className="span-2">
          <SessionRelationSelector
            emptyText="まだ関連人物はありません。People から追加するとここで選べます。"
            helperText="このセッションで実際に関係する人物をチェックで選択します。"
            options={people.map((person) => ({
              id: person.id,
              label: person.name,
              description: person.role,
            }))}
            selectedIds={session.peopleIds}
            title="関連人物"
            onChange={(nextIds) => onPatch('peopleIds', nextIds)}
          />
        </div>
        <div className="span-2">
          <SessionRelationSelector
            emptyText="まだ関連プロジェクトはありません。Projects / Companies から追加するとここで選べます。"
            helperText="このセッションに紐づく企業・プロジェクトを選択します。"
            options={projects.map((project) => ({
              id: project.id,
              label: project.title,
              description: `${project.category} / ${project.subtitle}`,
            }))}
            selectedIds={session.projectIds}
            title="関連プロジェクト"
            onChange={(nextIds) => onPatch('projectIds', nextIds)}
          />
        </div>
        <label className="span-2">
          <span>メモ</span>
          <textarea
            rows={4}
            value={session.memo}
            onChange={(event) => onPatch('memo', event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
