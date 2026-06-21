# Workflow and task queue names. POST_EMBEDDING_* values are dictated by
# content-service (see content-service/drivers/constants/constants.go).
POST_EMBEDDING_WORKFLOW = "IngestContentWorkflow"
POST_EMBEDDING_QUEUE = "WF_POST_INGESTING_QUEUE"

# Answers (is_answer comments) ingest on the same queue as posts.
ANSWER_EMBEDDING_WORKFLOW = "AnswerEmbeddingWorkflow"

RAG_CHAT_WORKFLOW = "RAG_CHAT"
RAG_CHAT_QUEUE = "WF_AI_RAG_QUEUE"
