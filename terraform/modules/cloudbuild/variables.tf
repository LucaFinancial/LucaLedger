variable "project_id" {
  description = "GCP project ID where the trigger is created"
  type        = string
}

variable "region" {
  description = "GCP region of the repository connection (e.g., us-central1)"
  type        = string
}

variable "host_connection" {
  description = "Name of the host connection (e.g., luca-ledger-dev-gh-connection)"
  type        = string
}

variable "repo_name" {
  description = "Name of the GitHub repository (e.g., LucaFinancial-LucaLedger)"
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
