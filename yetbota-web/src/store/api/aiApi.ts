import { aiBaseApi } from "@/store/api/aiBaseApi";

export type CitationKind = "post" | "question" | "answer";
export type MessageRole = "user" | "assistant";

export interface Citation {
  source_id: string;
  kind: CitationKind;
  text: string;
  score: number;
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

// The AI service returns resources directly (no { success, data } envelope) and
// wraps collections in a named key rather than a paginated page object.
export interface ChatListResponse {
  chats: Chat[];
}

export interface MessageListResponse {
  messages: AssistantMessage[];
}

export interface CreateChatArgs {
  user_id: string;
  title?: string;
}

export interface ListChatsArgs {
  user_id: string;
  limit?: number;
}

export interface ListMessagesArgs {
  chat_id: string;
  limit?: number;
}

export interface SendMessageArgs {
  chat_id: string;
  text: string;
  // Not sent in the body — used only to invalidate this user's chat list (the
  // send can update the chat title and bump updated_at ordering).
  user_id?: string;
}

export interface DeleteChatArgs {
  chat_id: string;
  // Used only to invalidate this user's chat list.
  user_id?: string;
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
    createChat: builder.mutation<Chat, CreateChatArgs>({
      query: ({ user_id, title }) => ({
        url: "/assistant/chats",
        method: "POST",
        body: { user_id, title: title ?? "" },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "AIChats", id: arg.user_id }],
    }),

    // GET /v1/assistant/chats?user_id=&limit= -> { chats: [...] }
    listChats: builder.query<ChatListResponse, ListChatsArgs>({
      query: ({ user_id, limit }) => ({
        url: "/assistant/chats",
        method: "GET",
        params: buildParams({ user_id, limit }),
      }),
      providesTags: (_result, _error, arg) => [{ type: "AIChats", id: arg.user_id }],
    }),

    // GET /v1/assistant/chats/{chat_id}/messages?limit= -> { messages: [...] }
    listMessages: builder.query<MessageListResponse, ListMessagesArgs>({
      query: ({ chat_id, limit }) => ({
        url: `/assistant/chats/${encodeURIComponent(chat_id)}/messages`,
        method: "GET",
        params: buildParams({ limit }),
      }),
      providesTags: (_result, _error, arg) => [{ type: "AIMessages", id: arg.chat_id }],
    }),

    // POST /v1/assistant/chats/{chat_id}/messages -> 201 assistant Message (runs RAG)
    sendMessage: builder.mutation<AssistantMessage, SendMessageArgs>({
      query: ({ chat_id, text }) => ({
        url: `/assistant/chats/${encodeURIComponent(chat_id)}/messages`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (_result, _error, arg) => {
        const tags: Array<{ type: "AIChats" | "AIMessages"; id: string }> = [];
        if (arg.user_id) tags.push({ type: "AIChats", id: arg.user_id });
        return tags;
      },
    }),

    // DELETE /v1/assistant/chats/{chat_id} -> 204
    deleteChat: builder.mutation<void, DeleteChatArgs>({
      query: ({ chat_id }) => ({
        url: `/assistant/chats/${encodeURIComponent(chat_id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => {
        const tags: Array<{ type: "AIChats" | "AIMessages"; id: string }> = [
          { type: "AIMessages", id: arg.chat_id },
        ];
        if (arg.user_id) tags.push({ type: "AIChats", id: arg.user_id });
        return tags;
      },
    }),
  }),
});

export const {
  useCreateChatMutation,
  useListChatsQuery,
  useListMessagesQuery,
  useLazyListMessagesQuery,
  useSendMessageMutation,
  useDeleteChatMutation,
} = aiApi;
