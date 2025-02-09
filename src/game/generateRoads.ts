import * as THREE from 'three';

export const generateRoads = (scene: THREE.Scene, planeSize: number, roadWidth: number = 4) => {
    const roadMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333, // Dark asphalt color
        depthWrite: true
    });

    // Helper function to create a road segment
    const createRoadSegment = (start: THREE.Vector3, end: THREE.Vector3) => {
        const length = start.distanceTo(end);
        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(length, roadWidth, 1, 1),
            roadMaterial
        );

        // Position the road at the midpoint between start and end
        road.position.copy(start.clone().add(end).multiplyScalar(0.5));

        // Rotate the road to lie flat on the ground
        road.rotation.x = +Math.PI / 3; // Rotate 90 degrees around the X-axis to make it flat

        // Rotate the road to face the direction of the end point
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        road.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        // Slightly above the ground to avoid z-fighting
        road.position.y = 0.01;

        return road;
    };

    // Generate random points for road intersections
    const numIntersections = 5; // Number of road intersections
    const intersections: THREE.Vector3[] = [];
    for (let i = 0; i < numIntersections; i++) {
        intersections.push(new THREE.Vector3(
            (Math.random() - 0.5) * planeSize, // Random X position
            0,
            (Math.random() - 0.5) * planeSize  // Random Z position
        ));
    }

    // Connect intersections with roads
    for (let i = 0; i < intersections.length; i++) {
        for (let j = i + 1; j < intersections.length; j++) {
            const start = intersections[i];
            const end = intersections[j];
            const roadSegment = createRoadSegment(start, end);
            scene.add(roadSegment);

            // Add road markings (center line)
            
        }
    }
};