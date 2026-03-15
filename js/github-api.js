/**
 * GitHub API wrapper for Sison Store Dashboard
 * Handles all interactions with GitHub REST API
 */

class GitHubAPI {
  constructor() {
    this.baseUrl = CONFIG.github.apiBaseUrl;
    this.username = localStorage.getItem(CONFIG.storage.githubUsername);
    this.repo = localStorage.getItem(CONFIG.storage.githubRepo);
    this.token = localStorage.getItem(CONFIG.storage.githubToken);
    this.branch = CONFIG.github.branch;
  }

  /**
   * Check if GitHub is configured
   */
  isConfigured() {
    return !!(this.username && this.repo && this.token);
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': CONFIG.github.apiVersion
    };
  }

  /**
   * Fetch file from GitHub
   */
  async fetchFile(path) {
    if (!this.isConfigured()) {
      throw new Error('GitHub not configured. Please complete setup.');
    }

    const url = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${path}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeader()
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Decode base64 content
    const content = atob(data.content);

    return {
      content: JSON.parse(content),
      sha: data.sha
    };
  }

  /**
   * Update file on GitHub
   */
  async updateFile(path, content, message, sha = null) {
    if (!this.isConfigured()) {
      throw new Error('GitHub not configured. Please complete setup.');
    }

    // If SHA not provided, fetch it
    if (!sha) {
      try {
        const fileData = await this.fetchFile(path);
        sha = fileData.sha;
      } catch (error) {
        // File doesn't exist, that's okay for new files
        console.log(`File ${path} doesn't exist, creating new file`);
      }
    }

    const url = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${path}`;

    // Encode content to base64
    const encodedContent = btoa(JSON.stringify(content, null, 2));

    const body = {
      message: message,
      content: encodedContent,
      branch: this.branch
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
    }

    return await response.json();
  }

  /**
   * Get file SHA without fetching full content
   */
  async getFileSHA(path) {
    if (!this.isConfigured()) {
      throw new Error('GitHub not configured. Please complete setup.');
    }

    try {
      const url = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${path}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      return null;
    }
  }

  /**
   * Test GitHub connection
   */
  async testConnection() {
    try {
      const url = `${this.baseUrl}/repos/${this.username}/${this.repo}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error(`Unable to access repository. Status: ${response.status}`);
      }

      return true;
    } catch (error) {
      throw new Error(`GitHub connection failed: ${error.message}`);
    }
  }

  /**
   * Create commit message for data entry
   */
  static createCommitMessage(type, data) {
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'store_sales':
        return `feat(store-sales): Add transaction for ${data.date}\n\n- Total Profit: ${Utils.formatCurrency(data.totalProfit)}\n\nAuto-committed via dashboard at ${timestamp}`;

      case 'piso_wifi':
        return `feat(piso-wifi): Add ${data.month} ${data.year} revenue\n\n- Revenue: ${Utils.formatCurrency(data.revenue)}\n\nAuto-committed via dashboard at ${timestamp}`;

      case 'printer':
        return `feat(printer): Add ${data.month} ${data.year} income\n\n- Income: ${Utils.formatCurrency(data.income)}\n\nAuto-committed via dashboard at ${timestamp}`;

      default:
        return `chore: Update data - ${timestamp}`;
    }
  }
}

// Create global instance
const githubAPI = new GitHubAPI();
