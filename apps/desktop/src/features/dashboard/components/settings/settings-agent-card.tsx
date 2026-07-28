import '@/features/dashboard/components/settings/settings-agent-card.css';

const commandExamples = [
  'how-to-talk list sessions',
  'how-to-talk create knowledge --file ./knowledge.json',
  'how-to-talk update knowledge ID --data -',
  'how-to-talk schema knowledge',
];

export function SettingsAgentCard() {
  return (
    <article className="soft-card settings-panel-card settings-agent-card">
      <div className="settings-card-heading">
        <div>
          <h3>AI Agent連携</h3>
          <p className="settings-card-description">
            CLIからローカルデータを参照・追加・編集・削除できます。
          </p>
        </div>
        <span className="status-badge blue">Local only</span>
      </div>

      <div className="settings-agent-command-list">
        {commandExamples.map((command) => (
          <code key={command}>{command}</code>
        ))}
      </div>

      <div className="settings-agent-safety">
        <strong>安全な使い方</strong>
        <p>
          個人情報は <code>--file</code> または <code>--data -</code>{' '}
          で渡し、シェル履歴へ残さないでください。アプリ起動中の変更操作は排他制御で拒否されます。
        </p>
      </div>

      <details className="settings-agent-spec">
        <summary>CLI SPECの確認方法</summary>
        <p>
          <code>how-to-talk spec</code> で正式仕様、
          <code>how-to-talk schema</code> で全リソースのJSON
          Schemaを取得できます。
        </p>
        <p>
          対象: Sessions / People / Projects / Reviews / Knowledge / Templates
        </p>
      </details>
    </article>
  );
}
