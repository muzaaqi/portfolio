import { getAllUsers } from "@/db/queries";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return <UsersClient users={users} />;
}
