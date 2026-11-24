/* ===================================================================
 * DANIEL GARCÍA ARIZA (DGA) — Editorial Monograph Interactive Engine
 * Optical Window Parallax · Asymmetric Column Drift · Accessible Modals
 * =================================================================== */

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* -------------------------------------------------------------------
     * 0. ARCHITECTURAL EDITORIAL PRELOADER
     * ------------------------------------------------------------------- */
    function initPreloader() {
        const preloader = document.getElementById("preloader");
        if (!preloader) return;

        const bar = preloader.querySelector(".preloader__bar");
        const counter = document.getElementById("preloader-counter");
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 18) + 8;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if (bar) bar.style.width = "100%";
                if (counter) counter.textContent = "100%";
                setTimeout(() => {
                    preloader.classList.add("is-loaded");
                }, 280);
            } else {
                if (bar) bar.style.width = `${progress}%`;
                if (counter) counter.textContent = `${String(progress).padStart(2, "0")}%`;
            }
        }, 35);

        // Fallback safety timeout if window takes longer to trigger
        window.addEventListener("load", () => {
            if (progress < 100) {
                progress = 100;
                clearInterval(interval);
                if (bar) bar.style.width = "100%";
                if (counter) counter.textContent = "100%";
                setTimeout(() => {
                    preloader.classList.add("is-loaded");
                }, 200);
            }
        });
    }

    /* -------------------------------------------------------------------
     * 1. OPTICAL WINDOW PARALLAX & ASYMMETRIC COLUMN DRIFT
     * ------------------------------------------------------------------- */
    function initParallaxEngine() {
        if (prefersReducedMotion.matches) return;

        const blockLayers = Array.from(document.querySelectorAll("[data-parallax-speed]"));
        const imageLayers = Array.from(document.querySelectorAll("[data-img-parallax]"));
        const progressBar = document.querySelector(".scroll-progress");
        const supportsNativeScrollTimeline = CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)");

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const isMobile = window.innerWidth < 860;
            const dampener = isMobile ? 0.25 : 1;

            // Progress hairline fallback
            if (progressBar && !supportsNativeScrollTimeline) {
                const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
                const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
                progressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
            }

            // Asymmetric column drift (Hero plate & Exhibition pieces)
            blockLayers.forEach((el) => {
                if (el.hasAttribute("hidden")) return;
                const speed = parseFloat(el.dataset.parallaxSpeed || "0") * dampener;
                if (!speed) return;

                const rect = el.getBoundingClientRect();
                if (rect.bottom < -250 || rect.top > viewportHeight + 250) return;

                const centerOffset = rect.top + rect.height * 0.5 - viewportHeight * 0.5;
                const translateY = -centerOffset * speed;
                el.style.setProperty("--parallax-y", `${translateY.toFixed(1)}px`);
            });

            // Inner Optical Window Image Parallax (image glides inside its sharp frame)
            imageLayers.forEach((img) => {
                const container = img.parentElement;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

                const factor = parseFloat(img.dataset.imgParallax || "0.12");
                const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
                const shiftY = progress * rect.height * factor;

                img.style.setProperty("--img-parallax-y", `${shiftY.toFixed(1)}px`);
            });

            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        updateParallax();
    }

    /* -------------------------------------------------------------------
     * 2. SCROLL REVEAL (INTERSECTION OBSERVER)
     * ------------------------------------------------------------------- */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(".reveal-up");
        if (!revealElements.length) return;

        if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
            revealElements.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        revealElements.forEach((el) => observer.observe(el));
    }

    /* -------------------------------------------------------------------
     * 3. ACTIVE SECTION NAVIGATION SPY
     * ------------------------------------------------------------------- */
    function initScrollSpy() {
        const sections = document.querySelectorAll(".target-section");
        const navLinks = document.querySelectorAll(".main-nav__link");

        if (!("IntersectionObserver" in window) || !sections.length) return;

        const spyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("id");
                        navLinks.forEach((link) => {
                            const isMatch = link.getAttribute("href") === `#${id}`;
                            link.classList.toggle("is-active", isMatch);
                        });
                    }
                });
            },
            {
                rootMargin: "-35% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach((sec) => spyObserver.observe(sec));
    }

    /* -------------------------------------------------------------------
     * 4. MOBILE NAVIGATION DRAWER
     * ------------------------------------------------------------------- */
    function initMobileNav() {
        const toggleBtn = document.getElementById("mobile-nav-toggle");
        const drawer = document.getElementById("mobile-drawer");
        const mainContent = document.getElementById("main-content");
        if (!toggleBtn || !drawer) return;

        function setMenuState(isOpen) {
            toggleBtn.setAttribute("aria-expanded", String(isOpen));
            const label = toggleBtn.querySelector(".mobile-nav-toggle__label");
            if (label) label.textContent = isOpen ? "CERRAR" : "MENÚ";

            if (isOpen) {
                drawer.removeAttribute("hidden");
                if (mainContent) mainContent.setAttribute("inert", "");
                document.body.style.overflow = "hidden";
            } else {
                drawer.setAttribute("hidden", "");
                if (mainContent) mainContent.removeAttribute("inert");
                document.body.style.overflow = "";
            }
        }

        toggleBtn.addEventListener("click", () => {
            const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
            setMenuState(!expanded);
        });

        drawer.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenuState(false));
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
                setMenuState(false);
                toggleBtn.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 860 && toggleBtn.getAttribute("aria-expanded") === "true") {
                setMenuState(false);
            }
        });
    }

    /* -------------------------------------------------------------------
     * 5. EXHIBITION PORTFOLIO FILTERING
     * ------------------------------------------------------------------- */
    function initPortfolioFilters() {
        const filterButtons = document.querySelectorAll(".filter-tab");
        const workPieces = document.querySelectorAll(".work-piece");
        if (!filterButtons.length || !workPieces.length) return;

        filterButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const filter = btn.dataset.filter;

                filterButtons.forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle("is-active", active);
                    b.setAttribute("aria-selected", String(active));
                });

                workPieces.forEach((piece) => {
                    const match = filter === "all" || piece.dataset.category === filter;
                    if (match) {
                        piece.removeAttribute("hidden");
                        piece.classList.toggle("is-filtered", filter !== "all");
                    } else {
                        piece.setAttribute("hidden", "");
                    }
                });

                window.dispatchEvent(new Event("scroll"));
            });
        });
    }

    /* -------------------------------------------------------------------
     * 6. NATIVE <DIALOG> CASE STUDY MODALS
     * ------------------------------------------------------------------- */
    function initCaseModals() {
        const modalTriggers = document.querySelectorAll("[data-modal-target]");

        function openModalById(targetId) {
            const dialog = document.getElementById(targetId);
            if (dialog && typeof dialog.showModal === "function") {
                dialog.showModal();
            }
        }

        modalTriggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                openModalById(trigger.getAttribute("data-modal-target"));
            });

            if (trigger.getAttribute("role") === "button") {
                trigger.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openModalById(trigger.getAttribute("data-modal-target"));
                    }
                });
            }
        });

        document.querySelectorAll(".case-dialog").forEach((dialog) => {
            dialog.addEventListener("click", (event) => {
                const container = dialog.querySelector(".case-dialog__container");
                if (container && !container.contains(event.target)) {
                    dialog.close();
                }
            });
        });
    }

    /* -------------------------------------------------------------------
     * 7. EMAIL CLIPBOARD & FOOTER YEAR
     * ------------------------------------------------------------------- */
    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!copied) {
            throw new Error("Copy command failed");
        }
    }

    function initUtilities() {
        const copyBtn = document.getElementById("copy-email-btn");
        const copyText = document.getElementById("copy-email-text");

        if (copyBtn && copyText) {
            copyBtn.addEventListener("click", async () => {
                const email = copyBtn.dataset.email || "dani.dga@gmail.com";
                try {
                    await copyTextToClipboard(email);
                    const original = copyText.textContent;
                    copyText.textContent = "[ DIRECCIÓN COPIADA ✓ ]";
                    setTimeout(() => {
                        copyText.textContent = original;
                    }, 2400);
                } catch (_err) {
                    window.location.href = `mailto:${email}`;
                }
            });
        }

        document.querySelectorAll("[data-copy-email]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const email = btn.dataset.copyEmail || "dani.dga@gmail.com";
                const feedbackEl = btn.querySelector("[data-copy-feedback]");
                const defaultLabel = btn.dataset.copyLabel || "COPIAR";
                const copiedLabel = btn.dataset.copiedLabel || "COPIADO ✓";

                try {
                    await copyTextToClipboard(email);
                    if (feedbackEl) {
                        feedbackEl.textContent = copiedLabel;
                        setTimeout(() => {
                            feedbackEl.textContent = defaultLabel;
                        }, 2400);
                    }
                } catch (_err) {
                    window.location.href = `mailto:${email}`;
                }
            });
        });

        const yearEl = document.getElementById("current-year");
        if (yearEl) {
            yearEl.textContent = String(new Date().getFullYear());
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initPreloader();
        initParallaxEngine();
        initScrollReveal();
        initScrollSpy();
        initMobileNav();
        initPortfolioFilters();
        initCaseModals();
        initUtilities();
    });
})();
