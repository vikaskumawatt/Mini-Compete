#!/bin/bash

# Mini Compete Setup Script
# This script automates the initial setup process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_header() {
    echo -e "\n${BLUE}==================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup process
main() {
    print_header "Mini Compete - Setup Script"
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    if ! command_exists yarn; then
        print_error "Yarn is not installed. Please install Yarn first."
        exit 1
    fi
    print_success "Yarn found: $(yarn --version)"
    
    if ! command_exists docker; then
        print_warning "Docker not found. You'll need Docker to run the database."
    else
        print_success "Docker found: $(docker --version)"
    fi
    
    if ! command_exists docker-compose; then
        print_warning "Docker Compose not found. You'll need it for infrastructure."
    else
        print_success "Docker Compose found: $(docker-compose --version)"
    fi
    
    echo ""
    
    # Ask user for setup type
    print_info "How would you like to set up Mini Compete?"
    echo "1) Full Docker setup (recommended for quick start)"
    echo "2) Local development setup"
    read -p "Enter your choice (1 or 2): " setup_choice
    
    case $setup_choice in
        1)
            setup_docker
            ;;
        2)
            setup_local
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

setup_docker() {
    print_header "Setting up with Docker"
    
    # Copy environment files
    print_info "Setting up environment files..."
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file"
    else
        print_warning ".env file already exists, skipping"
    fi
    
    if [ ! -f apps/backend/.env ]; then
        cp apps/backend/.env.example apps/backend/.env
        print_success "Created apps/backend/.env file"
    else
        print_warning "apps/backend/.env file already exists, skipping"
    fi
    
    # Generate secure JWT secret
    print_info "Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" apps/backend/.env
    rm -f apps/backend/.env.bak
    print_success "JWT secret generated"
    
    # Start Docker services
    print_info "Starting Docker services..."
    docker-compose up -d
    
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Run migrations
    print_info "Running database migrations..."
    docker-compose exec -T backend yarn prisma migrate deploy
    print_success "Migrations completed"
    
    # Seed database
    print_info "Seeding database..."
    docker-compose exec -T backend yarn prisma db seed
    print_success "Database seeded"
    
    print_header "Setup Complete!"
    print_success "Mini Compete is now running!"
    echo ""
    print_info "Access the application:"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:3001"
    echo "  • API Docs:  http://localhost:3001/api/docs"
    echo ""
    print_info "Test credentials:"
    echo "  Participant: participant1@minicompete.com / password123"
    echo "  Organizer:   organizer1@minicompete.com / password123"
    echo ""
    print_info "Useful commands:"
    echo "  • View logs:     docker-compose logs -f"
    echo "  • Stop:          docker-compose down"
    echo "  • Restart:       docker-compose restart"
    echo "  • Database GUI:  make studio"
}

setup_local() {
    print_header "Setting up for local development"
    
    # Install dependencies
    print_info "Installing dependencies..."
    yarn install
    print_success "Dependencies installed"
    
    # Copy environment files
    print_info "Setting up environment files..."
    if [ ! -f apps/backend/.env ]; then
        cp apps/backend/.env.example apps/backend/.env
        print_success "Created apps/backend/.env file"
    else
        print_warning "apps/backend/.env file already exists, skipping"
    fi
    
    # Generate secure JWT secret
    print_info "Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" apps/backend/.env
    rm -f apps/backend/.env.bak
    print_success "JWT secret generated"
    
    # Start infrastructure
    print_info "Starting PostgreSQL and Redis..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_info "Waiting for database to be ready..."
    sleep 5
    
    # Generate Prisma Client
    print_info "Generating Prisma Client..."
    yarn workspace @mini-compete/backend prisma generate
    print_success "Prisma Client generated"
    
    # Run migrations
    print_info "Running database migrations..."
    yarn workspace @mini-compete/backend prisma migrate dev
    print_success "Migrations completed"
    
    # Seed database
    print_info "Seeding database..."
    yarn workspace @mini-compete/backend prisma db seed
    print_success "Database seeded"
    
    print_header "Setup Complete!"
    print_success "Local development environment ready!"
    echo ""
    print_info "To start development servers, run these in separate terminals:"
    echo "  Terminal 1: yarn workspace @mini-compete/backend dev"
    echo "  Terminal 2: yarn workspace @mini-compete/backend worker"
    echo "  Terminal 3: yarn workspace @mini-compete/frontend dev"
    echo ""
    print_info "Or use Make:"
    echo "  make dev"
    echo ""
    print_info "Access points:"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:3001"
    echo "  • API Docs:  http://localhost:3001/api/docs"
    echo ""
    print_info "Test credentials:"
    echo "  Participant: participant1@minicompete.com / password123"
    echo "  Organizer:   organizer1@minicompete.com / password123"
    echo ""
    print_info "Useful commands:"
    echo "  • Prisma Studio: make studio"
    echo "  • View logs:     docker-compose -f docker-compose.dev.yml logs -f"
    echo "  • Reset DB:      make reset"
}

# Run main function
main