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
    <>
      <header className="nav admin-sign-in-nav">
        <div className="wrap nav__bar">
          <Link aria-label="WheresMaldives home" className="nav__logo" href="/">
            <span className="mark mark--initial" aria-hidden="true">W</span>
            <span>WHERESMALDIVES</span>
          </Link>
          <span className="admin-sign-in-nav__label">STAFF WORKSPACE</span>
        </div>
      </header>

      <main>
        <section className="section admin-sign-in-section">
          <div className="wrap admin-sign-in__wrap">
            <div className="hero-text admin-sign-in__grid">
              <div className="admin-sign-in__content">
                <p className="admin-kicker">Independent Maldives media</p>
                <h1 className="admin-sign-in__title">Maldives editorial workspace</h1>
                <p className="admin-sign-in__intro">
                  Private access for the team reporting on Maldives travel, hotels and hospitality.
                </p>

                {params.error === "invalid" ? (
                  <p className="admin-sign-in__error" role="alert">
                    We could not sign you in. Check your email and password, then try again.
                  </p>
                ) : null}

                <form action={signIn} className="admin-sign-in__form">
                  <input name="next" type="hidden" value={params.next ?? "/admin"} />
                  <div className="admin-sign-in__field">
                    <label htmlFor="email">Work email</label>
                    <input autoComplete="username" id="email" name="email" required type="email" />
                  </div>
                  <div className="admin-sign-in__field">
                    <label htmlFor="password">Password</label>
                    <input autoComplete="current-password" id="password" name="password" required type="password" />
                  </div>
                  <button className="btn btn--primary admin-sign-in__submit" type="submit">
                    Sign in to workspace <span aria-hidden="true">↗</span>
                  </button>
                </form>
                <p className="admin-sign-in__privacy">
                  Invitation-only access. Contact your workspace administrator if you need an account.
                </p>
              </div>

              <aside aria-label="WheresMaldives editorial desk" className="admin-sign-in__visual">
                <div className="admin-sign-in__visual-top">
                  <span>FIELD NOTES</span>
                  <span>MALDIVES · INDIAN OCEAN</span>
                </div>
                <div aria-label="Abstract atoll map illustration" className="admin-sign-in__atoll" role="img">
                  <span className="admin-sign-in__atoll-ring admin-sign-in__atoll-ring--one" />
                  <span className="admin-sign-in__atoll-ring admin-sign-in__atoll-ring--two" />
                  <span className="admin-sign-in__atoll-ring admin-sign-in__atoll-ring--three" />
                  <span className="admin-sign-in__atoll-island" />
                </div>
                <div className="admin-sign-in__visual-caption">
                  <p className="admin-kicker">A view from the islands</p>
                  <p className="admin-sign-in__visual-headline">Reporting with the Maldives in focus.</p>
                </div>
                <ul className="admin-sign-in__beats" aria-label="Editorial coverage">
                  <li><span>01</span> News & reporting</li>
                  <li><span>02</span> Hotels & hospitality</li>
                  <li><span>03</span> Island life & travel</li>
                </ul>
              </aside>
            </div>

            <div className="admin-sign-in__moment" data-moment="marquee-row" data-moment-opts='{"speed": 36}'>
              <ul className="mo-mq__track">
                <li>Report</li>
                <li>Verify</li>
                <li>Discover</li>
                <li>Publish</li>
                <li>Share the islands</li>
              </ul>
              <p className="admin-sign-in__copyright">© {new Date().getFullYear()} WheresMaldives.com</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
