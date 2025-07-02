variable "project_id" {
  description = "GCP project ID where the trigger is created"
  type        = string
}

variable "region" {
  description = "GCP region of the repository connection (e.g., us-central1)"
  type        = string
}

variable "branch_pattern" {
  description = "Branch regex pattern to match push events (e.g., '.*' for dev, '^main$' for prod)"
  type        = string
}

variable "bucket_name" {
  description = "Name of the GCS bucket to deploy the app to"
  type        = string
}

variable "env" {
  description = "The environment the resources are being deployed to"
  type        = string
}