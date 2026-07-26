import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { resetMockAppState } from '@/lib/tauri/commands';

describe('user launch', () => {
  beforeEach(() => {
    resetMockAppState();
    window.history.replaceState({}, '', '/');
  });

  it('starts without demo records and accepts the first user record', async () => {
    render(<App />);
    const user = userEvent.setup();

    expect(
      await screen.findByRole('heading', {
        name: /おはようございます、User さん/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('株式会社A カジュアル面談')).toBeNull();
    expect(screen.getByText('Open Source Edition')).toBeInTheDocument();
    expect(screen.queryByText('Demo Workspace')).toBeNull();
    expect(screen.getByText('事前準備テンプレート 0 件')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Sessions/i }));
    await user.click(
      await screen.findByRole('button', { name: /新しいセッション/i }),
    );

    expect(
      await screen.findByDisplayValue('新しいセッション 1'),
    ).toBeInTheDocument();
  });
});
