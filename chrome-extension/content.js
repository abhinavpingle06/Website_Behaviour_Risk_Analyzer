window.addEventListener("message", (event) => {

    if (event.source !== window) return;

    if (event.data.type === "APPROVE_DOMAIN") {

        chrome.runtime.sendMessage({
            action: "approveDomain",
            targetUrl: event.data.targetUrl
        });

    }
});