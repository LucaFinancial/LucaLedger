resource "google_service_account" "cloudrun_sa" {
  project      = var.project_id
  account_id   = "cloudrun-sa"
  display_name = "Cloud Run Service Account"
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = var.region
  service  = var.service_name
  role     = "roles/run.invoker"
  member   = "allUsers"
}