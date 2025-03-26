import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
import tracker from "../utils/tracker";

export function injectJsError() {
  //监听全局未捕获的错误
  window.addEventListener(
    "error",
    function (e) {
      console.log("error:", e);

      let lastEvent = getLastEvent(); // 获取最后一个交互事件
      console.log("lastEvent:", lastEvent);

      if (e.target && (e.target.src || e.target.href)) {
        //脚本加载错误
        tracker.send({
          kind: "stability", //监控指标的大类
          type: "error", // 小类型
          errorType: "resourceError", // js或css错误
          //   url: "", // 发生错误的url
          //   message: e.message, // 错误信息
          filename: e.target.src || e.target.href, // 发生错误的文件
          tagName: e.target.tagName,
          stack: getLines(e.error.stack), // 错误堆栈
          selector: lastEvent ? getSelector(lastEvent.path) : "", // 最后一个操作的元素
        });
      } else {
        tracker.send({
          kind: "stability", //监控指标的大类
          type: "error", // 小类型
          errorType: "jsError", // js错误
          //   url: "", // 发生错误的url
          message: e.message, // 错误信息
          filename: e.filename, // 发生错误的文件
          position: e.lineno + ":" + e.colno, // 发生错误的位置
          stack: getLines(e.error.stack), // 错误堆栈
          selector: lastEvent ? getSelector(lastEvent.path) : "", // 最后一个操作的元素
        });
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (e) => {
      console.log("unhandledrejection", e);
      let lastEvent = getLastEvent(); // 获取最后一个交互事件
      let message;
      let reason = e.reason;
      let filename = "";
      let lineno = 0;
      let colno = 0;
      let stack = "";

      if (typeof reason === "string") {
        message = reason;
      } else if (typeof reason === "object") {
        message = reason.message;

        if (reason.stack) {
          let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          filename = matchResult[1];
          lineno = matchResult[2];
          colno = matchResult[3];
        }
        stack = getLines(reason.stack);
      }

      tracker.send({
        kind: "stability", //监控指标的大类
        type: "error", //小类型 这是一个错误
        errorType: "promiseError", //JS执行错误
        message, //报错信息
        filename, //哪个文件报错了
        position: `${lineno}:${colno}`,
        stack,
        //body div#container div.content input
        selector: lastEvent ? getSelector(lastEvent.path) : "", //代表最后一个操作的元素
      });
    },
    true
  );

  function getLines(stack) {
    return stack
      .split("\n")
      .slice(1)
      .map((item) => item.replace(/^\s+at\s+/g, ""))
      .join("^");
  }
}
