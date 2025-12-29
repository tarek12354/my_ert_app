import './DebugFooter.css';

interface DebugFooterProps {
  rawData: string;
  isConnected: boolean;
}

export default function DebugFooter({ rawData, isConnected }: DebugFooterProps) {
  return (
    <footer className="debug-footer">
      <div className="debug-content">
        <div className="debug-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{isConnected ? 'Connecté' : 'Déconnecté'}</span>
        </div>
        <div className="debug-data">
          <span className="debug-label">Raw BLE:</span>
          <span className="debug-value" title={rawData || 'No data received yet'}>
            {rawData || 'Waiting for data...'}
          </span>
        </div>
      </div>
    </footer>
  );
}
