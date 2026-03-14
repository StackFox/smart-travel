import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { mockDestinations } from '../../data/mockData';

const SYSTEM_CONTEXT = `You are a friendly travel assistant for Smart Travel Planner, an Indian travel app.
You help users plan trips within India. Available destinations: ${mockDestinations.map(d => `${d.name} (₹${d.price}) - ${d.description} [Tags: ${d.tags.join(', ')}]`).join('; ')}.
Rules: Be concise (2-4 sentences max). Use ₹ for prices. Be enthusiastic. Suggest specific destinations from the list when relevant.
If asked about weather: suggest best months. If asked about food: mention local cuisine. If asked about safety: give practical tips.`;

async function callGeminiAPI(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return getSmartFallback(messages[messages.length - 1].text);
  }

  try {
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_CONTEXT }] },
      { role: 'model', parts: [{ text: 'Hi! I\'m your travel assistant for India. Ask me anything about destinations, budgets, or travel tips! 🇮🇳' }] },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      console.error('Gemini API error:', res.status);
      return getSmartFallback(messages[messages.length - 1].text);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || getSmartFallback(messages[messages.length - 1].text);
  } catch (err) {
    console.error('API call failed:', err);
    return getSmartFallback(messages[messages.length - 1].text);
  }
}

// Intent detection patterns
const INTENTS = {
  greeting: /^(hi|hello|hey|hola|good morning|good evening|namaste|howdy)/i,
  weather: /(weather|climate|rain|monsoon|winter|summer|temperature|cold|hot|when.*visit|best.*time|best.*month|season)/i,
  food: /(food|eat|restaurant|cuisine|dish|meal|street food|what.*eat|local food|taste|biryani|dosa|thali)/i,
  budget: /(budget|cheap|affordable|expensive|cost|price|money|how much|spend|₹|rupee|inexpensive|save)/i,
  beach: /(beach|sea|ocean|coast|water|swim|surf|sand|island|seaside|coastal)/i,
  mountain: /(mountain|hill|trek|hiking|altitude|peak|cold|snow|valley|himalaya|camping)/i,
  adventure: /(adventure|thrill|extreme|bungee|rafting|paragliding|zipline|sport|diving|scuba|kayak)/i,
  culture: /(culture|temple|heritage|history|historic|ancient|monument|fort|palace|museum|art|tradition)/i,
  spiritual: /(spiritual|yoga|meditation|ashram|ganga|temple|prayer|peaceful|retreat|wellness)/i,
  romantic: /(romantic|honeymoon|couple|anniversary|love|date|getaway|cozy)/i,
  family: /(family|kid|children|safe|comfortable|easy|resort)/i,
  transport: /(transport|travel|how.*get|flight|train|bus|drive|road trip|cab|taxi|reach|distance)/i,
  safety: /(safe|safety|danger|secure|crime|risk|precaution|travel advisory|solo.*travel|woman)/i,
  packing: /(pack|wear|clothes|luggage|carry|bring|essentials|what.*pack)/i,
  compare: /(compare|vs|versus|better|difference|choose|which.*one|or)/i,
  thanks: /^(thanks|thank you|thx|ty|appreciate|great|awesome|perfect|nice)/i,
};

