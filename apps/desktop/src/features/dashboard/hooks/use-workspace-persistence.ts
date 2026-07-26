import { useEffect, useRef, useState } from 'react';
import { workspaceSnapshotSchema } from '@/lib/schemas/workspace-state';
import {
  createWorkspaceSnapshot,
  useWorkspaceStore,
} from '@/lib/state/workspace-store';
import { invokeCommand } from '@/lib/tauri/commands';

const SAVE_DELAY_MS = 250;

type UseWorkspacePersistenceInput = {
  enabled: boolean;
  onError: (message: string) => void;
};

export function useWorkspacePersistence({
  enabled,
  onError,
}: UseWorkspacePersistenceInput) {
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replaceWorkspace = useWorkspaceStore((state) => state.replaceWorkspace);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    invokeCommand('get_workspace_state')
      .then((snapshot) => {
        replaceWorkspace(workspaceSnapshotSchema.parse(snapshot));
      })
      .catch(() => {
        onError(
          '保存データを読み込めませんでした。バックアップ復旧または再起動をお試しください。',
        );
      })
      .finally(() => setWorkspaceLoaded(true));
  }, [enabled, onError, replaceWorkspace]);

  useEffect(() => {
    if (!workspaceLoaded) {
      return;
    }

    const unsubscribe = useWorkspaceStore.subscribe((state) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(() => {
        const snapshot = createWorkspaceSnapshot(state);
        invokeCommand('save_workspace_state', {
          workspaceState: snapshot,
        }).catch(() => {
          onError(
            '変更を保存できませんでした。空き容量と保存先の権限を確認して再試行してください。',
          );
        });
      }, SAVE_DELAY_MS);
    });

    return () => {
      unsubscribe();
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [onError, workspaceLoaded]);
}
