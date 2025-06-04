#!/bin/bash

# MCP Server Setup Script for SQL Zero-to-Hero Module
# This script helps configure and test MCP servers for the training module

echo "🚀 Setting up MCP Servers for SQL Zero-to-Hero Module"
echo "======================================================"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if npx is available  
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please update your Node.js installation."
    exit 1
fi

echo "✅ Node.js and npm are available"

# List installed MCP servers
echo ""
echo "📦 Checking installed MCP servers..."
echo "======================================"

# Check each MCP server
servers=(
    "@benborla29/mcp-server-mysql:MySQL Database"
    "@modelcontextprotocol/server-github:GitHub Integration" 
    "@devstefancho/mermaid-mcp:Mermaid Diagrams"
    "@modelcontextprotocol/server-filesystem:File System Access"
    "postgres-mcp:PostgreSQL Database"
)

for server_info in "${servers[@]}"; do
    IFS=':' read -r server_name description <<< "$server_info"
    if npm list -g "$server_name" &> /dev/null; then
        echo "✅ $description ($server_name)"
    else
        echo "❌ $description ($server_name) - Not installed"
    fi
done

echo ""
echo "⚙️  MCP Configuration"
echo "===================="

# Check if .mcp-config.json exists
if [ -f ".mcp-config.json" ]; then
    echo "✅ MCP configuration file found: .mcp-config.json"
else
    echo "❌ MCP configuration file not found"
fi

echo ""
echo "🗄️  Database Configuration"
echo "=========================="

# Check if database setup files exist
if [ -f "sql-module/setup/quick-start-database.sql" ]; then
    echo "✅ Database setup SQL found"
else
    echo "❌ Database setup SQL not found"
fi

if [ -f "sql-module/setup/database-connection.js" ]; then
    echo "✅ Database connection helper found"
else
    echo "❌ Database connection helper not found"
fi

echo ""
echo "🔧 Next Steps"
echo "============="
echo "1. Install missing MCP servers (if any) using:"
echo "   npm install -g <server-name>"
echo ""
echo "2. Configure database credentials in .env file:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=3306"
echo "   DB_USER=root" 
echo "   DB_PASSWORD=your_password"
echo "   DB_NAME=sql_training"
echo ""
echo "3. Set up GitHub token in .mcp-config.json:"
echo "   Replace 'your_github_token_here' with your actual token"
echo ""
echo "4. Test MCP servers using:"
echo "   npx @modelcontextprotocol/inspector"
echo ""
echo "5. Initialize the database:"
echo "   mysql -u root -p < sql-module/setup/quick-start-database.sql"
echo ""

# Test basic MCP functionality
echo "🧪 Testing MCP Server Availability"
echo "==================================="

test_servers=(
    "@benborla29/mcp-server-mysql"
    "@devstefancho/mermaid-mcp" 
    "@modelcontextprotocol/server-github"
    "@modelcontextprotocol/server-filesystem"
)

for server in "${test_servers[@]}"; do
    echo -n "Testing $server... "
    if npx "$server" --help &> /dev/null; then
        echo "✅ Available"
    else
        echo "❓ May not respond to --help (this is normal for some servers)"
    fi
done

echo ""
echo "✨ Setup complete! You can now use MCP servers with Claude Code."
echo "📚 Refer to MCP_SERVER_RECOMMENDATIONS.md for detailed usage instructions."