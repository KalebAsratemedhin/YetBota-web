import { aiBaseApi } from "@/store/api/aiBaseApi";

export type CitationKind = "post" | "question" | "answer";
export type MessageRole = "user" | "assistant";

export interface Citation {
  source_id: string;
  kind: CitationKind;
  text: string;
  score: number;
}

export interface ChatRequest {
  text: string;
  user_id?: string | null;
  chat_id?: string | null;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  chat_id: string | null;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type ChatPage = Page<Chat>;
export type MessagePage = Page<AssistantMessage>;

export interface ListChatsArgs {
  user_id: string;
  limit?: number;
  offset?: number;
}

export interface ListMessagesArgs {
  chat_id: string;
  user_id: string;
  limit?: number;
  offset?: number;
}

function buildParams(query: Record<string, string | number | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    out[k] = String(v);
  }
  return out;
}

export const aiApi = aiBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    chat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({ url: "/assistant/chat", method: "POST", body }),
      invalidatesTags: (result, _error, arg) => {
        const tags: Array<{ type: "AIChats" | "AIMessages"; id: string }> = [];
        if (arg.user_id) tags.push({ type: "AIChats", id: arg.user_id });
        if (result?.chat_id) tags.push({ type: "AIMessages", id: result.chat_id });
        return tags;
      },
    }),
    listChats: builder.query<ChatPage, ListChatsArgs>({
      query: ({ user_id, limit, offset }) => ({
        url: "/assistant/chats",
        method: "GET",
        params: buildParams({ user_id, limit, offset }),
      }),
      providesTags: (_result, _error, arg) => [{ type: "AIChats", id: arg.user_id }],
    }),
    listMessages: builder.query<MessagePage, ListMessagesArgs>({
      query: ({ chat_id, user_id, limit, offset }) => ({
        url: `/assistant/chats/${encodeURIComponent(chat_id)}/messages`,
        method: "GET",
        params: buildParams({ user_id, limit, offset }),
      }),
      providesTags: (_result, _error, arg) => [{ type: "AIMessages", id: arg.chat_id }],
    }),
  }),
});

export const {
  useChatMutation,
  useListChatsQuery,
  useListMessagesQuery,
  useLazyListMessagesQuery,
} = aiApi;
