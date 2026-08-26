import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  MessageSquare,
  Phone,
  Sparkles,
  ChevronLeft,
  Search,
  MapPin,
  Mic,
  Image as ImageIcon,
  Play,
  Pause,
  X,
  Check,
  CheckCheck,
  DollarSign,
  Radio,
  ExternalLink
} from 'lucide-react';
import { BricolageConversation, BricolageMessage } from '../../types/bricolage';

interface BricolageMessagingProps {
  conversations: BricolageConversation[];
  messages: BricolageMessage[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, extraData?: Partial<BricolageMessage>) => void;
  currentUserType: 'client' | 'artisan';
}

const QUICK_RESPONSES_CLIENT = [
  "Bonjour, quel est votre tarif exact ?",
  "Pouvez-vous venir aujourd'hui à 14h ?",
  "Mon adresse exacte est envoyée 📍",
  "D'accord pour le devis !",
  "Avez-vous le matériel nécessaire avec vous ?"
];

const QUICK_RESPONSES_ARTISAN = [
  "Bonjour ! Je suis disponible dès cet après-midi.",
  "Je suis actuellement en route 🚗",
  "Avez-vous une photo du problème ?",
  "Chantier terminé avec succès 👍",
  "Voici ma proposition de devis détaillée."
];

export const BricolageMessaging: React.FC<BricolageMessagingProps> = ({
  conversations,
  messages,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  currentUserType
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'quotes'>('all');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Modals inside chat
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Voice player state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Quote Form State
  const [quotePrice, setQuotePrice] = useState('3500');
  const [quoteDuration, setQuoteDuration] = useState('2 heures');
  const [quoteDetails, setQuoteDetails] = useState('Intervention sur site, diagnostic complet et pièces incluses.');

  // Location Form State
  const [locWilaya, setLocWilaya] = useState('16 - Alger');
  const [locCommune, setLocCommune] = useState('Hydra');
  const [locAddress, setLocAddress] = useState('Résidence Les Pins, Bâtiment B, Apt 04');

  // Custom Image URL or sample selection
  const [selectedImageUrl, setSelectedImageUrl] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = messages.filter(m => m.conversationId === activeConv?.id);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConversationId]);

  // Handle voice note recording simulator timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleSendText = (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim() || !activeConv) return;

    onSendMessage(activeConv.id, finalMsg);
    setInputText('');
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;

    const priceNum = parseInt(quotePrice, 10) || 3500;
    onSendMessage(
      activeConv.id,
      `📋 Proposition de Devis Officiel : ${priceNum.toLocaleString()} DA (${quoteDuration})`,
      {
        offerProposal: {
          id: `PROP-${Date.now()}`,
          priceDZD: priceNum,
          duration: quoteDuration,
          notes: quoteDetails,
          status: 'pending'
        }
      }
    );
    setIsQuoteModalOpen(false);
  };

  const handleSendLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;

    onSendMessage(
      activeConv.id,
      `📍 Position partagée : ${locWilaya}, ${locCommune}`,
      {
        locationPin: {
          wilaya: locWilaya,
          commune: locCommune,
          address: locAddress
        }
      }
    );
    setIsLocationModalOpen(false);
  };

  const handleSendImage = () => {
    if (!activeConv || !selectedImageUrl) return;

    onSendMessage(
      activeConv.id,
      `📷 Photo du chantier transmise`,
      {
        attachmentUrl: selectedImageUrl
      }
    );
    setIsImagePickerOpen(false);
  };

  const handleSendVoiceNote = () => {
    if (!activeConv) return;

    setIsRecording(false);
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds || 15}`;
    onSendMessage(
      activeConv.id,
      `🎤 Note vocale (${durationStr})`,
      {
        voiceNoteUrl: 'demo_voice_clip.mp3',
        voiceNoteDuration: durationStr
      }
    );
  };

  const handleAcceptProposal = (msg: BricolageMessage) => {
    if (!activeConv || !msg.offerProposal) return;

    onSendMessage(
      activeConv.id,
      `✅ J'accepte votre devis de ${msg.offerProposal.priceDZD.toLocaleString()} DA ! Vous pouvez venir aux créneaux convenus.`
    );
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const partnerName = currentUserType === 'client' ? conv.artisanName : conv.clientName;
    const matchesSearch = partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') return matchesSearch && conv.unreadCount > 0;
    if (activeFilter === 'quotes') return matchesSearch && conv.lastMessage.includes('Devis');
    return matchesSearch;
  });

  const quickResponses = currentUserType === 'client' ? QUICK_RESPONSES_CLIENT : QUICK_RESPONSES_ARTISAN;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-w-7xl mx-auto">
      {/* LEFT SIDEBAR: CONVERSATION LIST */}
      <div className={`md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col ${
        mobileShowChat ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm tracking-tight">
                  Messagerie Directe
                </h2>
                <p className="text-[10px] text-slate-500 font-bold">
                  Espace {currentUserType === 'artisan' ? 'Artisan Pro' : 'Client Olma'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
              {conversations.length} fil(s)
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher artisan, client, service..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors shrink-0 flex items-center gap-1 ${
                activeFilter === 'unread'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Non lues
            </button>
            <button
              onClick={() => setActiveFilter('quotes')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors shrink-0 ${
                activeFilter === 'quotes'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Devis & Devis Reçus
            </button>
          </div>
        </div>

        {/* Conversation Items Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[520px]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">Aucune conversation trouvée.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConv?.id;
              const partnerName = currentUserType === 'client' ? conv.artisanName : conv.clientName;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border relative group ${
                    isActive
                      ? 'bg-slate-950 text-white border-amber-500 shadow-lg'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                          isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-amber-400'
                        }`}>
                          {partnerName.charAt(0)}
                        </div>
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs truncate max-w-[140px]">
                          {partnerName}
                        </h4>
                        <span className={`text-[10px] block truncate font-bold ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                          {conv.serviceName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-bold ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                        {conv.lastMessageTime}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-[11px] truncate font-medium ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                    {conv.lastMessage}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div className={`md:col-span-8 flex flex-col justify-between bg-white ${
        mobileShowChat ? 'flex' : 'hidden md:flex'
      }`}>
        {activeConv ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md flex items-center justify-between gap-3 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
                  title="Retour aux discussions"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-base shadow-sm border border-amber-400">
                    {(currentUserType === 'client' ? activeConv.artisanName : activeConv.clientName).charAt(0)}
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-sm">
                      {currentUserType === 'client' ? activeConv.artisanName : activeConv.clientName}
                    </h3>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      En ligne 🟢
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-0.5">
                    <span>{activeConv.serviceName}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-black flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Sécurisé Olma
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Actions Bar */}
              <div className="flex items-center gap-2">
                {currentUserType === 'artisan' && (
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all border border-amber-400"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Proposer Devis</span>
                  </button>
                )}

                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                  title="Partager ma position"
                >
                  <MapPin className="w-4 h-4 text-slate-700" />
                </button>

                <a
                  href={`tel:${currentUserType === 'client' ? activeConv.artisanPhone : activeConv.clientPhone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black flex items-center gap-1.5 shadow-md transition-all border border-slate-800"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Appeler</span>
                </a>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[420px] min-h-[350px] bg-slate-50/40">
              <div className="flex items-center justify-center my-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-200/60 px-3 py-1 rounded-full">
                  Aujourd'hui • Discussion Chiffrée
                </span>
              </div>

              {activeMessages.map((msg) => {
                const isMe = msg.senderType === currentUserType;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed font-medium shadow-sm space-y-2.5 ${
                        isMe
                          ? 'bg-slate-950 text-white rounded-br-none border border-slate-800'
                          : 'bg-white text-slate-900 rounded-bl-none border-2 border-slate-200'
                      }`}
                    >
                      {/* Sender Name Header */}
                      <div className="flex items-center justify-between gap-4 border-b pb-1.5 border-slate-700/30">
                        <span className={`text-[10px] font-black ${isMe ? 'text-amber-400' : 'text-amber-600'}`}>
                          {msg.senderName} ({msg.senderType === 'artisan' ? 'Artisan Pro' : 'Client'})
                        </span>
                        <span className="text-[9px] font-bold opacity-60">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Text Content */}
                      {msg.text && (
                        <p className="whitespace-pre-wrap font-semibold leading-relaxed">
                          {msg.text}
                        </p>
                      )}

                      {/* Devis / Offer Proposal Card */}
                      {msg.offerProposal && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-slate-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                              Offre Devis Officielle
                            </span>
                            <span className="text-[11px] font-black text-amber-900">
                              Durée: {msg.offerProposal.duration}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900">
                              {msg.offerProposal.priceDZD.toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-amber-800">DA TTC</span>
                          </div>

                          {msg.offerProposal.notes && (
                            <p className="text-[11px] font-medium text-slate-700 bg-white/80 p-2 rounded-lg border border-amber-200">
                              {msg.offerProposal.notes}
                            </p>
                          )}

                          {currentUserType === 'client' && (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleAcceptProposal(msg)}
                                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accepter ce Devis</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Attachment Card */}
                      {msg.attachmentUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-300 relative group cursor-pointer"
                             onClick={() => setZoomedImage(msg.attachmentUrl || null)}>
                          <img
                            src={msg.attachmentUrl}
                            alt="Pièce jointe chantier"
                            className="w-full h-44 object-cover hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-extrabold gap-1">
                            <ImageIcon className="w-4 h-4" />
                            Agrandir l'image
                          </div>
                        </div>
                      )}

                      {/* Voice Note Card */}
                      {msg.voiceNoteUrl && (
                        <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-300/30 flex items-center gap-3">
                          <button
                            onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                            className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md hover:bg-amber-400"
                          >
                            {playingVoiceId === msg.id ? (
                              <Pause className="w-4 h-4 fill-slate-950" />
                            ) : (
                              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                            )}
                          </button>
                          
                          <div className="flex-1 space-y-1">
                            <div className="h-2 rounded-full bg-slate-300/40 overflow-hidden relative">
                              <div className={`h-full bg-amber-500 transition-all ${
                                playingVoiceId === msg.id ? 'w-3/4 animate-pulse' : 'w-1/3'
                              }`} />
                            </div>
                            <span className={`text-[10px] font-black ${isMe ? 'text-amber-400' : 'text-slate-600'}`}>
                              Note vocale • {msg.voiceNoteDuration || '0:18'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Location Pin Card */}
                      {msg.locationPin && (
                        <div className="p-3 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-900 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-700 font-black text-xs">
                            <MapPin className="w-4 h-4 text-amber-600" />
                            <span>{msg.locationPin.wilaya}, {msg.locationPin.commune}</span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {msg.locationPin.address}
                          </p>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(`${msg.locationPin.commune}, ${msg.locationPin.wilaya}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 hover:underline pt-1"
                          >
                            <span>Ouvrir sur Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Message Status Bar */}
                      <div className="flex items-center justify-end gap-1 text-[9px] font-extrabold opacity-70">
                        {isMe && (
                          <span className="flex items-center gap-0.5">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions & Input Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-3">
              {/* Quick response chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {quickResponses.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendText(qr)}
                    className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 whitespace-nowrap shrink-0 transition-colors shadow-xs"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Action Toolbar & Input Form */}
              <div className="space-y-2">
                {/* Voice Note Live Recording Bar */}
                {isRecording ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 animate-pulse">
                    <div className="flex items-center gap-2 font-black text-xs">
                      <Radio className="w-4 h-4 text-red-600 animate-spin" />
                      <span>Enregistrement vocal en cours... 0:0{recordingSeconds}s</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsRecording(false)}
                        className="px-3 py-1 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSendVoiceNote}
                        className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black shadow-md"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendText();
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Media Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsImagePickerOpen(true)}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Joindre une photo"
                      >
                        <ImageIcon className="w-4 h-4 text-slate-700" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRecording(true)}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Note vocale"
                      >
                        <Mic className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>

                    {/* Input Field */}
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Écrivez votre message direct..."
                      className="flex-1 p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black shadow-lg border border-amber-400 transition-all shrink-0 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 h-full">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-xs font-bold">Sélectionnez une conversation pour échanger.</p>
          </div>
        )}
      </div>

      {/* PROPOSE DEVIS MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">Proposer un Devis Officiel</h3>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Montant Proposé (DA)
                </label>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-extrabold text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  placeholder="3500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Durée Estimée de l'Intervention
                </label>
                <input
                  type="text"
                  value={quoteDuration}
                  onChange={(e) => setQuoteDuration(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-extrabold text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  placeholder="2 heures"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Détails & Pièces Incluses
                </label>
                <textarea
                  value={quoteDetails}
                  onChange={(e) => setQuoteDetails(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-medium text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  placeholder="Inclus le déplacement, diagnostic et petites fournitures..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 font-bold text-xs text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 shadow-md border border-amber-400"
                >
                  Transmettre le Devis
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* LOCATION SHARE MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">Partager Votre Localisation</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendLocation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Wilaya
                </label>
                <input
                  type="text"
                  value={locWilaya}
                  onChange={(e) => setLocWilaya(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Commune
                </label>
                <input
                  type="text"
                  value={locCommune}
                  onChange={(e) => setLocCommune(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Adresse Précise / Repère
                </label>
                <input
                  type="text"
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-medium text-xs text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 font-bold text-xs text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 shadow-md border border-amber-400"
                >
                  Envoyer la Position
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* IMAGE PICKER / ATTACHMENT MODAL */}
      {isImagePickerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">Joindre une Photo de Chantier</h3>
              </div>
              <button
                onClick={() => setIsImagePickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Sélectionnez une image de démonstration ou collez le lien de votre photo :
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedImageUrl('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop')}
                  className={`p-2 rounded-xl border-2 overflow-hidden text-left ${
                    selectedImageUrl.includes('621905251189') ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200'
                  }`}
                >
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop" className="h-20 w-full object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-black block">Climatiseur / Fuite</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop')}
                  className={`p-2 rounded-xl border-2 overflow-hidden text-left ${
                    selectedImageUrl.includes('1581092160607') ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200'
                  }`}
                >
                  <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop" className="h-20 w-full object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-black block">Tableau Électrique</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Ou URL d'image personnalisée
                </label>
                <input
                  type="url"
                  value={selectedImageUrl}
                  onChange={(e) => setSelectedImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-medium text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImagePickerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 font-bold text-xs text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSendImage}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 shadow-md border border-amber-400"
                >
                  Envoyer la Photo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* IMAGE LIGHTBOX ZOOM */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Chantier Agrandie" className="max-w-full max-h-[85vh] rounded-2xl object-contain border-2 border-white/20 shadow-2xl" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-4 -right-4 p-2 rounded-full bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
