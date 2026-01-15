"""Configuration Management"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Paths
    PHASE1_ARTIFACTS_DIR = Path(os.getenv('PHASE1_ARTIFACTS_DIR', '../../Phase-1/artifacts'))
    
    # Output settings
    GENERATE_SQL = os.getenv('GENERATE_SQL', 'true').lower() == 'true'
    GENERATE_ERD = os.getenv('GENERATE_ERD', 'true').lower() == 'true'
    ERD_FORMATS = os.getenv('ERD_FORMATS', 'png,svg,pdf').split(',')
    
    # Puppeteer
    PUPPETEER_EXECUTABLE_PATH = os.getenv('PUPPETEER_EXECUTABLE_PATH')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'phase2.log')

config = Config()

