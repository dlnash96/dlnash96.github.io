import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r126/three.module.js'
import { BasisTextureLoader } from './tools/BasisTextureLoader.js';
import { OrbitControls } from './tools/OrbitControls.js';

let camera, scene, renderer;
let mesh;

init();
render();

function init() {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 0, 0, 1 );
  camera.lookAt( scene.position );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );

  const geometry = flipY( new THREE.PlaneBufferGeometry() );
  const material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );

  mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

  const loader = new BasisTextureLoader();
  //console.log(window.location.pathname);
  loader.setTranscoderPath( './src/tools/basis/' );
  loader.detectSupport( renderer );
  loader.load( '../resources/painting1.basis', function ( texture ) {

    texture.encoding = THREE.sRGBEncoding;
    material.map = texture;
    material.needsUpdate = true;

    render();

  }, undefined, function ( error ) {

    console.error( error );

  } );

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();

}

function render() {

  renderer.render( scene, camera );

}

/** Correct UVs to be compatible with `flipY=false` textures. */
function flipY( geometry ) {

  const uv = geometry.attributes.uv;

  for ( let i = 0; i < uv.count; i ++ ) {

    uv.setY( i, 1 - uv.getY( i ) );

  }

  return geometry;

}
