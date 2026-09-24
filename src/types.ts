export interface RepoOverview {
  repository_id: string;
  owner: string;
  repo: string;
  files: number;
  size_mb: number;
  normalized_url: string;
}

export interface RepoStats {
  file_count: number;
  directory_count: number;
  docker_detected: boolean;
  tests_detected: boolean;
  documentation_presence: boolean;
}

export interface TreeNode {
  path: string;
  type: 'directory' | 'file';
  name: string;
  children?: TreeNode[];
  important?: boolean;
}

export interface RepoFacts {
  repository_id: string;
  url: string;
  languages: Record<string, number>;
  frameworks: string[];
  important_files: string[];
  tree_summary: TreeNode[];
  stats: RepoStats;
}

export interface RepoResponse {
  repository_id: string;
  status: string;
  overview: RepoOverview;
  facts: RepoFacts;
  learning_path: string[];
  architecture_summary: string;
  storage_path: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
