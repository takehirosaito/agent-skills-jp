"""
パイプライン共通設定
====================
データ保存先・クローン先を環境変数で切り替え可能にする。
デフォルトはリポジトリ直下の data/ , .clones/ 。
"""

import os
from pathlib import Path

# リポジトリのルート (packages/pipeline/config.py の2つ上)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

DATA_DIR = Path(os.environ.get("AGENT_SKILLS_DATA_DIR", _PROJECT_ROOT / "data"))
CLONE_DIR = Path(os.environ.get("AGENT_SKILLS_CLONE_DIR", _PROJECT_ROOT / ".clones"))

DATA_DIR.mkdir(parents=True, exist_ok=True)
CLONE_DIR.mkdir(parents=True, exist_ok=True)
