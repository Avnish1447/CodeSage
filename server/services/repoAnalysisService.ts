import fs from 'node:fs';
import path from 'node:path';

export class RepoAnalysisService {
  static LANGUAGE_MAP: Record<string, string> = {
    '.py': 'Python',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.java': 'Java',
    '.go': 'Go',
    '.rs': 'Rust',
    '.cpp': 'C++',
    '.cc': 'C++',
    '.cxx': 'C++',
    '.h': 'C/C++',
    '.hpp': 'C/C++',
    '.c': 'C',
    '.cs': 'C#',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.sh': 'Shell',
    '.bat': 'Batch',
    '.ps1': 'PowerShell',
    '.html': 'HTML',
    '.htm': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'SASS',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
    '.astro': 'Astro',
    '.sql': 'SQL',
    '.md': 'Markdown',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.toml': 'TOML',
  };

  static IMPORTANT_FILE_PATTERNS = new Set([
    'main.py', 'app.py', 'run.py', 'wsgi.py', 'asgi.py', 'manage.py',
    'index.ts', 'server.ts', 'app.ts', 'index.js', 'server.js', 'app.js', 'main.tsx', 'app.tsx',
    'package.json', 'pyproject.toml', 'requirements.txt', 'setup.py',
    'pom.xml', 'build.gradle', 'cargo.toml', 'go.mod', 'gemfile',
    'vite.config.ts', 'vite.config.js', 'tailwind.config.js', 'tsconfig.json',
    'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    'readme.md', 'readme.txt', 'readme', 'contributing.md',
  ]);

