"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("user");
  const [generatedLink, setGeneratedLink] = useState("");

  const loadUsers = async () => {
    const res = await fetch("/api/auth/users/list");
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createInvite = async () => {
    if (!employeeName) return alert("Employee name required");

    const res = await fetch("/api/auth/users/create-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeName, role })
    });

    const data = await res.json();
    if (data.token) {
      setGeneratedLink(
        `${window.location.origin}/auth/register?token=${data.token}`
      );
    }

    loadUsers();
  };

  const removeUser = async (id) => {
    if (!confirm("Remove this user?")) return;

    await fetch(`/api/auth/users/remove?id=${id}`, { method: "DELETE" });
    loadUsers();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Users & Access
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Manage team members, roles and invitations
      </p>
    </div>

    {/* Back */}
    <Link href="/settings">
      <button className="mb-8 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        ← Back to Settings
      </button>
    </Link>

    {/* Invite User Card */}
    <div className="mb-10 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between px-6 py-5 border-b dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invite New User
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate an invite link for a new employee
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {showForm ? "Close" : "Add User"}
        </button>
      </div>

      {showForm && (
        <div className="p-6 grid gap-5 animate-in fade-in slide-in-from-top-2">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Employee name
            </label>
            <input
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Generate */}
          <button
            onClick={createInvite}
            className="mt-2 w-fit rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            Generate Invite Link
          </button>

          {/* Invite Link */}
          {generatedLink && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Share this link
              </p>

              <div className="flex items-center gap-3">
                <code className="flex-1 text-xs break-all bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  {generatedLink}
                </code>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                  }}
                  className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Copy
                </button>

                <button
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: "Invite link",
                        url: generatedLink,
                      });
                    }
                  }}
                  className="rounded-lg px-3 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Users List */}
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700 shadow-xl">
      <div className="px-6 py-5 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Existing Users
        </h2>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.username}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {user.role}
              </p>
            </div>

            <button
              onClick={() => removeUser(user._id)}
              className="rounded-lg px-3 py-1.5 text-sm bg-red-500 text-white hover:bg-red-600 transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

}
