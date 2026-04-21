/**
 * Device Manager Service
 * Handles real device connections via Web Bluetooth API
 * For native apps: Replace with platform-specific APIs (CoreBluetooth/BluetoothManager)
 */

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'phone' | 'smartwatch' | 'fitness-band' | 'heart-monitor' | 'scale' | 'earbuds' | 'unknown';
  status: 'connected' | 'disconnected' | 'syncing';
  battery?: number;
  lastSync?: Date;
  rssi?: number; // Signal strength
  services?: string[]; // Bluetooth services
}

export interface HealthDataSource {
  id: string;
  name: string;
  type: string;
  lastSync?: Date;
}

class DeviceManager {
  private devices: Map<string, ConnectedDevice> = new Map();
  private listeners: Set<(devices: ConnectedDevice[]) => void> = new Set();
  private bluetoothAvailable: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if Web Bluetooth is available
    this.bluetoothAvailable = 'bluetooth' in navigator;
    
    if (this.bluetoothAvailable) {
      console.log('✅ Web Bluetooth API available');
      this.setupBluetoothListeners();
    } else {
      console.log('❌ Web Bluetooth API not available');
    }

    // Load persisted devices
    this.loadPersistedDevices();
    
    // Check for health data sources
    this.checkHealthSources();
  }

  private setupBluetoothListeners() {
    if (!this.bluetoothAvailable) return;

    // Listen for device disconnections
    (navigator as any).bluetooth?.addEventListener('advertisementreceived', (event: any) => {
      console.log('Advertisement received:', event);
    });
  }

  /**
   * Scan for nearby Bluetooth devices
   * Uses Web Bluetooth API (works in Chrome/Edge on Android/Desktop)
   */
  async scanForDevices(): Promise<void> {
    if (!this.bluetoothAvailable) {
      throw new Error('Bluetooth not available on this device/browser');
    }

    try {
      // Request device with fitness-related services
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
          { services: ['device_information'] },
          { namePrefix: 'Mi Band' },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Galaxy' },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Amazfit' },
        ],
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          'fitness_machine',
          'user_data',
        ],
      });

      if (device) {
        await this.connectDevice(device);
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        console.log('User cancelled device selection');
      } else {
        console.error('Error scanning for devices:', error);
        throw error;
      }
    }
  }

  /**
   * Connect to a Bluetooth device and read its information
   */
  private async connectDevice(bluetoothDevice: any): Promise<void> {
    try {
      console.log('Connecting to device:', bluetoothDevice.name);
      
      const server = await bluetoothDevice.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      const deviceType = this.inferDeviceType(bluetoothDevice.name || 'Unknown');
      
      const device: ConnectedDevice = {
        id: bluetoothDevice.id,
        name: bluetoothDevice.name || 'Unknown Device',
        type: deviceType,
        status: 'connected',
        lastSync: new Date(),
      };

      // Try to read battery level
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryChar.readValue();
        device.battery = batteryValue.getUint8(0);
      } catch (e) {
        console.log('Battery service not available');
      }

      // Listen for disconnection
      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        this.handleDeviceDisconnected(device.id);
      });

      this.devices.set(device.id, device);
      this.persistDevices();
      this.notifyListeners();

      console.log('✅ Device connected:', device);
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  /**
   * Infer device type from device name
   */
  private inferDeviceType(name: string): ConnectedDevice['type'] {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('watch') || nameLower.includes('galaxy watch')) {
      return 'smartwatch';
    }
    if (nameLower.includes('band') || nameLower.includes('mi band') || nameLower.includes('fitbit')) {
      return 'fitness-band';
    }
    if (nameLower.includes('scale') || nameLower.includes('weight')) {
      return 'scale';
    }
    if (nameLower.includes('heart') || nameLower.includes('polar')) {
      return 'heart-monitor';
    }
    if (nameLower.includes('buds') || nameLower.includes('airpods')) {
      return 'earbuds';
    }
    if (nameLower.includes('phone') || nameLower.includes('pixel') || nameLower.includes('iphone')) {
      return 'phone';
    }
    
    return 'unknown';
  }

  /**
   * Handle device disconnection
   */
  private handleDeviceDisconnected(deviceId: string) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = 'disconnected';
      this.notifyListeners();
      console.log('⚠️ Device disconnected:', device.name);
    }
  }

  /**
   * Remove a device from the list
   */
  removeDevice(deviceId: string) {
    this.devices.delete(deviceId);
    this.persistDevices();
    this.notifyListeners();
  }

  /**
   * Get current device as a connected device
   */
  private async checkHealthSources() {
    // On web, we can detect the current device
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detect if running on a mobile device
    const isMobile = /android|iphone|ipad|ipod/.test(userAgent);
    
    if (isMobile) {
      const deviceName = this.getDeviceName(userAgent);
      const currentDevice: ConnectedDevice = {
        id: 'current-device',
        name: deviceName,
        type: 'phone',
        status: 'connected',
        lastSync: new Date(),
      };
      
      this.devices.set('current-device', currentDevice);
      this.notifyListeners();
    }
  }

  /**
   * Extract device name from user agent
   */
  private getDeviceName(userAgent: string): string {
    if (userAgent.includes('iphone')) return 'iPhone';
    if (userAgent.includes('ipad')) return 'iPad';
    if (userAgent.includes('pixel')) return 'Google Pixel';
    if (userAgent.includes('samsung')) return 'Samsung Galaxy';
    if (userAgent.includes('android')) return 'Android Phone';
    return 'This Device';
  }

  /**
   * Get all connected devices
   */
  getDevices(): ConnectedDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Check if Bluetooth is available
   */
  isBluetoothAvailable(): boolean {
    return this.bluetoothAvailable;
  }

  /**
   * Subscribe to device updates
   */
  subscribe(callback: (devices: ConnectedDevice[]) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current devices
    callback(this.getDevices());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of device changes
   */
  private notifyListeners() {
    const devices = this.getDevices();
    this.listeners.forEach(callback => callback(devices));
  }

  /**
   * Persist devices to localStorage
   */
  private persistDevices() {
    const devicesArray = this.getDevices();
    localStorage.setItem('connected_devices', JSON.stringify(devicesArray));
  }

  /**
   * Load persisted devices from localStorage
   */
  private loadPersistedDevices() {
    try {
      const stored = localStorage.getItem('connected_devices');
      if (stored) {
        const devices = JSON.parse(stored) as ConnectedDevice[];
        devices.forEach(device => {
          // Mark persisted devices as disconnected by default
          // They'll update to connected if still available
          device.status = 'disconnected';
          this.devices.set(device.id, device);
        });
      }
    } catch (error) {
      console.error('Error loading persisted devices:', error);
    }
  }

  /**
   * Sync data from a specific device
   */
  async syncDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    device.status = 'syncing';
    this.notifyListeners();

    // Simulate sync (replace with actual sync logic)
    await new Promise(resolve => setTimeout(resolve, 2000));

    device.status = 'connected';
    device.lastSync = new Date();
    this.notifyListeners();
    this.persistDevices();
  }
}

// Export singleton instance
export const deviceManager = new DeviceManager();
