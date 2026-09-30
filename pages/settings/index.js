"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import {
  User,
  Users,
  Shield,
  Boxes,
  Warehouse,
  Palette,
} from "lucide-react";

export default function SettingsHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("inv_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">

      <h1 className="text-3xl font-bold mb-8 tracking-tight">Settings</h1>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Everyone */}
  <SettingCard
    title="Account & Credentials"
    icon={<User className="w-6 h-6" />}
    href="/settings/sections/Account"
  />

  {/* Admin only */}
  {user?.role !== "user" && (
    <>
      <SettingCard
        title="Users & Access"
        icon={<Users className="w-6 h-6" />}
        href="/settings/sections/Users"
      />

      <SettingCard
        title="Security & Logs"
        icon={<Shield className="w-6 h-6" />}
        href="/settings/sections/Security"
      />

      <SettingCard
        title="Inventory Settings"
        icon={<Boxes className="w-6 h-6" />}
        href="/settings/sections/Inventory"
      />

      <SettingCard
        title="Warehouse Management"
        icon={<Warehouse className="w-6 h-6" />}
        href="/settings/sections/Warehouses"
      />
    </>
  )}

  {/* Everyone */}
  <SettingCard
    title="Appearance"
    icon={<Palette className="w-6 h-6" />}
    href="/settings/sections/Appearance"
  />
</div>

    </div>
  );
}

function SettingCard({ title, href, icon }) {
  return (
    <Link href={href}>
      <div className="
        group 
        p-5 
        rounded-xl 
        bg-white dark:bg-gray-800 
        shadow 
        hover:shadow-xl 
        border border-transparent 
        hover:border-gray-300 dark:hover:border-gray-700 
        cursor-pointer 
        transition 
        flex items-center gap-4
      ">
        <div className="
          p-3 rounded-lg 
          bg-slate-100 dark:bg-gray-700 
          text-gray-700 dark:text-gray-200 
          group-hover:bg-slate-200 dark:group-hover:bg-gray-600 
          transition
        ">
          {icon}
        </div>

        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
    </Link>
  );
}
