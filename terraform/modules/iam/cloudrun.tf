resource "google_service_account" "cloudrun_sa" {
  project      = var.project_id
  account_id   = "cloudrun-sa"
  display_name = "Cloud Run Service Account"
}
