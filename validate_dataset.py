#!/usr/bin/env python3
"""
Dataset Validation Script for FLN/ALN Historical Military Operations (1954-1962)
Checks schema conformance, uniqueness of IDs, date formats, coordinate validity,
and consistency between root and docs/ data files.
"""

import json
import sys
import os
import re

def validate_json_file(file_path):
    print(f"--> Validating JSON: {file_path}")
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False, 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON in {file_path}: {e}")
            return False, 0

    if 'operations' not in data:
        print(f"Error: Missing 'operations' key in {file_path}")
        return False, 0

    operations = data['operations']
    seen_ids = set()
    errors = []

    date_pattern = re.compile(r'^\d{4}(-\d{2}(-\d{2})?)?$')

    for idx, op in enumerate(operations):
        op_id = op.get('id')
        if not op_id:
            errors.append(f"Operation #{idx} is missing an 'id'.")
            continue
        
        if op_id in seen_ids:
            errors.append(f"Duplicate id found: {op_id}")
        seen_ids.add(op_id)

        # Check required fields
        for field in ['nom_operation', 'date_debut', 'wilaya_concernee', 'type_action', 'description']:
            if not op.get(field):
                errors.append(f"Operation {op_id} is missing required field '{field}'.")

        # Check date format
        date_debut = op.get('date_debut')
        if date_debut and not date_pattern.match(date_debut):
            errors.append(f"Operation {op_id} has invalid date_debut format: '{date_debut}'")

        date_fin = op.get('date_fin')
        if date_fin and not date_pattern.match(date_fin):
            errors.append(f"Operation {op_id} has invalid date_fin format: '{date_fin}'")

        # Check coordinates
        loc = op.get('localisation', {})
        coords = loc.get('coordonnees_approximatives', {})
        lat = coords.get('latitude')
        lon = coords.get('longitude')

        if lat is not None and not (-90.0 <= lat <= 90.0):
            errors.append(f"Operation {op_id} has latitude out of bounds: {lat}")
        if lon is not None and not (-180.0 <= lon <= 180.0):
            errors.append(f"Operation {op_id} has longitude out of bounds: {lon}")

    if errors:
        print(f"Validation failed with {len(errors)} error(s):")
        for err in errors[:10]:
            print(f"  - {err}")
        return False, len(operations)

    print(f"Success: {len(operations)} operations validated successfully in {file_path}.")
    return True, len(operations)

def validate_geojson_file(file_path):
    print(f"--> Validating GeoJSON: {file_path}")
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False, 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error decoding GeoJSON in {file_path}: {e}")
            return False, 0

    if data.get('type') != 'FeatureCollection':
        print(f"Error: GeoJSON root type is not FeatureCollection in {file_path}")
        return False, 0

    features = data.get('features', [])
    errors = []

    for idx, feat in enumerate(features):
        geom = feat.get('geometry')
        if not geom or geom.get('type') != 'Point':
            errors.append(f"Feature #{idx} does not have Point geometry.")
            continue

        coords = geom.get('coordinates', [])
        if len(coords) != 2:
            errors.append(f"Feature #{idx} has invalid coordinates length: {coords}")
            continue

        lon, lat = coords[0], coords[1]
        if not (-180.0 <= lon <= 180.0 and -90.0 <= lat <= 90.0):
            errors.append(f"Feature #{idx} coordinates out of bounds: [{lon}, {lat}]")

    if errors:
        print(f"GeoJSON validation failed with {len(errors)} error(s):")
        for err in errors[:10]:
            print(f"  - {err}")
        return False, len(features)

    print(f"Success: {len(features)} GeoJSON features validated successfully in {file_path}.")
    return True, len(features)

def main():
    print("=== Commencing Dataset Validation Suite ===")
    
    success1, count1 = validate_json_file('operations_fln_1954_1962.json')
    success2, count2 = validate_geojson_file('operations_fln_1954_1962.geojson')
    success3, count3 = validate_json_file('docs/data/operations_fln_1954_1962.json')
    success4, count4 = validate_geojson_file('docs/data/operations_fln_1954_1962.geojson')

    if not (success1 and success2 and success3 and success4):
        print("FAIL: One or more validation checks failed.")
        sys.exit(1)

    if count1 != count2 or count1 != count3 or count1 != count4:
        print(f"FAIL: Inconsistent record counts across files: root json={count1}, root geojson={count2}, docs json={count3}, docs geojson={count4}")
        sys.exit(1)

    print(f"\nALL CHECKS PASSED: 4/4 files strictly valid with {count1} confirmed operations.")
    sys.exit(0)

if __name__ == '__main__':
    main()
