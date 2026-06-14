import { join } from "path";

interface GitHubResponsePayload {
  data: {
    user: {
      login: string;
      name: string | null;
      bio: string | null;
      avatarUrl: string;
      company: string | null;
      followers: { totalCount: number };
      repositories: { totalCount: number };
    };
  };
  errors?: Array<{ message: string }>;
}

async function fetchGitHubData() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || ""; 
  const [owner] = repository.split("/");

  if (!token || !owner) {
    console.error("Missing GITHUB_TOKEN or GITHUB_REPOSITORY environment variables.");
    process.exit(1);
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        login
        name
        bio
        avatarUrl
        company
        followers {
          totalCount
        }
        repositories(privacy: PUBLIC) {
          totalCount
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "icommit-action"
      },
      body: JSON.stringify({ query, variables: { username: owner } })
    });

    const result = (await response.json()) as GitHubResponsePayload;
    
    if (result.errors) {
      console.error("GraphQL API Error:", JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    const userData = result.data.user;

    const targetPath = join(process.cwd(), "frontend", "public", "gh-data.json");
    await Bun.write(targetPath, JSON.stringify(userData, null, 2));

  } catch (error) {
    console.error("Network or parsing execution failure:", error);
    process.exit(1);
  }
}

fetchGitHubData();