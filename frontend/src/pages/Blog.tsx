import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Bookmark, CalendarDays, Clock, Heart, MessageSquare, Share2 } from "lucide-react";
import axios from 'axios';
import DomPurify from 'dompurify';
import {toast, ToastContainer} from 'react-toastify';

interface IPost{
  _id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  category: {
    _id: string;
    name: string;
  }
  tags: string[];
  content: string;
  slug: string;
  tableOfContent?: {
    id: string;
    level: number;
    textContent: string;
  }[]
  author: {
    fullname: {
      firstname: string;
      lastname: string;
    }
    profileImg?: string;
  }
  readingTime: string;
  status: "draft" | "published";
  updatedAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

interface IComment{

}

interface IRelatedPosts{
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  readingTime: string;
}

export default function Blog(){

  const {postSlug} = useParams();
  const navigate = useNavigate();

  const initializeRef = useRef(false);

  const [post, setPost] = useState<IPost | null>(null);
  const [like, setLike] = useState(false);
  const [bookmark, setBookmark] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState<IRelatedPosts[]>([]);

  const { profile } = useSelector(state => state.user);

  async function fetchBookmarkStatus(){
    if(!profile) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/bookmark/status?postId=${post?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBookmark(response.data.data.isBookmarked);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchViewsAndLikes(){
    try {
      let response;
      if(profile){
        response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/view/status?postId=${post?._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      else{
        response = await axios.get(`${import.meta.env.VITE_BASE_URL}/view/?postId=${post?._id}`);
      }

      setPost(curr => {
        if (!curr) return curr;
        return {
          ...curr,
          viewCount: response.data.data.views,
          likeCount: response.data.data.likes
        };
      });
      setLike(response.data.data.isLiked);
    } catch (error) {
      console.log(error);
    }
  } 

  async function fetchComments(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/comment/getPostComments/${post?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log(response.data.data.comments);
      // setComments(response.data.data.comments);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRelatedPosts(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/post/related-posts?postId=${post?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRelatedPosts(response.data.data.posts);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!initializeRef.current){
      initializeRef.current = true;

      axios
      .get(`${import.meta.env.VITE_BASE_URL}/post/post?slug=${postSlug}`)
      .then(async (repsonse) => {
        setPost(repsonse.data.data.post);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  },[postSlug]);

  useEffect(() => {
    if(post?._id){
      fetchBookmarkStatus();
      fetchViewsAndLikes();
      fetchComments();
      fetchRelatedPosts();
    }
  },[post?._id]);

  async function toggleBookmark(){
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/bookmark/toggle/${post?._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if(response.data.data.isBookmarked){
        toast.success('Post Bookmarked Successfully!');
      }
      else{
        toast.success('Post Un-Bookmarked Successfully!');
      }

      setBookmark(response.data.data.isBookmarked);
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while toggling bookmark."
      );
    }
  }

  async function toggleLikePost(){
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/view/toggleLike/${post?._id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setPost(curr => {
        if(!curr) return curr;
        return {
          ...curr, 
          likeCount: response.data.data.likes
        }
      });
      setLike(response.data.data.isLiked);
    } catch (error) {
      console.log(error);
    }
  }

  async function CopyToClipboard(link: string){
    try {
      await navigator.clipboard.writeText(link);
      setShowShareLink(false);
      toast.success('Share Link Copied to Clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  // Done
  async function postComment(){
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comment/create`,
        {
          postId: post?._id,
          content: comment
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setComment('');
      // setComments(curr => [response.data.data.comment, ...curr]);
      console.log(response.data.data.comment);
    } catch (error) {
      console.log(error);
    }
  }

  async function likeComment(commentId: string) {
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/comment/likeComment/${commentId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setComments(comments.map((comment) => 
        comment._id === commentId
          ? {
              ...comment,
              likes: response.data.data.comment.likes,
              numberOfLikes: response.data.data.comment.numberOfLikes
            }
          : comment
      ));
    } catch (error) {
      console.log(error);
    }
  }

  async function editComment(commentId: string) {
    
  }

  async function deleteComment(commentId: string) {

  }

  return (
    <main>
      <section className="mb-15">
        <div className="px-4 py-8 container grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2.5 py-0.5 bg-black text-white text-xs font-semibold capitalize rounded-lg">{post?.category.name}</span>
            </div>
            <div className="mb-8">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold">{post?.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{post?.excerpt}</p>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <span className="h-12 w-12 rounded-full overflow-hidden">
                    {
                      post?.author.profileImg 
                      ?
                      <img className="w-full h-full object-cover" src={post?.author.profileImg} alt='profile-img' />
                      :
                      <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{post?.author.fullname.firstname[0]}</span>
                    }
                  </span>
                  <div>
                    <p className="font-medium">{post?.author.fullname.firstname + ' ' + post?.author.fullname.lastname}</p>
                    <div className="flex items-center text-muted-foreground text-sm space-x-2">
                      <CalendarDays size={16} />
                      <span>
                        {
                          post &&
                          new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(post?.updatedAt))
                        }
                      </span>
                      <Clock size={16} />
                      <span>{post?.readingTime} read</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-cent space-x-2">
                  <button 
                    className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted"
                    onClick={toggleLikePost}
                  >
                    {
                      like ?
                      <Heart size={16} color="red" fill="red" />
                      :
                      <Heart size={16} />
                    }
                    <span className="font-medium">{post?.likeCount ?? 0}</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <MessageSquare size={16} />
                    <span className="font-medium">{post?.commentCount ?? 0}</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted" onClick={toggleBookmark}>
                    {
                      bookmark ?
                      <Bookmark size={16} fill='black' />
                      :
                      <Bookmark size={16} />
                    }
                  </button>
                  <button 
                    className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted"
                    onClick={() => {setShowShareLink(curr => !curr)}}  
                  >
                    <Share2 size={16} />
                  </button>
                  {
                    showShareLink &&
                    <div className="w-full p-2 space-y-2 absolute top-full right-0 bg-white border rounded">
                      <p className="px-2 py-1 break-all text-muted-foreground border rounded">
                        http://localhost:5173/blog/{post?.slug}
                      </p>
                      <button className="w-full px-2 py-1 btn-1 rounded" onClick={ () => {CopyToClipboard(`http://localhost:5173/blog/${post?.slug}`)}}>Copy to Clipboard</button>
                    </div>
                  }
                </div>
              </div>
              {
                post && post?.coverImage !== '' &&
                <img className="w-full object-cover" src={post.coverImage} />
              }
            </div>

            {/* Content */}
            {
              post?.content &&
              <div className="post-content" dangerouslySetInnerHTML={{__html: DomPurify.sanitize(post?.content)}}>
              </div>
            }

            {/* Tags */}
            <div className="mt-8 p-6 border-t">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {
                  post?.tags.map((tag, i) => (
                    <p key={i} className="px-2.5 py-0.5 capitalize bg-muted rounded">{tag.split('-').join(' ')}</p>
                  ))
                }
              </div>
            </div>
            
            {/* Author Info */}
            <div className="border p-6 rounded">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <span className="w-full h-full aspect-square bg-muted ">
                    {
                      post?.author.profileImg 
                      ?
                      <img className="w-full h-full object-cover rounded-full" src={post?.author.profileImg} alt='profile-img' />
                      :
                      <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{post?.author.fullname.firstname[0]}</span>
                    }
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">About {post?.author.fullname.firstname + ' ' + post?.author.fullname.lastname}</h3>
                  <p className="text-muted-foreground">{post?.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Comments(3)</h3>
              {
                profile &&
                <div className="p-6 space-y-3 border rounded">
                  <div>
                    <h3 className="text-2xl font-semibold">Leave a Comment</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your thoughts about this article
                    </p>
                  </div>
                  <div>
                    <textarea 
                      className="w-full py-2 px-2 text-sm border rounded"
                      maxLength={200}
                      rows={3}
                      placeholder="Write your comment here..."
                      value={comment}
                      onChange={(e) => {setComment(e.target.value)}}
                      />
                    <p className="text-xs text-right text-muted-foreground font-medium">{comment.length} / 200</p>
                  </div>

                  <button className="px-3 py-2 btn-1 text-sm rounded" onClick={postComment}>Post Comment</button>
                </div>
              }
              
              <div className="space-y-6 mt-10">
                {
                  comments?.map((comment) => {
                    return (
                      <div key={comment._id} className="flex space-x-4">
                        <div className="w-10 h-10 aspect-square bg-muted rounded-full overflow-hidden">
                          {
                            comment.userId.profileImg 
                            ?
                            <img className="object-cover rounded-full" src={comment.userId.profileImg} alt='profile-img' />
                            :
                            <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{comment.userId.fullname.firstname[0]}</span>
                          }
                        </div>
                        <div className="flex-1">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="mb-1 flex justify-between">
                              <h4 className="font-medium">{comment.userId.fullname.firstname + ' ' + comment.userId.fullname.lastname}</h4>
                              <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <button 
                              className="h-9 px-3 space-x-2 flex items-center text-sm hover:bg-muted rounded-lg"
                              onClick={()=> {likeComment(comment._id)}}
                            >
                                {
                                comment.likes.includes(profile?._id) ?
                                  <Heart size={16} color="red" fill="red" />
                                  :
                                  <Heart size={16} />
                                }
                              <span className="font-medium">{comment.numberOfLikes}</span>
                            </button>
                            <button className="h-9 px-3 space-x-2 flex items-center text-sm font-medium hover:bg-muted rounded-lg">
                              Reply
                            </button>
                            {
                              comment.userId._id === profile?._id &&
                              <div className="flex space-x-4">
                                <button 
                                  className="h-9 px-3 space-x-2 flex items-center text-sm font-medium hover:bg-muted rounded-lg"
                                  onClick={() => {editComment(comment._id)}}
                                  >
                                  Edit
                                </button>
                                <button 
                                  className="h-9 px-3 space-x-2 flex items-center text-sm font-medium hover:bg-muted rounded-lg"
                                  onClick={() => {deleteComment(comment._id)}}
                                  >
                                  Delete
                                </button>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Table of Contents */}
            <div className="p-6 border rounded-lg">
              <h3 className="text-2xl font-semibold">Table of Contents</h3>
              <div className="mt-4 text-sm">
                {
                  post?.tableOfContent?.length !== 0 && 
                  <div className="flex flex-col space-y-2">
                    {
                      post?.tableOfContent?.map(elem => (
                        <a 
                          key={elem.id}
                          href={`#${elem.id}`}
                          className={`text-muted-foreground hover:text-black`}
                          style={{ paddingLeft: `${elem.level * 16}px` }}
                        >
                          {elem.textContent}
                        </a>
                      ))
                    }
                  </div>
                }
              </div>
            </div>
            
            {/* Related Articles */}
            {
              relatedPosts?.length > 0 &&
              <div className="p-6 border rounded-lg">
                <h3 className="text-2xl font-semibold">Related Articles</h3>
                <div className="mt-4 space-y-2">
                  {
                    relatedPosts.map((post) => (
                      <div 
                        key={post._id} 
                        className="flex space-x-3 cursor-pointer" 
                        onClick={() => {
                          initializeRef.current = false; 
                          navigate(`/blog/${post.slug}`)
                        }}
                      >
                        <div className="w-16 h-16 aspect-square bg-muted">
                          {
                            post.coverImage &&
                            <img className="w-full h-full object-cover overflow-hidden" src={post.coverImage} />
                          }
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{post.title}</h4>
                          <p className="mt-1 text-xs text-muted-foreground"> {post.readingTime} read</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  )
}