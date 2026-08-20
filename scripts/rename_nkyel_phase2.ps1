$ErrorActionPreference = 'SilentlyContinue'
$count = 0
$N = [char]0x00D1  # Ñ

# ── Phase 2: Type renames, lowercase gaboma, function names ──
# These patterns are safe to replace globally in .ts/.tsx files

$replacements = @(
    # Type renames (models.ts + all consumers)
    @('GabomaModel',        'NkyelModel'),
    @('GabomaMessage',      'NkyelMessage'),
    @('GabomaSource',       'NkyelSource'),
    @('GabomaRendu',        'NkyelRendu'),
    @('GabomaConversation', 'NkyelConversation'),
    @('GabomaUser',         'NkyelUser'),
    
    # Hook/function renames
    @('useGabomaShortcuts', 'useNkyelShortcuts'),
    @('useGabomaSeer',      'useNkyelVision'),
    @('UseGabomaSeerOptions',  'UseNkyelVisionOptions'),
    @('UseGabomaSeerReturn',   'UseNkyelVisionReturn'),
    @('gabomaEvents',       'nkyelEvents'),
    @('gabomaFetchAdapter', 'nkyelFetchAdapter'),
    @('gabomaRendu',        'nkyelRendu'),
    @('GabomaMarkdown',     'NkyelMarkdown'),
    
    # Redis key prefixes
    @('gaboma:',            'nkyel:'),
    
    # BetterStack service name
    @('gabomagpt-web',      'nkyel-web'),
    
    # IndexedDB
    @('GabomaDraftsDB',     'NkyelDraftsDB'),
    
    # E-billing metadata
    @('gaboma_user_id',     'nkyel_user_id'),
    @('gaboma_plan_id',     'nkyel_plan_id'),
    @("Abonnement ${N}kyel AI", "Abonnement ${N}kyel AI"),
    
    # Tab sync channel
    @('gaboma_ai_sync',     'nkyel_ai_sync'),
    
    # Component names in comments/JSX (the files still named Gaboma*)
    @('GabomaChatScreen',   'NkyelChatScreen'),
    @('GabomaSidebar',      'NkyelSidebar'),
    @('GabomaAILogo',       'NkyelAILogo'),
    @('GabomaIcons',        'NkyelIcons'),
    
    # PostHog comment
    @("${N}kyel AI-specific events", "${N}kyel AI-specific events"),
    @('Gaboma-specific events', "${N}kyel-specific events"),
    @('Gaboma logger',      "${N}kyel logger")
)

# Process all TS/TSX files in ZION-CORE-V2/src
Get-ChildItem -Path 'f:\Nkyel-AI-2026\ZION-CORE-V2\src' -Recurse -Include '*.ts','*.tsx' | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $original = $content
    
    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($_.FullName, $content)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

# Also process config files at root level
$rootConfigs = @(
    'f:\Nkyel-AI-2026\ZION-CORE-V2\sentry.client.config.ts',
    'f:\Nkyel-AI-2026\ZION-CORE-V2\next.config.ts',
    'f:\Nkyel-AI-2026\ZION-CORE-V2\drizzle.config.ts'
)
foreach ($file in $rootConfigs) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file)
        $original = $content
        foreach ($pair in $replacements) {
            $content = $content.Replace($pair[0], $pair[1])
        }
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file, $content)
            Write-Output "UPDATED: $file"
            $count++
        }
    }
}

# Process design tokens JSON
$tokensFile = 'f:\Nkyel-AI-2026\ZION-CORE-V2\src\design-tokens\tokens.json'
if (Test-Path $tokensFile) {
    $content = [System.IO.File]::ReadAllText($tokensFile)
    $original = $content
    $content = $content.Replace('Gaboma', "${N}kyel").Replace('gaboma', 'nkyel')
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($tokensFile, $content)
        Write-Output "UPDATED: $tokensFile"
        $count++
    }
}

# Process backend Python files for remaining lowercase gaboma refs (excluding backend/app/)
Get-ChildItem -Path 'f:\Nkyel-AI-2026\backend' -Recurse -Include '*.py' -Exclude 'backend\app\*' | Where-Object { $_.FullName -notlike '*\backend\app\*' } | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $original = $content
    $content = $content.Replace('gabomagpt', 'nkyel').Replace('gabomaseer', 'nkyelvision').Replace('GabomaMode', 'NkyelMode').Replace('GabomaState', 'NkyelLegacyState')
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($_.FullName, $content)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

# Process messages JSON files
Get-ChildItem -Path 'f:\Nkyel-AI-2026\ZION-CORE-V2\messages' -Include '*.json' -File | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $original = $content
    $content = $content.Replace('GabomaGPT', "${N}kyel AI").Replace('Gaboma', "${N}kyel").Replace('gaboma', 'nkyel')
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($_.FullName, $content)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

# Process scripts
$scriptFile = 'f:\Nkyel-AI-2026\scripts\download_models.py'
if (Test-Path $scriptFile) {
    $content = [System.IO.File]::ReadAllText($scriptFile)
    $original = $content
    $content = $content.Replace('gaboma', 'nkyel').Replace('Gaboma', "${N}kyel")
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($scriptFile, $content)
        Write-Output "UPDATED: $scriptFile"
        $count++
    }
}

Write-Output "`nPhase 2 total files updated: $count"
