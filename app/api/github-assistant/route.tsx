import { type NextRequest, NextResponse } from "next/server"

interface GitHubFile {
  path: string
  content: string
  encoding?: string
}

interface CommitRequest {
  action: "connect" | "commit" | "create-repo" | "setup-webhook"
  token?: string
  owner?: string
  repo?: string
  message?: string
  files?: string[]
  branch?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CommitRequest = await request.json()
    const { action, token, owner, repo, message, files, branch = "main" } = body

    // Validate required fields
    if (!token || !owner || !repo) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    }

    switch (action) {
      case "connect":
        // Test GitHub connection and fetch repositories
        const userResponse = await fetch("https://api.github.com/user", { headers })
        if (!userResponse.ok) {
          return NextResponse.json({ error: "Invalid GitHub token" }, { status: 401 })
        }
        const userData = await userResponse.json()

        // Fetch user repositories
        const reposResponse = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", { headers })
        const repositories = reposResponse.ok ? await reposResponse.json() : []

        return NextResponse.json({
          success: true,
          user: userData,
          repositories: repositories,
          message: "Successfully connected to GitHub",
        })

      case "create-repo":
        // Create a new repository
        const createRepoResponse = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: repo,
            description: "MASE Platform - AI-powered development assistant",
            private: false,
            auto_init: true,
            gitignore_template: "Node",
            license_template: "mit",
          }),
        })

        if (!createRepoResponse.ok) {
          const error = await createRepoResponse.json()
          return NextResponse.json({ error: error.message }, { status: createRepoResponse.status })
        }

        const repoData = await createRepoResponse.json()
        return NextResponse.json({
          success: true,
          repository: repoData,
          message: "Repository created successfully",
        })

      case "commit":
        if (!message || !files || files.length === 0) {
          return NextResponse.json({ error: "Commit message and files are required" }, { status: 400 })
        }

        // Get the current repository state
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
        if (!repoResponse.ok) {
          return NextResponse.json({ error: "Repository not found" }, { status: 404 })
        }

        // Get the latest commit SHA
        const branchResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
          headers,
        })
        if (!branchResponse.ok) {
          return NextResponse.json({ error: "Branch not found" }, { status: 404 })
        }

        const branchData = await branchResponse.json()
        const latestCommitSha = branchData.object.sha

        // Get the tree SHA from the latest commit
        const commitResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
          {
            headers,
          },
        )
        const commitData = await commitResponse.json()
        const baseTreeSha = commitData.tree.sha

        // Create blobs for each file
        const blobs = []
        for (const filePath of files) {
          const content = getFileContent(filePath)
          const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              content: Buffer.from(content).toString("base64"),
              encoding: "base64",
            }),
          })
          const blobData = await blobResponse.json()
          blobs.push({
            path: filePath,
            mode: "100644",
            type: "blob",
            sha: blobData.sha,
          })
        }

        // Create a new tree
        const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: blobs,
          }),
        })
        const treeData = await treeResponse.json()

        // Create a new commit
        const newCommitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            tree: treeData.sha,
            parents: [latestCommitSha],
          }),
        })
        const newCommitData = await newCommitResponse.json()

        // Update the branch reference
        const updateRefResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              sha: newCommitData.sha,
            }),
          },
        )

        if (!updateRefResponse.ok) {
          return NextResponse.json({ error: "Failed to update branch" }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: "Files committed successfully",
          commit_sha: newCommitData.sha,
          commit_url: newCommitData.html_url,
        })

      case "setup-webhook":
        // Setup webhook for deployment
        const webhookResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: "web",
            active: true,
            events: ["push", "pull_request"],
            config: {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
              content_type: "json",
              secret: process.env.GITHUB_WEBHOOK_SECRET,
            },
          }),
        })

        if (!webhookResponse.ok) {
          const error = await webhookResponse.json()
          return NextResponse.json({ error: error.message }, { status: webhookResponse.status })
        }

        const webhookData = await webhookResponse.json()
        return NextResponse.json({
          success: true,
          webhook: webhookData,
          message: "Webhook configured successfully",
        })

      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
    }
  } catch (error) {
    console.error("GitHub assistant error:", error)
    return NextResponse.json({ error: "GitHub operation failed" }, { status: 500 })
  }
}

