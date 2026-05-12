import { aiBaseApi } from "@/store/api/aiBaseApi";

export type CitationKind = "post" | "question" | "answer";

export interface Citation {
  source_id: string;
  kind: CitationKind;
  text: string;
  score: number;
}

export interface ChatRequest {
  text: string;
  user_id?: string | null;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export const aiApi = aiBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    chat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({ url: "/assistant/chat", method: "POST", body }),
    }),
  }),
});

export const { useChatMutation } = aiApi;
