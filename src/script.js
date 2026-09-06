const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");
const themeBtn = document.getElementById("themeBtn");

if (menuBtn && navbar) {
    menuBtn.addEventListener("click", () => {
        navbar.classList.toggle("active");
    });
}

document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
        navbar?.classList.remove("active");
    });
});

const savedTheme = localStorage.getItem("senesh-theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
    themeBtn.textContent = "☀";
} else {
    themeBtn.textContent = "◐";
}

themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");

    localStorage.setItem(
        "senesh-theme",
        isLight ? "light" : "dark"
    );

    themeBtn.textContent = isLight ? "☀" : "◐";
});

/* Scroll reveal */

const revealItems = document.querySelectorAll(
    ".section-title, .about-card, .service-card, .project-card, .contact-card"
);

revealItems.forEach((item) => {
    item.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealItems.forEach((item) => {
    revealObserver.observe(item);
});

/* Navbar scroll effect */

window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");

    if (!header) return;

    if (window.scrollY > 30) {
        header.style.boxShadow =
            "0 12px 35px rgba(0, 0, 0, 0.20)";
    } else {
        header.style.boxShadow = "none";
    }
});
