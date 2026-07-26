import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { resetMockAppState } from '@/lib/tauri/commands';

describe('new user launch', () => {
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
    expect(screen.getByText('New Workspace')).toBeInTheDocument();
    expect(screen.queryByText('Demo Workspace')).toBeNull();
    expect(screen.getByText('事前準備テンプレート 0 件')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Sessions/i }));
    await user.click(
      await screen.findByRole('button', { name: /新しいセッション/i }),
    );

    expect(
      await screen.findByDisplayValue('新しいセッション 1'),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', { name: /My Knowledge/i }),
    );
    await user.type(
      screen.getByRole('textbox', { name: '呼ばれたい名前' }),
      '伊吹',
    );
    await user.type(
      screen.getByRole('textbox', { name: '現在の所属・役割' }),
      '大学生',
    );
    await user.click(screen.getByRole('button', { name: '基礎情報を保存' }));

    expect(
      (await screen.findAllByText('基本プロフィール')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('伊吹')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Home/i }));
    expect(
      await screen.findByRole('heading', {
        name: /おはようございます、伊吹 さん/i,
      }),
    ).toBeInTheDocument();
  });
});
