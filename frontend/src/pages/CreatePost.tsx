import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Save, Tag, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { EditorContent } from "@tiptap/react";
import { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import useCustomEditor from "../hooks/useCustomEditor";
import EditorMenu from "../components/EditorMenu";
import { TextSelection } from '@tiptap/pm/state';
import { ToastContainer, toast } from 'react-toastify';

interface ICategory {
  _id: string;
  name: string;
  description: string;
}

interface ITableOfContent{
  id: string;
  level: number;
  textContent: string;
}

export default function CreatePost(){

  const navigate = useNavigate();
  
  const [postData, setPostData] = useState({
    title: '',
    excerpt: '',
    category: '',
    tags: '',
    readingTime: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageURL, setCoverImageURL] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [items, setItems] = useState<TableOfContentDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { editor, wordCount, characterCount } = useCustomEditor({ setItems });
  
  useEffect(() => {
    axios
    .get(`${import.meta.env.VITE_BASE_URL}/category`)
    .then((response) => {
      setCategories(response.data.data.categories);
    })  
    .catch((error) => {
      console.log(error);
    })
  },[]);

  useEffect(() => {
    setPostData(curr => ({...curr, readingTime: calculateReadingTime(wordCount)}));
  },[wordCount]);

  if(!editor){
    return <div>Loading...</div>
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
    setPostData({...postData, [e.target.name]: e.target.value});
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>){
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setCoverImage(file);

      const url = URL.createObjectURL(file);
      setCoverImageURL(url);
    }
  }

  function formatReadingTime(minutes: number, seconds: number) {
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
        history.pushState(null, null, `#${id}`) // eslint-disable-line
      }

      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth',
      })
    }
  }

  async function handleSavePost(status='draft'){
    if(!editor){
      return;
    }
    
    if(postData.title.length === 0){
      setError('Title must not be empty');
      return;
    }

    if(postData.title.length < 10){
      setError('Title must be atleast 10 characters long.');
      return;
    }

    if(postData.excerpt.length === 0){
      setError('Excerpt must not be empty.');
      return;
    }

    if(postData.category.length === 0){
      setError('Select a Category');
      return;
    }

    if(editor?.getHTML() === '<p></p>' || editor?.getHTML() === '<p>Start writing your note...</p>'){
      setError('Content must not be empty');
      return;
    }

    setError('');
    setLoading(true);

    /* API Call */
    try {
      const tags = postData.tags.split(' ');
      const tableOfContent: ITableOfContent[] = [];
      items.map(item => {
        tableOfContent.push({
          id: item.id,
          level: item.updatedLevel,
          textContent: item.textContent
        })
      });

      const data = new FormData();
      data.append('title', postData.title);
      data.append('excerpt', postData.excerpt);
      data.append('category', postData.category);
      data.append('tags', JSON.stringify(tags));
      data.append('content', editor.getHTML());
      data.append('status', status);
      data.append('readingTime', postData.readingTime);
      data.append('tableOfContent', JSON.stringify(tableOfContent));
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
      navigate(`/preview/${response.data.data.post._id}`)
      console.log(response.data);
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while creating the post."
      );
    }
    setLoading(false);
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
              {
                coverImageURL ? 
                <div className="relative">
                  <X 
                    className="absolute top-1 right-1" 
                    size={20} 
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImageURL(null);
                    }} 
                  />
                  <img className="w-full" src={coverImageURL}/>
                </div>
                :
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
                    onChange={handleImageChange}
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
                <div className="relative">
                  <p 
                    className="px-3 py-2 text-sm border rounded-md"
                    onClick={() => {setCategoryMenuOpen(curr => !curr)}}
                    >
                    {
                      postData.category ?
                        <span className="capitalize">
                        {categories.find((cat) => cat._id === postData.category)?.name}
                        </span>
                      :
                      <span className="text-muted-foreground">Select a Category</span>
                    }
                  </p>
                  
                  {
                    categoryMenuOpen &&
                    <div className="w-full p-1 absolute text-sm bg-white border rounded">
                      {
                        categories.map(category => (
                          <p 
                            key={category._id} 
                            className="px-2 py-1 capitalize hover:bg-black hover:text-white border-b"
                            onClick={() => {
                              setPostData(curr => ({...curr, category:category._id}));
                              setCategoryMenuOpen(false);
                            }}
                          >
                            {category.name}
                          </p>
                        ))
                      }
                    </div>
                  }

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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

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
                  <span>{postData.readingTime}</span>
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

              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="px-2 py-1 space-x-2 flex items-center justify-center btn-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleSavePost()}
                  disabled={loading}
                >
                  <Save size={18} />
                  <span>Save Draft</span>
                </button>
                <button 
                  className="px-2 py-1 space-x-2 btn-1 rounded disabled:opacity-60 disabled:cursor-not-allowed" 
                  onClick={() => handleSavePost('published')}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  )
}