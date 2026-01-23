#!/bin/bash

# AutoIntegrate Setup Script
# This script helps you configure and set up the AutoIntegrate project

set -e

echo "🚀 AutoIntegrate Setup"
echo "====================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation. Continuing with other setup steps..."
    else
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your credentials${NC}"
    fi
else
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your credentials${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "🔍 Checking for PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
    
    # Check if PostgreSQL is running
    if pg_isready &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
        
        # Ask if user wants to create database
        read -p "Do you want to create the 'autointegrate' database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if createdb autointegrate 2>/dev/null; then
                echo -e "${GREEN}✅ Database 'autointegrate' created${NC}"
            else
                echo -e "${YELLOW}⚠️  Database might already exist or creation failed${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
        echo "   Start it with: brew services start postgresql"
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed${NC}"
    echo "   Install it with: brew install postgresql@15"
fi

echo ""
echo "📝 Configuration checklist:"
echo ""
echo "Please ensure you have configured the following in your .env file:"
echo ""
echo "  Required:"
echo "    [ ] DATABASE_URL - PostgreSQL connection string"
echo "    [ ] GITHUB_TOKEN - Get from https://github.com/settings/tokens"
echo "    [ ] OPENAI_API_KEY - Get from https://platform.openai.com/api-keys"
echo "    [ ] SESSION_SECRET - Generate with: openssl rand -base64 32"
echo ""
echo "  Optional (for specific features):"
echo "    [ ] STRIPE_SECRET_KEY - For billing"
echo "    [ ] CLERK_SECRET_KEY - For authentication"
echo ""

# Check if DATABASE_URL is set in .env
if grep -q "DATABASE_URL=postgresql://" .env 2>/dev/null && ! grep -q "DATABASE_URL=postgresql://user:password@localhost" .env; then
    echo ""
    read -p "Do you want to run database migrations now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if npm run db:push; then
            echo -e "${GREEN}✅ Database migrations completed${NC}"
        else
            echo -e "${RED}❌ Database migration failed${NC}"
            echo "   Make sure your DATABASE_URL is correct in .env"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Please configure DATABASE_URL in .env before running migrations${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "  1. Edit .env with your actual credentials"
echo "  2. Run database migrations: npm run db:push"
echo "  3. Start the development server: npm run dev"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:5000"
echo "  - API: http://localhost:3001"
echo ""
echo "For detailed setup instructions, see:"
echo "  - SETUP.md"
echo "  - CONFIG_CHECKLIST.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
