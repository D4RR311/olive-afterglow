"use strict";


/* =========================================
   CONFIGURATION
========================================= */

const CONFIG = {

    APPS_SCRIPT_URL:
        "https://script.google.com/macros/s/AKfycbwPXW5AvSBgqCzTY1tRq18LVu73UqN4Y_lDIsi1sM2FoYbUNhomoEvheI3uNwLFeOhl6w/exec",

    WEDDING_DATE:
        "2026-09-17T09:15:00+07:00",

    MAX_WISHES:
        50
};


/* =========================================
   DOM
========================================= */

const opening =
    document.getElementById("opening");

const openInvitation =
    document.getElementById("openInvitation");

const mainContent =
    document.getElementById("mainContent");

const weddingMusic =
    document.getElementById("weddingMusic");

const musicToggle =
    document.getElementById("musicToggle");

const musicIcon =
    document.getElementById("musicIcon");

const rsvpForm =
    document.getElementById("rsvpForm");

const rsvpMessage =
    document.getElementById("rsvpMessage");

const wishForm =
    document.getElementById("wishForm");

const wishMessage =
    document.getElementById("wishMessage");

const wishText =
    document.getElementById("wishText");

const wishCount =
    document.getElementById("wishCount");

const wishesList =
    document.getElementById("wishesList");


/* =========================================
   HELPERS
========================================= */

function setMessage(element, message, isError = false) {

    element.textContent = message;

    element.classList.toggle(
        "error",
        isError
    );
}


function isApiConfigured() {

    return (
        CONFIG.APPS_SCRIPT_URL &&
        !CONFIG.APPS_SCRIPT_URL.includes(
            "GANTI_DENGAN"
        )
    );
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


/* =========================================
   OPEN INVITATION
========================================= */

openInvitation.addEventListener(
    "click",
    async () => {

        opening.classList.add(
            "is-hidden"
        );

        mainContent.classList.add(
            "is-visible"
        );

        mainContent.setAttribute(
            "aria-hidden",
            "false"
        );

        try {

            await weddingMusic.play();

            updateMusicControl(true);

        } catch (error) {

            /*
             * Jika browser tetap menolak audio,
             * website tetap berjalan normal.
             */

            updateMusicControl(false);

        }

        loadGuestWishes();

    }
);


/* =========================================
   MUSIC
========================================= */

function updateMusicControl(isPlaying) {

    if (isPlaying) {

        musicIcon.textContent = "♪";

        musicToggle.setAttribute(
            "aria-label",
            "Matikan musik"
        );

        musicToggle.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        musicIcon.textContent = "×";

        musicToggle.setAttribute(
            "aria-label",
            "Nyalakan musik"
        );

        musicToggle.setAttribute(
            "aria-pressed",
            "false"
        );
    }
}


musicToggle.addEventListener(
    "click",
    async () => {

        if (weddingMusic.paused) {

            try {

                await weddingMusic.play();

                updateMusicControl(true);

            } catch (error) {

                updateMusicControl(false);

            }

        } else {

            weddingMusic.pause();

            updateMusicControl(false);

        }

    }
);


/* =========================================
   COUNTDOWN
========================================= */

const targetDate =
    new Date(CONFIG.WEDDING_DATE);


function updateCountdown() {

    const now =
        new Date();

    const difference =
        targetDate.getTime() -
        now.getTime();


    if (difference <= 0) {

        document
            .getElementById("countdown")
            .classList.add("hidden");

        document
            .getElementById("eventPassed")
            .classList.remove("hidden");

        return;
    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const days =
        Math.floor(
            totalSeconds / 86400
        );


    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    document.getElementById("days")
        .textContent =
        String(days).padStart(2, "0");


    document.getElementById("hours")
        .textContent =
        String(hours).padStart(2, "0");


    document.getElementById("minutes")
        .textContent =
        String(minutes).padStart(2, "0");


    document.getElementById("seconds")
        .textContent =
        String(seconds).padStart(2, "0");
}


updateCountdown();

setInterval(
    updateCountdown,
    1000
);


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList
                                .add("visible");

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        element => observer.observe(element)
    );

} else {

    revealElements.forEach(
        element =>
            element.classList.add(
                "visible"
            )
    );
}


/* =========================================
   RSVP
========================================= */

rsvpForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!isApiConfigured()) {

            setMessage(
                rsvpMessage,
                "Backend belum dikonfigurasi.",
                true
            );

            return;
        }


        const submitButton =
            rsvpForm.querySelector(
                "button[type='submit']"
            );


        const name =
            document
                .getElementById("rsvpName")
                .value
                .trim();


        const statusInput =
            rsvpForm.querySelector(
                "input[name='status']:checked"
            );


        const status =
            statusInput
                ? statusInput.value
                : "";


        if (
            name.length < 2 ||
            name.length > 80
        ) {

            setMessage(
                rsvpMessage,
                "Nama harus terdiri dari 2–80 karakter.",
                true
            );

            return;
        }


        if (
            !["Hadir", "Tidak hadir"]
                .includes(status)
        ) {

            setMessage(
                rsvpMessage,
                "Silakan pilih status kehadiran.",
                true
            );

            return;
        }


        submitButton.disabled = true;

        submitButton.textContent =
            "Mengirim...";

        setMessage(
            rsvpMessage,
            "Mengirim konfirmasi..."
        );


        try {

            const body =
                new URLSearchParams({

                    action:
                        "submitRsvp",

                    name:
                        name,

                    status:
                        status

                });


            const response =
                await fetch(
                    CONFIG.APPS_SCRIPT_URL,
                    {
                        method: "POST",
                        body: body
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP error"
                );
            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "Data gagal disimpan."
                );
            }


            setMessage(
                rsvpMessage,
                "Terima kasih. Konfirmasi kehadiran berhasil dikirim."
            );


            rsvpForm.reset();


        } catch (error) {

            console.error(error);

            setMessage(
                rsvpMessage,
                "Maaf, terjadi kendala. Silakan coba kembali.",
                true
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Kirim Konfirmasi";

        }

    }
);


