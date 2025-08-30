#!/bin/bash
cd /home/kavia/workspace/code-generation/data-insights-dashboard-108813/dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

