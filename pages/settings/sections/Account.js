import Link from "next/link";
import { useRouter } from "next/router";

export default function Account() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("inv_user");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Account & Credentials</h1>

      <Link href="/settings">
        <button className="mb-6 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition">
          Back to Settings Home
        </button>
      </Link>

      {/* ---------------------- Profile Section ---------------------- */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        <div className="space-y-4">
          <label className="block text-sm">
            Full Name
            <input className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </label>

          <label className="block text-sm">
            Email Address
            <input
              type="email"
              className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Save Profile
          </button>
        </div>
      </section>

      {/* ---------------------- Password Section ---------------------- */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <div className="space-y-4">
          <label className="block text-sm">
            Current Password
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="block text-sm">
            New Password
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="block text-sm">
            Confirm New Password
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Update Password
          </button>
        </div>
      </section>

      {/* ---------------------- Session ---------------------- */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Session</h2>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded hover:bg-gray-900 dark:hover:bg-gray-600 transition"
        >
          Log out
        </button>
      </section>

      {/* ---------------------- Danger Zone ---------------------- */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-red-400/40">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>

        <p className="text-sm mb-4">
          Deleting your account will remove access permanently. This action cannot be undone.
        </p>

        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
          Delete Account
        </button>
      </section>
    </div>
  );
}
