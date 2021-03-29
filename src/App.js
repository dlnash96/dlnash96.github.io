import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r126/three.module.js'
import { BasisTextureLoader } from './tools/BasisTextureLoader.js';
import { OrbitControls } from './tools/OrbitControls.js';
import { LightProbeGenerator } from './tools/LightProbeGenerator.js'

let camera, scene, renderer;
let mesh, sphereMesh;
let lightProbe;
let directionalLight;

// linear color space
const API = {
	lightProbeIntensity: 1.0,
	directionalLightIntensity: 0.2,
	envMapIntensity: 1
};

init();
render();

function init() {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 0, 0, 1 );
  camera.lookAt( scene.position );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );

  //lightProbe
  lightProbe = new THREE.LightProbe();
  scene.add(lightProbe)
  //light
  directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const geometry = flipY( new THREE.PlaneBufferGeometry() );
  const material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );

  mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

  // envmap
				const genCubeUrls = function ( prefix, postfix ) {

					return [
						prefix + 'px' + postfix, prefix + 'nx' + postfix,
						prefix + 'py' + postfix, prefix + 'ny' + postfix,
						prefix + 'pz' + postfix, prefix + 'nz' + postfix
					];

				};

				const urls = genCubeUrls( '../resources/cube/', '.png' );

				new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {

					cubeTexture.encoding = THREE.sRGBEncoding;

					scene.background = cubeTexture;

					lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );

					const sphereGeometry = new THREE.SphereGeometry( 0.2, 64, 32 );
					//const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );

					const sphereMaterial = new THREE.MeshStandardMaterial( {
						color: 0xffffff,
						metalness: 0,
						roughness: 0,
						envMap: cubeTexture,
						envMapIntensity: API.envMapIntensity,
					} );

					// mesh
					sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
          sphereMesh.position.set(0.8, 0.0, 0.0);
					scene.add( sphereMesh );

					render();

				} );

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
