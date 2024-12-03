from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any, List
import logging
import json
import shutil
import os
from pathlib import Path
import chardet
from app.services.documentation import (
    process_project,
    analyze_main_components,
    extract_file_description,
    extract_classes,
    extract_functions,
    generate_project_summary,
    analyze_code_quality
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Store processed projects in memory
processed_projects = {}

def read_file_content(file_path: Path) -> str:
    """Read file content with proper encoding detection."""
    try:
        # Skip binary files
        if file_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.pyc', '.zip']:
            return ""
            
        # Read the file in binary mode first
        with open(file_path, 'rb') as file:
            raw_data = file.read()
            
        # Detect the encoding
        result = chardet.detect(raw_data)
        encoding = result['encoding'] if result['encoding'] else 'utf-8'
            
        # Decode the content with the detected encoding
        return raw_data.decode(encoding)
    except Exception as e:
        logger.warning(f"Could not read file {file_path}: {str(e)}")
        return ""

@router.post("/projects")
async def upload_project(file: UploadFile = File(...)):
    """Upload and process a project."""
    try:
        logger.info(f"Receiving project: {file.filename}")
        
        # Create a temporary directory for the project
        temp_dir = Path("temp_projects") / file.filename.replace(".zip", "")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the uploaded file
        file_path = temp_dir / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract the zip file
        if file.filename.endswith('.zip'):
            shutil.unpack_archive(file_path, temp_dir)
            
        # Read all project files
        files_content = {}
        for path in temp_dir.rglob('*'):
            if path.is_file():
                content = read_file_content(path)
                if content:  # Only include files we could read
                    relative_path = str(path.relative_to(temp_dir))
                    files_content[relative_path] = content
                    
        # Process the project
        result = await process_project(files_content)
        
        if result.get("status") == "success":
            project_name = file.filename.replace(".zip", "")
            processed_projects[project_name] = {
                "files_content": files_content,
                "project_info": result.get("project_info", {})
            }
            return {"status": "success", "project_name": project_name}
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Processing failed"))
            
    except Exception as e:
        logger.error(f"Error processing project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temporary files
        if temp_dir.exists():
            shutil.rmtree(temp_dir)

@router.get("/projects")
async def list_projects():
    """List all processed projects."""
    try:
        projects = []
        for name, data in processed_projects.items():
            projects.append({
                "name": name,
                "info": data.get("project_info", {}),
                "status": "success"
            })
        return projects
    except Exception as e:
        logger.error(f"Error listing projects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-docs/{project_name}")
async def generate_project_documentation(project_name: str):
    """Generate documentation for a specific project."""
    try:
        if project_name not in processed_projects:
            raise HTTPException(status_code=404, detail="Project not found")
            
        project = processed_projects[project_name]
        files_content = project.get("files_content", {})
        
        documentation = {
            "project_name": project_name,
            "project_info": project.get("project_info", {}),
            "file_structure": {
                name: {"type": "file"} for name in files_content.keys()
            },
            "analysis": {
                "summary": await generate_project_summary(files_content),
                "components": await analyze_main_components(files_content),
                "code_quality": await analyze_code_quality(files_content)
            }
        }
        
        return {
            "status": "success",
            "documentation": documentation
        }
        
    except Exception as e:
        logger.error(f"Error generating documentation for {project_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_name}")
async def delete_project(project_name: str):
    """Delete a project."""
    try:
        if project_name not in processed_projects:
            raise HTTPException(status_code=404, detail="Project not found")
            
        del processed_projects[project_name]
        return {"status": "success", "message": f"Project {project_name} deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting project {project_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))