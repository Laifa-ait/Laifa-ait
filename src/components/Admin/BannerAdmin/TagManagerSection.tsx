import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Tag as TagIcon, Trash2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagManagerSectionProps {
  tags: Tag[];
  tagName: string;
  tagSlug: string;
  setTagSlug: (val: string) => void;
  handleCreateTag: (e: React.FormEvent) => void;
  handleDeleteTag: (id: string, name: string) => void;
  handleTagNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TagManagerSection: React.FC<TagManagerSectionProps> = ({
  tags,
  tagName,
  tagSlug,
  setTagSlug,
  handleCreateTag,
  handleDeleteTag,
  handleTagNameChange,
}) => {
  const { t } = useTranslation();

  return (
    <div id="tab-content-tags" className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start animate-fade-in">
      {/* Creating tag form */}
      <div id="tag-creator-card" className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm h-fit space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-zinc-950 uppercase tracking-wide">
            {t("Créer un Nouveau Tag")}
          </h3>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
            {t("Les tags groupent les produits et lient les bannières")}
          </p>
        </div>

        <form id="tag-create-form" onSubmit={handleCreateTag} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500">
              {t("Nom du Tag (ex: Soldes d'été)")}
            </label>
            <input
              id="input-tag-name"
              type="text"
              required
              placeholder={t("Nom du tag...") || "Nom du tag..."}
              value={tagName}
              onChange={handleTagNameChange}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500">
              {t("Slug d'URL (ex: soldes-ete)")}
            </label>
            <input
              id="input-tag-slug"
              type="text"
              required
              placeholder={t("slug-url") || "slug-url"}
              value={tagSlug}
              onChange={(e) =>
                setTagSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9_-]/g, "")
                )
              }
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-sm bg-zinc-50 focus:outline-none font-mono"
            />
          </div>

          <button
            id="btn-submit-tag"
            type="submit"
            className="w-full h-11 bg-orange-600 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors cursor-pointer flex items-center justify-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Créer le Tag")}</span>
          </button>
        </form>
      </div>

      {/* Tags list */}
      <div id="tags-list-card" className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-zinc-950 uppercase tracking-wide">
          {t("Tags Existants (")}
          {tags.length})
        </h3>

        {tags.length === 0 ? (
          <div id="no-tags-placeholder" className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed text-zinc-400 uppercase text-xs font-bold font-mono">
            {t("Aucun tag existant. Créez-en un à gauche.")}
          </div>
        ) : (
          <div id="tags-grid-scroller" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pe-2">
            {tags.map((tag) => (
              <div
                id={`tag-row-${tag.id}`}
                key={tag.id}
                className="flex justify-between items-center p-3 border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-all bg-[#fafafa]/50"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-sans font-bold text-zinc-950 truncate flex items-center gap-1.5">
                    <TagIcon className="w-3 h-3 text-orange-500 shrink-0" />
                    {tag.name}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-400 font-bold tracking-wider truncate">
                    {t("slug:")}
                    {tag.slug}
                  </div>
                </div>

                <button
                  id={`btn-delete-tag-${tag.id}`}
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 cursor-pointer border-none"
                  title={t("Supprimer ce tag") || "Supprimer"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
