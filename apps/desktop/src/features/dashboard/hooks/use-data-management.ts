import { save } from '@tauri-apps/plugin-dialog';
import { useState } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { createEmptyWorkspace } from '@/lib/state/workspace-defaults';
import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { deleteAllData, exportWorkspace } from '@/lib/tauri/commands';

export function useDataManagement(onError: (message: string) => void) {
  const [dataActionNotice, setDataActionNotice] = useState('');
  const setAppState = useAppStore((state) => state.setAppState);
  const resetPreferences = useAppStore((state) => state.resetPreferences);
  const replaceWorkspace = useWorkspaceStore((state) => state.replaceWorkspace);

  async function exportAllData() {
    try {
      const destination = await save({
        defaultPath: `how-to-talk-export-${formatDate(new Date())}.json`,
        filters: [{ name: 'How to Talk data', extensions: ['json'] }],
      });
      if (!destination) {
        return;
      }
      await exportWorkspace(destination);
      setDataActionNotice('すべてのローカルデータを書き出しました。');
    } catch {
      onError('データを書き出せませんでした。保存先の権限を確認してください。');
    }
  }

  async function deleteAllLocalData() {
    const confirmed = window.confirm(
      'セッション、人物、プロジェクト、ナレッジ、設定、バックアップを完全に削除します。この操作は取り消せません。',
    );
    if (!confirmed) {
      return;
    }

    try {
      const state = await deleteAllData();
      replaceWorkspace(createEmptyWorkspace());
      setAppState(state);
      resetPreferences();
      await useAppStore.persist.clearStorage();
      setDataActionNotice('すべてのローカルデータを削除しました。');
    } catch {
      onError(
        'データを完全に削除できませんでした。アプリを再起動して再試行してください。',
      );
    }
  }

  return {
    dataActionNotice,
    deleteAllLocalData,
    exportAllData,
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
