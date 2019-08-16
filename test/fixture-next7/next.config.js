const nextBuildId = require('../../index')

module.exports = () => {
  const opts = { dir: __dirname }
  if (process.env.NBI_TEST_DESCRIBE) opts.describe = true
  return {
    generateBuildId: () => process.env.NBI_TEST_SYNC ? nextBuildId.sync(opts) : nextBuildId(opts)
  }
}
