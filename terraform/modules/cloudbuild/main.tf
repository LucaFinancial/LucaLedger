resource "google_cloudbuild_trigger" "luca_ledger_webapp_dev" {
  name        = "luca-ledger-webapp-dev-trigger"
  description = "Trigger for deploying the Luca Ledger web app to GCS (dev)"
  disabled    = false
  project     = var.project_id
  location    = var.region
  
  included_files = [
    "src/**",
    "package.json",
    "vite.config.*",
    "yarn.lock",
    "cloudbuild.yml"
  ]

  github {
    owner = "LucaFinancial"
    name  = "LucaLedger"
    push {
      branch = var.branch_pattern
    }
  }

  substitutions = {
    _BUCKET_NAME = var.bucket_name
  }

  filename = "cloudbuild.yml"
  
  service_account = "projects/${var.project_id}/serviceAccounts/cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}