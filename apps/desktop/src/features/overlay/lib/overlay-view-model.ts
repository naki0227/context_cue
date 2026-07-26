import { formatPreparedness } from '@/features/dashboard/lib/content';
import type { AppState } from '@/lib/schemas/app-state';

export function buildOverlayViewModel(appState: AppState) {
  const flowPoints = [
    appState.contextCue.intent,
    ...appState.rollingSummary.importantPoints,
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  return {
    confirmItems: appState.contextCue.questionsToAsk,
    flowPoints,
    memoItems: appState.contextCue.relatedNotes,
    nextTalkCandidates: appState.contextCue.suggestedPoints,
    overlayTopic:
      appState.contextCue.topic === 'まだ会話は始まっていません'
        ? '会話を待っています'
        : appState.contextCue.topic,
    preparedness: formatPreparedness(appState.importedDocuments.length),
    transcriptPreview: appState.transcript.slice(-4),
  };
}
