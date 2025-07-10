variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  description = "GCP region"
}

variable "bucket_name" {
  type        = string
  description = "Name of the GCS bucket"
}

variable "env" {
  type        = string
  description = "Environment name, e.g., dev or prod"
}

variable "ssl_domains" {
  type        = list(string)
  description = "List of domains for SSL cert"
}

variable "service_name" {
  type        = string
  description = ""
}