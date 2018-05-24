const withPlugins = require('next-compose-plugins')
const images = require('next-images')
const sass = require('@zeit/next-sass')

// next.js configuration
const nextConfig = {
  useFileSystemPublicRoutes: false,
  distDir: 'build'
}

module.exports = withPlugins([

  // add a plugin with specific configuration
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[local]___[hash:base64:5]'
    }
  }],

  // add a plugin without a configuration
  images

], nextConfig)
