import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faPenToSquare, faTag, faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { faPaperPlane, faImage, faEye, faFloppyDisk } from "@fortawesome/free-regular-svg-icons"
import axios from "axios"
import { EditorContent } from "@tiptap/react";
import { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import useCustomEditor from "../hooks/useCustomEditor"
import EditorMenu from "../components/EditorMenu"
import { TextSelection } from '@tiptap/pm/state';
import { ToastContainer, toast } from 'react-toastify';

export default function Room(){

  const navigate = useNavigate();
  const {postId} = useParams();

  const { profile } = useSelector(state => state.user);

  const [postData, setPostData] = useState({
    title: '',
    excerpt: '',
    category: 'technology',
    tags: '',
  });
  const [content, setContent] = useState('');
  const [items, setItems] = useState<TableOfContentDataItem[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {editor, wordCount, characterCount} = useCustomEditor({setItems, initialContent: content}); 

  useEffect(() => {
    axios
    .get(
      `${import.meta.env.VITE_BASE_URL}/post/fetch-posts?userId=${profile._id}&postId=${postId}`
    ).then((repsonse) => {
      console.log(repsonse.data.data.posts[0]);
      if(repsonse.data.data.posts && repsonse.data.data.posts[0]){
        setPostData({
          title: repsonse.data.data.posts[0].title,
          excerpt: repsonse.data.data.posts[0].excerpt,
          category: repsonse.data.data.posts[0].category,
          tags: repsonse.data.data.posts[0].tags.join(' ')
        });
        setContent(repsonse.data.data.posts[0].content);
      }
    })
    .catch((error) => {
      console.log(error);
    })
  },[postId])

  function handleInputChange(e){
    setPostData({...postData, [e.target.name]: e.target.value});
  }

  async function handleSaveDraft(){
    if(!editor){
      return;
    }

    if(editor?.getHTML() === '<p></p>' || editor?.getHTML() === '<p>Start writing your note...</p>'){
      setError('Description must not be empty'
      )
      return;
    }

    try {
      const data = new FormData();
      data.append('title', postData.title);
      data.append('excerpt', postData.excerpt);
      data.append('category', postData.category);
      data.append('tags', postData.tags);
      data.append('content', editor.getHTML());
      data.append('status', 'draft');
      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/post/create`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate(`/blog/${response.data.data.post._id}`)
      console.log(response.data);
    } catch (error) {
      console.log(error);
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
                value={postData.title}
                onChange={handleInputChange}
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
                value={postData.excerpt}
                onChange={handleInputChange}
              />
            </div>

            {/* Cover Image */}
            <div className="p-6 space-y-6 border rounded">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon className="text-2xl" icon={faImage} />
                <h3 className="text-2xl font-semibold">Cover Image</h3>
              </div>
                <div
                className="p-6 space-y-2 flex flex-col items-center text-muted-foreground border-2 border-dashed rounded cursor-pointer"
                onClick={() => document.getElementById('cover-image-input')?.click()}
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
                  onChange={(e) => {
                    setCoverImage(e.target.files[0]);
                  }}
                />
                </div>
            </div>

            {/* Categories & Tags */}
            <div className="p-6 space-y-6 border rounded">     
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon className="text-2xl" icon={faTag} />
                <h3 className="text-2xl font-semibold">Categories and Tags</h3>
              </div>

              <div className="space-y-2">  
                <label 
                  className="w-full block text-sm font-medium"
                >
                  Category
                </label>
                <select 
                  name='category'
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={postData.category}
                  onChange={handleInputChange}
                >
                  <option className="px-3 py-2 hover:bg-muted" value={'technology'}>Technology</option>
                  <option value={'development'}>Development</option>
                  <option value={'design'}>Design</option>
                  <option value={'tutorial'}>Tutorial</option>
                  <option value={'best-practices'}>Best Practices</option>
                </select>
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
                  value={postData.tags}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Seperate tags with commas</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 border rounded">
              <h3 className="mb-6 text-2xl font-semibold">Content</h3>
              <EditorMenu editor={editor} />
              <EditorContent editor={editor} />
              {/* <textarea 
                ref={containerRef}
                className="w-full h-[400px] p-2 text-sm border rounded" 
                placeholder="Start writing your blog post..."
              /> */}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button className="px-2 py-1 btn-2 rounded">
              <div className="space-x-2">
                <FontAwesomeIcon icon={faEye} />
                <span>Preview</span>
              </div>  
              </button>
              <button className="px-2 py-1 btn-2 rounded">
                <div className="space-x-2" onClick={handleSaveDraft}>
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  <span>Save Draft</span>
                </div>  
              </button>
            </div>

            {/* Collaborators */}
            <div className="p-6 space-y-6 border rounded">
              <div className="flex justify-between">
                <h3 className="text-2xl font-semibold">Collaborators</h3>
                <button className="px-2 py-1 space-x-2 btn-2 rounded-md">
                  <FontAwesomeIcon icon={faUserPlus} />
                  {/* <span>Invite</span> */}
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-2.5 w-2.5 absolute bottom-0 right-0 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex space-x-2 text-sm">
                      <p className="font-medium ">John Doe</p>
                      <FontAwesomeIcon className="text-yellow-400" icon={faCrown} />
                    </div>
                    <p className="text-xs text-muted-foreground">now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-2.5 w-2.5 absolute bottom-0 right-0 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex space-x-2 text-sm">
                      <p className="font-medium ">John Doe</p>
                      <FontAwesomeIcon className="text-blue-700" icon={faPenToSquare} />
                    </div>
                    <p className="text-xs text-muted-foreground">now</p>
                  </div>
                </div>
              </div>
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
                  <span>0 min</span>
                </div>
              </div>
            </div>
            
            <p>{error}</p>

            <button className="w-full px-2 py-1 btn-1 rounded">
              <div className="space-x-2">
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Publish</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}