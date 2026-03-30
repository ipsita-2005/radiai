"""
Backend Installation Verification Script
Run this to check if all dependencies are installed correctly
"""
import sys

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError as e:
        print(f"❌ {package_name} - {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Ashwini Backend - Dependency Check")
    print("=" * 60)
    
    packages = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("torch", "torch"),
        ("torchvision", "torchvision"),
        ("pydicom", "pydicom"),
        ("pymongo", "pymongo"),
        ("motor", "motor"),
        ("fpdf2", "fpdf2"),
        ("google.generativeai", "google.generativeai"),
        ("PIL", "PIL"),
        ("numpy", "numpy"),
        ("cv2", "cv2"),
        ("scipy", "scipy"),
    ]
    
    results = []
    for pkg_name, import_name in packages:
        results.append(check_package(pkg_name, import_name))
    
    print("=" * 60)
    print(f"Installed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("\n✅ All dependencies installed successfully!")
        print("\nNext steps:")
        print("1. Set up your .env file with MongoDB URI and Gemini API key")
        print("2. Start MongoDB: mongod --dbpath /path/to/data")
        print("3. Run the server: python main.py")
        return 0
    else:
        print("\n❌ Some dependencies are missing!")
        print("\nInstall missing packages:")
        print("pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())
