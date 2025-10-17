import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'e2e/**/*.feature',
    supportFile: 'e2e/support/e2e.ts',
    async setupNodeEvents(on, config) {
      // ensure the cucumber preprocessor will look for `*.steps.ts` files under e2e
      // the preprocessor reads stepDefinitions from the environment overrides (config.env)
      ;(config as any).env = (config as any).env || {}
      ;(config as any).env.stepDefinitions = (config as any).env.stepDefinitions || 'e2e/**/*.steps.ts'
      // use runtime requires to avoid mixing esbuild versions/types at compile time
      const createBundler = require('@bahmutov/cypress-esbuild-preprocessor')
      const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild')
      const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor')

      const bundler = createBundler({ plugins: [createEsbuildPlugin(config)] })
      on('file:preprocessor', bundler)
      await addCucumberPreprocessorPlugin(on, config)
      return config
    },
    baseUrl: 'http://127.0.0.1:8080',
    fixturesFolder: 'e2e/fixtures',
    video: false,
    screenshotsFolder: 'cypress/screenshots'
  }
})
