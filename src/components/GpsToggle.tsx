import './GpsToggle.css';

interface GpsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function GpsToggle({ enabled, onChange }: GpsToggleProps) {
  return (
    <div className="gps-toggle">
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
        <span className="toggle-text">GPS: {enabled ? 'Activé' : 'Désactivé'}</span>
      </label>
    </div>
  );
}
