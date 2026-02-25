# commit.ps1 - Helper script for committing code

param (
    [string]$Message = "chore: update code"
)

# 1. Check if git repository
if (-not (Test-Path .git)) {
    # It might be in a parent directory, check with git rev-parse
    $gitDir = git rev-parse --git-dir 2>$null
    if (-not $gitDir) {
        Write-Error "Not a git repository."
        exit 1
    }
}

# 2. Add all changes
Write-Host "Staging changes..."
git add -A

# 3. Commit
Write-Host "Committing with message: $Message"
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Commit failed or there were no changes to commit."
    exit 1
}

Write-Host "Successfully committed code!"
