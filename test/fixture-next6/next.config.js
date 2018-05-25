const nextBuildId = require('../../index')

module.exports = (phase, nextConfig) => {
  if (process.env.NBI_TEST_CALL_DEFAULT_GENERATEBUILDID) console.log(nextConfig.defaultConfig.generateBuildId())
  return {
    generateBuildId: () => nextBuildId({ dir: __dirname }).then(result => result.id)
  }
}
