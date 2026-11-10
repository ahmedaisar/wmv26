import Link from "next/link";
import { signOut } from "../actions";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-lg border border-sand bg-white p-8 md:p-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">Staff workspace</p>
        <h1 className="mt-5 text-3xl font-medium tracking-tight text-ocean">Access not assigned.</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Your account is authenticated, but it does not have a workspace profile or an authorized role. Ask an administrator to review your access.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5 text-sm">
          <Link className="underline underline-offset-4" href="/">Return to website</Link>
          <form action={signOut}>
            <button className="font-semibold text-ocean underline underline-offset-4" type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </main>
  );
}
