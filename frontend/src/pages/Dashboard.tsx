import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CirclePlus } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileLines, faHeart, faComment } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import DashPosts from "../components/DashPosts";
import DashComments from "../components/DashComments";

interface IDashboardData {
  totalViews: number;
  viewsThisMonth: number;
  totalPosts: number;
  publishedPosts: number;
  totalLikes: number;
  likesThisWeek: number;
  totalComments: number;
  commentsThisWeek: number; 
}

export default function Dashboard(){

  const { profile } = useSelector(state => state.user);
  
  const [tab, setTab] = useState('posts');
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);

  async function fetchDashboardData(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDashboardData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  },[])

  return (
    <main>
      <section className="px-4 py-8">
        <div className="container">
          <h1 className="mb-2 text-3xl font-bold">Welcome Back, {profile.fullname.firstname}!</h1>
          <p className="mb-8 text-muted-foreground">Here' what happening with your blog today.</p>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border rounded-md">
              <div className=" mb-2 flex justify-between">
                <span className="text-sm font-medium">Total Views</span>
                <FontAwesomeIcon className="text-muted-foreground" icon={faEye}/>
              </div>
              <p className="font-bold text-2xl">{dashboardData?.totalViews}</p>
              <p className="text-xs text-muted-foreground">+{dashboardData?.viewsThisMonth} this month</p>
            </div>
            <div className="p-6 border rounded-md">
              <div className=" mb-2 flex justify-between">
                <span className="text-sm font-medium">Total Posts</span>
                <FontAwesomeIcon className="text-muted-foreground" icon={faFileLines}/>
              </div>
              <p className="font-bold text-2xl">{dashboardData?.totalPosts ? dashboardData?.totalPosts : 0}</p>
              <p className="text-xs text-muted-foreground">{dashboardData?.publishedPosts ? dashboardData?.publishedPosts : 0} published</p>
            </div>
            <div className="p-6 border rounded-md">
              <div className=" mb-2 flex justify-between">
                <span className="text-sm font-medium">Likes</span>
                <FontAwesomeIcon className="text-muted-foreground" icon={faHeart}/>
              </div>
              <p className="font-bold text-2xl">{dashboardData?.totalLikes}</p>
              <p className="text-xs text-muted-foreground">+{dashboardData?.likesThisWeek} this week</p>
            </div>
            <div className="p-6 border rounded-md">
              <div className=" mb-2 flex justify-between">
                <span className="text-sm font-medium">Comments</span>
                <FontAwesomeIcon className="text-muted-foreground" icon={faComment}/>
              </div>
              <p className="font-bold text-2xl">{dashboardData?.totalComments}</p>
              <p className="text-xs text-muted-foreground">+{dashboardData?.commentsThisWeek} this week</p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-8 mb-20">
        <div className="container space-y-6">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 flex space-x-5 bg-muted rounded-md">
              <button 
                className={`px-2 py-1 rounded ${tab === 'posts' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => {setTab('posts')}}
              >
                Posts
              </button>
              <button 
                className={`px-2 py-1 rounded ${tab === 'comments' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => {setTab('comments')}}
              >
                Comments
              </button>
              <button 
                className={`px-2 py-1 rounded ${tab === 'likes' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => {setTab('likes')}}
              >
                Liked Posts
              </button>
              <button 
                className={`px-2 py-1 rounded ${tab === 'bookmarks' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => {setTab('bookmarks')}}
              >
                Bookmarks
              </button>
            </div>
            <div>
              <Link to='/new-post' className="px-3 py-1.5 space-x-2 flex items-center btn-1 rounded-md">
                <CirclePlus size={18} />
                <span>New Post</span>
              </Link>
            </div>
          </div>
          {
            tab === 'posts' ?
            <DashPosts toast={toast} /> :
            tab === 'comments' ?
            <DashComments toast={toast} /> :
            <div></div>
          }
        </div>
      </section>
      <ToastContainer />
    </main>
  )
}