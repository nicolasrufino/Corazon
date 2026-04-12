# Branch: feat/comments-notifications-saved

**Branch name:** `feat/comments-notifications-saved`
**What:** Comments on posts, reply threads, notification system, saved items with custom lists
**Depends on:** posts + post_likes tables must exist, profiles must have username column

---

## Claude Code prompt

```
Read the files instructions/global-rules.md and instructions/branches/feat-comments-notifications-saved.md in order. Follow every step exactly. After each phase, run npm run lint && npm run build && npm run test to verify nothing is broken. Ask me before making any decision not covered here.
```

---

## Architecture Overview

```
User sees a post in /discovery
  → clicks comment icon → comment drawer opens
    → writes a comment → saved to comments table
    → can reply to a comment → saved with parent_id
    → post author gets a notification
    → commenter on same thread gets notified of replies

User saves a post or resource
  → default list: "Saved" (auto-created)
  → can create custom lists: "Jobs", "Legal", "For Mom"
  → saved items show in /profile under "Saved" tab

User clicks bell icon in navbar
  → sees notification feed: "BraveEagle247 commented on your post"
  → clicking a notification opens that post
  → unread count badge on bell icon
```

---

## Phase 1 — Database Schema (run in Supabase SQL Editor)

Create file `backend/supabase/comments_notifications_saved_schema.sql`:

```sql
-- ═══════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  username text not null,
  content text not null check (char_length(content) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_parent_id_idx on public.comments (parent_id);
create index if not exists comments_user_id_idx on public.comments (user_id);

alter table public.comments enable row level security;

create policy "Anyone can read comments"
  on public.comments for select to anon, authenticated using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete to authenticated
  using (auth.uid() = user_id);

-- Add comment count to posts for fast display
alter table public.posts add column if not exists comments_count int not null default 0;

-- ═══════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('comment', 'reply', 'like')),
  -- Who triggered the notification
  actor_username text not null,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  -- What it's about
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  -- Preview text (first 80 chars of the comment/post)
  preview text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can create notifications"
  on public.notifications for insert to authenticated
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- SAVED LISTS
-- ═══════════════════════════════════════════

create table if not exists public.saved_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 50),
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.saved_lists enable row level security;

create policy "Users can read own lists"
  on public.saved_lists for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can create lists"
  on public.saved_lists for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.saved_lists for delete to authenticated
  using (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- SAVED ITEMS (posts, resources, or any content)
-- ═══════════════════════════════════════════

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid references public.saved_lists(id) on delete cascade,
  -- What type of content is saved
  item_type text not null check (item_type in ('post', 'resource')),
  -- The ID of the saved content (post uuid or opportunity id)
  item_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_type, item_id, list_id)
);

create index if not exists saved_items_user_id_idx on public.saved_items (user_id);
create index if not exists saved_items_list_id_idx on public.saved_items (list_id);

alter table public.saved_items enable row level security;

create policy "Users can read own saved items"
  on public.saved_items for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can save items"
  on public.saved_items for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave items"
  on public.saved_items for delete to authenticated
  using (auth.uid() = user_id);
```

### Pre-flight check
After running the SQL, verify all tables exist:
- `comments` — id, post_id, user_id, parent_id, username, content, created_at
- `notifications` — id, user_id, type, actor_username, actor_user_id, post_id, comment_id, preview, read, created_at
- `saved_lists` — id, user_id, name, created_at
- `saved_items` — id, user_id, list_id, item_type, item_id, created_at
- `posts` — should now have `comments_count` column

---

## Phase 2 — API Layer

### 2a. Create `src/lib/commentsApi.ts`

```ts
interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  username: string
  content: string
  created_at: string
  replies?: Comment[]  // populated client-side from flat list
}
```

Functions:
- `fetchComments(postId: string): Promise<Comment[]>` — fetch all comments for a post, ordered by created_at asc. Build reply tree client-side: top-level comments have `parent_id = null`, replies are nested under their parent.
- `createComment(postId: string, content: string, parentId?: string): Promise<Comment | null>` — insert comment, increment `posts.comments_count`, create a notification for the post author (type: 'comment') and for the parent comment author if it's a reply (type: 'reply'). Fetch username from profiles table.
- `deleteComment(commentId: string): Promise<boolean>` — delete comment, decrement `posts.comments_count`.

### 2b. Create `src/lib/notificationsApi.ts`

```ts
interface Notification {
  id: string
  type: 'comment' | 'reply' | 'like'
  actor_username: string
  post_id: string | null
  comment_id: string | null
  preview: string
  read: boolean
  created_at: string
}
```

