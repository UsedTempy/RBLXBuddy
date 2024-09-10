chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('https://www.roblox.com/charts')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: setupPageObserver
    });
  }
});

function setupPageObserver() {
  // Listen for hash changes (to detect changes like #/sortName/Top_Trending_V2)
  window.addEventListener('hashchange', observeAndAddIndicators, false);
  
  // Call the function initially in case the page loads directly into a hash route
  observeAndAddIndicators();

  function observeAndAddIndicators() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Check for new .games-list-container elements
            if (node.matches('.games-list-container')) {
              addIndicatorsToContainer(node, '.list-item.game-card.game-tile');
            }
            // Check for new .game-grid.expand-home-content-disabled elements
            if (node.matches('.game-grid.expand-home-content-disabled')) {
              addIndicatorsToContainer(node, '.list-item');
            }
          }
        });
      });

      // Always check existing .games-list-container and .game-grid.expand-home-content-disabled
      let gameContainers = document.querySelectorAll('.games-list-container');
      let gridContainers = document.querySelectorAll('.game-grid.expand-home-content-disabled');

      gameContainers.forEach(container => addIndicatorsToContainer(container, '.list-item.game-card.game-tile'));
      gridContainers.forEach(container => addIndicatorsToContainer(container, '.list-item'));
    });

    // Start observing the entire document for added child elements
    observer.observe(document.body, { childList: true, subtree: true });

    // Function to handle adding indicators to a single container
    function addIndicatorsToContainer(container, childSelector) {
      let gameCards = container.querySelectorAll(childSelector);

      gameCards.forEach((gameCard, index) => {
        let thumbContainer = gameCard.querySelector('.game-card-thumb-container');
        if (thumbContainer) {
          // Ensure we don't add multiple indicators to the same card
          if (!thumbContainer.querySelector('.index-indicator')) {
            let indicator = document.createElement('div');
            indicator.innerText = `#${index + 1}`;
            indicator.className = 'index-indicator';
            thumbContainer.style.position = 'relative';
            thumbContainer.appendChild(indicator);
          }
        }
      });
    }

    // Add the necessary CSS for styling
    addIndicatorStyles();

    // Define the addIndicatorStyles function inside this scope
    function addIndicatorStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .index-indicator {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 60px;
          height: 25px;
          border-radius: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
          font-family: 'Arial Black', sans-serif;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .list-item.game-card.game-tile:hover .index-indicator,
        .game-grid.expand-home-content-disabled .list-item:hover .index-indicator {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
