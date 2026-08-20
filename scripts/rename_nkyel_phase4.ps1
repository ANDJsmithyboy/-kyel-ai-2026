$ErrorActionPreference = 'SilentlyContinue'
$count = 0
$N = [char]0x00D1  # Ñ

$replacements = @(
    # Remaining UI text
    @("Demande ${N} Gaboma...", "Demande ${N} ${N}kyel..."),
    @("'Demande ${N} Gaboma...'", "'Demande ${N} ${N}kyel...'"),
    @("Demandez n'importe quoi ${N} Gaboma...", "Demandez n'importe quoi ${N} ${N}kyel..."),
    @("Mod${N}les Gaboma", "Mod${N}les ${N}kyel"),
    @("Passer ${N} Gaboma Pro", "Passer ${N} ${N}kyel Pro"),
    @("l'agent souverain Gaboma", "l'agent souverain ${N}kyel"),
    @("les noms Gaboma Souverains", "les noms ${N}kyel Souverains"),
    @("l'identit${N} souveraine Gaboma", "l'identit${N} souveraine ${N}kyel"),
    @("N${N}ud Gaboma-Core", "N${N}ud ${N}kyel-Core"),
    @("Entra${N}nement des mod${N}les Gaboma", "Entra${N}nement des mod${N}les ${N}kyel"),
    @("Plan de d${N}veloppement Gaboma", "Plan de d${N}veloppement ${N}kyel"),
    @("Th${N}mes Gaboma", "Th${N}mes ${N}kyel"),
    @("l'IA Gaboma", "l'IA ${N}kyel"),
    @("d'IA Gaboma", "d'IA ${N}kyel"),
    @("NkyelGabomaIcon", "NkyelIcon"),
    @("GabomaAgent", "${N}kyelAgent"),
    @("gaboma_agent_v3", "nkyel_agent_v3"),
    @("gaboma_chat_v5", "nkyel_chat_v5"),
    @("gaboma_rag_v2", "nkyel_rag_v2"),
    @("gaboma_multilang_v1", "nkyel_multilang_v1"),
    @("founder@gaboma.ga", "founder@nkyel.ai"),
    @("privacy@gaboma.ai", "privacy@nkyel.ai"),
    @("contact@gaboma.ai", "contact@nkyel.ai"),
    @("abuse@gaboma.ai", "abuse@nkyel.ai")
)

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

Write-Output "`nPhase 4 total files updated: $count"
