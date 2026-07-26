import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  isImportableKnowledgeFile,
  MAX_IMPORT_FILE_SIZE,
  readFileText,
  stripExtension,
} from '@/features/dashboard/lib/file-import';
import { useAppStore } from '@/lib/state/app-store';
import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { invokeCommand } from '@/lib/tauri/commands';

export function useKnowledgeImport(onError: (message: string) => void) {
  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [knowledgeImportNotice, setKnowledgeImportNotice] = useState('');
  const syncImportedKnowledgeItems = useWorkspaceStore(
    (state) => state.syncImportedKnowledgeItems,
  );
  const removeKnowledgeItem = useWorkspaceStore(
    (state) => state.removeKnowledgeItem,
  );

  useEffect(() => {
    syncImportedKnowledgeItems(
      appState.importedDocuments.map((document) => ({
        documentId: document.id,
        source:
          document.sourceType === 'サンプル'
            ? 'imported-sample'
            : 'imported-file',
        title: document.title,
      })),
    );
  }, [appState.importedDocuments, syncImportedKnowledgeItems]);

  async function importLocalFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const importableFiles = files.filter(isImportableKnowledgeFile);

    if (files.length === 0) {
      return;
    }
    if (importableFiles.length === 0) {
      finishImport(event, '.md または .txt ファイルを選択してください。');
      return;
    }
    if (importableFiles.some((file) => file.size > MAX_IMPORT_FILE_SIZE)) {
      finishImport(event, '1ファイル 512KB 以内で追加してください。');
      return;
    }

    const documents = await Promise.all(
      importableFiles.map(async (file) => ({
        content: await readFileText(file),
        title: stripExtension(file.name),
      })),
    );

    try {
      const previousCount = appState.importedDocuments.length;
      const state = await invokeCommand('import_profile_documents_from_files', {
        documents,
      });
      setAppState(state);
      syncImportedKnowledgeItems(
        state.importedDocuments.map((document) => ({
          content: documents.find(
            (candidate) => candidate.title === document.title,
          )?.content,
          documentId: document.id,
          source: 'imported-file' as const,
          title: document.title,
        })),
      );
      setKnowledgeImportNotice(
        `${state.importedDocuments.length - previousCount}件のファイルを追加しました。`,
      );
    } catch {
      setKnowledgeImportNotice(
        'ファイルの読込に失敗しました。もう一度お試しください。',
      );
      onError('個人ナレッジを保存できませんでした。');
    }
    event.target.value = '';
  }

  async function importSampleKnowledge() {
    try {
      const state = await invokeCommand('import_profile_documents');
      setAppState(state);
      setKnowledgeImportNotice('サンプル個人ナレッジを読み込みました。');
    } catch {
      onError('サンプルナレッジを保存できませんでした。');
    }
  }

  async function removeProfileDocument(documentId: string) {
    try {
      const state = await invokeCommand('remove_profile_document', {
        documentId,
      });
      setAppState(state);
      const target = useWorkspaceStore
        .getState()
        .knowledgeItems.find((item) => item.sourceDocumentId === documentId);
      if (target) {
        removeKnowledgeItem(target.id);
      }
    } catch {
      onError('個人ナレッジを削除できませんでした。');
    }
  }

  async function clearProfileDocuments() {
    try {
      const state = await invokeCommand('clear_profile_documents');
      setAppState(state);
      for (const item of useWorkspaceStore
        .getState()
        .knowledgeItems.filter((entry) => entry.source !== 'manual')) {
        removeKnowledgeItem(item.id);
      }
      setKnowledgeImportNotice('追加済みの個人ナレッジを削除しました。');
    } catch {
      onError('個人ナレッジを一括削除できませんでした。');
    }
  }

  return {
    clearProfileDocuments,
    fileInputRef,
    importLocalFiles,
    importSampleKnowledge,
    knowledgeImportNotice,
    removeProfileDocument,
  };

  function finishImport(event: ChangeEvent<HTMLInputElement>, notice: string) {
    setKnowledgeImportNotice(notice);
    event.target.value = '';
  }
}
