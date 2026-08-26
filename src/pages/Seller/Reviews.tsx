import React, { useEffect, useState } from 'react';
import { Star, MessageSquareQuote, ExternalLink, Loader2 } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { AppTimestamp } from '../../utils/date';

export const SellerReviews: React.FC = () => {
   const { t } = useTranslation();
   const { currentUser } = useAuth();
   interface SellerReview {
  id: string;
  rating: number;
  comment?: string;
  userName?: string;
  createdAt: AppTimestamp;
  productId: string;
  productName?: string;
}
   const [reviews, setReviews] = useState<SellerReview[]>([]);
   const [loading, setLoading] = useState(true);
   const [loadingMore] = useState(false);
   const [averageRating, setAverageRating] = useState(0);
   const [lastVisible] = useState<unknown>(null);

   useEffect(() => {
      const fetchReviews = async () => {
         if (!currentUser) return;
         try {
            const data = await apiGet<{ reviews?: SellerReview[]; averageRating?: number }>("/api/v1/seller/reviews");
            if (data) {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);
            }
         } catch (err: unknown) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      fetchReviews();
   }, [currentUser]);

   const loadMoreReviews = async () => {
     // No op, fetching all matching limit in backend for simplicity
   };

   if (loading) return <div className="p-6 text-zinc-500 text-center font-bold">{t("Chargement des avis...")}</div>;

   return (
      <div className="max-w-6xl space-y-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">{t("Avis Clients")}</h2>
               <p className="text-zinc-500 font-medium mt-1">{t("Consultez les retours de vos clients sur vos produits.")}</p>
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-zinc-100 shadow-sm">
               <div className="flex flex-col">
                  <span className="text-[10px] font-sans font-bold uppercase text-zinc-400 tracking-widest rtl:tracking-normal">{t("Note Moyenne Catalog")}</span>
                  <div className="flex items-end gap-2 mt-1">
                     <span className="text-3xl font-sans font-bold text-zinc-950 leading-none">{averageRating > 0 ? averageRating.toFixed(1) : '-'}</span>
                     <Star className={`w-5 h-5 mb-0.5 ${averageRating > 0 ? 'text-[#ea580c] fill-[#ea580c]' : 'text-zinc-300'}`} />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-6 md:p-8">
            {reviews.length === 0 ? (
               <div className="text-center py-20">
                  <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                     <MessageSquareQuote className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-sans font-bold text-zinc-950 mb-2">{t("Aucun avis pour le moment")}</h3>
                  <p className="text-zinc-500">{t("Les clients n'ont pas encore noté vos produits.")}</p>
               </div>
            ) : (
               <div className="space-y-6">
                  {reviews.map((review) => (
                     <div key={review.id} className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#ea580c] fill-[#ea580c]' : 'text-zinc-200'}`} />
                                 ))}
                              </div>
                              <h4 className="font-bold text-sm text-zinc-900">{review.userName || 'Client anonyme'}</h4>
                              <p className="text-xs text-zinc-500">
                                 {review.createdAt 
                                   ? (() => {
                                       const ca = review.createdAt;
                                       if (ca instanceof Date) {
                                         return ca.toLocaleDateString('fr-DZ');
                                       }
                                       if (typeof ca === 'string' || typeof ca === 'number') {
                                         return new Date(ca).toLocaleDateString('fr-DZ');
                                       }
                                       if (typeof ca === 'object' && ca !== null) {
                                         if ('toDate' in ca && typeof ca.toDate === 'function') {
                                           return ca.toDate().toLocaleDateString('fr-DZ');
                                         }
                                         const raw = ca as { seconds?: number; _seconds?: number };
                                         const s = raw.seconds ?? raw._seconds;
                                         if (typeof s === 'number') {
                                           return new Date(s * 1000).toLocaleDateString('fr-DZ');
                                         }
                                       }
                                       return '';
                                     })()
                                   : ''}
                              </p>
                           </div>
                           <Link 
                              to={`/product/${review.productId}`} 
                              target="_blank"
                              className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider rtl:tracking-normal flex items-center gap-1 hover:text-orange-600 transition-colors bg-white px-3 py-1.5 rounded-full border border-zinc-200"
                           >
                              {review.productName} <ExternalLink className="w-3 h-3" />
                           </Link>
                        </div>
                        <p className="text-zinc-700 text-sm font-medium leading-relaxed">
                           "{review.comment}"
                        </p>
                     </div>
                  ))}
                  {Boolean(lastVisible) && (
                     <div className="pt-6 flex justify-center">
                        <button 
                           onClick={loadMoreReviews} 
                           disabled={loadingMore}
                           className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-full font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2 shadow-sm relative group"
                        >
                           {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                           {loadingMore ? t("Chargement...") : t("Afficher plus d'avis")}
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
};
