/* jshint unused: false */
/* globals THREE,console */

var ACCESSOR_COMPONENT_TYPE_BYTE = 5120,
    ACCESSOR_COMPONENT_TYPE_UNSIGNED_BYTE = 5121,
    ACCESSOR_COMPONENT_TYPE_SHORT = 5122,
    ACCESSOR_COMPONENT_TYPE_UNSIGNED_SHORT = 5123,
    ACCESSOR_COMPONENT_TYPE_FLOAT = 5126,
    BUFFER_TYPE_BINARY = 'arraybuffer',
    BUFFER_TYPE_TEXT = 'text',
    BUFFERVIEW_TARGET_ARRAY_BUFFER = 34962,
    BUFFERVIEW_TARGET_ELEMENT_ARRAY_BUFFER = 34962,
    PRIMITIVE_MODE_POINTS = 0,
    PRIMITIVE_MODE_LINES = 1,
    PRIMITIVE_MODE_LINE_LOOP = 2,
    PRIMITIVE_MODE_LINE_STRIP = 3,
    PRIMITIVE_MODE_TRIANGLES = 4,
    PRIMITIVE_MODE_TRIANGLE_STRIP = 5,
    PRIMITIVE_MODE_TRIANGLE_FAN = 6

var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    renderer = new THREE.WebGLRenderer()

renderer.setSize(600, 600)
camera.position.set(0, 25, 100)

var BUFFERS = {}

function _getEntrySize(type) {
  switch(type) {
    case 'SCALAR':
      return 1
    break;
    case 'VEC2':
      return 2
    break;
    case 'VEC3':
      return 3
    break
    case 'VEC4':
      return 4
    break
    case 'MAT2':
      return 4
    break
    case 'MAT3':
      return 9
    break
    case 'MAT4':
      return 16
    break
  }
}

function _getBytesPerEntry(componentType, type) {
  var numBytes = 1
  switch(componentType) {
    case ACCESSOR_COMPONENT_TYPE_BYTE:
    case ACCESSOR_COMPONENT_TYPE_UNSIGNED_BYTE:
      // 1 byte
    break;
    case ACCESSOR_COMPONENT_TYPE_SHORT:
    case ACCESSOR_COMPONENT_TYPE_UNSIGNED_SHORT:
      numBytes *= 2
    break;
    case ACCESSOR_COMPONENT_TYPE_FLOAT:
      numBytes *= 4
    break;
  }

  switch(type) {
    case 'SCALAR':
      // x1
    break;
    case 'VEC2':
      numBytes *= 2
    break;
    case 'VEC3':
      numBytes *= 3
    break
    case 'VEC4':
      numBytes *= 4
    break
    case 'MAT2':
      numBytes *= 4
    break
    case 'MAT3':
      numBytes *= 9
    break
    case 'MAT4':
      numBytes *= 16
    break
  }

  return numBytes
}

function _parseBuffer(gltf, bufferName) {
  return fetch(gltf.buffers[bufferName].uri).then((response) => {
    return response.arrayBuffer()
  })
}

function _parseBufferData(gltf, bufferName, bufferDictionary) {
  console.log('Buffer: ', bufferDictionary, gltf.buffers[bufferName].uri)
  return Promise.resolve(bufferDictionary[gltf.buffers[bufferName].uri])
}


function _parseBufferView(gltf, bufferViewName) {
  var bufferView = gltf.bufferViews[bufferViewName]
  console.log(bufferView)
  return _parseBuffer(gltf, bufferView.buffer).then((buffer) => {
    return buffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
  })
}

function _parseBufferViewData(gltf, bufferViewName, bufferDictionary) {
  var bufferView = gltf.bufferViews[bufferViewName]
  console.log(bufferView)
  return _parseBufferData(gltf, bufferView.buffer, bufferDictionary).then((buffer) => {
    return buffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
  })
}

