import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  // Clear any old session on page load
  useEffect(() => {
    localStorage.removeItem("inv_user");
  }, []);

  const handleLogin = async () => {
  const cleanName = name.trim();     // ✅ keep exact casing
  const cleanPin = pin.trim();

  if (!cleanName || !cleanPin) {
    alert("Enter name and PIN");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanName,
        password: cleanPin,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Login failed");
      return;
    }

    const data = await res.json();
    localStorage.setItem("inv_user", JSON.stringify(data.user));
    router.push("/dashboard");
  } catch (err) {
    alert("Server temporarily unavailable. Try again.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white px-6 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8">

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-300 text-center mb-8">
            Sign in to access Inventory Dashboard
          </p>

          <label className="block mb-3">
            <span className="text-gray-200 text-sm">Full Name</span>
            <input
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/20 focus:ring-2 text-gray-50 focus:ring-blue-400 outline-none"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="text"
            />
          </label>

          <label className="block mb-6">
            <span className="text-gray-200 text-sm">PIN</span>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/20 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="text"
            />
          </label>

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all font-semibold tracking-wide shadow-lg"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Floating Setup Button */}
      <button
        onClick={() => router.push("/auth/setup")}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg font-semibold z-20"
      >
        Setup
      </button>
    </div>
  );
}
