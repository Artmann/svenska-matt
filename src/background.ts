const menuId = 'open-svenska-matt'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: menuId,
    title: 'Svenska Mått',
    contexts: ['page', 'selection']
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === menuId) {
    // Opening the popup can reject if there is no focused window; ignore it.
    chrome.action.openPopup().catch(() => {})
  }
})
