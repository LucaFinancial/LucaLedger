terraform {
  backend "gcs" {
    bucket = "lf-prod-tf-state"
    prefix = "tf-state/prod/luca-ledger"
  }
}