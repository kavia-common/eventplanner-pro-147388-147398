#!/bin/bash
cd /home/kavia/workspace/code-generation/eventplanner-pro-147388-147398/party_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

