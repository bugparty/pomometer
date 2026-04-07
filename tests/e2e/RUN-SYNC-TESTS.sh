#!/bin/bash

# Google Tasks 同步测试运行脚本
# 用法: ./RUN-SYNC-TESTS.sh [option]
#
# 选项:
#   all      - 运行所有测试（默认）
#   headed   - 带浏览器界面运行
#   debug    - 调试模式
#   report   - 生成HTML报告
#   single   - 运行单个测试（需要指定测试名）

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Google Tasks 同步 E2E 测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查 Playwright 是否安装
if ! command -v playwright &> /dev/null; then
    echo -e "${RED}✗ Playwright 未安装${NC}"
    echo "运行: pnpm exec playwright install"
    exit 1
fi

echo -e "${GREEN}✓ Playwright 已安装${NC}"
echo ""

# 默认运行所有测试
MODE="${1:-all}"

case "$MODE" in
    "all")
        echo -e "${BLUE}运行所有同步测试...${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock
        ;;

    "headed")
        echo -e "${BLUE}带浏览器界面运行测试...${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --headed
        ;;

    "debug")
        echo -e "${BLUE}调试模式...${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --debug
        ;;

    "report")
        echo -e "${BLUE}生成HTML报告...${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --reporter=html
        echo ""
        echo -e "${GREEN}✓ 报告已生成${NC}"
        echo "运行以下命令查看报告:"
        echo "  pnpm exec playwright show-report"
        ;;

    "single")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ 请指定测试名称${NC}"
            echo ""
            echo "可用的测试:"
            echo "  1. should trigger full sync on login"
            echo "  2. should show sync button and trigger manual sync"
            echo "  3. should sync pending operations before fetching from server"
            echo "  4. should not overwrite user actions during sync"
            echo "  5. should show multiple added todos and sync button"
            echo "  6. should not sync when offline"
            echo "  7. should stop sync on authentication failure"
            echo ""
            echo "用法: ./RUN-SYNC-TESTS.sh single \"测试名称\""
            exit 1
        fi

        echo -e "${BLUE}运行单个测试: $2${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock -g "$2"
        ;;

    "watch")
        echo -e "${BLUE}监听模式（文件改变自动运行）...${NC}"
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --ui
        ;;

    "list")
        echo -e "${BLUE}可用的测试:${NC}"
        echo ""
        pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --list
        ;;

    "help")
        echo "用法: ./RUN-SYNC-TESTS.sh [option]"
        echo ""
        echo "选项:"
        echo "  all      - 运行所有测试（默认）"
        echo "  headed   - 带浏览器界面运行"
        echo "  debug    - 调试模式"
        echo "  report   - 生成HTML报告"
        echo "  single   - 运行单个测试"
        echo "  watch    - 监听模式"
        echo "  list     - 列出所有测试"
        echo "  help     - 显示帮助"
        echo ""
        echo "示例:"
        echo "  ./RUN-SYNC-TESTS.sh all"
        echo "  ./RUN-SYNC-TESTS.sh headed"
        echo "  ./RUN-SYNC-TESTS.sh single \"should trigger full sync\""
        ;;

    *)
        echo -e "${RED}✗ 未知选项: $MODE${NC}"
        echo "运行 './RUN-SYNC-TESTS.sh help' 查看帮助"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  测试完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
