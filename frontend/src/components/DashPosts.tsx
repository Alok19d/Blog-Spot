import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ellipsis, Eye, SquarePen, Trash2 } from "lucide-react"
import axios from "axios";

export default function DashPosts({userPosts, setUserPosts}) {
  
  const navigate = useNavigate();

  const [showMore, setShowMore] = useState(true);

  useEffect(() => {
    if(userPosts.length < 8){
      setShowMore(false);
    }
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

  async function handleDeletePost(postId){
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/post/delete-post/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUserPosts((prev) => prev.filter((post)=> post._id !== postId));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <input className="px-3 py-2 border rounded" placeholder="Search Posts..."/>
      </div>
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
                  <tr className="border-b" key={post._id}>
                    <td className="p-4 capitalize">
                      <p className="text-sm font-medium">{post.title}</p>
                    </td>
                    <td className="p-4 text-xs capitalize">
                      <span className={`px-2 font-semibold rounded ${post.status === 'published' ? "bg-green-100 text-green-800" : "bg-muted"}`}>{post.status}</span>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="px-2 text-xs font-semibold border rounded">{post.category}</span>
                    </td>
                    <td className="p-4 text-sm">1,000</td>
                    <td className="p-4 text-sm">
                      {new Date(post.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-right">
                      <button className="group relative h-8 w-8 flex items-center justify-center hover:bg-muted rounded">
                        <Ellipsis size={18} />
                        <div 
                          className="min-w-32 p-1 absolute top-full right-0 z-10 bg-white text-sm border rounded hidden group-focus:block"
                          onMouseDown={(e) => {e.preventDefault()}}
                        >
                          <p 
                            className="px-2 py-1 flex gap-2 hover:bg-muted rounded"
                            onClick={() => {
                              navigate(`/blog/${post.slug}`)
                            }}
                          >
                            <span><Eye size={16} /></span>
                            View
                          </p>
                          <p 
                            className="px-2 py-1 flex gap-2 hover:bg-muted rounded"
                            onClick={() => {
                              navigate(`/update-post/${post._id}`)
                            }}
                          >
                            <span><SquarePen size={16} /></span>
                            Edit
                          </p>
                          <p 
                            className="px-2 py-1 flex gap-2 text-red-700 hover:bg-red-100 rounded"
                            onClick={() => {handleDeletePost(post._id)}}
                          >
                            <span><Trash2 size={16} /></span>
                            Delete
                          </p>
                        </div>
                      </button>
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
    </div>
  )
}
