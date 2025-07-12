import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import { Editor } from '@tiptap/react';
import EditorMenu from './EditorMenu';
import { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import axios from 'axios';

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface IUseCustomEditor {
  initialContent?: string;
  setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
  setWordCount: React.Dispatch<React.SetStateAction<number>>;
  setCharacterCount: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<TableOfContentDataItem[]>>;
  userInfo?: {
    name: string;
    color: string;
  };
  roomId?: string;
  websocketUrl?: string;
}

export default function TextEditor({
  initialContent,
  setEditor,
  setWordCount,
  setCharacterCount,
  setItems,
  roomId,
  websocketUrl = 'ws://localhost:1234',
  userInfo = { name: 'Anonymous', color: '#f783ac' },
}: IUseCustomEditor) {

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    let ydoc: Y.Doc | null = null;
    let yProvider: WebsocketProvider | null = null;
    if (roomId ) {
      ydoc = new Y.Doc();
      yProvider = new WebsocketProvider(`${import.meta.env.VITE_WS_URL}/${roomId}?token=${localStorage.getItem('token')}`, '', ydoc);

      setDoc(ydoc);
      setProvider(yProvider);
    }

    return () => {
      ydoc?.destroy();
      yProvider?.destroy();
    };
  }, [websocketUrl, roomId]); 

  if(!roomId){
    return (
      <TiptapEditor initialContent={initialContent} setEditor={setEditor} setWordCount={setWordCount} setCharacterCount={setCharacterCount} setItems={setItems} isCollaborating={false} userInfo={userInfo} />
    );
  }

  if(!doc){
    return <div>Loading...</div>;
  }

  return (
    <TiptapEditor initialContent={initialContent} setEditor={setEditor} setWordCount={setWordCount} setCharacterCount={setCharacterCount} setItems={setItems} doc={doc} provider={provider} isCollaborating={true} userInfo={userInfo} />
  );
}

type EditorProps = {
  initialContent?: string;
  setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
  setWordCount: React.Dispatch<React.SetStateAction<number>>;
  setCharacterCount: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<TableOfContentDataItem[]>>;
  doc?: Y.Doc;
  provider?: any;
  isCollaborating: boolean;
  userInfo?: {
    name: string;
    color: string;
  };
};

function TiptapEditor({ initialContent, setEditor, setWordCount, setCharacterCount, setItems, doc, provider, isCollaborating, userInfo }: EditorProps){
  const baseExtensions = [
    StarterKit.configure({
      history: isCollaborating && false,
    }),
    Underline,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Highlight,
    Link.configure({
      protocols: ['http', 'https'],
      openOnClick: false,
      defaultProtocol: 'https',
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
        files.forEach((file) => {
          const formData = new FormData();
          formData.append('image', file);

          axios
            .post(`${import.meta.env.VITE_BASE_URL}/post/upload-image`, formData, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            })
            .then((response) => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: response.data.data.image,
                  },
                })
                .focus()
                .run();
            })
            .catch((error) => {
              console.log(error);
            });
        });
      },
      onPaste: (currentEditor, files, htmlContent) => {
        files.forEach((file) => {
          if (htmlContent) {
            console.log(htmlContent); // eslint-disable-line no-console
            return false;
          }

          const formData = new FormData();
          formData.append('image', file);

          axios
            .post(`${import.meta.env.VITE_BASE_URL}/post/upload-image`, formData, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            })
            .then((response) => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: response.data.data.image,
                  },
                })
                .focus()
                .run();
            })
            .catch((error) => {
              console.log(error);
            });
        });
      },
    }),
    Placeholder.configure({
      placeholder: 'Start writing your blog post...',
    }),
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      onUpdate(content) {
        setItems(content);
      },
    }),
  ];

  const collaborationExtensions = isCollaborating ? [
    Collaboration.configure({
      document: doc,
    }),
    CollaborationCursor.configure({
      provider: provider,
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
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      setEditor(editor);
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);
  
  return (
    <div>
      <EditorMenu editor={editor} isCollaborating={isCollaborating} />
      <EditorContent editor={editor} />
    </div>
  );
}