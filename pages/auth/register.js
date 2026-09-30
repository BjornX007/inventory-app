import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validate token first
  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/users/validate-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        setValid(data.valid);
        setLoading(false);
      });
  }, [token]);

  async function handleRegister(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/users/register-with-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, token }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }

    router.push("/login");
  }

  if (loading) return <p>Checking invite link...</p>;
  if (!valid) return <p>Invalid or expired invite token.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Your Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br/>

        <input
          placeholder="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}
