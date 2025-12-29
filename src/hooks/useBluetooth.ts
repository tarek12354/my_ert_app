import { useState, useCallback } from 'react';

interface BluetoothData {
  x: number | null;
  y: number | null;
  a: number | null;
  b: number | null;
  resistance: number | null;
  rawString: string;
}

interface BluetoothState {
  isConnected: boolean;
  isConnecting: boolean;
  device: BluetoothDevice | null;
  data: BluetoothData;
  error: string | null;
  liveValue: number | null;
}

export const useBluetooth = () => {
  const [state, setState] = useState<BluetoothState>({
    isConnected: false,
    isConnecting: false,
    device: null,
    data: {
      x: null,
      y: null,
      a: null,
      b: null,
      resistance: null,
      rawString: '',
    },
    error: null,
    liveValue: null,
  });

  const parseESP32Data = useCallback((rawString: string): BluetoothData => {
    const cleanedString = rawString.trim();
    const parts = cleanedString.split(',').map((p) => p.trim());

    if (parts.length >= 5) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const a = parseFloat(parts[2]);
      const b = parseFloat(parts[3]);
      const resistance = parseFloat(parts[4]);

      return {
        x: !isNaN(x) ? x : null,
        y: !isNaN(y) ? y : null,
        a: !isNaN(a) ? a : null,
        b: !isNaN(b) ? b : null,
        resistance: !isNaN(resistance) ? resistance : null,
        rawString: cleanedString,
      };
    }

    return {
      x: null,
      y: null,
      a: null,
      b: null,
      resistance: null,
      rawString: cleanedString,
    };
  }, []);

  const handleNotification = useCallback(
    (event: Event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      const value = characteristic.value;

      if (value) {
        const rawString = new TextDecoder().decode(value);
        const parsedData = parseESP32Data(rawString);

        setState((prev) => ({
          ...prev,
          data: parsedData,
          liveValue: parsedData.resistance,
          error: null,
        }));
      }
    },
    [parseESP32Data]
  );

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['180a'] }],
        optionalServices: ['180d'],
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to device');

      const service = await server.getPrimaryService('180a');
      const characteristics = await service.getCharacteristics();

      if (characteristics.length > 0) {
        const characteristic = characteristics[0];
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleNotification);
      }

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        device,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [handleNotification]);

  const disconnect = useCallback(async () => {
    if (state.device?.gatt?.connected) {
      await state.device.gatt.disconnect();
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      device: null,
      data: {
        x: null,
        y: null,
        a: null,
        b: null,
        resistance: null,
        rawString: '',
      },
      liveValue: null,
    }));
  }, [state.device]);

  return {
    ...state,
    connect,
    disconnect,
  };
};
