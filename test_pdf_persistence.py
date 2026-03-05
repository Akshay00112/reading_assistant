"""
Test script to verify PDF persistence across browser sessions
Tests the complete flow:
1. User registration
2. PDF upload
3. Logout
4. Login with same account
5. Verify uploaded PDF appears in history
"""

import requests
import json
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:5000"
TEST_EMAIL = "test_persist@gmail.com"
TEST_PASSWORD = "Test123!@#"
TEST_PDF = Path("test_sample.pdf")

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_step(step_num, description):
    """Print a test step"""
    print(f"\n{BLUE}[Step {step_num}] {description}{RESET}")

def print_success(message):
    """Print success message"""
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    """Print error message"""
    print(f"{RED}✗ {message}{RESET}")

def print_info(message):
    """Print info message"""
    print(f"{YELLOW}ℹ {message}{RESET}")

class PersistenceTest:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.pdf_id = None
        self.session = requests.Session()

    def test_registration(self):
        """Step 1: Register a new test user"""
        print_step(1, "User Registration")
        
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/api/auth/register",
                json=payload
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                if data.get('success'):
                    print_success(f"User registered: {TEST_EMAIL}")
                    self.user_id = data.get('user_id')
                    return True
                else:
                    print_error(f"Registration failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                # If user already exists, continue with login
                print_info(f"User might already exist (status: {response.status_code}). Proceeding to login...")
                return True
                
        except Exception as e:
            print_error(f"Registration error: {str(e)}")
            return False

    def test_login(self, email=TEST_EMAIL, password=TEST_PASSWORD):
        """Step 2: Login to get JWT token"""
        print_step(2, f"User Login ({email})")
        
        payload = {
            "email": email,
            "password": password
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/api/auth/login",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.token = data.get('token')
                    self.user_id = data.get('user_id')
                    self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                    print_success(f"Login successful. Token obtained.")
                    print_info(f"User ID: {self.user_id}")
                    return True
                else:
                    print_error(f"Login failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print_error(f"Login error (status: {response.status_code})")
                print_info(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Login exception: {str(e)}")
            return False

    def test_pdf_upload(self):
        """Step 3: Upload a test PDF"""
        print_step(3, "PDF Upload")
        
        # Create a simple test PDF if it doesn't exist
        if not TEST_PDF.exists():
            print_info(f"Creating test PDF: {TEST_PDF}")
            self._create_test_pdf()
        
        try:
            with open(TEST_PDF, 'rb') as f:
                files = {'pdf': (TEST_PDF.name, f, 'application/pdf')}
                response = self.session.post(
                    f"{BACKEND_URL}/api/pdf/upload-pdf",
                    files=files
                )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print_success(f"PDF uploaded: {data.get('original_filename')}")
                    print_info(f"Stored as: {data.get('filename')}")
                    print_info(f"Total sentences: {data.get('total_sentences')}")
                    print_info(f"Pages: {data.get('pages')}")
                    
                    # Now save to history
                    return self._save_to_history(data)
                else:
                    print_error(f"Upload failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print_error(f"Upload error (status: {response.status_code})")
                return False
                
        except Exception as e:
            print_error(f"Upload exception: {str(e)}")
            return False

    def _save_to_history(self, upload_data):
        """Save uploaded PDF to history database"""
        print_step(3.5, "Saving to History Database")
        
        history_payload = {
            "pdf_name": upload_data.get('original_filename'),
            "pdf_path": upload_data.get('filename'),
            "total_pages": upload_data.get('pages', 1),
            "total_sentences": upload_data.get('total_sentences', 0),
            "file_size": 0  # Not available from upload
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/api/history",
                json=history_payload
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                if data.get('success'):
                    self.pdf_id = data.get('history_id')
                    print_success(f"PDF saved to history. History ID: {self.pdf_id}")
                    return True
                else:
                    print_error(f"Failed to save to history: {data.get('error')}")
                    return False
            else:
                print_error(f"History save error (status: {response.status_code})")
                print_info(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"History save exception: {str(e)}")
            return False

    def test_get_history_before_logout(self):
        """Step 4: Get history before logout"""
        print_step(4, "Fetch History (Before Logout)")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/api/history")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    history = data.get('history', [])
                    print_success(f"Retrieved {len(history)} items from history")
                    for item in history:
                        print_info(f"  - {item.get('pdf_name')} ({item.get('total_pages')} pages)")
                    return True, history
                else:
                    print_error(f"Failed to retrieve history: {data.get('error')}")
                    return False, []
            else:
                print_error(f"History fetch error (status: {response.status_code})")
                return False, []
                
        except Exception as e:
            print_error(f"History fetch exception: {str(e)}")
            return False, []

    def test_logout(self):
        """Step 5: Logout"""
        print_step(5, "User Logout")
        
        # Clear token and session headers
        self.token = None
        self.session.headers.pop('Authorization', None)
        
        print_success("Logged out successfully")
        return True

    def test_relogin(self):
        """Step 6: Login again with same credentials"""
        print_step(6, "Re-login with Same Credentials")
        return self.test_login()

    def test_get_history_after_login(self):
        """Step 7: Get history after re-login"""
        print_step(7, "Fetch History (After Re-login)")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/api/history")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    history = data.get('history', [])
                    print_success(f"Retrieved {len(history)} items from history after re-login")
                    
                    # Verify the uploaded PDF is still there
                    pdfs = [item.get('pdf_name') for item in history]
                    if TEST_PDF.name in pdfs:
                        print_success(f"✓✓✓ PDF PERSISTENCE VERIFIED! '{TEST_PDF.name}' found in history!")
                        return True
                    else:
                        print_error(f"❌ PDF NOT FOUND in history after re-login!")
                        print_info(f"PDFs in history: {pdfs}")
                        return False
                        
                else:
                    print_error(f"Failed to retrieve history: {data.get('error')}")
                    return False
            else:
                print_error(f"History fetch error (status: {response.status_code})")
                return False
                
        except Exception as e:
            print_error(f"History fetch exception: {str(e)}")
            return False

    def _create_test_pdf(self):
        """Create a simple test PDF"""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            c = canvas.Canvas(str(TEST_PDF), pagesize=letter)
            c.drawString(100, 750, "Test PDF for Persistence Testing")
            c.drawString(100, 730, "This is a test document.")
            c.drawString(100, 710, "Line 1: This sentence tests the reading assistant.")
            c.drawString(100, 690, "Line 2: The assistant should extract this text.")
            c.drawString(100, 670, "Line 3: After upload and logout, this PDF should persist.")
            c.showPage()
            c.save()
            print_success(f"Test PDF created: {TEST_PDF}")
            
        except ImportError:
            print_error("reportlab not installed. Please install it: pip install reportlab")
            # Create a dummy PDF
            with open(TEST_PDF, 'wb') as f:
                f.write(b'%PDF-1.4\n%dummy test file')
            print_info("Created dummy test file")

    def run_full_test(self):
        """Run the complete persistence test"""
        print(f"\n{BLUE}{'='*60}")
        print(f"PDF PERSISTENCE TEST SUITE")
        print(f"{'='*60}{RESET}")
        
        steps = [
            ("Register User", self.test_registration),
            ("Login", lambda: self.test_login()),
            ("Upload PDF", self.test_pdf_upload),
            ("Fetch History Before Logout", self.test_get_history_before_logout),
            ("Logout", self.test_logout),
            ("Re-login", self.test_relogin),
            ("Fetch History After Re-login", self.test_get_history_after_login),
        ]
        
        results = []
        for step_name, step_func in steps:
            try:
                if "Fetch History" in step_name:
                    result, _ = step_func()
                else:
                    result = step_func()
                results.append((step_name, result))
            except Exception as e:
                print_error(f"Exception in {step_name}: {str(e)}")
                results.append((step_name, False))
        
        # Summary
        print(f"\n{BLUE}{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}{RESET}")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for step_name, result in results:
            status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
            print(f"{status} - {step_name}")
        
        print(f"\n{GREEN}Passed: {passed}/{total}{RESET}")
        
        if passed == total:
            print(f"\n{GREEN}🎉 ALL TESTS PASSED! PDF persistence is working correctly!{RESET}")
            return True
        else:
            print(f"\n{RED}❌ Some tests failed. Check the output above for details.{RESET}")
            return False

if __name__ == "__main__":
    print_info("Starting PDF Persistence Test Suite...")
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Test Email: {TEST_EMAIL}")
    print_info(f"Test PDF: {TEST_PDF}")
    
    # Wait a moment for user to verify backend is running
    time.sleep(1)
    
    tester = PersistenceTest()
    success = tester.run_full_test()
    
    exit(0 if success else 1)
