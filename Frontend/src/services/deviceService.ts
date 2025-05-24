
import { api } from "./api";

export interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "error";
  location: string;
  description?: string;
  mqttTopic?: string;
  ipAddress?: string;
  lastActive?: string;
  created?: string;
  model?: string;
}

export interface DeviceFormData {
  name: string;
  type: string;
  location: string;
  description?: string;
  mqttTopic?: string;
  ipAddress?: string;
  model?: string;
}

export const deviceService = {
  /**
   * Get all devices
   */
  async getDevices(): Promise<Device[]> {
    return api.get<Device[]>("/api/devices");
  },

  /**
   * Get a specific device by ID
   */
  async getDevice(id: string): Promise<Device> {
    return api.get<Device>(`/api/devices/${id}`);
  },

  /**
   * Create a new device
   */
  async createDevice(data: DeviceFormData): Promise<Device> {
    return api.post<Device>("/api/devices", data);
  },

  /**
   * Update a device
   */
  async updateDevice(id: string, data: DeviceFormData): Promise<Device> {
    return api.put<Device>(`/api/devices/${id}`, data);
  },

  /**
   * Delete a device
   */
  async deleteDevice(id: string): Promise<void> {
    return api.delete<void>(`/api/devices/${id}`);
  }
};
