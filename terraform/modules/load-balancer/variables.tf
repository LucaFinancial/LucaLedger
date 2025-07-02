variable "name" {
  description = "A unique name prefix for all resources"
  type        = string
}

variable "bucket_name" {
  description = "The name of the GCS bucket to serve content from"
  type        = string
}

variable "ssl_domains" {
  description = "A list of domains for the managed SSL certificate"
  type        = list(string)
}