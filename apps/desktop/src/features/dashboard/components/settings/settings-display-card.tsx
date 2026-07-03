import {
  positionOptions,
  sectionItems,
} from '@/features/dashboard/components/settings/settings-config';
import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';
import type { OverlayPosition } from '@/lib/state/app-store';

type SettingsDisplayCardProps = Pick<
  SettingsPageProps,
  'overlayPreferences' | 'setOverlayPreference' | 'toggleOverlaySection'
>;

export function SettingsDisplayCard({
  overlayPreferences,
  setOverlayPreference,
  toggleOverlaySection,
}: SettingsDisplayCardProps) {
  return (
    <article className="soft-card settings-panel-card">
      <h3>表示設定</h3>

      <div className="settings-block">
        <div className="settings-label-row">
          <div>
            <strong>表示位置</strong>
            <p>オーバーレイを画面のどこに表示するかを設定します。</p>
          </div>
          <select
            className="setting-select setting-select-v2"
            onChange={(event) =>
              setOverlayPreference(
                'position',
                event.target.value as OverlayPosition,
              )
            }
            value={overlayPreferences.position}
          >
            {positionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SliderBlock
        description="オーバーレイ全体の高さを調整します。"
        label="高さ"
        max={560}
        min={280}
        value={overlayPreferences.height}
        valueLabel={`${overlayPreferences.height}px`}
        onChange={(value) => setOverlayPreference('height', value)}
      />

      <SliderBlock
        description="オーバーレイ内のテキストサイズを調整します。"
        label="文字サイズ"
        max={18}
        min={12}
        value={overlayPreferences.fontSize}
        valueLabel={`${overlayPreferences.fontSize}px`}
        onChange={(value) => setOverlayPreference('fontSize', value)}
      />

      <SliderBlock
        description="オーバーレイの背景の透明度を調整します。"
        label="透明度"
        max={100}
        min={55}
        value={overlayPreferences.opacity}
        valueLabel={`${overlayPreferences.opacity}%`}
        onChange={(value) => setOverlayPreference('opacity', value)}
      />

      <div className="settings-block">
        <div className="settings-section-head">
          <strong>表示するセクション</strong>
          <p>オーバーレイに表示する情報を選択します。</p>
        </div>

        <div className="settings-section-list">
          {sectionItems.map((item) => (
            <button
              className="settings-section-row"
              key={item.key}
              onClick={() => toggleOverlaySection(item.key)}
              type="button"
            >
              <span
                aria-hidden="true"
                className={`settings-check-indicator ${
                  overlayPreferences.sections[item.key] ? 'checked' : ''
                }`}
              />
              <span className={`settings-section-icon tone-${item.tone}`} />
              <span className="settings-section-copy">
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span className="settings-drag-handle">⋮⋮</span>
            </button>
          ))}
        </div>
        <p className="settings-caption">
          ドラッグ & ドロップで表示順を並び替えられます
        </p>
      </div>
    </article>
  );
}

type SliderBlockProps = {
  description: string;
  label: string;
  max: number;
  min: number;
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
};

function SliderBlock({
  description,
  label,
  max,
  min,
  value,
  valueLabel,
  onChange,
}: SliderBlockProps) {
  return (
    <div className="settings-block">
      <div className="settings-label-row">
        <div>
          <strong>{label}</strong>
          <p>{description}</p>
        </div>
        <span className="settings-value-pill">{valueLabel}</span>
      </div>
      <div className="settings-slider-row">
        <input
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          type="range"
          value={value}
        />
      </div>
    </div>
  );
}
