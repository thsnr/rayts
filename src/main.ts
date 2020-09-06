import * as cast from "./cast.js";
import * as draw from "./draw.js";

const canvas = document.getElementById("canvas");
const ctx = (canvas as HTMLCanvasElement).getContext("2d");

function frame(time: DOMHighResTimeStamp): void {
    const fbuf = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

    // Check columns.
    draw.column(fbuf, 10, fbuf.height >> 1);
    draw.column(fbuf, 20, fbuf.height >> 2, draw.colorRGBA(0xaa, 0xff, 0xaa));

    // Check all overloads of line.
    draw.line(fbuf, [0, 10], [100, 10]);
    draw.line(fbuf, [0, 20], [100, 20], draw.colorRGBA(0xaa, 0xaa, 0xff));
    draw.line(fbuf, [0, 30], 0.5, 100);
    draw.line(fbuf, [0, 40], 0.5, 100, draw.colorHex("#ffaaaa"));

    // Check all octants.
    for (let angle = 0; angle < 2*Math.PI; angle += 0.5) {
        draw.line(fbuf, [fbuf.width >> 1, fbuf.height >> 1], angle, 200);
    }

    cast.render(fbuf, {x: 0, y: 0}, 0);

    ctx.putImageData(fbuf, 0, 0);
    window.requestAnimationFrame(frame)
}
window.requestAnimationFrame(frame)
