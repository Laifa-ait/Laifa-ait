import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Clock, User, Store, Plus, Paperclip, FileText, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

export const Support: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Ticket Modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ subject: '', priority: 'medium' });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // 1. Fetch Tickets
  useEffect(() => {
    if (!currentUser) return;
    let isCancelled = false;
    
    const fetchTickets = async () => {
      try {
        const data = await apiGet<any>("/api/v1/support/tickets");
        if (isCancelled) return;
        const fetchedTickets = data.tickets || [];
        setTickets(fetchedTickets);
        setLoadingTickets(false);
        
        setSelectedTicket(prev => {
          if (!prev && fetchedTickets.length > 0) {
            return fetchedTickets[0].id;
          }
          return prev;
        });
      } catch (err) {
        if (!isCancelled) {
            console.error(err);
            setLoadingTickets(false);
        }
      }
    };
    fetchTickets();
    const intervalId = setInterval(fetchTickets, 10000);
    
    return () => {
        isCancelled = true;
        clearInterval(intervalId);
    };
  }, [currentUser]);

  // 2. Fetch Messages for selected ticket
  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }
    let isCancelled = false;
    setLoadingMessages(true);
    
    const fetchMessages = async () => {
      try {
        const data = await apiGet<any>(`/api/v1/support/tickets/${selectedTicket}/messages`);
        if (isCancelled) return;
        setMessages(data.messages || []);
        setLoadingMessages(false);
      } catch (err) {
        if (!isCancelled) {
            console.error(err);
            setLoadingMessages(false);
        }
      }
    };
    
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);

    return () => {
        isCancelled = true;
        clearInterval(intervalId);
    };
  }, [selectedTicket]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTicketData.subject.trim()) return;

    setCreatingTicket(true);
    try {
      const res = await apiPost<any>("/api/v1/support/tickets", {
        subject: newTicketData.subject.trim(),
        priority: newTicketData.priority,
      });
      setIsNewTicketModalOpen(false);
      setNewTicketData({ subject: '', priority: 'medium' });
      if (res && res.ticketId) {
        setSelectedTicket(res.ticketId);
      }
      toast.success("Ticket créé avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedTicket) return;

    setSending(true);
    try {
      await apiPost(`/api/v1/support/tickets/${selectedTicket}/messages`, {
        text: newMessage.trim(),
      });
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket || !currentUser) return;
    try {
      await apiPost(`/api/v1/support/tickets/${selectedTicket}/reopen`, {});
      toast.success("Le ticket a été ré-ouvert avec succès !");
    } catch (err) {
      console.error("Error reopening ticket:", err);
      toast.error("Erreur lors de la ré-ouverture.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !selectedTicket) return;

    // Robust MIME and extension validation (all major supported formats)
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/zip',
      'text/plain',
      'text/csv'
    ];
    const MAX_FILE_SIZE = 1048576; // 1 MB = 1,048,576 bytes

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format de fichier non supporté (seuls JPG, PNG, GIF, WEBP, PDF, ZIP, TXT et CSV sont autorisés).");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Le fichier dépasse la taille maximale autorisée de 1 Mo.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          // Secure API backend upload
          const uploadRes = await apiPost<any>(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/upload`, {
            fileName: file.name,
            mimeType: file.type,
            base64Data
          });

          if (uploadRes.success) {
            await apiPost(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/messages`, {
              text: `Fichier envoyé : ${file.name}`,
              fileUrl: uploadRes.fileUrl,
              fileName: uploadRes.fileName,
              fileType: uploadRes.fileType
            });
            
            toast.success("Fichier envoyé.");
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          toast.error(error.message || "Le fichier est trop volumineux. La taille maximale autorisée est de 1 Mo.");
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("FileReader process error:", error);
      toast.error("Erreur lors de l'envoi du fichier.");
      setUploading(false);
    }
  };

  const currentTicket = tickets.find(t => t.id === selectedTicket);

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">{t("Support Admin")}</h2>
          <p className="text-zinc-500 font-medium text-sm">{t("Gérez vos tickets d'assistance et litiges.")}</p>
        </div>
        <button 
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-6 py-3 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("Nouveau Ticket")}</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar: Tickets list */}
        <div className="w-full lg:w-96 bg-white rounded-[2rem] border border-zinc-100 flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-50 shrink-0 bg-zinc-50/50">
            <h3 className="font-sans font-bold text-zinc-950">{t("Vos Tickets")}</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
            {loadingTickets ? (
              <div className="p-8 text-center text-zinc-400">{t("Chargement...")}</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                 <FileText className="w-8 h-8 text-zinc-200 mb-2" />
                 <p className="text-zinc-400 font-medium text-sm">{t("Aucun ticket ouvert")}</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full text-start p-5 transition-colors flex items-center justify-between group ${selectedTicket === ticket.id ? 'bg-orange-50/50' : 'hover:bg-zinc-50/50'}`}
                >
                  <div className="flex-1 min-w-0 pe-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm truncate font-bold ${selectedTicket === ticket.id ? 'text-orange-950' : 'text-zinc-800'}`}>
                        {ticket.subject}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest rtl:tracking-normal ${
                         ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                         {ticket.status === 'resolved' ? 'Résolu' : 'Ouvert'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{ticket.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`w-2 h-2 rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                       }`} title={`Priorité ${ticket.priority}`}></span>
                       <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest rtl:tracking-normal">
                          {ticket.createdAt?.toDate?.().toLocaleDateString('fr-FR')}
                       </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${selectedTicket === ticket.id ? 'text-orange-500' : 'text-zinc-300'}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-[2rem] border border-zinc-100 flex flex-col overflow-hidden shadow-sm min-h-[400px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-zinc-50 flex items-center justify-between shrink-0 shadow-sm z-10 bg-white" >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-sans font-bold text-lg text-zinc-950">{currentTicket?.subject}</h3>
                    {currentTicket?.status === 'resolved' && (
                       <span className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal bg-emerald-100 text-emerald-700 px-2 py-1 rounded-xl">
                          <CheckCircle2 className="w-3 h-3" /> {t("Résolu")}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                     {t("Ticket #")}{selectedTicket.substring(0,8)} {t("• Priorité")}{currentTicket?.priority}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400">
                    <p className="font-medium">{t("Commencez la conversation...")}</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSeller = m.sender === 'seller';
                    return (
                      <div key={m.id} className={`flex gap-4 ${isSeller ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isSeller ? 'bg-orange-100 text-orange-600' : 'bg-zinc-950 text-white'}`}>
                          {isSeller ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[75%] rounded-2xl p-5 ${isSeller ? 'bg-white rounded-tr-sm border border-zinc-100 shadow-sm' : 'bg-zinc-50 rounded-tl-sm border border-zinc-200'}`}>
                          
                          {/* Render File Attachment if present */}
                          {m.fileUrl && m.fileType && (
                             <div className="mb-3">
                                {m.fileType.startsWith('image/') ? (
                                   <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                                      <img loading="lazy" src={m.fileUrl} alt={m.fileName} className="max-w-full max-h-64 object-contain" />
                                   </div>
                                ) : (
                                   <a href={m.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">
                                      <FileText className="w-5 h-5 text-zinc-500" />
                                      <span className="text-xs font-bold text-zinc-700 truncate">{m.fileName}</span>
                                   </a>
                                )}
                             </div>
                          )}

                          <p className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${isSeller ? 'text-zinc-800' : 'text-zinc-600'}`}>{m.text}</p>
                          
                          {m.createdAt && (
                            <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] font-sans font-bold uppercase text-zinc-300">
                              <Clock className="w-3 h-3" />
                              {m.createdAt.toDate?.().toLocaleString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              {currentTicket?.status !== 'resolved' ? (
                <div className="p-4 md:p-6 bg-white border-t border-zinc-100 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-12 h-14 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-2xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 border border-zinc-200"
                        title={t("Joindre un fichier (Image, PDF)") || "Joindre un fichier (Image, PDF)"}
                      >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <Paperclip className="w-5 h-5" />}
                      </button>
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t("Votre message...") || "Votre message..."}
                        className="flex-1 px-5 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none text-sm font-medium focus:border-orange-500 transition-colors focus:ring-4 focus:ring-orange-500/10"
                      />
                      <button 
                        type="submit"
                        disabled={sending || (!newMessage.trim() && !uploading)}
                        className="px-6 h-14 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1">
                      {t("Formats acceptés : JPG, PNG, GIF, WEBP, PDF, ZIP, TXT, CSV • 1 Mo max.")}
                    </p>
                  </form>
                </div>
              ) : (
                 <div className="p-8 bg-zinc-50 border-t border-zinc-100 text-center space-y-4 shrink-0">
                    <p className="text-sm font-medium text-zinc-500">
                       {t("Ce ticket a été marqué comme résolu. Vous ne pouvez plus y répondre.")}</p>
                    {(() => {
                       const ts = currentTicket?.resolvedAt || currentTicket?.updatedAt || currentTicket?.lastMessageAt;
                       let eligible = true;
                       if (ts) {
                          const resDate = ts.toDate ? ts.toDate() : new Date(ts);
                          const diffDays = (Date.now() - resDate.getTime()) / (1000 * 60 * 60 * 24);
                          eligible = diffDays <= 7;
                       }
                       if (eligible) {
                          return (
                             <button
                                onClick={handleReopenTicket}
                                className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs uppercase tracking-wider rtl:tracking-normal hover:bg-red-100 transition-all flex items-center gap-2 mx-auto shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                             >
                                {t("Mon problème n'est pas résolu (Ré-ouvrir le ticket)")}</button>
                          );
                       } else {
                          return (
                             <p className="text-xs text-zinc-400">
                                {t("Fermé depuis plus de 7 jours. Vous ne pouvez plus ré-ouvrir ce ticket.")}</p>
                          );
                       }
                    })()}
                 </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4 bg-zinc-50/50">
               <MessageSquare className="w-16 h-16 text-zinc-200" />
               <p className="font-bold">{t("Sélectionnez un ticket pour afficher la conversation")}</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between">
                <h3 className="text-xl font-sans font-bold text-zinc-950">{t("Ouvrir un ticket")}</h3>
                <button 
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="w-10 h-10 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">{t("Catégorie de la demande")}</label>
                  <select
                    required
                    value={newTicketData.subject}
                    onChange={e => setNewTicketData({...newTicketData, subject: e.target.value})}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none text-sm font-bold focus:border-orange-500 transition-colors"
                  >
                    <option value="" disabled>{t("Sélectionner un motif...")}</option>
                    <option value="Problème de livraison">{t("Problème de livraison")}</option>
                    <option value="Litige Client">{t("Litige Client")}</option>
                    <option value="Contestation Trust Score">{t("Contestation Trust Score (-10 pts)")}</option>
                    <option value="Problème Technique">{t("Problème Technique")}</option>
                    <option value="Facturation / Paiement">{t("Facturation / Paiement")}</option>
                    <option value="Autre">{t("Autre demande")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">{t("Priorité")}</label>
                  <select
                    value={newTicketData.priority}
                    onChange={e => setNewTicketData({...newTicketData, priority: e.target.value})}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none text-sm font-bold focus:border-orange-500 transition-colors appearance-none"
                  >
                    <option value="low">{t("Basse - Information générale")}</option>
                    <option value="medium">{t("Moyenne - Problème mineur")}</option>
                    <option value="high">{t("Haute - Blocage critique / Litige")}</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={creatingTicket || !newTicketData.subject.trim()}
                  className="w-full py-4 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-sm uppercase tracking-widest rtl:tracking-normal hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingTicket ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {t("Créer le ticket")}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

