import { CommunityPulse } from "@/components/community/community-pulse";
import { RecentReports } from "@/components/community/recent-reports";
import { RewardProgress } from "@/components/community/reward-progress";

export function CommunitySidebar() {
  return (
    <div data-workspace-sidebar className="flex flex-col gap-5 lg:col-span-5">
      <CommunityPulse />
      <RecentReports />
      <RewardProgress />
    </div>
  );
}