function getFileContent(filePath: string): string {
  // Generate appropriate content based on file type
  const fileName = filePath.split("/").pop() || ""
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "tsx":
    case "ts":
      return `// Generated by MASE AI Platform
// File: ${filePath}
// Generated at: ${new Date().toISOString()}

import React from 'react'

interface Props {
  title?: string
  children?: React.ReactNode
}

export default function ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "")}Component({ 
  title = "Generated Component", 
  children 
}: Props) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 mb-4">
        This component was automatically generated by MASE AI Platform.
      </p>
      {children}
    </div>
  )
}
`

    case "jsx":
    case "js":
      return `// Generated by MASE AI Platform
// File: ${filePath}
// Generated at: ${new Date().toISOString()}

import React from 'react'

export default function ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "")}Component({ 
  title = "Generated Component", 
  children 
}) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 mb-4">
        This component was automatically generated by MASE AI Platform.
      </p>
      {children}
    </div>
  )
}
`

    case "json":
      if (fileName === "package.json") {
        return JSON.stringify(
          {
            name: "mase-generated-project",
            version: "1.0.0",
            description: "Project generated by MASE AI Platform",
            main: "index.js",
            scripts: {
              start: "node index.js",
              dev: "nodemon index.js",
              build: "npm run build",
              test: "jest",
            },
            dependencies: {
              react: "^18.2.0",
              "react-dom": "^18.2.0",
            },
            devDependencies: {
              "@types/react": "^18.2.0",
              "@types/react-dom": "^18.2.0",
              typescript: "^5.0.0",
            },
            keywords: ["mase", "ai", "generated"],
            author: "MASE AI Platform",
            license: "MIT",
            generatedBy: "MASE AI",
            generatedAt: new Date().toISOString(),
          },
          null,
          2,
        )
      }
      return JSON.stringify(
        {
          name: fileName.replace(".json", ""),
          description: "Generated by MASE AI Platform",
          generatedBy: "MASE AI",
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      )

    case "md":
      return `# ${fileName.replace(".md", "").replace(/[^a-zA-Z0-9]/g, " ")}

Generated by MASE AI Platform at ${new Date().toISOString()}

## Overview

This project was automatically generated and deployed by the MASE AI platform.

## Features

- ✨ AI-powered screen reading and automation
- 🚀 Automated code generation and deployment
- 🔗 GitHub integration with automated commits
- 📊 Real-time performance monitoring
- 🛡️ Built-in security scanning and fixes

## Getting Started

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Start development server: \`npm run dev\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for automatic deployment to:
- Vercel (Frontend)
- Render.com (Backend)
- Railway (Database)

## Support

For support and documentation, visit the [MASE Platform](https://mase-platform.com).

---

*Generated by MASE AI Platform - Automating tedious development tasks*
`

    case "py":
      return `#!/usr/bin/env python3
"""
Generated by MASE AI Platform
File: ${filePath}
Generated at: ${new Date().toISOString()}
"""

import os
import sys
from datetime import datetime
from typing import Optional, Dict, Any

class ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "")}:
    """
    Auto-generated class by MASE AI Platform
    """
    
    def __init__(self, name: str = "MASE Generated"):
        self.name = name
        self.created_at = datetime.now()
        self.version = "1.0.0"
    
    def get_info(self) -> Dict[str, Any]:
        """Get information about this generated component"""
        return {
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "version": self.version,
            "generated_by": "MASE AI Platform"
        }
    
    def run(self) -> None:
        """Main execution method"""
        print(f"Running {self.name}")
        print(f"Generated by MASE AI Platform at {self.created_at}")

if __name__ == "__main__":
    component = ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "")}()
    component.run()
`

    case "css":
      return `/* Generated by MASE AI Platform */
/* File: ${filePath} */
/* Generated at: ${new Date().toISOString()} */

:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --background-color: #ffffff;
  --text-color: #1f2937;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #2563eb;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

/* Generated by MASE AI Platform */
`

    case "html":
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated by MASE AI Platform</title>
    <meta name="description" content="Auto-generated HTML file by MASE AI Platform">
    <meta name="generator" content="MASE AI Platform">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 { color: #4a5568; margin-bottom: 1rem; }
        .meta { color: #718096; font-size: 0.9rem; margin-bottom: 2rem; }
        .feature { margin: 1rem 0; padding: 1rem; background: #f7fafc; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Generated by MASE AI Platform</h1>
        <div class="meta">
            File: ${filePath}<br>
            Generated: ${new Date().toISOString()}
        </div>
        
        <div class="feature">
            <h2>✨ AI-Powered Development</h2>
            <p>This HTML file was automatically generated by the MASE AI Platform, demonstrating automated code generation capabilities.</p>
        </div>
        
        <div class="feature">
            <h2>🔧 Features</h2>
            <ul>
                <li>Automated code generation</li>
                <li>GitHub integration</li>
                <li>Deployment automation</li>
                <li>Real-time monitoring</li>
            </ul>
        </div>
        
        <div class="feature">
            <h2>🌐 Ready for Production</h2>
            <p>This generated code is production-ready and can be deployed immediately to your preferred hosting platform.</p>
        </div>
    </div>
</body>
</html>
`

    default:
      return `# Generated by MASE AI Platform
# File: ${filePath}
# Generated at: ${new Date().toISOString()}

# This file was automatically generated and committed by MASE AI Platform
# 
# MASE (Multi-Agent Software Engineering) Platform provides:
# - AI-powered screen reading and automation
# - Automated code generation and deployment
# - GitHub integration with automated commits
# - Real-time performance monitoring
# - Built-in security scanning and fixes
#
# For more information, visit: https://mase-platform.com

echo "Generated by MASE AI Platform"
echo "File: ${filePath}"
echo "Generated at: ${new Date().toISOString()}"
`
  }
}
