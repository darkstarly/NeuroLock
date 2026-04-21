import { useState, useEffect } from 'react';
import { deviceManager, ConnectedDevice } from '../services/deviceManager';

export default function Devices() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);

  useEffect(() => {
    const unsubscribe = deviceManager.subscribe((updatedDevices) => {
      setDevices(updatedDevices);
    });

    setBluetoothAvailable(deviceManager.isBluetoothAvailable());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleScanDevices = async () => {
    setIsScanning(true);
    setError(null);

    try {
      await deviceManager.scanForDevices();
    } catch (err: any) {
      if (err.message.includes('not available')) {
        setError('Bluetooth is not available on this browser. Use Chrome/Edge on Android or desktop.');
      } else {
        setError(err.message || 'Failed to scan for devices');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    deviceManager.removeDevice(deviceId);
  };

  const handleSyncDevice = async (deviceId: string) => {
    try {
      await deviceManager.syncDevice(deviceId);
    } catch (err) {
      console.error('Failed to sync device:', err);
    }
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'phone': return '📱';
      case 'smartwatch': return '⌚';
      case 'fitness-band': return '📿';
      case 'heart-monitor': return '❤️';
      case 'scale': return '⚖️';
      case 'earbuds': return '🎧';
      default: return '📡';
    }
  };

  const getStatusColor = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return 'text-emerald-400';
      case 'syncing': return 'text-blue-400';
      case 'disconnected': return 'text-slate-500';
    }
  };

  const getStatusDot = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      case 'syncing': return 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]';
      case 'disconnected': return 'bg-slate-500';
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Connected Devices</h1>
        <p className="text-slate-400 text-xs">
          Manage your fitness and health tracking devices
        </p>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScanDevices}
        disabled={isScanning || !bluetoothAvailable}
        className="w-full btn-primary py-4 rounded-2xl text-sm mb-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden"
      >
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}
        {isScanning ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Scanning for devices...</span>
          </>
        ) : (
          <>
            <span className="text-lg">📡</span>
            <span className="font-bold">Scan for Nearby Devices</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="glass rounded-2xl p-4 mb-4 border-red-500/15">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-semibold text-sm mb-0.5">Error</h3>
              <p className="text-red-300/80 text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bluetooth Not Available Warning */}
      {!bluetoothAvailable && (
        <div className="glass rounded-2xl p-4 mb-4 border-amber-500/15">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <h3 className="text-amber-400 font-semibold text-sm mb-0.5">Bluetooth Not Available</h3>
              <p className="text-amber-300/70 text-xs leading-relaxed">
                Web Bluetooth is not supported in your browser. Use Chrome or Edge on Android/Desktop.
              </p>
              <p className="text-amber-300/70 text-xs mt-1.5">
                On iOS, Bluetooth device pairing requires a native app.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Device List */}
      {devices.length > 0 ? (
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="glass rounded-2xl p-4 card-hover"
            >
              <div className="flex items-start gap-4">
                {/* Device Icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {getDeviceIcon(device.type)}
                </div>

                {/* Device Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{device.name}</h3>
                      <p className="text-slate-400 text-xs capitalize">{device.type.replace('-', ' ')}</p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-1.5 bg-slate-800/30 px-2.5 py-1 rounded-full">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(device.status)}`} />
                      <span className={`text-[10px] font-medium capitalize ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                  </div>

                  {/* Device Details */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    {device.battery !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>🔋</span>
                        <span>{device.battery}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>🔄</span>
                      <span>{formatLastSync(device.lastSync)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {device.status === 'connected' && (
                      <button
                        onClick={() => handleSyncDevice(device.id)}
                        className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-xl text-xs font-semibold border border-violet-500/15 hover:bg-violet-500/15 transition-all duration-300"
                      >
                        Sync Now
                      </button>
                    )}
                    {device.id !== 'current-device' && (
                      <button
                        onClick={() => handleRemoveDevice(device.id)}
                        className="px-3 py-1.5 bg-red-500/8 text-red-400 rounded-xl text-xs font-semibold border border-red-500/15 hover:bg-red-500/12 transition-all duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-14 px-4">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/20 flex items-center justify-center text-4xl">
              📱
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/20 flex items-center justify-center text-sm animate-float">⌚</div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/20 flex items-center justify-center text-sm animate-float" style={{ animationDelay: '-2s' }}>❤️</div>
          </div>
          <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No Devices Connected</h3>
          <p className="text-slate-400 text-center text-xs mb-6 max-w-sm leading-relaxed">
            Tap "Scan for Nearby Devices" to connect your fitness trackers, smartwatches, and other health devices.
          </p>
          
          {/* Supported Devices */}
          <div className="glass rounded-2xl p-4 w-full max-w-md">
            <h4 className="text-white font-semibold mb-3 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Supported Devices</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { icon: '⌚', label: 'Smartwatches' },
                { icon: '📿', label: 'Fitness Bands' },
                { icon: '❤️', label: 'Heart Monitors' },
                { icon: '⚖️', label: 'Smart Scales' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-slate-400">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-5 glass rounded-2xl p-4">
        <h4 className="text-white font-semibold mb-2.5 text-xs flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span>ℹ️</span>
          How it works
        </h4>
        <ul className="text-slate-400 text-xs space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-violet-400/60 mt-0.5">•</span> Devices must have Bluetooth enabled</li>
          <li className="flex items-start gap-2"><span className="text-violet-400/60 mt-0.5">•</span> Keep devices nearby during pairing</li>
          <li className="flex items-start gap-2"><span className="text-violet-400/60 mt-0.5">•</span> Data syncs automatically when connected</li>
          <li className="flex items-start gap-2"><span className="text-violet-400/60 mt-0.5">•</span> Battery level shown for compatible devices</li>
        </ul>
      </div>
    </div>
  );
}
