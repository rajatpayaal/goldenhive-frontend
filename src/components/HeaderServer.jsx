import { Header } from "./Header";
import { getUnreadNotificationsCount } from "@/lib/notifications.server";

export async function HeaderServer({ categories = [] }) {
  let unreadCount = 0;

  try {
    const response = await getUnreadNotificationsCount();
    unreadCount = response?.data?.data?.total ?? 0;
  } catch {
    unreadCount = 0;
  }

  return <Header categories={categories} initialUnreadCount={unreadCount} />;
}

