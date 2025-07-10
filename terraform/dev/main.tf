terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.46.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "storage" {
  source       = "../modules/storage"
  project_id   = var.project_id
  bucket_name  = var.bucket_name
  region       = var.region
}

module "iam" {
  source       = "../modules/iam"
  project_id   = var.project_id
  bucket_name  = var.bucket_name
  depends_on   = [module.storage]
}

module "cloudbuild" {
  source          = "../modules/cloudbuild"
  env             = var.env
  project_id      = var.project_id
  region          = var.region
  bucket_name     = var.bucket_name
  branch_pattern  = ".*"
  depends_on      = [module.iam]
}

module "load_balancer" {
  source      = "../modules/load-balancer"
  name        = "${var.env}-luca-ledger"
  bucket_name = var.bucket_name
  ssl_domains = var.ssl_domains
  depends_on  = [module.storage]
}

module "artifact_registry_containers" {
  source        = "../modules/artifact-registry"
  location      = "us-central1"
  repository_id = "containers"
  description   = "Docker repo for Luca Ledger"
  format        = "DOCKER"
  project       = var.project_id
}