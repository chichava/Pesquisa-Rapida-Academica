
import React, { useEffect, useRef } from 'react';

declare const Quill: any;

interface Props {
  initialContent: string;
  onChange: (content: string) => void;
}

export const RichTextEditor: React.FC<Props> = ({ initialContent, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
          ]
        },
        placeholder: 'Comece a editar o seu trabalho aqui...'
      });

      // Set initial content as HTML
      quillInstance.current.root.innerHTML = initialContent;

      quillInstance.current.on('text-change', () => {
        onChange(quillInstance.current.root.innerHTML);
      });
    }
  }, []);

  return (
    <div className="bg-white border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 transition-all">
      <div ref={editorRef} />
    </div>
  );
};
