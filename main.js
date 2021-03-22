const environments = {
	'Venice Sunset': { filename: 'venice_sunset_1k.hdr' },
	'Overpass': { filename: 'pedestrian_overpass_1k.hdr' }
};

var cube;


var container;
var camera, scene, renderer;
var dirLight;


init();

animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x = 60;
	camera.position.y = 80;
	camera.position.z = 320;
	// scene
	scene = new THREE.Scene();


	dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	dirLight.color.setHSL( 0.1, 1, 0.8 );
	dirLight.position.set(30, 12, 30);
	dirLight.position.multiplyScalar( 5 );

	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 500;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = - d;
	dirLight.shadow.camera.near = 5;
	dirLight.shadow.camera.far = 700;
	dirLight.shadow.bias = - 0.0001;

	scene.add( dirLight );
	scene.add( camera );

	var catTexture = new THREE.TextureLoader().load( 'https://i.imgur.com/oPR4BiX.jpg' );
	cube = new THREE.Mesh(
	  new THREE.BoxGeometry(100, 100, 100),
	  new THREE.MeshStandardMaterial({map: catTexture})
	)
	cube.position.y = 50;
	cube.castShadow = true;
	scene.add(cube);



	var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ), new THREE.MeshStandardMaterial({color: 0xA0A0A0}));
	ground.rotation.x = -Math.PI * 0.5;
	ground.position.y = -30;
	ground.receiveShadow = true;
	scene.add( ground );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 1.6;

	renderer.shadowMap.enabled = true;


	function loadEnvironment(name) {
		if ( environments[ name ].texture !== undefined ) {
			scene.background = environments[ name ].texture;
			scene.environment = environments[ name ].texture;
			return;
		}

		const filename = environments[ name ].filename;
		new THREE.RGBELoader()
		.setDataType( THREE.UnsignedByteType )
		.setPath( 'https://threejs.org/examples/textures/equirectangular/' )
		.load( filename, function ( hdrEquirect ) {

			const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular( hdrEquirect );
			hdrEquirect.dispose();

			scene.background = hdrCubeRenderTarget.texture;
			scene.environment = hdrCubeRenderTarget.texture;
			environments[ name ].texture = hdrCubeRenderTarget.texture;
	  } );
	}
	const pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();

	loadEnvironment('Venice Sunset');


	controls = new THREE.OrbitControls( camera, renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.02;

	renderer.render( scene, camera );
}