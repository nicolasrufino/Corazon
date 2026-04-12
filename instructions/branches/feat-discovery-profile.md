# Branch: feat/discovery-profile

**Assignee:** Diego
**Branch name:** `feat/discovery-profile`
**What:** Wire up Cloudinary image uploads for discover feed + build the full profile page
**Depends on:** Posts table + post_likes table must exist in Supabase (run SQL if not)

---

## Claude Code prompt

Paste this into Claude Code to get started:

```
Read the files instructions/global-rules.md and instructions/branches/feat-discovery-profile.md in order. Follow every step exactly. Do not skip any step. Ask me before making any decision not covered in these instructions. After each major step, run npm run lint && npm run build to verify nothing is broken.
```

---

## Pre-flight checklist

Before writing any code, verify these:

### 1. Check Supabase tables exist

Run in Claude Code or check Supabase dashboard:
- `profiles` table must have a `username` column (type: text)
- `posts` table must exist with columns: id, user_id, username, content, image_url, category, likes_count, created_at, updated_at
- `post_likes` table must exist with columns: id, post_id, user_id, created_at

If any are missing, run the SQL files:
- `backend/supabase/posts_schema.sql` — creates posts + post_likes + RLS
- For username column: `ALTER TABLE profiles ADD COLUMN username text;`

### 2. Check username generation works

Look at `src/lib/username.ts` — it generates usernames like `BraveEagle247`.
Look at `src/context/AppContext.tsx` — `startSignUp()` calls `generateUsername()` and stores it in profiles.
Test: sign up a new user and check the profiles table — username should be populated.

### 3. Check discover page loads

Navigate to `/discovery` — you should see the feed UI with compose box, category filters, and empty state.
The page is at `src/pages/DiscoveryPage.tsx` and uses `src/lib/postsApi.ts` for data.

---

## Step 1 — Set up Cloudinary

### 1a. Create a free Cloudinary account
Go to cloudinary.com, sign up (free tier: 25GB storage, 25GB bandwidth/month).
From the dashboard, get these values:
- Cloud name (e.g. `dxyz123abc`)
- Upload preset: Create one in Settings > Upload > Upload presets > Add unsigned preset. Name it `corazon_uploads`. Set folder to `posts/`.

### 1b. Add env variables

Add to `.env.local` (frontend):
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=corazon_uploads
```

Add to `.env.example`:
```
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Add to `src/config/env.ts`:
```ts
cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string,
cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string,
```

### 1c. Create the upload utility

Create `src/lib/cloudinary.ts`:
```ts
import { config } from '@/config/env'

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', config.cloudinaryUploadPreset)
  formData.append('folder', 'posts')

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    return data.secure_url || null
  } catch (err) {
    console.error('Cloudinary upload failed:', err)
    return null
  }
}
```

This uploads directly from the browser to Cloudinary (no backend needed). Returns the image URL which we store in the posts table.

---

## Step 2 — Add image upload to the compose box

Edit `src/pages/DiscoveryPage.tsx`. In the compose section:

### 2a. Add state for the image
```ts
const [imageFile, setImageFile] = useState<File | null>(null)
const [imagePreview, setImagePreview] = useState<string | null>(null)
```

### 2b. Add a file input + preview
Below the textarea in the compose box, add:
- A button with an Image icon (from lucide-react) that triggers a hidden `<input type="file" accept="image/*">`
- When a file is selected, create a local preview URL with `URL.createObjectURL(file)` and show it
- An X button to remove the selected image
- Max file size: 5MB — show an error if exceeded

### 2c. Update handleSubmit
Before calling `createPost()`:
1. If `imageFile` exists, call `uploadImage(imageFile)` to get the Cloudinary URL
2. Pass the URL to `createPost(content, category, imageUrl)`
3. Show a loading state during upload ("Uploading image..." or "Subiendo imagen...")

### 2d. Import
```ts
import { uploadImage } from '@/lib/cloudinary'
import { ImagePlus } from 'lucide-react'
```

---

## Step 3 — Build the full profile page

Edit `src/pages/ProfilePage.tsx`. The current page is a placeholder. Build the full version:

### 3a. Layout
```
┌─────────────────────────────────────────┐
│  [Avatar circle]   Username             │
│                    email                 │
│                    Member since date     │
├─────────────────────────────────────────┤
│  Profile Info                           │
│  Country: Mexico                        │
│  Language: Espanol                      │
│  Occupation: Student + Worker           │
│  Goals: [pill] [pill] [pill]            │
├─────────────────────────────────────────┤
│  My Posts (count)                        │
│  [Post card]                            │
│  [Post card]                            │
│  [Post card]                            │
├─────────────────────────────────────────┤
│  [Sign out button - red outline]        │
└─────────────────────────────────────────┘
```

### 3b. Fetch user's posts
Use `src/lib/postsApi.ts` — add a new function:
```ts
export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return []
  return (data || []).map(p => ({ ...p, liked_by_me: false }))
}
```

### 3c. Profile info section
Read from `user.profile` in AppContext. Display:
- Country of origin (with flag emoji if from the country list)
- Language preference
- Occupations (comma separated)
- Goals (as pill badges)
- Username (prominently, as the "display name")
- Member since (from `user` created_at or profile created_at)

### 3d. Avatar
Use the same `UserIcon` circle as the navbar but bigger (80x80px). If we add profile picture uploads later, this is where it goes.

### 3e. Delete own posts
Each post card in the profile should have a trash icon that calls `deletePost(postId)` from postsApi. Only show it on the user's own posts (which it always is on the profile page).

### 3f. Colors
Use the Corazon logo letter colors for accents:
- Profile header accent: `#dc2626` (heart red)
- Goals pills: use different logo colors for each pill
- Section borders: use `var(--border)`

### 3g. Sign out
Keep the sign out button at the bottom. Red outline style:
```tsx
<Button variant="outline" className="text-destructive hover:bg-destructive/10">
```

---

## Step 4 — Add Cloudinary env to Vercel

After everything works locally:
1. Go to Vercel dashboard > your project > Settings > Environment Variables
2. Add `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## Step 5 — Final checks

1. `npm run lint` — must pass with 0 errors 0 warnings
2. `npm run build` — must pass
3. Test the full flow:
   - Sign up a new user → verify username appears
   - Go to /discovery → create a post with text only → verify it appears
   - Create a post with an image → verify upload + display works
   - Like a post → verify heart fills and count updates
   - Go to /profile → verify posts show, info shows, delete works
   - Sign out → verify redirect to landing page

## Step 6 — Push and PR

```bash
git add <specific files>
git commit -m "feat: cloudinary image uploads + full profile page"
git push origin feat/discovery-profile
```

Then create a PR to main. In the PR description:
- List what was added
- Screenshot of the discover feed with a post
- Screenshot of the profile page
- Note: "Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel env vars"
