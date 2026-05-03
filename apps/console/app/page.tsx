import { redirect } from "next/navigation";

// Root just routes to login. Middleware will bounce authed users to /dashboard.
export default function Page() {
  redirect("/login");
}
