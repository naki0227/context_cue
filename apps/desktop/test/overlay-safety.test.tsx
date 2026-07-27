import { render, screen } from '@testing-library/react';
import { OverlayPrivacyShield } from '@/features/overlay/components/overlay-privacy-shield';
import { SideOverlayWindow } from '@/features/overlay/components/side-overlay-window';
import { useAppStore } from '@/lib/state/app-store';

const preferences = useAppStore.getState().overlayPreferences;

describe('overlay safety', () => {
  it('does not persist consent checkbox values', () => {
    const partialize = useAppStore.persist.getOptions().partialize;
    const persisted = partialize?.(useAppStore.getState());

    expect(persisted).not.toHaveProperty('consent');
    expect(persisted).not.toHaveProperty('appState');
  });

  it('does not render a fictional transcript in the empty state', () => {
    render(
      <SideOverlayWindow
        listeningBarIds={[]}
        memoItems={[]}
        overlayPreferences={preferences}
        transcriptPreview={[]}
      />,
    );

    expect(screen.getByText(/ここに文字起こしが表示されます/)).toBeVisible();
    expect(screen.queryByText(/学生時代に力を入れたこと/)).toBeNull();
    expect(screen.queryByText(/USJ/)).toBeNull();
  });

  it('renders only the privacy shield while share safe mode is active', () => {
    const { container } = render(<OverlayPrivacyShield kind="top" />);

    expect(screen.getByText('画面共有保護中')).toBeVisible();
    expect(container).not.toHaveTextContent('質問');
    expect(container).not.toHaveTextContent('文字起こし');
  });
});
