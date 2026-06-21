# Author Rating

Codeforces-style per-author score. Each author competes only against their own expected
performance — no ranking against other authors.

## Score

Stored as `users.score bigint`, default `1500`.

### Engagement score (per post)

```
engagement = likes*2 + comment_count*3 - dislikes
score      = log2(max(engagement, 0) + 1)
```

### Expected engagement (from author score)

```
expected = 2 ^ ((author.score - 1500) / 400)
```

Rating 1500 → expected 1.0. Every +400 rating → 2× expectation.

### Implied rating (from actual engagement)

```
implied = 1500 + 400 * log2(engagement_score)   ; floor at 1100 if engagement ≤ 0
```

### Delta

```
K     = 32   (if post_count ≤ 30)
      = 16   (if post_count ≤ 100)
      = 8    (if post_count > 100)

delta = round(K * tanh((implied - author.score) / 400))
```

`tanh` clamps delta to `(-K, +K)` so one viral post cannot swing rating wildly.

### Update

```
new_score = author.score + delta
```

Applied 48 h after post publish (stabilizing window — engagement has settled).

## Badges

Read from config. Awarded when `author.score >= badge.min_score`. Idempotent (never re-awarded).

| badge           | min_score | meaning                     |
| --------------- | --------- | --------------------------- |
| `contributor`   | 1600      | consistently above baseline |
| `trusted_voice` | 1800      | reliably quality content    |
| `expert`        | 2000      | top-tier contributor        |
| `master`        | 2200      | rare — sustained excellence |
| `grandmaster`   | 2400      | elite                       |

Additional activity badges (awarded by other workflows, not this one):

| badge               | trigger                                    |
| ------------------- | ------------------------------------------ |
| `explorer`          | posted from 10+ unique locations           |
| `trailblazer`       | first post for a location                  |
| `hidden_gem_finder` | posted about a spot with <5 existing posts |
| `spot_verified`     | post verified by community moderators      |
| `question_master`   | 100+ is_question posts                     |
| `answer_guru`       | top-voted comment provider                 |

## Workflow

Eternal Temporal workflow on queue `AUTHOR_SCORING_QUEUE`. Started once at service boot
with a fixed workflow ID (`author-scoring-eternal`) — safe to call on every deploy, only
one instance runs.

```
AuthorScoringWorkflow(input, iter=0):
  if iter == 0: EnsureGroup()           # create Redis consumer group if absent

  loop:
    entries = ReadScoringBatch()         # XREADGROUP pending(0) + new(>)
    now     = workflow.Now()

    ready = []
    for e in entries:
      if now - e.createdAt < stabilizingWindow: continue
      ProcessScoringEntry(e.postID)      # compute+save score, check+award badges
      ready.append(e.streamID)

    AckEntries(ready)                    # XACK
    Sleep(pollIntervalSec)

    iter++
    if iter >= continueAfterIter:
      ContinueAsNew(input, 0)           # reset Temporal history
```

### On post create

`post.Add` pushes `{postID, createdAt}` to the Redis stream `POST_SCORING_STREAM`
immediately after the post is persisted.

## Config

```yaml
author_rating:
  stabilizing_window_hours: 48
  stream_key: POST_SCORING_STREAM
  consumer_group: scoring-group
  poll_interval_sec: 30
  batch_size: 100
  continue_after_iter: 500
  task_queue: AUTHOR_SCORING_QUEUE
  badges:
    - name: contributor
      min_score: 1600
    - name: trusted_voice
      min_score: 1800
    - name: expert
      min_score: 2000
    - name: master
      min_score: 2200
    - name: grandmaster
      min_score: 2400
```