  static analyzeRepository(repoPath: string) {
    const rootPath = path.resolve(repoPath);
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Repository path ${repoPath} does not exist`);
    }

    const stat = fs.statSync(rootPath);
    if (!stat.isDirectory()) {
      throw new Error(`Repository path ${repoPath} is not a directory`);
    }

    const excludeDirs = new Set(['.git', 'venv', 'env', '.venv', 'node_modules', '__pycache__', '.pytest_cache', '.mypy_cache', 'dist', 'build']);

    const allFilesRelative: string[] = [];
    const allDirsRelative = new Set<string>();

    function walkDir(currentPath: string) {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const item of items) {
        if (excludeDirs.has(item.name.toLowerCase())) {
          continue;
        }

        if (item.name === '.clone_complete') {
          continue;
        }

        const fullPath = path.join(currentPath, item.name);
        const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

        if (item.isDirectory()) {
          allDirsRelative.add(relPath);
          walkDir(fullPath);
        } else if (item.isFile()) {
          allFilesRelative.push(relPath);
        }
      }
    }

    walkDir(rootPath);

    // 1. Statistics
    const fileCount = allFilesRelative.length;
    const directoryCount = allDirsRelative.size;

    // 2. Languages Detection
    const languages: Record<string, number> = {};
    for (const f of allFilesRelative) {
      const ext = path.extname(f).toLowerCase();
      if (this.LANGUAGE_MAP[ext]) {
        const lang = this.LANGUAGE_MAP[ext];
        languages[lang] = (languages[lang] || 0) + 1;
      }
    }

    // 3. Important File Detection
    const importantFiles: string[] = [];
    for (const f of allFilesRelative) {
      const fileName = path.basename(f).toLowerCase();
      if (this.IMPORTANT_FILE_PATTERNS.has(fileName) || fileName.startsWith('readme')) {
        importantFiles.push(f);
      }
    }
    importantFiles.sort();

    // 4. Feature and Framework Detection
    const frameworks = new Set<string>();
    let dockerDetected = false;
    let testsDetected = false;
    let documentationPresence = false;

    let dependencyContents = '';

    for (const f of allFilesRelative) {
      const fileNameLower = path.basename(f).toLowerCase();

      if (fileNameLower.includes('dockerfile') || fileNameLower === 'docker-compose.yml' || fileNameLower === 'docker-compose.yaml') {
        dockerDetected = true;
      }

      if (fileNameLower.startsWith('readme') || f.endsWith('.md') || f.toLowerCase().split('/').includes('docs')) {
        documentationPresence = true;
      }

      if (fileNameLower.includes('test') || fileNameLower.includes('spec') || f.toLowerCase().split('/').includes('tests')) {
        testsDetected = true;
      }

      if (['requirements.txt', 'pyproject.toml', 'package.json', 'pom.xml', 'build.gradle', 'go.mod', 'cargo.toml', 'gemfile'].includes(fileNameLower)) {
        try {
          const content = fs.readFileSync(path.join(rootPath, f), 'utf-8');
          dependencyContents += content.toLowerCase() + '\n';
        } catch {
          // ignore read error
        }
      }
    }

    // Framework detection rules
    if (dependencyContents.includes('fastapi')) frameworks.add('FastAPI');
    if (dependencyContents.includes('flask')) frameworks.add('Flask');
    if (dependencyContents.includes('django')) frameworks.add('Django');
    if (dependencyContents.includes('react')) frameworks.add('React');
    if (dependencyContents.includes('next')) frameworks.add('Next.js');
    if (dependencyContents.includes('express')) frameworks.add('Express');
    if (dependencyContents.includes('vue')) frameworks.add('Vue');
    if (dependencyContents.includes('angular')) frameworks.add('Angular');
    if (dependencyContents.includes('svelte')) frameworks.add('Svelte');
    if (dependencyContents.includes('tailwind')) frameworks.add('Tailwind CSS');
    if (dependencyContents.includes('vite')) frameworks.add('Vite');
    if (dependencyContents.includes('spring-boot') || dependencyContents.includes('springboot')) frameworks.add('Spring Boot');
    if (dependencyContents.includes('gin-gonic') || dependencyContents.includes('gin')) frameworks.add('Gin');
    if (dependencyContents.includes('actix-web')) frameworks.add('Actix-web');

    if (frameworks.size === 0) {
      for (const f of allFilesRelative) {
        const lower = f.toLowerCase();
        if (lower.includes('fastapi')) frameworks.add('FastAPI');
        else if (lower.includes('django')) frameworks.add('Django');
        else if (lower.includes('flask')) frameworks.add('Flask');
        else if (lower.includes('react')) frameworks.add('React');
        else if (lower.includes('vue')) frameworks.add('Vue');
      }
    }

    // 5. Tree Summary
    const treeSummary = this.generateTreeSummary(allFilesRelative, Array.from(allDirsRelative));

    return {
      languages,
      frameworks: Array.from(frameworks).sort(),
      important_files: importantFiles,
      tree_summary: treeSummary,
      stats: {
        file_count: fileCount,
        directory_count: directoryCount,
        docker_detected: dockerDetected,
        tests_detected: testsDetected,
        documentation_presence: documentationPresence,
      },
    };
  }

  private static generateTreeSummary(files: string[], dirs: string[]) {
    interface TreeNode {
      path: string;
      type: 'directory' | 'file';
      name: string;
      children?: TreeNode[];
      important?: boolean;
    }

    const nodeMap = new Map<string, TreeNode>();

    const getOrCreateDir = (dirPath: string): TreeNode => {
      if (nodeMap.has(dirPath)) return nodeMap.get(dirPath)!;

      const parts = dirPath.split('/');
      const name = parts[parts.length - 1];
      const node: TreeNode = {
        path: dirPath,
        type: 'directory',
        name,
        children: [],
      };
      nodeMap.set(dirPath, node);

      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        const parentNode = getOrCreateDir(parentPath);
        if (!parentNode.children) parentNode.children = [];
        if (!parentNode.children.some((c) => c.path === dirPath)) {
          parentNode.children.push(node);
        }
      }
      return node;
    };

    dirs.sort().forEach((d) => getOrCreateDir(d));

    files.sort().forEach((f) => {
      const parts = f.split('/');
      const fileName = parts[parts.length - 1];
      let isImportant = false;
      for (const pattern of RepoAnalysisService.IMPORTANT_FILE_PATTERNS) {
        if (pattern.toLowerCase() === fileName.toLowerCase()) {
          isImportant = true;
          break;
        }
      }

      const fileNode: TreeNode = {
        path: f,
        type: 'file',
        name: fileName,
        important: isImportant,
      };

      if (parts.length === 1) {
        nodeMap.set(f, fileNode);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parentNode = getOrCreateDir(parentPath);
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(fileNode);
      }
    });

    const rootNodes: TreeNode[] = [];
    nodeMap.forEach((node, p) => {
      if (!p.includes('/')) {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }
}
