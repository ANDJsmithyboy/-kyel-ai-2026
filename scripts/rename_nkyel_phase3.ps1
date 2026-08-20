$ErrorActionPreference = 'SilentlyContinue'
$count = 0
$N = [char]0x00D1  # Ñ

# ── Phase 3: UI-visible strings, icon imports, remaining lowercase ──

$replacements = @(
    # UI visible text
    @("Demande ${N} ${N}kyel...", "Demande ${N} ${N}kyel..."),
    @("Demandez n'importe quoi ${N} Gaboma...", "Demandez n'importe quoi ${N} ${N}kyel..."),
    @("Demande ${N} Gaboma...", "Demande ${N} ${N}kyel..."),
    @("Mod${N}les Gaboma", "Mod${N}les ${N}kyel"),
    @('GabomaSeer regarde', "${N}kyelVision regarde"),
    @("Arr${N}ter GabomaSeer", "Arr${N}ter ${N}kyelVision"),
    @('GabomaSeer', "${N}kyelVision"),
    @('Gaboma Waves', "${N}kyel Waves"),
    @('GabomaWaves', 'NkyelWaves'),
    @('GabomaAgentIcon', 'NkyelAgentIcon'),
    @('Gaboma Lexicon Models', "${N}kyel Lexicon Models"),
    @('Glowing Gaboma Seal', "Glowing ${N}kyel Seal"),
    @('Gaboma Seal for end', "${N}kyel Seal for end"),
    @('Gaboma Waves', "${N}kyel Waves"),
    @("Plan de d${N}veloppement Gaboma", "Plan de d${N}veloppement ${N}kyel"),
    @("1.0.0-Gaboma", "1.0.0-${N}kyel"),
    @('GABOMA AGENT', "${N}KYEL AGENT"),
    @('GABOMA', "${N}KYEL"),

    # Icon imports (file path stays, but export name changes)
    @("icons/gaboma'", "icons/NkyelIcons'"),
    @('icons/gaboma"', 'icons/NkyelIcons"'),

    # Sidebar storage key
    @('gaboma-sidebar-collapsed', 'nkyel-sidebar-collapsed'),
    
    # useGabomaStore import path fix (the phase 1 script may have broken this)
    @("stores/${N}kyel AI", 'stores/gabomagpt'),
    
    # WhatsApp link (just the /gaboma part in URL)
    @('wa.me/gaboma', 'wa.me/nkyelai'),
    
    # Email
    @('cadre.gaboma@gabon.ga', 'contact@nkyel.ai'),

    # Image alt text
    @("alt=""Gaboma""", "alt=""${N}kyel AI"""),
    @("alt='Gaboma'", "alt='${N}kyel AI'")
)

Get-ChildItem -Path 'f:\Nkyel-AI-2026\ZION-CORE-V2\src' -Recurse -Include '*.ts','*.tsx' | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $original = $content
    
    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }

    # Handle remaining standalone "Gaboma" (not part of a larger word, not in image paths)
    # Replace visible UI text "Gaboma" but NOT file paths like /gaboma-logo.png
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($_.FullName, $content)
        Write-Output "UPDATED: $($_.FullName)"
        $count++
    }
}

Write-Output "`nPhase 3 total files updated: $count"
