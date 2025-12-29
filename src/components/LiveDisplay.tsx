import './LiveDisplay.css';

interface LiveDisplayProps {
  liveValue: number | null;
  rawData: string;
}

export default function LiveDisplay({ liveValue, rawData }: LiveDisplayProps) {
  return (
    <div className="live-display">
      <div className="display-card">
        <h2 className="display-label">Live Monitoring</h2>
        <div className="value-container">
          {liveValue !== null ? (
            <>
              <div className="resistance-value">{liveValue.toFixed(2)}</div>
              <div className="resistance-unit">Ω</div>
            </>
          ) : (
            <div className="no-data">Waiting for data...</div>
          )}
        </div>
        <div className="display-info">
          {rawData ? (
            <>
              <span className="label">Raw Data:</span>
              <span className="raw-data">{rawData}</span>
            </>
          ) : (
            <span className="placeholder">Connect to device</span>
          )}
        </div>
      </div>
    </div>
  );
}
