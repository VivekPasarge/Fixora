import DashboardHero from "../components/TechnicianDashboard/DashboardHero";
import StatsCards from "../components/CustomerDashboard/StatsCards";
import ActiveJob from "../components/TechnicianDashboard/ActiveJob";
import TodaySchedule from "../components/TechnicianDashboard/TodaySchedule";
import EarningsCard from "../components/TechnicianDashboard/EarningsCard";
import AvailabilityCard from "../components/TechnicianDashboard/AvailabilityCard";
//import ReviewsCard from "../components/TechnicianDashboard/ReviewsCard";
import ReviewsCard from "../components/TechnicianDashboard/ReviewsCard";
import WalletCard from "../components/TechnicianDashboard/WalletCard";
import AvailableJobs from "../components/TechnicianDashboard/AvailableJobs";
import AssignedJobs from "../components/TechnicianDashboard/AssignedJobs";
import TechnicianStats from "../components/TechnicianDashboard/TechnicianStats";

const TechnicianDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">

      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-28 pb-16">

        <DashboardHero />
        <TechnicianStats />
        <ActiveJob/>
        <div className="grid lg:grid-cols-2 gap-8">

          <TodaySchedule />

          <EarningsCard />

        </div>
        <AvailabilityCard/>
        <ReviewsCard/>
        <WalletCard/>
        <AvailableJobs />
        <AssignedJobs />
        

      </div>

    </div>
  );
};

export default TechnicianDashboard;