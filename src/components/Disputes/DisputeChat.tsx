import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, Loader2, FileText, User, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api';
import toast from 'react-hot-toast';
import { Dispute, DisputeMessage } from '../../domains/dispute/dispute.types';
import { DisputeDetailsPanel } from './DisputeDetailsPanel';
import { LightboxModal } from './LightboxModal';

export const DisputeChat: React.FC<{ disputeId: string, onClose?: () => void }> = ({ disputeId, onClose }) => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDisputeDetails = useCallback(async () => {
    try {
      const res = await apiGet<{ success: boolean; dispute: Dispute; messages: DisputeMessage[] }>(`/api/v1/disputes/${disputeId}`);
      if (res?.dispute) {
        setDispute(res.dispute);
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    fetchDisputeDetails();
    const interval = setInterval(fetchDisputeDetails, 5000);
    return () => clearInterval(interval);
  }, [fetchDisputeDetails]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;
    setSending(true);
    try {
      await apiPost(`/api/v1/disputes/${disputeId}/messages`, { message: newMessage });
      setNewMessage('');
      fetchDisputeDetails();
    } catch {
      toast.error(t('error_sending_msg', 'Erreur d\'envoi.'));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 1048576) {
      toast.error(t('La taille du fichier dépasse la limite autorisée de 1 Mo.'));
      return;
    }
    setUploading(true);
    const toastId = toast.loading(t('Téléversement du document de preuve...'));
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const resultStr = reader.result as string;
          const base64String = resultStr.split(',')[1];
          const res = await apiPost<{ success: boolean; fileUrl: string; fileName: string; fileType: string }>(
            `/api/v1/disputes/${disputeId}/upload`,
            { fileName: file.name, mimeType: file.type || 'application/octet-stream', base64Data: base64String }
          );
          if (res?.success) {
            await apiPost(`/api/v1/disputes/${disputeId}/messages`, {
              message: `📎 [Document de preuve] : ${res.fileName}`,
              fileUrl: res.fileUrl, fileName: res.fileName, fileType: res.fileType,
            });
            toast.success(t('Fichier téléversé et partagé !'), { id: toastId });
            fetchDisputeDetails();
          } else throw new Error('Upload error');
        } catch (uploadErr: unknown) {
          toast.error(uploadErr instanceof Error ? uploadErr.message : t('Échec du téléversement.'), { id: toastId });
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error(t('Erreur lors du traitement du fichier.'), { id: toastId });
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const role = userProfile?.role || 'buyer';

  return (
    <div className="flex flex-col h-[550px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800">{t('Litige sur commande')} #{dispute?.orderId?.substring(0, 8)}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dispute?.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {dispute?.status === 'resolved' ? t('Résolu') : t('Ouvert')}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {dispute && (
        <DisputeDetailsPanel dispute={dispute} showDetails={showDetails} setShowDetails={setShowDetails} onPhotoClick={(url) => setLightboxImg(url)} t={(key: string, defaultValue?: string) => defaultValue ? t(key, defaultValue) : t(key)} />
      )}

      {role === 'admin' && dispute?.aiSummary && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex gap-3 overflow-y-auto max-h-36 shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap flex-1">
            <span className="font-bold block mb-1 uppercase tracking-wider text-[10px] text-indigo-600">Rapport d'Analyse IA (Visible uniquement par l'administrateur)</span>
            {dispute.aiSummary}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm italic">
            {t('no_messages', 'Aucun message pour le moment. L\'équipe administrative va vous répondre sous peu.')}
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.uid;
            const isAdmin = msg.senderRole === 'admin';
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 ${isAdmin ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-600'}`}>
                    {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-orange-600 text-white rounded-br-none' : isAdmin ? 'bg-slate-800 text-white rounded-bl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                  {isAdmin && !isMe && <div className="text-[10px] uppercase font-bold text-slate-300 mb-1">Support Olmart</div>}
                  {!isAdmin && !isMe && <div className="text-[10px] uppercase font-bold text-orange-600 mb-1">{msg.senderRole === 'seller' ? 'Vendeur' : 'Acheteur'}</div>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  {msg.fileUrl && (
                    <div className="mt-2.5 border-t border-slate-100/50 pt-2 space-y-2">
                      {msg.fileType?.startsWith('image/') ? (
                        <div onClick={() => setLightboxImg(msg.fileUrl || null)} className="max-w-[180px] rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity bg-slate-50">
                          <img src={msg.fileUrl} alt={msg.fileName || 'Attachment'} referrerPolicy="no-referrer" className="max-h-24 object-contain w-full" />
                        </div>
                      ) : (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${isMe ? 'bg-orange-700 border-orange-550 text-white hover:bg-orange-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'} transition-all`}>
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[120px]">{msg.fileName || t('Fichier')}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
        <button onClick={() => fileInputRef.current?.click()} disabled={dispute?.status === 'resolved' || sending || uploading} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-500 disabled:opacity-50 relative shrink-0 cursor-pointer" title={t('Ajouter une preuve (Max 1 Mo)')}>
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-orange-600" /> : <Paperclip className="w-5 h-5" />}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf,application/zip,text/plain,text/csv" />
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t('write_message', 'Écrire un message...')} className="flex-1 bg-slate-100 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none" disabled={dispute?.status === 'resolved' || sending} />
        <button onClick={handleSend} disabled={!newMessage.trim() || dispute?.status === 'resolved' || sending} className="w-12 h-12 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1" />}
        </button>
      </div>

      {lightboxImg && <LightboxModal imageUrl={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  );
};

