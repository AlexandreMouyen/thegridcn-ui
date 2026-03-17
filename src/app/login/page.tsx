import { Suspense } from "react";
import { LoginTemplate } from "@/components/thegridcn";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginTemplate />
    </Suspense>
  );
}
