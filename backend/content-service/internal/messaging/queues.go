package messaging

const (
	ExchangeName      = "yetbota"
	DeadLetterExchange = "yetbota.dlx"

	QueueNewPost    = "content.new_post"
	QueueFeedUpdate = "content.feed_update"
	QueueAIIngest   = "ai.ingest"

	QueueNewPostDLQ    = "content.new_post.dlq"
	QueueFeedUpdateDLQ = "content.feed_update.dlq"
	QueueAIIngestDLQ   = "ai.ingest.dlq"
)

var WorkQueues = []string{QueueNewPost, QueueFeedUpdate, QueueAIIngest}
