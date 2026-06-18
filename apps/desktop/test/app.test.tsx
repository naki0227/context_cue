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
});
