#!/bin/bash

# Define input and output directories
INPUT_DIR="/Users/sairammr/Downloads/model"
OUTPUT_DIR="/Users/sairammr/Documents/GitHub/3d-models/optimized"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Loop through all .gltf files directly inside INPUT_DIR
for gltf_file in "$INPUT_DIR"/*.glb; do
    # Check if any .gltf files exist to avoid errors
    [ -e "$gltf_file" ] || continue

    # Get the base filename without path and extension
    base_name=$(basename "$gltf_file" .glb)

    # Define output path directly in the output folder
    output_path="$OUTPUT_DIR/$base_name.glb"

    # Run optimization command
    gltf-transform optimize "$gltf_file" "$output_path" \
          --compress draco \
    --texture-compress webp \
    --texture-size 1024

    echo "Optimized: $output_path"
done

echo "Processing complete!"
