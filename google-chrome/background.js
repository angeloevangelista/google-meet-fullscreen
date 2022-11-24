// event to run execute.js content when extension's button is clicked
chrome.action.onClicked.addListener(execute);

async function execute() {
  console.log("clicled the extension button")
}
