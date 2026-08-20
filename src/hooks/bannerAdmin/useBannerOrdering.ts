import { useState } from "react";
import { db } from "../../lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { DbBanner } from "./useBannerTypes";

export function useBannerOrdering(
  banners: DbBanner[],
  setBanners: React.Dispatch<React.SetStateAction<DbBanner[]>>,
  fetchData: () => Promise<void>
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const saveNewReorder = async (list: DbBanner[]) => {
    try {
      const batch = writeBatch(db);
      list.forEach((b, index) => {
        batch.update(doc(db, "banners", b.id), { sort_order: index + 1 });
      });
      await batch.commit();
      toast.success("Ordre de tri réordonné avec succès !");
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde du re-tri";
      toast.error(errMsg);
    }
  };

  const shiftIndex = async (index: number, direction: "up" | "down") => {
    const updatedBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= updatedBanners.length) return;

    const element = updatedBanners[index];
    updatedBanners[index] = updatedBanners[targetIndex];
    updatedBanners[targetIndex] = element;

    setBanners(updatedBanners);
    await saveNewReorder(updatedBanners);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedBanners = [...banners];
    const draggedItem = updatedBanners[draggedIndex];

    updatedBanners.splice(draggedIndex, 1);
    updatedBanners.splice(dropIndex, 0, draggedItem);

    setDraggedIndex(null);
    setBanners(updatedBanners);
    await saveNewReorder(updatedBanners);
  };

  return {
    draggedIndex,
    setDraggedIndex,
    shiftIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
