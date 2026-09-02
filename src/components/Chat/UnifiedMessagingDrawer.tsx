import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { uploadFile } from '../../services/storage.service';
import { InitiateConversationDTO } from '../../types/messaging';
import { messagingApi } from '../../services/messagingApi';
import { useMessaging } from '../../hooks/useMessaging';
import { NegotiationPanel } from './NegotiationPanel';
import { ConversationList } from './ConversationList';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { ReportMessageModal } from './ReportMessageModal';
import { CreateNegotiationForm } from './CreateNegotiationForm';
import { UnifiedMessagingHeader } from './UnifiedMessagingHeader';
import { VisitRequestModal } from '../OlmaImmo/VisitRequestModal';
import toast from 'react-hot-toast';

interface UnifiedMessagingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: InitiateConversationDTO;
  initialConversationId?: string;
}

export const UnifiedMessagingDrawer: React.FC<UnifiedMessagingDrawerProps> = ({
  isOpen,
  onClose,
  initialContext,
  initialConversationId
}) => {
  const {
    currentUser, conversations, selectedConversation, setSelectedConversation,
    messages, setMessages, loadingConversations, loadingMessages,
    hasMoreMessages, hasMoreConversations, loadingAction, setLoadingAction,
    loadConversations, loadMessages
  } = useMessaging(isOpen, initialContext, initialConversationId);

  const [textInput, setTextInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCreateNegotiation, setShowCreateNegotiation] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const isRealEstate =
    selectedConversation?.type === 'REAL_ESTATE_INQUIRY' ||
    Boolean(selectedConversation?.context?.propertyId);

  const handleSendMessageText = async (contentToSend: string) => {
    if (!selectedConversation || !contentToSend.trim() || sendingMessage || !currentUser) return;
    setSendingMessage(true);
    setTextInput('');
    try {
      const res = await messagingApi.sendMessage(selectedConversation.id, { text: contentToSend.trim() });
      if (res.success && res.data) { setMessages((prev) => [...prev, res.data]); scrollToBottom(); }
    } catch { toast.error("Erreur lors de l'envoi."); } finally { setSendingMessage(false); }
  };

  const handleSendMessage = (e: React.FormEvent) => { e.preventDefault(); handleSendMessageText(textInput); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !currentUser) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Fichier supérieur à 5 Mo interdit.');
    const isPdf = file.type === 'application/pdf';
    setUploadingAttachment(true);
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const downloadUrl = await uploadFile(`chat_attachments/${selectedConversation.id}/${Date.now()}_${cleanName}`, file);
      const res = await messagingApi.sendMessage(selectedConversation.id, {
        text: isPdf ? `[Document PDF : ${file.name}]` : 'Photo partagée',
        attachments: [{ type: isPdf ? 'pdf' : 'image', url: downloadUrl, fileName: file.name, fileSizeBytes: file.size }]
      });
      if (res.success && res.data) { setMessages((prev) => [...prev, res.data]); scrollToBottom(); }
    } catch { toast.error("Erreur lors de l'envoi du fichier."); }
    finally { setUploadingAttachment(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleCreateNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !offerAmount || !currentUser) return;
    const parsed = parseInt(offerAmount, 10);
    if (isNaN(parsed) || parsed <= 0) return toast.error('Montant invalide.');
    setLoadingAction('create');
    try {
      const res = await messagingApi.createNegotiation(selectedConversation.id, parsed, '');
      if (res.success && res.data) {
        setSelectedConversation((prev) => (prev ? { ...prev, activeNegotiation: res.data } : null));
        setShowCreateNegotiation(false); setOfferAmount(''); toast.success('Offre envoyée.');
        await loadMessages(selectedConversation.id);
      }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoadingAction(null); }
  };

  const handleResolveOffer = async (action: 'ACCEPT' | 'REJECT', offerId: string) => {
    if (!selectedConversation) return;
    setLoadingAction(`${action.toLowerCase()}-${offerId}`);
    try {
      const res = await messagingApi.resolveNegotiation(selectedConversation.id, { offerId, action });
      if (res.success && res.data) {
        setSelectedConversation((prev) => (prev ? { ...prev, activeNegotiation: res.data } : null));
        toast.success(action === 'ACCEPT' ? 'Offre acceptée.' : 'Offre refusée.');
        await loadMessages(selectedConversation.id);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[#faf8f5] border-l border-[#e8e2d4] text-slate-800 flex flex-col h-full shadow-2xl z-10">
          <UnifiedMessagingHeader
            selectedConversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onBlock={async () => {
              if (selectedConversation) {
                await messagingApi.blockConversation(selectedConversation.id);
                setSelectedConversation((p) => p ? { ...p, isBlocked: true } : null);
                toast.success('Bloqué');
              }
            }}
            onClose={onClose}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedConversation ? (
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedId={null}
                  currentUserId={currentUser?.uid || ''}
                  onSelect={async (conv) => {
                    setSelectedConversation(conv);
                    await loadMessages(conv.id);
                    await messagingApi.markConversationRead(conv.id);
                  }}
                  isLoading={loadingConversations}
                  hasMore={hasMoreConversations}
                  onLoadMore={loadConversations}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#faf8f5]">
                {selectedConversation.activeNegotiation && (
                  <div className="px-4">
                    <NegotiationPanel
                      negotiation={selectedConversation.activeNegotiation}
                      currentUserId={currentUser?.uid || ''}
                      onAccept={(id) => handleResolveOffer('ACCEPT', id)}
                      onReject={(id) => handleResolveOffer('REJECT', id)}
                      onCounter={async (offerId, amt) => {
                        const res = await messagingApi.resolveNegotiation(selectedConversation.id, { offerId, action: 'COUNTER', counterAmountDZD: amt });
                        if (res.success && res.data) setSelectedConversation((p) => p ? { ...p, activeNegotiation: res.data } : null);
                      }}
                      onCancel={async (offerId) => {
                        const res = await messagingApi.cancelNegotiation(selectedConversation.id, offerId);
                        if (res.success && res.data) setSelectedConversation((p) => p ? { ...p, activeNegotiation: res.data } : null);
                      }}
                      loadingAction={loadingAction}
                    />
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {hasMoreMessages && (
                    <div className="text-center py-2">
                      <button type="button" onClick={() => messages.length > 0 && loadMessages(selectedConversation.id, messages[0].createdAt)} className="text-xs text-[#1e3835] font-bold hover:underline cursor-pointer">
                        Charger messages anciens
                      </button>
                    </div>
                  )}
                  {loadingMessages ? (
                    <div className="flex items-center justify-center p-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin text-[#1e3835]" /></div>
                  ) : (
                    messages.map((msg) => <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === currentUser?.uid} onReport={(id) => setReportingMessageId(id)} />)
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {showCreateNegotiation && (
                  <CreateNegotiationForm offerAmount={offerAmount} setOfferAmount={setOfferAmount} onSubmit={handleCreateNegotiation} onCancel={() => setShowCreateNegotiation(false)} />
                )}

                <ChatInputBar
                  textInput={textInput}
                  onChangeText={setTextInput}
                  onSubmit={handleSendMessage}
                  onSelectFile={handleFileUpload}
                  onToggleNegotiate={() => setShowCreateNegotiation((p) => !p)}
                  isBlocked={selectedConversation.isBlocked}
                  isSending={sendingMessage}
                  isUploading={uploadingAttachment}
                  hasActiveNegotiation={Boolean(selectedConversation.activeNegotiation)}
                  fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                  isRealEstate={isRealEstate}
                  onSelectQuickChip={(text) => handleSendMessageText(text)}
                  onRequestVisit={() => setShowVisitModal(true)}
                />
              </div>
            )}
          </div>

          <ReportMessageModal
            messageId={reportingMessageId}
            onClose={() => setReportingMessageId(null)}
            onSubmit={async (msgId, reason, desc) => {
              await messagingApi.reportMessage(msgId, reason, desc);
              toast.success('Signalement envoyé.');
            }}
          />

          {selectedConversation?.context?.propertyId && (
            <VisitRequestModal
              isOpen={showVisitModal}
              onClose={() => setShowVisitModal(false)}
              propertyId={selectedConversation.context.propertyId}
              propertyTitle={selectedConversation.context.referenceTitle || 'Annonce'}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
