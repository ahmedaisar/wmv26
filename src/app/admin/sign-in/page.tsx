import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { signIn } from "./actions";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const coverageTopics = [
  "News",
  "Travel",
  "Hospitality",
  "Resorts",
  "Guesthouses",
  "Culture",
  "Atolls",
  "Conservation",
  "Airlines",
  "Dining",
  "Marine life",
];

export default async function AdminSignInPage({ searchParams }: SignInPageProps) {
  const profile = await getCurrentProfile();
  if (profile) redirect("/admin");
  const params = await searchParams;

  return (
    <>
      <header className="nav">
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">Skip to content</a>
          <Link className="nav__logo" href="/">
            <span className="mark" data-mark="dots" aria-hidden="true" />
            WHERESMALDIVES
          </Link>
          <div className="nav__actions">
            <Link className="btn btn--secondary" href="/">View public site</Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--split admin-signin-hero" data-enter>
          <div className="wrap">
            <div className="hero-text hero__grid grid">
              <div className="hero__text admin-signin__copy">
                <p className="hero__kicker">WheresMaldives staff workspace</p>
                <h1>Editorial CMS for Maldives newsrooms</h1>
                <p className="hero__lead">
                  A private publishing workspace for the WheresMaldives newsroom, covering travel and hospitality across the Maldives.
                </p>

                {params.error === "invalid" ? (
                  <p className="admin-signin__error" role="alert">
                    We could not sign you in. Check your email and password, then try again.
                  </p>
                ) : null}

                <form action={signIn} className="form admin-signin__form">
                  <input name="next" type="hidden" value={params.next ?? "/admin"} />
                  <label className="field" htmlFor="email">
                    Work email
                    <input autoComplete="username" id="email" name="email" required type="email" />
                  </label>
                  <label className="field" htmlFor="password">
                    Password
                    <input autoComplete="current-password" id="password" name="password" required type="password" />
                  </label>
                  <div className="btn-row">
                    <button className="btn btn--primary" type="submit">Sign in</button>
                  </div>
                </form>

                <p className="admin-signin__helper">
                  Access is limited to staff accounts invited by a workspace administrator.
                </p>
              </div>

              <aside className="hero__media admin-signin__visual" aria-label="Editorial publishing workflow">
                <div className="admin-signin__panel">
                  <p className="admin-kicker">Editorial workflow</p>
                  <ol className="admin-signin__steps">
                    <li>
                      <span className="admin-signin__step-number">01</span>
                      <span><strong>Draft</strong><small>Prepare the story and byline</small></span>
                    </li>
                    <li>
                      <span className="admin-signin__step-number">02</span>
                      <span><strong>Review</strong><small>Check the facts and category</small></span>
                    </li>
                    <li>
                      <span className="admin-signin__step-number">03</span>
                      <span><strong>Publish</strong><small>Release approved coverage</small></span>
                    </li>
                  </ol>
                  <p className="admin-signin__panel-foot">Draft → Review → Published</p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="closing admin-signin__closing">
        <div className="wrap">
          <p className="admin-kicker">WheresMaldives editorial coverage</p>
          <h2>Stories from across the Maldives</h2>
          <div className="admin-marquee" data-moment="marquee-row" data-moment-opts='{"speed":36}'>
            <ul className="mo-mq__track" aria-label="Editorial coverage topics">
              {coverageTopics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </div>
          <p className="admin-signin__closing-note">WheresMaldives.com · Staff workspace</p>
        </div>
      </footer>
    </>
  );
}
