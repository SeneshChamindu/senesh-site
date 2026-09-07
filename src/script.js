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
const musicFloat = document.getElementById("musicFloat");
const bgMusic = document.getElementById("bgMusic");

let isDragging = false;
let moved = false;

let offsetX = 0;
let offsetY = 0;

bgMusic.volume = 0.7;

musicFloat.addEventListener("pointerdown", (e) => {
    isDragging = true;
    moved = false;

    const rect = musicFloat.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    musicFloat.setPointerCapture(e.pointerId);
});

musicFloat.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    moved = true;

    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    const maxX =
        window.innerWidth - musicFloat.offsetWidth;

    const maxY =
        window.innerHeight - musicFloat.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    musicFloat.style.left = `${x}px`;
    musicFloat.style.top = `${y}px`;

    musicFloat.style.right = "auto";
    musicFloat.style.bottom = "auto";
});

musicFloat.addEventListener("pointerup", async (e) => {
    isDragging = false;

    musicFloat.releasePointerCapture(e.pointerId);

    if (moved) return;

    if (bgMusic.paused) {
        await bgMusic.play();

        musicFloat.textContent = "⏸";
        musicFloat.classList.add("playing");
    } else {
        bgMusic.pause();

        musicFloat.textContent = "🎵";
        musicFloat.classList.remove("playing");
    }
});
