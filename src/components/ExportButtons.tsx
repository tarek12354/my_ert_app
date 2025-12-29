import './ExportButtons.css';

interface ExportButtonsProps {
  onExport: (format: 'csv' | 'kml') => void;
  measurementCount: number;
}

export default function ExportButtons({ onExport, measurementCount }: ExportButtonsProps) {
  return (
    <div className="export-buttons">
      <button
        className="btn btn-export btn-csv"
        onClick={() => onExport('csv')}
        disabled={measurementCount === 0}
        title={measurementCount === 0 ? 'No measurements to export' : 'Export as CSV'}
      >
        Exporter CSV
      </button>
      <button
        className="btn btn-export btn-kml"
        onClick={() => onExport('kml')}
        disabled={measurementCount === 0}
        title={measurementCount === 0 ? 'No measurements to export' : 'Export as KML'}
      >
        Exporter KML
      </button>
    </div>
  );
}
