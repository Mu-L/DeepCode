#!/bin/bash
# DeepCode New UI 一键启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEW_UI_DIR="$SCRIPT_DIR/new_ui"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 启动 DeepCode New UI..."
echo ""

# ============ 自动设置 Python 环境 ============
setup_python_env() {
    # 优先级: 已激活的 conda > 已激活的 venv > 本地 .venv > 本地 venv > 自动激活 conda deepcode
    
    if [ -n "$CONDA_PREFIX" ]; then
        echo -e "${GREEN}✓ 使用 conda 环境: $(basename $CONDA_PREFIX)${NC}"
        export PATH="$CONDA_PREFIX/bin:$PATH"
        return 0
    fi
    
    if [ -n "$VIRTUAL_ENV" ]; then
        echo -e "${GREEN}✓ 使用 virtualenv: $(basename $VIRTUAL_ENV)${NC}"
        export PATH="$VIRTUAL_ENV/bin:$PATH"
        return 0
    fi
    
    # 尝试自动激活本地虚拟环境
    if [ -d "$SCRIPT_DIR/.venv" ]; then
        echo -e "${YELLOW}⚡ 自动激活 .venv 环境${NC}"
        source "$SCRIPT_DIR/.venv/bin/activate"
        return 0
    fi
    
    if [ -d "$SCRIPT_DIR/venv" ]; then
        echo -e "${YELLOW}⚡ 自动激活 venv 环境${NC}"
        source "$SCRIPT_DIR/venv/bin/activate"
        return 0
    fi
    
    # 尝试自动激活 conda deepcode 环境
    if command -v conda &> /dev/null; then
        if conda env list 2>/dev/null | grep -q "deepcode"; then
            echo -e "${YELLOW}⚡ 自动激活 conda deepcode 环境${NC}"
            eval "$(conda shell.bash hook)"
            conda activate deepcode
            export PATH="$CONDA_PREFIX/bin:$PATH"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}⚠ 未检测到虚拟环境，使用系统 Python${NC}"
    return 1
}

setup_python_env
echo -e "📍 Python: $(which python)"
echo ""
# ============================================

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在关闭服务..."
    pkill -P $$ 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# 检查目录
if [ ! -d "$NEW_UI_DIR" ]; then
    echo "❌ 错误: new_ui 目录不存在"
    exit 1
fi

# 启动后端
echo -e "${BLUE}[1/2] 启动后端服务...${NC}"
cd "$NEW_UI_DIR/backend"

# 安装依赖（如果需要）
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}安装后端依赖...${NC}"
    pip install fastapi uvicorn pydantic-settings python-multipart aiofiles websockets -q
fi

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2

echo -e "${GREEN}✓ 后端已启动: http://localhost:8000${NC}"

# 启动前端
echo -e "${BLUE}[2/2] 启动前端服务...${NC}"
cd "$NEW_UI_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖 (首次运行)...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "╔════════════════════════════════════════╗"
echo -e "║  ${GREEN}DeepCode New UI 已启动!${NC}              ║"
echo "╠════════════════════════════════════════╣"
echo "║                                        ║"
echo "║  🌐 前端: http://localhost:5173        ║"
echo "║  🔧 后端: http://localhost:8000        ║"
echo "║  📚 API:  http://localhost:8000/docs   ║"
echo "║                                        ║"
echo "║  按 Ctrl+C 停止所有服务                ║"
echo "╚════════════════════════════════════════╝"
echo ""

wait
