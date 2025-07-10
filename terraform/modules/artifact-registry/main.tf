resource "google_artifact_registry_repository" "luca_ledger_container_registry" {
  location      = var.location
  repository_id = var.repository_id
  description   = var.description
  format        = var.format
}