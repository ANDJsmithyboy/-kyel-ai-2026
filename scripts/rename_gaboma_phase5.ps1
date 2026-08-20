$ErrorActionPreference = 'SilentlyContinue'
$count = 0

$replacements = @(
    # Image Paths
    @('/gaboma-logo-transparent.svg', '/nkyel-logo-transparent.svg'),
    @('/gabomagpt-logo.jpeg', '/nkyelgpt-logo.jpeg'),
    @('/içone-gaboma-ai2026-mobile-vrai.png', '/içone-nkyel-ai2026-mobile-vrai.png'),
    @('/vrai-içone-pro-gaboma-ai2026.png', '/vrai-içone-pro-nkyel-ai2026.png'),
    @('/gaboma-logo.png', '/nkyel-logo.png'),
    @('/gaboma-icon.png', '/nkyel-icon.png'),
    
    # Imports for components that got renamed
    @('GabomaSidebar', 'NkyelSidebar'),
    @('GabomaChatScreen', 'NkyelChatScreen'),
    @('GabomaMarkdown', 'NkyelMarkdown'),
    @('GabomaAILogo', 'NkyelAILogo'),
    @('GabomaIcons', 'NkyelIcons'),
    @('useGabomaSeer', 'useNkyelSeer'),
    @('useGabomaShortcuts', 'useNkyelShortcuts'),
    @('stores/gabomagpt', 'stores/nkyelgpt'),
    @('components/gabomagpt', 'components/nkyelgpt'),
    
    # Python imports for files that got renamed
    @('gaboma_vision_tool', 'nkyel_vision_tool'),
    @('gabomaseer_client', 'nkyelseer_client'),
    @('gaboma-api', 'nkyel-api')
)

Get-ChildItem -Path 'f:\Nkyel-AI-2026' -Recurse -Include '*.ts','*.tsx','*.py','*.json' -Exclude 'backend\app\*' | Where-Object { $_.FullName -notlike '*\backend\app\*' -and $_.FullName -notlike '*\node_modules\*' -and $_.FullName -notlike '*\.next\*' } | ForEach-Object {
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

Write-Output "`nPhase 5 total files updated: $count"
