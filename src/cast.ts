import * as draw from "./draw.js";

/** World-space coordinates representing a position on the world plane. */
export interface Position {
    x: number;
    y: number;
}

/*
 * Note:
 * - World-space is divided into a grid of 64x64 unit tiles.
 * - Every wall is 64 units high.
 * - The player's point of view is 32 units above the floor.
 * - The player's field of view is 1 radian (~57 degrees).
 * - The projection plane is 200 units high, width depends on the aspect ratio
 *   of the framebuffer.
 */

/**
 * Renders walls by casting rays from the position looking at a direction for
 * each framebuffer column and drawing wall segments with height proportional
 * to their distance.
 */
export function render(fbuf: ImageData, pos: Position, dir: number): void {
    // Calculate the projection plane size in units.
    const projh = 200;
    const projw = projh * fbuf.width / fbuf.height;

    // Calculate the projection plane distance from the player.
    const fov = 1;
    const projd = (projw / 2) / Math.tan(fov / 2);

    // Calculate the angle for the ray cast for the first column and the delta
    // between angles of subsequent columns.
    let angle = dir - (fov / 2);
    const delta = fov / fbuf.width;

    // Cast a ray for each column in the framebuffer and render a wall segment.
    for (let column = 0; column < fbuf.width; column++) {
        const distance = cast(pos, angle);
        if (distance !== Infinity) {
            const corrected = distance * Math.cos(angle - dir);
            const height = 64 / corrected * projd;
            draw.column(fbuf, column, height);
        }

        // Render debug output of raycasting top-left.
        const len = distance === Infinity ? 100 : distance / 10;
        draw.line(fbuf, [100, 100], angle, len, draw.colorHex("#aaaaff"));

        angle += delta;
    }
}

/*
 * Casts a ray from the position at an angle clockwise from the x-axis of the
 * world (in radians) and returns the distance to the nearest wall, or Infinity
 * if no wall is within the maximum range.
 */
function cast(pos: Position, angle: number): number {
    // Precompute all necessary trigonometry.
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const tan = cos !== 0 ? sin / cos : undefined;
    const cot = sin !== 0 ? cos / sin : undefined;

    // Find which tile the position is in.
    let tilex = Math.floor(pos.x / 64) | 0;
    let tiley = Math.floor(pos.y / 64) | 0;

    // TODO: Find distance to next x and y-axis grid lines.
    // TODO: Find distance delta for each x and y-axis step, keep cardinal directions in mind.
    // TODO: Step the shorter distance and map tile until a hit.

    // TODO: Direction of last step indicates which side was hit.
    // TODO: Return color of wall hit.
    // TODO: Return texture column of wall hit position.

    return Infinity;
}
