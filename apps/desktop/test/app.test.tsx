import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

describe('App', () => {
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
    expect(screen.getByText(/values \(imported\)/i)).toBeInTheDocument();
  });
});
