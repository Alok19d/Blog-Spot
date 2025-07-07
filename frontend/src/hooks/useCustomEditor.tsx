import { useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler';
import Placeholder from '@tiptap/extension-placeholder';
import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents';
import { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import axios from 'axios';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface IUseCustomEditor {
  setItems: React.Dispatch<React.SetStateAction<TableOfContentDataItem[]>>;
  initialContent?:string
  userInfo?: {
    name: string;
    color: string;
  };
  roomId?: string;
  websocketUrl?: string;
}

export default function useCustomEditor ({
  setItems,
  initialContent,
  roomId,
  websocketUrl = 'ws://localhost:1234',
  userInfo = { name: 'Anonymous', color: '#f783ac'}
}: IUseCustomEditor) {
  
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  let ydoc: Y.Doc | null = null;
  let provider: WebsocketProvider | null = null;
  
  if (roomId) {
    ydoc = new Y.Doc();
    provider = new WebsocketProvider(websocketUrl, roomId, ydoc);
  }

  const baseExtensions = [
    StarterKit,
    Underline,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Highlight,
    Link.configure({
      protocols: ['http', 'https'],
      openOnClick: false,
      defaultProtocol: 'https'
    }),
    Subscript,
    Superscript,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Image,
    FileHandler.configure({
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      onDrop: (currentEditor, files, pos) => {
        files.forEach(file => {
          const formData = new FormData();
          formData.append('image', file);

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
            currentEditor.chain().insertContentAt(pos, {
              type: 'image',
              attrs: {
                src: response.data.data.image,
              },
            }).focus().run()
          })
          .catch((error) => {
            console.log(error);
          });
        })
      },
      onPaste: (currentEditor, files, htmlContent) => {
        files.forEach(file => {
          if (htmlContent) {
            console.log(htmlContent) // eslint-disable-line no-console
            return false
          }

          const formData = new FormData();
          formData.append('image', file);

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
            currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
              type: 'image',
              attrs: {
                src: response.data.data.image,
              },
            }).focus().run()
          })
          .catch((error) => {
            console.log(error);
          });
        })
      },
    }),
    Placeholder.configure({
      placeholder: 'Start writing your blog post...'
    }),
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      onUpdate(content) {
        setItems(content)
      },
    }),
  ];

  const collaborationExtensions = roomId && ydoc ? [
    Collaboration.configure({
      document: ydoc,
    }),
    CollaborationCursor.configure({
      provider: provider!,
      user: userInfo,
    }),
  ] : [];

  const editor = useEditor({
    extensions: [...baseExtensions, ...collaborationExtensions],
    content: initialContent ?? '',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
  
      const characters = text.length;
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      
      setWordCount(words);
      setCharacterCount(characters);
    }
  });

  // Cleanup function for Collaboration
  const cleanup = () => {
    if (provider) {
      provider.destroy();
    }
  };

  return { 
    editor, 
    wordCount, 
    characterCount,
    isCollaboarating: !!roomId,
    cleanup 
  };
}