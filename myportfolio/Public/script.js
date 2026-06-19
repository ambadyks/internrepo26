const revealItems = document.querySelectorAll(".reveal");
        const navLinks = document.querySelectorAll("nav a");
        const pageSections = document.querySelectorAll("main section[id]");
        const backToTop = document.querySelector(".back-to-top");
        const themeToggle = document.querySelector(".theme-toggle");
        const themeText = document.querySelector(".theme-text");

        const applyTheme = (theme) => {
            document.documentElement.setAttribute("data-theme", theme);
            themeText.textContent = theme === "dark" ? "Light" : "Dark";
            themeToggle.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
            localStorage.setItem("theme", theme);
        };

        const getInitialTheme = () => {
            const saved = localStorage.getItem("theme");
            if (saved === "dark" || saved === "light") return saved;
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        };

        applyTheme(getInitialTheme());

        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            applyTheme(current === "dark" ? "light" : "dark");
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: "0px 0px -50px 0px"
        });

        revealItems.forEach((item) => revealObserver.observe(item));

        const setActiveLink = () => {
            let currentSection = "";

            pageSections.forEach((section) => {
                const sectionTop = section.offsetTop - 150;

                if (window.scrollY >= sectionTop) {
                    currentSection = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                const isActive = currentSection !== "" && link.getAttribute("href") === `#${currentSection}`;
                link.classList.toggle("active", isActive);
            });
        };

        const toggleBackToTop = () => {
            backToTop.classList.toggle("show", window.scrollY > 500);
        };

        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        window.addEventListener("scroll", () => {
            setActiveLink();
            toggleBackToTop();
        });

        setActiveLink();
        toggleBackToTop();
