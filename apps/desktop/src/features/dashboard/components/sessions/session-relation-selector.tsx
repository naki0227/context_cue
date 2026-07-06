type SessionRelationOption = {
  description: string;
  id: string;
  label: string;
};

type SessionRelationSelectorProps = {
  emptyText: string;
  helperText: string;
  options: SessionRelationOption[];
  selectedIds: string[];
  title: string;
  onChange: (nextIds: string[]) => void;
};

export function SessionRelationSelector({
  emptyText,
  helperText,
  options,
  selectedIds,
  title,
  onChange,
}: SessionRelationSelectorProps) {
  function toggleItem(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }

    onChange([...selectedIds, id]);
  }

  return (
    <div className="session-relation-selector">
      <div className="session-relation-head">
        <span>{title}</span>
        <strong>{selectedIds.length}件選択</strong>
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
