import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bookmark, Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';

interface IPost {
  _id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  author: {
    fullname: {
      firstname: string;
      lastname: string;
    };
    profileImg: string;
  };
  readingTime: string;
  updatedAt: string;
  viewCount?: number;
  likeCount?: number;
}

type CategoryCounts = {
  technology: number;
  development: number;
  design: number;
  tutorial: number;
  'best practices': number;
};

export default function Home() {

  const [email, setEmail] = useState('');
  const [featuredPost, setFeaturedPost] = useState<IPost | null>(null);
  const [postCountByCategory, setPostCountByCategory] = useState<CategoryCounts | null>(null);
  const [recentPosts, setRecentPosts] = useState<IPost[]>([]);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [showMore, setShowMore] = useState(true);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const { profile } = useSelector(state => state.user);

  async function fetchfeaturedPost() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/featured-post`
      );
      setFeaturedPost(response.data.data.post);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchPostCountByCategory() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/count-by-category`
      );
      setPostCountByCategory(response.data.data.postCount);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRecentPosts() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/fetch-posts?limit=2`
      );
      setRecentPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchPosts(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/fetch-posts?order=asc`
      );
      setPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchBookmarkedPosts() {
    if(!profile) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/bookmark/`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBookmarkedPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchLikedPosts() {
    if(!profile) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/view/`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setLikedPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchfeaturedPost();
    fetchPostCountByCategory();
    fetchBookmarkedPosts();
    fetchLikedPosts();
    fetchRecentPosts();
    fetchPosts();
  }, []);

  async function loadMorePosts() {
    const startIndex = posts.length;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/fetch-posts?startIndex=${startIndex}`
      );

      if(response.data.data.posts.length < 5){
        setShowMore(false);
      }
      setPosts(prev => [...prev, ...response.data.data.posts]);
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleBookmark(postId: string){
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/bookmark/toggle/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if(response.data.data.isBookmarked){
        setBookmarkedPosts(prev => [...prev, postId]);
        toast.success('Post Bookmarked Successfully!');
      }
      else{
        setBookmarkedPosts((prev) => prev.filter((id) => id !== postId));
        toast.success('Post Un-Bookmarked Successfully!');
      }
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while toggling bookmark."
      );
    }
  }

  async function toggleLike(postId: string){
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/view/toggleLike/${postId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if(response.data.data.isLiked){
        setPosts(curr =>
          curr.map(item => {
            if (item._id === postId) {
              return {
                ...item,
                likeCount: response.data.data.likes
              };
            }
            return item;
          })
        );
        setLikedPosts(prev => [...prev, postId]);
      }
      else {
        setPosts(curr =>
          curr.map(item => {
            if (item._id === postId) {
              return {
                ...item,
                likeCount: response.data.data.likes
              };
            }
            return item;
          })
        );
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function subscribeToNewsletter(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/newsletter/subscribe`,
        {
          email
        }
      );
      setEmail('');
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while subscribing to newsletter."
      );
    }
  }

  return (
    <>
      <main className="py-12 md:py-6">
        <section>
          <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {/* Featured Article */}
              <Link to={`/blog/${featuredPost?.slug}`}>
                <h2 className="text-3xl font-bold mb-8">Featured Article</h2>
                <div className="shadow-sm overflow-hidden border rounded">
                  {/* Cover Image */}
                  <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
                    {featuredPost?.coverImage !== "" && (
                      <img
                        className="w-full object-cover"
                        src={featuredPost?.coverImage}
                        alt="featured-image"
                      />
                    )}
                  </div>
                  
                  {/* Post Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-semibold text-2xl md:text-3xl leading-tight">
                      {featuredPost?.title}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {featuredPost?.excerpt}
                    </p>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
                        {featuredPost?.author.profileImg !== "" && (
                          <img
                            className="w-full h-full object-cover"
                            src={featuredPost?.author.profileImg}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {featuredPost?.author.fullname.firstname +
                            " " +
                            featuredPost?.author.fullname.lastname}
                        </p>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faCalendarDays} />
                            <p>
                              {featuredPost &&
                                new Intl.DateTimeFormat("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }).format(new Date(featuredPost?.updatedAt))}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faClock} />
                            <p>{featuredPost?.readingTime} read</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Latest Article */}
              <div>
                <h2 className="my-8 text-3xl font-bold">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {recentPosts.map((post) => {
                    return (
                      <Link
                        to={`/blog/${post.slug}`}
                        key={post._id}
                        className="border rounded"
                      >
                        <div className="w-full h-48 bg-muted">
                          {post.coverImage !== "" && (
                            <img
                              className="w-full h-full object-cover"
                              src={post.coverImage}
                            />
                          )}
                        </div>

                        <div className="p-3 space-y-2">
                          <h3 className="font-semibold text-xl leading-tight">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {post.excerpt}
                          </p>

                          <div className="pt-2 flex items-center justify-between text-sm ">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full">
                                {post.author.profileImg ? (
                                  <img
                                    className="w-full h-full object-cover rounded-full"
                                    src={post.author.profileImg}
                                    alt="profile-img"
                                  />
                                ) : (
                                  <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">
                                    {post.author.fullname.firstname[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {post.author.fullname.firstname +
                                    " " +
                                    post.author.fullname.lastname}
                                </p>
                                <p className="text-muted-foreground">
                                  {new Intl.DateTimeFormat("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }).format(new Date(post.updatedAt))}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                6 min read
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Posts */}
              <div>
                <div className="my-15 space-y-4">
                  {posts.map((post, x) => (
                    <div key={x} className="p-6 space-y-1 border rounded">
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="mb-2 font-semibold text-xl">
                          {post.title}
                        </h3>
                        <p className="text-base text-muted-foreground mb-3">
                          {post.excerpt}
                        </p>
                      </Link>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="basis-[70%] flex justify-between">
                          <p> 
                            {post.author.fullname.firstname + " " + post.author.fullname.lastname}
                          </p>
                          <p>
                            {
                              new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }).format(new Date(post.updatedAt))
                            }
                          </p>
                          <div 
                            className="flex items-center space-x-1"
                            onClick={() => {toggleLike(post._id)}}
                          >
                            {
                              likedPosts.includes(post._id) ?
                              <Heart size={16} color="red" fill="red" />
                              :
                              <Heart size={16} />
                            }
                            <p>{post?.likeCount}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <p className="space-x-1">
                              <span>{post?.viewCount ?? 0}</span>
                              <span>views</span>
                            </p>
                          </div>
                        </div>
                        <div onClick={() => {toggleBookmark(post._id)}}>
                          {
                            bookmarkedPosts.includes(post._id) ?
                            <Bookmark size={16} fill='black' />
                            :
                            <Bookmark size={16} />
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="my-10 flex justify-center">
                  {
                    showMore &&
                    <button className="px-2 py-1 btn-2 rounded" onClick={loadMorePosts}>Load More</button>
                  }
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col-reverse lg:flex-col  space-y-8">
              {/* Newsletter */}
              <div className="p-6 space-y-4 border rounded">
                <div className="space-y-2">
                  <h2 className="font-semibold text-2xl">Newsletter</h2>
                  <p className="mb-5 text-sm text-muted-foreground">
                    Get the latest articles delivered straight into your inbox.
                  </p>
                </div>
                <form onSubmit={subscribeToNewsletter} className="space-y-4">
                  <input
                    className="p-2 w-full text-sm border rounded"
                    type="email"
                    placeholder="Enter yout email"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}}
                    required
                  />
                  <button type='submit' className="py-2 w-full  btn-1 text-sm rounded" >
                    Subscribe
                  </button>
                </form>              
                <p className="text-xs text-muted-foreground">
                  No spam, unsubscribe at any time
                </p>
              </div>

              {/* Categories */}
              <div className="p-5 space-y-2 hide-on-mobile border rounded">
                <h2 className="font-semibold text-2xl">Categories</h2>
                <Link
                  to="/"
                  className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded"
                >
                  <span>Technology</span>
                  <span>
                    {
                      postCountByCategory &&
                      postCountByCategory['technology']
                    }
                  </span>
                </Link>
                <Link
                  to=""
                  className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded"
                >
                  <span>Development</span>
                  <span>
                    {
                      postCountByCategory &&
                      postCountByCategory['development']
                    }
                  </span>
                </Link>
                <Link
                  to=""
                  className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded"
                >
                  <span>Design</span>
                  <span>
                    {
                      postCountByCategory &&
                      postCountByCategory['design']
                    }
                  </span>
                </Link>
                <Link
                  to=""
                  className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded"
                >
                  <span>Tutorial</span>
                  <span>
                    {
                      postCountByCategory &&
                      postCountByCategory['tutorial']
                    }
                  </span>
                </Link>
                <Link
                  to=""
                  className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded"
                >
                  <span>Best Practices</span>
                  <span>
                    {
                      postCountByCategory &&
                      postCountByCategory['best practices']
                    }
                  </span>
                </Link>
              </div>

              {/* Popular this Week */}
              {/* <div className="p-6 mb-8 space-y-4 border rounded">
                <h2 className="font-semibold text-2xl">Popular This Week</h2>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm">
                    <span className="px-4 w-8 h-8 bg-primary font-semibold text-white flex items-center justify-center rounded-full">
                      1
                    </span>
                    <div className="space-y-1">
                      <Link to="" className="font-semibold">
                        The Future of Web Development: Trends to Watch in 2025
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        8 min read
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-4 w-8 h-8 bg-primary font-semibold text-white flex items-center justify-center rounded-full">
                      2
                    </span>
                    <div className="space-y-1">
                      <Link to="" className="font-semibold">
                        Building Scalable React Applications
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        6 min read
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>
        <ToastContainer />
      </main>
    </>
  );
}
