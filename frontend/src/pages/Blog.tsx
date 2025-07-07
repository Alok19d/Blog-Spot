import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Bookmark, CalendarDays, Clock, Heart, MessageSquare, Share2 } from "lucide-react";
import DomPurify from 'dompurify'
import { useSelector } from "react-redux";

export default function Blog(){
  const {postSlug} = useParams();
  
  const [postData, setPostData] = useState(null);
  const [like, setLike] = useState(false);
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState('');
  
  const {profile} = useSelector(state => state.user);

  useEffect(() => {
    axios
    .get(
      `${import.meta.env.VITE_BASE_URL}/post/post?slug=${postSlug}`
    )
    .then(async (repsonse) => {
      if(repsonse.data.data.post){
        console.log(repsonse.data.data);
        setPostData(repsonse.data.data);
        
        const commentsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/comment/getPostComments/${repsonse.data.data.post._id}`);
        setComments(commentsResponse.data.data.comments);
      }
    })
    .catch((error) => {
      console.log(error);
    })
  },[postSlug])

  async function postComment(){
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comment/create`,
        {
          postId: postData?.post._id,
          content: comment
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setComment('');
      setComments(curr => [response.data.data.comment, ...curr]);
      console.log(response.data.data.comment);
    } catch (error) {
      console.log(error);
    }
  }

  async function likePost(postId) {
    if(!profile){
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/view/likePost/${postId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setLike(response.data.data.liked);
    } catch (error) {
      console.log(error);
    }
  }

  async function likeComment(commentId) {
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

  async function editComment(commentId) {
    
  }

  async function deleteComment(commentId) {

  }

  return (
    <main>
      <section className="mb-15">
        <div className="px-4 py-8 container grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2.5 py-0.5 bg-black text-white text-xs font-semibold capitalize rounded-xl">{postData?.post.category.name}</span>
              <span className="text-sm text-muted-foreground">8 min read</span>
            </div>
            <div className="mb-8">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold">{postData?.post.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{postData?.post.excerpt}</p>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <span className="h-12 w-12 rounded-full">
                    {
                      postData?.post.author.profileImg 
                      ?
                      <img className="object-cover rounded-full" src={postData?.post.author.profileImg} alt='profile-img' />
                      :
                      <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{postData?.post.author.fullname.firstname[0]}</span>
                    }
                  </span>
                  <div>
                    <p className="font-medium">{postData?.post.author.fullname.firstname + ' ' + postData?.post.author.fullname.lastname}</p>
                    <div className="flex items-center text-muted-foreground text-sm space-x-2">
                      <CalendarDays size={16} />
                      <span>
                        {
                          postData?.post &&
                          new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(postData?.post.updatedAt))
                        }
                      </span>
                      <Clock size={16} />
                      <span>8 min read</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-cent space-x-2">
                  <button 
                    className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted"
                    onClick={() => {likePost(postData?.post._id)}}
                  >
                    {
                      like ?
                      <Heart size={16} color="red" fill="red" />
                      :
                      <Heart size={16} />
                    }
                    <span className="font-medium">{postData?.like_count}</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <MessageSquare size={16} />
                    <span className="font-medium">{comments?.length}</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <Bookmark size={16} />
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              {
                postData && postData?.post.coverImage !== '' &&
                <img className="object-cover" src={postData.post.coverImage} />
              }
            </div>
            <div className="post-content" dangerouslySetInnerHTML={{__html: DomPurify.sanitize(postData?.post.content)}}>
            </div>

            <div className="mt-8 p-6 border-t">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {
                  postData?.post.tags.map((tag, i) => (
                    <p key={i} className="px-2.5 py-0.5 bg-muted rounded">{tag}</p>
                  ))
                }
              </div>
            </div>
            
            <div className="border p-6 rounded">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16">
                  <span className="w-full h-full aspect-square bg-muted rounded-full">
                    {
                      postData?.post.author.profileImg 
                      ?
                      <img className="object-cover rounded-full" src={postData?.post.author.profileImg} alt='profile-img' />
                      :
                      <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{postData?.post.author.fullname.firstname[0]}</span>
                    }
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">About {postData?.post.author.fullname.firstname + ' ' + postData?.post.author.fullname.lastname}</h3>
                  <p className="text-muted-foreground">{postData?.post.author.bio}</p>
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
                        <div className="w-10 h-10 aspect-square bg-muted rounded-full">
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
              <div className="mt-4 text-sm space-y-2">
                <p className="text-muted-foreground hover:text-black">1. AI-Powered Development Tools</p>
                <p className="text-muted-foreground hover:text-black">2. The Rise of Edge Computing</p>
                <p className="text-muted-foreground hover:text-black">3. Modern JavaScript Frameworks</p>
                <p className="text-muted-foreground hover:text-black">4. Web Assembly Integration</p>
              </div>
            </div>
            
            {/* Related Articles */}
            <div className="p-6 border rounded-lg">
              <h3 className="text-2xl font-semibold">Related Articles</h3>
              <div className="mt-4 space-y-2">
                <div className="flex space-x-3">
                  <div className="h-16 aspect-square bg-muted"></div>
                  <div>
                    <h4 className="text-sm font-medium">Building Scalable React Applications</h4>
                    <p className="mt-1 text-xs text-muted-foreground"> 8 min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
