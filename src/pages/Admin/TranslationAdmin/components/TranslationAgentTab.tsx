import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Globe, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentMessage {
  sender: 'agent' | 'user';
  text: string;
  time: string;
  translation?: string;
  original?: string;
  lang?: 'ar' | 'en';
}

interface TranslationAgentTabProps {
  agentMessages: AgentMessage[];
  agentInput: string;
  setAgentInput: (val: string) => void;
  agentTargetLang: 'ar' | 'en';
  setAgentTargetLang: (val: 'ar' | 'en') => void;
  isAgentTyping: boolean;
  handleSendAgentMessage: () => Promise<void>;
}

export const TranslationAgentTab: React.FC<TranslationAgentTabProps> = ({
  agentMessages,
  agentInput,
  setAgentInput,
  agentTargetLang,
  setAgentTargetLang,
  isAgentTyping,
  handleSendAgentMessage,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="agent-view"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="space-y-10"
      id="translation-agent-tab"
    >
      <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-xl p-10 space-y-10">
        {/* Agent Header Banner */}
        <div className="flex items-center gap-5 border-b border-zinc-100 pb-8 justify-between flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 rotate-3">
              <Wand2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-sans font-bold text-zinc-950 tracking-tight rtl:tracking-normal italic">
                {t("Mabrouk — Agent de Traduction")}
              </h4>
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1 flex items-center gap-1.5 matches-rtl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {t("Système Local • 100% Souple & Gratuit")}
              </p>
            </div>
          </div>
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl gap-2 font-sans font-bold text-[10px] uppercase">
            <button
              onClick={() => setAgentTargetLang('ar')}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer border-none ${
                agentTargetLang === 'ar' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {t("Vers l'Arabe (🇩🇿)")}
            </button>
            <button
              onClick={() => setAgentTargetLang('en')}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer border-none ${
                agentTargetLang === 'en' ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {t("Vers l'Anglais (🇬🇧)")}
            </button>
          </div>
        </div>

        {/* Chat Screen Container */}
        <div className="min-h-[400px] max-h-[500px] overflow-y-auto bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-8 space-y-6 flex flex-col">
          {agentMessages.map((msg, i) => {
            return (
              <div
                key={i}
                className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm flex flex-col space-y-3 ${
                  msg.sender === 'agent'
                    ? 'bg-white border border-zinc-100 self-start text-zinc-950'
                    : 'bg-orange-500 text-white self-end text-start'
                }`}
              >
                {/* Sender Heading */}
                <p
                  className={`text-[9px] font-black uppercase tracking-wider rtl:tracking-normal ${
                    msg.sender === 'agent' ? 'text-orange-500' : 'text-orange-100'
                  }`}
                >
                  {msg.sender === 'agent' ? '🤖 Mabrouk - Traducteur' : '👤 Vous'}
                </p>

                {/* Message Content */}
                <p className="text-xs font-bold leading-relaxed whitespace-pre-line select-text">
                  {msg.text}
                </p>

                {/* Render Quick Copy button if translated content is inside */}
                {msg.translation && (
                  <div className="pt-3 border-t border-zinc-100/50 flex gap-2 items-center">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.translation || '');
                        toast.success("Traduction copiée ");
                      }}
                      className="px-4 py-2 bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal rounded-xl transition-all flex items-center gap-2 cursor-pointer border-none"
                    >
                      <Globe className="w-3 h-3 text-orange-500" /> {t("Copier Traduction")}
                    </button>
                  </div>
                )}

                {/* Message Time */}
                <p
                  className={`text-[8px] font-mono text-end ${
                    msg.sender === 'agent' ? 'text-zinc-400' : 'text-orange-200'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            );
          })}

          {isAgentTyping && (
            <div className="bg-white border border-zinc-100 self-start max-w-[80%] rounded-[2rem] p-6 shadow-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-1">
                {t("L'Agent rédige...")}
              </span>
            </div>
          )}
        </div>

        {/* Chat Form Controls */}
        <div className="bg-zinc-50 rounded-[2rem] p-4 flex gap-4 items-center">
          <input
            type="text"
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendAgentMessage();
              }
            }}
            className="flex-1 bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-bold text-zinc-800 outline-none focus:border-orange-500 transition-all font-sans"
            placeholder={`Rédigez votre texte en Français, l'Agent va le transcrire en ${
              agentTargetLang === 'ar' ? 'Arabe' : 'Anglais'
            }...`}
          />
          <button
            onClick={handleSendAgentMessage}
            className="px-8 py-4 bg-orange-500 text-white hover:bg-orange-600 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal transition-all shadow-md shrink-0 cursor-pointer border-none"
          >
            {t("Traduire")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