function _parseAccessor(gltf, accessorName) {
  var accessor = gltf.accessors[accessorName]
  console.log(accessor)
  var entrySize = _getEntrySize(accessor.type)

  return _parseBufferView(gltf, accessor.bufferView).then((bufferSlice) => {
    var typedArr = null
    switch(accessor.componentType) {
      case ACCESSOR_COMPONENT_TYPE_BYTE:
        typedArr = new Int8Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_UNSIGNED_BYTE:
        typedArr = new Uint8Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_SHORT:
        typedArr = new Int16Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_UNSIGNED_SHORT:
        typedArr = new Uint16Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_FLOAT:
      console.log('SIZE:', accessor.count * entrySize)
        typedArr = new Float32Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
    }
    return typedArr
  })
}

function _parseAccessorData(gltf, accessorName, bufferDictionary) {
  var accessor = gltf.accessors[accessorName]
  console.log(accessor)
  var entrySize = _getEntrySize(accessor.type)

  return _parseBufferViewData(gltf, accessor.bufferView, bufferDictionary).then((bufferSlice) => {
    var typedArr = null
    switch(accessor.componentType) {
      case ACCESSOR_COMPONENT_TYPE_BYTE:
        typedArr = new Int8Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_UNSIGNED_BYTE:
        typedArr = new Uint8Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_SHORT:
        typedArr = new Int16Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_UNSIGNED_SHORT:
        typedArr = new Uint16Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
      case ACCESSOR_COMPONENT_TYPE_FLOAT:
      console.log('SIZE:', accessor.count * entrySize)
        typedArr = new Float32Array(bufferSlice, accessor.byteOffset, accessor.count * entrySize)
      break
    }
    return typedArr
  })
}

function _parseMesh(gltf, meshName) {
  var mesh = gltf.meshes[meshName]
  for(var i=0; i<mesh.primitives.length;i++) {
    var promises = [
      _parseAccessor(gltf, mesh.primitives[i].attributes.POSITION),
      _parseAccessor(gltf, mesh.primitives[i].indices)
    ]

    return Promise.all(promises).then((data) => {
      var vertices = data[0], indices = data[1]
      var geometry = new THREE.Geometry()

      for (var v=0; v<vertices.length; v+=3) {
        geometry.vertices.push(new THREE.Vector3(vertices[v] * 20, vertices[v+1] * 20, vertices[v+2] * 20))
      }

      for(var f=0; f<indices.length; f+=3) {
        geometry.faces.push(new THREE.Face3(indices[f], indices[f+1], indices[f+2]))
      }

      return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true}))
    })
  }
}

function _parseMeshData(gltf, meshName, bufferDictionary) {
  var mesh = gltf.meshes[meshName]
  for(var i=0; i<mesh.primitives.length;i++) {
    var promises = [
      _parseAccessorData(gltf, mesh.primitives[i].attributes.POSITION, bufferDictionary),
      _parseAccessorData(gltf, mesh.primitives[i].indices, bufferDictionary)
    ]

    return Promise.all(promises).then((data) => {
      var vertices = data[0], indices = data[1]
      var geometry = new THREE.Geometry()

      for (var v=0; v<vertices.length; v+=3) {
        geometry.vertices.push(new THREE.Vector3(vertices[v] * 20, vertices[v+1] * 20, vertices[v+2] * 20))
      }

      for(var f=0; f<indices.length; f+=3) {
        geometry.faces.push(new THREE.Face3(indices[f], indices[f+1], indices[f+2]))
      }

      return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true}))
    })
  }
}

function _parseNode(gltf, nodeName) {
  var meshes = gltf.nodes[nodeName].meshes
  var obj = new THREE.Object3D(), objs3d = []
  if(meshes) {
    for(var i=0; i<meshes.length; i++) {
      objs3d.push(_parseMesh(gltf, meshes[i]).then((child) => { obj.add(child) }))
    }
  }
  return obj
}

function _parseNodeData(gltf, nodeName, bufferDictionary) {
  var node = gltf.nodes[nodeName], obj = new THREE.Object3D()
  var meshes = node.meshes
  if(node.children) {
    for(var c=0; c<node.children.length; c++) {
      obj.add(_parseNodeData(gltf, node.children[c], bufferDictionary))
    }
  }

  if(meshes) {
    for(var i=0; i<meshes.length; i++) {
      _parseMeshData(gltf, meshes[i], bufferDictionary).then((child) => { obj.add(child) })
    }
  }
  return obj
}

