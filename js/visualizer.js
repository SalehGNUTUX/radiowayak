const Visualizer = {
    animationId: null,

    start(analyser) {
        const canvas = document.getElementById('visualizer-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                const r = 59 + (i * 2);
                const g = 130;
                const b = 246;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${barHeight/100})`;
                ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    },

    stop() {
        cancelAnimationFrame(this.animationId);
    }
};
