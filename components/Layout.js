import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FiHome,
  FiBox,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const menuItems = [
  { icon: FiHome, path: "/dashboard", label: "Dashboard" },
  { icon: FiBox, path: "/products/stock-overview", label: "Products" },
  { icon: FiFileText, path: "/products/logs", label: "Logs" },
  { icon: FiFileText, path: "/invoices", label: "Invoices" },
 { icon: FiSettings, path: "/settings", label: "Settings" }, // KEEP THIS
];

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("inv_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem("inv_user");
    router.replace("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* ===== DESKTOP SIDEBAR ===== */}
     <aside className="hidden lg:flex w-20 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">

  {/* ===== APP BRAND ===== */}
  <div className="h-16 flex flex-col items-center justify-center border-b border-gray-200 dark:border-gray-700">
    <img
      src="/icons/icon-192.png"
      alt="App Logo"
      className="w-8 h-8 mb-1"
    />
    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
      Inventory
    </span>
  </div>

  {/* ===== MAIN NAV ===== */}
 <nav className="flex-1 pt-4 space-y-3 flex flex-col items-center">
  {menuItems
    .filter(item => item.path !== "/settings") // ⬅️ hide Settings here
    .map(({ icon: Icon, path, label }) => {
      const active = router.pathname === path;

      return (
        <button
          key={path}
          onClick={() => router.push(path)}
          className={`
            flex flex-col items-center justify-center gap-1
            w-14 h-14 rounded-xl
            transition-all duration-150
            ${
              active
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
          `}
        >
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      );
    })}
</nav>

{/* ===== BOTTOM ACTIONS ===== */}
<div className="scroll-pb-0.5 space-y-2 flex flex-col items-center border-t border-gray-200 dark:border-gray-700 pt-2">

  {/* Settings */}
  <button
    onClick={() => router.push("/settings")}
    className="
      flex flex-col items-center justify-center gap-1
      w-14 h-14 rounded-xl
      text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700
      transition
    "
  >
    <FiSettings size={22} />
    <span className="text-[10px] font-medium">Settings</span>
  </button>

  {/* User */}
  <button
    onClick={() => router.push("/profile")}
    className="
      flex flex-col items-center justify-center gap-1
      w-14 h-14 rounded-xl
      text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700
      transition
    "
  >
    <FiUser size={22} />
    <span className="text-[10px] font-medium">{user?.username}</span>
    <p className="text-[10px] font-medium text-blue-500">{user?.role}</p>
  </button>

  {/* Logout */}
  <button
    onClick={logout}
    className="
      flex flex-col items-center justify-center gap-1
      w-14 h-14 rounded-xl
      text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
      transition
    "
  >
    <FiLogOut size={22} />
    <span className="text-[10px] font-medium">Logout</span>
  </button>

</div>

</aside>


      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        {children}
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="
          lg:hidden
          fixed bottom-0 left-0 right-0
          h-20
          bg-white dark:bg-gray-800
          
          shadow-xl
          border border-gray-200 dark:border-gray-700
          flex justify-around items-center
          z-50
        "
      >
        {menuItems.map(({ icon: Icon, path, label }) => {
          const active = router.pathname === path;

          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`
                flex flex-col items-center justify-center gap-1
                w-16 h-16 rounded-xl
                transition
                ${
                  active
                    ? "text-white bg-blue-500 dark:bg-blue-700/30"
                    : "text-gray-400"
                }
              `}
            >
              <Icon size={23} />
              <span className="text-[10px] font-semi-bold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
