import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveChat } from './useLiveChat';
import { LiveChatTimeline } from './LiveChatTimeline';
import { LiveChatInput } from './LiveChatInput';
import { LiveChatReportModal } from './LiveChatReportModal';

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  otherPartyName: string;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  orderId,
  otherPartyName,
}) => {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const {
    currentUser,
    shopName,
    loading,
    error,
    newMessage,
    setNewMessage,
    setError,
    copied,
    uploading,
    reportingMessageId,
    setReportingMessageId,
    scrollRef,
    fileInputRef,
    timelineItems,
    handleCopyOrderId,
    handleSendMessage,
    handleSelectFile,
  } = useLiveChat(isOpen, orderId, otherPartyName);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-[200]"
          />

          {/* Solid Drawer Container */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'left-0' : 'right-0'
            } w-full sm:w-[420px] bg-stone-50 z-[210] shadow-2xl flex flex-col border-s border-stone-200`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3.5 border-b border-stone-200/80 flex items-center justify-between shadow-2xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{shopName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-stone-500 font-medium">
                      {t("Échanges en direct") || "Échanges en direct"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-600 rounded-md text-[10px] font-mono font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  <span>#{orderId.substring(0, 8).toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <LiveChatTimeline
              timelineItems={timelineItems}
              loading={loading}
              currentUserId={currentUser?.uid}
              scrollRef={scrollRef}
              onReportMessage={(msgId) => setReportingMessageId(msgId)}
            />

            {/* Input Bar */}
            <LiveChatInput
              messageText={newMessage}
              onChangeText={(txt) => {
                setNewMessage(txt);
                setError('');
              }}
              onSendMessage={handleSendMessage}
              onSelectFile={handleSelectFile}
              uploading={uploading}
              error={error}
              fileInputRef={fileInputRef}
              onSelectQuickReply={(txt) => setNewMessage(txt)}
            />
          </motion.div>

          <LiveChatReportModal
            messageId={reportingMessageId}
            orderId={orderId}
            onClose={() => setReportingMessageId(null)}
            onSuccess={() => setReportingMessageId(null)}
          />
        </>
      )}
    </AnimatePresence>
  );
};
