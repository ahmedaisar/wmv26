import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { signIn } from "./actions";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminSignInPage({ searchParams }: SignInPageProps) {
  const profile = await getCurrentProfile();
  if (profile) redirect("/admin");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link className="text-[11px] font-bold tracking-[0.24em] text-ocean" href="/">
          WHERESMALDIVES
        </Link>
        <p className="mt-14 text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">
          Staff workspace
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-ocean">
          Welcome back.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Sign in with the staff account invited by your administrator.
        </p>
        {params.error === "invalid" ? (
          <p className="mt-8 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            We could not sign you in. Check your email and password, then try again.
          </p>
        ) : null}
        <form action={signIn} className="mt-8 space-y-5">
          <input name="next" type="hidden" value={params.next ?? "/admin"} />
          <div>
            <label className="mb-2 block text-xs font-semibold text-ocean" htmlFor="email">
              Work email
            </label>
            <input autoComplete="username" className="w-full border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-lagoon" id="email" name="email" required type="email" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-ocean" htmlFor="password">
              Password
            </label>
            <input autoComplete="current-password" className="w-full border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-lagoon" id="password" name="password" required type="password" />
          </div>
          <button className="w-full bg-ocean px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-lagoon" type="submit">
            Sign in to workspace
          </button>
        </form>
        <p className="mt-8 text-xs leading-6 text-muted">
          Access is invitation-only. Contact your workspace administrator if you need an account.
        </p>
      </div>
    </main>
  );
}
