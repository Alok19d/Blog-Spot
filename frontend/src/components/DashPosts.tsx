import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react"
import axios from "axios";
import { toast } from "react-toastify";

interface IPost{
  _id: string;
  title: string;
  category: {
    _id: string;
    name: string;
  }
  slug: string;
  status: "draft" | "published";
  createdAt: string;
  likeCount: number;
  viewCount: number;
}

interface IDashPostsProps {
  toast: typeof toast
}

export default function DashPosts({ toast }: IDashPostsProps) {
  
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [showMore, setShowMore] = useState(true);

  async function fetchUserPosts(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/my-posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if(response.data.data.posts.length < 8){
        setShowMore(false);
      }
      setUserPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUserPosts();
  },[])

  async function loadMorePosts(){
    const startIndex = userPosts.length;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/my-posts?startIndex=${startIndex}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log(response);
      if(response.data.data.posts.length < 8){
        setShowMore(false);
      }
      setUserPosts((prev) => [...prev, ...response.data.data.posts]);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeletePost(postId: string){
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/post/delete/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success(response.data.message);
      setUserPosts((prev) => prev.filter((post)=> post._id !== postId));
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while deleting the post."
      );
    }
  }

  return (
    <div className="p-6 border rounded">
      <h3 className="text-2xl font-semibold">Your Posts</h3>
      <p className="mb-6 text-sm text-muted-foreground">Manage and track your blog posts</p>
      <table className="w-full">
        <thead className="h-12 text-sm text-muted-foreground text-left border-b">
          <tr>
            <th className="px-4 font-medium">Title</th>
            <th className="px-4 font-medium">Status</th>
            <th className="px-4 font-medium">Category</th>
            <th className="px-4 font-medium">Views</th>
            <th className="px-4 font-medium">Date</th>
            <th className="px-4 font-medium w-max">Actions</th>
          </tr>
        </thead>
        <tbody>
          {
            userPosts.map((post) => {
              return(
                <tr className="border-b hover:bg-muted" key={post._id}>
                  <td className="p-4 capitalize">
                    <Link 
                      to={`${post.status === 'draft' ? `/preview/${post._id}` : `/blog/${post.slug}`}`} 
                      className="text-sm font-medium"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-4 text-xs capitalize">
                    <span className={`px-2 font-semibold rounded ${post.status === 'published' ? "bg-green-100 text-green-800" : "bg-muted"}`}>{post.status}</span>
                  </td>
                  <td className="p-4 capitalize">
                    <span className="px-2 text-xs font-semibold border rounded">{post.category.name}</span>
                  </td>
                  <td className="p-4 text-sm">{post.viewCount}</td>
                  <td className="p-4 text-sm">
                    {new Date(post.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-full flex items-center justify-start gap-3">
                      <button onClick={() => {
                          navigate(`/update-post/${post._id}`)
                        }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => {handleDeletePost(post._id)}}>
                        <Trash2 className="text-red-600" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      {
        showMore &&
        <div className="mt-10 flex justify-center">
          <button 
            className="px-2 py-1 btn-2 rounded" 
            onClick={loadMorePosts}
          >
            Show More
          </button>
        </div>
      }
    </div>
  )
}
