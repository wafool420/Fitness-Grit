import { useEffect, useState } from "react";

import { Stack, router, usePathname } from "expo-router";

import { getToken } from "../utils/authStorage";

export default function RootLayout() {
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await getToken();

        const isAuthPage = pathname === "/login" || pathname === "/register";

        // Not logged in and trying to access
        // a protected page
        if (!token && !isAuthPage) {
          router.replace("/login");
          return;
        }

        // Already logged in but trying to
        // visit login/register
        if (token && isAuthPage) {
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Could not check authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [pathname]);

  // Don't briefly show a protected screen
  // while checking the saved token
  if (checkingAuth) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
