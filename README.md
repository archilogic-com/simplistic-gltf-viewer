# Simplistic glTF viewer

This is an example to demonstrate how to parse glTF and the associated buffer files for displaying the scene in 3D.

## Limitations

The "simplistic" in the name gives it a way, this is a starting point, not a fully-featured glTF parser and viewer.
For a more complete demonstration, try the [three.js glTFLoader example](http://threejs.org/examples/?q=gltf#webgl_loader_gltf).

Here's the rundown on limitations:

* Does not support animations
* Ignores materials, techniques, camera, multiple scenes, matrix transform / TRS
* Requires indices to be present
* Assumes all primitives are triangles
* Loads the default scene
* Ignores size information, so your model may not be visible
* Does not support Data-URIs for buffers

## Setup
This viewer has no dependencies and can be hosted anywhere that allows hosting static files (e.g. S3, Dropbox, Google Drive, Github Pages, Surge, ...).

## Try it now

You can try an online version [here](https://archilogic-com.github.io/simplistic-gltf-viewer).
You will need to upload a `.gltf` file and all referenced `.bin` files.
