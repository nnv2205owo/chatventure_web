(function () {
    let grad = new Date(1645682905917),
        now = new Date(1645682905917 + 60 * 1000 - 22 * 1000);
    let time_left = 90,
        crr_ms = now.getMilliseconds() - grad.getMilliseconds(),
        prv_ms = crr_ms,
        crr_s = now.getSeconds() - grad.getSeconds(),
        crr_mi = now.getMinutes() - grad.getMinutes(),
        crr_h = now.getHours() - grad.getHours();

    if (crr_ms < 0) {
        crr_ms += 1000;
        crr_s -= 1;
    }

    if (crr_s < 0) {
        crr_s += 60;
        crr_mi -= 1;
    }

    if (crr_mi < 0) {
        crr_mi += 60;
        crr_h -= 1;
    }

    let crr = {
        ms: crr_ms,
        s: crr_s,
        mi: crr_mi,
        h: crr_h
    };

    function clear(ctx) {
        ctx.clearRect(0, 0, 80, 80);
    }

    function setTrack(ctx) {
        ctx.strokeStyle = "hsla(2, 8%, 46%, 0.45)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(36, 36, 27, 0, Math.PI * 2);
        ctx.stroke();
    }

    function setTime(ctx, until, now, total, type) {
        ctx.textAlign = "center";
        ctx.font = "1rem Nunito";

        if (type === "ms") {
            crr_ms = Math.floor(now - (until % total));
            if (crr_ms < 0) crr_ms += 1000;
            if (prv_ms > crr_ms) {
                crr_s += 1;
                time_left -= 1;
                if (time_left < 0) time_left += 90;
                if (crr_s === 60) {
                    crr_s = 0;
                    crr_mi += 1;
                    if (crr_mi === 60) {
                        crr_mi = 0;
                        crr_h += 1;
                    }
                }
            }
            ctx.fillText(time_left, 36, 40);
            ctx.fillStyle = "#f13057";

            crr = {
                ms: crr_ms,
                s: crr_s,
                mi: crr_mi,
                h: crr_h
            };

            prv_ms = crr_ms;
        } else {
            // console.log(crr)
            ctx.fillText(crr[type], 36, 40);
            ctx.fillStyle = "#0e0303";
        }

        ctx.strokeStyle = "hsl(2, 8%, 46%)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        let circle = true;
        if (type === "ms") circle = false;
        ctx.arc(
            36,
            36,
            27,
            Math.PI / -2,
            Math.PI * 2 * (-(crr[type] % total) / total) + Math.PI / -2,
            circle
        );
        ctx.stroke();
    }

    function numberOfDays(year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    }

    var h = document.getElementById("hours").getContext("2d"),
        mi = document.getElementById("minutes").getContext("2d"),
        s = document.getElementById("seconds").getContext("2d"),
        ms = document.getElementById("milliseconds").getContext("2d"),
        monthDays = {
            cache: {},
            getTotalDaysInMonth: function (year, month) {
                if (!this.cache[year]) {
                    this.cache[year] = {};
                }
                if (!this.cache[year][month]) {
                    this.cache[year][month] = new Date(year, month + 1, 0).getDate();
                }
                return this.cache[year][month];
            }
        };

    function set() {
        var today = new Date();

        clear(h);
        setTrack(h);
        setTime(h, grad.getHours(), today.getHours(), 24, "h");

        clear(mi);
        setTrack(mi);
        setTime(mi, grad.getMinutes(), today.getMinutes(), 60, "mi");

        clear(s);
        setTrack(s);
        setTime(s, grad.getSeconds(), today.getSeconds(), 60, "s");

        clear(ms);
        setTrack(ms);
        setTime(ms, grad.getMilliseconds(), today.getMilliseconds(), 1000, "ms");

        requestAnimationFrame(set);
    }

    requestAnimationFrame(set);
})();
