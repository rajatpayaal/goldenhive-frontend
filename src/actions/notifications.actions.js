"use server";

import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications.server";

export async function getMyNotificationsAction({ page = 1, limit = 20 } = {}) {
  return getMyNotifications({ page, limit });
}

export async function getUnreadNotificationsCountAction() {
  return getUnreadNotificationsCount();
}

export async function markNotificationReadAction(notificationId) {
  return markNotificationRead(notificationId);
}

export async function markAllNotificationsReadAction() {
  return markAllNotificationsRead();
}

