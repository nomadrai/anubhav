import type { Language } from '../config/languages';
import { t } from '../i18n';

export type TextSize = 'standard' | 'large';
export function TextSizeControl({
  language,
  value,
  onChange,
}: {
  language: Language;
  value: TextSize;
  onChange: (value: TextSize) => void;
}) {
  return (
    <label>
      {t(language, 'features.textSize')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TextSize)}
      >
        <option value="standard">{t(language, 'features.standardText')}</option>
        <option value="large">{t(language, 'features.largeText')}</option>
      </select>
    </label>
  );
}
