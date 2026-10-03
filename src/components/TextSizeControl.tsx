import type { Language } from '../config/languages';
import { t } from '../i18n';

export type TextSize = 'standard' | 'medium' | 'large';
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
    <div
      className="text-size-control"
      role="group"
      aria-label={t(language, 'features.textSize')}
    >
      {(['standard', 'medium', 'large'] as const).map((size, index) => (
        <button
          key={size}
          aria-pressed={value === size}
          aria-label={t(
            language,
            `features.${size === 'standard' ? 'standardText' : size === 'medium' ? 'mediumText' : 'largeText'}`,
          )}
          onClick={() => onChange(size)}
        >
          <span aria-hidden="true">{['A−', 'A', 'A+'][index]}</span>
        </button>
      ))}
    </div>
  );
}
