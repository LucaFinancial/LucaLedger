terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.46.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "google" {
  project = "luca-ledger-prod"
  region  = "us-central1"
}

module "storage" {
  source          = "../modules/storage"

  project_id      = "luca-ledger-prod"
  bucket_name     = "lucaledger-app"
  region          = "us-central1"
}

module "iam" {
  source          = "../modules/iam"

  project_id      = "luca-ledger-prod"
  bucket_name     = "lucaledger-app"

  depends_on      = [module.storage]
}

module "cloudbuild" {
  source            = "../modules/cloudbuild"

  env               = "prod"
  project_id        = "luca-ledger-prod"
  region            = "us-central1"
  host_connection   = "luca-ledger-prod-gh-connection"
  repo_name         = "LucaFinancial-LucaLedger"
  bucket_name       = "lucaledger-app"
  branch_pattern    = "^main$"

  depends_on        = [module.iam]
}
