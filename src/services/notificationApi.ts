// src/services/notificationApi.ts

import axios from "axios"; // swap for your existing configured axios instance if you have one

// Ensures /api is always included, even if VITE_API_URL is set without it
const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export type NotificationType = "fee" | "attendance" | "assignment" | "general";

export type ApiNotification = {
  _id: string;
  recipient: string;
  schoolId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  refId: string | null;
  refModel: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  success: boolean;
  unreadCount: number;
  count: number;
  data: ApiNotification[];
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: ApiNotification;
  updatedCount?: number;
};

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getMyNotifications = async (token: string): Promise<ListResponse> => {
  const res = await axios.get(`${API_BASE}/notifications`, authHeaders(token));
  return res.data;
};

export const markNotificationRead = async (id: string, token: string): Promise<ActionResponse> => {
  const res = await axios.patch(`${API_BASE}/notifications/${id}/read`, {}, authHeaders(token));
  return res.data;
};

export const markAllNotificationsRead = async (token: string): Promise<ActionResponse> => {
  const res = await axios.patch(`${API_BASE}/notifications/read-all`, {}, authHeaders(token));
  return res.data;
};

export const deleteNotificationApi = async (id: string, token: string): Promise<ActionResponse> => {
  const res = await axios.delete(`${API_BASE}/notifications/${id}`, authHeaders(token));
  return res.data;
};