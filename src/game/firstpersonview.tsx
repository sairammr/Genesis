// FirstPersonController.ts
import * as THREE from 'three';

export class FirstPersonController {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = true;
  private isJumping: boolean = false;

  private velocity: THREE.Vector3;
  private direction: THREE.Vector3;
  private euler: THREE.Euler;
  private pitchObject: THREE.Object3D;
  private yawObject: THREE.Object3D;

  // Constants
  private readonly SPEED: number = 5.0;
  private readonly JUMP_HEIGHT: number = 12;
  private readonly GRAVITY: number = 40;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    // Create objects for handling rotations
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 3; // Player height
    this.yawObject.add(this.pitchObject);
    this.pitchObject.add(camera);
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump && !this.isJumping) {
          this.velocity.y = this.JUMP_HEIGHT;
          this.isJumping = true;
          this.canJump = false;
        }
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (document.pointerLockElement === this.domElement) {
      // Rotate yaw (left/right)
      this.yawObject.rotation.y -= event.movementX * 0.002;
      
      // Rotate pitch (up/down) with limits
      this.pitchObject.rotation.x -= event.movementY * 0.002;
      this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    }
  }

  update(deltaTime: number, planeSize: number): void {
    if (document.pointerLockElement !== this.domElement) {
      return;
    }

    // Calculate forward direction based on camera rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.yawObject.quaternion);
    forward.y = 0;
    forward.normalize();

    // Calculate right direction
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.yawObject.quaternion);
    right.y = 0;
    right.normalize();

    // Reset direction
    this.direction.set(0, 0, 0);

    // Add movement vectors based on key states
    if (this.moveForward) this.direction.add(forward);
    if (this.moveBackward) this.direction.sub(forward);
    if (this.moveRight) this.direction.add(right);
    if (this.moveLeft) this.direction.sub(right);

    // Normalize direction if moving diagonally
    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    // Apply movement
    this.velocity.x = this.direction.x * this.SPEED;
    this.velocity.z = this.direction.z * this.SPEED;

    // Apply gravity
    this.velocity.y -= this.GRAVITY * deltaTime;

    // Update position
    this.yawObject.position.x += this.velocity.x * deltaTime;
    this.yawObject.position.y += this.velocity.y * deltaTime;
    this.yawObject.position.z += this.velocity.z * deltaTime;

    // Constrain to plane boundaries
    const halfPlaneSize = planeSize / 2;
    this.yawObject.position.x = THREE.MathUtils.clamp(
      this.yawObject.position.x,
      -halfPlaneSize,
      halfPlaneSize
    );
    this.yawObject.position.z = THREE.MathUtils.clamp(
      this.yawObject.position.z,
      -halfPlaneSize,
      halfPlaneSize
    );

    // Ground collision
    if (this.yawObject.position.y <= 1) {
      this.yawObject.position.y = 1 ;
      this.velocity.y = 0;
      this.isJumping = false;
      this.canJump = true;
    }
  }

  getObject(): THREE.Object3D {
    return this.yawObject;
  }
}