// this code will be executed after page load
const mutationCallback = (mutationsList) => {
  const videoNodes = mutationsList
    .filter(mutation => mutation.type === 'childList')
    .reduce(
      (acc, current) => (
        [
          ...acc,
          ...Array.from(current.addedNodes)
            .filter(node => node.tagName === "VIDEO"),
        ]
      ),
      [],
    );

  videoNodes.forEach(videoNode => {
    ["mouseover"].forEach(eventName => {
      getFirstFocusableParent(videoNode)?.addEventListener(
        eventName,
        () => makeVideoElementFullscreenable(videoNode),
      )
    })
  })
};

new MutationObserver(mutationCallback).observe(
  document.body,
  {
    childList: true,
    subtree: true,
  },
);

function getFirstFocusableParent(videoNode) {
  let firstFocusableParent = videoNode;

  let
    climbedDOMLevelsCount = 0,
    reachedNullElement = false,
    reachedMaximumClimbLevels = false,
    hasFoundTheFirstFocusableParent = false;

  do {
    climbedDOMLevelsCount++;

    if (reachedNullElement) break

    const jsActionableElement = Array
      .from(firstFocusableParent.querySelectorAll("*[jsaction]"))
      .find(p => p.querySelector("[data-is-tooltip-wrapper]"))

    hasFoundTheFirstFocusableParent = !!jsActionableElement

    firstFocusableParent = hasFoundTheFirstFocusableParent
      ? jsActionableElement
      : firstFocusableParent.parentElement

    reachedNullElement = !firstFocusableParent
    reachedMaximumClimbLevels = climbedDOMLevelsCount > 10
  } while (
    true
    && !hasFoundTheFirstFocusableParent
    && !reachedNullElement
    && !reachedMaximumClimbLevels
  );

  // console.log({
  //   count: climbedDOMLevelsCount,
  //   element,
  //   firstFocusableParent,
  //   reachedMaximumClimbLevels
  // })

  if (reachedNullElement) return

  if (reachedMaximumClimbLevels) return

  return firstFocusableParent
}

function makeVideoElementFullscreenable(videoNode) {
  if (!videoNode) return;

  if (videoNode.tagName !== "VIDEO") return;

  if (videoNode.style?.display === "none") return;

  const firstFocusableParent = getFirstFocusableParent(videoNode)

  if (!firstFocusableParent) {
    return
  }

  const containerElementToAddFullscreenButton = Array
    .from(firstFocusableParent.querySelectorAll("*"))
    .find(element => element.querySelector("button"))
    ?.parentElement
    ?.parentElement
    ?.parentElement;

  if (!containerElementToAddFullscreenButton) return;

  const buttonIsAlreadyAdded = containerElementToAddFullscreenButton.querySelector(
    ".google-meet-fullscreen-button-container",
  );

  if (buttonIsAlreadyAdded) return;

  const hasNativeActionButton = Array.from(firstFocusableParent.querySelectorAll('i'))
    .some(p => ["zoom_in", "stylus_laser_pointer"].includes(p.innerHTML));

  const fullscreenButtonElement = document.createElement("button");
  fullscreenButtonElement.classList.add("google-meet-fullscreen-button");

  fullscreenButtonElement.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      videoNode.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        console.error(err);
      });
    } else {
      document.exitFullscreen();
    }
  });

  firstFocusableParent.addEventListener("dblclick", () => fullscreenButtonElement.click());

  const fullscreenButtonContainer = document.createElement("div");

  fullscreenButtonContainer.classList.add(
    "google-meet-fullscreen-button-container",
    "google-meet-fullscreen-hide",
  );

  if (hasNativeActionButton) {
    fullscreenButtonContainer.classList.add("with-native-action-button");
  }

  const buttonIconElement = document.createElement("i")

  buttonIconElement.classList.add("google-material-icons")
  buttonIconElement.style.color = '#fff'
  buttonIconElement.style.fontSize = '16px'
  buttonIconElement.innerHTML = 'open_in_full'
  buttonIconElement.setAttribute("aria-hidden", "true")

  fullscreenButtonElement.appendChild(buttonIconElement)
  fullscreenButtonContainer.appendChild(fullscreenButtonElement);

  containerElementToAddFullscreenButton.position = "relative";
  containerElementToAddFullscreenButton.appendChild(fullscreenButtonContainer);

  ["mousemove", "mouseover"].forEach(eventName => {
    firstFocusableParent.addEventListener(eventName, () => {
      fullscreenButtonContainer.classList.remove(
        "google-meet-fullscreen-hide"
      );
    })
  })

  firstFocusableParent.addEventListener("mouseleave", () => {
    fullscreenButtonContainer.classList.add(
      "google-meet-fullscreen-hide"
    );
  })
}

const styles = document.createElement('style')

styles.innerHTML = `
  .google-meet-fullscreen-hide:not(:hover) {
    opacity: 0 !important;
  }

  .google-meet-fullscreen-button-container {
    position: absolute;
    bottom: 1.2rem;
    right: 1.2rem;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    background-color: #2b2c2f80;
    border: 1px solid #3635356b;
    overflow: hidden;
    
    cursor: pointer;
    transition: 0.25s ease-in;
  }
  
  .google-meet-fullscreen-button-container.with-native-action-button {
    bottom: 4.6rem;
  }

  .google-meet-fullscreen-button-container:hover {
    filter: brightness(2);
  }
  
  .google-meet-fullscreen-button {
    cursor: pointer;
    width: 100%;
    height: 100%;

    border: none;
    background: none;
    transition: 0.25s ease-in;
  }
`

document.body.appendChild(styles)