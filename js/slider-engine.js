const SliderEngine = {
    images: [
        "imageSlider/slide1.jpg",
        "imageSlider/slide2.jpg",
        "imageSlider/slide3.jpg"
    ],

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div class="swiper mainSlider w-full h-full">
        <div class="swiper-wrapper">
        ${this.images.map(img => `
            <div class="swiper-slide">
            <img src="${img}">
            </div>
            `).join('')}
            </div>
            </div>
            `;
            this.initSwiper();
    },

    initSwiper() {
        const check = setInterval(() => {
            if (typeof Swiper !== 'undefined') {
                clearInterval(check);
                new Swiper('.mainSlider', {
                    loop: true,
                    effect: 'fade',
                    autoplay: { delay: 5000, disableOnInteraction: false },
                    speed: 2000
                });
            }
        }, 100);
    }
};
