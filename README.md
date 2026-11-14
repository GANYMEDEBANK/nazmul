# Md Nazmul Islam — personal website

A Next.js site that deploys free on GitHub Pages. It has a public page and a secure admin page.

## How it works

- All public text lives in one file: `content/site.json`.
- GitHub Actions builds the site and publishes it on every push to `main`.
- The admin page is at `/admin`. It edits `content/site.json` through the GitHub API.
- After you save, the site rebuilds. The change is live in about two minutes.

## First-time setup

1. Create a new repository on GitHub. Make it public (free GitHub Pages needs this).
   - Name it `<your-username>.github.io` to get the address `https://<your-username>.github.io/`.
   - Any other name gives `https://<your-username>.github.io/<repo-name>/`. The build handles both.
2. Open a terminal in this folder and run:

   ```bash
   npm install
   git init -b main
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. On GitHub open **Settings → Pages**. Under **Source** choose **GitHub Actions**.
4. Open the **Actions** tab. Wait for the green tick. Your site is live.

## Create your admin key

The admin page needs a GitHub access token. Make one that can do only one thing.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Click **Generate new token**.
3. **Repository access**: choose **Only select repositories** and pick this site's repository.
4. **Permissions → Repository permissions → Contents**: set to **Read and write**. Leave everything else alone.
5. Set an expiry date (90 days is a good choice).
6. Copy the token. Save it in a password manager.

Then open `https://<your-site>/admin/`, paste the token and sign in.

## Using the admin page

- Pick a section on the left. Edit the fields.
- In list sections you can add, reorder and delete items.
- In **Profile** you can upload a photo and a CV. After an upload, press **Save and publish**.
- **Save and publish** writes your changes to GitHub. The public site updates in about two minutes.
- Leave a field empty to hide it. For example, clear **Phone** to remove your number.

## Why the admin is secure

- There is no password stored in the site. There is no secret in the code. Nothing can be stolen from the page itself.
- Anyone can open `/admin`, but the page can do nothing without a valid token. GitHub checks every write.
- The token goes only to `api.github.com`. A content security policy on the admin page blocks every other destination.
- The token stays in memory. It is gone when you close or reload the tab. If you tick "Keep me signed in", it stays until the tab closes.
- The admin signs you out after 30 minutes without activity.
- The token is limited to one repository and to file contents. It cannot touch your account or other repositories.
- Search engines are told not to index `/admin`.
- Every change is a Git commit. You can see and undo any edit in the repository history.

To keep it secure:

- Turn on two-factor authentication on your GitHub account.
- Never share the token. Never commit it to a repository.
- If the token leaks, delete it on GitHub at once. It stops working immediately.
- Use the admin only on a computer you trust.

## What is public

The repository is public, so everything in it is public. That includes `content/site.json` and its full history. Do not put private data in the admin. An uploaded CV is public too.

## Run it on your computer

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. On your computer the admin page asks for the repository name as well (`owner/repository`).

To test the production build:

```bash
npm run build
npm run preview
```

## Custom domain

If you add a custom domain later, the site sits at the root of that domain. Open `.github/workflows/deploy.yml` and change the build step to:

```yaml
      - run: npm run build
        env:
          SITE_BASE_PATH: ""
```

## File map

| Path | Purpose |
| --- | --- |
| `content/site.json` | All public text and links |
| `app/page.tsx` | The public page |
| `app/globals.css` | Colors, fonts and layout. Change `--accent` to change the green |
| `app/admin/page.tsx` | The admin route and its security policy |
| `components/Admin.tsx` | Sign-in, editor, save and uploads |
| `lib/github.ts` | Calls to the GitHub API |
| `lib/schema.ts` | The list of editable sections and fields |
| `.github/workflows/deploy.yml` | Build and publish to GitHub Pages |
| `public/uploads/` | Photo and CV uploaded from admin |
