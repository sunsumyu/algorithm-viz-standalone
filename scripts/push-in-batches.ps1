while ($true) {
    $commits = @(git rev-list --reverse origin/master..master)
    $remaining = $commits.Count
    if ($remaining -eq 0) {
        Write-Host "All commits have been pushed successfully!" -ForegroundColor Green
        break
    }
    Write-Host "Remaining commits to push: $remaining"

    $step = 5
    $targetIdx = [Math]::Min($step - 1, $remaining - 1)
    $targetCommit = $commits[$targetIdx]
    
    Write-Host "Attempting push to commit $targetCommit (+$([Math]::Min($step, $remaining)))..."
    git push origin "$($targetCommit):refs/heads/master"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Batch push failed. Trying single commit: $($commits[0])..."
        $retry = 0
        while ($retry -lt 3) {
            git push origin "$($commits[0]):refs/heads/master"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Single commit pushed successfully." -ForegroundColor Green
                break
            }
            $retry++
            Start-Sleep -Seconds 2
        }
        if ($retry -ge 3) {
            Write-Error "Failed to push even single commit after 3 retries."
            break
        }
    } else {
        Write-Host "Batch pushed successfully." -ForegroundColor Green
    }
}
