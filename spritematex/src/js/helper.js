"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dom = void 0;
exports.status = status;
exports.tipoftheday = tipoftheday;
exports.toggle_fullscreen = toggle_fullscreen;
exports.dom = {
    add_class: function (target, source) {
        if (this.is_canvas(target)) {
            target.classList.add(source);
        }
        else {
            document.querySelector(target)?.classList.add(source);
        }
    },
    append: function (target, source) {
        const t = document.querySelector(target);
        t.innerHTML = source;
    },
    /** add html element ie a canvas to target */
    append_element: function (target, source) {
        document.querySelector(target)?.appendChild(source);
    },
    /** changes the attribute of an element */
    attr: function (target, attribute, value) {
        document.querySelector(target)?.setAttribute(attribute, value);
    },
    css: function (target, property, value) {
        document.querySelector(target).style[property] = value;
    },
    disabled(target, state) {
        document.querySelectorAll(target).forEach((element) => {
            element.disabled = state;
        });
    },
    empty(target) {
        document.querySelector(target).innerHTML = "";
    },
    fade_in(target, delay_milliseconds = 0, fade_milliseconds = 1000) {
        const fadeTarget = document.querySelector(target);
        setTimeout(function () {
            fadeTarget.style.opacity = 0;
            fadeTarget.style.transition = "opacity " + fade_milliseconds / 1000 + "s";
            fadeTarget.style.opacity = 1;
        }, delay_milliseconds);
    },
    fade_out(target, delay_milliseconds = 0, fade_milliseconds = 1000) {
        const fadeTarget = document.querySelector(target);
        setTimeout(function () {
            fadeTarget.style.opacity = 1;
            fadeTarget.style.transition = "opacity " + fade_milliseconds / 1000 + "s";
            fadeTarget.style.opacity = 0;
        }, delay_milliseconds);
    },
    /** fade opacity TARGET, FROM VALUE, TO VALUE, MILLISECONDS */
    fade(target, from_opacity, to_opacity, fade_milliseconds = 200) {
        const fadeTarget = document.querySelectorAll(target);
        fadeTarget.forEach((element) => {
            if (element.style.opacity != to_opacity) {
                setTimeout(function () {
                    element.style.opacity = from_opacity;
                    element.style.transition =
                        "opacity " + fade_milliseconds / 1000 + "s";
                    element.style.opacity = to_opacity;
                });
            }
        });
    },
    get_css: function (target, property) {
        return document.querySelector(target).style[property];
    },
    hide(target) {
        document.querySelector(target).style.display = "none";
    },
    html(target, text) {
        document.querySelector(target).innerHTML = text;
    },
    is_canvas(i) {
        return i instanceof HTMLCanvasElement;
    },
    remove_all_class: function (target, source) {
        document.querySelectorAll(target).forEach((element) => {
            element.classList.remove(source);
        });
    },
    remove_all_elements: function (target) {
        document.querySelectorAll(target).forEach((element) => {
            element.remove();
        });
    },
    remove_class: function (target, source) {
        document.querySelector(target)?.classList.remove(source);
    },
    show(target) {
        document.querySelector(target).style.display = "block";
    },
    /** selects an element from the dom and returns it */
    sel(target) {
        return document.querySelector(target);
    },
    /** if no value is given, returns the current value */
    val(target, value) {
        if (value) {
            document.querySelector(target).value = value;
        }
        return document.querySelector(target).value;
    },
    /** if no value is given, returns the current value */
    isChecked(target) {
        return document.querySelector(target).checked;
    },
};
function status(text, state = "normal") {
    let delay = 2000;
    const fade = 2000;
    if (state == "tip")
        delay = 10000;
    exports.dom.html("#statustext", text);
    exports.dom.fade_out("#statustext", delay, fade);
}
function tipoftheday() {
    const tips = [
        "Hold shift while clicking to delete pixels.",
        "You can change and define your own colors in the settings.",
        "Press 'z' for undo and 'shift + z' for redo.",
        "You can position all windows how you like it best. SpritemateX remembers that for your next visit!",
        "Sort your sprites by dragging them around with your mouse!",
        "Right click on your sprite in the preview window to save it as PNG (works in Chrome at least).",
    ];
    const chosen_tooltip = "Tip Of The Day: " + tips[Math.floor(Math.random() * tips.length)];
    status(chosen_tooltip, "tip");
}
function toggle_fullscreen() {
    if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        }
        else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
//# sourceMappingURL=helper.js.map