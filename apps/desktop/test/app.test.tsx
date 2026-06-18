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

    const startButton = await screen.findByRole('button', {
      name: /セッション開始/i,
    });
    expect(startButton).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');
    const user = userEvent.setup();

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(startButton).toBeEnabled();
  });

  it('adds imported knowledge entries', async () => {
    render(<App />);
    const user = userEvent.setup();

    expect(
      await screen.findByText((content) =>
        content.includes('追加済みファイル数: 0'),
      ),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: /サンプル個人ナレッジを追加/i,
      }),
    );

    expect(screen.getByText(/追加済みファイル数: 5/i)).toBeInTheDocument();
    expect(screen.getByText(/values \(サンプル\)/i)).toBeInTheDocument();
  });

  it('imports selected local knowledge files', async () => {
    render(<App />);
    const user = userEvent.setup();

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
