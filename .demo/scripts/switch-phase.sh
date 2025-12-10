#!/usr/bin/env bash
set -euo pipefail

# switch-phase.sh - Switch to a phase tag and reset the current branch to that tag's commit
# Usage: ./switch-phase.sh [OPTIONS] [tag-name|phase-number]
#   If tag-name is provided, switches to that tag
#   If phase-number is provided, switches to phase-<number>-*
#   If no argument provided, lists available phase tags
#
# Options:
#   -y, --yes    Skip confirmation prompts (for automation)

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
info() { echo -e "${BLUE}ℹ${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*"; }

# Function to list all phase tags
list_tags() {
    info "Available phase tags:"
    git tag -l 'phase-*' --sort=-version:refname | while read -r tag; do
        # Get tag date and subject
        local commit_hash=$(git rev-list -n 1 "$tag")
        local tag_date=$(git log -1 --format=%ai "$commit_hash" | cut -d' ' -f1)
        local subject=$(git tag -l --format='%(contents:subject)' "$tag" | head -n1)
        printf "  ${GREEN}%-30s${NC} %s  %s\n" "$tag" "$tag_date" "$subject"
    done
}

# Function to find tag by number
find_tag_by_number() {
    local num=$1
    git tag -l "phase-${num}-*" | head -n1
}

# Main script
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not a git repository"
        exit 1
    fi

    # Parse options
    local auto_yes=false
    while [[ $# -gt 0 ]]; do
        case $1 in
            -y|--yes)
                auto_yes=true
                shift
                ;;
            -*)
                error "Unknown option: $1"
                exit 1
                ;;
            *)
                break
                ;;
        esac
    done

    # If no argument, list tags and exit
    if [ $# -eq 0 ]; then
        list_tags
        echo
        info "Usage: $0 [OPTIONS] <tag-name|phase-number>"
        info "  Example: $0 phase-3-installed-spec-kit"
        info "  Example: $0 3"
        info "  Example: $0 -y 3  (skip confirmations)"
        exit 0
    fi

    local target=$1
    local tag_name=""

    # Check if argument is a number
    if [[ "$target" =~ ^[0-9]+$ ]]; then
        tag_name=$(find_tag_by_number "$target")
        if [ -z "$tag_name" ]; then
            error "No tag found for phase number: $target"
            echo
            list_tags
            exit 1
        fi
        info "Found tag: $tag_name"
    else
        tag_name=$target
        # Verify tag exists
        if ! git rev-parse "$tag_name" >/dev/null 2>&1; then
            error "Tag not found: $tag_name"
            echo
            list_tags
            exit 1
        fi
    fi

    # Get current branch name
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Check for uncommitted changes or untracked files
    if [ -n "$(git status --porcelain)" ]; then
        warn "You have uncommitted changes or untracked files!"
        warn "These will be PERMANENTLY LOST if you continue."
        
        if [ "$auto_yes" = true ]; then
            info "Cleaning up changes..."
            git reset --hard
            git clean -fd
            success "Workspace cleaned"
        else
            read -p "Do you want to discard all changes and untracked files? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                info "Cleaning up changes..."
                git reset --hard
                git clean -fd
                success "Workspace cleaned"
            else
                error "Aborting to preserve changes"
                exit 1
            fi
        fi
    fi

    # Get the commit hash for the tag
    tag_commit=$(git rev-list -n 1 "$tag_name")
    
    info "Switching to tag: $tag_name"
    info "Current branch: $current_branch"
    info "Target commit: ${tag_commit:0:8}"
    
    # Confirm action
    if [ "$auto_yes" = false ]; then
        warn "This will reset branch '$current_branch' to tag '$tag_name'"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Aborted"
            exit 0
        fi
    fi

    # Reset current branch to the tag's commit
    info "Resetting $current_branch to $tag_name..."
    git reset --hard "$tag_name"
    
    success "Successfully reset $current_branch to $tag_name"
    
    # Show current status
    echo
    info "Current HEAD:"
    git log -1 --oneline --decorate
}

main "$@"
