const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/inference/GabomaInferenceEngine.kt',
    rules: [
      { from: /Groq/g, to: 'GabomaAPI' },
      { from: /groq/g, to: 'gabomaAPI' }
    ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/INTEGRATION_GUIDE_THEMES.md',
    rules: [ { from: /Gemini/g, to: 'Illuminate' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/MIGRATION_GUIDE_6THEMES.md',
    rules: [ { from: /Gemini/g, to: 'Illuminate' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/chat/ChatTopBar.kt',
    rules: [ { from: /Claude/g, to: 'Reference' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/chat/MessageActionBar.kt',
    rules: [ { from: /Gemini/g, to: 'Illuminate' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/chat/tier/GabomaTier.kt',
    rules: [ { from: /DeerFlow/g, to: 'GabomaOrchestrator' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/components/GabomaIlluminatedBackground.kt',
    rules: [ { from: /Google Gemini/g, to: 'Reference Design' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/components/SandboxViewer.kt',
    rules: [ { from: /Qdrant/g, to: 'Vector' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/onboarding/OnboardingScreen.kt',
    rules: [ { from: /Claude\/Gemini/g, to: 'Premium' }, { from: /Claude/g, to: 'Premium' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/settings/AntrScreen.kt',
    rules: [ { from: /Claude/g, to: 'Premium' } ]
  },
  { file: 'gabomagpt/android/app/src/main/java/com/smartandj/gabomagpt/presentation/theme/GabomaThemeSystem.kt',
    rules: [ { from: /Gemini/g, to: 'Illuminate' } ]
  }
];

replacements.forEach(({ file, rules }) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    rules.forEach(rule => {
      content = content.replace(rule.from, rule.to);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
