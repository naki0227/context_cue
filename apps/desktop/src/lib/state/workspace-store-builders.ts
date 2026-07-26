import { buildImportedKnowledgeContent } from '@/features/dashboard/lib/workspace-seed';
import type {
  KnowledgeRecord,
  PersonRecord,
  ProjectRecord,
  ReviewRecord,
  SessionRecord,
  TemplateRecord,
} from '@/features/dashboard/lib/workspace-types';
import type { ImportedKnowledgeInput } from '@/lib/state/workspace-store-types';

export function stampNow() {
  return new Date().toLocaleDateString('ja-JP');
}

export function createSessionRecord(
  item: Partial<SessionRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `session-${crypto.randomUUID()}`,
    title: item?.title ?? `新しいセッション ${count + 1}`,
    type: item?.type ?? '面談',
    typeTone: item?.typeTone ?? 'green',
    dateLabel: item?.dateLabel ?? '未設定',
    startAt: item?.startAt ?? new Date().toISOString(),
    partner: item?.partner ?? '相手未設定',
    location: item?.location ?? 'オンライン',
    platform: item?.platform ?? 'オンライン',
    durationMinutes: item?.durationMinutes ?? 30,
    peopleIds: item?.peopleIds ?? [],
    projectIds: item?.projectIds ?? [],
    recording: item?.recording ?? '',
    recordingTone: item?.recordingTone ?? 'neutral',
    reviewId: item?.reviewId,
    status: item?.status ?? '予定',
    statusTone: item?.statusTone ?? 'blue',
    memo: item?.memo ?? '会話の目的と確認したいことをここに整理します。',
  } satisfies SessionRecord;
}

export function createPersonRecord(
  item: Partial<PersonRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `person-${crypto.randomUUID()}`,
    name: item?.name ?? `新しい人物 ${count + 1}`,
    role: item?.role ?? '役職未設定',
    shortRole: item?.shortRole ?? 'その他',
    mail: item?.mail ?? `person-${count + 1}@local.example`,
    updatedAt: item?.updatedAt ?? stampNow(),
    lastContactLabel: item?.lastContactLabel ?? '未接触',
    profile: item?.profile ?? ['プロフィールをここに入力してください。'],
    checks: item?.checks ?? ['次回確認したいことを追加してください。'],
    memo: item?.memo ?? ['印象や注意点をここに残します。'],
    history: item?.history ?? [],
  } satisfies PersonRecord;
}

export function createProjectRecord(
  item: Partial<ProjectRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `project-${crypto.randomUUID()}`,
    title: item?.title ?? `新しいプロジェクト ${count + 1}`,
    category: item?.category ?? 'プロジェクト',
    subtitle: item?.subtitle ?? '概要未設定',
    progress: item?.progress ?? 10,
    sessions: item?.sessions ?? 0,
    issues: item?.issues ?? 0,
    updatedAt: item?.updatedAt ?? '今',
    tone: item?.tone ?? 'green',
    icon: item?.icon ?? 'chart',
    statusLabel: item?.statusLabel ?? '進行中',
    overview: item?.overview ?? '概要を入力してください。',
    linkedSessions: item?.linkedSessions ?? [],
    points: item?.points ?? ['重要なポイントを追加してください。'],
    actions: item?.actions ?? [],
    connections: item?.connections ?? ['担当者や関係性を追加してください。'],
  } satisfies ProjectRecord;
}

export function createReviewRecord(
  item: Partial<ReviewRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `review-${crypto.randomUUID()}`,
    title: item?.title ?? `新しい振り返り ${count + 1}`,
    date: item?.date ?? stampNow(),
    meta: item?.meta ?? '未設定 / 30分 / ローカル',
    type: item?.type ?? 'その他',
    summary: item?.summary ?? ['良かった点を追加してください。'],
    transcript: item?.transcript ?? ['トランスクリプトを追加してください。'],
    insights: item?.insights ?? ['気づきや背景を追加してください。'],
    improvements: item?.improvements ?? ['改善点を追加してください。'],
    memo: item?.memo ?? ['次回に向けたメモを追加してください。'],
    actions: item?.actions ?? [],
  } satisfies ReviewRecord;
}

export function createKnowledgeRecord(
  item: Partial<KnowledgeRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `knowledge-${crypto.randomUUID()}`,
    title: item?.title ?? `新しいナレッジ ${count + 1}`,
    tag: item?.tag ?? '下書き',
    updatedAt: item?.updatedAt ?? stampNow(),
    source: item?.source ?? 'manual',
    sourceDocumentId: item?.sourceDocumentId,
    sourceLabel: item?.sourceLabel ?? '本人入力',
    confidence: item?.confidence ?? '未確認',
    sensitivity: item?.sensitivity ?? '個人',
    content: item?.content ?? ['内容を入力してください。'],
  } satisfies KnowledgeRecord;
}

export function createTemplateRecord(
  item: Partial<TemplateRecord> | undefined,
  count: number,
) {
  return {
    id: item?.id ?? `template-${crypto.randomUUID()}`,
    title: item?.title ?? `新しいテンプレート ${count + 1}`,
    description: item?.description ?? 'テンプレートの説明を入力してください。',
    tag: item?.tag ?? 'その他',
    icon: item?.icon ?? 'doc',
    tone: item?.tone ?? 'blue',
    updatedAt: item?.updatedAt ?? stampNow(),
    body: item?.body ?? ['テンプレート本文を入力してください。'],
  } satisfies TemplateRecord;
}

export function buildImportedKnowledgeRecords(
  items: ImportedKnowledgeInput[],
  existingItems: KnowledgeRecord[],
) {
  const importedIds = new Set(items.map((item) => item.documentId));
  const preservedManualItems = existingItems.filter(
    (item) =>
      item.source === 'manual' ||
      (item.sourceDocumentId &&
        item.source === 'imported-file' &&
        importedIds.has(item.sourceDocumentId)) ||
      (item.sourceDocumentId &&
        item.source === 'imported-sample' &&
        importedIds.has(item.sourceDocumentId)),
  );

  const mappedImportedItems = items.map((item) => {
    const existing = existingItems.find(
      (current) => current.sourceDocumentId === item.documentId,
    );

    return {
      id: existing?.id ?? `knowledge-import-${item.documentId}`,
      sourceDocumentId: item.documentId,
      title: item.title,
      tag: item.source === 'imported-sample' ? 'サンプル' : 'ローカルファイル',
      updatedAt: stampNow(),
      source: item.source,
      sourceLabel: existing?.sourceLabel ?? item.title,
      confidence: existing?.confidence ?? '未確認',
      sensitivity: existing?.sensitivity ?? '個人',
      content:
        item.content || !existing
          ? buildImportedKnowledgeContent(item.title, item.content)
          : existing.content,
    } satisfies KnowledgeRecord;
  });

  const manualOnlyItems = preservedManualItems.filter(
    (item) => item.source === 'manual',
  );

  return [...mappedImportedItems, ...manualOnlyItems];
}
