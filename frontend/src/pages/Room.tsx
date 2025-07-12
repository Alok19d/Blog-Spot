import { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, CircleStop, Crown, Info, Tag } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons"
import { Editor } from '@tiptap/react';
import TextEditor from "../components/TextEditor";
import { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import { TextSelection } from '@tiptap/pm/state';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { getRandomColor } from "../utils/utils";
import AddMemberPopup from "../components/AddMemberPopup";

interface IPost{
  _id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  readingTime: string;
  status: "draft" | "published";
}

interface ICategory {
  _id: string;
  name: string;
  description: string;
}

export default function Room(){

  const navigate = useNavigate();

  const { roomId } = useParams();
  const { profile } = useSelector(state => state.user);

  const [post, setPost] = useState<IPost | null>(null);
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: 'Anonymous', color: '#f783ac' });
  const [items, setItems] = useState<TableOfContentDataItem[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  
  async function fetchCategories(){
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/category`);
      setCategories(response.data.data.categories);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRoomDetails(){
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/room/join/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPost(response.data.data.room.postId);
      setUsers(response.data.data.room.users);
      setAdmin(response.data.data.room.admin);
    } catch (error) {
      console.log(error);
      navigate('/');
    }
  }

  useEffect(() => {
    const color = getRandomColor();
    fetchCategories();
    fetchRoomDetails();
    setUserInfo({
      name: profile?.fullname.firstname,
      color
    });
  },[]);

  useEffect(() => {
    setPost(curr => {
      if(!curr) return curr;
      
      return {...curr, readingTime: calculateReadingTime(wordCount)};
    });
  },[wordCount]);


  function formatReadingTime(minutes: number, seconds: number){
    if (minutes === 0 && seconds < 30) {
      return "< 1 min";
    } else if (minutes === 0) {
      return "1 min";
    } else if (seconds >= 30) {
      return `${minutes + 1} min`;
    } else {
      return `${minutes} min`;
    }
  }

  function calculateReadingTime(wordCount: number, wordsPerMinute = 200): string {
    if (wordCount <= 0) {
      return "0 min";
    }

    const totalMinutes = wordCount / wordsPerMinute;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);

    return formatReadingTime(minutes, seconds);
  }

  function onItemClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string){
    e.preventDefault();

    if (editor) {
      const element = editor.view.dom.querySelector(`[data-toc-id="${id}"]`);
      if(!element) return;
      const pos = editor.view.posAtDOM(element, 0)

      // set focus
      const tr = editor.view.state.tr;

      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));

      editor.view.dispatch(tr);

      editor.view.focus();

      if (history.pushState) { // eslint-disable-line
        history.pushState(null, '', `#${id}`) // eslint-disable-line
      }

      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth',
      })
    }
  }

  return(
    <main>
      <section className="mb-15">
        <div className="px-4 py-8 container grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Post Title */}
            <div className="p-6 space-y-6 border rounded">
              <h3 className="text-2xl font-semibold">Post Title</h3>
              <input 
                name='title'
                className="w-full h-10 p-2 flex text-2xl font-bold border rounded" 
                placeholder="Enter your blog post title..."
                type='text'
                value={post?.title ?? ""}
                readOnly
              />
            </div>

            {/* Excerpt */}
            <div className="p-6 space-y-6 border rounded">
              <div>
                <h3 className="text-2xl font-semibold">Excerpt</h3>
                <p className="text-sm text-muted-foreground">Write a description that will appear in post previews</p>
              </div>
              <textarea 
                name='excerpt'
                className="w-full p-2 text-sm border rounded" 
                placeholder="Enter post excerpt..."
                value={post?.excerpt ?? ""}
                readOnly
              />
            </div>

            {/* Cover Image */}
            <div className="p-6 space-y-6 border rounded">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon className="text-2xl" icon={faImage} />
                <h3 className="text-2xl font-semibold">Cover Image</h3>
              </div>
              {
                post?.coverImage ? 
                <div>
                  <img className="w-full" src={post?.coverImage ?? ""}/>
                </div>
                :
                <div
                  className="p-6 space-y-2 flex flex-col items-center text-muted-foreground border-2 border-dashed rounded cursor-pointer"
                >
                  <FontAwesomeIcon className="text-4xl" icon={faImage} />
                  <p className="text-sm">
                    <u>Click to upload</u> or drag and drop
                  </p>
                  <p className="text-sm">Maximum file size 2MB.</p>
                  <input
                    id="cover-image-input"
                    type="file"
                    accept="image/*"
                    hidden
                  />
                </div>
              }
            </div>

            {/* Categories & Tags */}
            <div className="p-6 space-y-6 border rounded">     
              <div className="flex items-center space-x-3">
                <Tag className="text-2xl" />
                <h3 className="text-2xl font-semibold">Categories and Tags</h3>
              </div>

              <div className="space-y-2">  
                <label 
                  className="w-full block text-sm font-medium"
                >
                  Category
                </label>
                <div>
                  <p 
                    className="w-full px-3 py-2 flex justify-between items-center text-sm border rounded-md"
                    >
                      <span className="capitalize">
                      {categories.find((cat) => cat._id === post?.category)?.name}
                      </span>
                      <ChevronRight className='rotate-90' size={16}/>
                  </p>
                </div>
              </div>
              <div className="space-y-2">  
                <label 
                  className="w-full block text-sm font-medium"
                >
                  Tags
                </label>
                <input 
                  name='tags'
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  placeholder="Enter tags seperated by commas"
                  type='text'
                  value={post?.tags.join(' ') ?? ""}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Seperate tags with commas</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 border rounded">
              <h3 className="mb-6 text-2xl font-semibold">Content</h3>
              <TextEditor initialContent={content} setEditor={setEditor} setWordCount={setWordCount} setCharacterCount={setCharacterCount} setItems={setItems} roomId={roomId} userInfo={userInfo} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {
              profile._id === admin?._id &&
              <button className="w-full px-2 py-1 flex items-center justify-center gap-2 btn-2 rounded">
                <CircleStop size={18} />
                <span>Stop Collaboration</span>
              </button>
            }

            {/* Collaborators */}
            <div className="p-6 space-y-6 border rounded">
              <div className="flex justify-between">
                <h3 className="text-2xl font-semibold">Collaborators</h3>
                {
                  profile._id === admin?._id &&
                  <button className="px-2 py-1 space-x-2 cursor-pointer" onClick={() => {setShowPopup(true)}}>
                    <FontAwesomeIcon icon={faUserPlus} />
                  </button>
                }
              </div>
              <div className="space-y-4">
                {
                  admin &&
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 bg-muted rounded-full overflow-hidden">
                        {
                          admin?.profileImg !== '' &&
                          <img className="w-full h-full object-cover" src={admin.profileImg} />
                        }
                      </div>
                      <div className="h-2.5 w-2.5 absolute bottom-0 right-0 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="flex space-x-2 text-sm">
                        <p className="font-medium ">{admin.fullname.firstname + ' ' + admin.fullname.lastname}</p>
                        <Crown className="text-yellow-500" size={18} />
                      </div>
                      <p className="text-xs text-muted-foreground">now</p>
                    </div>
                  </div>
                }
                {
                  users.map((user) => {
                    return (
                      <div key={user._id} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 bg-muted rounded-full overflow-hidden">
                            {
                              user?.profileImg !== '' &&
                              <img className="w-full h-full object-cover" src={user.profileImg} />
                            }
                          </div>
                          <div className="h-2.5 w-2.5 absolute bottom-0 right-0 bg-red-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="flex space-x-2 text-sm">
                            <p className="font-medium ">{user.fullname.firstname + ' ' + user.fullname.lastname}</p>
                            <FontAwesomeIcon className="text-blue-700" icon={faPenToSquare} />
                          </div>
                          <p className="text-xs text-muted-foreground">now</p>
                        </div>
                      </div>
                    )
                  })
                }

              </div>
            </div>

            {/* Table of Contents */}
            <div className="p-6 space-y-4 border rounded">
              <h3 className="text-2xl font-semibold">Table of Contents</h3>
              {
                items.length !== 0 ?
                <div className="space-y-1 text-sm text-muted-foreground">
                {
                  items.map((item, i) => {
                    let updatedLevel = 0;
                    if (i > 0) {
                      const prevItem = items[i - 1];
                      const prevUpdatedLevel = items[i - 1].updatedLevel ?? 0;

                      if (item.level > prevItem.level) {
                        updatedLevel = prevUpdatedLevel + 1;
                      }
                      else if (item.level === prevItem.level) {
                        updatedLevel = prevUpdatedLevel;
                      }
                    }

                    item.updatedLevel = updatedLevel;
                    
                    return (
                      <div key={item.id}>
                        <div className="hover:text-black">
                          <a
                            href={`#${item.id}`}
                            onClick={e => onItemClick(e, item.id)}
                            className=""
                            style={{ paddingLeft: `${updatedLevel * 16}px` }}
                          >
                            {item.textContent}
                          </a>
                        </div>
                      </div>
                    );
                  })
                }
                </div>
                :
                <div className="text-muted-foreground text-sm text-center">
                  <p>Start editing your document to see the outline.</p>
                </div>
              }
            </div>

            {/* Post Statistics */}
            <div className="p-6 space-y-6 border rounded">     
              <h3 className="text-2xl font-semibold">Post Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Words:</span>
                  <span>{wordCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Characters:</span>
                  <span>{characterCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reading Time:</span>
                  <span>{post?.readingTime}</span>
                </div>
              </div>
            </div>
            
            {/* Publish Settings */}
            <div className="p-6 space-y-6 border rounded">     
              <h3 className="text-2xl font-semibold">Publish Settings</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Status:</p>
                <div className="relative px-2 py-1 flex-1 flex items-center justify-between capitalize text-sm border rounded">
                  <span>{post?.status}</span>
                  <ChevronRight className='rotate-90' size={16} />
                </div>
              </div>
            </div>

            <div>
              {
                error &&
                <p className="mb-3 flex items-center gap-1 text-xs text-red-600">
                  <Info size={12}/>
                  {error}
                </p>
              }

              {
                profile._id === admin?._id &&
                <button className="w-full px-2 py-1 btn-1 rounded disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
                  <span>Update Post</span>
                </button>
              }
            </div>
          </div>
        </div>
      </section>
      {
        showPopup &&
        <AddMemberPopup roomId={roomId} toast={toast} onClose={() => setShowPopup(false)} />
      }
      <ToastContainer />
    </main>
  )
}