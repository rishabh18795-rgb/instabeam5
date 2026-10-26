import type { Metadata } from "next";
import { SettingsView } from "@/components/ops/SettingsView";
import { PageHeader } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import type { TeamMember } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase, profile } = await getBasics();
  const [{ data: ws }, { data: team }] = await Promise.all([
    supabase.from("workspaces").select("name,tagline,timezone").limit(1).maybeSingle(),
    supabase.rpc("team_status"),
  ]);
  const { avatar_url, ...rest } = profile;
  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile, notifications and workspace." />
      <SettingsView profile={rest} avatarUrl={avatar_url} workspace={ws ?? { name: "InstaBeam", tagline: null, timezone: "Asia/Kolkata" }} team={(team ?? []) as TeamMember[]} />
    </>
  );
}
