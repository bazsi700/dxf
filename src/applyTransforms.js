/**
 * Apply the transforms to the polyline.
 *
 * @param polyline the polyline
 * @param transform the transforms array
 * @returns the transformed polyline
 */
export default (polyline, transforms) => {
  transforms.forEach((transform) => {
    polyline = polyline.map(function (p) {
      // Use a copy to avoid side effects
      const transformPoint = (p2) => {
        if (transform.scaleX) {
          p2[0] = p2[0] * transform.scaleX
        }
        if (transform.scaleY) {
          p2[1] = p2[1] * transform.scaleY
        }
        if (transform.rotation) {
          const angle = (transform.rotation / 180) * Math.PI
          p2 = [
            p2[0] * Math.cos(angle) - p2[1] * Math.sin(angle),
            p2[1] * Math.cos(angle) + p2[0] * Math.sin(angle),
          ]
        }
        if (transform.x) {
          p2[0] = p2[0] + transform.x
        }
        if (transform.y) {
          p2[1] = p2[1] + transform.y
        }
        // Observed once in a sample DXF - some cad applications
        // use negative extruxion Z for flipping
        if (transform.extrusionZ === -1) {
          p2[0] = -p2[0]
        }
        return p2
      }
      if (p.centre === undefined) {
        const p2 = [p[0], p[1]]
        return transformPoint(p2)
      } else {
        const centre = transformPoint(p.centre)
        let radius = p.radius
        let startAngle = p.startAngle
        let endAngle = p.endAngle
        if (!transform.scaleX) {
          transform.scaleX = 1
        }
        if (!transform.scaleY) {
          transform.scaleY = 1
        }
        if (
          Math.abs(Math.abs(transform.scaleX) / Math.abs(transform.scaleY)) <
            1 - 0.0001 ||
          1 + 0.0001 <
            Math.abs(Math.abs(transform.scaleX) / Math.abs(transform.scaleY))
        ) {
          console.log(
            'ERROR: Tried scaling a circle arc into an ellipse arc',
            polyline,
            transforms,
            transform,
          )
        }
        radius = radius * Math.abs(transform.scaleX)
        if (transform.scaleX < 0) {
          const newStart = Math.PI * 2 - endAngle + Math.PI
          const newEnd = Math.PI * 2 - startAngle + Math.PI
          startAngle = newStart
          endAngle = newEnd
        }
        if (transform.scaleY < 0) {
          const newStart = Math.PI * 2 - endAngle
          const newEnd = Math.PI * 2 - startAngle
          startAngle = newStart
          endAngle = newEnd
        }
        if (transform.rotation) {
          const angle = (transform.rotation / 180) * Math.PI
          startAngle = startAngle + angle
          endAngle = endAngle + angle
        }
        while (startAngle > Math.PI * 2) {
          startAngle -= Math.PI * 2
        }
        while (endAngle > Math.PI * 2) {
          endAngle -= Math.PI * 2
        }
        return { centre, radius, startAngle, endAngle }
      }
    })
  })
  return polyline
}
