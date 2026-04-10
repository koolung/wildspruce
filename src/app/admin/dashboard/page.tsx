import { isAdminAuthenticated, clearAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard - Wild Spruce",
  description: "Manage cabin bookings",
};

async function AdminLogoutButton() {
  const handleLogout = async () => {
    "use server";
    await clearAdminSession();
    redirect("/admin");
  };

  return (
    <form action={handleLogout} className="inline">
      <button
        type="submit"
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
      >
        Logout
      </button>
    </form>
  );
}

export default async function AdminDashboardPage() {
  // Check authentication - redirect to login if not authenticated
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  return (
    <div>
      <AdminDashboard />

      {/* Logout button in top right */}
      <div className="fixed top-6 right-6">
        <AdminLogoutButton />
      </div>
    </div>
  );
}
