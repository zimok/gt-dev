var THREE = window.THREE = require('three')

import TWEEN from 'tween'
import fft from '../lib/fft'

var video      = document.createElement('video');
video.width    = 320;
video.height   = 240;
video.autoplay = true;

function startCamera() {
  navigator.webkitGetUserMedia({video: true}, function(stream){
    video.src    = webkitURL.createObjectURL(stream);
  }, function(error){
    console.log("Failed to get a stream due to", error);
  });
}

// audio stuff
var { analyser, audio } = fft('track.mp3')
var bufferLength = 64//analyser.frequencyBinCount;
var frequencyData = new Uint8Array(bufferLength)

require('../vendor/js/ShaderPass.js')
require('../vendor/js/BleachBypassShader.js')
require('../vendor/js/BlendShader.js')
require('../vendor/js/FXAAShader.js')
require('../vendor/js/CopyShader.js')
require('../vendor/js/HorizontalTiltShiftShader.js')
require('../vendor/js/VerticalTiltShiftShader.js')
require('../vendor/js/TriangleBlurShader.js')
require('../vendor/js/VignetteShader.js')
require('../vendor/js/ConvolutionShader.js')
require('../vendor/js/DotScreenShader.js')
require('../vendor/js/RGBShiftShader.js')
require('../vendor/js/EffectComposer.js')
require('../vendor/js/RenderPass.js')
require('../vendor/js/BloomPass.js')
require('../vendor/js/MaskPass.js')
require('../vendor/js/StereoEffect.js')
require('../vendor/js/OrbitControls.js')

var PARTICLE_COUNT = 250

var screenX = window.innerWidth
var screenY = window.innerHeight

var scene;
var camera;
var renderer;
var plane;
var particleSystem;
var particleSystem1;
var renderer;
var mesh;
var mesh1;
var composer;
var hblur;
var vblur;
var targetRotationX = 0;
var targetRotationY = 0;
var mouseX = 0;
var mouseY = 0;
var stereo;
var tweening = false
var tween;
var controls;
var videoTexture;
var spotLight;
var light;
  

export function init() {
  
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x121212, 0.9, 1600 );

  camera = new THREE.PerspectiveCamera( 
    70, screenX / screenY, 1, 2000 
  )
  
  camera.position.z = 500
  

  //scene.add( new THREE.AmbientLight( 0xffffff) );

  var emlight = new THREE.HemisphereLight( 0x4fff42, 0x080820, 1 );
  //scene.add( emlight );

  // light = new THREE.DirectionalLight( 0xff1075 );
  // light.position.set( 1, 1, 100 );
  // scene.add( light );

  spotLight = new THREE.SpotLight( 0xff1075 );
  spotLight.position.set( 1, 1, 200 );
  scene.add( spotLight );


  // particleSystem1 = drawParticles(32)
  // particleSystem1.sortParticles = true

  //scene.add(particleSystem1)

  particleSystem = drawParticles(1)
  particleSystem.sortParticles = true

  
  scene.add(particleSystem)
  camera.lookAt( scene.position );

  //var geo = new THREE.SphereGeometry( 480, 4, 4);
  var geo = new THREE.PlaneGeometry( screenX, screenY, 0);
  //var geo = new THREE.IcosahedronGeometry( 480);


  const texture = THREE.ImageUtils.loadTexture('/assets/tests/01.jpg');
  videoTexture = new THREE.Texture( video );

  var mat = new THREE.MeshPhongMaterial({
    color: 0xff1075,
    shading: THREE.FlatShading,
    //map: texture,
  });

  var mat3 = new THREE.MeshPhongMaterial({
    map: videoTexture,
    shading: THREE.FlatShading,
    transparent: true,
    opacity: .1
  });

  

  var materials = [
    mat,
    mat3
  ]

  mesh = THREE.SceneUtils.createMultiMaterialObject(geo, materials)
  //mesh.rotation.y = 200
  //mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.5
  scene.add(mesh)

  mesh1 = new THREE.Mesh( particleSystem.geometry, mat3 );

  //scene.add(mesh1)


  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( screenX, screenY );
  renderer.setClearColor(0x121212)
  
  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.25;
  // controls.enableZoom = false;
  
  var rtParameters = { 
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter, 
    format: THREE.RGBFormat, 
    stencilBuffer: true 
  };

  var renderTarget = new THREE.WebGLRenderTarget( screenX, screenY, rtParameters );

  var effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
  var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
  
  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / screenX, 1 / screenY );

  //var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

  // tilt shift
  hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
  vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
  
  hblur.uniforms[ 'h' ].value = 1 / window.innerWidth;
  vblur.uniforms[ 'v' ].value = 1 / window.innerHeight;

  var effectBloom = new THREE.BloomPass(1.5, 25, 8, 256);
  effectBloom.renderToScreen = true
  
  composer = new THREE.EffectComposer( renderer, renderTarget );
  vblur.renderToScreen = true

  composer = new THREE.EffectComposer( renderer, renderTarget );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  composer.addPass( effectFXAA );
  composer.addPass( hblur );
  composer.addPass( vblur );

  document.getElementById('visualization').appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  //window.addEventListener( 'resize', onWindowResize, false );
  //window.addEventListener('scroll', onWindowScroll, false)

  startCamera()
  audio.play() 
}

