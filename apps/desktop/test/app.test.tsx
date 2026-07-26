import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { resetMockAppState } from '@/lib/tauri/commands';

describe('App', () => {
  beforeEach(() => {
    resetMockAppState();
    window.history.replaceState({}, '', '/');
  });

  it('keeps start disabled until all consent items are checked', async () => {
    render(<App />);
    const user = userEvent.setup();

    expect(await screen.findByText('Demo Workspace')).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: /Overlay Settings/i,
      }),
    );

    const startButton = await screen.findByRole('button', {
      name: /セッション開始/i,
    });
    expect(startButton).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(startButton).toBeEnabled();
  });

  it('adds imported knowledge entries', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /My Knowledge/i,
      }),
    );

    expect(
      await screen.findByText((content) =>
        content.includes('追加済みファイル数: 0'),
      ),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: /サンプル追加/i,
      }),
    );

    expect(screen.getByText(/追加済みファイル数: 5/i)).toBeInTheDocument();
    expect(screen.getByText(/values \(サンプル\)/i)).toBeInTheDocument();
  });

  it('imports selected local knowledge files', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /My Knowledge/i,
      }),
    );

    const fileInput = screen.getByTestId('profile-file-input');
    const file = new File(['候補者情報のメモ'], 'candidate-notes.md', {
      type: 'text/markdown',
    });

    await user.upload(fileInput, file);

    expect(
      await screen.findByText(/追加済みファイル数: 1/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/candidate-notes \(ローカルファイル\)/i),
    ).toBeInTheDocument();
  });

  it('updates session relations with checkbox selectors', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Sessions/i,
      }),
    );

    await user.click(
      await screen.findByRole('button', {
        name: /株式会社A カジュアル面談/i,
      }),
    );

    const personCheckbox = await screen.findByRole('checkbox', {
      name: /佐藤 花子/i,
    });
    expect(personCheckbox).not.toBeChecked();

    await user.click(personCheckbox);

    expect(personCheckbox).toBeChecked();
    expect(screen.getByText('2件選択')).toBeInTheDocument();
  });

  it('updates project title from the projects detail editor', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Projects \/ Companies/i,
      }),
    );

    await user.click(
      await screen.findByRole('button', {
        name: /株式会社カジュアル酒場/i,
      }),
    );

    const titleInput = screen.getByDisplayValue('株式会社カジュアル酒場');
    await user.clear(titleInput);
    await user.type(titleInput, '株式会社カジュアル酒場 改');

    expect(
      screen.getAllByDisplayValue('株式会社カジュアル酒場 改').length,
    ).toBeGreaterThan(0);
  });

  it('updates project linked sessions with checkbox selectors', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Projects \/ Companies/i,
      }),
    );

    await user.click(
      await screen.findByRole('button', {
        name: /株式会社カジュアル酒場/i,
      }),
    );

    const sessionCheckbox = await screen.findByRole('checkbox', {
      name: /研究室ミーティング/i,
    });
    expect(sessionCheckbox).not.toBeChecked();

    await user.click(sessionCheckbox);

    expect(sessionCheckbox).toBeChecked();
    expect(screen.getByText('3件選択')).toBeInTheDocument();
  });

  it('updates review title from the review detail editor', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Review/i,
      }),
    );

    await user.click(
      await screen.findByRole('button', {
        name: /株式会社セールス・イノベーション/i,
      }),
    );

    const titleInput = screen.getByDisplayValue(
      '株式会社セールス・イノベーション',
    );
    await user.clear(titleInput);
    await user.type(titleInput, '株式会社セールス・イノベーション 改');

    expect(
      screen.getAllByDisplayValue('株式会社セールス・イノベーション 改').length,
    ).toBeGreaterThan(0);
  });

  it('updates review related session with a single selector', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Review/i,
      }),
    );

    await user.click(
      await screen.findByRole('button', {
        name: /株式会社セールス・イノベーション/i,
      }),
    );

    const sessionCheckbox = await screen.findByRole('checkbox', {
      name: /研究室ミーティング/i,
    });
    expect(sessionCheckbox).not.toBeChecked();

    await user.click(sessionCheckbox);

    expect(sessionCheckbox).toBeChecked();
    expect(
      screen.getByText(/関連セッション: 研究室ミーティング/i),
    ).toBeInTheDocument();
  });

  it('deletes all local workspace data from settings', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', {
        name: /Overlay Settings/i,
      }),
    );

    expect(
      await screen.findByRole('button', { name: 'すべて書き出す' }),
    ).toBeInTheDocument();
    expect(screen.getByText('ローカルAI')).toBeInTheDocument();
    expect(screen.getByText('停止中')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'すべて削除',
      }),
    );

    expect(
      await screen.findByText('すべてのローカルデータを削除しました。'),
    ).toBeInTheDocument();
    confirm.mockRestore();
  });

  it('renders top overlay window content on top overlay view', async () => {
    window.history.replaceState({}, '', '/?view=overlay-top');
    render(<App />);

    expect(await screen.findByText(/AI Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/^質問$/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Conversation Workspace/i),
    ).not.toBeInTheDocument();
  });

  it('renders side overlay window content on side overlay view', async () => {
    window.history.replaceState({}, '', '/?view=overlay-side');
    render(<App />);

    expect(
      await screen.findByRole('button', { name: /^文字起こし$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/要約メモ/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Conversation Workspace/i),
    ).not.toBeInTheDocument();
  });
});
