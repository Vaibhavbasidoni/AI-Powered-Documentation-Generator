import logging
from fastapi import UploadFile
from typing import List, Dict, Any
import os
import aiofiles
import base64

logging.basicConfig(level=logging.INFO)

async def read_file_content(file: UploadFile) -> str:
    """Read the content of an uploaded file."""
    try:
        content = await file.read()
        # Try to decode as text
        try:
            return content.decode('utf-8')
        except UnicodeDecodeError:
            # If it's a binary file, return base64 encoded string
            return f"[Binary file encoded in base64]: {base64.b64encode(content).decode('utf-8')}"
    except Exception as e:
        logging.error(f"Error reading file {file.filename}: {str(e)}")
        return ""

async def process_files(files: List[UploadFile]) -> tuple[Dict[str, Any], Dict[str, str]]:
    """Process uploaded files and create a directory structure with contents."""
    structure = {
        "name": "root",
        "type": "directory",
        "children": []
    }
    
    file_contents = {}

    for file in files:
        try:
            # Normalize file path
            normalized_path = file.filename.replace('\\', '/')
            
            # Get file content if it's a text file
            if not normalized_path.lower().endswith(('.gif', '.jpg', '.png', '.wav', '.mp3', '.pyc')):
                content = await read_file_content(file)
                if content:
                    file_contents[normalized_path] = content
                    logging.info(f"Content stored for file: {normalized_path}")

            # Process the file structure
            path_parts = normalized_path.split('/')
            current_level = structure["children"]
            
            for part in path_parts[:-1]:
                dir_node = next(
                    (node for node in current_level if node["name"] == part and node["type"] == "directory"),
                    None
                )
                
                if not dir_node:
                    dir_node = {
                        "name": part,
                        "type": "directory",
                        "children": []
                    }
                    current_level.append(dir_node)
                
                current_level = dir_node["children"]
            
            current_level.append({
                "name": path_parts[-1],
                "type": "file"
            })
            
        except Exception as e:
            logging.error(f"Error processing file {file.filename}: {str(e)}")
            continue

    logging.info(f"Processed {len(files)} files, stored content for {len(file_contents)} files")
    return structure, file_contents

async def process_uploaded_files(files: List[UploadFile]):
    """Process uploaded files and generate project structure."""
    try:
        logging.info(f"Starting to process {len(files)} files")

        # Create a dictionary to store the file structure
        project_structure = {
            "name": "root",
            "type": "directory",
            "children": []
        }

        # Process each file
        for file in files:
            path_parts = file.filename.split('/')
            current_dict = project_structure
            
            # Process each part of the path
            for i, part in enumerate(path_parts):
                # Skip empty parts
                if not part:
                    continue
                    
                # Check if we're at a file or directory
                is_file = (i == len(path_parts) - 1)
                
                # Find or create the current path in our structure
                if is_file:
                    current_dict["children"].append({
                        "name": part,
                        "type": "file"
                    })
                else:
                    # Look for existing directory
                    found_dir = None
                    for child in current_dict.get("children", []):
                        if child["name"] == part and child["type"] == "directory":
                            found_dir = child
                            break
                    
                    if not found_dir:
                        # Create new directory
                        new_dir = {
                            "name": part,
                            "type": "directory",
                            "children": []
                        }
                        if "children" not in current_dict:
                            current_dict["children"] = []
                        current_dict["children"].append(new_dir)
                        current_dict = new_dir
                    else:
                        current_dict = found_dir

        logging.info(f"Processed files. Structure: {project_structure}")
        return project_structure

    except Exception as e:
        logging.error(f"Error processing files: {str(e)}")
        raise e