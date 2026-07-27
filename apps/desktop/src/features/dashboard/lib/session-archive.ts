import type {
  ReviewRecord,
  SessionRecord,
  SessionTone,
  SessionType,
} from '@/features/dashboard/lib/workspace-types';
import type { AppState } from '@/lib/schemas/app-state';
import type { SavePreferences } from '@/lib/state/app-store';

export type SessionArchive = {
  review: ReviewRecord | null;
  session: SessionRecord;
};

type BuildSessionArchiveInput = {
  appState: AppState;
  completedAt?: Date;
  savePreferences: SavePreferences;
};

export function buildSessionArchive({
  appState,
  completedAt = new Date(),
  savePreferences,
}: BuildSessionArchiveInput): SessionArchive {
  const sessionId = appState.session.sessionId ?? crypto.randomUUID();
  const startedAt = new Date(
    appState.session.consentConfirmedAtUnixMs ?? completedAt.getTime(),
  );
  const savesConversationContent = shouldCreateReview(savePreferences);
  const type = savesConversationContent
    ? inferSessionType(appState.rollingSummary.currentTopic)
    : 'その他';
  const reviewId = savesConversationContent ? `review-${sessionId}` : undefined;
  const title = savesConversationContent
    ? buildTitle(appState, completedAt)
    : `${completedAt.toLocaleDateString('ja-JP')}の会話`;
  const savedKinds = selectedSaveKinds(savePreferences);

  const session: SessionRecord = {
    id: sessionId,
    title,
    type,
    typeTone: toneForType(type),
    dateLabel: completedAt.toLocaleDateString('ja-JP'),
    startAt: startedAt.toISOString(),
    partner: '相手未設定',
    location: 'ローカルセッション',
    platform: 'How to Talk',
    durationMinutes: Math.max(
      1,
      Math.round((completedAt.getTime() - startedAt.getTime()) / 60_000),
    ),
    peopleIds: [],
    projectIds: [],
    recording: savePreferences.transcript ? '文字起こし保存済み' : '本文非保存',
    recordingTone: savePreferences.transcript ? 'green' : 'neutral',
    reviewId,
    status: '完了',
    statusTone: 'green',
    memo:
      savedKinds.length > 0
        ? `${savedKinds.join('・')}を保存`
        : '保存ポリシーにより会話本文は保存していません。',
  };

  return {
    session,
    review: reviewId
      ? buildReview(reviewId, session, appState, savePreferences, completedAt)
      : null,
  };
}

function buildReview(
  id: string,
  session: SessionRecord,
  appState: AppState,
  preferences: SavePreferences,
  completedAt: Date,
): ReviewRecord {
  const summary = preferences.summary
    ? [
        appState.rollingSummary.currentTopic,
        ...appState.rollingSummary.importantPoints,
      ].filter(Boolean)
    : [];
  const transcript = preferences.transcript
    ? appState.transcript.map((chunk) => `${chunk.source}: ${chunk.text}`)
    : [];
  const insights = preferences.aiOutput
    ? [
        ...appState.contextCue.relatedNotes,
        ...appState.contextCue.suggestedPoints,
      ]
    : [];

  return {
    id,
    title: session.title,
    date: completedAt.toLocaleDateString('ja-JP'),
    meta: `${session.durationMinutes}分 / ${session.platform}`,
    type: session.type === '授業' ? 'その他' : session.type,
    summary,
    transcript,
    insights,
    improvements: preferences.aiOutput
      ? appState.contextCue.questionsToAsk
      : [],
    memo:
      preferences.aiOutput && appState.contextCue.caution
        ? [appState.contextCue.caution]
        : [],
    actions: [],
  };
}

function buildTitle(appState: AppState, completedAt: Date) {
  const topic = appState.rollingSummary.currentTopic.trim();
  if (topic && topic !== 'セッション開始を待っています') {
    return topic;
  }
  return `${completedAt.toLocaleDateString('ja-JP')}の会話`;
}

function inferSessionType(topic: string): SessionType {
  const candidates: SessionType[] = [
    '面接',
    '面談',
    '会議',
    'GD',
    '1on1',
    '授業',
  ];
  return candidates.find((candidate) => topic.includes(candidate)) ?? 'その他';
}

function toneForType(type: SessionType): SessionTone {
  const tones: Record<SessionType, SessionTone> = {
    面接: 'orange',
    面談: 'green',
    会議: 'blue',
    GD: 'violet',
    '1on1': 'gold',
    授業: 'violet',
    その他: 'gray',
  };
  return tones[type];
}

function shouldCreateReview(preferences: SavePreferences) {
  return preferences.transcript || preferences.summary || preferences.aiOutput;
}

function selectedSaveKinds(preferences: SavePreferences) {
  return [
    preferences.transcript ? '文字起こし' : '',
    preferences.summary ? '要約' : '',
    preferences.aiOutput ? 'AI出力' : '',
  ].filter(Boolean);
}
