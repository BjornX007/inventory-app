// pages/index.js

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("inv_user");

    if (user) {
      router.push("/dashboard"); // user already logged in
    } else {
      router.push("/login"); // first time
    }
  }, []);

  return null;
}
