module.exports = {
  // Папки и файлы для пропуска при анализе покрытия
  skipFiles: [
    'test/',
    'migrations/',
  ],
  
  // Настройки Mocha
  mocha: {
    timeout: 100000,
  },
  
  // Настройки Istanbul
  istanbulReporter: ['html', 'lcov', 'text', 'json'],
  istanbulFolder: './coverage',
  
  // Настройки для показа цветного вывода
  silent: false,
  
  // Включить/выключить измерение покрытия
  measureStatementCoverage: true,
  measureFunctionCoverage: true,
  measureBranchCoverage: true,
  measureLineCoverage: true,
}; 