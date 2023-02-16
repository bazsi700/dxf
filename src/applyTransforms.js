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
        return transformPoint[p2]
      } else {
        const centre = transformPoint(p.centre)
        let radius = p.radius
        let startAngle = p.startAngle
        let endAngle = p.endAngle
        if (transform.scaleX) {
          if (
            !transform.scaleY ||
            Math.abs(transform.scaleX - transform.scaleY) > 0.000001
          ) {
            console.log('ERROR: Tried scaling a circle arc into an ellipse arc')
          }
          radius = radius * transform.scaleX
        }
        if (transform.rotation) {
          const angle = (transform.rotation / 180) * Math.PI
          startAngle = startAngle + angle
          endAngle = endAngle + angle
          if (startAngle > Math.PI * 2) {
            startAngle -= Math.PI * 2
          }
          if (endAngle > Math.PI * 2) {
            endAngle -= Math.PI * 2
          }
        }
        return { centre, radius, startAngle, endAngle }
      }
    })
  })
  return polyline
}
