import { render, screen } from '@testing-library/react';
import { SettingsAgentCard } from '@/features/dashboard/components/settings/settings-agent-card';

describe('SettingsAgentCard', () => {
  it('shows agent-safe CLI and specification entry points', () => {
    render(<SettingsAgentCard />);

    expect(screen.getByText('AI Agent連携')).toBeInTheDocument();
    expect(
      screen.getByText('how-to-talk create knowledge --file ./knowledge.json'),
    ).toBeInTheDocument();
    expect(screen.getByText(/how-to-talk spec/)).toBeInTheDocument();
    expect(screen.getByText(/シェル履歴へ残さない/)).toBeInTheDocument();
  });
});
