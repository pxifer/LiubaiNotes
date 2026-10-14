(() => {
  "use strict";
  const config = window.LIUBAI_SITE_CONFIG || {};

  function configureLinks(selector, url, readyLabel, pendingLabel) {
    document.querySelectorAll(selector).forEach((link) => {
      if (url) {
        link.href = url;
        link.textContent = readyLabel;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#source";
        link.textContent = pendingLabel;
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => event.preventDefault());
      }
    });
  }

  configureLinks("[data-source-link]", config.sourceUrl, "查看源码", "源码待配置");
  configureLinks("[data-feedback-link]", config.feedbackUrl, "提交反馈", "反馈入口待配置");
  configureLinks("[data-edge-store-link]", config.edgeAddonsUrl, "从 Edge Add-ons 安装", "商店审核中");
})();
