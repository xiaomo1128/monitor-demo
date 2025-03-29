import tracker from "../utils/tracker";
import onload from "../utils/onload";
import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";

export function timing() {
  let FMP, LCP;

  // 使用performatyObserver监视性能指标
  if (window.PerformanceObserver) {
    // Monitor Element Timing API (for FMP)
    // Note: Element Timing API might need custom markup with 'elementtiming' attribute on elements
    try {
      //  增加一个性能条目的观察者
      new PerformanceObserver((entryList, observer) => {
        const perfEntries = entryList.getEntries();
        if (perfEntries.length > 0) {
          FMP = perfEntries[0]; //startTime 2000以后
          observer.disconnect(); //不再观察了
        }
      }).observe({ type: "element", buffered: true }); //观察页面中的意义的元素
    } catch (e) {
      console.error("Element Timing API not supported", e);
    }
    //-------------------------------------------------------------

    // Monitor Largest Contentful Paint
    try {
      new PerformanceObserver((entryList, observer) => {
        const perfEntries = entryList.getEntries();
        // Get the latest LCP entry
        const latestEntry = perfEntries[perfEntries.length - 1];
        if (latestEntry) {
          LCP = latestEntry;
          observer.disconnect(); //不再观察了
        }
      }).observe({ type: "largest-contentful-paint", buffered: true }); //观察页面中的意义的元素
    } catch (e) {
      console.error("Largest Contentful Paint API not supported", e);
    }
    //-------------------------------------------------------------
    // Monitor First Input Delay
    try {
      new PerformanceObserver((entryList, observer) => {
        const lastEvent = getLastEvent();
        const firstInput = entryList.getEntries()[0];

        if (firstInput) {
          // processingStart 开始处理的时间 startTime开点击的时间 差值就是处理的延迟
          // processingStart - startTime = input delay
          const inputDelay = firstInput.processingStart - firstInput.startTime;
          const duration = firstInput.duration; // processing time

          if (inputDelay > 0 || duration > 0) {
            // tracker.send({
            //   kind: "experience", //用户体验指标
            //   type: "firstInputDelay", //首次输入延迟
            //   inputDelay, //延时的时间
            //   duration, //处理的时间
            //   startTime: firstInput.startTime,
            //   selector: lastEvent
            //     ? getSelector(
            //         lastEvent.path ||
            //           lastEvent.composedPath?.() ||
            //           lastEvent.target
            //       )
            //     : "",
            // });
          }
        }
        observer.disconnect(); //不再观察了
      }).observe({ type: "first-input", buffered: true }); //观察页面中的意义的元素
    } catch (e) {
      console.error("First Input Delay API not supported", e);
    }
  }

  //用户的第一次交互 点击页面
  onload(function () {
    setTimeout(() => {
      // Use Navigation Timing API Level 2 instead of the deprecated performance.timing
      const navigationEntries = performance.getEntriesByType("navigation")[0];

      if (navigationEntries) {
        // tracker.send({
        //   kind: "experience", //用户体验指标
        //   type: "timing", //统计每个阶段的时间
        //   //连接时间
        //   connectTime:
        //     navigationEntries.connectEnd - navigationEntries.connectStart,
        //   //首字节到达时间
        //   ttfbTime:
        //     navigationEntries.responseStart - navigationEntries.requestStart,
        //   //响应的读取时间
        //   responseTime:
        //     navigationEntries.responseEnd - navigationEntries.responseStart,
        //   //DOM解析的时间
        //   parseDOMTime:
        //     navigationEntries.loadEventStart - navigationEntries.domLoading,
        //   domContentLoadedTime:
        //     navigationEntries.domContentLoadedEventEnd -
        //     navigationEntries.domContentLoadedEventStart,
        //   //首次可交互时间
        //   timeToInteractive:
        //     navigationEntries.domInteractive - navigationEntries.fetchStart,
        //   //完整的加载时间
        //   loadTime:
        //     navigationEntries.loadEventStart - navigationEntries.fetchStart,
        // });
      }

      // Paint timing metrics
      const paintEntries = performance.getEntriesByType("paint");
      const FP = paintEntries.find((entry) => entry.name === "first-paint");
      const FCP = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );

      //开始发送性能指标
      console.log("FP", FP);
      console.log("FCP", FCP);
      console.log("FMP", FMP);
      console.log("LCP", LCP);

      if (FP && FCP) {
        // tracker.send({
        //   kind: "experience", //用户体验指标
        //   type: "paint", //统计每个阶段的时间
        //   firstPaint: FP.startTime,
        //   firstContentfulPaint: FCP.startTime,
        //   firstMeaningfulPaint: FMP?.startTime,
        //   largestContentfulPaint: LCP?.startTime,
        // });
      }
    }, 3000);
  });
}
