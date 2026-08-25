import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditorStepMediaProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EditorStepMedia: React.FC<EditorStepMediaProps> = ({ images, setImages }) => {
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image/')) {
      toast.error('Veuillez saisir une URL d\'image valide');
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    toast.success('Photo ajoutée');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) importée(s)`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#1a3831]" />
          <span>Photos du bien ({images.length})</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajoutez des photos lumineuses et de haute qualité pour maximiser l'intérêt des acquéreurs.
        </p>
      </div>

      {/* Upload Box & URL Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="border-2 border-dashed border-[#e8e2d4] hover:border-[#1a3831] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#faf8f5] hover:bg-[#f4ecd8]/40 transition">
          <Upload className="w-8 h-8 text-[#1a3831] mb-2" />
          <span className="text-xs font-bold text-[#1a3831]">Importer des photos depuis l'appareil</span>
          <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, WebP jusqu'à 10MB</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="border border-[#e8e2d4] rounded-2xl p-6 flex flex-col justify-between space-y-3 bg-[#faf8f5]">
          <span className="text-xs font-bold text-[#1a3831]">Ou ajouter via lien URL</span>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-xs focus:outline-none focus:border-[#1a3831]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2.5 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Ajouter
            </button>
          </div>
          <span className="text-[11px] text-slate-400">Ex: Unsplash, Cloudinary, ImgBB</span>
        </div>
      </div>

      {/* Photos Grid Preview */}
      {images.length === 0 ? (
        <div className="p-8 text-center bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] text-xs text-slate-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Veuillez ajouter au moins une photo principale pour publier votre annonce.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden group border border-[#e8e2d4]">
              <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-[#1a3831] text-[#ebdcb8] text-[10px] font-black px-2 py-0.5 rounded-md">
                  Photo principale
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-rose-700"
                title="Supprimer la photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
