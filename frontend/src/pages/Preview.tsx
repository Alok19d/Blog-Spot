import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Bookmark, CalendarDays, Clock, Heart, MessageSquare, Share2 } from "lucide-react";
import axios from 'axios';
import DomPurify from 'dompurify';
import {toast, ToastContainer} from 'react-toastify';

interface IPost{
  _id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: {
    _id: string;
    name: string;
  }
  tags: string[];
  content: string;
  slug: string;
  tableOfContent: {
    id: string;
    level: number;
    textContent: string;
  }[]
  author: {
    fullname: {
      firstname: string;
      lastname: string;
    }
    profileImg: string;
  }
  readingTime: string;
  status: "draft" | "published";
  updatedAt: string;
}

export default function Preview(){
  
  const { postId } = useParams();
  const [postData, setPostData] = useState<IPost | null>(null);
  const [showShareLink, setShowShareLink] = useState(false);

  useEffect(() => {
    axios
    .get(`${import.meta.env.VITE_BASE_URL}/post/preview?postId=${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    .then(async (repsonse) => {
      setPostData(repsonse.data.data.post);
    })
    .catch((error) => {
      console.log(error);
    })
  },[postId]);

  async function CopyToClipboard(link: string){
    try {
      await navigator.clipboard.writeText(link);
      setShowShareLink(false);
      toast.success('Share Link Copied to Clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  
  return (
    <main>
      <section className="mb-15">
        <div className="px-4 py-8 container grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2.5 py-0.5 bg-black text-white text-xs font-semibold capitalize rounded-lg">{postData?.category.name}</span>
            </div>
            <div className="mb-8">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold">{postData?.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{postData?.excerpt}</p>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <span className="h-12 w-12 rounded-full">
                    {
                      postData?.author.profileImg 
                      ?
                      <img className="object-cover rounded-full" src={postData?.author.profileImg} alt='profile-img' />
                      :
                      <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{postData?.author.fullname.firstname[0]}</span>
                    }
                  </span>
                  <div>
                    <p className="font-medium">{postData?.author.fullname.firstname + ' ' + postData?.author.fullname.lastname}</p>
                    <div className="flex items-center text-muted-foreground text-sm space-x-2">
                      <CalendarDays size={16} />
                      <span>
                        {
                          postData &&
                          new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(postData.updatedAt))
                        }
                      </span>
                      <Clock size={16} />
                      <span>{postData?.readingTime} read</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center space-x-2">
                  <button 
                    className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted"
                  >
                    <Heart size={16} />
                    <span className="font-medium">--</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <MessageSquare size={16} />
                    <span className="font-medium">--</span>
                  </button>
                  <button className="h-9 px-3 space-x-2 flex items-center gap-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <Bookmark size={16} />
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
                      <p className="px-2 py-1 break-all bg-muted border rounded">
                        http://localhost:5173/blog/{postData?.slug}
                      </p>
                      <button className="w-full px-2 py-1 btn-1 rounded" onClick={ () => {CopyToClipboard(`http://localhost:5173/blog/${postData?.slug}`)}}>Copy to Clipboard</button>
                    </div>
                  }
                </div>
              </div>
              {
                postData && postData?.coverImage !== '' &&
                <img className="object-cover" src={postData.coverImage} />
              }
            </div>

            
            {/* Content */}
            {
              postData?.content && 
              <div className="post-content" dangerouslySetInnerHTML={{__html: DomPurify.sanitize(postData?.content)}}>
              </div>
            }

            {/* Tags */}
            <div className="mt-8 p-6 border-t">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {
                  postData?.tags.map((tag, i) => (
                    <p key={i} className="px-2.5 py-0.5 bg-muted rounded">{tag.split('-').join(' ')}</p>
                  ))
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
                  postData?.tableOfContent.length !== 0 && 
                  <div className="flex flex-col space-y-2">
                    {
                      postData?.tableOfContent.map(elem => (
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
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  )
}
