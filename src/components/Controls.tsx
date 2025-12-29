import './Controls.css';

interface ControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onAddMeasurement: () => void;
}

export default function Controls({
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  onAddMeasurement,
}: ControlsProps) {
  return (
    <div className="controls">
      {!isConnected ? (
        <button
          className="btn btn-primary btn-demarrer"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connexion...' : 'Démarrer'}
        </button>
      ) : (
        <>
          <button
            className="btn btn-success btn-suivante"
            onClick={onAddMeasurement}
          >
            Suivante
          </button>
          <button className="btn btn-secondary" onClick={onDisconnect}>
            Arrêter
          </button>
        </>
      )}
    </div>
  );
}
