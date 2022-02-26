#!/bin/bash

export AWS_SECRET_ACCESS_KEY="secret"
export AWS_ACCESS_KEY_ID="key"
export AWS_DEFAULT_REGION="us-east-1"

echo "Creating SQS resources"
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name "gig-user-locations.fifo" --attributes FifoQueue=true --region us-east-1