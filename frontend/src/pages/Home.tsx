import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import { faClock, faBookmark, faComment, faHeart } from "@fortawesome/free-regular-svg-icons"
import axios from 'axios'

export default function Home(){

  const navigate = useNavigate();

  const [recentPosts, setRecentPosts] = useState([]);
  const [postCount, setPostCount] = useState([]);

  useEffect(() => {
    axios.get(
      `${import.meta.env.VITE_BASE_URL}/post/recent-posts`
    )
    .then(async (repsonse) => {
      console.log(repsonse.data.data.posts);
      if(repsonse.data.data.posts){
        setRecentPosts(repsonse.data.data.posts);
      }
    })
    .catch((error) => {
      console.log(error);
    })

    axios.get(
      `${import.meta.env.VITE_BASE_URL}/category/post-count`
    )
    .then(async (repsonse) => {
      console.log(repsonse.data.data);
      if(repsonse.data.data){
        setPostCount(repsonse.data.data);
      }
    })
    .catch((error) => {
      console.log(error);
    })
  },[]);

  return(
    <>
      <main className="py-12 md:py-6">
        <section>
          <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {/* Featured Article */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Featured Article</h2>
                <div className="shadow-sm overflow-hidden border rounded">
                  <img 
                    className="w-full h-64 md:h-80 object-cover" 
                    src="./featured-image.avif"
                    alt='featured-image'
                  />
                  
                  <div className="p-5 space-y-2">
                    <h3 className="font-semibold text-2xl md:text-3xl leading-tight">
                      The Future of Web Development: Trends to Watch in 2025
                    </h3>
                    <p className="text-base text-muted-foreground">
                      Explore the latest trends shaping the web development landscape from AI integration to new frameworks.
                    </p>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div>
                        <p 
                          className="font-medium"
                        >
                          Sarah Johnson
                        </p>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faCalendarDays} />
                            <p>
                              Dec 15, 2023
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faClock} />
                            <p>8 min read</p>
                          </div>
                        </div>
                      </div>
                    <div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
              
              {/* Latest Article */}
              <div>
                <h2 className="my-8 text-3xl font-bold">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {
                    recentPosts.map(post => {
                      return (
                        <Link to={`/blog/${post.slug}`} key={post._id} className="border rounded">
                          <div className="w-full h-48 bg-muted">
                            {/* <img href="" /> */}
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
                                  {
                                    post.author.profileImg 
                                    ?
                                    <img className="w-full h-full object-cover rounded-full" src={post.author.profileImg} alt='profile-img' />
                                    :
                                    <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{post.author.fullname.firstname[0]}</span>
                                  }
                                </div>
                                <div>
                                  <p className="font-medium">{post.author.fullname.firstname + ' ' + post.author.fullname.lastname}</p>
                                  <p className="text-muted-foreground">
                                    {
                                      new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'short', day: 'numeric'}).format(new Date(post.updatedAt))
                                    }
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">6 min read</p>
                              </div>
                            </div>
                          </div>
                        </Link>      
                      )
                    })
                  }
                </div>
              </div>

              {/* Posts */}
              <div>
                <div className="my-15 space-y-4">
                  {
                    Array.from({ length: 3 }).map((_, x) => (
                      <div key={x} className="p-6 space-y-1 border rounded">
                        <h3 className="mb-2 font-semibold text-xl">Getting Started with TypeScript</h3>
                        <p className="text-base text-muted-foreground mb-3">A beginner's guide to adding type safety to your Javascript Projects.</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="basis-[70%] flex justify-between">
                            <p>Alex Roddriguez</p>
                            <p> Dec 8, 2023</p>
                            <div className="flex items-center space-x-1">
                              <FontAwesomeIcon icon={faHeart} />
                              <p>200</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FontAwesomeIcon icon={faComment} />
                              <p>40</p>
                            </div>
                          </div>
                          <div className="space-x-4">
                            <FontAwesomeIcon icon={faBookmark} />
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="my-10 flex justify-center">
                  <button className="px-2 py-1 btn-2 rounded">Load More</button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col-reverse lg:flex-col  space-y-8">
              {/* Newsletter */}
              <div className="p-6 space-y-4 border rounded">
                <div className="space-y-2">
                  <h2 className="font-semibold text-2xl">Newsletter</h2>
                  <p className="mb-5 text-sm text-muted-foreground">Get the latest articles delivered straight into your inbox.</p>
                </div>
                <div className="space-y-4">
                  <input 
                    className="p-2 w-full text-sm border rounded"
                    type="email" 
                    placeholder="Enter yout email"/>
                  <button 
                    className="py-2 w-full  btn-1 text-sm rounded"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">No spam, unsubscribe at any time</p>
              </div>

              {/* Categories */}
              <div className="p-5 space-y-2 hide-on-mobile border rounded">
                <h2 className="font-semibold text-2xl">Categories</h2>
                <Link to="/" className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded">
                  <span>
                    Technology
                  </span>
                  <span>
                    {postCount.find((cat: any) => cat.categoryName === "technology")?.count ?? 0}
                  </span>
                </Link>
                <Link to="" className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded">
                  <span>
                    Development
                  </span>
                  <span>
                    {postCount.find((cat: any) => cat.categoryName === "development")?.count ?? 0}
                  </span>
                </Link>
                <Link to="" className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded">
                  <span>
                    Design
                  </span>
                  <span>
                    {postCount.find((cat: any) => cat.categoryName === "design")?.count ?? 0}
                  </span>
                </Link>
                <Link to="" className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded">
                  <span>
                    Tutorial
                  </span>
                  <span>
                    {postCount.find((cat: any) => cat.categoryName === "tutorial")?.count ?? 0}
                  </span>
                </Link>
                <Link to="" className="px-1.5 py-0.5 font-semibold text-lg flex justify-between hover:bg-muted rounded">
                  <span>
                    Best Practices
                  </span>
                  <span>
                    {postCount.find((cat: any) => cat.categoryName === "best practices")?.count ?? 0}
                  </span>
                </Link>
              </div>

              {/* Popular this Week */}
              <div className="p-6 mb-8 space-y-4 border rounded">
                <h2 className="font-semibold text-2xl">Popular This Week</h2>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm">
                    <span className="px-4 w-8 h-8 bg-primary font-semibold text-white flex items-center justify-center rounded-full">
                      1
                    </span>
                    <div className="space-y-1">
                      <Link to="" className="font-semibold">The Future of Web Development: Trends to Watch in 2025</Link>
                      <p className="text-xs text-muted-foreground">8 min read</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-4 w-8 h-8 bg-primary font-semibold text-white flex items-center justify-center rounded-full">
                      2
                    </span>
                    <div className="space-y-1">
                      <Link to="" className="font-semibold">Building Scalable React Applications</Link>
                      <p className="text-xs text-muted-foreground">6 min read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}