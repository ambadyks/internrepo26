const revealItems = document.querySelectorAll(".reveal");
        const navLinks = document.querySelectorAll("nav a");
        const pageSections = document.querySelectorAll("main section[id]");
        const backToTop = document.querySelector(".back-to-top");

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
                link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
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
