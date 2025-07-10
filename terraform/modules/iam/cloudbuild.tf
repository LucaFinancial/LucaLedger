resource "google_service_account" "cloudbuild_sa" {
  project      = var.project_id
  account_id   = "cloudbuild-sa"
  display_name = "Cloud Build Service Account"
}

resource "google_project_iam_member" "cloudbuild_sa_iam_user" {
  project = var.project_id
  role   = "roles/iam.serviceAccountUser"
  member = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_storage_bucket_iam_member" "cloudbuild_sa_object_admin" {
  bucket  = var.bucket_name
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_sa_builder" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_sa_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_cloud_run_deployer" {
  project = "luca-ledger-dev"
  role    = "roles/run.developer"
  member  = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_artifact_registry_writer" {
  project = "luca-ledger-dev"
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:cloudbuild-sa@${var.project_id}.iam.gserviceaccount.com"
}
