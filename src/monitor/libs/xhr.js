import tracker from "../utils/tracker";

export function injectXHR() {
  let XMLHttpRequest = window.XMLHttpRequest;
  /**
   * open请求重写
   */
  let oldOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, async) {
    // 陷入死循环  因为传给后端服务的log也监听了,排除 logstores sockjs 的监听
    if (!url.match(/logstores/) && !url.match(/sockjs/)) {
      this.logData = { method, url, async };
    }

    return oldOpen.apply(this, arguments);
  };

  /**
   * send请求重写
   */
  let oldSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      let startTime = Date.now(); // 发送之前记录开始时间
      let handler = (type) => (e) => {
        let duration = Date.now() - startTime;
        let status = this.status; //200 500
        let statusText = this.statusText; //ok error server

        // 发给服务端的数据
        tracker.send({
          kind: "stability", //监控指标的大类
          type: "xhr", //小类型
          errorType: type, //错误类型 load error abort
          pathname: this.logData.url, //请求路径
          status: status + "-" + statusText, //状态码
          duration, //持续时间
          response: this.response ? JSON.stringify(this.response) : "", //响应体
          params: body || "",
        });
      };
      this.addEventListener("load", handler("load"), false);
      this.addEventListener("error", handler("error"), false);
      this.addEventListener("abort", handler("abort"), false);
    }
    return oldSend.apply(this, arguments);
  };
}
