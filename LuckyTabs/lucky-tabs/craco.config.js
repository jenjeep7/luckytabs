module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'development') {
        // Completely remove ForkTsCheckerWebpackPlugin to prevent memory issues
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin';
        });
        
        // Disable ESLint plugin as well to reduce memory usage
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return plugin.constructor.name !== 'ESLintWebpackPlugin';
        });
        
        // Optimize webpack for faster development builds
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
          usedExports: false,
        };
        
        // Reduce memory usage in resolve options
        webpackConfig.resolve = {
          ...webpackConfig.resolve,
          cache: false,
        };
      }
      
      return webpackConfig;
    },
  },
  devServer: {
    // Disable overlay to prevent memory issues
    client: {
      overlay: false,
    },
  },
};