function drawParticles(size=6) {
  const range = screenX
  //const geometry = new THREE.SphereGeometry( 200, 64, 32);
  const geometry = new THREE.SphereGeometry(320, 64, 64 );
  console.log('geo.ver', geometry.vertices.length)
  //const geometry = new THREE.Points
  const textureLoader = new THREE.TextureLoader()

  // instantiate a loader
  const texture = THREE.ImageUtils.loadTexture('/assets/tests/particle-1.png');

  const material = //new THREE.MultiMaterial([
    new THREE.PointsMaterial({
      size: size,
      transparent: true,
      opacity: 1,
      map: texture,
      fog: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      color: 0x9AE17B
    })

  //])
 

  for (var i = 0; i < bufferLength; i++) {
    const particle = new THREE.Vector3(
      0, 0, 0
    )
    particle.k = i
    particle.x = Math.random() * screenX - screenX / 2, 
    particle.y = Math.random() * screenY - screenY / 2, 
    particle.z = Math.random() * 1600 - 1600 / 2;
    
    drawParticle(particle)
    geometry.vertices[i] = particle

    //scene.add(particle)
  }

  var system = new THREE.Points(geometry, material);
  return system
}

function drawParticle( particle, delay ) {

  var particle = this instanceof THREE.Sprite ? this : particle;
  var delay = delay !== undefined ? delay : 0;
  //particle.scale.x = particle.scale.y = Math.random() * 1 + 8;

  // new TWEEN.Tween( {x: 0, y: 0, z: 0} )
  //   .to({ 
  //     x: Math.random() * 200 - 200, 
  //     y: Math.random() * 200 - 200, 
  //     z: Math.random() * 200 - 40 }, 10000)
  //   .onUpdate(function() {
  //     particle.set(this.x, this.y, this.z)
  //   })
  //   .start()
}

function tweenVertex(v, fq) {
  const y = (fq/225) * 200
  const z = v.z
  v.tweening = true


  tween = new TWEEN
    .Tween(v)
    .to({ z: v.z * fq * 0.01 }, 1000)
    //.delay(v.k)
    //.easing(TWEEN.Easing.Quadratic.In)
    .onComplete(function() {
      new TWEEN
        .Tween(v)
        .to({ z: z }, 250)
        //.easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(function() {
          v.tweening = false
          //v.z = z
          particleSystem.geometry.verticesNeedUpdate = true    
        })
        .start()
    })
    .start()
}

function tweenSystem(fq) {
  tweening = true
  tween = new TWEEN
    .Tween(particleSystem.scale)
    .to({ z: fq*0.01, x: fq*0.01, y: fq*0.01 }, 500)
    //.delay(v.k)
    //.easing(TWEEN.Easing.Quadratic.In)
    .onComplete(function() {
      new TWEEN
        .Tween(particleSystem.scale)
        .to({ z: 1, x: 1, y: 1 }, 250)
        //.easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(function() {
          tweening = false
          //v.z = z
          //particleSystem.geometry.verticesNeedUpdate = true    
        })
        .start()
    })
    .start()
}

function tweenLight() {
  tweening = true
  tween = new TWEEN
    .Tween(spotLight.position)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .to({ x: Math.random()*screenX, y: Math.random()*screenY, z: Math.random()*200 }, 5000)
    .onComplete(function() {
      tweening=false
    })
    .start()
}


export function animate(time) {
  var vertices = particleSystem.geometry.vertices;  
  var freqData; 
  var i = 0;

  if(!tweening) {
    tweenLight()
  }

  for (; i < bufferLength; i ++ ) {

    freqData = frequencyData[i]

    if(freqData > 1) {
      vblur.uniforms[ 'v' ].value = freqData*0.25/ window.innerHeight;
    }

    if(freqData > 1) {
      hblur.uniforms[ 'h' ].value = freqData*0.15/ window.innerHeight;
    }

    if(freqData > 10 && !tweening) {
      //tweenSystem(freqData)
      //particleSystem.scale.x = particleSystem.scale.y = freqData*0.01
    }


    for(var k = 0; k < vertices.length; k++) {
      var v = vertices[k]
      
      if(!v.tweening) {
        tweenVertex(v, freqData)
        //v.multiplyScalar(Math.random()*300)
        //v.setZ(freqData)
      }

      spotLight.exponent = freqData*1.2
      spotLight.intensity = freqData*0.5
    }

    
  }

  TWEEN.update()
  requestAnimationFrame(animate)

  //renderer.render(scene, camera)
  composer.render(renderer)
  analyser.getByteFrequencyData(frequencyData)

  if( video.readyState === video.HAVE_ENOUGH_DATA ){
    videoTexture.needsUpdate = true;
  }

}
  

function onWindowScroll() {
    scrollY = window.pageYOffset
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

}


//EVENTS
function onDocumentMouseMove( event ) {
  mouseX = event.clientX - (screenX/2);
  mouseY = event.clientY - (screenY/2);
  // effect.uniforms[ 'amount' ].value = 0.02;
  targetRotationX = mouseX * 0.001;
  targetRotationY = mouseY * 0.001;
}

function onDocumentTouchMove( event ) {

  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - (screenX/2);
    mouseY = event.touches[ 0 ].pageY - (screenY/2);
    targetRotationX = mouseX * 0.001
    targetRotationY = mouseY * 0.001;
  }

}