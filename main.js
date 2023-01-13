"use strict";
const qrcodeLink = document.querySelector(".qrcode-link");
const srcImage = document.querySelector(".src-image");
let qrcodeClicked = false;
const defaultImage = srcImage.getAttribute("src");

qrcodeLink.addEventListener("click", (event) => {
  event.preventDefault();
  qrcodeClicked = !qrcodeClicked;
  if (qrcodeClicked) {
    srcImage.setAttribute("src", "./images/frame.png");
  } else {
    srcImage.setAttribute("src", defaultImage);
  }
});

const IS_ANDROID = /android/i.test(navigator.userAgent);
const IS_IOS =
  (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const IS_SAFARI = /Safari\//.test(navigator.userAgent);
const IS_FIREFOX = /firefox/i.test(navigator.userAgent);
const IS_OCULUS = /OculusBrowser/.test(navigator.userAgent);
const IS_IOS_CHROME = IS_IOS && /CriOS\//.test(navigator.userAgent);
const IS_IOS_SAFARI = IS_IOS && IS_SAFARI;

const SUPPORTS_SCENEVIEWER = IS_ANDROID && !IS_FIREFOX && !IS_OCULUS;
const SUPPORTS_QUICKLOOK = (() => {
  const anchor = document.createElement("a");
  return (
    anchor.relList && anchor.relList.supports && anchor.relList.supports("ar")
  );
})();

const activateAR = (href, productLink, isQuickLook) => {
  const anchor = document.createElement("a");
  if (isQuickLook) {
    isQuickLook = true;

    anchor.appendChild(document.createElement("img"));
    anchor.rel = "ar";
  }
  anchor.setAttribute("href", href);
  anchor.click();

  if (productLink && isQuickLook) {
    anchor.addEventListener(
      "message",
      (event) => {
        if (event.data == "_apple_ar_quicklook_button_tapped") {
          productLink.dispatchEvent(
            new CustomEvent("quick-look-button-tapped")
          );
        }
      },
      false
    );
  }
};

const initializeArButton = (productLink, src, iosSrc) => {

  const base_url = window.location.origin + "/marketplace-with-AR";

  if ((IS_IOS_CHROME || IS_IOS_SAFARI) && SUPPORTS_QUICKLOOK) {
    productLink.setAttribute("ar", "quick-look");
    productLink.dispatchEvent(
      new CustomEvent("initialized", { detail: "quick-look" })
    );
    productLink.addEventListener("click", () => {
      if (!iosSrc) {
        console.error("Invalid ios-src in <ar-button>: " + productLink);
        return;
      }
      let href = `${base_url}/${iosSrc}#`;
      activateAR(href, productLink, true);
    });
  } else if (SUPPORTS_SCENEVIEWER) {
    productLink.setAttribute("ar", "scene-viewer");
    productLink.dispatchEvent(
      new CustomEvent("initialized", { detail: "scene-viewer" })
    );
    productLink.addEventListener("click", () => {
      if (!src) {
        console.error("Invalid src in <ar-button>: " + productLink);
        return;
      }
      const title = productLink.getAttribute("title");
      const fallbackUrl = productLink.getAttribute("fallback-url");
      const link = productLink.getAttribute("link");
      const noScale = productLink.getAttribute("no-scale");
      const disableOcclusion = productLink.getAttribute("disable-occlusion");
      let href = null;
      href = `intent://arvr.google.com/scene-viewer/1.0?file=${base_url}/${src}&mode=ar_only`;
      if (title) {
        href += `&title=${encodeURIComponent(title)}`;
      }
      if (link) {
        href += `&link=${encodeURIComponent(link)}`;
      }
      if (noScale != null) {
        href += "&resizable=false";
      }
      if (disableOcclusion != null) {
        href += "&disable_occlusion=true";
      }

      href +=
        "#Intent;scheme=https;" +
        "package=com.google.ar.core;" +
        "action=android.intent.action.VIEW;";
      if (fallbackUrl) {
        href += `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};`;
      }
      href += "end;";

      activateAR(href);
    });
  } else if (IS_IOS && !IS_IOS_SAFARI && !IS_IOS_CHROME) {
    productLink.setAttribute("ar", "unsupported_ios");
    productLink.dispatchEvent(
      new CustomEvent("initialized", { detail: "unsupported_ios" })
    );
    if (productLink.getAttribute("show-if-unsupported") != null) {
      productLink.addEventListener("click", () => {
        const fallbackUrl = productLink.getAttribute("fallback-url");
        if (fallbackUrl) {
          activateAR(encodeURIComponent(fallbackUrl));
        }
      });
    } else {
      productLink.setAttribute("pointer-events", "none");
    }
  } else {
    productLink.setAttribute("ar", "unsupported");
    productLink.dispatchEvent(
      new CustomEvent("initialized", { detail: "unsupported" })
    );
    if (productLink.getAttribute("show-if-unsupported") != null) {
      productLink.addEventListener("click", () => {
        const fallbackUrl = productLink.getAttribute("fallback-url");
        if (fallbackUrl) {
          activateAR(encodeURIComponent(fallbackUrl));
        }
      });
    } else {
      productLink.setAttribute("pointer-events", "none");
    }
  }
};

const updateConstructorAR = () => {
  let productLink = document.querySelector(".product-link");
  let model = document.getElementById("model");

  model.src = "sofa_yellow/Sofa_Yellow.glb";
  model.iosSrc = "sofa_yellow/Sofa_Yellow.usdz";

  initializeArButton(productLink, model.src, model.iosSrc);
};

updateConstructorAR();
