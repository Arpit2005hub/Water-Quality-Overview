import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  INITIAL_SUGGESTIONS_EN,
  INITIAL_SUGGESTIONS_HI,
  askWaterQualityAssistant,
} from '../../services/aiService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { Bot, Send, Sparkles, User, RefreshCw, BookOpen, ArrowRight, Languages } from 'lucide-react';

export const AIAssistantTab: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Welcome to the **Visarjan Ghat Watch Environmental Intelligence Assistant**.\n\nI can analyze historical water-quality observations from Bhopal's visarjan ghats, explain CPCB Class B standards, detail pre- and post-immersion shifts, and explore the efficacy of engineered eco-immersion pits.\n\nSelect a recommended inquiry below or type your question. (You can also toggle language to **हिन्दी** above).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        'Central Pollution Control Board (CPCB) Designated Best Use Criteria (Class B)',
        'Illustrative Historical Screening Dataset (Calibrated to CPCB Standards)',
      ],
      suggestedFollowUps: [
        'Why did Dissolved Oxygen plunge post-visarjan at Khatlapura Ghat in 2023?',
        'How did engineered eco-immersion pits at Prempura Ghat protect Bhojtal?',
        'What are the CPCB Class B standards for outdoor immersion?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSuggestions = language === 'hi' ? INITIAL_SUGGESTIONS_HI : INITIAL_SUGGESTIONS_EN;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askWaterQualityAssistant(q, messages, language);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        suggestedFollowUps: response.suggestedFollowUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: language === 'hi'
          ? 'सहायक के साथ संचार में त्रुटि आई। कृपया पूर्व-निर्धारित प्रश्नों में से एक चुनें।'
          : 'An error occurred while communicating with the assistant. Please try selecting one of the pre-configured prompts.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc my-1">
            <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
          </li>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-sm text-[#172B27] mt-3 mb-1">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith('## ') || line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={idx} className="font-bold text-sm text-[#172B27] mt-2 mb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
      );
    });
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        text="Screening indicator based on available historical observations. The AI Assistant references historical Bhopal water quality datasets and CPCB guidelines for research synthesis, not official regulatory declarations."
        variant="screening"
      />

      <div className="bg-white rounded-xl border border-[#E1E9E4] shadow-xs flex flex-col h-[700px] overflow-hidden">
        {/* Assistant Header with Language Toggle (Audit Item 8) */}
        <div className="p-4 border-b border-[#E1E9E4] bg-[#F7F9F7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#23856D] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#172B27]">
                Visarjan Ghat Intelligence Model
              </div>
              <div className="text-[11px] text-[#687873]">
                Grounded on CPCB Class B Standards & Historical Screening Dataset (2021–2025)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Segmented Toggle */}
            <div className="inline-flex p-1 bg-white rounded-lg border border-[#E1E9E4] text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#23856D] text-white'
                    : 'text-[#687873] hover:text-[#172B27]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#23856D] text-white'
                    : 'text-[#687873] hover:text-[#172B27]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <div className="text-xs text-[#23856D] font-medium bg-[#E7F4EF] px-2.5 py-1 rounded-md hidden sm:block">
              Scientific Mode
            </div>
          </div>
        </div>

        {/* Suggested Queries Pill Strip */}
        <div className="px-4 py-2.5 bg-[#FAFCFA] border-b border-[#E1E9E4] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-semibold text-[#687873] whitespace-nowrap text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#23856D]" />
            {language === 'hi' ? 'सुझाव:' : 'Inquire:'}
          </span>
          {activeSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="px-2.5 py-1 bg-white border border-[#E1E9E4] rounded-md text-[#172B27] hover:border-[#23856D] hover:bg-[#E7F4EF] transition-colors whitespace-nowrap cursor-pointer text-[11px]"
            >
              {sug.length > 45 ? `${sug.slice(0, 45)}...` : sug}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-[#123B32]' : 'bg-[#23856D]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 flex-1">
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#123B32] text-white rounded-tr-none'
                      : 'bg-[#F7F9F7] text-[#172B27] border border-[#E1E9E4] rounded-tl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Citations Box for Assistant */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E1E9E4] text-[11px] text-[#687873] space-y-1">
                      <div className="font-semibold text-[#172B27] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#23856D]" />
                        {language === 'hi' ? 'मानक व डेटा संदर्भ:' : 'Dataset & Benchmark Citations:'}
                      </div>
                      <ul className="space-y-0.5 pl-4 list-disc">
                        {msg.citations.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Suggested Follow Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="text-[11px] text-[#23856D] hover:text-[#123B32] bg-[#E7F4EF] hover:bg-[#E7F4EF]/80 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{fu}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] text-[#687873] ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-lg bg-[#23856D] flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 bg-[#F7F9F7] border border-[#E1E9E4] rounded-xl text-xs text-[#687873] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#23856D]" />
                <span>
                  {language === 'hi'
                    ? 'जल-रासायनिक डेटा व सीपीसीबी मानकों का विश्लेषण किया जा रहा है...'
                    : 'Synthesizing limnological data and CPCB standards...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#E1E9E4] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'भोपाल घाटों की जल गुणवत्ता, DO गिरावट, BOD वृद्धि या CPCB मानकों के बारे में पूछें...'
                  : 'Ask about Bhopal ghat water quality, DO drops, BOD surges, or CPCB standards...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F7F9F7] border border-[#E1E9E4] rounded-lg focus:outline-hidden focus:border-[#23856D] focus:bg-white text-[#172B27]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 bg-[#23856D] hover:bg-[#155E63] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
