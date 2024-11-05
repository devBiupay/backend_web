const plugins = ['@vue/babel-plugin-transform-vue-jsx']
// 生产环境移除console
if (process.env.NODE_ENV === 'production') {
  plugins.push('transform-remove-console')
}
plugins.push("@babel/plugin-proposal-optional-chaining")
plugins.push("@babel/plugin-proposal-nullish-coalescing-operator")
module.exports = {
  plugins: plugins,
  presets: [
    '@vue/app'
  ]
}
