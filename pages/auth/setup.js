import { useState } from "react";

export default function SetupPage() {
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/verify-setup-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: inputKey }),
    });

    const data = await res.json();

    if (data.valid) {
     window.location.href = "/auth/register?setup=1";

    } else {
      setError("❌ Invalid or expired setup key");
    }
  }

  return (
    <div>
      <h1>Admin Setup</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter setup key"
        />
        <button type="submit">Continue</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
