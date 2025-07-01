resource "google_storage_bucket" "luca_ledger_web_app_bucket" {
  project                     = var.project_id
  name                        = var.bucket_name
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_binding" "public_access" {
  bucket = google_storage_bucket.luca_ledger_web_app_bucket.name

  role = "roles/storage.objectViewer"

  members = [ "allUsers" ]
}