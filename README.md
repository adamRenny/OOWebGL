# WebGL Engine

## Features

### Rendering
 - Rendering Constraints
  - **Geometry Culling:** Only push objects that are visible
   - BSP, [see Toji's code](https://github.com/toji/webgl-source)

 - Render Ordering
  1. Transparency Order
  2. Shader Program Order

 - Active Texture Selection
  - ~~Select the next available texture for the render pass~~
  - Use a priority based active texture setter to decrease "re-active-ing" for objects

 - Distance-based Rendering
  - Select texture/geometry based on visibility

### Shading
 - Point Lights
 - Directional Lights
 - Specular Lighting
 - Specular Maps
 - Transparency

### Geometry
 - ~~Indexed VBOs~~
 - ~~VBOs~~

### BackBuffering
 - Framebuffer