#!/bin/bash

# Campus Crowd Monitoring API - Test Script

API_URL="http://localhost:8000"
ADMIN_USER="admin"
ADMIN_PASS="admin123"

echo "Campus Crowd Monitoring API - Test Script"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s "$API_URL/" | jq .
echo ""
echo "---"
echo ""

# Test 2: Login
echo "Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login?username=$ADMIN_USER&password=$ADMIN_PASS")
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Login Response:"
echo $LOGIN_RESPONSE | jq .
echo "Token: $TOKEN"
echo ""
echo "---"
echo ""

# Test 3: Get Status
echo "Test 3: Get Status (All Locations)"
curl -s "$API_URL/status" | jq .
echo ""
echo "---"
echo ""

# Test 4: Record Entry
echo "Test 4: Record Entry to Location 1 (Cafeteria)"
curl -s -X POST "$API_URL/enter?location_id=1" | jq .
echo ""
echo "---"
echo ""

# Test 5: Get Updated Status
echo "Test 5: Get Updated Status"
curl -s "$API_URL/status" | jq .
echo ""
echo "---"
echo ""

# Test 6: Get History
echo "Test 6: Get Activity History"
curl -s "$API_URL/history" | jq .
echo ""
echo "---"
echo ""

# Test 7: Get Alerts
echo "Test 7: Get Alerts"
curl -s "$API_URL/alerts" | jq .
echo ""
echo "---"
echo ""

# Test 8: Record Exit
echo "Test 8: Record Exit from Location 1"
curl -s -X POST "$API_URL/exit?location_id=1" | jq .
echo ""
echo "---"
echo ""

echo "All tests completed!"
