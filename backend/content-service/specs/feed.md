# Feed

## List

- Check if feed exists.
- If not, response with empty and trigger background feed update.
- If exists
  - Fetch exact amount of feed requested filter if cursor is provided
  - Iterate on the fetched feed and collect the unseen feeds only
  - If the final list is less than the requested amount, Fetch 2x the previous amount fetched. Repeat until either the feed is complete or the requested amount is reached
  - Cleanup the seen feed in the background for the future reads
  - Return the list of unseen feeds and a cursor to the next page

## Mark As Seen

- Add the post to the seen DB table
- Add the post to the seen feed Redis set with TTL from the Config

## Celebrity Case

Authors with follower count > `celebrity_threshold` are celebrities. Fan-out to all followers is too expensive, so a **pull model** is used instead:

- **Push side (workflow)**: Publish post to a per-author celebrity feed sorted set (`feed:celebrity:{authorID}`) scored by `postScore`. Set is capped at `max_celebrity_feed_size`; lowest-scored entries evicted on overflow.
- **Pull side (List)**: At read time, fetch the user's followed celebrity IDs. For each celebrity, read their feed sorted set. Merge celebrity items with personal feed items by score descending before filtering seen posts.
- **Sim fan-out is unaffected**: similarity-tree interactors always get direct push regardless of celebrity status.
- **Follower tree**: skipped entirely for celebrity authors. `GetFollowerTree` returns `IsCelebrity=true` and no batch keys.

Config knobs: `celebrity_threshold` (follower count cutoff), `max_celebrity_feed_size` (capped set size).

## Fan-out Feed Workflow (triggered by new post)

- Compute `postScore` and cache it.
- In parallel:
  - Check author follower count vs `celebrity_threshold`.
    - **Celebrity**: skip follower tree; publish post to `feed:celebrity:{authorID}` sorted set (capped at `max_celebrity_feed_size`).
    - **Non-celebrity**: fetch transitive follower tree up to `max_follower_depth`, bounded by `min_feed_score`. Write depth-batches to Redis.
  - Fetch similarity tree for the post up to `max_sim_depth`, bounded by `min_feed_score`. Collect direct interactors of similar posts; write depth-batches to Redis.
- Fan out post to follower-tree batch users (non-celebrity only) and sim-interactor batch users:
  - `fanOutScore = postScore + distanceAttenuation(depth)`. Skip if score < `min_feed_score`.
  - ZADD GT: update existing recipients only if post unseen. Add new recipients and record them.
- Fan out similar posts to all reached users plus the post author:
  - Follower-tree users: `simScore = simPostScore + attn(sim_depth) + attn(d_follow)`.
  - Sim-interactor users: `simScore = simPostScore + attn(sim_depth)`.
  - Skip if post already seen. ZADD GT keeps higher score.
  - For celebrity authors, follower batch keys are empty — sim fan-out covers only sim-interactors and the author.

## Update Feed Workflow (triggered by new interaction)

- Compute `effectivePostScore = postScore(likes, dislikes, createdAt)`.
- Cache post score (overwrite previous).
- In parallel:
  - Check author follower count vs `celebrity_threshold`.
    - **Celebrity**: publish updated score to `feed:celebrity:{authorID}` sorted set.
    - **Non-celebrity**: build follower depth-batches.
  - Build similarity tree depth-batches.
- Fan out post to follower-tree batch users (non-celebrity) and sim-interactor batch users:
  - `fanOutScore = effectivePostScore + distanceAttenuation(depth)`. Skip if score < `min_feed_score`.
  - Skip users already in the existing recipient set (they were updated at fan-out time via ZADD GT).
  - New users: ZADD GT and record as recipients.
- Fan out similar posts to all reached users plus the post author (same scoring as New Post workflow).
