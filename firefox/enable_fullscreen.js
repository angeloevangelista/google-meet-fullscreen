// this code will be executed after page load

const timeoutToCheckTags = 1000

document.addEventListener(
  'DOMNodeInserted',
  (event) => {
    setTimeout(() => {
      makeVideoElementFullscreenable(event.target)
    }, timeoutToCheckTags)
  }
);

document.addEventListener(
  'DOMNodeRemoved',
  (event) => {
    setTimeout(() => {
      makeVideoElementFullscreenable(event.target)
    }, timeoutToCheckTags)
  }
);

["click", "resize", "fullscreenchange"].forEach(eventName => {
  window.addEventListener(
    eventName,
    () => {
      setTimeout(() => {
        Array.from(document.querySelectorAll("video")).forEach(
          (videoElement) => makeVideoElementFullscreenable(videoElement)
        );
      }, timeoutToCheckTags)
    }
  )
})

function makeVideoElementFullscreenable(element) {

  if (!element) return;

  if (element.tagName !== "VIDEO") return;

  if (element.style?.display === "none") return;

  let firstFocusableParent = element;

  let
    climbedDOMLevelsCount = 0,
    reachedNullElement = false,
    reachedMaximumClimbLevels = false,
    hasFoundTheFirstFoucusableParent = false;

  do {
    climbedDOMLevelsCount++;

    if (reachedNullElement) break

    const jsActionableElement = Array
      .from(firstFocusableParent.querySelectorAll("*[jsaction]"))
      .find(p => p.getAttribute("jsaction")?.includes("focusin"))

    hasFoundTheFirstFoucusableParent = !!jsActionableElement

    firstFocusableParent = hasFoundTheFirstFoucusableParent
      ? jsActionableElement
      : firstFocusableParent.parentElement

    reachedNullElement = !firstFocusableParent
    reachedMaximumClimbLevels = climbedDOMLevelsCount > 5
  } while (
    true
    && !hasFoundTheFirstFoucusableParent
    && !reachedNullElement
    && !reachedMaximumClimbLevels
  );

  console.log({
    count: climbedDOMLevelsCount,
    element,
    firstFocusableParent,
    reachedMaximumClimbLevels
  })

  if (reachedNullElement) return

  if (reachedMaximumClimbLevels) return

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

  const fullscreenButtonElement = document.createElement("button")
  fullscreenButtonElement.classList.add("google-meet-fullscreen-button")

  fullscreenButtonElement.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  const fullscreenButtonContainer = document.createElement("div");

  fullscreenButtonContainer.classList.add(
    "google-meet-fullscreen-button-container",
    "google-meet-fullscreen-hide",
  );

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
    setTimeout(() => {
      fullscreenButtonContainer.classList.add(
        "google-meet-fullscreen-hide"
      )
    }, 500)
  })
}

const styles = document.createElement('style')

styles.innerHTML = `
  .google-meet-fullscreen-hide {
    display: none !important;
  }

  .google-meet-fullscreen-button-container {
    position: absolute;
    bottom: 0.8rem;
    right: 0.8rem;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background-color: #2b2c2f66;
    border: 1px solid #3635356b ;
  }

  .google-meet-fullscreen-button {
    background: none;
    border: none;
  }
`

document.body.appendChild(styles)