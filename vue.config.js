module.exports = {
    devServer: {
        // port:8080,
        proxy: {
            '/seniverseapi': {
                target: 'http://api.qingyunke.com/api.php',
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    '^/seniverseapi': ''
                }
            }
        }
    }
}
