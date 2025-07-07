import { Editor } from '@tiptap/react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Undo2, Redo2, Heading, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, ListTodo, ChevronRight, TextQuote, SquareCode, Bold, Italic, Strikethrough, CodeXml, Underline, Highlighter, Link, Subscript, Superscript, AlignLeft, AlignCenter, AlignRight, AlignJustify, ImagePlus } from 'lucide-react';

interface EditorMenuProps {
  editor: Editor | null;
}

export default function EditorMenu({editor}: EditorMenuProps){

  const [showHeading, setShowHeading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [URL, setURL] = useState('');
  const [linkPopup, setLinkPopup] = useState(false);

  const unsetLink = useCallback(() => {
    if(!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    if (previousUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    else{
      setLinkPopup(curr => !curr);
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if(!editor) return;
    setLinkPopup(false);
    
    if(URL === '') {
      console.log('URL is empty.');
      return;
    }

    if (editor.state.selection.empty) {
      console.log('Please select text to add a link.');
      return;
    }

    /* Add Link */
    try {
      editor.chain().focus().setLink({ href: URL }).run();

      setURL('');
    } catch (e) {
      console.log(e.message);
    }
  }, [editor, URL])

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>){
    if(!editor) return null;

    const files = e.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('image', files[0]);

      axios.post(
        `${import.meta.env.VITE_BASE_URL}/post/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      .then((response) => {
        editor.chain().insertContentAt(editor.state.selection.anchor, {
          type: 'image',
          attrs: {
            src: response.data.data.image,
          },
        }).focus().run()
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }

  /* Early Return if Editor is not ready */
  if(!editor){
    return null;
  }

  return (
    <div className=" py-2 border-b">
      <div className="flex items-center justify-center flex-wrap gap-0.5">
        <div className='px-1 flex border-r'>
          {/* Undo Function */}
          <button
            className='px-2 py-1 hover:bg-muted rounded'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={
              !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
            }
          >
            <Undo2 size={20} />
          </button>

          {/* Redo Function */}
          <button
            className='px-2 py-1 hover:bg-muted rounded disabled:opacity-60 disabled:cursor-not-allowed'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={
              !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
            }
          >
            <Redo2 size={20} />
          </button>
        </div>
        
        <div className='px-1 flex border-r'>
          {/* Headings */}
          <div 
            className='relative'
            onClick={() => {setShowHeading(curr => !curr)}}
          >
            <div className={`relative px-2 pr-4 py-1 hover:bg-muted rounded ${editor.isActive('heading') ? 'is-active' : ''}`}>
              {
                editor.isActive('heading', { level: 1 }) ? <Heading1 size={20} /> :
                editor.isActive('heading', { level: 2 }) ? <Heading2 size={20} /> :
                editor.isActive('heading', { level: 3 }) ? <Heading3 size={20} /> :
                editor.isActive('heading', { level: 4 }) ? <Heading4 size={20} /> :
                editor.isActive('heading', { level: 5 }) ? <Heading5 size={20} /> :
                editor.isActive('heading', { level: 6 }) ? <Heading6 size={20} /> :
                <Heading size={20} />
              }
              <ChevronRight size={14} className='absolute right-0.5 top-2 transform rotate-90'/>
            </div>
            
            {
              showHeading &&
              <div className='size-max bg-white text-sm font-medium absolute left-0 top-full z-10 border rounded overflow-hidden'>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 size={20} strokeWidth={1.75} />
                  <span>Heading 1</span>
                </button>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 size={20} strokeWidth={1.75} />
                  <span>Heading 2</span>
                </button>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 size={20} strokeWidth={1.75} />
                  <span>Heading 3</span>
                </button>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                >
                  <Heading4 size={20} strokeWidth={1.75} />
                  <span>Heading 4</span>
                </button>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                >
                  <Heading5 size={20} strokeWidth={1.75} />
                  <span>Heading 5</span>
                </button>
                <button
                  className={`px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                >
                  <Heading6 size={20} strokeWidth={1.75} />
                  <span>Heading 6</span>
                </button>
              </div>
            }

          </div>

          {/* Lists */}
          <div 
            className='relative'
            onClick={() => {setShowList(curr => !curr)}}
          >
            <div className={`relative px-2 pr-4 py-1 hover:bg-muted rounded ${editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList') ? 'is-active' : ''}`}>
              {
                editor.isActive('bulletList') ? <List size={20} /> :
                editor.isActive('orderedList') ? <ListOrdered size={20} /> :
                editor.isActive('taskList') ?
                <ListTodo size={20} /> :
                <List size={20} />
              }
              <ChevronRight size={14} className='absolute right-0.5 top-2 transform rotate-90'/>
            </div>

            {
              showList && 
              <div className='size-max bg-white text-sm font-medium absolute left-0 top-full z-10 border rounded overflow-hidden'>
                {/* Unordered List */}
                <button
                  className={`w-full px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List size={20} strokeWidth={1.75} />
                  <span>Bullet List</span>
                </button>

                {/* Ordered List */}
                <button
                  className={`w-full px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered size={20} strokeWidth={1.75} />
                  <span>Ordered List</span>
                </button>

                {/* Task List */}
                <button
                  className={`w-full px-2 py-1 flex gap-2 hover:bg-gray-100 ${editor.isActive('taskList') ? 'is-active' : ''}`}
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                >
                  <ListTodo size={20} strokeWidth={1.75} />
                  <span>Task List</span>
                </button>
              </div>
            }
          </div>

          {/* Blockquote */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <TextQuote size={20} />
          </button>

          {/* Code Block */}
          <button
          className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <SquareCode size={20} />
          </button>
        </div>
        
        <div className='relative px-1 flex border-r'>
          {/* Bold */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('bold') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            <Bold size={20}/>
          </button>

          {/* Italic */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('italic') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            <Italic size={20}/>
          </button>
          
          {/* Strike */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('strike') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
          >
            <Strikethrough size={20}/>
          </button>

          {/* Code */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('code') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleCode()
                .run()
            }
          >
            <CodeXml size={20} />
          </button>

          {/* Underline */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('underline') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline size={20}/>
          </button>

          {/* Highlight */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('highlight') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter size={20} />
          </button>

          {/* Link */}
          <button 
            className={`relative px-2 py-1 hover:bg-muted rounded ${editor.isActive('link') ? 'is-active' : ''}`}
            onClick={unsetLink} 
          >
            <Link size={20} />
          </button>
          
          {
            linkPopup && 
            <div className='mt-1 p-2 space-y-2 absolute top-full -right-1 z-10 bg-white border'
            >
              <input 
                className='px-2 py-1 text-sm border rounded-md'
                type='url'
                value={URL}
                onChange={(e) => {setURL(e.target.value)}}                
                placeholder='Paste link'
              />
              <button className='py-1 text-sm w-full btn-1 rounded' onClick={setLink}>Done</button>
            </div>
          }
        </div>
        
        <div className='px-1 flex border-r'>
          {/* SubScript */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('subscript') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <Subscript size={20} />
          </button>

          {/* SuperScript */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive('superscript') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <Superscript size={20} />
          </button>
        </div>

        <div className='px-1 flex border-r'>
          {/* Align Left */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft size={20} />
          </button>

          {/* Align Center */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter size={20} />
          </button>

          {/* Align Right */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight size={20} />
          </button>

          {/* Align Justify */}
          <button
            className={`px-2 py-1 hover:bg-muted rounded ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify size={20} />
          </button>
        </div>
        
        {/* Add Image */}
        <label
          className={`px-2 py-1 flex items-center gap-2 font-medium hover:bg-muted rounded`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          <ImagePlus size={20} />
          <span>Add</span>
        </label>

      </div>
    </div>
  )
}
