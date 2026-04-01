#!/usr/bin/env python3
"""
GitHub Webhook Setup Script for MASE Platform
Configures webhooks for automated deployment triggers
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional

class GitHubWebhookManager:
    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    
    def test_connection(self) -> bool:
        """Test GitHub API connection"""
        try:
            response = requests.get(f"{self.base_url}/user", headers=self.headers)
            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Connected to GitHub as: {user_data['login']}")
                return True
            else:
                print(f"❌ GitHub connection failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def create_webhook(self, webhook_url: str, secret: str, events: list = None) -> Optional[Dict[str, Any]]:
        """Create a new webhook"""
        if events is None:
            events = ["push", "pull_request", "release"]
        
        webhook_config = {
            "name": "web",
            "active": True,
            "events": events,
            "config": {
                "url": webhook_url,
                "content_type": "json",
                "secret": secret,
                "insecure_ssl": "0"
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/repos/{self.owner}/{self.repo}/hooks",
                headers=self.headers,
                json=webhook_config
            )
            
            if response.status_code == 201:
                webhook_data = response.json()
                print(f"✅ Webhook created successfully: {webhook_data['id']}")
                return webhook_data
            else:
                error_data = response.json()
                print(f"❌ Failed to create webhook: {error_data.get('message', 'Unknown error')}")
                return None
        except Exception as e:
            print(f"❌ Webhook creation error: {e}")
            return None
    
    def list_webhooks(self) -> list:
        """List existing webhooks"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{self.owner}/{self.repo}/hooks",
                headers=self.headers
            )
            
            if response.status_code == 200:
                webhooks = response.json()
                print(f"📋 Found {len(webhooks)} existing webhooks:")
                for webhook in webhooks:
                    print(f"  - ID: {webhook['id']}, URL: {webhook['config']['url']}")
                return webhooks
            else:
                print(f"❌ Failed to list webhooks: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error listing webhooks: {e}")
            return []
    
    def delete_webhook(self, webhook_id: int) -> bool:
        """Delete a webhook"""
        try:
            response = requests.delete(
                f"{self.base_url}/repos/{self.owner}/{self.repo}/hooks/{webhook_id}",
                headers=self.headers
            )
            
            if response.status_code == 204:
                print(f"✅ Webhook {webhook_id} deleted successfully")
                return True
            else:
                print(f"❌ Failed to delete webhook {webhook_id}: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error deleting webhook: {e}")
            return False
    
    def setup_deployment_webhooks(self) -> bool:
        """Setup webhooks for deployment automation"""
        print("🚀 Setting up deployment webhooks...")
        
        # Webhook configurations for different platforms
        webhooks_config = [
            {
                "name": "Render Deployment",
                "url": f"https://api.render.com/deploy/{os.getenv('RENDER_SERVICE_ID', 'your-service-id')}",
                "events": ["push"],
                "secret": os.getenv('RENDER_WEBHOOK_SECRET', 'render-secret')
            },
            {
                "name": "Vercel Deployment", 
                "url": f"https://api.vercel.com/v1/integrations/deploy/{os.getenv('VERCEL_PROJECT_ID', 'your-project-id')}",
                "events": ["push", "pull_request"],
                "secret": os.getenv('VERCEL_WEBHOOK_SECRET', 'vercel-secret')
            },
            {
                "name": "MASE Platform Notification",
                "url": f"{os.getenv('NEXT_PUBLIC_APP_URL', 'https://your-app.vercel.app')}/api/webhook/github",
                "events": ["push", "pull_request", "release", "issues"],
                "secret": os.getenv('GITHUB_WEBHOOK_SECRET', 'mase-webhook-secret')
            }
        ]
        
        success_count = 0
        for config in webhooks_config:
            print(f"\n📡 Creating webhook: {config['name']}")
            webhook = self.create_webhook(
                webhook_url=config['url'],
                secret=config['secret'],
                events=config['events']
            )
            if webhook:
                success_count += 1
        
        print(f"\n✅ Successfully created {success_count}/{len(webhooks_config)} webhooks")
        return success_count == len(webhooks_config)

def main():
    """Main function to setup GitHub webhooks"""
    print("🔧 MASE Platform - GitHub Webhook Setup")
    print("=" * 50)
    
    # Get configuration from environment variables
    github_token = os.getenv('GITHUB_TOKEN')
    repo_owner = os.getenv('GITHUB_OWNER', 'mase-877e501a')
    repo_name = os.getenv('GITHUB_REPO', 'v0-automating-tedious-tasks')
    
    if not github_token:
        print("❌ GITHUB_TOKEN environment variable is required")
        print("Please set your GitHub Personal Access Token:")
        print("export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx")
        sys.exit(1)
    
    # Initialize webhook manager
    webhook_manager = GitHubWebhookManager(github_token, repo_owner, repo_name)
    
    # Test connection
    if not webhook_manager.test_connection():
        sys.exit(1)
    
    # List existing webhooks
    print("\n📋 Checking existing webhooks...")
    existing_webhooks = webhook_manager.list_webhooks()
    
    # Setup deployment webhooks
    print("\n🚀 Setting up deployment automation...")
    if webhook_manager.setup_deployment_webhooks():
        print("\n🎉 All webhooks configured successfully!")
        print("\nNext steps:")
        print("1. Push code to trigger deployments")
        print("2. Monitor webhook deliveries in GitHub settings")
        print("3. Check deployment status in your platforms")
    else:
        print("\n⚠️  Some webhooks failed to configure")
        print("Please check your environment variables and try again")
        sys.exit(1)

if __name__ == "__main__":
    main()
