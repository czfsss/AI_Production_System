"""
JWT认证配置
"""

import os
from datetime import datetime, timedelta
from typing import Optional

# JWT配置
SECRET_KEY = os.getenv("SECRET_KEY", "GVFmrQs5xDxYZ_CVFAWRMdhebb7XNBPiR9DX8jeE0Ls")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# OAuth2配置
OAUTH2_SCHEME = "Bearer"

# 密码配置
PWD_CONTEXT_SCHEMES = ["bcrypt"]
PWD_CONTEXT_DEPRECATED = "auto"
