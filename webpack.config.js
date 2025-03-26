const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  context: process.cwd(),
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "monitor.js",
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    //before是用来配置路由的  express服务器
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      // 原来before里的路由配置
      devServer.app.get("/success", function (req, res) {
        res.json({ id: 1 }); //200
      });
      devServer.app.post("/error", function (req, res) {
        res.sendStatus(500); //500
      });

      return middlewares;
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: "head",
    }),
  ],
};
