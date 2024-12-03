import google.generativeai as genai
import os
from dotenv import load_dotenv
import ast
import logging
from typing import Dict, Any, List, Optional
import json
import re

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

logger = logging.getLogger(__name__)

async def process_project(files_content: Dict[str, str]) -> Dict[str, Any]:
    """Process project files and generate documentation."""
    try:
        # First, log what we're processing
        logger.info(f"Processing project with {len(files_content)} files")
        
        # Generate all required information
        description = await generate_project_description(files_content)
        technologies = await identify_technologies(files_content)
        dependencies = await extract_dependencies(files_content)
        
        logger.info(f"Found technologies: {technologies}")
        logger.info(f"Found dependencies: {dependencies}")
        
        project_info = {
            "description": description,
            "technologies": technologies,
            "dependencies": dependencies,
            "entry_points": await identify_entry_points(files_content),
            "key_components": await extract_key_components(files_content)
        }
        
        return {
            "project_info": project_info,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error in process_project: {str(e)}")
        return {"status": "error", "error": str(e)}

async def generate_project_description(files_content: Dict[str, str]) -> str:
    """Generate project description using Gemini AI."""
    try:
        # Create file summary
        file_list = "\n".join([f"- {filename}" for filename in files_content.items()])
        
        prompt = f"""
        Analyze this software project and provide a comprehensive description.

        Project Files:
        {file_list}

        Please provide a detailed description in the following format:

        # Project Overview
        [Describe the main purpose and functionality of the project]

        ## Key Features
        - [List main features]
        - [Describe core functionality]
        - [Mention unique aspects]

        ## Technical Details
        - [Describe the architecture]
        - [List main technologies]
        - [Explain key components]

        Keep the description technical but clear and concise.
        """

        # Get response from Gemini
        response = model.generate_content(prompt)
        
        if response and response.text:
            logger.info("Successfully generated project description")
            return response.text
            
        logger.warning("Failed to generate description with Gemini")
        return "A software project with multiple components and features."
        
    except Exception as e:
        logger.error(f"Error in generate_project_description: {str(e)}")
        return "A software project with multiple components and features."

async def identify_technologies(files_content: Dict[str, str]) -> List[str]:
    """Identify technologies used in the project."""
    technologies = set()
    
    # Check file extensions
    for filename in files_content.keys():
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        if ext == 'py':
            technologies.add('Python')
        elif ext == 'js':
            technologies.add('JavaScript')
        elif ext == 'html':
            technologies.add('HTML')
        elif ext == 'css':
            technologies.add('CSS')
        elif ext == 'java':
            technologies.add('Java')
        elif ext == 'cpp' or ext == 'cc':
            technologies.add('C++')
        elif ext == 'go':
            technologies.add('Go')
            
    # Check content for common frameworks and libraries
    for content in files_content.values():
        content_lower = content.lower()
        # Python frameworks
        if 'django' in content_lower:
            technologies.add('Django')
        if 'flask' in content_lower:
            technologies.add('Flask')
        if 'fastapi' in content_lower:
            technologies.add('FastAPI')
        if 'streamlit' in content_lower:
            technologies.add('Streamlit')
        # JavaScript frameworks
        if 'react' in content_lower:
            technologies.add('React')
        if 'vue' in content_lower:
            technologies.add('Vue.js')
        if 'angular' in content_lower:
            technologies.add('Angular')
        # Data science libraries
        if 'pandas' in content_lower:
            technologies.add('Pandas')
        if 'numpy' in content_lower:
            technologies.add('NumPy')
        if 'tensorflow' in content_lower:
            technologies.add('TensorFlow')
            
    return list(technologies)

async def extract_dependencies(files_content: Dict[str, str]) -> List[str]:
    """Extract project dependencies."""
    dependencies = set()
    
    for filename, content in files_content.items():
        # Python dependencies
        if filename.lower() == 'requirements.txt':
            for line in content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#'):
                    dependencies.add(line)
                    
        # JavaScript dependencies
        elif filename.lower() == 'package.json':
            try:
                package_data = json.loads(content)
                deps = package_data.get('dependencies', {})
                dev_deps = package_data.get('devDependencies', {})
                dependencies.update(f"{k}@{v}" for k, v in deps.items())
                dependencies.update(f"{k}@{v}" for k, v in dev_deps.items())
            except json.JSONDecodeError:
                logger.error(f"Error parsing package.json: {filename}")
                
        # Java dependencies
        elif filename.lower() == 'pom.xml':
            dependencies.add("Maven dependencies found")
            
        # Go dependencies
        elif filename.lower() == 'go.mod':
            dependencies.add("Go modules found")
            
    return list(dependencies)

async def identify_entry_points(files_content: Dict[str, str]) -> List[Dict[str, str]]:
    """Identify main entry points of the project."""
    entry_points = []
    
    for filename, content in files_content.items():
        if any(name in filename.lower() for name in ['main.py', 'app.py', 'index.js', 'server.js']):
            entry_points.append({
                'file': filename,
                'description': await extract_file_description(content)
            })
            
    return entry_points

async def extract_key_components(files_content: Dict[str, str]) -> List[Dict[str, Any]]:
    """Extract key components and their documentation."""
    components = []
    
    for filename, content in files_content.items():
        if filename.endswith(('.py', '.js', '.jsx', '.ts', '.tsx')):
            classes = await extract_classes(content)
            functions = await extract_functions(content)
            
            if classes or functions:
                components.append({
                    'file': filename,
                    'classes': classes,
                    'functions': functions
                })
                
    return components

async def analyze_main_components(files_content: Dict[str, str]) -> List[Dict[str, Any]]:
    """Analyze main components of the project."""
    try:
        components = []
        for filename, content in files_content.items():
            if filename.endswith('.py'):
                # Extract classes and functions
                classes = await extract_classes(content)
                functions = await extract_functions(content)
                
                # Generate component description using Gemini
                prompt = f"""
                Analyze this Python file and provide a brief description of its purpose and functionality:

                Filename: {filename}
                Content:
                {content}

                Focus on:
                1. Main purpose of this file
                2. Key functionality
                3. How it integrates with other components
                
                Keep the response concise (2-3 sentences).
                """
                
                try:
                    description = model.generate_content(prompt).text
                except Exception:
                    description = "No description available"

                if classes or functions:
                    components.append({
                        "file": filename,
                        "description": description,
                        "classes": classes,
                        "functions": functions
                    })
        return components
    except Exception as e:
        logger.error(f"Error analyzing components: {str(e)}")
        return []

async def extract_file_description(content: str) -> str:
    """Extract a brief description from a file."""
    try:
        tree = ast.parse(content)
        docstring = ast.get_docstring(tree)
        if docstring:
            return docstring.split('\n')[0]  # Return the first line of the docstring
    except SyntaxError:
        pass
    return "No description available"

async def extract_classes(content: str) -> List[Dict[str, Any]]:
    """Extract class information from Python code."""
    classes = []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                class_info = {
                    'name': node.name,
                    'docstring': ast.get_docstring(node) or 'No documentation available',
                    'methods': [method.name for method in node.body if isinstance(method, ast.FunctionDef)]
                }
                classes.append(class_info)
    except SyntaxError:
        pass
    return classes

async def extract_functions(content: str) -> List[Dict[str, Any]]:
    """Extract function information from Python code."""
    functions = []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_info = {
                    'name': node.name,
                    'docstring': ast.get_docstring(node) or 'No documentation available',
                    'args': [arg.arg for arg in node.args.args]
                }
                functions.append(function_info)
    except SyntaxError:
        pass
    return functions

async def analyze_code_quality(files_content: Dict[str, str]) -> Dict[str, Any]:
    """Analyze code quality metrics."""
    try:
        metrics = {
            'total_lines': 0,
            'code_lines': 0,
            'comment_lines': 0,
            'docstring_coverage': 0,
            'complexity_analysis': {}
        }
        
        total_functions = 0
        documented_functions = 0
        
        for filename, content in files_content.items():
            if filename.endswith('.py'):
                lines = content.splitlines()
                metrics['total_lines'] += len(lines)
                metrics['code_lines'] += sum(1 for line in lines if line.strip() and not line.strip().startswith('#'))
                metrics['comment_lines'] += sum(1 for line in lines if line.strip().startswith('#'))
                
                # Analyze functions and their documentation
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        total_functions += 1
                        if ast.get_docstring(node):
                            documented_functions += 1
        
        if total_functions > 0:
            metrics['docstring_coverage'] = (documented_functions / total_functions) * 100
            
        # Generate code quality insights using Gemini
        prompt = f"""
        Analyze these code quality metrics and provide insights:
        - Total lines: {metrics['total_lines']}
        - Code lines: {metrics['code_lines']}
        - Comment lines: {metrics['comment_lines']}
        - Documentation coverage: {metrics['docstring_coverage']:.1f}%

        Provide brief recommendations for improvement in bullet points.
        """
        
        try:
            metrics['recommendations'] = model.generate_content(prompt).text
        except Exception:
            metrics['recommendations'] = "No recommendations available"
            
        return metrics
    except Exception as e:
        logger.error(f"Error analyzing code quality: {str(e)}")
        return {
            'total_lines': 0,
            'code_lines': 0,
            'comment_lines': 0,
            'docstring_coverage': 0
        }

def get_file_type(filename: str) -> str:
    """Determine file type from extension."""
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    return ext or 'unknown'

def extract_technologies(content: str) -> List[str]:
    """Extract technologies from import statements."""
    technologies = set()
    import_pattern = r'import\s+(\w+)|from\s+(\w+)\s+import'
    
    for match in re.finditer(import_pattern, content):
        tech = match.group(1) or match.group(2)
        if tech in ['flask', 'django', 'fastapi', 'streamlit', 'tensorflow', 'torch']:
            technologies.add(tech)
    
    return list(technologies)

def build_file_structure(filenames: List[str]) -> Dict[str, Any]:
    """Build a hierarchical file structure."""
    structure = {}
    
    for filename in filenames:
        parts = filename.split('/')
        current = structure
        
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
            
        if '__files__' not in current:
            current['__files__'] = []
        current['__files__'].append(parts[-1])
    
    return structure

def determine_project_type(extensions: set, files_content: Dict[str, str]) -> str:
    """Determine the type of project based on files and content."""
    if 'py' in extensions:
        if any('streamlit' in content.lower() for content in files_content.values()):
            return 'Streamlit Application'
        if any('django' in content.lower() for content in files_content.values()):
            return 'Django Application'
        if any('flask' in content.lower() for content in files_content.values()):
            return 'Flask Application'
        return 'Python Project'
    
    if 'js' in extensions or 'jsx' in extensions:
        if any('react' in content.lower() for content in files_content.values()):
            return 'React Application'
        if any('next' in content.lower() for content in files_content.values()):
            return 'Next.js Application'
        return 'JavaScript Project'
    
    if 'java' in extensions:
        if any('springframework' in content.lower() for content in files_content.values()):
            return 'Spring Boot Application'
        return 'Java Project'
    
    if 'go' in extensions:
        return 'Go Project'
    
    if 'rs' in extensions:
        return 'Rust Project'
    
    return 'Generic Software Project'

def extract_key_files(files_content: Dict[str, str], project_type: str) -> Dict[str, str]:
    """Extract relevant files based on project type."""
    key_files = {}
    
    # Common important files
    common_files = ['readme.md', 'readme.txt', 'configuration.', 'config.', '.env.example']
    
    # Project-specific important files
    type_specific_files = {
        'Python Project': ['main.py', 'app.py', 'requirements.txt', 'setup.py'],
        'Streamlit Application': ['streamlit_app.py', 'app.py', 'requirements.txt'],
        'Django Application': ['manage.py', 'settings.py', 'urls.py', 'requirements.txt'],
        'Flask Application': ['app.py', 'wsgi.py', 'requirements.txt'],
        'React Application': ['package.json', 'webpack.config.js', 'tsconfig.json'],
        'Next.js Application': ['next.config.js', 'package.json'],
        'Java Project': ['pom.xml', 'build.gradle', 'application.properties'],
        'Spring Boot Application': ['application.yml', 'application.properties', 'pom.xml'],
        'Go Project': ['go.mod', 'main.go'],
        'Rust Project': ['Cargo.toml', 'main.rs']
    }

    # Get project-specific file patterns
    patterns = type_specific_files.get(project_type, []) + common_files
    
    # Extract matching files
    for filename, content in files_content.items():
        if any(pattern.lower() in filename.lower() for pattern in patterns):
            key_files[filename] = content
            
    return key_files

def get_project_dependencies(files_content: Dict[str, str], project_type: str) -> str:
    """Extract project dependencies based on project type."""
    try:
        if 'requirements.txt' in files_content:
            return files_content['requirements.txt']
        
        if 'package.json' in files_content:
            package_json = json.loads(files_content['package.json'])
            deps = {**package_json.get('dependencies', {}), **package_json.get('devDependencies', {})}
            return '\n'.join(f"{k}: {v}" for k, v in deps.items())
        
        if 'pom.xml' in files_content:
            return "Maven dependencies found in pom.xml"
            
        if 'build.gradle' in files_content:
            return "Gradle dependencies found in build.gradle"
            
        if 'go.mod' in files_content:
            return files_content['go.mod']
            
        if 'Cargo.toml' in files_content:
            return "Rust dependencies found in Cargo.toml"
            
        return "No standard dependency file found"
    except Exception as e:
        logger.error(f"Error extracting dependencies: {str(e)}")
        return "Error extracting dependencies"

async def generate_project_summary(files_content: Dict[str, str]) -> str:
    """Generate a basic summary of the project."""
    try:
        # Count file types
        file_types = {}
        for filename in files_content.keys():
            ext = filename.split('.')[-1].lower() if '.' in filename else 'no_extension'
            file_types[ext] = file_types.get(ext, 0) + 1
        
        # Get total lines of code
        total_lines = sum(len(content.splitlines()) for content in files_content.values())
        
        # Create summary
        summary = [
            "Project Summary:",
            f"Total files: {len(files_content)}",
            f"Total lines of code: {total_lines}",
            "\nFile types:",
        ]
        
        for ext, count in file_types.items():
            summary.append(f"- {ext}: {count} files")
            
        # Add main files found
        main_files = [
            filename for filename in files_content.keys()
            if any(name in filename.lower() for name in ['main', 'app', 'index', 'readme'])
        ]
        
        if main_files:
            summary.append("\nMain files found:")
            for file in main_files:
                summary.append(f"- {file}")
                
        # Try to identify project type
        project_type = "Unknown"
        if any(filename.endswith('.py') for filename in files_content.keys()):
            project_type = "Python"
        elif any(filename.endswith('.js') for filename in files_content.keys()):
            project_type = "JavaScript"
        elif any(filename.endswith('.java') for filename in files_content.keys()):
            project_type = "Java"
            
        summary.insert(0, f"Project Type: {project_type}")
        
        return "\n".join(summary)
        
    except Exception as e:
        logger.error(f"Error generating project summary: {str(e)}")
        return f"Project contains {len(files_content)} files."

# Make sure these functions are also defined
async def identify_entry_points(files_content: Dict[str, str]) -> List[str]:
    """Identify main entry points of the project."""
    entry_points = []
    
    for filename, content in files_content.items():
        if any(name in filename.lower() for name in ['main', 'app', 'index']):
            entry_points.append(filename)
            
    return entry_points

async def extract_key_components(files_content: Dict[str, str]) -> List[Dict[str, Any]]:
    """Extract key components from the project."""
    components = []
    
    for filename, content in files_content.items():
        if filename.endswith('.py'):
            try:
                tree = ast.parse(content)
                classes = []
                functions = []
                
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        classes.append({
                            'name': node.name,
                            'docstring': ast.get_docstring(node) or 'No documentation available',
                            'methods': [method.name for method in node.body if isinstance(method, ast.FunctionDef)]
                        })
                    elif isinstance(node, ast.FunctionDef):
                        functions.append({
                            'name': node.name,
                            'docstring': ast.get_docstring(node) or 'No documentation available',
                            'args': [arg.arg for arg in node.args.args]
                        })
                        
                if classes or functions:
                    components.append({
                        'file': filename,
                        'classes': classes,
                        'functions': functions
                    })
            except Exception as e:
                logger.error(f"Error parsing {filename}: {str(e)}")
                
    return components