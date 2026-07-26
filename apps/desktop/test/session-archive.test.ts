import { buildSessionArchive } from '@/features/dashboard/lib/session-archive';
import type { AppState } from '@/lib/schemas/app-state';

const completedState: AppState = {
  session: {
    status: 'running',
    shareSafeMode: false,
    sessionId: 'session-private-test',
    consentConfirmedAtUnixMs: Date.parse('2026-07-26T09:00:00.000Z'),
  },
  connections: { ollamaReady: true, sttReady: true },
  adaptiveInference: { mode: 'deep', questionScore: 0.8 },
  rollingSummary: {
    currentTopic: '機密会議の次アクション確認',
    importantPoints: ['機密の重要ポイント'],
    openQuestions: ['機密の未解決事項'],
  },
  contextCue: {
    topic: '機密の話題',
    intent: '機密の意図',
    relatedNotes: ['機密の関連メモ'],
    suggestedPoints: ['機密の提案'],
    questionsToAsk: ['機密の質問'],
    caution: '機密の注意',
  },
  transcript: [{ id: 'chunk-1', source: 'マイク', text: '保存対象の機密発言' }],
  importedDocuments: [],
};

describe('session archive', () => {
  it('keeps conversation content out when every save option is disabled', () => {
    const archive = buildSessionArchive({
      appState: completedState,
      completedAt: new Date('2026-07-26T09:30:00.000Z'),
      savePreferences: {
        transcript: false,
        summary: false,
        aiOutput: false,
      },
    });

    expect(archive.review).toBeNull();
    expect(archive.session.reviewId).toBeUndefined();
    expect(archive.session.recording).toBe('本文非保存');
    expect(archive.session.type).toBe('その他');
    expect(archive.session.title).toBe('2026/7/26の会話');
    expect(JSON.stringify(archive.session)).not.toContain('機密');
  });

  it('stores only the explicitly enabled content categories', () => {
    const archive = buildSessionArchive({
      appState: completedState,
      completedAt: new Date('2026-07-26T09:30:00.000Z'),
      savePreferences: {
        transcript: true,
        summary: true,
        aiOutput: false,
      },
    });

    expect(archive.review?.transcript).toEqual(['マイク: 保存対象の機密発言']);
    expect(archive.review?.summary).toContain('機密の重要ポイント');
    expect(archive.review?.insights).toEqual([]);
    expect(archive.review?.memo).toEqual([]);
    expect(archive.session.durationMinutes).toBe(30);
  });
});
