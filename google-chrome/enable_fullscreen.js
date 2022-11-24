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

["resize", "fullscreenchange"].forEach(eventName => {
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
  if (!element) return

  if (element.tagName !== "VIDEO") return

  let firstFocusableParent = element
  let findFirstFocusableParent = false
  let reachedNullElement = false

  while (!findFirstFocusableParent && !reachedNullElement) {
    if (reachedNullElement) break

    const jsActionableElement = Array
      .from(firstFocusableParent.querySelectorAll("*[jsaction]"))
      .find(p => p.getAttribute("jsaction")?.includes("focusin"))

    findFirstFocusableParent = !!jsActionableElement

    firstFocusableParent = findFirstFocusableParent
      ? jsActionableElement
      : firstFocusableParent.parentElement

    reachedNullElement = !firstFocusableParent
  }

  if (reachedNullElement) return

  const actionButtonsContainerElement = firstFocusableParent
    .querySelector("*:has(button):first-child");

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
  })

  const fullscreenButtonContainer = document.createElement("div")
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

  actionButtonsContainerElement.parentElement.parentElement.position = "relative";
  actionButtonsContainerElement.parentElement.parentElement.appendChild(fullscreenButtonContainer);

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