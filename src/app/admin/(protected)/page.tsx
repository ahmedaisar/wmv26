import { requireRoles } from "@/lib/auth";

const staffRoles = ["admin", "editor", "journalist", "contributor", "commercial"] as const;

export default async function AdminDashboardPage() {
  const profile = await requireRoles(staffRoles);

  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">Workspace overview</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] text-ocean">
        {profile.display_name ? "Welcome back, " + profile.display_name + "." : "Welcome back."}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        Your staff workspace is connected. Editorial tools will appear here as their workflows are delivered.
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="border border-sand bg-white p-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-lagoon">01</span>
          <h2 className="mt-8 text-xl font-medium text-ocean">Editorial</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Article workflow and publishing tools.</p>
        </div>
        <div className="border border-sand bg-white p-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-lagoon">02</span>
          <h2 className="mt-8 text-xl font-medium text-ocean">Property directory</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Hotel and destination records.</p>
        </div>
        <div className="border border-sand bg-white p-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-lagoon">03</span>
          <h2 className="mt-8 text-xl font-medium text-ocean">Workspace access</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Your assigned role: {profile.role}.</p>
        </div>
      </div>
    </section>
  );
}
