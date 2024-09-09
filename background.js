chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('https://www.roblox.com/charts')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: observeAndAddIndicators
      });
    }
  });
  
  function observeAndAddIndicators() {
    const observer = new MutationObserver(() => {
      let gameContainers = document.querySelectorAll('.games-list-container');
  
      if (gameContainers.length > 0) {
        console.log('Found game containers:', gameContainers);
        observer.disconnect(); // Stop observing once the elements are found
  
        // Loop through all games-list-container elements
        gameContainers.forEach(container => {
          // Find all children with the class "list-item game-card game-tile"
          let gameCards = container.querySelectorAll('.list-item.game-card.game-tile');
  
          // Loop through each game card and add the index indicator
          gameCards.forEach((gameCard, index) => {
            // Find the "game-card-thumb-container" inside this child
            let thumbContainer = gameCard.querySelector('.game-card-thumb-container');
  
            if (thumbContainer) {
              // Create a small circle or rectangle
              let indicator = document.createElement('div');
              indicator.innerText = `#${index + 1}`; // Set the index (starting from 1)
              indicator.className = 'index-indicator'; // Add a class for styling
  
              // Append the indicator inside the "game-card-thumb-container"
              thumbContainer.style.position = 'relative'; // Ensure the thumb container has relative positioning
              thumbContainer.appendChild(indicator);
            }
          });
        });
  
        // Add the necessary CSS for styling
        addIndicatorStyles();
      }
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Define the addIndicatorStyles function inside this scope
    function addIndicatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
          .index-indicator {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 60px; /* Increased width */
            height: 25px; /* Increased height */
            border-radius: 15px; /* Fully rounded edges */
            background-color: rgba(0, 0, 0, 0.7); /* Black with slight transparency */
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 20px; /* Larger text */
            font-weight: bold; /* Bold text */
            font-family: 'Arial Black', sans-serif; /* Thicker font */
            z-index: 1000;
            opacity: 0; /* Hidden by default */
            transition: opacity 0.3s; /* Smooth transition for showing/hiding */
          }
          
          .list-item.game-card.game-tile:hover .index-indicator {
            opacity: 1; /* Show the indicator on hover */
          }
        `;
        document.head.appendChild(style);
      }
  }
  