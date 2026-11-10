"use client";

export default function HotelsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="wm-shell py-20"><section className="wm-empty"><p className="wm-eyebrow">The atlas is unavailable</p><h1 className="wm-title mt-3 text-2xl">We could not load the property directory.</h1><p className="wm-copy mt-3">Please try again. No property information has been changed.</p><button className="wm-button mt-6" onClick={reset} type="button">Try again</button></section></main>;
}
