let lastEvent; // 全局变量，用于存储最后一个事件

["click", "touchstart", "mousedown", "keydown", "mouseover"].forEach(
  (eventType) => {
    document.addEventListener(
      eventType,
      (e) => {
        lastEvent = e;
      },
      {
        capture: true, // 捕获阶段触发
        passive: true, // 不阻止默认行为
      }
    );
  }
);

export default function () {
  return lastEvent;
}
