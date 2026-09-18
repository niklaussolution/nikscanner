import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommunityHero } from "@/components/community/community-hero";
import { CommunityWorkspace } from "@/components/community/community-workspace";
import { CommunityActivityTicker } from "@/components/community/community-activity-ticker";
import { communityTheme } from "@/components/community/theme";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ ...communityTheme, backgroundColor: "var(--background)" }}>
        <CommunityHero />
        <CommunityWorkspace />
        <CommunityActivityTicker />
      </main>
      <Footer />
    </>
  );
}
