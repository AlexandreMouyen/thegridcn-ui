import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import LoginPageClient from "./login-client";

export const metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
