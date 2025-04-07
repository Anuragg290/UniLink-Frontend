import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Users, MessageSquare, Share2, Heart, Calendar, Loader2 } from "lucide-react";
import { fireApi } from "../../utils/useFire";
import Sidebar from "../../components/Sidebar";
import RecommendedUser from "../../components/RecommendedUser";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  const getAnalytics = async () => {
    try {
      const response = await fireApi("/my-report", "POST");
      console.log("Analytics response:", response?.data);
      setAnalytics(response?.data || null);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getSugestion = async () => {
    try {
      const response = await fireApi("/suggestions", "GET");
      setRecommendedUsers(response);
    } catch (error) {
      console.error("Error in getSugestion:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    getAnalytics();
    getSugestion();
  }, []);

  const StatCard = ({ icon, title, value }) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <h1 className="text-2xl font-bold mb-6">Profile Analytics Of Last 30 Days</h1>

        {!analytics ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <Users size={64} className="mx-auto text-blue-500" />
            </div>
            <Loader2 className="mx-auto text-blue-500 animate-spin" size={64} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={<MessageSquare size={24} />}
              title="Total Comments"
              value={analytics.totalComments || 0}
            />
            <StatCard
              icon={<Share2 size={24} />}
              title="Total Shares"
              value={analytics.totalShares || 0}
            />
            <StatCard
              icon={<Heart size={24} />}
              title="Total Likes"
              value={analytics.totalLikes || 0}
            />
            <StatCard
              icon={<Calendar size={24} />}
              title="Total Events"
              value={analytics.totalEvents || 0}
            />
            <StatCard
              icon={<Users size={24} />}
              title="Total Posts"
              value={analytics.totalPosts || 0}
            />
            <StatCard
              icon={<MessageSquare size={24} />}
              title="Event Comments"
              value={analytics.totalEventComments || 0}
            />
          </div>
        )}
      </div>

      {recommendedUsers?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">People you may know</h2>
            {recommendedUsers?.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;