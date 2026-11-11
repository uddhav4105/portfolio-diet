/* =========================================================
   DIETITIAN PORTFOLIO — SHARED VANILLA JAVASCRIPT
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {

  document.documentElement.classList.add("js-ready");


  // Automatically update the copyright year.
  document.querySelectorAll(".current-year").forEach(element => {
    element.textContent = new Date().getFullYear();
  });


  // Mobile navigation.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");


  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";


      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("open", !isOpen);
    });


    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });


    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.focus();
      }
    });


    // Close mobile navigation when moving to desktop layout.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }


  // Accessible scroll reveal. Falls back to visible content
  // for browsers without IntersectionObserver.
  const revealElements = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });


    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("visible"));
  }


  // Gentle scroll parallax for the layered photo compositions.
  const parallaxLayers = [...document.querySelectorAll("[data-parallax]")];
  if (parallaxLayers.length && !reduceMotion) {
    let parallaxFrame = 0;
    const updateParallax = () => {
      parallaxFrame = 0;
      const viewportCenter = window.innerHeight / 2;
      parallaxLayers.forEach(layer => {
        const bounds = layer.getBoundingClientRect();
        const distanceFromCenter = bounds.top + bounds.height / 2 - viewportCenter;
        const speed = Number(layer.dataset.parallax) || 0;
        const rotation = Number(layer.dataset.rotation) || 0;
        layer.style.transform = `rotate(${rotation}deg) translate3d(0, ${distanceFromCenter * speed * -1}px, 0)`;
      });
    };
    const requestParallaxUpdate = () => {
      if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
    };
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    requestParallaxUpdate();
  }


  // Scroll progress and pointer depth add motion without taking over the page.
  const progressRoot = document.documentElement;
  const siteHeader = document.querySelector(".site-header");
  const gallerySection = document.querySelector(".scroll-gallery");
  const galleryTrack = document.querySelector(".gallery-track");
  const galleryViewport = document.querySelector(".gallery-viewport");
  const galleryProgress = document.querySelector(".gallery-progress i");
  const galleryCounter = document.querySelector(".gallery-current");
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressRoot.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
    if (siteHeader) siteHeader.classList.toggle("scrolled", window.scrollY > 18);

    if (gallerySection && galleryTrack && galleryViewport && !reduceMotion && window.innerWidth > 760) {
      const stickyTop = 82;
      const stickyHeight = window.innerHeight - stickyTop;
      const travel = gallerySection.offsetHeight - stickyHeight;
      const sectionTop = gallerySection.getBoundingClientRect().top;
      const galleryPosition = travel > 0 ? Math.min(1, Math.max(0, (stickyTop - sectionTop) / travel)) : 0;
      const leftInset = parseFloat(getComputedStyle(galleryViewport).paddingLeft) || 0;
      const visibleWidth = galleryViewport.clientWidth - leftInset;
      const maxShift = Math.max(0, galleryTrack.scrollWidth - visibleWidth);
      galleryTrack.style.setProperty("--gallery-x", `${-maxShift * galleryPosition}px`);
      galleryTrack.style.setProperty("--gallery-progress", String(galleryPosition));
      if (galleryProgress) galleryProgress.style.transform = `scaleX(${galleryPosition})`;
      if (galleryCounter) {
        const activePanel = Math.min(4, Math.floor(galleryPosition * 4) + 1);
        galleryCounter.textContent = `${String(activePanel).padStart(2, "0")} — 04`;
      }
    }
  };
  window.addEventListener("scroll", () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  });
  updateProgress();

  const heroScene = document.querySelector(".hero-scene");
  if (heroScene && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    heroScene.addEventListener("pointermove", event => {
      const bounds = heroScene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      heroScene.style.setProperty("--tilt-x", `${x * 7}deg`);
      heroScene.style.setProperty("--tilt-y", `${y * -7}deg`);
    });
    heroScene.addEventListener("pointerleave", () => {
      heroScene.style.setProperty("--tilt-x", "0deg");
      heroScene.style.setProperty("--tilt-y", "0deg");
    });
  }


  // Rotate through hero and intro imagery; controls remain available by click.
  const sceneMain = document.querySelector("[data-scene-main]");
  const sceneSecondary = document.querySelector("[data-scene-secondary]");
  const sceneCaption = document.querySelector("[data-scene-caption]");
  const sceneChoices = [...document.querySelectorAll(".scene-choice")];
  const swapImage = (image, source, alt) => {
    if (!image || !source || image.src === source) return;
    const displayImage = () => {
      image.alt = alt;
      image.classList.remove("is-turning");
      image.src = source;
      if (!reduceMotion) {
        void image.offsetWidth;
        image.classList.add("is-turning");
        window.setTimeout(() => image.classList.remove("is-turning"), 950);
      }
    };
    const preload = new Image();
    preload.onload = displayImage;
    preload.onerror = displayImage;
    preload.src = source;
  };

  let activeScene = 0;
  const selectScene = index => {
    if (!sceneChoices.length) return;
    activeScene = (index + sceneChoices.length) % sceneChoices.length;
    const choice = sceneChoices[activeScene];
    sceneChoices.forEach(item => {
      const selected = item === choice;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    swapImage(sceneMain, choice.dataset.mainSrc, choice.dataset.mainAlt);
    swapImage(sceneSecondary, choice.dataset.secondarySrc, choice.dataset.secondaryAlt);
    if (sceneCaption) sceneCaption.textContent = choice.dataset.caption;
  };
  sceneChoices.forEach((choice, index) => choice.addEventListener("click", () => selectScene(index)));


  // Switch the intro between common nutrition priorities.
  const focusContent = {
    energy: {
      eyebrow: "A LITTLE LESS PRESSURE",
      title: "Nutrition should fit <em>into your life.</em>",
      body: "Food is culture, comfort, energy and connection. A good plan leaves space for all of it. Together, we can find small, steady changes that work with your preferences, routine and goals.",
      caption: "01 — FOOD FOR REAL LIFE",
      image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1100&q=85",
      alt: "Fresh ingredients prepared for a shared meal"
    },
    confidence: {
      eyebrow: "MORE CONFIDENCE, LESS RULES",
      title: "Find a calmer way <em>to eat well.</em>",
      body: "Let go of all-or-nothing thinking. Build flexible habits, learn what works for you and make everyday food choices with a little more confidence.",
      caption: "02 — CONFIDENCE AROUND FOOD",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1100&q=85",
      alt: "A colourful, balanced meal ready to share"
    },
    health: {
      eyebrow: "CARE THAT SEES THE WHOLE YOU",
      title: "Support for your <em>health and goals.</em>",
      body: "Your health history, preferences and day-to-day life all belong in the conversation. Get practical, individual guidance that works alongside your existing care.",
      caption: "03 — PERSONAL NUTRITION SUPPORT",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=85",
      alt: "A sample nutrition consultation in a bright office"
    }
  };
  const focusChoices = [...document.querySelectorAll(".focus-choice")];
  const focusImage = document.querySelector("[data-focus-image]");
  const focusEyebrow = document.querySelector("[data-focus-eyebrow]");
  const focusTitle = document.querySelector("[data-focus-title]");
  const focusBody = document.querySelector("[data-focus-body]");
  const focusCaption = document.querySelector("[data-focus-caption]");

  let activeFocus = "energy";
  const selectFocus = key => {
    const content = focusContent[key];
    if (!content) return;
    activeFocus = key;
    focusChoices.forEach(item => {
      const selected = item.dataset.focus === key;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    if (focusEyebrow) focusEyebrow.textContent = content.eyebrow;
    if (focusTitle) focusTitle.innerHTML = content.title;
    if (focusBody) focusBody.textContent = content.body;
    if (focusCaption) focusCaption.textContent = content.caption;
    swapImage(focusImage, content.image, content.alt);
  };
  focusChoices.forEach(choice => choice.addEventListener("click", () => selectFocus(choice.dataset.focus)));

  const addAutoRotation = (element, interval, advance) => {
    if (!element || reduceMotion) return;
    let timer;
    const start = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(advance, interval);
    };
    const stop = () => window.clearInterval(timer);
    element.addEventListener("pointerenter", stop);
    element.addEventListener("pointerleave", start);
    element.addEventListener("focusin", stop);
    element.addEventListener("focusout", event => {
      if (!element.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    start();
  };
  addAutoRotation(sceneChoices.length ? heroScene : null, 6200, () => selectScene(activeScene + 1));
  addAutoRotation(document.querySelector(".intro-section"), 7600, () => {
    const keys = Object.keys(focusContent);
    selectFocus(keys[(keys.indexOf(activeFocus) + 1) % keys.length]);
  });


  // Testimonial carousel.
  const testimonials = [...document.querySelectorAll(".testimonial")];
  const previousButton = document.getElementById("prev-testimonial");
  const nextButton = document.getElementById("next-testimonial");
  const counter = document.getElementById("testimonial-count");
  let activeTestimonial = 0;


  function showTestimonial(index) {
    if (!testimonials.length) return;


    activeTestimonial = (index + testimonials.length) % testimonials.length;


    testimonials.forEach((item, i) => {
      item.classList.toggle("active", i === activeTestimonial);
    });


    if (counter) {
      counter.textContent =
        `${String(activeTestimonial + 1).padStart(2, "0")} / ${String(testimonials.length).padStart(2, "0")}`;
    }
  }


  if (previousButton && nextButton && testimonials.length) {
    previousButton.addEventListener("click", () => {
      showTestimonial(activeTestimonial - 1);
    });


    nextButton.addEventListener("click", () => {
      showTestimonial(activeTestimonial + 1);
    });


    showTestimonial(0);
  }


  // Contact form: native validation + endpoint submission.
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");


  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async event => {
      event.preventDefault();


      formStatus.textContent = "";
      formStatus.className = "form-status";


      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }


      const endpoint = contactForm.getAttribute("action");


      // Demo mode confirms the interaction without sending or saving personal data.
      if (contactForm.dataset.demo === "true") {
        formStatus.textContent =
          "Thanks! This demo form does not send or store enquiries. Connect a form service before publishing.";
        formStatus.classList.add("success");
        contactForm.reset();
        return;
      }

      if (!endpoint) {
        formStatus.textContent =
          "The enquiry form is not connected yet. Please use the contact details provided.";
        formStatus.classList.add("error");
        return;
      }


      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;


      submitButton.disabled = true;
      submitButton.textContent = "Sending...";


      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { "Accept": "application/json" }
        });


        if (!response.ok) {
          throw new Error("Form submission failed.");
        }


        contactForm.reset();
        formStatus.textContent =
          "Thank you! Your enquiry has been received. We will be in touch soon.";
        formStatus.classList.add("success");


      } catch (error) {
        formStatus.textContent =
          "Sorry, your message could not be sent. Please try again or contact us directly.";
        formStatus.classList.add("error");


      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }


  // Accessible FAQ: native HTML details elements are used,
  // so keyboard support is built in without extra JavaScript.


});
