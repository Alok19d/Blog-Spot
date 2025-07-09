import { useState } from "react";
import { useSelector } from "react-redux";
import { Heart, MessageSquareText } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

interface IComment{
  _id: string;
  content: string;
  user: {
    _id: string;
    fullname: {
      firstname: string;
      lastname: string;
    }
    profileImg: string;
  }
  replies?: IComment[];
  replyCount: number;
  likeCount: number;
  createdAt: string;
}

interface ICommentProps {
  postId: string;
  toast: typeof toast;
  comment: IComment;
  setComments: React.Dispatch<React.SetStateAction<IComment[]>>;
  likedComments: string[];
  setLikedComments: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Comment({ postId, comment, setComments, likedComments,setLikedComments }: ICommentProps) {
  
  const { profile } = useSelector((state) => state.user);
  const [content, setContent] = useState("");
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [editComment, setEditComment] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(comment.content);
  const [showMore, setShowMore] = useState(comment.replyCount > 5);

  function updateRepliesRecursive(comments, commentId: string, newReplies) {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, replies: newReplies };
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateRepliesRecursive(comment.replies, commentId, newReplies)
        };
      }

      return comment;
    });
  }

  function updateLikeCountRecursive(comments, commentId: string, newLikeCount) {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, likeCount: newLikeCount };
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateLikeCountRecursive(comment.replies, commentId, newLikeCount)
        };
      }

      return comment;
    });
  }

  function updateContentRecursive(comments, commentId: string, newContent) {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, content: newContent };
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateContentRecursive(comment.replies, commentId, newContent)
        };
      }

      return comment;
    });
  }

  function removeCommentRecursive(comments, commentId){
    return comments.map(comment => {
      if (comment._id === commentId) {
        return null;
      }

      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = removeCommentRecursive(comment.replies, commentId);
        return { ...comment, replies: updatedReplies };
      }

      return comment;
    })
    .filter(Boolean);
  }

  function addReplyRecursive(comments, commentId, newReplies) {
    return comments.map(comment => {
      if (comment._id === commentId) {
        const updatedReplies = comment.replies ? [...comment.replies, ...newReplies] : [...newReplies];
        return {
          ...comment,
          replies: updatedReplies,
          replyCount: (comment.replyCount || 0) + 1
        };
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyRecursive(comment.replies, commentId, newReplies)
        };
      }

      return comment;
    });
  }

  async function replyToComment(commentId: string) {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comment/create`,
        {
          postId,
          parentCommentId: commentId,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContent('');
      setShowReplies(true);
      setReplyFormOpen(false);
      fetchReplies(commentId);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchReplies(commentId: string) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/comment/replies/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComments(prev => updateRepliesRecursive(prev, commentId, response.data.data.comments));
    } catch (error) {
      console.log(error);
    }
  }

  function handleShowReplies(commentId: string){
    if(showReplies){
      setShowReplies(false);
      return;
    }

    fetchReplies(commentId);
    setShowReplies(true);
  }

  async function toggleCommentLike(commentId: string) {
    if (!profile) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/comment/like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComments(prev => updateLikeCountRecursive(prev, commentId, response.data.data.likeCount));

      if(response.data.data.isLiked){
        setLikedComments(prev => [...prev, commentId]);
      }
      else{
        setLikedComments((prev) => prev.filter((id) => id !== commentId));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!profile) return;

    try {
      if(updatedContent !== ""){
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/comment/edit/${commentId}`,
          {
            content: updatedContent
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setEditComment(false);
        setComments(prev => updateContentRecursive(prev, commentId, updatedContent));
        toast.success('Comment updated Successfully!');
      }
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while updating Comment."
      );
    }
  }

  async function loadMoreReplies(commentId: string){
    const startIndex = comment.replies?.length;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/comment/replies/${commentId}?startIndex=${startIndex}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if(response.data.data.comments.length < 5){
        setShowMore(false);
      }
      setComments(prev => addReplyRecursive(prev, commentId, response.data.data.comments));
    } catch (error) {
      console.log(error);  
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/comment/delete/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setComments(prev => removeCommentRecursive(prev, commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while deleting comment."
      );
    }
  }

  return (
    <div className="mb-4">
      <div key={comment._id} className="flex space-x-4">
        <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
          {comment.user.profileImg !== "" ? (
            <img
              className="w-full h-full object-cover rounded-full"
              src={comment.user.profileImg}
              alt="profile-img"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">
              {comment.user.fullname.firstname[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          {
            editComment ?
            <div className="space-y-2">
              <h4 className="font-medium">
                {comment.user.fullname.firstname} {comment.user.fullname.lastname}
              </h4>
              <textarea 
                className="w-full p-2 text-sm border rounded"
                value={updatedContent}
                onChange={(e) => {setUpdatedContent(e.target.value)}}
              />
              <div className="space-x-5 text-sm">
                <button className="px-3 py-1 btn-1 rounded" onClick={() => {handleEditComment(comment._id)}}>Update</button>
                <button className="px-3 py-1 btn-2 rounded" onClick={() => {setEditComment(false)}}>Cancel</button>
              </div>
            </div>
            :
            <div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="mb-1 flex justify-between">
                  <h4 className="font-medium">
                    {comment.user.fullname.firstname} {comment.user.fullname.lastname}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  className="h-9 px-3 space-x-2 flex items-center text-sm hover:bg-muted rounded-lg"
                  onClick={() => toggleCommentLike(comment._id)}
                >
                  {
                    likedComments.includes(comment?._id) ?
                    <Heart size={16} color='red' fill='red' />
                    :
                    <Heart size={16} />
                  }
                  <span className="font-medium">{comment.likeCount}</span>
                </button>
                <button
                  className="h-9 px-3 space-x-2 flex items-center text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setReplyFormOpen((curr) => !curr)}
                >
                  <MessageSquareText size={16} />
                  <span>Reply</span>
                </button>
                {comment.replyCount > 0 && (
                  <button
                    className="h-9 px-3 text-sm font-medium hover:bg-muted rounded-lg"
                    onClick={() => handleShowReplies(comment._id)}
                  >
                    {
                      showReplies ?
                      <span>Hide Replies</span>
                      :
                      <span>View Replies ({comment.replyCount})</span>
                    }
                  </button>
                )}
                {comment.user._id === profile?._id && (
                  <div className="flex space-x-4">
                    <button
                      className="h-9 px-3 text-sm font-medium hover:bg-muted rounded-lg"
                      onClick={() => setEditComment(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="h-9 px-3 text-sm font-medium hover:bg-muted rounded-lg"
                      onClick={() => deleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
          {/* Reply Form */}
          {replyFormOpen && (
            <div className="mt-5 space-y-2">
              <textarea
                className="p-2 w-full text-sm border rounded"
                placeholder={`Reply to ${comment.user.fullname.firstname} ${comment.user.fullname.lastname}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="space-x-5 text-sm">
                <button
                  className="px-3 py-1 btn-1 rounded"
                  onClick={() => replyToComment(comment._id)}
                >
                  Post Reply
                </button>
                <button
                  className="px-3 py-1 btn-2 rounded"
                  onClick={() => setReplyFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && showReplies && (
        <div className="pl-14 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              postId={postId}
              comment={reply}
              setComments={setComments}
              likedComments={likedComments}
              setLikedComments={setLikedComments}
            />
          ))}
          <div>
            {
              showMore &&
              <button className="px-3 py-1 btn-2 text-sm rounded" onClick={() => {loadMoreReplies(comment._id)}}>Show More Replies</button>
            }
          </div>
        </div>
      )}
    </div>
  );
}
