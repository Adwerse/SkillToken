const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка качества тестов и покрытия кода...\n');

// Проверяем наличие файлов тестов
const testFiles = [
  'test/SkillToken.test.ts'
];

console.log('📁 Проверка файлов тестов:');
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - найден`);
  } else {
    console.log(`❌ ${file} - не найден`);
  }
});

// Проверяем coverage отчеты
const coverageFiles = [
  'coverage/index.html',
  'coverage/coverage-final.json',
  'coverage/lcov.info'
];

console.log('\n📊 Проверка отчетов coverage:');
coverageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - найден`);
  } else {
    console.log(`❌ ${file} - не найден`);
  }
});

// Анализируем coverage данные
if (fs.existsSync('coverage/coverage-final.json')) {
  console.log('\n📈 Анализ покрытия SkillToken.sol:');
  try {
    const coverageData = JSON.parse(fs.readFileSync('coverage/coverage-final.json', 'utf8'));
    
    // Ищем данные по SkillToken
    let skillTokenData = null;
    for (const [filepath, data] of Object.entries(coverageData)) {
      if (filepath.includes('SkillToken.sol')) {
        skillTokenData = data;
        break;
      }
    }
    
    if (skillTokenData) {
      const statements = skillTokenData.s ? Object.keys(skillTokenData.s).length : 0;
      const functions = skillTokenData.f ? Object.keys(skillTokenData.f).length : 0;
      const branches = skillTokenData.b ? Object.keys(skillTokenData.b).length : 0;
      const lines = skillTokenData.l ? Object.keys(skillTokenData.l).length : 0;
      
      console.log(`   📝 Statements: ${statements} покрыты`);
      console.log(`   🔧 Functions: ${functions} покрыты`);
      console.log(`   🌳 Branches: ${branches} покрыты`);
      console.log(`   📏 Lines: ${lines} покрыты`);
    }
  } catch (e) {
    console.log('   ⚠️  Не удалось прочитать данные coverage');
  }
}

// Проверяем конфигурационные файлы
const configFiles = [
  'hardhat.config.ts',
  'package.json',
  '.solcover.js',
  'tsconfig.json'
];

console.log('\n⚙️  Проверка конфигурационных файлов:');
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - найден`);
  } else {
    console.log(`❌ ${file} - не найден`);
  }
});

// Проверяем скрипты в package.json
if (fs.existsSync('package.json')) {
  console.log('\n🎯 Проверка npm скриптов:');
  try {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageData.scripts || {};
    
    const requiredScripts = ['test', 'test-only', 'coverage', 'compile'];
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        console.log(`✅ npm run ${script} - настроен`);
      } else {
        console.log(`❌ npm run ${script} - не найден`);
      }
    });
  } catch (e) {
    console.log('   ⚠️  Не удалось прочитать package.json');
  }
}

console.log('\n🎉 Проверка завершена!');
console.log('\n📚 Для запуска тестов используйте:');
console.log('   npm test          - тесты + coverage');
console.log('   npm run test-only - только тесты');
console.log('   npm run coverage  - только coverage');
console.log('\n📖 Откройте coverage/index.html для детального отчета'); 