#!/usr/bin/env python
"""
Setup script for FriendMatch Django backend
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
    print("Setting up FriendMatch Django Backend...")
    
    # Check if virtual environment exists
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        success, output = run_command('python -m venv venv')
        if not success:
            print(f"Error creating virtual environment: {output}")
            return False
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/Mac
        activate_cmd = 'source venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
    
    print("Installing dependencies...")
    success, output = run_command(f'{pip_cmd} install -r requirements.txt')
    if not success:
        print(f"Error installing dependencies: {output}")
        return False
    
    print("Running migrations...")
    success, output = run_command(f'{pip_cmd} run python manage.py makemigrations')
    if not success:
        print(f"Error creating migrations: {output}")
        return False
    
    success, output = run_command(f'{pip_cmd} run python manage.py migrate')
    if not success:
        print(f"Error running migrations: {output}")
        return False
    
    print("Creating superuser...")
    print("You'll need to create a superuser manually:")
    print(f"{pip_cmd} run python manage.py createsuperuser")
    
    print("\nSetup complete! To start the server:")
    print(f"{pip_cmd} run python manage.py runserver")
    
    return True

if __name__ == '__main__':
    main()