/* =========================================
   WISH CHARACTER COUNT
========================================= */

wishText.addEventListener(
    "input",
    () => {

        wishCount.textContent =
            wishText.value.length;

    }
);


/* =========================================
   SUBMIT WISH
========================================= */

wishForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!isApiConfigured()) {

            setMessage(
                wishMessage,
                "Backend belum dikonfigurasi.",
                true
            );

            return;
        }


        const submitButton =
            wishForm.querySelector(
                "button[type='submit']"
            );


        const name =
            document
                .getElementById("wishName")
                .value
                .trim();


        const wish =
            wishText
                .value
                .trim();


        if (
            name.length < 2 ||
            name.length > 80
        ) {

            setMessage(
                wishMessage,
                "Nama harus terdiri dari 2–80 karakter.",
                true
            );

            return;
        }


        if (!wish) {

            setMessage(
                wishMessage,
                "Ucapan tidak boleh kosong.",
                true
            );

            return;
        }


        if (wish.length > 500) {

            setMessage(
                wishMessage,
                "Ucapan maksimal 500 karakter.",
                true
            );

            return;
        }


        submitButton.disabled = true;

        submitButton.textContent =
            "Mengirim...";


        setMessage(
            wishMessage,
            "Mengirim ucapan..."
        );


        try {

            const body =
                new URLSearchParams({

                    action:
                        "submitWish",

                    name:
                        name,

                    wish:
                        wish

                });


            const response =
                await fetch(
                    CONFIG.APPS_SCRIPT_URL,
                    {
                        method: "POST",
                        body: body
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP error"
                );
            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "Ucapan gagal disimpan."
                );
            }


            setMessage(
                wishMessage,
                "Terima kasih atas ucapan dan doanya."
            );


            wishForm.reset();

            wishCount.textContent = "0";


            await loadGuestWishes();


        } catch (error) {

            console.error(error);

            setMessage(
                wishMessage,
                "Maaf, ucapan belum dapat dikirim. Silakan coba lagi.",
                true
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Kirim Ucapan";

        }

    }
);


/* =========================================
   LOAD GUEST WISHES
========================================= */

async function loadGuestWishes() {

    if (!isApiConfigured()) {

        wishesList.innerHTML = `
            <div class="wishes-empty">
                Guest wishes akan aktif setelah
                Google Apps Script dikonfigurasi.
            </div>
        `;

        return;
    }


    wishesList.innerHTML = `
        <div class="wishes-loading">
            Memuat ucapan...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${CONFIG.APPS_SCRIPT_URL}?action=getWishes`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error"
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.error ||
                "Gagal mengambil ucapan."
            );
        }


        renderWishes(
            result.data || []
        );


    } catch (error) {

        console.error(error);

        wishesList.innerHTML = `
            <div class="wishes-error">
                Ucapan belum dapat dimuat.
                Silakan coba lagi nanti.
            </div>
        `;
    }
}


/* =========================================
   RENDER GUEST WISHES
========================================= */

function renderWishes(wishes) {

    if (!wishes.length) {

        wishesList.innerHTML = `
            <div class="wishes-empty">
                Belum ada ucapan.
                Jadilah yang pertama memberikan ucapan.
            </div>
        `;

        return;
    }


    wishesList.innerHTML =
        wishes
            .slice(0, CONFIG.MAX_WISHES)
            .map(wish => {

                const safeName =
                    escapeHtml(wish.name);

                const safeWish =
                    escapeHtml(wish.wish);

                let dateText = "";


                if (wish.timestamp) {

                    const date =
                        new Date(
                            wish.timestamp
                        );


                    if (
                        !Number.isNaN(
                            date.getTime()
                        )
                    ) {

                        dateText =
                            date.toLocaleString(
                                "id-ID",
                                {
                                    dateStyle:
                                        "medium",
                                    timeStyle:
                                        "short"
                                }
                            );
                    }
                }


                return `
                    <article class="wish-item">

                        <h3 class="wish-name">
                            ${safeName}
                        </h3>

                        <p class="wish-text">
                            ${safeWish}
                        </p>

                        ${
                            dateText
                                ? `
                                    <small class="wish-time">
                                        ${dateText}
                                    </small>
                                `
                                : ""
                        }

                    </article>
                `;

            })
            .join("");
}
