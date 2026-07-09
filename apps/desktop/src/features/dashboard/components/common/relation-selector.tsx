export type RelationOption = {
  description: string;
  id: string;
  label: string;
};

type RelationSelectorProps = {
  emptyText: string;
  helperText: string;
  options: RelationOption[];
  selectedIds: string[];
  title: string;
  mode?: 'multiple' | 'single';
  onChange: (nextIds: string[]) => void;
};

export function RelationSelector({
  emptyText,
  helperText,
  mode = 'multiple',
  options,
  selectedIds,
  title,
  onChange,
}: RelationSelectorProps) {
  function toggleItem(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }

    onChange(mode === 'single' ? [id] : [...selectedIds, id]);
  }

  const countLabel =
    mode === 'single'
      ? (options.find((option) => selectedIds.includes(option.id))?.label ??
        '未設定')
      : `${selectedIds.length}件選択`;

  return (
    <div className="session-relation-selector">
      <div className="session-relation-head">
        <span>{title}</span>
        <strong>{countLabel}</strong>
      </div>
      <p className="helper-text">{helperText}</p>

      {options.length === 0 ? (
        <p className="helper-text">{emptyText}</p>
      ) : (
        <div className="session-relation-list">
          {options.map((option) => (
            <label className="session-relation-item" key={option.id}>
              <input
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleItem(option.id)}
                type="checkbox"
              />
              <span className="session-relation-copy">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
