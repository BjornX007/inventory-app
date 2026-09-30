import Link from "next/link";
export default function Security() {
  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Security & Logs
      </h2>
<Link href="/settings">
  <button className="mb-6 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition">
    Back to Settings Home
  </button>
</Link>
      <div className="space-y-6">

        {/* Change Password */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">Change Password</h3>

          <label className="block mb-3">
            Current Password
            <input type="password" className="mt-1 p-2 w-full border rounded dark:bg-gray-700" />
          </label>

          <label className="block mb-3">
            New Password
            <input type="password" className="mt-1 p-2 w-full border rounded dark:bg-gray-700" />
          </label>

          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Update Password
          </button>
        </div>

        {/* Login Logs */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">Login Activity</h3>

          <div className="space-y-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              Logged in from Chrome – 2 hours ago
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              Logged in from iPhone – Yesterday
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