function getSmartFallback(query: string): string {
  const q = query.toLowerCase().trim();

  // Direct destination match
  const exactMatch = mockDestinations.find(d =>
    q.includes(d.name.toLowerCase()) ||
    q.includes(d.name.split(' ')[0].toLowerCase())
  );

  if (exactMatch) {
    const tips: Record<string, string> = {
      'Manali': 'Best visited Oct-Feb for snow or May-Jun for summer. Don\'t miss Solang Valley and Old Manali cafes!',
      'Goa Beaches': 'Nov-Feb is peak season with perfect weather. North Goa for parties, South Goa for peace.',
      'Jaipur': 'Oct-Mar is ideal. Must-visit: Amber Fort, Hawa Mahal, and Nahargarh at sunset!',
      'Kerala Backwaters': 'Sep-Mar is perfect. Try a houseboat stay in Alleppey — magical experience!',
      'Leh-Ladakh': 'Jun-Sep only (roads close in winter). Permits needed for Pangong. Acclimatize for 2 days.',
      'Varanasi': 'Oct-Mar is comfortable. The evening Ganga Aarti at Dashashwamedh Ghat is a must-see.',
      'Andaman Islands': 'Nov-May is best. Book ferries to Havelock Island early for Radhanagar Beach.',
      'Udaipur': 'Sep-Mar is ideal. Lake Pichola sunset boat ride and City Palace are unmissable.',
      'Rishikesh': 'Sep-Jun is good. Try white-water rafting (Sep-Nov is best) and visit Beatles Ashram.',
      'Darjeeling': 'Oct-Dec and Mar-May are best. Ride the toy train and catch sunrise at Tiger Hill.',
    };
    const tip = tips[exactMatch.name] || exactMatch.description;
    return `**${exactMatch.name}** — great choice! 🌟\n\n${tip}\n\n💰 Estimated cost: **₹${exactMatch.price.toLocaleString('en-IN')}** per person\n⭐ Rating: ${exactMatch.rating}/5 (${exactMatch.reviews.toLocaleString('en-IN')} reviews)`;
  }

  // Greeting
  if (INTENTS.greeting.test(q)) {
    return 'Hey there! 👋 Ready to plan an amazing trip across India? Ask me about any destination — I know all about Manali, Goa, Kerala, Ladakh, and more!';
  }

  // Thanks
  if (INTENTS.thanks.test(q)) {
    return 'Happy to help! 😊 Feel free to ask me anything else about your travel plans. Have an amazing trip! 🎒✈️';
  }

  // Weather / Best time
  if (INTENTS.weather.test(q)) {
    return '**Best times to visit popular destinations:**\n\n🏔️ **Manali/Ladakh** — May-Jun (summer) or Dec-Feb (snow)\n🏖️ **Goa/Andaman** — Nov-Feb (pleasant, no rain)\n🏛️ **Jaipur/Varanasi** — Oct-Mar (cool, comfortable)\n🌿 **Kerala** — Sep-Mar (post-monsoon beauty)\n🧘 **Rishikesh** — Sep-Nov (rafting season)\n\nWhich destination are you most interested in?';
  }

  // Food
  if (INTENTS.food.test(q)) {
    return '**Must-try Indian food by region:** 🍽️\n\n🌶️ **Goa** — Vindaloo, Bebinca, Fish Curry\n🍛 **Jaipur** — Dal Baati Churma, Laal Maas\n🥥 **Kerala** — Appam, Fish Moilee, Payasam\n🍜 **Varanasi** — Kachori Sabzi, Malaiyyo, Lassi\n🫓 **Manali** — Sidu, Trout fish, Tibetan momos\n🍵 **Darjeeling** — Darjeeling tea, Thukpa, momos\n\nWant food recommendations for a specific place?';
  }

  // Budget
  if (INTENTS.budget.test(q)) {
    const sorted = [...mockDestinations].sort((a, b) => a.price - b.price);
    const cheap = sorted.slice(0, 3);
    const expensive = sorted.slice(-2);
    return `**Budget-friendly options:** 💰\n\n${cheap.map(d => `• **${d.name}** — ₹${d.price.toLocaleString('en-IN')}`).join('\n')}\n\n**Premium experiences:**\n${expensive.map(d => `• **${d.name}** — ₹${d.price.toLocaleString('en-IN')}`).join('\n')}\n\n💡 **Tip:** Travel in off-season for 30-40% savings on hotels!`;
  }

  // Beach
  if (INTENTS.beach.test(q)) {
    const beaches = mockDestinations.filter(d => d.tags.some(t => ['Beach', 'Island', 'Diving'].includes(t)));
    return beaches.length
      ? `**Best beach destinations:** 🏖️\n\n${beaches.map(d => `🌊 **${d.name}** (₹${d.price.toLocaleString('en-IN')}) — ${d.description}`).join('\n\n')}\n\nGoa is perfect for nightlife, Andaman for pristine untouched beaches!`
      : 'I\'d recommend **Goa** for vibrant beach life or **Andaman Islands** for crystal-clear waters and snorkeling!';
  }

  // Mountains
  if (INTENTS.mountain.test(q)) {
    const mtns = mockDestinations.filter(d => d.tags.some(t => ['Mountains', 'Snow', 'Adventure'].includes(t)));
    return mtns.length
      ? `**Mountain getaways:** 🏔️\n\n${mtns.map(d => `⛰️ **${d.name}** (₹${d.price.toLocaleString('en-IN')}) — ${d.description}`).join('\n\n')}\n\n💡 Ladakh for dramatic landscapes, Manali for snow activities!`
      : 'Try **Manali** for snow sports or **Leh-Ladakh** for breathtaking high-altitude landscapes!';
  }

  // Adventure
  if (INTENTS.adventure.test(q)) {
    const adv = mockDestinations.filter(d => d.tags.includes('Adventure'));
    return adv.length
      ? `**Adventure destinations:** 🎯\n\n${adv.map(d => `🔥 **${d.name}** — ${d.description}`).join('\n\n')}\n\nTop activities: Rafting in Rishikesh, Biking in Ladakh, Paragliding in Manali!`
      : '**Rishikesh** for bungee + rafting, **Ladakh** for road trips, **Manali** for paragliding!';
  }

  // Culture / Heritage
  if (INTENTS.culture.test(q)) {
    const culture = mockDestinations.filter(d => d.tags.some(t => ['Culture', 'Heritage', 'History', 'Architecture'].includes(t)));
    return culture.length
      ? `**Cultural hotspots:** 🏛️\n\n${culture.map(d => `🎭 **${d.name}** — ${d.description}`).join('\n\n')}\n\nJaipur and Udaipur are jewels of Rajasthani heritage!`
      : 'For culture, explore **Jaipur\'s** forts and **Varanasi\'s** ancient ghats!';
  }

  // Spiritual
  if (INTENTS.spiritual.test(q)) {
    const spiritual = mockDestinations.filter(d => d.tags.includes('Spiritual'));
    return spiritual.length
      ? `**Spiritual retreats:** 🕉️\n\n${spiritual.map(d => `🙏 **${d.name}** — ${d.description}`).join('\n\n')}\n\nVaranasi for ancient spirituality, Rishikesh for yoga & meditation.`
      : 'Visit **Varanasi** for the Ganga Aarti or **Rishikesh** for yoga ashrams.';
  }

  // Romantic
  if (INTENTS.romantic.test(q)) {
    const romantic = mockDestinations.filter(d => d.tags.some(t => ['Romantic', 'Luxury', 'Relaxation'].includes(t)));
    return `**Romantic getaways:** 💕\n\n${(romantic.length ? romantic : mockDestinations.filter(d => ['Udaipur', 'Kerala Backwaters', 'Andaman Islands'].includes(d.name))).map(d => `❤️ **${d.name}** — ${d.description}`).join('\n\n')}\n\nUdaipur's lakeside palaces are India's most romantic setting!`;
  }

  // Transport
  if (INTENTS.transport.test(q)) {
    return '**Getting around India:** 🚂\n\n✈️ **Flights** — Book 2-3 weeks ahead on MakeMyTrip/Ixigo\n🚂 **Trains** — Book on IRCTC; Rajdhani/Shatabdi are fastest\n🚌 **Buses** — Volvo sleeper buses for overnight trips\n🚗 **Road trips** — Rent via Zoomcar; great for Ladakh/Manali\n🛺 **Local** — Ola/Uber in cities; auto-rickshaws for short trips\n\n💡 Book trains 60 days in advance for confirmed seats!';
  }

  // Safety
  if (INTENTS.safety.test(q)) {
    return '**Travel safety tips for India:** 🛡️\n\n✅ Stick to well-reviewed hotels (OYO/MakeMyTrip)\n✅ Keep copies of ID docs\n✅ Use official taxis (Ola/Uber)\n✅ Stay hydrated, avoid tap water\n✅ Women: dress modestly in religious areas\n✅ Share live location with family\n✅ Travel insurance is worth it!\n\nIndia is overwhelmingly welcoming — just use common sense! 😊';
  }

  // Packing
  if (INTENTS.packing.test(q)) {
    return '**Packing essentials for India:** 🎒\n\n👕 Light cotton clothes + warm layer for hills\n🧴 Sunscreen SPF 50+ & insect repellent\n💊 Basic meds (Imodium, ORS, paracetamol)\n🔌 Universal power adapter\n📱 Download offline maps\n💧 Reusable water bottle with filter\n👟 Comfortable walking shoes\n🧣 Scarf/shawl for temple visits\n\nAdjust based on your destination!';
  }

  // Compare destinations
  if (INTENTS.compare.test(q)) {
    const mentioned = mockDestinations.filter(d =>
      q.includes(d.name.toLowerCase()) || q.includes(d.name.split(' ')[0].toLowerCase())
    );
    if (mentioned.length >= 2) {
      return mentioned.map(d =>
        `**${d.name}:** ₹${d.price.toLocaleString('en-IN')} • ${d.rating}⭐ • ${d.tags.join(', ')}\n${d.description}`
      ).join('\n\n') + '\n\nBoth are amazing! Choose based on your vibe — adventure vs relaxation? 🤔';
    }
    return 'Tell me which two destinations you\'d like to compare and I\'ll break them down for you! 🔍';
  }

  // Tag-based match (last resort before generic)
  const tagMatch = mockDestinations.find(d =>
    d.tags.some(t => q.includes(t.toLowerCase()))
  );
  if (tagMatch) {
    return `Based on your interest, check out **${tagMatch.name}**! 🎯\n\n${tagMatch.description}\n\n💰 ₹${tagMatch.price.toLocaleString('en-IN')} per person • ⭐ ${tagMatch.rating}/5`;
  }

  // Generic fallback — but make it helpful
  return `Great question! Here's what I can help with: 🗺️\n\n🏖️ **"Beach destinations"** — Goa, Andaman\n🏔️ **"Mountain trips"** — Manali, Ladakh, Darjeeling\n🏛️ **"Cultural places"** — Jaipur, Varanasi, Udaipur\n🧘 **"Spiritual retreats"** — Rishikesh, Varanasi\n💰 **"Budget options"** — cheapest destinations\n🌤️ **"Best time to visit Goa"** — weather info\n🍽️ **"Food in Kerala"** — local cuisine\n\nOr just name a destination and I'll tell you everything! 😊`;
}


