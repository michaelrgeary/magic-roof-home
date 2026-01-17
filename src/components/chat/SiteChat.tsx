import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SiteConfig } from "@/components/templates/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SiteChatProps {
  mode: "onboarding" | "edit";
  currentConfig?: Partial<SiteConfig>;
  onConfigUpdate: (config: Partial<SiteConfig>) => void;
  onChangesDetected?: (changes: string[]) => void;
  onComplete: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function SiteChat({ mode, currentConfig, onConfigUpdate, onChangesDetected, onComplete }: SiteChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set initial message based on mode
  useEffect(() => {
    if (mode === "onboarding") {
      setMessages([
        {
          role: "assistant",
          content: "Hey! Let's get your roofing website set up. What's your company name?",
        },
      ]);
    } else if (mode === "edit" && currentConfig) {
      const businessName = currentConfig.businessName || "your site";
      setMessages([
        {
          role: "assistant",
          content: `Welcome back! I'm here to help you update ${businessName}. What would you like to change? You can update your headline, services, contact info, or anything else.`,
        },
      ]);
    }
  }, [mode, currentConfig?.businessName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const extractSiteConfig = (text: string): Partial<SiteConfig> | null => {
    const match = text.match(/<site_config>([\s\S]*?)<\/site_config>/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        console.error("Failed to parse site config:", e);
      }
    }
    return null;
  };

  const extractChanges = (text: string): string[] => {
    const match = text.match(/<changes>([\s\S]*?)<\/changes>/);
    if (match) {
      const changesText = match[1].trim();
      return changesText
        .split("\n")
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter((line) => line.length > 0);
    }
    return [];
  };

  const cleanMessageContent = (text: string): string => {
    return text
      .replace(/<site_config>[\s\S]*?<\/site_config>/g, "")
      .replace(/<changes>[\s\S]*?<\/changes>/g, "")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          currentConfig: mode === "edit" ? currentConfig : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Rate limit reached. Please wait a moment and try again.");
        } else if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error(errorData.error || "Failed to get response");
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message to start
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: cleanMessageContent(assistantContent),
                };
                return newMessages;
              });

              // Check for site config in the accumulated content
              const config = extractSiteConfig(assistantContent);
              if (config) {
                onConfigUpdate(config);
                setIsComplete(true);
                
                const extractedChanges = extractChanges(assistantContent);
                if (extractedChanges.length > 0) {
                  setChanges(extractedChanges);
                  onChangesDetected?.(extractedChanges);
                }
              }
            }
          } catch {
            // Incomplete JSON, put it back
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: cleanMessageContent(assistantContent),
                };
                return newMessages;
              });

              const config = extractSiteConfig(assistantContent);
              if (config) {
                onConfigUpdate(config);
                setIsComplete(true);
                
                const extractedChanges = extractChanges(assistantContent);
                if (extractedChanges.length > 0) {
                  setChanges(extractedChanges);
                  onChangesDetected?.(extractedChanges);
                }
              }
            }
          } catch {
            /* ignore partial leftovers */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Changes summary */}
      {isComplete && changes.length > 0 && (
        <div className="mx-4 mb-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Changes ready to save:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {changes.slice(0, 5).map((change, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{change}</span>
              </li>
            ))}
            {changes.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{changes.length - 5} more changes
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Complete button */}
      {isComplete && (
        <div className="p-4 border-t">
          <Button onClick={onComplete} className="w-full" size="lg">
            {mode === "edit" ? "Save Changes" : "Preview & Save Your Site"}
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "edit" ? "Tell me what to change..." : "Type your answer..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
