resource "google_cloudbuild_trigger" "luca_ledger_webapp_dev" {
  name        = "luca-ledger-webapp-dev-trigger"
  description = "Trigger for deploying the Luca Ledger web app to GCS (dev)"
  project     = var.project_id

  repository_event_config {
    repository = "projects/${var.project_id}/locations/${var.region}/connections/${var.host_connection}/repositories/${var.repo_name}"
    push {
      branch = var.branch_pattern
    }
  }

  filename = "cloudbuild.yml"
  included_files = [
    "src/**",
    "package.json",
    "vite.config.*",
    "yarn.lock"
  ]

  substitutions = {
    _BUCKET_NAME = var.bucket_name
  }

  service_account = var.cloudbuild_service_account_email

  tags = ["webapp", "dev"]
}