export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hey! 👋 I\'m your travel buddy for India. Ask me about destinations, budgets, weather, food, or anything else!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const allMsgs = [...messages.filter((m) => m.id !== 'welcome'), userMsg];
      const reply = await callGeminiAPI(allMsgs);

      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: 'Oops, something went wrong. Try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const quickActions = [
    '🏖️ Beach trips',
    '🏔️ Mountains',
    '💰 Budget options',
    '🍽️ Food guide',
  ];

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className={`fixed z-100 bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-rose-500 hover:bg-rose-600 rotate-90'
            : 'bg-linear-to-br from-teal-500 to-emerald-600 shadow-teal-500/30'
        }`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-99 bottom-40 right-4 md:bottom-22 md:right-6 w-[calc(100vw-2rem)] max-w-md h-112 flex flex-col bg-white dark:bg-[var(--color-surface-dark)] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-teal-600 to-emerald-600 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Travel Assistant</h3>
                <p className="text-teal-200 text-xs">
                  {import.meta.env.VITE_GEMINI_API_KEY ? 'Powered by Gemini AI' : 'Smart Travel Guide'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={12} className="text-teal-600 dark:text-teal-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 mt-1">
                      <User size={12} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Quick Actions (only show when few messages) */}
              {messages.length <= 2 && !loading && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setInput(action.replace(/^.{2}\s/, ''));
                        setTimeout(() => {
                          const fakeInput = action.replace(/^.{2}\s/, '');
                          setInput('');
                          const userMsg: ChatMessage = {
                            id: `user-${Date.now()}`,
                            role: 'user',
                            text: fakeInput,
                          };
                          setMessages((prev) => [...prev, userMsg]);
                          setLoading(true);
                          callGeminiAPI([userMsg]).then((reply) => {
                            setMessages((prev) => [
                              ...prev,
                              { id: `assistant-${Date.now()}`, role: 'assistant', text: reply },
                            ]);
                          }).finally(() => setLoading(false));
                        }, 50);
                      }}
                      className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                    <Bot size={12} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[var(--color-surface-dark)] shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a destination..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  disabled={loading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