function _parseScene(gltf, scene) {
  var sceneObj = new THREE.Object3D()
  for(var i=0; i<scene.nodes.length; i++) {
    sceneObj.add(_parseNode(gltf, scene.nodes[i]))
  }
  return sceneObj
}

function _parseSceneData(gltf, scene, bufferDictionary) {
  var sceneObj = new THREE.Object3D()
  for(var i=0; i<scene.nodes.length; i++) {
    sceneObj.add(_parseNodeData(gltf, scene.nodes[i], bufferDictionary))
  }
  return sceneObj
}


function render(things) {
  function renderFrame() {
    things.rotation.y += Math.PI / 300
    renderer.render(scene, camera)
    requestAnimationFrame(renderFrame)
  }
  renderFrame()
}

function loadGLTF(fileName) {
  var req = new XMLHttpRequest()
  req.open('GET', fileName, true)
  req.onload = function() {
    var gltfData = JSON.parse(this.responseText)
    var things = _parseScene(gltfData, gltfData.scenes[gltfData.scene])
    scene.add(things)
    render(things)
  }
  req.send(null)
}

function loadGLTFFromData(glTF, bufferContents) {
  var things = _parseSceneData(glTF, glTF.scenes[glTF.scene], bufferContents)
  scene.add(things)
  render(things)
}

function loadBuffer(fileName) {
  var oReq = new XMLHttpRequest();
  oReq.open('GET', fileName, true);
  oReq.responseType = 'arraybuffer';


  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if (arrayBuffer) {
      var vertices = new Float32Array(arrayBuffer);
      var indices = new Uint16Array(arrayBuffer);
      var geometry = new THREE.Geometry()
      window.wat = geometry
      /*
      vertex positions: offset=25272, type=vec3(float32), count = 2399
      face indices: offset=0, type=uint16, count = 12636
      */

      for (var i = 6318; i < 6318 + (2399 * 12); i+=3) {
        geometry.vertices.push(new THREE.Vector3(vertices[i] * 20, vertices[i+1] * 20, vertices[i+2] * 20))
      }
      for(var f=0;f<12636;f+=3) {
        geometry.faces.push(new THREE.Face3(indices[f], indices[f+1], indices[f+2]))
      }
      var box = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true}))
      scene.add(box)

      function render() {
        box.rotation.y += Math.PI / 300
        renderer.render(scene, camera)
        requestAnimationFrame(render)
      }
      render()
    }
  };

  oReq.send(null);
}

//loadGLTF('CesiumMilkTruck.gltf')
//loadBuffer('duck.bin');

document.getElementById('load').addEventListener('click', function() {
  var files = document.getElementById('uploads').files

  var promises = []

  for(var i=0; i<files.length; i++) {
    if(files[i].name.split('.').pop() === 'gltf') {
      promises.push(new Promise(function(resolve, reject) {
        var gltfReader = new FileReader()
        gltfReader.onload = function(evt) {
          resolve({
            type: 'gltf',
            data: JSON.parse(evt.target.result)
          })
        }
        gltfReader.readAsText(files[i])
      }))
    }
    else {
      // buffer content
      (function(file) {
        promises.push(new Promise(function(resolve) {
          var dataReader = new FileReader()
          dataReader.onload = function(evt) {
            resolve({
              type: 'buffer',
              data: {
                key: file.name,
                value: evt.target.result
              }
            })
          }
          dataReader.readAsArrayBuffer(file)
        }))
      })(files[i])
    }
  }

  Promise.all(promises).then((results) => {
    document.body.removeChild(document.getElementById('start'))
    document.body.appendChild(renderer.domElement)

    var buffers = {}, gltf = null
    for(var r=0; r<results.length; r++) {
      if(results[r].type === 'buffer') {
        buffers[results[r].data.key] = results[r].data.value
      } else {
        gltf = results[r].data
        console.log(gltf)
      }
    }
    loadGLTFFromData(gltf, buffers)
  })
})
