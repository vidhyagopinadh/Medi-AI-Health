import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChatStream, useCreateConversation, useConversations } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, MessageSquare, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  
  const { data: conversations, refetch: refetchConversations } = useConversations();
  const createConversation = useCreateConversation();
  const { messages, sendMessage, isStreaming } = useChatStream(activeChatId || 0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateChat = async () => {
    const newChat = await createConversation.mutateAsync("New Chat");
    setActiveChatId(newChat.id);
  };

  const handleSend = () => {
    if (!activeChatId) {
      // Create chat first if none active
      createConversation.mutate("Product Discovery", {
        onSuccess: (newChat) => {
          setActiveChatId(newChat.id);
          // Wait a tick for state update then send
          setTimeout(() => sendMessage(input), 0);
          setInput("");
        }
      });
    } else {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={handleCreateChat} className="w-full justify-start gap-2 shadow-sm" variant="outline">
            <Plus className="w-4 h-4" /> New Conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {conversations?.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  activeChatId === chat.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="truncate">{chat.title}</div>
                  <div className="text-xs opacity-70 font-normal">{format(new Date(chat.createdAt), "MMM d, HH:mm")}</div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {!activeChatId && !messages.length ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-400 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Medigy Intelligence</h2>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
              I can help you find healthcare software, compare features, or analyze pricing models.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {["Compare EHR systems for pediatrics", "Find AI tools for radiology", "Top rated telemedicine platforms", "Analyze Epic vs Cerner"].map((prompt) => (
                <Card 
                  key={prompt}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border-primary/10 hover:border-primary/30 text-sm font-medium text-left flex items-center gap-2"
                  onClick={() => {
                    setInput(prompt);
                    // auto-focus input
                  }}
                >
                  <Sparkles className="w-4 h-4 text-primary" /> {prompt}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
                 {msg.role === 'assistant' && (
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                     <Bot className="w-5 h-5 text-primary" />
                   </div>
                 )}
                 <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                   msg.role === 'user' 
                     ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                     : 'bg-card border border-border rounded-tl-sm'
                 }`}>
                   {msg.role === 'assistant' ? (
                     <div className="prose prose-sm dark:prose-invert max-w-none">
                       <ReactMarkdown>{msg.content || (isStreaming && idx === messages.length - 1 ? "Thinking..." : "")}</ReactMarkdown>
                     </div>
                   ) : msg.content}
                 </div>
                 {msg.role === 'user' && user?.profileImageUrl && (
                    <img src={user.profileImageUrl} className="w-8 h-8 rounded-full mt-1" alt="User" />
                 )}
               </div>
             ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background/80 backdrop-blur">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about healthcare tech..."
              className="flex-1 shadow-sm"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isStreaming} className="shadow-md">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
