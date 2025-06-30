variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "bucket_name" {
  description = "The name of the Cloud Storage bucket for the static site"
  type        = string
}

variable "region" {
  description = "The region for the Cloud Storage bucket (e.g. US, EU, asia-east1)"
  type        = string
}