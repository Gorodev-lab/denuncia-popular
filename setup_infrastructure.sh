#!/bin/bash

# ==============================================================================
# INFRASTRUCTURE SCRIPT: Denuncia Popular v2.2 -> Esoteria AI Ecosystem
# ==============================================================================
# This script automates the creation of the project hierarchy in GCP
# following the Esoteria AI SOP.
#
# USAGE:
#   chmod +x setup_infrastructure.sh
#   ./setup_infrastructure.sh
#
# REQUIREMENTS:
#   - gcloud CLI installed and authenticated
#   - 'Project Creator' permissions on the destination folder
#   - 'Billing User' permissions on the billing account
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. VARIABLES (DEFINE BEFORE RUNNING)
# ------------------------------------------------------------------------------
# [IMPORTANT] Replace these values with real organization data
FOLDER_ID="[INSERT_FOLDER_ID]"          # Numeric ID of the 'Products' folder
BILLING_ID="[INSERT_BILLING_ID]"        # Billing Account ID (e.g., 0X0X0X-0X0X0X-0X0X0X)
ORG_DOMAIN="esoteriaai.com"
TECH_LEAD_EMAIL="[INSERT_TECH_LEAD_EMAIL]" # Tech Lead email for editor roles

# Standardized project names
PROJ_SANDBOX="denuncia-popular-sandbox"
PROJ_DEV="denuncia-popular-dev"
PROJ_PROD="denuncia-popular-prod"

# APIs to enable
# Note: Includes Maps JS, Geocoding, and Places APIs required by the app,
# plus Gemini (Generative Language).
APIS=(
  "generativelanguage.googleapis.com" # Gemini
  "maps-backend.googleapis.com"       # Maps JavaScript API
  "geocoding-backend.googleapis.com"  # Geocoding API
  "places-backend.googleapis.com"     # Places API
)

# ------------------------------------------------------------------------------
# 2. HELPER FUNCTIONS
# ------------------------------------------------------------------------------
create_project() {
  local PROJECT_ID=$1
  local ENV=$2
  
  echo ">>> Creating project: $PROJECT_ID (Env: $ENV)..."
  
  # Create project
  gcloud projects create "$PROJECT_ID" \
    --folder="$FOLDER_ID" \
    --name="$PROJECT_ID" \
    --labels="product=denuncia-popular,env=$ENV,owner=esoteria" \
    --quiet

  # Link billing
  echo ">>> Linking billing..."
  gcloud beta billing projects link "$PROJECT_ID" \
    --billing-account="$BILLING_ID"

  # Enable APIs
  echo ">>> Enabling APIs..."
  for api in "${APIS[@]}"; do
    gcloud services enable "$api" --project="$PROJECT_ID"
  done

  # Configure budget (Placeholder - requires Pub/Sub and Cloud Functions for complex alerts,
  # here we simulate the base configuration via CLI output).
  echo ">>> [MANUAL] Configure budget for $PROJECT_ID in Console:"
  if [ "$ENV" == "prod" ]; then
    echo "    - Amount: \$50 USD"
    echo "    - Alerts: 50%, 80%, 100%"
  else
    echo "    - Amount: \$20 USD"
    echo "    - Alerts: 50%, 80%, 100%"
  fi
}

# ------------------------------------------------------------------------------
# 3. EXECUTION
# ------------------------------------------------------------------------------

# Validate variables
if [[ "$FOLDER_ID" == *INSERT* ]] || [[ "$BILLING_ID" == *INSERT* ]]; then
  echo "ERROR: You must configure FOLDER_ID and BILLING_ID in the script before running."
  exit 1
fi

echo "=== STARTING INFRASTRUCTURE MIGRATION: DENUNCIA POPULAR ==="

# Create Sandbox
create_project "$PROJ_SANDBOX" "sandbox"

# Create Dev
create_project "$PROJ_DEV" "dev"

# Create Prod
create_project "$PROJ_PROD" "prod"

echo "=== MIGRATION COMPLETED ==="
echo "Next steps:"
echo "1. Configure OAuth Consent Screen in Shared-Infra."
echo "2. Generate API Keys in $PROJ_PROD and restrict them (see SECURITY.md)."
echo "3. Update secrets in Vercel (see .env.local.example)."
