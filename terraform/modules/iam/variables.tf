variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The region"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "The name of the Cloud Storage bucket for the static site"
  type        = string
}

variable "service_name" {
  description = ""
  type        = string
}