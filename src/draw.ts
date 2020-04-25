/**
 * Screen-space coordinates representing a point on the screen. The origin
 * point (0, 0) is top-left, the first axis grows from left to right, and the
 * second axis grows from top to bottom.
 */
export type Point = [number, number];

/**
 * Red, green, blue, and alpha color channel values encoded in a 4-element
 * array of 8-bit integers.
 */
export type Color = [number, number, number, number];

export const ColorBlack: Color = colorRGBA(0, 0, 0);

export const ColorDefault: Color = ColorBlack;

/** Returns a color with given red, green, blue, and alpha channel values. */
export function colorRGBA(r: number, g: number, b: number, a: number = 255): Color {
    return [r & 0xff, g & 0xff, b & 0xff, a & 0xff];
}

/** Parses a "#rrggbb" color code and calls colorRGBA. */
export function colorHex(hex: string, a: number = 255): Color {
    const match = hex.match(/^#([0-9a-f]{6})$/i);
    if (match === null) {
        throw "invalid hex value";
    }
    const rgb = parseInt(match[1], 16);
    return colorRGBA(
        (rgb & 0xff0000) >> 16,
        (rgb & 0x00ff00) >> 8,
        (rgb & 0x0000ff),
        a,
    );
}

/** Draws a pixel in the framebuffer at the given point. */
export function pixel(fbuf: ImageData, p: Point, color: Color = ColorDefault): void {
    const offset = 4 * ((p[0] | 0) + fbuf.width * (p[1] | 0));
    fbuf.data[offset+0] = color[0];
    fbuf.data[offset+1] = color[1];
    fbuf.data[offset+2] = color[2];
    fbuf.data[offset+3] = color[3];
}

/**
 * Draws a vertically centered column of pixels in the framebuffer at offset x
 * from the left with the given height.
 */
export function column(fbuf: ImageData, x: number, height: number,
                       color: Color = ColorDefault): void {
    if (height > fbuf.height) {
        height = fbuf.height;
    }
    let y = (fbuf.height - height) >> 1;
    for (let i = 0; i < height; i++) {
        pixel(fbuf, [x, y++], color);
    }
}

/** Draws a line in the framebuffer from point a to point b. */
export function line(fbuf: ImageData, a: Point, b: Point, color?: Color): void;

/**
 * Draws a line in the framebuffer starting from the origin point, rotated
 * clockwise from the horizontal axis (in radians), with the given length.
 */
export function line(fbuf: ImageData, origin: Point, angle: number, length: number,
                     color?: Color): void;

/**
 * Draws a line in the framebuffer. Can be called in two forms:
 *
 * 1. Given two points, draws a line between the points.
 * 2. Given an origin point, an angle in radians, and a length, draws a line
 *    from the origin point, rotated clockwise from the horizontal axis, with
 *    the given length.
 *
 * Both forms take a color as an optional last argument; if none given, then
 * ColorDefault is used.
 */
export function line(fbuf: ImageData, point: Point, pointOrAngle: Point | number,
                     colorOrLength?: Color | number, color?: Color): void {
    const a = point;

    if (typeof pointOrAngle === "object") {
        var b = pointOrAngle as Point;
        color = colorOrLength as Color;
    } else {
        const angle = pointOrAngle as number;
        const length = colorOrLength as number;

        const x = point[0] + Math.floor(length * Math.cos(angle));
        const y = point[1] + Math.floor(length * Math.sin(angle));
        var b: Point = [x, y];
    }

    if (typeof color === "undefined") {
        color = ColorDefault;
    }

    bresenham(fbuf, a, b, color);
}

/*
 * Bresenham's line algorithm ported from Graphics Programming Black Book
 * by Michael Abrash.
 */
function bresenham(fbuf: ImageData, a: Point, b: Point, color: Color): void {
    // This algorithm can only draw lines with integer endpoints.
    a = [a[0] | 0, a[1] | 0];
    b = [b[0] | 0, b[1] | 0];

    // Switch coordinates so that all cases are in octants 0-3.
    if (a[1] > b[1]) {
        [a, b] = [b, a];
    }
    let dx = b[0] - a[0]; // Will be converted to absolute value later.
    const dy = b[1] - a[1];

    // Set u to the major and v to the minor-axis of the line being drawn. su
    // and sv are the steps that we must take along these axis. This way we can
    // use the same code for all four octants 0-3.
    let u, v, du, dv, su, sv;
    if (dx > 0) {
        if (dx > dy) {
            u = a[0]; du = dx; su = 1;
            v = a[1]; dv = dy; sv = 1;
        } else {
            u = a[1]; du = dy; su = 1;
            v = a[0]; dv = dx; sv = 1;
        }
    } else {
        dx = -dx;
        if (dx > dy) {
            u = a[0]; du = dx; su = -1;
            v = a[1]; dv = dy; sv =  1;
        } else {
            u = a[1]; du = dy; su =  1;
            v = a[0]; dv = dx; sv = -1;
        }
    }

    let e = 2*dv - du;
    const dv2mdu2 = 2*dv - 2*du;
    const dv2 = 2*dv;
    pixel(fbuf, a, color);
    while (du--) {
        if (e >= 0) {
            v += sv;
            e += dv2mdu2;
        } else {
            e += dv2;
        }
        u += su;
        if (dx > dy) {
            pixel(fbuf, [u, v], color);
        } else {
            pixel(fbuf, [v, u], color);
        }
    }
}
