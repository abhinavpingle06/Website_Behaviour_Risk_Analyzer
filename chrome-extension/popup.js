const toggle = document.getElementById("toggle");
const statusText = document.getElementById("status");

chrome.storage.local.get(["redirectOn"], (result) => {
  const isOn = result.redirectOn || false;
  toggle.checked = isOn;
  updateText(isOn);
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ redirectOn: toggle.checked });
  updateText(toggle.checked);
});

function updateText(isOn) {
  statusText.textContent = isOn ? "Redirect ON" : "Redirect OFF";
}