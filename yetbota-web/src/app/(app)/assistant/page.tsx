"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MoreVertical, Trash2, Circle, Plus } from "lucide-react";
import ChatBubble from "@/components/assistant/ChatBubble";
import ChatInput from "@/components/assistant/ChatInput";
import QuickActions from "@/components/assistant/QuickActions";
import {
  INITIAL_MESSAGES,
  SUGGESTED_TOPICS,
  type ChatMessage,
} from "@/lib/assistantMockData";
import {
  useChatMutation,
  useListChatsQuery,
  useListMessagesQuery,
  type AssistantMessage,
} from "@/store/api/aiApi";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { useToast } from "@/hooks/use-toast";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { cn } from "@/lib/utils";

function fromServerMessage(m: AssistantMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role === "assistant" ? "ai" : "user",
    text: m.content,
    citations: m.citations,
    timestamp: new Date(m.created_at),
  };
}

export default function AssistantPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [moreOpen, setMoreOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const userId = me?.user?.id;

  const userAvatarUrl = useMemo(
    () => (me?.user?.profile_url ? resolveApiUrl(me.user.profile_url) : null),
    [me?.user?.profile_url]
  );
  const userInitial = useMemo(() => {
    const first = me?.user?.first_name?.[0] ?? me?.user?.username?.[0] ?? "";
    return first.toUpperCase();
  }, [me?.user?.first_name, me?.user?.username]);

  const [chat, { isLoading: isTyping }] = useChatMutation();

  const { data: chatsPage } = useListChatsQuery(
    { user_id: userId ?? "", limit: 20 },
    { skip: !userId }
  );
  const chats = chatsPage?.items ?? [];

  const {
    data: messagesPage,
    error: messagesError,
    isFetching: messagesLoading,
  } = useListMessagesQuery(
    { chat_id: activeChatId ?? "", user_id: userId ?? "", limit: 200 },
    { skip: !activeChatId || !userId }
  );

  // Pull server transcript into local state when the active chat changes / its
  // messages arrive. Local state is the source of truth thereafter so optimistic
  // sends don't fight the cache.
  useEffect(() => {
    if (!activeChatId) return;
    if (!messagesPage?.items) return;
    setMessages(messagesPage.items.map(fromServerMessage));
  }, [activeChatId, messagesPage]);

  // Chat does not exist (or doesn't belong to this user) -> reset to fresh.
  useEffect(() => {
    if (!messagesError) return;
    const status =
      typeof messagesError === "object" && messagesError !== null && "status" in messagesError
        ? (messagesError as { status?: number | string }).status
        : undefined;
    if (status === 404) {
      setActiveChatId(null);
      setMessages(INITIAL_MESSAGES);
      toast({
        variant: "destructive",
        title: "Chat not found",
        description: "Starting a fresh conversation.",
      });
    }
  }, [messagesError, toast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `tmp-u-${Date.now()}`,
        role: "user",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await chat({
          text,
          user_id: userId ?? null,
          chat_id: activeChatId ?? null,
        }).unwrap();

        const aiMsg: ChatMessage = {
          id: `tmp-a-${Date.now() + 1}`,
          role: "ai",
          text: res.answer,
          citations: res.citations,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (res.chat_id && res.chat_id !== activeChatId) {
          setActiveChatId(res.chat_id);
        }
      } catch (err) {
        const status =
          typeof err === "object" && err !== null && "status" in err
            ? (err as { status?: number | string }).status
            : undefined;
        const unavailable = status === 503 || status === 504 || status === "FETCH_ERROR";
        const description = unavailable
          ? "Assistant is temporarily unavailable. Please try again in a moment."
          : "Something went wrong. Please try again.";
        toast({ variant: "destructive", title: "Couldn't reach the assistant", description });
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-err-${Date.now()}`,
            role: "ai",
            text: description,
            timestamp: new Date(),
            error: true,
          },
        ]);
      }
    },
    [activeChatId, chat, toast, userId]
  );

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages(INITIAL_MESSAGES);
    setMoreOpen(false);
  };

  const handleSwitchChat = (id: string) => {
    if (id === activeChatId) return;
    setActiveChatId(id);
    setMessages([]); // populated via effect when listMessages settles
  };

  const handleQuickAction = (label: string) => {
    void handleSend(`Tell me about ${label.replace("#", "")}`);
  };

  return (
    <div className="flex h-full overflow-hidden bg-bg">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 h-20 border-b border-border-subtle bg-bg shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Circle className="w-2.5 h-2.5 fill-brand text-brand shrink-0" />
            <span className="text-fg text-sm font-semibold truncate">Assistant Online</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-xs text-fg-faint hover:text-fg-muted transition-colors"
              aria-label="New chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-overlay transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-fg-faint" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-xl z-20 w-40">
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Start fresh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-2">
          {activeChatId && messagesLoading && messages.length === 0 ? (
            <div className="text-fg-faint text-sm">Loading conversation…</div>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                userAvatarUrl={userAvatarUrl}
                userInitial={userInitial}
              />
            ))
          )}

          {isTyping && (
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 bg-brand/15 border border-brand/30 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-brand rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-surface border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3 mt-6">
                <p className="text-fg-faint text-sm">Yet Bota is thinking...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 shrink-0 border-t border-border-subtle bg-bg">
          <QuickActions onSelect={handleQuickAction} />
          <ChatInput onSend={(t) => void handleSend(t)} disabled={isTyping} />
          <p className="text-center text-[10px] text-fg-faint uppercase tracking-widest mt-3">
            Powered by Yet Bota Community Engine
          </p>
        </div>
      </div>

      <aside className="hidden lg:flex w-80 shrink-0 border-l border-border-subtle bg-surface flex-col">
        <div className="px-5 h-20 border-b border-border-subtle flex items-center justify-between">
          <p className="text-fg text-sm font-semibold">Recent Chats</p>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 text-xs text-brand hover:opacity-80 transition-opacity font-semibold"
            aria-label="Start a new chat"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          {!userId ? (
            <p className="text-xs text-fg-faint px-3 py-2">
              Sign in to keep your chat history.
            </p>
          ) : chats.length === 0 ? (
            <p className="text-xs text-fg-faint px-3 py-2">
              No chats yet. Ask the assistant anything to start one.
            </p>
          ) : (
            <div className="space-y-0.5">
              {chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSwitchChat(c.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-colors",
                    activeChatId === c.id
                      ? "bg-brand/10 text-fg border border-brand/20"
                      : "text-fg-muted hover:text-fg hover:bg-overlay"
                  )}
                  title={c.title}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-sm shrink-0",
                      activeChatId === c.id ? "bg-brand" : "bg-fg-faint"
                    )}
                  />
                  <span className="truncate text-xs">{c.title}</span>
                </button>
              ))}
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint px-3 mt-5 mb-2">
            Suggested Topics
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleQuickAction(topic.label)}
                className="text-[10px] text-fg-faint hover:text-brand bg-overlay hover:bg-brand/10 border border-border-subtle hover:border-brand/30 px-2.5 py-1 rounded-full transition-colors"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
