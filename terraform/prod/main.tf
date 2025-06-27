terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.46.0"
    }
  }
  required_version = ">= 1.3.0"
}

module "cloudbuild" {
  source            = "../modules/cloudbuild"

  project_id        = "luca-ledger-prod"
  region            = "us-central1"
  host_connection   = "luca-ledger-prod-gh-connection"
  repo_name         = "LucaFinancial-LucaLedger"
  bucket_name       = "luca-ledger-prod-web-app-bucket"
  branch_pattern    = "^main$"
  cloudbuild_service_account_email = "cloudbuild-sa@luca-ledger-prod.iam.gserviceaccount.com"
}
