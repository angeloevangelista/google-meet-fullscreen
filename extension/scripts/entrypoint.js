function waitForElement(container, selector, timeoutInMilliseconds) {
  return new Promise((resolve, reject) => {
    const foundElement = container.querySelector(selector);

    if (foundElement) return resolve(foundElement);

    let timeoutTimer;

    const observer = new MutationObserver(() => {
      const foundElement = container.querySelector(selector);

      if (foundElement) {
        observer.disconnect();
        if (timeoutTimer) clearTimeout(timeoutTimer);
        resolve(foundElement);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    if (timeoutInMilliseconds) {
      timeoutTimer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeoutInMilliseconds);
    }
  });
}

function getFirstFocusableParent(videoNode) {
  let firstFocusableParent = videoNode;

  let climbedDOMLevelsCount = 0,
    reachedNullElement = false,
    reachedMaximumClimbLevels = false,
    hasFoundTheFirstFocusableParent = false;

  do {
    climbedDOMLevelsCount++;

    if (reachedNullElement) break;

    const jsActionableElement = Array.from(
      firstFocusableParent.querySelectorAll("*[jsaction]")
    ).find((p) => p.querySelector("[data-is-tooltip-wrapper]"));

    hasFoundTheFirstFocusableParent = !!jsActionableElement;

    firstFocusableParent = hasFoundTheFirstFocusableParent
      ? jsActionableElement
      : firstFocusableParent.parentElement;

    reachedNullElement = !firstFocusableParent;
    reachedMaximumClimbLevels = climbedDOMLevelsCount > 10;
  } while (
    true &&
    !hasFoundTheFirstFocusableParent &&
    !reachedNullElement &&
    !reachedMaximumClimbLevels
  );

  // console.log({
  //   count: climbedDOMLevelsCount,
  //   element,
  //   firstFocusableParent,
  //   reachedMaximumClimbLevels
  // })

  if (reachedNullElement) return;

  if (reachedMaximumClimbLevels) return;

  return firstFocusableParent;
}

/**
 * @param {HTMLElement} participantContainer - The container that holds participant elements
 * @returns {Promise<void>}
 */
async function handleNewParticipantContainer(participantContainer) {
  if (
    participantContainer.querySelector(
      ".google-meet-fullscreen-controls-container"
    )
  ) {
    return;
  }

  const callScreenshot = () => {
    const video = Array.from(participantContainer.querySelectorAll("video"))
      .filter((p) => p.style.display !== "none")
      .pop();

    if (!video) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${participantContainer.dataset.participantId}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const callFullscreen = () => {
    const video = Array.from(participantContainer.querySelectorAll("video"))
      .filter((p) => p.style.display !== "none")
      .pop();

    if (!video) {
      return;
    }

    video.requestFullscreen();
  };

  participantContainer.addEventListener("dblclick", callFullscreen);

  participantContainer.addEventListener(
    "mouseover",
    () =>
      !participantContainer.querySelector(
        ".google-meet-fullscreen-controls-container"
      ) && handleNewParticipantContainer(participantContainer)
  );

  const fullscreenButton = document.createElement("button");
  fullscreenButton.classList.add("google-meet-fullscreen-controls-button");
  fullscreenButton.innerHTML = `
    <i class="google-material-icons"
      style="color: #fff; font-size: 16px;"
      aria-hidden="true"
    >
      open_in_full
    </i>
  `;
  fullscreenButton.addEventListener("click", callFullscreen);

  const screenshotButton = document.createElement("button");
  screenshotButton.classList.add("google-meet-fullscreen-controls-button");
  screenshotButton.innerHTML = `
    <i class="google-material-icons"
      style="color: #fff; font-size: 16px;"
      aria-hidden="true"
    >
      camera
    </i>
  `;
  screenshotButton.addEventListener("click", callScreenshot);

  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add(
    "google-meet-fullscreen-controls-container",
    "google-meet-fullscreen-hide"
  );
  controlsContainer.appendChild(fullscreenButton);
  controlsContainer.appendChild(screenshotButton);

  participantContainer.appendChild(controlsContainer);

  ["mousemove", "mouseover"].forEach((eventName) => {
    participantContainer.addEventListener(eventName, () => {
      controlsContainer.classList.remove("google-meet-fullscreen-hide");
    });
  });

  participantContainer.addEventListener("mouseleave", () => {
    controlsContainer.classList.add("google-meet-fullscreen-hide");
  });
}

function observeMeetingElementsMutation(mainContainerToObserve) {
  new MutationObserver((mutationList, _) => {
    const addedNodes = mutationList
      .filter((p) => p.type === "childList")
      .reduce((acc, current) => [...acc, ...current.addedNodes], []);

    const newElementsAreOnMainContainer = Array.from(addedNodes).some((p) =>
      mainContainerToObserve.contains(p)
    );

    if (!newElementsAreOnMainContainer) {
      return;
    }

    Array.from(document.querySelectorAll("[data-participant-id]"))
      .filter(
        (p) =>
          p.querySelector &&
          !p.querySelector(".google-meet-fullscreen-controls-container")
      )
      .forEach(handleNewParticipantContainer);
  }).observe(mainContainerToObserve, {
    subtree: true,
    childList: true,
  });
}

async function initialize() {
  window.addEventListener(
    "fullscreenchange",
    (event) => {
      event.stopImmediatePropagation();
    },
    true
  );

  const mainContainer = await waitForElement(
    document.querySelector("body"),
    "main"
  );

  observeMeetingElementsMutation(mainContainer);
}

initialize();
