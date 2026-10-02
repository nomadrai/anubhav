import { interpolate } from '../i18n';

export interface MarginMeterProps {
  status: 'open' | 'warning' | 'forced_exit' | 'exited';
  equity: number;
  warnLevel: number;
  maintenanceLevel: number;
  labels: { open: string; warning: string; forced: string; exited: string; level: string };
}

/** Simple margin indicator: state is carried by words and position, never colour alone. */
export function MarginMeter({ status, equity, warnLevel, maintenanceLevel, labels }: MarginMeterProps) {
  const text =
    status === 'forced_exit' ? labels.forced
    : status === 'exited' ? labels.exited
    : status === 'warning' ? labels.warning
    : labels.open;
  const percent = Math.max(0, Math.min(100, (equity / (warnLevel || 1)) * 100));
  return (
    <div className="meter" role="status">
      <div className="quiet">
        {interpolate(labels.level, { level: `${Math.round(maintenanceLevel)}` })}{' '}
        <strong>{text}</strong>
      </div>
      <div
        className="meter-track"
        role="img"
        aria-label={`${text}: ${Math.round(percent)} percent of the warning level`}
      >
        <div className="meter-fill" style={{ width: `${percent}%` }} />
        <div className="meter-mark" style={{ left: `${(maintenanceLevel / (warnLevel || 1)) * 100}%` }} />
      </div>
    </div>
  );
}
