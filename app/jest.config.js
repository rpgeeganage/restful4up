module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
        tsconfig: './tsconfig.json'
      }
  },
  preset: 'ts-jest'
};