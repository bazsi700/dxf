import { V2 } from 'vecks'

/**
 * Create the arcs point for a LWPOLYLINE. The start and end are excluded
 *
 * See diagram.png in this directory for description of points and angles used.
 */
export default (from, to, bulge, resolution) => {
  // Resolution in degrees
  if (!resolution) {
    resolution = 5
  }

  // If the bulge is < 0, the arc goes clockwise. So we simply
  // reverse a and b and invert sign
  // Bulge = tan(theta/4)
  let theta
  let a
  let b

  if (bulge < 0) {
    theta = Math.atan(-bulge) * 4
    a = new V2(from[0], from[1])
    b = new V2(to[0], to[1])
  } else {
    // Default is counter-clockwise
    theta = Math.atan(bulge) * 4
    a = new V2(to[0], to[1])
    b = new V2(from[0], from[1])
  }

  const ab = b.sub(a)
  const lengthAB = ab.length()
  const c = a.add(ab.multiply(0.5))

  // Distance from center of arc to line between form and to points
  const lengthCD = Math.abs(lengthAB / 2 / Math.tan(theta / 2))
  const normAB = ab.norm()

  let d
  if (theta < Math.PI) {
    const normDC = new V2(
      normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2),
      normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2),
    )
    // D is the center of the arc
    d = c.add(normDC.multiply(-lengthCD))
  } else {
    const normCD = new V2(
      normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2),
      normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2),
    )
    // D is the center of the arc
    d = c.add(normCD.multiply(lengthCD))
  }

  // Add points between start start and eng angle relative
  // to the center point
  const startAngle = Math.atan2(b.y - d.y, b.x - d.x)
  let endAngle = Math.atan2(a.y - d.y, a.x - d.x)
  if (endAngle < startAngle) {
    endAngle += Math.PI * 2
  }
  const r = b.sub(d).length()

  return [{ centre: [d.x, d.y], radius: r, startAngle, endAngle }]
}
