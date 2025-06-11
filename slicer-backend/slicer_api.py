from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route('/files/<filename>')
def get_file(filename):
    return send_from_directory('/app/files', filename)

@app.route('/slice', methods=['POST'])
def slice_model():
    if 'model' not in request.files:
        return jsonify({"error": "No model uploaded"}), 400

    model_file = request.files['model']
    layer_height = request.form.get('layer_height', '0.2')
    infill = request.form.get('infill', '15%')
    nozzle = request.form.get('nozzle', '0.4')

    # Save STL to /app/files
    filename = model_file.filename
    stl_path = os.path.join('/app/files', filename)
    gcode_path = stl_path.rsplit('.', 1)[0] + '.gcode'
    model_file.save(stl_path)

    # Run slicer
    result = subprocess.run([
        "prusa-slicer",
        "-g",
        stl_path,
        "--layer-height", layer_height,
        "--fill-density", infill,
        "--nozzle-diameter", nozzle,
        "--output", gcode_path
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if result.returncode != 0:
        return jsonify({"error": "Slicing failed", "details": result.stderr.decode()}), 500

    # Return the path to the G-code file
    gcode_filename = os.path.basename(gcode_path)
    return jsonify({
        "message": "Slicing successful",
        "gcode_path": f"/files/{gcode_filename}"
    })

def calculate_price(gcode_path):
    filament_mm = 0
    with open(gcode_path, 'r') as f:
        for line in f:
            if 'filament used' in line:
                try:
                    parts = line.strip().split('=')
                    filament_mm = float(parts[1].split()[0])
                except:
                    pass

    price_per_mm = 0.02  # Example pricing
    return round(filament_mm * price_per_mm, 2)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
