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
  project = "luca-ledger-dev"
  region  = "us-central1"
}

module "storage" {
  source          = "../modules/storage"

  project_id      = "luca-ledger-dev"
  bucket_name     = "www-jwaspin-com"
  region          = "us-central1"
}

module "iam" {
  source          = "../modules/iam"

  project_id      = "luca-ledger-dev"
  bucket_name     = "www-jwaspin-com"

  depends_on      = [module.storage]
}

module "cloudbuild" {
  source            = "../modules/cloudbuild"

  env               = "dev"
  project_id        = "luca-ledger-dev"
  region            = "us-central1"
  host_connection   = "luca-ledger-dev-gh-connection"
  repo_name         = "LucaFinancial-LucaLedger"
  bucket_name       = "www-jwaspin-com"
  branch_pattern    = ".*"

  depends_on        = [module.iam]
}
