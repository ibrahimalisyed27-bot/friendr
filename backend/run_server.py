#!/usr/bin/env python
"""
Script to run the FriendMatch Django server
"""
import os
import sys
import subprocess

def run_command(command):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print("Starting FriendMatch Django Server...")
    
    # Check if virtual environment exists
    if not os.path.exists('venv'):
        print("Virtual environment not found. Please run setup.py first.")
        return False
    
    # Determine the correct pip command
    if os.name == 'nt':  # Windows
        pip_cmd = 'venv\\Scripts\\python'
    else:  # Unix/Linux/Mac
        pip_cmd = 'venv/bin/python'
    
    # Check if migrations are needed
    print("Checking for pending migrations...")
    success, output = run_command(f'{pip_cmd} manage.py showmigrations --plan')
    if not success:
        print(f"Error checking migrations: {output}")
        return False
    
    if '[ ]' in output:
        print("Running pending migrations...")
        success, output = run_command(f'{pip_cmd} manage.py migrate')
        if not success:
            print(f"Error running migrations: {output}")
            return False
    
    # Start the server
    print("Starting development server...")
    print("Server will be available at: http://127.0.0.1:8000")
    print("Admin interface: http://127.0.0.1:8000/admin")
    print("API endpoints: http://127.0.0.1:8000/api/")
    print("\nPress Ctrl+C to stop the server\n")
    
    success, output = run_command(f'{pip_cmd} manage.py runserver')
    if not success:
        print(f"Error starting server: {output}")
        return False
    
    return True

if __name__ == '__main__':
    main()
