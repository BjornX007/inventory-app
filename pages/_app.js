// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Pages WITHOUT sidebar/layout (public)
  const noLayoutPages = ["/login", "/auth/register", "/auth/setup"];

 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("inv_user"));

  // detect if register page is opened WITH a token
  const isRegisterWithToken =
    router.pathname === "/auth/register" &&
    router.query.token;

  const isPublicPage =
    router.pathname === "/login" ||
    router.pathname === "/auth/setup" ||
    isRegisterWithToken;

  // If NOT authenticated AND NOT on a public page → redirect
  if (!user && !isPublicPage) {
    router.replace("/login");
    return;
  }

  // If authenticated AND visiting login or setup → redirect to dashboard
  if (user && (router.pathname === "/login" || router.pathname === "/auth/setup")) {
    router.replace("/dashboard");
    return;
  }

  // VERY IMPORTANT:
  // Authenticated users are now ALLOWED to open /auth/register?token=...
  // so they can onboard new accounts (admin creating employees)
  setCheckedAuth(true);
}, [router.pathname, router.query]);


  if (!checkedAuth) return null; // Prevent UI flash

  const useLayout = !noLayoutPages.some((path) =>
    router.pathname.startsWith(path)
  );

  return (
    <ThemeProvider>
      {useLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </ThemeProvider>
  );
}
