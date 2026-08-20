$ErrorActionPreference = 'SilentlyContinue'
$count = 0

# Frontend src files
Get-ChildItem -Path 'f:\Nkyel-AI-2026\ZION-CORE-V2\src' -Recurse -Include '*.ts','*.tsx' | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match 'GabomaGPT|GabomaAI|Gaboma AI') {
        $newContent = $content -replace 'GabomaGPT', ([char]0x00D1 + 'kyel AI') -replace 'GabomaAI', ([char]0x00D1 + 'kyel AI') -replace 'Gaboma AI', ([char]0x00D1 + 'kyel AI')
        [System.IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

# Frontend config files  
$configFiles = @(
    'f:\Nkyel-AI-2026\ZION-CORE-V2\sentry.client.config.ts',
    'f:\Nkyel-AI-2026\ZION-CORE-V2\next.config.ts',
    'f:\Nkyel-AI-2026\ZION-CORE-V2\drizzle.config.ts'
)
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file)
        if ($content -match 'GabomaGPT|GabomaAI|Gaboma AI') {
            $newContent = $content -replace 'GabomaGPT', ([char]0x00D1 + 'kyel AI') -replace 'GabomaAI', ([char]0x00D1 + 'kyel AI') -replace 'Gaboma AI', ([char]0x00D1 + 'kyel AI')
            [System.IO.File]::WriteAllText($file, $newContent)
            Write-Output "UPDATED: $file"
            $count++
        }
    }
}

# Messages JSON files
Get-ChildItem -Path 'f:\Nkyel-AI-2026\ZION-CORE-V2\messages' -Include '*.json' -File | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match 'GabomaGPT|GabomaAI|Gaboma AI|Gaboma') {
        $newContent = $content -replace 'GabomaGPT', ([char]0x00D1 + 'kyel AI') -replace 'GabomaAI', ([char]0x00D1 + 'kyel AI') -replace 'Gaboma AI', ([char]0x00D1 + 'kyel AI') -replace 'Gaboma', ([char]0x00D1 + 'kyel')
        [System.IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

# Backend remaining files (rust)
Get-ChildItem -Path 'f:\Nkyel-AI-2026\backend\rust\src' -Recurse -Include '*.rs' | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match 'GabomaGPT|GabomaAI|Gaboma AI|gaboma') {
        $newContent = $content -replace 'GabomaGPT', ([char]0x00D1 + 'kyel AI') -replace 'GabomaAI', ([char]0x00D1 + 'kyel AI') -replace 'Gaboma AI', ([char]0x00D1 + 'kyel AI') -replace 'gaboma_', 'nkyel_'
        [System.IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

Write-Output "`nTotal files updated: $count"
