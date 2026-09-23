import { CommunityPulse } from "@/components/community/community-pulse";
import { RecentReports } from "@/components/community/recent-reports";
import { RewardProgress } from "@/components/community/reward-progress";

export function CommunitySidebar() {
  return (
    <div data-workspace-sidebar className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="lg:flex-1">
          <CommunityPulse />
        </div>
        <div className="lg:flex-1">
          <RecentReports />
        </div>
      </div>
      <RewardProgress />
    </div>
  );
}
