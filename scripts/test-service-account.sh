#!/bin/bash
# Test script for Service Account integration
# Usage: ./scripts/test-service-account.sh

set -e

API_BASE="${API_BASE:-http://localhost:3000}"
LIST_NAME="${LIST_NAME:-AA Service Account Test}"

echo "=========================================="
echo "Google Service Account Integration Test"
echo "=========================================="
echo "API Base: $API_BASE"
echo "List Name: $LIST_NAME"
echo ""

# Test 1: Get all task lists
echo "Test 1: Getting all task lists..."
response=$(curl -s "$API_BASE/api/google-tasks-service?action=list")
echo "$response" | jq .

# Extract list ID for AA Service Account Test
list_id=$(echo "$response" | jq -r --arg name "$LIST_NAME" '.data[] | select(.title == $name) | .id // empty')

if [ -z "$list_id" ] || [ "$list_id" = "null" ]; then
  echo ""
  echo "Test 2: Creating task list '$LIST_NAME'..."
  response=$(curl -s "$API_BASE/api/google-tasks-service?action=get-or-create-list&listName=$LIST_NAME")
  echo "$response" | jq .
  list_id=$(echo "$response" | jq -r '.data.id')
fi

if [ -z "$list_id" ] || [ "$list_id" = "null" ]; then
  echo "❌ Failed to get or create task list"
  exit 1
fi

echo ""
echo "✅ Using task list ID: $list_id"
echo ""

# Test 3: Get tasks from the list
echo "Test 3: Getting tasks from list..."
response=$(curl -s "$API_BASE/api/google-tasks-service?action=tasks&tasklistId=$list_id")
echo "$response" | jq .
task_count=$(echo "$response" | jq '.data | length // 0')
echo "Found $task_count tasks"
echo ""

# Test 4: Create a test task
echo "Test 4: Creating test task..."
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
response=$(curl -s -X POST "$API_BASE/api/google-tasks-service" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"create-task\",
    \"tasklistId\": \"$list_id\",
    \"title\": \"Test task from Service Account - $timestamp\",
    \"notes\": \"This is a test task created via Service Account at $timestamp\"
  }")
echo "$response" | jq .

task_id=$(echo "$response" | jq -r '.data.id // empty')
if [ -z "$task_id" ] || [ "$task_id" = "null" ]; then
  echo "❌ Failed to create task"
  exit 1
fi

echo ""
echo "✅ Created task with ID: $task_id"
echo ""

# Test 5: Update the task
echo "Test 5: Updating task..."
response=$(curl -s -X POST "$API_BASE/api/google-tasks-service" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"update-task\",
    \"tasklistId\": \"$list_id\",
    \"taskId\": \"$task_id\",
    \"updates\": {
      \"title\": \"Updated task title - $timestamp\"
    }
  }")
echo "$response" | jq .
echo ""

# Test 6: Verify update
echo "Test 6: Verifying task update..."
response=$(curl -s "$API_BASE/api/google-tasks-service?action=tasks&tasklistId=$list_id")
echo "$response" | jq .

updated_title=$(echo "$response" | jq -r --arg id "$task_id" '.data[] | select(.id == $id) | .title // empty')
if echo "$updated_title" | grep -q "Updated"; then
  echo "✅ Task title updated successfully"
else
  echo "⚠️  Task update may not have been applied"
fi
echo ""

# Test 7: Delete the test task
echo "Test 7: Deleting test task..."
response=$(curl -s -X POST "$API_BASE/api/google-tasks-service" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"delete-task\",
    \"tasklistId\": \"$list_id\",
    \"taskId\": \"$task_id\"
  }")
echo "$response" | jq .
echo ""

# Test 8: Verify deletion
echo "Test 8: Verifying task deletion..."
response=$(curl -s "$API_BASE/api/google-tasks-service?action=tasks&tasklistId=$list_id")
deleted_task=$(echo "$response" | jq -r --arg id "$task_id" '.data[] | select(.id == $id) | .id // empty')

if [ -z "$deleted_task" ] || [ "$deleted_task" = "null" ]; then
  echo "✅ Task deleted successfully"
else
  echo "⚠️  Task may not have been deleted"
fi
echo ""

echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="
