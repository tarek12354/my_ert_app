import { useState } from 'react';
import { useBluetooth } from './hooks/useBluetooth';
import Header from './components/Header';
import LiveDisplay from './components/LiveDisplay';
import DebugFooter from './components/DebugFooter';
import Controls from './components/Controls';
import GpsToggle from './components/GpsToggle';
import ExportButtons from './components/ExportButtons';
import './App.css';

function App() {
  const bluetooth = useBluetooth();
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [measurements, setMeasurements] = useState<Array<{ timestamp: number; resistance: number }>>([]);

  const handleAddMeasurement = () => {
    if (bluetooth.liveValue !== null) {
      setMeasurements((prev) => [
        ...prev,
        { timestamp: Date.now(), resistance: bluetooth.liveValue as number },
      ]);
    }
  };

  const handleExport = (format: 'csv' | 'kml') => {
    if (measurements.length === 0) {
      alert('No measurements to export');
      return;
    }

    if (format === 'csv') {
      const csv =
        'Timestamp,Resistance\n' +
        measurements
          .map((m) => `${new Date(m.timestamp).toISOString()},${m.resistance}`)
          .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `measurements_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'kml') {
      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>ERT Measurements</name>
      <description>Resistance measurements export</description>
      <ExtendedData>
        ${measurements
          .map(
            (m) =>
              `<Data name="measurement"><value>${m.resistance} (${new Date(m.timestamp).toISOString()})</value></Data>`
          )
          .join('\n        ')}
      </ExtendedData>
    </Placemark>
  </Document>
</kml>`;

      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `measurements_${Date.now()}.kml`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="app-content">
        <div className="app-container">
          <LiveDisplay liveValue={bluetooth.liveValue} rawData={bluetooth.data.rawString} />

          <Controls
            isConnected={bluetooth.isConnected}
            isConnecting={bluetooth.isConnecting}
            onConnect={bluetooth.connect}
            onDisconnect={bluetooth.disconnect}
            onAddMeasurement={handleAddMeasurement}
          />

          <div className="settings-section">
            <GpsToggle enabled={gpsEnabled} onChange={setGpsEnabled} />
            <ExportButtons onExport={handleExport} measurementCount={measurements.length} />
          </div>

          <div className="measurement-count">
            <span>Measurements: {measurements.length}</span>
          </div>
        </div>
      </main>

      <DebugFooter rawData={bluetooth.data.rawString} isConnected={bluetooth.isConnected} />
    </div>
  );
}

export default App;
