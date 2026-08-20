import React, { Suspense } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuillLazy = React.lazy(() => import('react-quill-new'));

interface LazyRichTextEditorProps {
  theme?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LazyRichTextEditor: React.FC<LazyRichTextEditorProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="h-[200px] flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-400 gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-500"></div>
        Chargement de l'éditeur de texte...
      </div>
    }>
      <ReactQuillLazy {...props} />
    </Suspense>
  );
};