Functions:
- `fetchNotifications(limit?: number): Promise<Notification[]>` — fetch user's notifications, newest first
- `getUnreadCount(): Promise<number>` — count where read = false
- `markAsRead(notificationId: string): Promise<void>` — set read = true
- `markAllAsRead(): Promise<void>` — set all user's notifications to read

### 2c. Create `src/lib/savedApi.ts`

```ts
interface SavedList {
  id: string
  name: string
  item_count: number
  created_at: string
}

interface SavedItem {
  id: string
  item_type: 'post' | 'resource'
  item_id: string
  list_id: string | null
  created_at: string
  // Populated from join:
  title?: string
  preview?: string
}
```

Functions:
- `fetchLists(): Promise<SavedList[]>` — fetch user's lists with item counts
- `createList(name: string): Promise<SavedList | null>` — create a new list (max 20 per user)
- `deleteList(listId: string): Promise<boolean>` — delete list + all its items
- `saveItem(itemType: 'post' | 'resource', itemId: string, listId?: string): Promise<boolean>` — save to a specific list, or to default "Saved" list (auto-created if doesn't exist)
- `unsaveItem(itemType: string, itemId: string, listId?: string): Promise<boolean>` — remove from list
- `fetchSavedItems(listId?: string): Promise<SavedItem[]>` — fetch items in a list, or all saved items if no listId
- `isItemSaved(itemType: string, itemId: string): Promise<boolean>` — check if item is saved (for UI toggle)

---

## Phase 3 — Comments UI

### 3a. Add comment count + icon to post cards in DiscoveryPage

Next to the heart/like button, add a `MessageCircle` icon with `comments_count`:
```tsx
<button onClick={() => openComments(post.id)} className="...">
  <MessageCircle className="size-4" />
  {post.comments_count > 0 && post.comments_count}
</button>
```

Update the `Post` interface in `postsApi.ts` to include `comments_count: number`.

### 3b. Create `src/components/CommentDrawer.tsx`

A slide-up drawer (like VoiceAssistant) that shows when a user clicks the comment icon.

Layout:
```
┌─────────────────────────────────────────┐
│  Comments (count)                   [X] │
├─────────────────────────────────────────┤
│  [Avatar] BraveEagle247        2h ago   │
│  Great resource, thanks!                │
│     ↳ [Avatar] CalmQuetzal031  1h ago   │
│       Agreed!                           │
│     [Reply]                             │
│                                         │
│  [Avatar] GoldenCenote819      30m ago  │
│  Anyone know if they're open weekends?  │
│     [Reply]                             │
├─────────────────────────────────────────┤
│  [input: Write a comment...]    [Send]  │
└─────────────────────────────────────────┘
```

Features:
- Flat list of top-level comments with nested replies (1 level deep max)
- Each comment shows: avatar circle, username, time ago, content
- "Reply" button under each comment → sets `parentId` and focuses input with "@username" prefix
- Send button creates comment + notification
- Delete button (trash icon) on own comments only
- Max 300 characters per comment
- Bilingual labels

### 3c. Props
```tsx
interface CommentDrawerProps {
  postId: string
  isOpen: boolean
  onClose: () => void
  onCommentCountChange: (postId: string, delta: number) => void
}
```

The `onCommentCountChange` callback updates the post card's count without refetching all posts.

---

## Phase 4 — Notifications UI

### 4a. Add bell icon to AppNavbar

Next to the profile avatar, add a `Bell` icon (from lucide-react):
- Shows a red dot/badge with unread count if > 0
- Clicking opens a dropdown/drawer with the notification feed
- Each notification is clickable → navigates to the post

### 4b. Create `src/components/NotificationDropdown.tsx`

Layout:
```
┌─────────────────────────────────────┐
│  Notifications            Mark all  │
├─────────────────────────────────────┤
│  🔴 BraveEagle247 commented on     │
│     your post: "Great resource..."  │
│     2 min ago                       │
│                                     │
│  CalmQuetzal031 replied to your     │
│  comment: "Agreed!"                 │
│  1 hour ago                         │
│                                     │
│  GoldenCenote819 liked your post    │
│  3 hours ago                        │
└─────────────────────────────────────┘
```

Features:
- Unread notifications have a blue/red left border
- "Mark all as read" button at top
- Clicking a notification marks it as read + navigates to `/discovery?post=<id>`
- Empty state: "No notifications yet"
- Max 20 notifications shown
- Poll for new notifications every 30 seconds (or use Supabase realtime if time permits)

### 4c. Update like notification

When a user likes a post, also create a notification for the post author (type: 'like'). Update `toggleLike` in `postsApi.ts`.

---

## Phase 5 — Saved Items UI

### 5a. Update ResourceCard save button

Currently `toggleSavedResource` is in-memory only. Replace with:
1. On save click → show a small dropdown: "Save to: [Saved] [+ New list]"
2. Default action (single click) saves to the default "Saved" list
3. Long press or dropdown shows custom lists
4. For MVP: just use a single "Saved" list, add custom lists later if time

### 5b. Update post cards in DiscoveryPage

Add a bookmark icon to post cards (like ResourceCard has). Clicking saves the post to the "Saved" list.

### 5c. Add "Saved" tab to ProfilePage

In ProfilePage, add tabs: "Posts" | "Saved"

Saved tab shows:
- List of saved lists (default "Saved" + any custom ones)
- Clicking a list shows saved items
- Each item shows: title/preview, type badge (Post/Resource), date saved, unsave button
- Posts show the post content preview
- Resources show the org name + category

### 5d. Wire saved resources to Supabase

Replace the in-memory `savedResourceIds` in AppContext with real `saved_items` table calls. The `hasSavedResource` function should check Supabase instead of local state. Cache the result in state for performance but sync on mount.

---

## Phase 6 — Integration & Edge Cases

### 6a. Notification creation rules
- Do NOT notify yourself (if you comment on your own post, no notification)
- Do NOT create duplicate notifications (same actor + same post + same type within 1 minute)
- Truncate preview text to 80 characters

### 6b. Comment count consistency
- When creating a comment, increment `posts.comments_count`
- When deleting a comment, decrement `posts.comments_count`
- Use `Math.max(0, count - 1)` to prevent negatives
- If a comment with replies is deleted, cascade deletes replies (DB handles this) but also adjust count by total deleted

### 6c. Performance
- Fetch comments only when drawer opens (not on page load)
- Fetch notifications on mount + poll every 30 seconds
- Saved items: cache in local state, sync on mount
- Debounce save/unsave actions

### 6d. Offline/error handling
- Show toast or inline error if comment fails to post
- Show toast if save fails
- Notifications failing to load should not break the app

---

## Phase 7 — Testing

Add tests in `src/__tests__/`:

### `comments.test.ts`
- Comment tree building: flat list → nested tree
- Reply depth (max 1 level)
- Comment content validation (max 300 chars)
- Self-notification prevention

### `notifications.test.ts`
- Notification type mapping
- Unread count calculation
- Preview text truncation to 80 chars

### `saved.test.ts`
- List name validation (max 50 chars)
- Max lists per user (20)
- Duplicate save prevention
- Item type validation ('post' | 'resource')

---

## Phase 8 — Final Checks

1. `npm run lint` — 0 errors, 0 warnings
2. `npm run build` — passes
3. `npm run test` — all tests pass
4. Test full flow:
   - Create a post → comment on it → see comment count update
   - Reply to a comment → original commenter gets notification
   - Like a post → post author gets notification
   - Click bell → see notifications → click one → goes to post
   - Save a post → go to profile → see it in Saved tab
   - Save a resource → see it in Saved tab
   - Create a custom list → save items to it
   - Delete a comment → count decrements
   - Delete a saved item → disappears from list

---

## File Summary

### New files
```
backend/supabase/comments_notifications_saved_schema.sql
src/lib/commentsApi.ts
src/lib/notificationsApi.ts
src/lib/savedApi.ts
src/components/CommentDrawer.tsx
src/components/NotificationDropdown.tsx
src/__tests__/comments.test.ts
src/__tests__/notifications.test.ts
src/__tests__/saved.test.ts
```

### Modified files
```
src/lib/postsApi.ts          — add comments_count to Post interface, notification on like
src/pages/DiscoveryPage.tsx  — comment icon + count, save icon, CommentDrawer integration
src/pages/ProfilePage.tsx    — add Saved tab with lists + items
src/components/AppNavbar.tsx — bell icon + NotificationDropdown
src/components/ResourceCard.tsx — wire save to Supabase instead of in-memory
src/context/AppContext.tsx   — replace in-memory savedResourceIds with Supabase sync
```

---

## Push flow

After each phase:
```bash
npm run lint && npm run build && npm run test
git add <specific files>
git commit -m "feat: phase N — description"
git push origin feat/comments-notifications-saved
```

When all phases done, create PR to main.
