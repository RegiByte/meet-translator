import messageTypes from "./constants/messageTypes";
import errorMessages from "./constants/errorMessages";
import ports from "./constants/ports";

window.$meetTranslatorObserver = null

window.$getMeetTranslatorObserver = () => {
  var targetNode = document.querySelector('[jscontroller="LM3KPc"]')

  if (!targetNode) {
    return alert(errorMessages.OUTSIDE_MEETING_ERROR)
  }

  var config = {
    childList: true,
    characterData: true,
    subtree: true
  };

// Callback function to execute when mutations are observed

  const port = chrome.runtime.connect({
    name: ports.SENDER
  })

  function checkChanges(currentState, newState) {
    if (currentState.length !== newState.length) {
      return true
    }

    return currentState.some((captionBlock, index) => {
      const newCaptionBlock = newState[index]

      return captionBlock.picture !== newCaptionBlock.picture ||
        captionBlock.name !== newCaptionBlock.name ||
        captionBlock.phrase !== newCaptionBlock.phrase ||
        captionBlock.id !== newCaptionBlock.id
    })
  }

  function getState(element) {
    return Array.from(element.children).map((block) => {
      const [_, nameContainer, phraseContainer] = Array.from(block.children)

      const picture = block.querySelector('img');
      return {
        picture: picture.src,
        id: picture.getAttribute('data-iml'),
        name: nameContainer.innerText,
        phrase: phraseContainer.innerText
      }
    })
      .filter(block => block.id && block.picture && block.name && block.phrase)
  }

  var currentState = []

  var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
      const newState = getState(document.querySelector('[jsaction="TpIHXe:c0270d;Z1rKi:npT2md;L6tSXb:c0270d;eX5tif:zpmpZc;z1yzAc:xiCV9b"]'))
      if (checkChanges(currentState, newState)) {
        currentState = newState

        port.postMessage({
          type: messageTypes.CAPTIONS_UPDATE,
          data: newState
        })
      }
    }
  };

// Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  return observer
}

function startWatching() {
  if (window.$meetTranslatorObserver !== null) {
    window.$meetTranslatorObserver.disconnect()
  }

  window.$meetTranslatorObserver = window.$getMeetTranslatorObserver()
}

startWatching()
