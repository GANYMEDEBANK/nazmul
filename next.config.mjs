const repo = process.env.GITHUB_REPOSITORY || "";
const repoName = repo.split("/")[1] || "";
const autoBase = repoName && !repoName.endsWith(".github.io") ? `/${repoName}` : "";
const basePath = process.env.SITE_BASE_PATH ?? autoBase;

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_REPO: repo,
    NEXT_PUBLIC_BRANCH: process.env.GITHUB_REF_NAME || "main",
  },
};

export default nextConfig;
