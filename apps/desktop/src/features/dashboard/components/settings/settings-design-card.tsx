import {
  accentColors,
  shadowLabel,
  themeLabels,
  themeOptions,
} from '@/features/dashboard/components/settings/settings-config';
import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsDesignCardProps = Pick<
  SettingsPageProps,
  'overlayPreferences' | 'setOverlayPreference'
>;

export function SettingsDesignCard({
  overlayPreferences,
  setOverlayPreference,
}: SettingsDesignCardProps) {
  return (
    <article className="soft-card settings-panel-card">
      <h3>デザイン設定</h3>

      <div className="settings-block">
        <div className="settings-label-row">
          <div>
            <strong>テーマ</strong>
            <p>オーバーレイの配色テーマを選択します。</p>
          </div>
          <div className="settings-segmented">
            {themeOptions.map((theme) => (
              <button
                className={overlayPreferences.theme === theme ? 'active' : ''}
                key={theme}
                onClick={() => setOverlayPreference('theme', theme)}
                type="button"
              >
                {themeLabels[theme]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-block">
        <div className="settings-label-row">
          <div>
            <strong>アクセントカラー</strong>
            <p>オーバーレイのアクセントカラーを選択します。</p>
          </div>
          <div className="settings-color-row">
            {accentColors.map((color) => (
              <button
                aria-label={`${color} を選択`}
                className={`accent-swatch accent-swatch-v2 ${
                  overlayPreferences.accentColor === color ? 'active' : ''
                }`}
                key={color}
                onClick={() => setOverlayPreference('accentColor', color)}
                style={{ background: color }}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>

      <SliderBlock
        description="オーバーレイの角の丸みを調整します。"
        label="角の丸み"
        max={28}
        min={8}
        value={overlayPreferences.cornerRadius}
        valueLabel={`${overlayPreferences.cornerRadius}px`}
        onChange={(value) => setOverlayPreference('cornerRadius', value)}
      />

      <SliderBlock
        description="オーバーレイの影の強さを調整します。"
        label="シャドウ"
        max={84}
        min={12}
        value={overlayPreferences.shadow}
        valueLabel={shadowLabel(overlayPreferences.shadow)}
        onChange={(value) => setOverlayPreference('shadow', value)}
      />
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
